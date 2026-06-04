# UPNM Campus Marketplace XAMPP Backend

This folder contains the PHP + MySQL backend foundation for running the marketplace with XAMPP.

## Setup

1. Open XAMPP Control Panel.
2. Start `Apache` and `MySQL`.
3. Open phpMyAdmin:
   `http://localhost/phpmyadmin`
4. Create/import the database by running:
   `xampp-backend/schema.sql`
5. Copy the `xampp-backend/api` folder into:
   `C:\xampp\htdocs\upnm-marketplace-api`
6. Test the API in your browser:
   `http://localhost/upnm-marketplace-api/index.php?resource=health`

## Default Database Connection

The API uses:

- host: `localhost`
- database: `upnm_campus_marketplace`
- username: `root`
- password: empty

Change these in:

`api/config.php`

## Main API Resources

Use this base URL:

`http://localhost/upnm-marketplace-api/index.php`

Examples:

- `?resource=health`
- `?resource=login`
- `?resource=register`
- `?resource=products`
- `?resource=orders`
- `?resource=chats`

The current Vue frontend still uses local browser storage. This backend is ready for the next step: replacing localStorage calls in `src/database/*` with API calls.
