<template>
  <q-item clickable :to="link" active-class="text-accent">
    <q-item-section v-if="icon" avatar>
      <q-icon :name="icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export interface NavDrawerProps {
  title: string;
  link?: string;
  icon?: string;
};

export default defineComponent({
  name: 'NavDrawer',
  props: {
    title: {
      type: String,
      required: true
    },
    link: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: ''
    }
  }
});
</script>
