const { spawn } = require('child_process');
const path = require('path');

const services = [
  { name: 'gateway', port: 5000, path: './gateway' },
  { name: 'auth-service', port: 5001, path: './services/auth-service' },
  { name: 'user-service', port: 5002, path: './services/user-service' },
  { name: 'catalog-service', port: 5003, path: './services/catalog-service' },
  { name: 'order-service', port: 5004, path: './services/order-service' },
  { name: 'table-service', port: 5005, path: './services/table-service' },
  { name: 'kitchen-service', port: 5006, path: './services/kitchen-service' },
  { name: 'theme-service', port: 5007, path: './services/theme-service' },
];

const processes = [];

const setupDatabase = require('./scripts/setup-db');
const syncModels = require('./scripts/sync-models');

async function start() {
  try {
    // Initialiser la base de données (SQL brut)
    await setupDatabase();

    // Synchroniser les modèles Sequelize
    await syncModels();

    console.log('Tous les microservices sont en cours de démarrage...');
    console.log('API Gateway: http://localhost:5000');
    console.log('Appuyez sur Ctrl+C pour arrêter tous les services');

    services.forEach(service => {
      const proc = spawn('node', ['server.js'], {
        cwd: path.join(__dirname, service.path),
        stdio: 'inherit',
        shell: false
      });

      processes.push({ name: service.name, process: proc });

      proc.on('error', (err) => {
        console.error(`❌ Erreur lors du démarrage de ${service.name}:`, err);
      });
    });
  } catch (error) {
    console.error('❌ Échec du démarrage des services:', error.message);
    process.exit(1);
  }
}

start();

