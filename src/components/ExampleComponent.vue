<template>
  <div>
    <p>{{ title }}</p>
    <ul>
      <li v-for="todo in todos" :key="todo.id" @click="increment">
        {{ todo.id }} - {{ todo.content }}
      </li>
    </ul>
    <p>Count: {{ todoCount }} / {{ meta.totalCount }}</p>
    <p>Active: {{ active ? 'yes' : 'no' }}</p>
    <p>Clicks on todos: {{ clickCount }}</p>
    <!-- <p>Check Data {{ podData }}</p> -->
    <ul>
      <li v-for="p in getAllPodItems as any" :key="p.metadata.uid">
        {{ p.metadata.name }}
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import type { Todo, Meta } from './models';
import { useK8DataStore } from 'src/stores/k8-data-store';
import { mapState } from 'pinia';

export default defineComponent({
  name: 'ExampleComponent',

  props: {
    title: {
      type: String,
      required: true
    },
    todos: {
      type: Array as PropType<Todo[]>,
      default: () => [] as Todo[]
    },
    meta: {
      type: Object as PropType<Meta>,
      required: true
    },
    active: {
      type: Boolean
    }
  },

  data(): { clickCount: number, podData: string } {
    return {
      clickCount: 0,
      podData: "running"
    };
  },

  methods: {
    increment(): void {
      this.clickCount += 1;
    },
  },

  computed: {
    todoCount(): number {
      return this.todos.length;
    },
    ...mapState(useK8DataStore, ['getAllPodItems'])
  }
});
</script>
