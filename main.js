const electron = require('electron');
// Electron Libs
const { ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');

// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const fs = require('fs');
const os = require('os');
const url = require('url');
const path = require('path');
const glob = require('glob');
const isDev = require('electron-is-dev');

// commmandline arguments
const forceDevtools = process.argv.includes('--force-devtools');
if (process.argv.includes('--disable-hardware-acceleration')) {
  app.disableHardwareAcceleration();
}

// 3rd Party Libs
const appConfig = require('electron-settings');
require('dotenv').config();

const handleSquirrelEvent = () => {
    if (process.argv.length === 1) {
      return false;
    }
  
    const squirrelEvent = process.argv[1];
    switch (squirrelEvent) {
      case '--squirrel-install':
      case '--squirrel-updated':
      case '--squirrel-uninstall':
        setTimeout(app.quit, 1000);
        return true;
  
      case '--squirrel-obsolete':
        app.quit();
        return true;
    }
  }
  
  if (handleSquirrelEvent()) {
    // squirrel event handled and app will exit in 1000ms, so don't do anything else
    return;
  }


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow = null;

function createWindow() {

    // Create the browser window.
    mainWindow = new BrowserWindow(
      {
        width: 1366, 
        height: 768,
        webPreferences: {
          nodeIntegration: false,
          preload: 'preload.js'
        },
        resizable: false,
        title: 'Keystone',
      }
    );

    // and load the index.html of the app.

    // Register WindowID
    appConfig.set('mainWindowID', parseInt(mainWindow.id));

    const startUrl = 'https://localhost:5001/'
    console.log(startUrl);
    mainWindow.loadURL(startUrl);

    // Open the DevTools.

    mainWindow.on('show', event => {
      if (isDev || forceDevtools) mainWindow.webContents.openDevTools({ mode: 'detach' });
    });

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
      if (process.platform === 'darwin') {
        event.preventDefault();
        if (isDev || forceDevtools) mainWindow.webContents.closeDevTools();
        mainWindow.hide();
      } else {
        app.quit();
      }
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function () {  
  createWindow();
  autoUpdater.checkForUpdates();
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
});

app.on('before-quit', () => {
  // Use condition in case quit sequence is initiated by autoUpdater
  // which will destroy all there windows already before emitting this event
  if (mainWindow !== null) mainWindow.destroy();
});

// when the update has been downloaded and is ready to be installed, notify the BrowserWindow
autoUpdater.on('update-downloaded', (info) => {
  win.webContents.send('updateReady')
});

// when receiving a quitAndInstall signal, quit and install the new version ;)
ipcMain.on("quitAndInstall", (event, arg) => {
  autoUpdater.quitAndInstall();
})


console.timeEnd('init');