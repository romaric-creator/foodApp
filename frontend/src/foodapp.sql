-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
<<<<<<< HEAD
-- Généré le : mer. 12 mars 2025 à 18:43
=======
-- Généré le : mer. 19 mars 2025 à 12:08
>>>>>>> c3b8893 (Nettoyage MenuList.js : notifications globales, suppression Snackbar local, imports propres)
-- Version du serveur :  10.4.11-MariaDB
-- Version de PHP : 7.4.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `foodapp`
--

-- --------------------------------------------------------

--
-- Structure de la table `categories`
--

CREATE TABLE `categories` (
<<<<<<< HEAD
  `idCat` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`idCat`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Déchargement des données de la table `categories`
--

INSERT INTO `categories` (`idCat`, `name`, `created_at`) VALUES
(1, 'Desserts', '2025-03-12 11:19:22'),
(2, 'Plats Principaux', '2025-03-12 11:33:18'),
(3, 'Boissons', '2025-03-12 15:57:20'),
(4, 'Entrées', '2025-03-12 11:45:00');
=======
  `idCat` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Tronquer la table avant d'insérer `categories`
--

TRUNCATE TABLE `categories`;
--
-- Déchargement des données de la table `categories`
>>>>>>> c3b8893 (Nettoyage MenuList.js : notifications globales, suppression Snackbar local, imports propres)

-- --------------------------------------------------------

--
-- Structure de la table `menus`
--

CREATE TABLE `menus` (
<<<<<<< HEAD
  `idMenu` int(11) NOT NULL AUTO_INCREMENT,
=======
  `idMenu` int(11) NOT NULL,
>>>>>>> c3b8893 (Nettoyage MenuList.js : notifications globales, suppression Snackbar local, imports propres)
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `idCat` int(11) DEFAULT NULL,
<<<<<<< HEAD
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`idMenu`),
  KEY `idCat` (`idCat`),
  CONSTRAINT `menus_ibfk_1` FOREIGN KEY (`idCat`) REFERENCES `categories` (`idCat`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Déchargement des données de la table `menus`
--

INSERT INTO `menus` (`idMenu`, `name`, `description`, `price`, `image_url`, `idCat`, `created_at`) VALUES
(1, 'Gâteau au Chocolat', 'Un délicieux gâteau au chocolat.', '20.00', 'https://www.lesrecettesdecaty.com/wp-content/uploads/2018/01/gateau-au-chocolat.jpg', 1, '2025-03-12 16:58:22'),
(2, 'Tarte aux Pommes', 'Tarte sucrée garnie de pommes.', '15.00', 'https://www.calameo.com/books/0069796316fcc67d229ce/resource/1', 1, '2025-03-12 16:58:57'),
(3, 'Burger', 'Burger juteux avec fromage et légumes.', '15.00', 'https://www.tastingtable.com/img/gallery/what-makes-restaurant-burgers-taste-different-from-homemade-burgers/intro-1652802870.jpg', 2, '2025-03-12 16:59:12'),
(4, 'Pâtes Carbonara', 'Pâtes crémeuses au bacon.', '12.00', 'https://fatsecretfrance.fr/wp-content/uploads/2018/06/pates-a-la-carbonara.jpg', 2, '2025-03-12 16:59:45'),
(5, 'Salade César', 'Salade fraîche avec poulet grillé.', '10.00', 'https://www.marecette.ch/wp-content/uploads/2019/05/salade-cesar.jpg', 2, '2025-03-12 17:00:00'),
(6, 'Coca-Cola', 'Boisson gazeuse rafraîchissante.', '2.00', 'https://i5.walmartimages.com/asr/1a5f3d4b-4c3b-4c8c-8c1f-2a7a5e6e1f5b_1.8b8d8b5e6e1f5b.jpg', 3, '2025-03-12 17:00:30'),
(7, 'Eau Minérale', 'Eau pure et rafraîchissante.', '1.50', 'https://sante.journaldesfemmes.fr/fiches-sante-du-quotidien/2102661-eau-minerale-definition-composition/', 3, '2025-03-12 17:01:00'),
(8, 'Soupe à lOignon', 'Soupe française traditionnelle.', '8.00', 'https://www.lesrecettesdecaty.com/wp-content/uploads/2018/01/soupe-a-loignon-gratinee.jpg', 4, '2025-03-12 17:01:30'),
(9, 'Salade Niçoise', 'Salade méditerranéenne avec thon.', '9.00', 'https://www.thekitchn.com/wp-content/uploads/2020/02/Recipe-Salad-Nicoise-LEAD-190232-1.jpg', 4, '2025-03-12 17:02:00'),
(10, 'Tiramisu', 'Dessert italien au café et mascarpone.', '6.00', 'https://www.masala.com/wp-content/uploads/2020/01/tiramisu-recipe.jpg', 1, '2025-03-12 17:02:30');

=======
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Tronquer la table avant d'insérer `menus`
--

TRUNCATE TABLE `menus`;
--
-- Déchargement des données de la table `menus`
--
>>>>>>> c3b8893 (Nettoyage MenuList.js : notifications globales, suppression Snackbar local, imports propres)
-- --------------------------------------------------------

--
-- Structure de la table `orders`
--

CREATE TABLE `orders` (
<<<<<<< HEAD
  `idOrder` int(11) NOT NULL AUTO_INCREMENT,
=======
  `idOrder` int(11) NOT NULL,
>>>>>>> c3b8893 (Nettoyage MenuList.js : notifications globales, suppression Snackbar local, imports propres)
  `idUsers` int(11) NOT NULL,
  `idTab` int(11) NOT NULL,
  `status` enum('pending','confirmed','served','canceled') DEFAULT 'pending',
  `total` decimal(10,2) NOT NULL,
<<<<<<< HEAD
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`idOrder`),
  KEY `idUsers` (`idUsers`),
  KEY `idTab` (`idTab`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`idUsers`) REFERENCES `users` (`idUsers`) ON DELETE CASCADE,
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`idTab`) REFERENCES `tables` (`idTab`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Déchargement des données de la table `orders`
--

INSERT INTO `orders` (`idOrder`, `idUsers`, `idTab`, `status`, `total`, `created_at`) VALUES
(1, 1, 1, 'served', '37.00', '2025-03-12 16:59:12'),
(2, 1, 1, 'pending', '45.00', '2025-03-12 17:15:00');

=======
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Tronquer la table avant d'insérer `orders`
--

TRUNCATE TABLE `orders`;
--
-- Déchargement des données de la table `orders`
--
>>>>>>> c3b8893 (Nettoyage MenuList.js : notifications globales, suppression Snackbar local, imports propres)
-- --------------------------------------------------------

--
-- Structure de la table `order_items`
--

CREATE TABLE `order_items` (
<<<<<<< HEAD
  `idOrderItem` int(11) NOT NULL AUTO_INCREMENT,
  `idOrder` int(11) NOT NULL,
  `idMenu` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`idOrderItem`),
  KEY `idOrder` (`idOrder`),
  KEY `idMenu` (`idMenu`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`idOrder`) REFERENCES `orders` (`idOrder`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`idMenu`) REFERENCES `menus` (`idMenu`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Déchargement des données de la table `order_items`
--

INSERT INTO `order_items` (`idOrderItem`, `idOrder`, `idMenu`, `quantity`, `price`) VALUES
(1, 1, 1, 1, '20.00'),
(2, 1, 2, 1, '15.00'),
(3, 1, 3, 1, '15.00'),
(4, 2, 4, 1, '12.00'),
(5, 2, 6, 1, '2.00');

=======
  `idOrderItem` int(11) NOT NULL,
  `idOrder` int(11) NOT NULL,
  `idMenu` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Tronquer la table avant d'insérer `order_items`
--

TRUNCATE TABLE `order_items`;
>>>>>>> c3b8893 (Nettoyage MenuList.js : notifications globales, suppression Snackbar local, imports propres)
-- --------------------------------------------------------

--
-- Structure de la table `tables`
--

CREATE TABLE `tables` (
<<<<<<< HEAD
  `idTab` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) NOT NULL,
  PRIMARY KEY (`idTab`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Déchargement des données de la table `tables`
--

INSERT INTO `tables` (`idTab`, `nom`) VALUES
(1, 'Table 1'),
(2, 'Table 2'),
(3, 'Table 3');

=======
  `idTab` int(11) NOT NULL,
  `nom` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Tronquer la table avant d'insérer `tables`
--

TRUNCATE TABLE `tables`;
--
-- Déchargement des données de la table `tables`
--
>>>>>>> c3b8893 (Nettoyage MenuList.js : notifications globales, suppression Snackbar local, imports propres)
-- --------------------------------------------------------

--
-- Structure de la table `theme_settings`
--

CREATE TABLE `theme_settings` (
<<<<<<< HEAD
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `primary` varchar(7) NOT NULL,
  `secondary` varchar(7) NOT NULL,
  `background` varchar(7) NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

=======
  `id` int(11) NOT NULL,
  `primary` varchar(7) NOT NULL,
  `secondary` varchar(7) NOT NULL,
  `background` varchar(7) NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Tronquer la table avant d'insérer `theme_settings`
--

TRUNCATE TABLE `theme_settings`;
>>>>>>> c3b8893 (Nettoyage MenuList.js : notifications globales, suppression Snackbar local, imports propres)
--
-- Déchargement des données de la table `theme_settings`
--

<<<<<<< HEAD
INSERT INTO `theme_settings` (`id`, `primary`, `secondary`, `background`, `updated_at`) VALUES
(1, '#ec84aa', '#215aaa', '#9a65a4', '2025-03-12 17:29:59');
=======
INSERT INTO `theme_settings` (`id`, `primary`, `secondary`, `background`, `updated_at`) VALUES(1, '#098652', '#276f06', '#02554e', '2025-03-14 11:10:32');
>>>>>>> c3b8893 (Nettoyage MenuList.js : notifications globales, suppression Snackbar local, imports propres)

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
<<<<<<< HEAD
  `idUsers` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `telephone` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`idUsers`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`idUsers`, `username`, `telephone`, `created_at`) VALUES
(1, 'tenda', 678261699, '2025-03-11 12:00:58'),
(2, 'user2', 123456789, '2025-03-12 12:00:00');

-- --------------------------------------------------------

--
-- Structure de la table `user_actions`
--

CREATE TABLE `user_actions` (
  `idAction` int(11) NOT NULL AUTO_INCREMENT,
  `idUser` int(11) NOT NULL,
  `action` varchar(255) NOT NULL,
  `details` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`idAction`),
  KEY `idUser` (`idUser`),
  CONSTRAINT `user_actions_ibfk_1` FOREIGN KEY (`idUser`) REFERENCES `users` (`idUsers`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

=======
  `idUsers` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `telephone` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Tronquer la table avant d'insérer `users`
--

TRUNCATE TABLE `users`;
--
-- Déchargement des données de la table `users`
--
--
-- Index pour les tables déchargées
--

--
-- Index pour la table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`idCat`);

--
-- Index pour la table `menus`
--
ALTER TABLE `menus`
  ADD PRIMARY KEY (`idMenu`),
  ADD KEY `idCat` (`idCat`);

--
-- Index pour la table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`idOrder`),
  ADD KEY `idUsers` (`idUsers`),
  ADD KEY `idTab` (`idTab`);

--
-- Index pour la table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`idOrderItem`),
  ADD KEY `idOrder` (`idOrder`),
  ADD KEY `idMenu` (`idMenu`);

--
-- Index pour la table `tables`
--
ALTER TABLE `tables`
  ADD PRIMARY KEY (`idTab`);

--
-- Index pour la table `theme_settings`
--
ALTER TABLE `theme_settings`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`idUsers`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `categories`
--
ALTER TABLE `categories`
  MODIFY `idCat` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT pour la table `menus`
--
ALTER TABLE `menus`
  MODIFY `idMenu` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT pour la table `orders`
--
ALTER TABLE `orders`
  MODIFY `idOrder` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT pour la table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `idOrderItem` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT pour la table `tables`
--
ALTER TABLE `tables`
  MODIFY `idTab` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT pour la table `theme_settings`
--
ALTER TABLE `theme_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `idUsers` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `menus`
--
ALTER TABLE `menus`
  ADD CONSTRAINT `menus_ibfk_1` FOREIGN KEY (`idCat`) REFERENCES `categories` (`idCat`) ON DELETE SET NULL;

--
-- Contraintes pour la table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`idUsers`) REFERENCES `users` (`idUsers`) ON DELETE CASCADE,
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`idTab`) REFERENCES `tables` (`idTab`) ON DELETE CASCADE;

--
-- Contraintes pour la table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`idOrder`) REFERENCES `orders` (`idOrder`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`idMenu`) REFERENCES `menus` (`idMenu`) ON DELETE CASCADE;
>>>>>>> c3b8893 (Nettoyage MenuList.js : notifications globales, suppression Snackbar local, imports propres)
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
<<<<<<< HEAD
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
=======
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
>>>>>>> c3b8893 (Nettoyage MenuList.js : notifications globales, suppression Snackbar local, imports propres)
