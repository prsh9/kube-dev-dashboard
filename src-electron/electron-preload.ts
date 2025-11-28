import type { V1Pod } from '@kubernetes/client-node'
import { contextBridge, ipcRenderer } from 'electron'
import type { K8sObjectEvent } from './scripts/kube'

contextBridge.exposeInMainWorld('kube', {
  initialize: () => ipcRenderer.invoke('kube:init'),

  registerPodWatcher: (namespace: string) =>
    ipcRenderer.invoke('kube:registerPodWatcher', namespace),
  startPodWatcher: () => ipcRenderer.send('kube:startPodWatcher'),
  getPods: (namespace: string) => ipcRenderer.invoke('kube:pods', namespace),
  deletePods: (podNamespace: string, podName: string) => {
    console.log('Deleting pod preload', podNamespace, podName)
    return ipcRenderer.invoke('kube:deletePod', podNamespace, podName)
  },
  onPodMessage: (callback: (value: K8sObjectEvent<V1Pod>) => void) =>
    ipcRenderer.on('k8s-pod-message', (_event, value) => callback(value)),

  getAllNamespaces: () => ipcRenderer.invoke('kube:namespaces'),

  onConnected: (callback: () => void) => ipcRenderer.on('k8s-connected', () => callback()),
  onError: (callback: (err: Error) => void) =>
    ipcRenderer.on('k8s-error', (_event, err) => callback(err)),
})

/**
 * This file is used specifically for security reasons.
 * Here you can access Nodejs stuff and inject functionality into
 * the renderer thread (accessible there through the "window" object)
 *
 * WARNING!
 * If you import anything from node_modules, then make sure that the package is specified
 * in package.json > dependencies and NOT in devDependencies
 *
 * Example (injects window.myAPI.doAThing() into renderer thread):
 *
 *   import { contextBridge } from 'electron'
 *
 *   contextBridge.exposeInMainWorld('myAPI', {
 *     doAThing: () => {}
 *   })
 *
 * WARNING!
 * If accessing Node functionality (like importing @electron/remote) then in your
 * electron-main.ts you will need to set the following when you instantiate BrowserWindow:
 *
 * mainWindow = new BrowserWindow({
 *   // ...
 *   webPreferences: {
 *     // ...
 *     sandbox: false // <-- to be able to import @electron/remote in preload script
 *   }
 * }
 */
