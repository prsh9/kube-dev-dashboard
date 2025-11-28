<template>
    <q-layout class="row flex-center my-style-grow no-scroll">
        <div class="text-center">
            <q-icon name="mdi-alert-circle-outline" color="negative" size="50px" />
            <div class="text-h6 text-negative">Failed to initialize Kubernetes client.</div>
            <div>Please check your kubeconfig and try again.</div>
        </div>
    </q-layout>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'ErrorLayout',

    created() {
        console.log("Error Layout created");
    },
});
</script>

<style lang="css">
.my-style-grow {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    height: 100%;
    max-height: 80vh;
}

.no-scroll {
    overflow: hidden;
}
</style>