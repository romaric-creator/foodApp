const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let splash;

function createWindow() {
  // Splash screen (optionnel, structure de base)
  splash = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    icon: path.join(__dirname, 'build', 'logo512.png'),
  });
  splash.loadFile(path.join(__dirname, 'build', 'splash.html'));

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false, // Fenêtre sans bordure native
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'), // Pour la communication IPC
    },
    icon: path.join(__dirname, 'build', 'logo512.png'),
    show: false, // On affiche après le splash
  });
  mainWindow.removeMenu();
  mainWindow.loadFile(path.join(__dirname, 'build', 'index.html'));

  // Affiche la fenêtre principale après un court délai (ou après le chargement)
  mainWindow.once('ready-to-show', () => {
    setTimeout(() => {
      splash.destroy();
      mainWindow.show();
    }, 1200); // Durée du splash screen
  });

  // Gestion des actions de fenêtre via IPC
  ipcMain.on('window-action', (event, action) => {
    if (action === 'minimize') mainWindow.minimize();
    else if (action === 'maximize') {
      if (mainWindow.isMaximized()) mainWindow.unmaximize();
      else mainWindow.maximize();
    } else if (action === 'close') mainWindow.close();
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
