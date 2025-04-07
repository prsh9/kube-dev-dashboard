<template>
  <q-layout view="hHh lpR fFf">
    <q-header bordered class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title>
          <q-avatar>
            <img src="https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg">
          </q-avatar>
          Kube Dev Dashboard
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer model-value :mini="mini" side="left" behavior="desktop" bordered>
      <!-- <q-scroll-area class="fit"> -->
      <q-list padding>
        <NavDrawer v-for="link in linksList" :key="link.title" v-bind="link" />
      </q-list>
      <!-- </q-scroll-area> -->
      <div class="absolute" style="bottom: 25px; right: -17px">
        <q-btn dense round color="secondary" :icon="mini ? 'mdi-chevron-double-right' : 'mdi-chevron-double-left'"
          @click="toggleLeftDrawer" />
      </div>
    </q-drawer>

    <q-page-container class="main-container">
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </q-page-container>

    <q-footer bordered class="bg-primary text-white">
      <q-toolbar inset>
        <q-space />
        <q-separator vertical />
        <q-btn no-caps flat unelevated square stretch>{{ selectedNamespace }}</q-btn>
        <q-separator vertical />
      </q-toolbar>

    </q-footer>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mapActions, mapState } from 'pinia';
import { useK8DataStore } from 'src/stores/k8-data-store';
import NavDrawer, { type NavDrawerProps } from 'components/NavDrawer.vue';

const linksList: NavDrawerProps[] = [
  { icon: "mdi-vector-arrange-below", title: "Namespaces", link: "/namespace" },
  { icon: "mdi-hexagon-multiple", title: "Deployments", link: "/deployment" },
  { icon: "mdi-cube-outline", title: "Pods", link: "/pod" },
  { icon: "mdi-cogs", title: "Services", link: "/svc" },
  { icon: "mdi-math-log", title: "Log Group", link: "/log" },
  { icon: "mdi-console", title: "Console Group", link: "/console" },
];

export default defineComponent({
  name: 'MainLayout',

  components: {
    NavDrawer
  },

  created() {
    this.initializeDefaultCallbacks();
  },

  data() {
    return {
      linksList,
      mini: true
    }
  },

  computed: {
    ...mapState(useK8DataStore, ['selectedNamespace']),
  },

  methods: {
    ...mapActions(useK8DataStore, ['initializeDefaultCallbacks']),
    toggleLeftDrawer() {
      this.mini = !this.mini;
    }
  }
});

</script>

<style>
.main-container {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  height: 100%;
  /* min-height: 200px; */
  max-height: 100vh;
}
</style>