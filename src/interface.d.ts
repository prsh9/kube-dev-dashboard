import type { V1NamespaceList, V1PodList } from '@kubernetes/client-node'

export interface IKubeAPI {
  registerPodWatcher: (namespace: string) => Promise<void>
  startPodWatcher: () => void
  getPods: () => Promise<V1PodList>
  deletePods: (podNamespace: string, podName: string) => Promise<V1Pod>

  getAllNamespaces: () => Promise<V1NamespaceList>

  onPodMessage: (callback: (value: K8sObjectEvent<V1Pod>) => void) => void
  onConnected: (callback: () => void) => void
  onError: (callback: (err: Error) => void) => void
}

declare global {
  interface Window {
    kube: IKubeAPI
  }
}
