const { app, BrowserWindow, ipcMain, Notification, Tray, Menu } = require('electron')
const path = require('path')

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  mainWindow.loadFile('index.html')
}

ipcMain.on("asynchronous-message", (event, arg) => {
    console.log(arg);
    if (arg.eventType === "notification") {
        const notification = new Notification({
            title: "New Item",
            body: arg.body,
            silent: false,

        });
        notification.show();
    }
})

let tray = null;
app.whenReady().then(() => {
  createWindow();
  const icon_path = path.join(__dirname, "icon.png");
  tray = new Tray(icon_path);

  if (process.platform === 'win32') {
    tray.on('click', tray.popUpContextMenu);
  }
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

