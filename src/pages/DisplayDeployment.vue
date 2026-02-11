<template>
  <BasePage>
    <q-table
      title="Deployments"
      :rows="rows"
      :filter="filter"
      :columns="columns"
      :row-key="getUid"
      card-class="my-sticky-header-table fit flex-grow col overflow-auto"
      :pagination="pagination"
      hide-pagination
      hide-selected-banner
    >
      <template v-slot:top-right>
        <q-input dense clearable debounce="300" v-model="filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="mdi-filter" />
          </template>
        </q-input>
        <q-btn outline flat dense icon="mdi-refresh" @click="registerDeploymentWatcher" />
      </template>

      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="name" :props="props">
            {{ props.cols[0].value }}
          </q-td>

          <q-td key="replicas" :props="props" class="items-center">
            <DeploymentReplica :status="props.cols[1].value" />
          </q-td>

          <q-td key="image" :props="props" class="max_w">
            <DeploymentImage :deploymentData="props.cols[2].value" />
          </q-td>

          <q-td key="age" :props="props">
            <AgeDisplay
              :display-value="props.cols[3].value"
              :timestamp="props.colsMap['age'].field(props.row)"
            />
          </q-td>

          <q-td key="actions" :props="props">
            <q-btn
              size="xs"
              flat
              dense
              @click="props.expand = !props.expand"
              :icon="props.expand ? 'mdi-chevron-double-up' : 'mdi-chevron-double-down'"
            />
          </q-td>
        </q-tr>
        <q-tr v-show="props.expand" :props="props">
          <q-td colspan="100%" class="bg-grey-2">
            <div class="text-left flex">
              <span>{{ props.row.metadata.namespace }} : {{ props.row.metadata.name }}</span>
              <q-space />
              <q-btn size="sm" flat dense icon="mdi-delete" />
              <q-space />
            </div>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </BasePage>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BasePage from 'src/pages/BasePage.vue'
import { useK8DataStore } from 'src/stores/k8-data-store'
import { mapActions, mapState } from 'pinia'
import type { V1Deployment } from '@kubernetes/client-node'
import { getKey } from 'src/scripts/k8s-helpers'
import { shortEnglishHumanizer } from 'src/scripts/date-helpers'
import AgeDisplay from 'components/AgeDisplay.vue'
import DeploymentReplica from 'components/DeploymentReplicas.vue'
import DeploymentImage from 'components/DeploymentImage.vue'

export default defineComponent({
  name: 'DisplayDeployment',

  components: {
    DeploymentImage,
    DeploymentReplica,
    AgeDisplay,
    BasePage,
  },

  created() {
    console.log('DisplayDeployment created')
    this.initializeDeploymentCallbacks()
  },

  activated() {
    console.log('DisplayDeployment activated')
    if (this.shouldRefreshDeployments) {
      this.registerDeploymentWatcher()
    }
  },

  methods: {
    ...mapActions(useK8DataStore, ['registerDeploymentWatcher', 'initializeDeploymentCallbacks']),
    getUid(item: V1Deployment): string {
      return getKey(item.metadata)
    },
  },

  computed: {
    ...mapState(useK8DataStore, [
      'getAllDeploymentItems',
      'selectedNamespace',
      'status',
      'message',
      'shouldRefreshDeployments',
    ]),
    rows() {
      return this.getAllDeploymentItems
    },
  },

  data() {
    return {
      columns: [
        {
          name: 'name',
          label: 'Deployment Name',
          field: (r: V1Deployment) => r?.metadata?.name,
          align: 'left' as const,
        },
        {
          name: 'replicas',
          label: 'Replicas',
          field: (r: V1Deployment) => r.status,
          align: 'center' as const,
        },
        {
          name: 'image',
          label: 'Image',
          field: (r: V1Deployment) => r,
          align: 'center' as const,
        },
        {
          name: 'age',
          label: 'Age',
          field: (r: V1Deployment) => r.metadata?.creationTimestamp,
          align: 'center' as const,
          format: (val: string) => {
            return shortEnglishHumanizer(Date.now() - Date.parse(val), {
              spacer: '',
              largest: 2,
              round: true,
              delimiter: '',
              serialComma: false,
            })
          },
        },
        { name: 'actions', label: 'Actions', field: () => 'Actions', align: 'center' as const },
      ],
      pagination: {
        sortBy: 'name',
        rowsPerPage: 0,
      },
      filter: '',
    }
  },
})
</script>

<style lang="scss">
// $

.max_image_w {
  max-width: 230px;
}
</style>
