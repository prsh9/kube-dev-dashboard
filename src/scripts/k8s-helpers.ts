import type {
  V1Namespace,
  V1NamespaceList,
  V1ObjectMeta,
  KubernetesObject,
} from '@kubernetes/client-node'
import type { K8sObjectEvent } from 'app/src-electron/scripts/kube'

export interface K8SItemData<T> {
  [key: string]: T
}

export function getKey(itemData: V1ObjectMeta | undefined) {
  const value = itemData?.uid
  return value === undefined ? '' : value
}

export function prepareData(res: V1NamespaceList) {
  const preparedData = {
    active: true,
    metadata: res.metadata ? res.metadata : null,
    items: {} as K8SItemData<V1Namespace>,
  }

  for (const item of res.items) {
    const objKey = getKey(item.metadata)
    preparedData.items[objKey] = item
  }
  return preparedData
}

export function initializeLifecycleCallbacks<T extends KubernetesObject>(
  data_object: K8SItemData<T>,
  watcherFunction: (callback: (value: K8sObjectEvent<T>) => void) => void
) {
  console.log('Registering watcher...')
  watcherFunction((message: K8sObjectEvent<T>) => {
    if (message.event === 'ADDED') {
      data_object[getKey(message.object.metadata)] = message.object
    }
    if (message.event === 'MODIFIED') {
      data_object[getKey(message.object.metadata)] = message.object
    }
    if (message.event === 'DELETED') {
      delete data_object[getKey(message.object.metadata)]
    }
  })
}
