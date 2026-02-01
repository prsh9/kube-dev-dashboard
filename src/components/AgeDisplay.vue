<template>
  {{ displayValue }}
  <q-tooltip :offset="[0, 10]">
    {{ new Date(timestamp).toString() }}
  </q-tooltip>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AgeDisplay',

  props: {
    displayValue: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
    },
  },

  components: {},

  computed: {},

  data() {
    return {}
  },
})
</script>
