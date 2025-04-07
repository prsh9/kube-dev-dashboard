import type { V1Namespace, V1NamespaceList, V1ObjectMeta } from '@kubernetes/client-node'

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
