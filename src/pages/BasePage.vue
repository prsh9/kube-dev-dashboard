<template>
    <q-page class="row items-stretch justify-center" :style-fn="stylefn">
        <div v-show="status" outlined class="col items-stretch check">
            <slot></slot>
        </div>
        <div v-if="!status" class="row justify-center items-center">
            {{ message }}
        </div>
    </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useK8DataStore } from 'src/stores/k8-data-store';
import { mapState } from 'pinia';

export default defineComponent({
    name: 'BasePage',

    methods: {
        stylefn() {
            return {
                height: "100%",
                width: "100%",
                maxWidth: "100%",
                maxHeight: "100%",
                overflow: "auto",
            };
        }
    },

    computed: {
        ...mapState(useK8DataStore, ['status', 'message']),
    },
});
</script>

<style>
.check {
    max-height: 100%;
}
</style>