// Modules to control application life and create native browser window
const { app, shell, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const { electronApp, optimizer } = require('@electron-toolkit/utils')

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 700,
    height: 360,
    icon: path.join(__dirname, '../resources/icon.icns'),
    show: false,
    autoHideMenuBar: true,
    resizable: false,
    frame: false,
    ...(process.platform === 'linux'
      ? {
          icon: path.join(__dirname, '../resources/icon.png')
        }
      : {}),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'))

  startCountdown(mainWindow)

  // IPC listener for resetting the countdown (if needed)
  ipcMain.on('update-countdown', () => {
    startCountdown(mainWindow)
  })
}

function startCountdown(mainWindow) {
  const targetDate = new Date('2023-12-15T23:59:59') // Change this to your target date

  // Update the countdown every second
  const countdownInterval = setInterval(() => {
    const currentDate = new Date()
    const timeDifference = targetDate - currentDate

    // Check if the countdown has reached zero
    if (timeDifference <= 0) {
      clearInterval(countdownInterval)
      mainWindow.webContents.send('update-countdown', 'Countdown Expired')
    } else {
      const seconds = Math.floor((timeDifference / 1000) % 60)
      const minutes = Math.floor((timeDifference / (1000 * 60)) % 60)
      const hours = Math.floor((timeDifference / (1000 * 60 * 60)) % 24)
      const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24))

      const formattedCountdown = `${days}d : ${hours}h : ${minutes}m : ${seconds}s`
      mainWindow.webContents.send('update-countdown', formattedCountdown)
    }
  }, 1000)

  // Add a listener to the window close event to clear the countdown interval
  mainWindow.on('closed', () => {
    clearInterval(countdownInterval)
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
