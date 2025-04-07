import * as k8s from '@kubernetes/client-node'

let k8sApi: k8s.CoreV1Api
let kc: k8s.KubeConfig
let podWatcher: k8s.ListWatch<k8s.V1Pod>

type PodEvent = 'ADDED' | 'MODIFIED' | 'DELETED'

export interface K8sObjectEvent<T extends k8s.KubernetesObject> {
  event: PodEvent
  object: T
}

export function initialize() {
  kc = new k8s.KubeConfig()
  kc.loadFromDefault()

  k8sApi = kc.makeApiClient(k8s.CoreV1Api)
}

export function registerPodWatcher(
  namespace: string,
  messageCallback: (message: K8sObjectEvent<k8s.V1Pod>) => void,
  connectCallback: () => void,
  errorCallback: (errMessage?: Error) => void,
) {
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
    // console.error('Pod watcher error: ', err)
    errorCallback(err ?? new Error('Unknown error'))
  })
}

export function startPodWatcher(errorCallback: (errMessage?: Error) => void) {
  if (!podWatcher) {
    throw new Error('Pod watcher is not initialized')
  }
  podWatcher.start().catch((err) => {
    console.error('Error starting watcher: ', err)
    errorCallback(err)
  })
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
    console.error(err)
    throw err
  }
}
