import * as k8s from '@kubernetes/client-node'
import type { KubernetesObject, ListPromise, V1Deployment, V1Pod } from '@kubernetes/client-node'

let k8sApi: k8s.CoreV1Api
let k8sAppApi: k8s.AppsV1Api
let kc: k8s.KubeConfig

let podWatcher: k8s.ListWatch<k8s.V1Pod> | undefined
let deploymentWatcher: k8s.ListWatch<k8s.V1Deployment> | undefined

type Event = 'ADDED' | 'MODIFIED' | 'DELETED'

export interface K8sObjectEvent<T extends k8s.KubernetesObject> {
  event: Event
  object: T
}

export function initialize() {
  try {
    kc = new k8s.KubeConfig()
    kc.loadFromDefault()

    k8sApi = kc.makeApiClient(k8s.CoreV1Api)
    if (k8sApi == undefined) {
      throw new Error('K8s API client is undefined')
    }

    k8sAppApi = kc.makeApiClient(k8s.AppsV1Api)
    if (k8sAppApi == undefined) {
      throw new Error('K8s Apps API client is undefined')
    }

    return true
  } catch (err) {
    console.error('Error initializing K8s client: ', err)
    return false
  }
}

export function registerDeploymentWatcher(
  namespace: string,
  messageCallback: (message: K8sObjectEvent<V1Deployment>) => void,
  connectCallback: () => void,
  errorCallback: (errMessage?: Error) => void,
) {
  registerObjectWatcher(
    messageCallback,
    connectCallback,
    errorCallback,
    deploymentWatcher,
    `/apis/apps/v1/namespaces/${namespace}/deployments`,
    () => k8sAppApi.listNamespacedDeployment({ namespace }),
  ).then(value =>
  deploymentWatcher = value)
    .catch((err: Error) => {
      console.error('Error initializing K8s client: ', err)
    })
}

export function registerPodWatcher(
  namespace: string,
  messageCallback: (message: K8sObjectEvent<V1Pod>) => void,
  connectCallback: () => void,
  errorCallback: (errMessage?: Error) => void,
) {
  registerObjectWatcher(
    messageCallback,
    connectCallback,
    errorCallback,
    podWatcher,
    `/api/v1/namespaces/${namespace}/pods`,
    () => k8sApi.listNamespacedPod({ namespace }),
  )
    .then(value =>
    podWatcher = value)
    .catch((err: Error) => {
      console.error('Error initializing K8s client: ', err)
    })
}

export function deletePod(podNamespace: string, podName: string) {
  return k8sApi.deleteNamespacedPod({ name: podName, namespace: podNamespace })
}

export function scaleDeployment(namespace: string, deployment: string, replicas: number) {
  const options = k8s.setHeaderOptions('Content-Type', k8s.PatchStrategy.MergePatch)
  return k8sAppApi
    .patchNamespacedDeploymentScale({
      name: deployment,
      namespace: namespace,
      body: {
        spec: {
          replicas: replicas,
        },
      },
    },
      options)
    .then(() => true)
}

export function getAllNamespaces() {
  try {
    return k8sApi.listNamespace()
  } catch (err) {
    console.error('List Namespace Error :', err)
    throw err
  }
}

async function registerObjectWatcher<T extends KubernetesObject>(
  messageCallback: (message: K8sObjectEvent<T>) => void,
  connectCallback: () => void,
  errorCallback: (errMessage?: Error) => void,
  watcher: k8s.ListWatch<T> | undefined,
  watcherPath: string,
  listFunction: ListPromise<T>,
) {
  try {
    if (watcher) {
      // console.log('Stopping existing watcher before registering new one')

      try {
        await watcher.stop()
        // console.log('Stopped existing watcher')
      } catch (err) {
        console.error('Error stopping existing watcher: ', err)
      }
    }
    return registerWatcher(
      messageCallback,
      connectCallback,
      errorCallback,
      watcherPath,
      listFunction,
    )
  } catch (err) {
    console.error('Error initializing watcher: ', err)
    throw err
  }
}

function registerWatcher<T extends KubernetesObject>(
  messageCallback: (message: K8sObjectEvent<T>) => void,
  connectCallback: () => void,
  errorCallback: (errMessage?: Error) => void,
  watcherPath: string,
  listFunction: ListPromise<T>,
) {
  const watch = new k8s.Watch(kc)
  const watcher = new k8s.ListWatch<T>(watcherPath, watch, listFunction)

  watcher.on('add', (k8sObj: T) => {
    // console.log('Object added: ', k8sObj.metadata?.name)
    messageCallback({ event: 'ADDED', object: k8sObj })
  })

  watcher.on('update', (k8sObj: T) => {
    // console.log('Object Updated: ', k8sObj.metadata?.name)
    messageCallback({ event: 'MODIFIED', object: k8sObj })
  })

  watcher.on('delete', (k8sObj: T) => {
    // console.log('Object deleted: ', k8sObj.metadata?.name)
    messageCallback({ event: 'DELETED', object: k8sObj })
  })

  watcher.on('connect', () => {
    connectCallback()
  })

  watcher.on('error', (err?: Error) => {
    if (err && !(err instanceof k8s.AbortError)) {
      errorCallback(err ?? new Error('Unknown error'))
    }
  })

  watcher.start().catch((err) => {
    console.error('Error starting watcher: ', err)
    errorCallback(err)
  })

  return watcher
}
