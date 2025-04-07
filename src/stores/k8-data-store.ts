import type {
  V1Pod,
  V1ObjectMeta,
  V1Namespace,
  V1Service,
  V1Deployment,
  V1NamespaceList,
} from '@kubernetes/client-node'

import { getKey, prepareData } from '../scripts/k8s-helpers'
import type { K8SItemData } from '../scripts/k8s-helpers'
import { defineStore, acceptHMRUpdate } from 'pinia'
import type { K8sObjectEvent } from 'app/src-electron/scripts/kube'

export const useK8DataStore = defineStore('k8data', {
  state: () => ({
    status: false,
    loading: true,
    message: 'Loading',
    selectedNamespace: 'default',
    namespace_data: {
      metadata: null as object | null,
      items: {} as K8SItemData<V1Namespace>,
    },
    pod_data: {
      metadata: null as V1ObjectMeta | null,
      items: {} as K8SItemData<V1Pod>,
    },
    svc_data: {
      metadata: null as object | null,
      items: {} as K8SItemData<V1Service>,
    },
    deployment_data: {
      metadata: null as object | null,
      items: {} as K8SItemData<V1Deployment>,
    },
  }),

  getters: {
    getStatus: (state) => {
      return state.status
    },
    isLoading: (state) => {
      return state.loading
    },
    getMessage: (state) => {
      return state.message
    },

    // Namespace
    getSelectedNamespace: (state) => {
      return state.selectedNamespace
    },
    getAllNamespaceItems: (state) => {
      return Object.values(state.namespace_data.items)
    },

    // Pods
    getAllPodItems: (state) => {
      return Object.values(state.pod_data.items)
    },
    getPodData: (state) => (podUid: string) => {
      return state.pod_data.items[podUid]
    },

    // Services
    getAllSvcItems: (state) => {
      return Object.values(state.svc_data.items)
    },
    getSvcData: (state) => (svcUid: string) => {
      return state.svc_data.items[svcUid]
    },

    getAllDeploymentItems: (state) => {
      return Object.values(state.deployment_data.items)
    },
  },

  actions: {
    registerPodWatcher() {
      window.kube
        .registerPodWatcher(this.selectedNamespace)
        .then(() => {
          this.status = true
          this.loading = false
        })
        .catch((err) => {
          this.status = false
          this.loading = false
          this.message = err.message
        })
    },
    fetchNamespaces() {
      return window.kube
        .getAllNamespaces()
        .then((res: V1NamespaceList) => {
          const preparedData = prepareData(res)
          this.namespace_data.metadata = preparedData.metadata
          this.namespace_data.items = preparedData.items
          this.status = true
          this.loading = false
        })
        .catch((err) => {
          console.log('Error fetching namespaces: ', err)
          this.status = false
          this.loading = false
          this.message = err.message
        })
    },
    initializeDefaultCallbacks() {
      window.kube.onConnected(() => {
        this.status = true
        this.loading = false
        this.message = 'Connected'
      })

      window.kube.onError((err) => {
        this.status = false
        this.loading = false
        this.message = err.message

        setTimeout(() => window.kube.startPodWatcher(), 10000)
      })
    },
    initializePodCallbacks() {
      console.log('Registering pod watcher...')
      window.kube.onPodMessage((message: K8sObjectEvent<V1Pod>) => {
        // console.log('Pod message: ', message.event, message.object.metadata?.name)
        if (message.event === 'ADDED') {
          this.pod_data.items[getKey(message.object.metadata)] = message.object
        }
        if (message.event === 'MODIFIED') {
          this.pod_data.items[getKey(message.object.metadata)] = message.object
        }
        if (message.event === 'DELETED') {
          delete this.pod_data.items[getKey(message.object.metadata)]
        }
      })
    },

    deletePod(podUid: string) {
      const podToRemove = this.pod_data.items[podUid]
      if (podToRemove) {
        const namespace = podToRemove.metadata?.namespace ?? ''
        const name = podToRemove.metadata?.name ?? ''

        console.log('Deleting pod 111 : ', namespace, name)

        return window.kube.deletePods(namespace, name)
      }
      return Promise.reject(new Error('Pod not found'))
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useK8DataStore, import.meta.hot))
}

// import { parse as jsonParse } from 'JSONStream'

// const kubeclient = require('kubernetes-client')

// const client = new kubeclient.Client1_13()
// let podStream = null
// let svcStream = null
// let deploymentStream = null

// function kubeDataSortComparison(a, b) {
//   if (a.metadata.namespace == b.metadata.namespace) {
//     if (a.metadata.name == b.metadata.name) {
//       return a.metadata.uid.localeCompare(b.metadata.uid)
//     }
//     return a.metadata.name.localeCompare(b.metadata.name)
//   }
//   return a.metadata.namespace.localeCompare(b.metadata.namespace)
// }

// function sortResource(resource, sorter = kubeDataSortComparison) {
//   let sorted = []
//   if (state.status) {
//     sorted = Object.values(resource)
//     sorted.sort(sorter)
//   }
//   return sorted
// }

// // helpers
// async function fetchResource(resourceToCall, commit, commitKey) {
//   return new Promise((resolve, reject) => {
//     commit('setLoading')
//     resourceToCall.get().then(
//       (res) => {
//         const data = prepareData(res)
//         commit('setStatus', { connStatus: true, message: 'Connection Success' })
//         commit(commitKey, { data: data })
//         resolve()
//       },
//       (err) => {
//         console.log('Error (' + commitKey + ') ' + err)
//         commit('setStatus', { connStatus: false, message: err })
//         reject()
//       },
//     )
//   })
// }

// actions
// const actions = {
//   fetchNamespaces: function ({ commit }) {
//     return fetchResource(client.api.v1.namespaces, commit, 'setNamespaceData')
//   },
//   fetchPodData: function ({ commit, getters }) {
//     return fetchResource(
//       client.api.v1.namespaces(getters.getSelectedNamespace).pods,
//       commit,
//       'setPodData',
//     )
//   },
//   fetchSvcData: function ({ commit, getters }) {
//     return fetchResource(
//       client.api.v1.namespaces(getters.getSelectedNamespace).services,
//       commit,
//       'setSvcData',
//     )
//   },
//   fetchDeploymentData: function ({ commit, getters }) {
//     return fetchResource(
//       client.apis.apps.v1.namespaces(getters.getSelectedNamespace).deployments,
//       commit,
//       'setDeploymentData',
//     )
//   },

//   stopPodWatch: function () {
//     return new Promise((resolve) => {
//       if (podStream) {
//         podStream.destroy()
//         podStream = null
//       }
//       resolve()
//     })
//   },

//   watchPodData: async function ({ commit, state, getters }) {
//     const rv = state.pod_data.metadata.resourceVersion
//     podStream = await client.api.v1.watch
//       .namespaces(getters.getSelectedNamespace)
//       .pods.getObjectStream({
//         qs: {
//           resourceVersion: rv,
//           watch: rv,
//         },
//       })

//     podStream.on('data', (res) => {
//       let pod_item = res.object
//       if (res.type === 'ADDED') {
//         // eslint-disable-next-line
//         pod_item = (({ kind, apiVersion, ...others }) => ({ ...others }))(res.object)
//         commit('setPodItem', pod_item)
//         console.log('new object : ' + pod_item.metadata.name + ' : ' + pod_item.metadata.uid)
//       } else if (res.type === 'MODIFIED') {
//         // eslint-disable-next-line
//         pod_item = (({ kind, apiVersion, ...others }) => ({ ...others }))(res.object)
//         commit('setPodItem', pod_item)
//         console.log('changed object : ' + pod_item.metadata.name + ' : ' + pod_item.metadata.uid)
//       } else if (res.type === 'DELETED') {
//         // eslint-disable-next-line
//         pod_item = (({ kind, apiVersion, ...others }) => ({ ...others }))(res.object)
//         commit('deletePodItem', pod_item)
//         console.log('deleted object : ' + pod_item.metadata.name + ' : ' + pod_item.metadata.uid)
//       } else {
//         console.error('unknown type: ' + JSON.stringify(res))
//       }
//     })
//   },

//   stopSvcWatch: function () {
//     return new Promise((resolve) => {
//       if (svcStream) {
//         svcStream.destroy()
//         svcStream = null
//       }
//       resolve()
//     })
//   },

//   watchSvcData: async function ({ commit, state, getters }) {
//     const rv = state.svc_data.metadata.resourceVersion
//     svcStream = await client.api.v1.watch
//       .namespaces(getters.getSelectedNamespace)
//       .services.getObjectStream({
//         qs: {
//           resourceVersion: rv,
//         },
//       })

//     svcStream.on('data', (res) => {
//       let svc_item = res.object
//       if (res.type === 'ADDED') {
//         // eslint-disable-next-line
//         svc_item = (({ kind, apiVersion, ...others }) => ({ ...others }))(res.object)
//         commit('setSvcItem', svc_item)
//         console.log('new svc : ' + svc_item.metadata.name + ' : ' + svc_item.metadata.uid)
//       } else if (res.type === 'MODIFIED') {
//         // eslint-disable-next-line
//         svc_item = (({ kind, apiVersion, ...others }) => ({ ...others }))(res.object)
//         commit('setSvcItem', svc_item)
//         console.log('changed svc : ' + svc_item.metadata.name + ' : ' + svc_item.metadata.uid)
//       } else if (res.type === 'DELETED') {
//         // eslint-disable-next-line
//         svc_item = (({ kind, apiVersion, ...others }) => ({ ...others }))(res.object)
//         commit('deleteSvcItem', svc_item)
//         console.log('deleted svc : ' + svc_item.metadata.name + ' : ' + svc_item.metadata.uid)
//       } else {
//         console.error('unknown type: ' + JSON.stringify(res))
//       }
//     })
//   },

//   deleteSvc: function ({ state }, svc_uid) {
//     const svcToRemove = state.svc_data.items[svc_uid]
//     if (svcToRemove) {
//       const namespace = svcToRemove.metadata.namespace
//       const name = svcToRemove.metadata.name
//       client.api.v1.namespaces(namespace).services(name).delete()
//     }
//   },

//   stopDeploymentWatch: function () {
//     return new Promise((resolve) => {
//       if (deploymentStream) {
//         deploymentStream.destroy()
//         deploymentStream = null
//       }
//       resolve()
//     })
//   },

//   watchDeploymentData: async function ({ commit, state, getters }) {
//     const rv = state.deployment_data.metadata.resourceVersion
//     deploymentStream = await client.apis.apps.v1
//       .namespaces(getters.getSelectedNamespace)
//       .deployments.getStream({
//         qs: {
//           resourceVersion: rv,
//           watch: rv,
//         },
//       })
//     const jsonifiedStream = new jsonParse()
//     deploymentStream.pipe(jsonifiedStream)

//     jsonifiedStream.on('data', (res) => {
//       let deployment_item = res.object
//       if (res.type === 'ADDED') {
//         // eslint-disable-next-line
//         deployment_item = (({ kind, apiVersion, ...others }) => ({ ...others }))(res.object)
//         commit('setDeploymentItem', deployment_item)
//         console.log(
//           'new object : ' + deployment_item.metadata.name + ' : ' + deployment_item.metadata.uid,
//         )
//       } else if (res.type === 'MODIFIED') {
//         // eslint-disable-next-line
//         deployment_item = (({ kind, apiVersion, ...others }) => ({ ...others }))(res.object)
//         commit('setDeploymentItem', deployment_item)
//         console.log(
//           'changed object : ' +
//             deployment_item.metadata.name +
//             ' : ' +
//             deployment_item.metadata.uid,
//         )
//       } else if (res.type === 'DELETED') {
//         // eslint-disable-next-line
//         deployment_item = (({ kind, apiVersion, ...others }) => ({ ...others }))(res.object)
//         commit('deleteDeploymentItem', deployment_item)
//         console.log(
//           'deleted object : ' +
//             deployment_item.metadata.name +
//             ' : ' +
//             deployment_item.metadata.uid,
//         )
//       } else {
//         console.error('unknown type: ' + JSON.stringify(res))
//       }
//     })
//   },

//   modifyDeploymentReplica: async function (_, { namespace, deploymentName, newReplica }) {
//     const iRep = Number(newReplica)
//     return client.apis.apps.v1
//       .namespaces(namespace)
//       .deployment(deploymentName)
//       .patch({
//         body: {
//           spec: {
//             replicas: iRep,
//           },
//         },
//       })
//   },

//   getLogStream: async function (_, { podNamespace, podName, currContainer }) {
//     return client.api.v1
//       .namespaces(podNamespace)
//       .pods(podName)
//       .log.getByteStream({
//         qs: {
//           container: currContainer,
//           tailLines: 10000,
//           follow: true,
//           timestamps: false,
//         },
//       })
//   },

//   setSelectedNamespace: function ({ commit }, selectedNamespace) {
//     commit('setSelectedNamespace', selectedNamespace)
//   },
// }

// // mutations
// const mutations = {
//   setLoading(state) {
//     state.loading = true
//   },
//   setStatus(state, { connStatus, message }) {
//     state.status = connStatus
//     state.message = message
//     state.loading = false
//   },
//   setNamespaceData(state, { data }) {
//     Vue.set(state, 'namespace_data', data)
//   },
//   setSelectedNamespace(state, selectedNamespace) {
//     state.selectedNamespace = selectedNamespace
//     const emptyData = { items: {} }
//     Vue.set(state, 'pod_data', emptyData)
//     Vue.set(state, 'svc_data', emptyData)
//   },
//   setPodData(state, { data }) {
//     Vue.set(state, 'pod_data', data)
//   },
//   setPodItem(state, podData) {
//     Vue.set(state.pod_data.items, getKey(podData), podData)
//   },
//   deletePodItem(state, podData) {
//     Vue.delete(state.pod_data.items, getKey(podData))
//   },

//   setSvcData(state, { data }) {
//     Vue.set(state, 'svc_data', data)
//   },
//   setSvcItem(state, svcData) {
//     Vue.set(state.svc_data.items, getKey(svcData), svcData)
//   },
//   deleteSvcItem(state, svcData) {
//     Vue.delete(state.svc_data.items, getKey(svcData))
//   },

//   setDeploymentData(state, { data }) {
//     Vue.set(state, 'deployment_data', data)
//   },
//   setDeploymentItem(state, deploymentData) {
//     Vue.set(state.deployment_data.items, getKey(deploymentData), deploymentData)
//   },
//   deleteDeploymentItem(state, deploymentData) {
//     Vue.delete(state.deployment_data.items, getKey(deploymentData))
//   },
// }
