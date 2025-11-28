<template>
    <q-page class="row flex-center my-style-grow no-scroll">
        <slot></slot>
    </q-page>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'BasePage',

    created() {
        console.log("BasePage created");
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