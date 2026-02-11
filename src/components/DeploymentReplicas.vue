<template>
  <q-chip dense ripple square :color="determineReadinessColor + '-4'">
    <span class="text-caption">
      {{ deploymentReplicas }}
    </span>
  </q-chip>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import type { V1DeploymentStatus } from '@kubernetes/client-node'

export default defineComponent({
  name: 'DeploymentReplica',

  props: {
    status: {
      type: Object as PropType<V1DeploymentStatus>,
      required: true,
    },
  },

  components: {},

  computed: {
    readyReplicas: function () {
      return this.status.readyReplicas || 0
    },
    totalReplicas: function () {
      return this.status.replicas || 0
    },
    determineReadinessColor: function () {
      if (this.readyReplicas == this.totalReplicas) {
        if (this.readyReplicas == 0) {
          return 'light-blue'
        }
        return 'green'
      } else if (this.readyReplicas > 0) {
        return 'orange'
      }
      return 'red'
    },
    deploymentReplicas: function () {
      const replicas = this.totalReplicas
      const ready = this.readyReplicas
      return ready + ' / ' + replicas
    },
  },

  data() {
    return {}
  },
})
</script>
