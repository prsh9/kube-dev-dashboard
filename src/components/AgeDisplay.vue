<template>
  {{ displayValue }}
  <q-tooltip :offset="[0, 10]">
    {{ toolTipValue }}
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
      type: [Date, String],
    },
  },

  components: {},

  computed: {
    toolTipValue: function () {
      let data: string | Date = ''
      if (this.timestamp) {
        data = this.timestamp
      }
      return new Date(data).toString()
    },
  },

  data() {
    return {}
  },
})
</script>
