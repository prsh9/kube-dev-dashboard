<template>
  <q-chip
    outline
    clickable
    size="md"
    color="primary"
    icon="mdi-ship-wheel"
    @click="copyImageValue(fullImageUri)"
  >
    <span class="ellipsis">
      {{ truncatedImage }}
    </span>
    <q-tooltip anchor="top middle" self="bottom middle">
      {{ fullImageUri }}
      <div class="text-caption text-italic">(Click to copy full URI)</div>
    </q-tooltip>
  </q-chip>
</template>

<script setup lang="ts">
import { type V1Deployment } from '@kubernetes/client-node'
import { copyToClipboard, useQuasar } from 'quasar'
import { computed, type PropType } from 'vue'

const props = defineProps({
  deploymentData: {
    type: Object as PropType<V1Deployment>,
    required: true,
  },
})

const $q = useQuasar()

const fullImageUri = computed(() => {
  const baseContainer = props.deploymentData.spec?.template?.spec?.containers?.at(0)
  return baseContainer?.image || ''
})

// Extracts 'name:tag' from 'registry.io/namespace/name:tag'
const truncatedImage = computed(() => {
  return fullImageUri.value.split('/').pop()
})

const copyImageValue = (text: string) => {
  copyToClipboard(text)
    .then(() => $q.notify({ message: 'Image URI Copied!', color: 'positive', timeout: 1000 }))
    .catch(() =>
      $q.notify({ message: 'Failure in copying Image URI!', color: 'negative', timeout: 1000 }),
    )
}
</script>
