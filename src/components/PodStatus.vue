<template>
  <q-chip outline ripple size="md" :color="podStatusColor" :label="podStatusMessage" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import type { V1Pod } from '@kubernetes/client-node'

export default defineComponent({
  name: 'PodStatus',

  props: {
    pod: {
      type: Object as PropType<V1Pod>,
      required: true,
    },
  },

  components: {},

  computed: {
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
    podStatusMessage: function (): string {
      let phase = this.podStatusActual
      if (this.pod.status?.reason) {
        phase = this.pod.status?.reason
        return phase
      }

      if (phase === 'Pending') {
        const status_item = this.pod.status
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
