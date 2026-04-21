const pool = require('../../../shared/config/database.js');
const { searchImages } = require('../services/imageSearchService.js');

async function seedData() {
  console.log('🚀 DÉMARRAGE DU SEEDING GOURMET + IMAGES (2 Ans)...');

  try {
    // 1. Nettoyage
    console.log('🧹 Nettoyage des anciennes données...');
    await pool.execute("DELETE FROM order_items");
    await pool.execute("DELETE FROM orders");
    await pool.execute("DELETE FROM menus");
    await pool.execute("DELETE FROM categories");
    await pool.execute("ALTER TABLE categories AUTO_INCREMENT = 1");
    await pool.execute("ALTER TABLE menus AUTO_INCREMENT = 1");
    await pool.execute("ALTER TABLE orders AUTO_INCREMENT = 1");

    // 2. Catégories
    await pool.execute("INSERT INTO categories (name) VALUES ('Entrées'), ('Plats Traditionnels'), ('Grillades'), ('Accompagnements'), ('Boissons'), ('Desserts')");
    const [cats] = await pool.execute('SELECT idCat, name FROM categories');
    const getCatId = (name) => cats.find(c => c.name === name).idCat;

    // 3. Menus Gastronomiques avec Recherche d'Images
    console.log('🍱 Création du menu Gastronomique et recherche d\'images réelles...');
    const menuItems = [
      ['Soya Brochettes', 'Viande de bœuf épicée grillée camerounaise', 2500, getCatId('Entrées')],
      ['Accras de Macabo', 'Boulettes de macabo frites', 1500, getCatId('Entrées')],
      ['Ndolé Royal', 'Le roi des plats camerounais aux crevettes', 5500, getCatId('Plats Traditionnels')],
      ['Eru & Waterleaf', 'Plat de légumes camerounais avec viande fumée', 4500, getCatId('Plats Traditionnels')],
      ['Achu Sauce Jaune', 'Taro pilé avec sauce jaune traditionnelle', 6000, getCatId('Plats Traditionnels')],
      ['Poulet DG', 'Le plat du directeur général (plantains frits)', 5000, getCatId('Plats Traditionnels')],
      ['Poisson Braisé Bar', 'Bar frais grillé au feu de bois', 7500, getCatId('Grillades')],
      ['Gambas Grillées', 'Grosses crevettes géantes épicées', 9500, getCatId('Grillades')],
      ['Miondo', 'Bâton de manioc fin traditionnel', 500, getCatId('Accompagnements')],
      ['Plantain Frit', 'Tranches de plantains mûrs frits', 1000, getCatId('Accompagnements')],
      ['Soda Top Orange', 'Boisson gazeuse rafraîchissante', 600, getCatId('Boissons')],
      ['Bière Beaufort Lager', 'Bière premium fraîche', 1000, getCatId('Boissons')],
      ['Jus de Bissap Hibiscus', 'Boisson traditionnelle à l\'hibiscus', 1500, getCatId('Boissons')],
      ['Eau Minérale 1.5L', 'Eau de source purifiée', 500, getCatId('Boissons')],
      ['Salade Fruits Exotiques', 'Mélange de fruits tropicaux frais', 2000, getCatId('Desserts')],
      ['Gâteau à l\'Ananas', 'Spécialité pâtissière maison', 2500, getCatId('Desserts')]
    ];

    for (const item of menuItems) {
      console.log(`🔍 Recherche d'image pour : ${item[0]}...`);
      const images = await searchImages(item[0], item[0]);
      const imageUrl = images[0] || "https://images.unsplash.com/photo-1546241072-48010ad28c2c";
      
      await pool.execute("INSERT INTO menus (name, description, price, image_url, stock_quantity, idCat) VALUES (?, ?, ?, ?, 200, ?)", 
        [item[0], item[1], item[2], imageUrl, item[3]]);
    }
    
    const [menus] = await pool.execute('SELECT idMenu, price FROM menus');

    // 4. Utilisateurs (si besoin)
    const [userRows] = await pool.execute('SELECT idUsers FROM users WHERE role = "client"');
    let userIds = userRows.map(u => u.idUsers);
    if (userIds.length < 20) {
      for (let i = 0; i < 30; i++) {
        const [res] = await pool.execute("INSERT INTO users (name, username, email, password, role) VALUES (?, ?, ?, 'password', 'client')", 
          [`Chef ${i}`, `user_${Date.now()}_${i}`, `client${i}@gourmi.cm`]);
        userIds.push(res.insertId);
      }
    }

    // 5. Générer 2 ans d'historique
    console.log('📊 Génération de 2 ans d\'activité (Ventes Réalistes)...');
    const now = new Date();
    let totalOrders = 0;

    for (let d = 730; d >= 0; d--) {
        const date = new Date();
        date.setDate(now.getDate() - d);
        const isWeekend = (date.getUTCDay() === 0 || date.getUTCDay() === 6);
        const orderCount = isWeekend ? (Math.floor(Math.random() * 18) + 10) : (Math.floor(Math.random() * 8) + 3);

        for (let j = 0; j < orderCount; j++) {
            const userId = userIds[Math.floor(Math.random() * userIds.length)];
            const timestamp = new Date(date);
            timestamp.setHours(Math.floor(Math.random() * 12) + 11);

            const [orderRes] = await pool.execute("INSERT INTO orders (idUsers, total, statut, created_at) VALUES (?, 0, 'completed', ?)", [userId, timestamp]);
            const orderId = orderRes.insertId;

            const itemCount = Math.floor(Math.random() * 2) + 2; 
            let orderTotal = 0;
            for (let k = 0; k < itemCount; k++) {
                const item = menus[Math.floor(Math.random() * menus.length)];
                const qty = (item.price < 1000) ? (Math.floor(Math.random() * 2) + 1) : 1;
                await pool.execute("INSERT INTO order_items (idOrder, idMenu, quantity, price) VALUES (?, ?, ?, ?)", [orderId, item.idMenu, qty, item.price]);
                orderTotal += (item.price * qty);
            }
            await pool.execute("UPDATE orders SET total = ? WHERE idOrder = ?", [orderTotal, orderId]);
            totalOrders++;
        }
        if (d % 150 === 0) console.log(`⏳ Remplissage : Jour ${730 - d}/730...`);
    }

    console.log(`\n✨ SEEDING RÉUSSI ✨`);
    console.log(`- 16 Plats avec images réelles insérés`);
    console.log(`- ${totalOrders} Commandes générées`);
    process.exit(0);

  } catch (error) {
    console.error('❌ ERREUR:', error);
    process.exit(1);
  }
}

seedData();
