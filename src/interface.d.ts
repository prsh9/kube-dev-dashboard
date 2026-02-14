import type { V1Deployment, V1NamespaceList } from '@kubernetes/client-node'

export interface IKubeAPI {
  initialize: () => Promise<boolean>

  registerPodWatcher: (namespace: string) => Promise<void>
  registerDeploymentWatcher: (namespace: string) => Promise<void>

  deletePods: (podNamespace: string, podName: string) => Promise<V1Pod>

  scaleDeployment: (namespace: string, deployment: string, replica: number) => Promise<boolean>

  getAllNamespaces: () => Promise<V1NamespaceList>

  onPodMessage: (callback: (value: K8sObjectEvent<V1Pod>) => void) => void
  onDeploymentMessage: (callback: (value: K8sObjectEvent<V1Deployment>) => void) => void

  onConnected: (callback: () => void) => void
  onError: (callback: (err: Error) => void) => void
}

declare global {
  interface Window {
    kube: IKubeAPI
  }
}
