import * as k8s from '@kubernetes/client-node'

let k8sApi: k8s.CoreV1Api
let kc: k8s.KubeConfig

let podWatcher: k8s.ListWatch<k8s.V1Pod>

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
    return true
  } catch (err) {
    console.error('Error initializing K8s client: ', err)
    return false
  }
}

export function registerPodWatcher(
  namespace: string,
  messageCallback: (message: K8sObjectEvent<k8s.V1Pod>) => void,
  connectCallback: () => void,
  errorCallback: (errMessage?: Error) => void,
) {
  try {
    if (podWatcher) {
      console.log('Stopping existing pod watcher before registering new one')

      podWatcher
        .stop()
        .then(() => console.log('Stopped existing pod watcher'))
        .catch((err) => console.error('Error stopping existing pod watcher: ', err))
    }

    const watch = new k8s.Watch(kc)
    podWatcher = new k8s.ListWatch<k8s.V1Pod>(`/api/v1/namespaces/${namespace}/pods`, watch, () =>
      k8sApi.listNamespacedPod({ namespace }),
    )

    podWatcher.on('add', (pod: k8s.V1Pod) => {
      // console.log('Pod added: ', pod.metadata?.name)
      messageCallback({ event: 'ADDED', object: pod })
    })

    podWatcher.on('update', (pod: k8s.V1Pod) => {
      // console.log('Pod Updated: ', pod.metadata?.name)
      messageCallback({ event: 'MODIFIED', object: pod })
    })

    podWatcher.on('delete', (pod: k8s.V1Pod) => {
      // console.log('Pod deleted: ', pod.metadata?.name)
      messageCallback({ event: 'DELETED', object: pod })
    })

    podWatcher.on('connect', () => {
      connectCallback()
    })

    podWatcher.on('error', (err?: Error) => {
      if (err && !(err instanceof k8s.AbortError)) {
        errorCallback(err ?? new Error('Unknown error'))
      }
    })

    podWatcher.start().catch((err) => {
      console.error('Error starting watcher: ', err)
      errorCallback(err)
    })
  } catch (err) {
    console.error('Error initializing pod watcher: ', err)
    throw err
  }
}

export function deletePod(podNamespace: string, podName: string) {
  return k8sApi.deleteNamespacedPod({ name: podName, namespace: podNamespace })
}

export function getPods() {
  try {
    const podRes = podWatcher.list()
    return podRes
  } catch (err) {
    console.error(err)
    throw err
  }
}

export function getAllNamespaces() {
  try {
    return k8sApi.listNamespace()
  } catch (err) {
    console.error('This Error :', err)
    throw err
  }
}
