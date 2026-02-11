import type { V1Deployment, V1Pod } from '@kubernetes/client-node'
import { contextBridge, ipcRenderer } from 'electron'
import type { K8sObjectEvent } from './scripts/kube'

contextBridge.exposeInMainWorld('kube', {
  initialize: () => ipcRenderer.invoke('kube:init'),

  registerPodWatcher: (namespace: string) => {
    return ipcRenderer.invoke('kube:registerPodWatcher', namespace)
  },
  registerDeploymentWatcher: (namespace: string) => {
    return ipcRenderer.invoke('kube:registerDeploymentWatcher', namespace)
  },

  deletePods: (podNamespace: string, podName: string) => {
    console.log('Deleting pod preload', podNamespace, podName)
    return ipcRenderer.invoke('kube:deletePod', podNamespace, podName)
  },

  getAllNamespaces: () => ipcRenderer.invoke('kube:namespaces'),

  onPodMessage: (callback: (value: K8sObjectEvent<V1Pod>) => void) =>
    ipcRenderer.on('k8s-pod-message', (_event, value) => callback(value)),
  onDeploymentMessage: (callback: (value: K8sObjectEvent<V1Deployment>) => void) =>
    ipcRenderer.on('k8s-deployment-message', (_event, value) => callback(value)),

  onConnected: (callback: () => void) => ipcRenderer.on('k8s-connected', () => callback()),

  onError: (callback: (err: Error) => void) => {
    return ipcRenderer.on('k8s-error', (_event, err) => callback(err))
  },
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
