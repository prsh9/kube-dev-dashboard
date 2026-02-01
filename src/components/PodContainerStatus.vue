<template>
  <q-linear-progress
    :indeterminate="podStatusActual == 'Failed'"
    rounded
    :color="podStatusColor + '-4'"
    size="20px"
    :buffer-value="readyContainerPercent"
    :value="readyContainerPercent"
  >
    <div class="absolute-full flex flex-center">
      <q-badge :color="podStatusColor + '-4'" text-color="black" :label="containerLabel" />
    </div>
  </q-linear-progress>
  <q-avatar
    :color="
      containerRestarts > 0
        ? containerRestarts > 1
          ? 'red accent-1'
          : 'orange lighten-3'
        : 'teal lighten-4'
    "
    text-color="white"
    rounded
    size="20px"
  >
    {{ containerRestarts }}
  </q-avatar>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import type { V1Pod } from '@kubernetes/client-node'

export default defineComponent({
  name: 'PodContainerStatus',

  props: {
    pod: {
      type: Object as PropType<V1Pod>,
      required: true,
    },
  },

  components: {},

  computed: {
    numContainers: function (): number {
      return this.pod.spec?.containers?.length ?? 0
    },
    numReadyContainers: function (): number {
      let containerReady = 0
      if (this.pod.status?.containerStatuses) {
        this.pod.status.containerStatuses.forEach((element) => {
          containerReady += element.ready ? 1 : 0
        })
      }
      return containerReady
    },
    containerLabel: function (): string {
      return this.numReadyContainers + '/' + this.numContainers
    },
    readyContainerPercent: function (): number {
      return (this.numReadyContainers / this.numContainers) * 100
    },
    containerRestarts: function (): number {
      let restartCount = 0
      if (this.pod.status?.containerStatuses) {
        this.pod.status.containerStatuses.forEach((element) => {
          restartCount += element.restartCount
        })
      }
      return restartCount
    },
    podStatusColor: function (): string {
      switch (this.podStatusActual) {
        case 'Pending':
          return 'orange'
        case 'Running':
          return 'green'
        case 'Succeeded':
          return 'purple'
        case 'Failed':
          return 'red'
        case 'Unknown':
          return 'indigo'
      }
      return 'yellow'
    },
    podStatusMessage: function (pod: V1Pod): string {
      let phase = this.podStatusActual
      if (pod.status?.reason) {
        phase = pod.status?.reason
        return phase
      }

      if (phase === 'Pending') {
        const status_item = pod.status
        if (status_item?.initContainerStatuses) {
          const numInit = status_item.initContainerStatuses.length
          let startInit = 0
          for (const item of status_item.initContainerStatuses) {
            if (!item.ready) {
              phase = 'Init:' + startInit
              if (item.state) {
                if (item.state.waiting && item.state.waiting.reason) {
                  return phase + '(' + item.state.waiting.reason + ')'
                }
                if (item.state.terminated) {
                  return 'Terminating'
                }
              }
              return phase + '/' + numInit
            }
            startInit++
          }
        }

        if (status_item?.containerStatuses) {
          for (const item of status_item.containerStatuses) {
            if (!item.ready) {
              if (item.state && item.state.waiting && item.state.waiting.reason) {
                return item.state.waiting.reason
              }
              if (item.state && item.state.terminated) {
                phase = 'Terminating'
                if (item.state.terminated.reason) {
                  phase = phase + '(' + item.state.terminated.reason + ')'
                }
                return phase
              }
            }
          }
        }
      }

      return phase ?? 'Unknown'
    },

    podStatusActual: function (): string {
      return this.pod.status?.phase ?? 'Unknown'
    },
  },

  data() {
    return {}
  },
})
</script>
