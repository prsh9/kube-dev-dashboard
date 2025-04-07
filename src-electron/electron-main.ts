import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import os from 'os'
import { fileURLToPath } from 'url'
import {
  deletePod,
  getAllNamespaces,
  getPods,
  initialize,
  registerPodWatcher,
  startPodWatcher,
} from './scripts/kube'
import { installExtension, VUEJS_DEVTOOLS } from 'electron-devtools-installer'

// needed in case process is undefined under Linux
const platform = process.platform || os.platform()

const currentDir = fileURLToPath(new URL('.', import.meta.url))

let mainWindow: BrowserWindow | undefined

function installDevTools() {
  return installExtension(VUEJS_DEVTOOLS, { loadExtensionOptions: { allowFileAccess: true } })
    .then(() => console.log(`Added Extensions`))
    .catch((err) => console.log('An error occurred: ', err))
}

async function createMainWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    icon: path.resolve(currentDir, 'icons/icon.png'), // tray icon
    width: 1000,
    height: 600,
    useContentSize: true,
    webPreferences: {
      contextIsolation: true,
      // More info: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/electron-preload-script
      preload: path.resolve(
        currentDir,
        path.join(
          process.env.QUASAR_ELECTRON_PRELOAD_FOLDER,
          'electron-preload' + process.env.QUASAR_ELECTRON_PRELOAD_EXTENSION,
        ),
      ),
    },
  })

  if (process.env.DEV) {
    await mainWindow.loadURL(process.env.APP_URL)
  } else {
    await mainWindow.loadFile('index.html')
  }

  if (process.env.DEBUGGING) {
    // if on DEV or Production with debug enabled
    mainWindow.webContents.openDevTools()
  } else {
    // we're on production; no access to devtools pls
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow?.webContents.closeDevTools()
    })
  }

  mainWindow.on('closed', () => {
    mainWindow = undefined
  })
}

void app.whenReady().then(installDevTools).then(registerKube).then(createMainWindow)

app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === undefined) {
    void createMainWindow()
  }
})

function registerKube() {
  initialize()

  ipcMain.on('kube:startPodWatcher', () =>
    startPodWatcher((err) => {
      mainWindow?.webContents.send('k8s-error', err)
      console.error('Error connecting to K8s: ', err)
    }),
  )

  ipcMain.handle('kube:deletePod', (event, podNamespace, podName) =>
    deletePod(podNamespace, podName),
  )

  ipcMain.handle('kube:namespaces', () => getAllNamespaces())
  ipcMain.handle('kube:pods', () => getPods())

  ipcMain.handle('kube:registerPodWatcher', (event, namespace) =>
    registerPodWatcher(
      namespace,
      (message) => {
        mainWindow?.webContents.send('k8s-pod-message', message)
      },
      () => {
        mainWindow?.webContents.send('k8s-connected')
        console.log('Connected to K8s')
      },
      (err) => {
        mainWindow?.webContents.send('k8s-error', err)
        console.error('Error connecting to K8s: ', err)
      },
    ),
  )
}
