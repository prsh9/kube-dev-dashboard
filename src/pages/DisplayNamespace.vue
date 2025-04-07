<template>
  <BasePage>
    <!-- <q-page class="row items-stretch justify-center" :style-fn="stylefn"> -->
    <!-- <div v-show="status" outlined class="col items-stretch check"> -->
    <q-table title="Namespaces" :rows="rows" :columns="columns" :row-key="getNamespaceUid" :filter="filter"
      card-class="fit" :pagination="pagination" hide-pagination hide-selected-banner selection="single"
      v-model:selected="selected" @update:selected="onSelectionChanged">

      <template v-slot:top>
        <div class="q-table__title">Namespaces</div>
        <q-space />
        <q-input outlined dense debounce="500" v-model="filter">
          <template v-slot:append>
            <q-icon name="mdi-filter-outline" />
          </template>
        </q-input>
        <q-btn outline flat dense @click="refreshNamespace" icon="mdi-refresh" />
      </template>

      <template v-slot:body-selection="props">
        <q-td>
          <q-checkbox dense v-model="props.selected" />
        </q-td>
      </template>

      <template v-slot:body-cell-age="props">
        <q-td key="age" :props="props">
          {{ props.value }}
          <q-tooltip :offset="[0, 10]">
            {{ new Date(props.row.metadata.creationTimestamp).toString() }}
          </q-tooltip>
        </q-td>
      </template>
    </q-table>
    <q-card class="row q-pa-sm" style="position: sticky; bottom: 0; left: 0; right: 0;">
      <q-space />
      <q-btn no-caps ripple glossy color="accent" v-show="selectionChanged" @click="applyNamespace" label="Apply" />
    </q-card>
    <!-- </div> -->
    <!-- <div v-if="!status" class="row justify-center items-center"> -->
    <!-- {{ message }} -->
    <!-- </div> -->
    <!-- </q-page> -->
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

  beforeMount() {
    this.refreshNamespace();
  },

  methods: {
    ...mapActions(useK8DataStore, ['fetchNamespaces']),
    getNamespaceUid(ns: V1Namespace): string {
      return getKey(ns.metadata);
    },
    refreshNamespace() {
      this.fetchNamespaces().then(() => {
        this.selected = [];
        this.selectionChanged = false;
        this.rows.forEach((row: V1Namespace) => {
          console.log(this.selectedNamespace, " with row: ", row.metadata?.name);
          if (this.selectedNamespace == row.metadata?.name) {
            this.selected.push(row);
          }
        })
      }).catch((err) => {
        setTimeout(() => this.refreshNamespace(), 1000);
        console.log("Error: ", err);
      });

    },
    onSelectionChanged() {
      if (this.selected.length > 0 && this.selected[0]?.metadata?.name == this.selectedNamespace) {
        this.selectionChanged = false;
      } else {
        this.selectionChanged = true;
      }
    },
    applyNamespace() {
      // this.selectionChanged = false;
    },
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
    ...mapState(useK8DataStore, ['getAllNamespaceItems', 'status', 'message', 'selectedNamespace']),
    rows() {
      return this.getAllNamespaceItems;
    },
  },

  data() {
    return {
      columns: [
        {
          name: "name", label: "Namespace", field: (r: V1Namespace) => r?.metadata?.name, align: "left" as const
        },
        {
          name: "age", label: "Age", field: (r: V1Namespace) => r.metadata?.creationTimestamp, align: "center" as const,
          format: (val: string) => {
            return shortEnglishHumanizer(Date.now() - Date.parse(val), { spacer: "", largest: 2, round: true, delimiter: "", serialComma: false });
          }
        },
        // { name: "describe", label: "Describe", field: () => "Describe", align: "center" as const, }
      ],
      pagination: {
        sortBy: "name",
        rowsPerPage: 0
      },
      selectionChanged: false,
      selected: [] as V1Namespace[],
      filter: "",
    };
  }
});
</script>

<style>
.check {
  max-height: 100%;
}
</style>