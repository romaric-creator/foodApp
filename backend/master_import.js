const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function masterImport() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root1234',
        database: 'foodapp'
    });

    try {
        const baseDir = path.join(__dirname, '../');

        console.log('🧹 Nettoyage des tables existantes...');
        await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
        await connection.execute('TRUNCATE TABLE order_items');
        await connection.execute('TRUNCATE TABLE orders');
        await connection.execute('TRUNCATE TABLE menus');
        await connection.execute('TRUNCATE TABLE categories');
        await connection.execute('TRUNCATE TABLE tables');
        await connection.execute('TRUNCATE TABLE users');
        await connection.execute('SET FOREIGN_KEY_CHECKS = 1');

        // 1. IMPORT CATEGORIES
        console.log('📁 Importation des catégories...');
        const categoriesData = JSON.parse(fs.readFileSync(path.join(baseDir, 'categories.json'), 'utf8'));
        const catMap = {}; 
        for (const cat of categoriesData) {
            const [result] = await connection.execute('INSERT INTO categories (name) VALUES (?)', [cat.name]);
            catMap[cat.id] = result.insertId;
        }

        // 2. IMPORT USERS
        console.log('👤 Importation des utilisateurs...');
        const usersData = JSON.parse(fs.readFileSync(path.join(baseDir, 'users.json'), 'utf8'));
        const userMap = {}; 
        const usedUsernames = new Set();
        for (const user of usersData) {
            let baseUsername = (user.name || user.email.split('@')[0]).replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            let username = baseUsername || 'user';
            let counter = 1;
            while (usedUsernames.has(username)) {
                username = `${baseUsername}${counter}`;
                counter++;
            }
            usedUsernames.add(username);
            try {
                const [result] = await connection.execute(
                    'INSERT INTO users (username, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
                    [username, user.name || 'Sans nom', user.email, user.password || 'password123', user.role || 'client']
                );
                userMap[user.id] = result.insertId;
                userMap[user.email] = result.insertId;
            } catch (err) { /* ignore */ }
        }
        
        // 3. IMPORT MENUS
        console.log('🍴 Importation du menu...');
        const menusData = JSON.parse(fs.readFileSync(path.join(baseDir, 'menus.json'), 'utf8'));
        const menuMap = {}; 
        for (const menu of menusData) {
            const mysqlCatId = catMap[menu.idCat] || null;
            let price = parseFloat(menu.price) || 0;
            if (price > 9999999) price = 9999999;
            const [result] = await connection.execute(
                'INSERT INTO menus (name, description, price, image_url, idCat) VALUES (?, ?, ?, ?, ?)',
                [menu.name || 'Plat sans nom', menu.description || '', price, menu.image_url || '', mysqlCatId]
            );
            menuMap[menu.id] = result.insertId;
        }

        // 4. IMPORT TABLES
        console.log('🪑 Importation des tables...');
        const tablesData = JSON.parse(fs.readFileSync(path.join(baseDir, 'tables.json'), 'utf8'));
        const tableMap = {}; 
        for (const table of tablesData) {
            const [result] = await connection.execute('INSERT INTO tables (nom) VALUES (?)', [table.nom]);
            tableMap[table.id] = result.insertId;
            tableMap[table.nom] = result.insertId;
        }

        // 5. IMPORT ORDERS & ORDER_ITEMS
        console.log('🧾 Importation des commandes...');
        const ordersData = JSON.parse(fs.readFileSync(path.join(baseDir, 'orders.json'), 'utf8'));
        for (const order of ordersData) {
            const mysqlUserId = userMap[order.idUsers] || null;
            const mysqlTableId = tableMap[order.idTab] || tableMap[order.tableName] || null;
            const createdAt = order.timestamp ? new Date(order.timestamp) : new Date();

            const [orderRes] = await connection.execute(
                'INSERT INTO orders (idUsers, idTab, total, statut, timestamp) VALUES (?, ?, ?, ?, ?)',
                [mysqlUserId, mysqlTableId, 0, order.statut || 'en cours', createdAt]
            );
            const orderId = orderRes.insertId;

            let totalOrderPrice = 0;
            if (order.items && Array.isArray(order.items)) {
                for (const item of order.items) {
                    const mysqlMenuId = menuMap[item.idMenu];
                    if (!mysqlMenuId) continue;
                    let itemPrice = parseFloat(item.price) || 0;
                    if (itemPrice > 9999999) itemPrice = 9999999;
                    const itemQty = parseInt(item.quantite) || 1;
                    totalOrderPrice += itemPrice * itemQty;
                    await connection.execute(
                        'INSERT INTO order_items (idOrder, idMenu, quantity, price) VALUES (?, ?, ?, ?)',
                        [orderId, mysqlMenuId, itemQty, itemPrice]
                    );
                }
            }
            await connection.execute('UPDATE orders SET total = ? WHERE idOrder = ?', [totalOrderPrice, orderId]);
        }

        console.log('✨ Importation MASSIVE terminée avec succès !');

    } catch (error) {
        console.error('❌ ERREUR CRITIQUE:', error);
    } finally {
        await connection.end();
    }
}

masterImport();
