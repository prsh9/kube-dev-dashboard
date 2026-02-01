<template>
  <router-view />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useK8DataStore } from 'src/stores/k8-data-store';
import { mapState } from 'pinia';

export default defineComponent({
  name: 'App',

  created() {
    console.log("App created");
    this.initApp().catch((error) => {
      console.error("Initialization error:", error);
    });
  },

  computed: {
    ...mapState(useK8DataStore, ['initSuccess']),
  },

  methods: {
    async initApp() {
      try {
        const response = await window.kube.initialize();
        console.log("Kube initialized:", response);
        if (!response) {
          await this.$router.push('/error-init');
        }
      } catch {
        await this.$router.push('/error-init');
      }
    }
  }
});

</script>
