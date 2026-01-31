<template>
  <BasePage>
    <q-table title="Namespaces" :rows="rows" :columns="columns" :row-key="getNamespaceUid" :filter="filter"
      class="my-sticky-header-table fit flex-grow col overflow-auto" :pagination="pagination" hide-pagination
      hide-selected-banner selection="single" v-model:selected="selected">

      <template v-slot:top-right>
        <q-input dense clearable debounce="300" v-model="filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="mdi-filter" />
          </template>
        </q-input>
        <q-btn outline flat dense @click="refreshNamespace" icon="mdi-refresh" />
      </template>

      <template v-slot:header="props">
        <q-tr :class="props.__trClass" :props="props">
          <q-th v-for="name in props.colsMap" :key="name.label">
            {{ name.label }}
          </q-th>
        </q-tr>
      </template>

      <template v-slot:body="props">
        <q-tr class="cursor-pointer my-row" :props="props">
          <q-td key="current" class="cursor-pointer" :props="props">
            <q-icon size="xs" :name="selectedNamespace == props.row.metadata?.name ? 'mdi-check-circle-outline' : ''"
              @click="null" />
          </q-td>

          <q-td key="name" :props="props">
            {{ props.row.metadata?.name }}
          </q-td>

          <q-td key="age" :props="props">
            {{ props.colsMap["age"].format(props.row.metadata?.creationTimestamp) }}
            <q-tooltip :offset="[0, 10]">
              {{ new Date(props.row.metadata.creationTimestamp).toString() }}
            </q-tooltip>
          </q-td>

          <q-td key="action" :props="props" @mouseenter="showAction = true" @mouseleave="showAction = false">
            <q-btn class="delete-btn" flat dense @click="applyNamespace(props.row)"
              :label="props.row.metadata?.name == selectedNamespace ? 'Selected' : 'Select'">
            </q-btn>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </BasePage>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useK8DataStore } from 'src/stores/k8-data-store';
import { mapActions, mapState } from 'pinia';
import type { V1Namespace } from '@kubernetes/client-node';
import { getKey } from 'src/scripts/k8s-helpers';
import { shortEnglishHumanizer } from 'src/scripts/date-helpers';
import BasePage from 'src/pages/BasePage.vue';

export default defineComponent({
  name: 'DisplayNamespaceData',

  components: {
    BasePage
  },

  created() {
  },

  activated() {
    console.log("DisplayNamespace activated");
    if (this.shouldRefreshNamespaces) {
      this.refreshNamespace();
    }
    if (!this.refreshTimer) {
      this.refreshTimer = setTimeout(() => {
        this.setRefreshNamespaces(true);
        this.refreshTimer = null;
      }, 60000);
    }
  },

  methods: {
    ...mapActions(useK8DataStore, ['fetchNamespaces', 'setRefreshNamespaces', 'applyNamespaceSelection']),
    getNamespaceUid(ns: V1Namespace): string {
      return getKey(ns.metadata);
    },
    refreshNamespace() {
      console.log("Refreshing namespaces...");
      this.filter = "";
      this.fetchNamespaces().then(() => {
        this.selected = [];
        this.selectionChanged = false;
        this.rows.forEach((row: V1Namespace) => {
          if (this.selectedNamespace == row.metadata?.name) {
            this.selected.push(row);
          }
        })
        this.setRefreshNamespaces(false);
      }).catch((err) => {
        console.log("Error: ", err);
      });

    },
    applyNamespace(row: V1Namespace) {
      console.log("Applying namespace: ", row.metadata?.name);
      if (row.metadata?.name) {
        this.applyNamespaceSelection(row.metadata?.name);
      }
    },
  },

  computed: {
    ...mapState(useK8DataStore, ['getAllNamespaceItems', 'status', 'message', 'selectedNamespace', 'shouldRefreshNamespaces']),
    rows() {
      return this.getAllNamespaceItems;
    },
  },

  data() {
    return {
      columns: [
        {
          name: "current", label: "Current", field: (r: V1Namespace) => r?.metadata?.name, align: "center" as const
        },
        {
          name: "name", label: "Namespace", field: (r: V1Namespace) => r?.metadata?.name, align: "left" as const
        },
        {
          name: "age", label: "Age", field: (r: V1Namespace) => r.metadata?.creationTimestamp, align: "center" as const,
          format: (val: string) => {
            return shortEnglishHumanizer(Date.now() - Date.parse(val), { spacer: "", largest: 2, round: true, delimiter: "", serialComma: false });
          }
        },
        {
          name: "action", label: "Action", field: () => null, align: "center" as const
        }
      ],
      pagination: {
        sortBy: "name",
        rowsPerPage: 0
      },
      showAction: false,
      selectionChanged: false,
      selected: [] as V1Namespace[],
      filter: "",
      refreshTimer: null as NodeJS.Timeout | null
    };
  }
});
</script>

<style lang="scss">
.my-row .delete-btn {
  visibility: hidden;
  transition: opacity 0.2s ease;
}

.my-row:hover .delete-btn {
  visibility: visible;
}

.my-sticky-header-table {
  /* height or max-height is important */
  max-height: 50%;

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th {
    /* bg color is important for th; just specify one */
    background-color: $background;
  }

  thead tr th {
    position: sticky;
    z-index: 1;
  }

  thead tr:first-child th {
    top: 0;
  }

  /* this is when the loading indicator appears */
  &.q-table--loading thead tr:last-child th {
    /* height of all previous header rows */
    top: 48px;
  }

  /* prevent scrolling behind sticky top row on focus */
  tbody {
    /* height of all previous header rows */
    scroll-margin-top: 48px;
  }
}
</style>