CREATE DATABASE IF NOT EXISTS upnm_campus_marketplace
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE upnm_campus_marketplace;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  phone VARCHAR(50) DEFAULT '',
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('buyer', 'seller', 'admin') NOT NULL,
  avatar LONGTEXT,
  payment_qr LONGTEXT,
  recovery_code VARCHAR(50) DEFAULT '',
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  seller_id INT NOT NULL,
  vendor VARCHAR(150) NOT NULL,
  category VARCHAR(80) NOT NULL,
  name VARCHAR(180) NOT NULL,
  image LONGTEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  stock INT DEFAULT NULL,
  description TEXT NOT NULL,
  variations LONGTEXT,
  addons LONGTEXT,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_seller FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  buyer_id INT NOT NULL,
  product_id INT DEFAULT NULL,
  product_name VARCHAR(180) NOT NULL,
  vendor VARCHAR(150) NOT NULL,
  image LONGTEXT,
  quantity INT NOT NULL DEFAULT 1,
  total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  selected_variation VARCHAR(180) DEFAULT '',
  selected_addons LONGTEXT,
  receipt LONGTEXT,
  receipt_file_name VARCHAR(255) DEFAULT '',
  status VARCHAR(40) NOT NULL DEFAULT 'In Progress',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_buyer FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_orders_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  conversation_id VARCHAR(255) NOT NULL,
  product_id INT DEFAULT NULL,
  product_name VARCHAR(180) NOT NULL,
  buyer_id INT NOT NULL,
  buyer_name VARCHAR(150) NOT NULL,
  seller_name VARCHAR(150) NOT NULL,
  sender_role ENUM('buyer', 'seller') NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_conversation_id (conversation_id),
  CONSTRAINT fk_chat_buyer FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_chat_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

INSERT INTO users (name, email, phone, password_hash, role, recovery_code, active)
SELECT 'Aiman Buyer', 'buyer@upnm.test', '', '123456', 'buyer', 'BUYER-2026', 1
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'buyer@upnm.test');

INSERT INTO users (name, email, phone, password_hash, role, recovery_code, active)
SELECT 'Campus Kitchen', 'seller@upnm.test', '', '123456', 'seller', 'SELLER-2026', 1
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'seller@upnm.test');

INSERT INTO users (name, email, phone, password_hash, role, recovery_code, active)
SELECT 'Admin User', 'admin@upnm.test', '', '123456', 'admin', 'ADMIN-2026', 1
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@upnm.test');
