-- Schéma de la base de données GOURMI

-- Création de la base de données si elle n'existe pas
CREATE DATABASE IF NOT EXISTS foodapp;
USE foodapp;

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
  idUsers INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  telephone VARCHAR(50),
  role ENUM('admin', 'client', 'kitchen') DEFAULT 'client',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des catégories
CREATE TABLE IF NOT EXISTS categories (
  idCat INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des menus
CREATE TABLE IF NOT EXISTS menus (
  idMenu INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url VARCHAR(255),
  idCat INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (idCat) REFERENCES categories(idCat) ON DELETE SET NULL
);

-- Table des tables
CREATE TABLE IF NOT EXISTS tables (
  idTab INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des commandes
CREATE TABLE IF NOT EXISTS orders (
  idOrder INT AUTO_INCREMENT PRIMARY KEY,
  idUsers INT,
  idTab INT,
  statut VARCHAR(50) DEFAULT 'en cours',
  total DECIMAL(10, 2) NOT NULL,
  timestamp DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (idUsers) REFERENCES users(idUsers) ON DELETE SET NULL,
  FOREIGN KEY (idTab) REFERENCES tables(idTab) ON DELETE SET NULL
);

-- Table des items de commande
CREATE TABLE IF NOT EXISTS order_items (
  idOrderItem INT AUTO_INCREMENT PRIMARY KEY,
  idOrder INT,
  idMenu INT,
  quantity INT DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (idOrder) REFERENCES orders(idOrder) ON DELETE CASCADE,
  FOREIGN KEY (idMenu) REFERENCES menus(idMenu) ON DELETE SET NULL
);

-- Table des thèmes (Ancienne table)
CREATE TABLE IF NOT EXISTS themes (
  idTheme INT AUTO_INCREMENT PRIMARY KEY,
  active_theme VARCHAR(50) DEFAULT 'light',
  primary_color VARCHAR(20) DEFAULT '#FF6B6B',
  secondary_color VARCHAR(20) DEFAULT '#4ECDC4',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des paramètres de thème (utilisée par le microservice theme-service)
CREATE TABLE IF NOT EXISTS theme_settings (
  id INT PRIMARY KEY,
  `primary` VARCHAR(20) DEFAULT '#0e0c2b',
  `secondary` VARCHAR(20) DEFAULT '#7842af',
  `background` VARCHAR(20) DEFAULT '#e6dce4',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insertion du thème par défaut s'il n'existe pas
INSERT IGNORE INTO themes (idTheme, active_theme, primary_color, secondary_color) 
VALUES (1, 'light', '#FF6B6B', '#4ECDC4');

-- Insertion du paramètre de thème par défaut
INSERT IGNORE INTO theme_settings (id, `primary`, `secondary`, `background`)
VALUES (1, '#0e0c2b', '#7842af', '#e6dce4');
