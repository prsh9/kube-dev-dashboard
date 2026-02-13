<script lang="ts">
export default {
  name: 'TableSearchBox',
  props: ['modelValue'],
  emits: ['update:modelValue'],
  computed: {
    value: {
      get() {
        return this.modelValue
      },
      set(value: string | null) {
        this.$emit('update:modelValue', value)
      },
    },
  },
}
</script>

<template>
  <q-input type="search" dense debounce="300" v-model="value" placeholder="Search">
    <template v-slot:append>
      <q-icon size="xs" v-if="value" name="mdi-close-circle" @click.stop.prevent="value = null" />
      <q-icon size="xs" v-else name="mdi-filter" />
    </template>
  </q-input>
</template>
