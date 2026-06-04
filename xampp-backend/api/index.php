<?php
// Purpose: Single PHP API entrypoint for XAMPP. It exposes auth, products, orders, and chats as JSON endpoints.

declare(strict_types=1);

require_once __DIR__ . '/config.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

function body(): array
{
    $raw = file_get_contents('php://input');
    if (!$raw) {
        return $_POST ?: [];
    }

    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function ok(array $data = []): void
{
    echo json_encode(['ok' => true, ...$data], JSON_UNESCAPED_SLASHES);
    exit;
}

function fail(string $message, int $status = 400): void
{
    http_response_code($status);
    echo json_encode(['ok' => false, 'message' => $message], JSON_UNESCAPED_SLASHES);
    exit;
}

function required(array $data, array $keys): void
{
    foreach ($keys as $key) {
        if (!isset($data[$key]) || trim((string) $data[$key]) === '') {
            fail("Missing field: {$key}");
        }
    }
}

function publicUser(array $user): array
{
    unset($user['password_hash']);
    $user['active'] = (bool) $user['active'];
    return $user;
}

function jsonText(mixed $value): string
{
    if ($value === null || $value === '') {
        return '[]';
    }

    return json_encode($value, JSON_UNESCAPED_SLASHES);
}

$resource = $_GET['resource'] ?? 'health';
$method = $_SERVER['REQUEST_METHOD'];
$data = body();

try {
    if ($resource === 'health') {
        ok(['message' => 'UPNM Campus Marketplace API is running.']);
    }

    if ($resource === 'register' && $method === 'POST') {
        required($data, ['name', 'email', 'password', 'role']);

        $stmt = db()->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
        $stmt->execute([strtolower($data['email'])]);
        if ($stmt->fetch()) {
            fail('Account already exists.');
        }

        $recoveryCode = strtoupper('UPNM-' . substr(bin2hex(random_bytes(4)), 0, 4) . '-' . substr(bin2hex(random_bytes(4)), 0, 4));
        $stmt = db()->prepare(
            'INSERT INTO users (name, email, phone, password_hash, role, recovery_code, active)
             VALUES (?, ?, ?, ?, ?, ?, 1)'
        );
        $stmt->execute([
            trim($data['name']),
            strtolower(trim($data['email'])),
            trim($data['phone'] ?? ''),
            password_hash((string) $data['password'], PASSWORD_DEFAULT),
            $data['role'],
            $recoveryCode,
        ]);

        $user = db()->query('SELECT * FROM users WHERE id = ' . (int) db()->lastInsertId())->fetch();
        ok(['user' => publicUser($user)]);
    }

    if ($resource === 'login' && $method === 'POST') {
        required($data, ['email', 'password', 'role']);

        $stmt = db()->prepare('SELECT * FROM users WHERE email = ? AND role = ? LIMIT 1');
        $stmt->execute([strtolower($data['email']), $data['role']]);
        $user = $stmt->fetch();

        $plainSeedPasswordOk = $user && hash_equals((string) $user['password_hash'], (string) $data['password']);
        $passwordOk = $user && (password_verify((string) $data['password'], (string) $user['password_hash']) || $plainSeedPasswordOk);

        if (!$passwordOk) {
            fail('Invalid email, password, or role.', 401);
        }

        if (!(bool) $user['active']) {
            fail('This account has been suspended by admin.', 403);
        }

        ok(['user' => publicUser($user)]);
    }

    if ($resource === 'users') {
        if ($method === 'GET') {
            $users = db()->query('SELECT * FROM users ORDER BY created_at DESC')->fetchAll();
            ok(['users' => array_map('publicUser', $users)]);
        }

        if ($method === 'PUT') {
            required($data, ['id']);
            $stmt = db()->prepare(
                'UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), email = COALESCE(?, email),
                 avatar = COALESCE(?, avatar), payment_qr = COALESCE(?, payment_qr), active = COALESCE(?, active)
                 WHERE id = ?'
            );
            $stmt->execute([
                $data['name'] ?? null,
                $data['phone'] ?? null,
                isset($data['email']) ? strtolower($data['email']) : null,
                $data['avatar'] ?? null,
                $data['payment_qr'] ?? null,
                $data['active'] ?? null,
                $data['id'],
            ]);
            ok();
        }
    }

    if ($resource === 'products') {
        if ($method === 'GET') {
            $stmt = db()->query('SELECT * FROM products ORDER BY created_at DESC');
            ok(['products' => $stmt->fetchAll()]);
        }

        if ($method === 'POST') {
            required($data, ['seller_id', 'vendor', 'category', 'name', 'image', 'description']);
            $stmt = db()->prepare(
                'INSERT INTO products (seller_id, vendor, category, name, image, price, stock, description, variations, addons, active)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)'
            );
            $stmt->execute([
                $data['seller_id'],
                $data['vendor'],
                $data['category'],
                $data['name'],
                $data['image'],
                $data['price'] ?? 0,
                $data['stock'] ?? null,
                $data['description'],
                jsonText($data['variations'] ?? []),
                jsonText($data['addons'] ?? []),
            ]);
            ok(['id' => (int) db()->lastInsertId()]);
        }

        if ($method === 'PUT') {
            required($data, ['id']);
            $stmt = db()->prepare(
                'UPDATE products SET category = ?, name = ?, image = ?, price = ?, stock = ?, description = ?,
                 variations = ?, addons = ?, active = ? WHERE id = ?'
            );
            $stmt->execute([
                $data['category'],
                $data['name'],
                $data['image'],
                $data['price'] ?? 0,
                $data['stock'] ?? null,
                $data['description'],
                jsonText($data['variations'] ?? []),
                jsonText($data['addons'] ?? []),
                $data['active'] ?? 1,
                $data['id'],
            ]);
            ok();
        }

        if ($method === 'DELETE') {
            required($data, ['id']);
            $stmt = db()->prepare('DELETE FROM products WHERE id = ?');
            $stmt->execute([$data['id']]);
            ok();
        }
    }

    if ($resource === 'orders') {
        if ($method === 'GET') {
            $where = '';
            $params = [];
            if (isset($_GET['buyer_id'])) {
                $where = 'WHERE buyer_id = ?';
                $params[] = $_GET['buyer_id'];
            } elseif (isset($_GET['vendor'])) {
                $where = 'WHERE vendor = ?';
                $params[] = $_GET['vendor'];
            }

            $stmt = db()->prepare("SELECT * FROM orders {$where} ORDER BY created_at DESC");
            $stmt->execute($params);
            ok(['orders' => $stmt->fetchAll()]);
        }

        if ($method === 'POST') {
            required($data, ['buyer_id', 'product_name', 'vendor', 'quantity', 'total']);
            $stmt = db()->prepare(
                'INSERT INTO orders (buyer_id, product_id, product_name, vendor, image, quantity, total,
                 selected_variation, selected_addons, receipt, receipt_file_name, status)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
            );
            $stmt->execute([
                $data['buyer_id'],
                $data['product_id'] ?? null,
                $data['product_name'],
                $data['vendor'],
                $data['image'] ?? '',
                $data['quantity'],
                $data['total'],
                $data['selected_variation'] ?? '',
                jsonText($data['selected_addons'] ?? []),
                $data['receipt'] ?? '',
                $data['receipt_file_name'] ?? '',
                $data['status'] ?? 'In Progress',
            ]);
            ok(['id' => (int) db()->lastInsertId()]);
        }

        if ($method === 'PUT') {
            required($data, ['id', 'status']);
            $stmt = db()->prepare('UPDATE orders SET status = ? WHERE id = ?');
            $stmt->execute([$data['status'], $data['id']]);
            ok();
        }
    }

    if ($resource === 'chats') {
        if ($method === 'GET') {
            $stmt = db()->query('SELECT * FROM chat_messages ORDER BY created_at ASC');
            ok(['messages' => $stmt->fetchAll()]);
        }

        if ($method === 'POST') {
            required($data, ['conversation_id', 'product_name', 'buyer_id', 'buyer_name', 'seller_name', 'sender_role', 'message']);
            $stmt = db()->prepare(
                'INSERT INTO chat_messages (conversation_id, product_id, product_name, buyer_id, buyer_name, seller_name, sender_role, message)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
            );
            $stmt->execute([
                $data['conversation_id'],
                $data['product_id'] ?? null,
                $data['product_name'],
                $data['buyer_id'],
                $data['buyer_name'],
                $data['seller_name'],
                $data['sender_role'],
                $data['message'],
            ]);
            ok(['id' => (int) db()->lastInsertId()]);
        }
    }

    fail('Unknown resource or method.', 404);
} catch (Throwable $error) {
    fail($error->getMessage(), 500);
}
