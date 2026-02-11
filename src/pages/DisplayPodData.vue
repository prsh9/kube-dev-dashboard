<template>
  <BasePage>
    <q-table
      title="Pods"
      :rows="rows"
      :filter="filter"
      :columns="columns"
      :row-key="getPodUid"
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
        <q-btn outline flat dense icon="mdi-refresh" @click="registerPodWatcher" />
      </template>

      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="name" :props="props">
            {{ props.cols[0].value }}
          </q-td>

          <q-td key="containers" :props="props" class="min_w_h">
            <PodContainerStatus :pod="props.row" />
          </q-td>

          <q-td key="status" :props="props">
            <PodStatus :pod="props.row" />
          </q-td>

          <q-td key="podIP" :props="props">
            {{ props.cols[3].value }}
          </q-td>

          <q-td key="age" :props="props">
            <AgeDisplay
              :display-value="props.cols[4].value"
              :timestamp="props.row.status.startTime"
            />
          </q-td>

          <q-td key="actions" :props="props">
            <q-btn
              size="md"
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
              <q-btn size="sm" flat dense icon="mdi-delete" @click="actionDelete(props.row)" />
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
import PodContainerStatus from 'components/PodContainerStatus.vue'
import PodStatus from 'components/PodStatus.vue'
import { useK8DataStore } from 'src/stores/k8-data-store'
import { mapActions, mapState } from 'pinia'
import type { V1Pod } from '@kubernetes/client-node'
import { getKey } from 'src/scripts/k8s-helpers'
import { shortEnglishHumanizer } from 'src/scripts/date-helpers'
import AgeDisplay from 'components/AgeDisplay.vue'

export default defineComponent({
  name: 'DisplayPodData',

  components: {
    AgeDisplay,
    BasePage,
    PodContainerStatus,
    PodStatus,
  },

  created() {
    console.log('DisplayPodData created')
    this.initializePodCallbacks()
  },

  activated() {
    console.log('DisplayPodData activated')
    if (this.shouldRefreshPods) {
      this.registerPodWatcher()
    }
  },

  methods: {
    ...mapActions(useK8DataStore, ['registerPodWatcher', 'initializePodCallbacks', 'deletePod']),
    getPodUid(pod: V1Pod): string {
      return getKey(pod.metadata)
    },
    actionDelete(pod: V1Pod) {
      this.deletePod(this.getPodUid(pod))
        .then(() => {
          this.$q.notify({
            message: `Pod ${pod.metadata?.name} deleted`,
            type: 'info',
          })
        })
        .catch((err) => {
          this.$q.notify({
            message: `Error deleting pod ${pod.metadata?.name}: ${err}`,
            type: 'warning',
          })
        })
    },
  },

  computed: {
    ...mapState(useK8DataStore, [
      'getAllPodItems',
      'selectedNamespace',
      'status',
      'message',
      'shouldRefreshPods',
    ]),
    rows() {
      return this.getAllPodItems
    },
  },

  data() {
    return {
      columns: [
        {
          name: 'name',
          label: 'Pod Name',
          field: (r: V1Pod) => r?.metadata?.name,
          align: 'left' as const,
        },
        {
          name: 'containers',
          label: 'Containers',
          field: (r: V1Pod) => r,
          align: 'center' as const,
        },
        { name: 'status', label: 'Status', field: (r: V1Pod) => r, align: 'center' as const },
        {
          name: 'podIP',
          label: 'Pod IP',
          field: (r: V1Pod) => r.status?.podIP,
          align: 'center' as const,
        },
        {
          name: 'age',
          label: 'Age',
          field: (r: V1Pod) => r.status?.startTime,
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

.min_w_h {
  min-width: 130px;
  display: flex;
  align-items: center;
  flex-direction: row;
}
</style>
