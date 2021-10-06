<template>
  <v-container>
    <v-row>
      <v-col>
        <v-list shaped>
          <v-subheader>Liste des assos</v-subheader>
          <v-list-item-group color="primary">
            <v-list-item
              v-for="(asso, i) in assos"
              :key="i"
              color="primary"
              @click="selectAsso(asso)"
            >
              <v-list-item-content>
                <v-list-item-title v-text="asso.name"></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-col>
      <v-col>
        <v-container v-if="selectedAssoMembers">
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Rechercher"
            single-line
            hide-details
          ></v-text-field>
          <v-data-table
            :headers="headers"
            :items="selectedAssoMembers"
            :search="search"
            sort-by="hasReservationRight"
          >
            <template v-slot:item.hasReservationRight="{ item }">
              <v-switch
                v-model="item.hasReservationRight"
                :loading="item.loading"
                inset
                @change="toggleReservationRight(item)"
              ></v-switch>
            </template>
          </v-data-table>
        </v-container>
        <v-container v-else>
          Sélectionner une asso
        </v-container>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'Admin',
  middleware: ['authRequired'],
  head() {
    return {
      title: 'Admin'
    }
  },
  data() {
    return {
      assos: [],
      selectedAsso: null,

      // Members datatable
      headers: [
        { text: 'Nom', value: 'displayName' },
        {
          text: "Droit de réserver au nom de l'asso",
          value: 'hasReservationRight',
          filterable: false
        }
      ],
      selectedAssoMembers: null,
      search: ''
    }
  },
  mounted() {
    this.$axios
      .get('/assos')
      .then(({ data }) => {
        this.assos = data.sort((a, b) => (a.name > b.name ? 1 : -1))
      })
      .catch((err) => {
        console.error(err)
      })
  },
  methods: {
    selectAsso(asso) {
      this.selectedAsso = asso
      this.$axios
        .get(`/assos/${asso.id}/members`)
        .then(({ data }) => {
          this.selectedAssoMembers = data.map((m) => ({ ...m, loading: false }))
        })
        .catch((err) => console.error(err))
    },
    toggleReservationRight(user) {
      user.loading = 'info'
      this.$axios
        .patch(`./assos/${this.selectedAsso.id}/members/${user.id}`, {
          hasReservationRight: user.hasReservationRight
        })
        .then((res) => {
          user.loading = null
          user.hasReservationRight = res.data.hasReservationRight
        })
    }
  }
}
</script>
