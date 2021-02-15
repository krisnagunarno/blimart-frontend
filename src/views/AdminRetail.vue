
<template>
  <v-container style="min-height:100%" v-resize="resize" fluid>
    <v-data-table
      :headers="headers"
      :items="filteredItem"
      :search="filter"
      class="elevation-2 px-2"
      :height="tableHeight"
      v-if="$mq!=='xs'"
      :items-per-page="mobileOption.itemsPerPage"
      :options.sync="option"
      :footer-props="{
        'items-per-page-options': [10, 15, 25, 50, 100]
      }"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Retail</v-toolbar-title>
          <v-btn icon :loading="isLoading" @click="pagination(option)" class="ml-4">
            <v-icon small>fa-sync</v-icon>
          </v-btn>
          <v-text-field
            v-model="filter"
            outlined
            dense
            color="secondary"
            label="Filter"
            filled
            single-line
            hide-details
            prepend-inner-icon="small fas fa-filter"
            class="ml-6 small-icon"
            style="max-width:200px"
          ></v-text-field>

          <v-spacer></v-spacer>
          <!-- <v-scale-transition origin="center center">
            <v-btn
              v-show="isSelectedComputed"
              color="error"
              class="mr-2"
              @click="deleteMultipleCall"
            >
              <v-icon small left>fa-trash</v-icon>
              Hapus ({{ selected.length }})
            </v-btn>
          </v-scale-transition>-->
        </v-toolbar>
      </template>
      <template v-slot:item.updatedDate="{ item }">
        <div class="py-2">
          <div>
            <v-icon small>far fa-clock</v-icon>
            <span class="mx-2 font-weight-normal">{{ item.updatedDate | time}}</span>
            <b class="font-weight-black">WIB</b>
          </div>
          <div class="font-weight-medium grey--text caption">{{ item.updatedDate | date}}</div>
        </div>
      </template>
      <template v-slot:item.action="{ item }">
        <v-icon :id="'edit-'+item.id" small class="mr-2" @click="editItem(item)">
          fa-pencil-alt
        </v-icon>
        <v-icon :id="'delete-'+item.id" small @click="showDeleteDialog(item)">fa-trash-alt</v-icon>
      </template>
    </v-data-table>
    <div v-else>

      <v-app-bar fixed app :color="$vuetify.theme.dark ? '':'white'" flat>

        <v-toolbar-title >Retail</v-toolbar-title>
        <v-spacer></v-spacer>

        <div style="width:100px" class="input-field primary--text ml-2 subtitle-2 mt-1">
            <span class="font-weight-regular">Sort: </span>
            <select v-model="mobileOption.orderBy">
              <option value="asc" selected>a-Z</option>
              <option value="desc" selected>Z-a</option>
            </select>
            <label>
              <v-icon x-small color="primary" >fa-arrow-down</v-icon>
            </label>
        </div>
        <div style="width:100px" class="input-field primary--text ml-2 subtitle-2 mt-1">
            <select v-model="mobileOption.sortBy">
            <option v-for="(item, idx) in mobileOption.sortableFields"
              :value="item.field"
              :key="idx">
              {{item.name}}
            </option>
            </select>
            <label>
              <v-icon x-small color="primary" >fa-chevron-down</v-icon>
            </label>
        </div>
      </v-app-bar>
      <v-card class="mt-n3 mb-3 ml-n3 border-vertical"
          tile
          outlined
          style="min-width:100vw; position:sticky; top:56px; z-index:2">

        <v-card-text>
          <v-text-field
            v-model="mobileOption.filter"
            class="mx-4 super-dense"
            placeholder="Cari..."
            filled
            rounded
            hide-details
            dense
          >
          <template v-slot:prepend-inner>
            <v-icon x-small>fa-search</v-icon>
          </template>
          </v-text-field>
        </v-card-text>
      </v-card>
      <v-card
        :id="'card-'+retail.id"
        v-for="retail in filteredItem"
        :key="retail.id"
        elevation="5"
        ripple
        class="pa-2 mb-3"
        @click="showSheet(retail)">
        <v-card-title>

          <span class="font-weight-bold">{{retail.name}}</span>
        </v-card-title>
        <v-card-subtitle>


        <div class="text--secondary">Latitude : <b>{{retail.y}}</b></div>
        <div class="text--secondary">longitude: <b> {{retail.x}}</b></div>

        </v-card-subtitle>
      </v-card>
    </div>
    <div class="surface"
      style="width:100%;position:fixed; bottom:52px; left:0;border-width:1px;"
      v-if="$mq=='xs'">
      <v-card class="text-center py-2" tile flat outlined>
        <div style="position:absolute;"  class="input-field primary--text ml-2 subtitle-2 mt-1">
            <select v-model="mobileOption.itemsPerPage" @change="pageSizeChanged">
              <option v-for="(item, index) in mobileOption.itemsPerPageOption"
                :key="index"
                v-bind:value="item" selected>
                {{item}}
                </option>
            </select>
            <label> <v-icon x-small color="primary" class="mb-1">fa-chevron-up</v-icon></label>
        </div>
      </v-card>
    </div>

    <v-bottom-sheet v-model="sheet">
      <v-list>
        <v-subheader>Aksi</v-subheader>
        <v-list-item ripple @click="editItem(sheetSelected)">
          <v-list-item-icon>
            <v-icon>fa-pen</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Ubah</v-list-item-title>
        </v-list-item>
        <v-list-item ripple @click="showDeleteDialog(sheetSelected)">
          <v-list-item-icon>
            <v-icon>fa-trash</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Hapus</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-bottom-sheet>
    <v-btn id="addBtn" fab large bottom color="error" fixed right style="margin-bottom: 64px"
      @click="addProductPrompt">
      <v-icon>fa-plus</v-icon>
    </v-btn>

    <v-dialog eager v-model="showDialog" max-width="500px" persistent>
      <v-form v-model="valid" ref="form" @submit.prevent="validate">
        <v-card>
          <v-card-title>
            <span class="headline">{{ formTitle }}</span>
          </v-card-title>
          <v-divider></v-divider>

          <v-card-text class="pt-4">
             <v-alert
              dense
              outlined
              v-for="(item, key, index) in errors"
              type="error"
              dismissible
              :key="index"
            >
              <strong>{{ key }}</strong> <span v-for="(i, idx) in item" :key="idx">{{i}}, </span>
            </v-alert>
            <v-text-field
              v-model="object.name"
              outlined
              :rules="rules.name"
              dense
              label="Nama Retail"
              class
              style
            ></v-text-field>
            <v-text-field
              v-show="false"
              v-model="object.x"
              outlined
              :rules="rules.coordinate"
              dense
              label="Koordinate"
              class
              style
            ></v-text-field>

            <label>Lokasi</label>
            <div id="map"></div>
          </v-card-text>
          <v-divider></v-divider>

          <v-card-actions class="px-4 py-2">
            <div v-if="editState >= 0">
              <v-icon small>fa-clock</v-icon>
              <span class="ml-2 caption">
                <span class="text--secondary">Dibuat:</span>
                <span class="font-weight-bold">{{ object.createdDate | date }}</span>
                - {{ object.createdBy }}
              </span>
            </div>
            <v-spacer></v-spacer>
            <v-btn
              color="secondary"
              :disabled="!valid"
              @click="save"
              :loading="isLoading"
              type="submit"
            >Simpan</v-btn>
            <v-btn
              color="secondary"
              outlined
              @click="close"
              :loading="isLoading"
              style
            >Batal</v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
    <v-dialog v-model="deleteDialog" max-width="290" persistent>
      <v-card>
        <v-card-title class="headline">Apakah Anda yakin?</v-card-title>

        <v-card-text>
          Apakah Anda yakin ingin menghapus item
          <b v-if="editState != -2">{{ object.name }}</b>
          <b v-else-if="selected[0]">{{ selected[0].name }}, ...</b>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn id="deleteConfirmBtn" color="error" text @click="deleteItem" :loading="isLoading">
            Yakin
          </v-btn>

          <v-btn color="secondary" text @click="close" :loading="isLoading">Batal</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<style>

  #map {
    height: 300px;
  }
</style>

<script>
import { mapActions, mapGetters } from 'vuex';
// @ is an alias to /src

export default {
  name: 'AdminRetail',
  components: {},
  data() {
    return {
      showDialog: false,
      sheet: false,
      formTitle: 'Retail',
      valid: false,
      rules: {
        name: [v => !!v || 'Nama tidak boleh kosong'],
        coordinate: [() => (!!this.object.x && !!this.object.y) || 'Koordinat tidak boleh kosong'],
      },
      isLoading: false,
      categoryLoading: false,
      deleteDialog: false,
      editState: -1,
      object: {},
      errors: [],
      sheetSelected: {},
      map: null,
      marker: null,
      headers: [
        {
          text: 'Nama',
          align: 'start',
          value: 'name',
        },
        {
          text: 'Longitude',
          value: 'x',
        },
        {
          text: 'Latitude',
          value: 'y',
        },
        { text: 'Diperbaharui oleh', value: 'updatedBy' },
        { text: 'Diperbaharui tanggal', value: 'updatedDate' },
        {
          text: 'Aksi', value: 'action', sortable: false, align: 'center',
        },
        // { text: 'Iron (%)', value: 'iron' },
        // { text: '', value: 'data-table-expand' },
      ],
      mobileOption: {
        sortBy: 'name',
        filter: '',
        orderBy: 'asc',
        sortableFields: [{
          field: 'name',
          name: 'Nama',
        }, {
          field: 'email',
          name: 'Email',
        }, {
          field: 'phone',
          name: 'Telepon',
        }],
        itemsPerPage: 10,
        itemsPerPageOption: [10, 15, 25, 50, 100],
      },
      filter: '',
      tableHeight: 400,
      option: { page: 1, itemsPerPage: 10 },
    };
  },
  watch: {
    option() {
      this.pagination(this.option);
    },
  },
  computed: {
    listC() {
      return this.retails();
    },
    totalItemC() {
      return this.listC.length;
    },
    filteredItem() {
      return this.retails()
        .filter(this.$options.filters.dynamicSearch(this.mobileOption.filter))
        .sort(this.mobileOption.orderBy === 'asc' ? this.$options.filters.dynamicSortA(this.mobileOption.sortBy) : this.$options.filters.dynamicSortD(this.mobileOption.sortBy));
    },
    pagingC() {
      return this.paging();
    },
  },
  methods: {
    resize() {
      this.tableHeight = window.innerHeight - 220;
    },
    ...mapActions('retails', ['pagination', 'addRetail', 'editRetail', 'deleteRetail']),
    ...mapGetters('retails', ['retails', 'paging']),
    showSheet(item) { this.sheetSelected = item; this.sheet = true; },
    paginationChanged(v) {
      const b = this.option;
      const buf = { ...b };
      buf.page = v;
      this.option = buf;
    },
    pageSizeChanged(v) {
      const b = this.option;
      const buf = { ...b };
      buf.itemsPerPage = v.target.value;
      this.option = buf;
    },
    close() {
      this.object = { };
      if (this.showDialog) {
        this.$refs.form.resetValidation();
      }
      this.showDialog = false;
      this.deleteDialog = false;
      this.retailSearch = null;
      this.errors = [];
      this.selectedImage = null;
      this.marker.setPosition(null);
      setTimeout(() => {
        this.editState = -1;
      }, 300);
    },
    editItem(item) {
      this.sheet = false;
      this.editState = this.listC.indexOf(item);
      this.object = { ...item };
      this.setMarkerPositionMap({ lat: item.y, lng: item.x });
      this.showDialog = true;
    },
    save() {
      this.isLoading = true;
      if (this.validate()) {
        if (this.editState >= 0) {
          this.editRetail({ index: this.editState, data: this.object }).then((res) => {
            if (res.data.code === 200) {
              this.$notify({
                group: 'notif',
                type: 'success',
                title: 'Tambah Retail',
                text: 'Berhasil mengubah retail',
              });
              this.close();
            }
          })
            .catch((err) => {
              const { data } = err.response;
              if (data.code === 400) {
                this.errors = data.errors;
              }
              this.$notify({
                group: 'notif',
                type: 'error',
                title: 'Tambah Retail',
                text: 'Gagal menambah retail',
              });
              this.isLoading = false;
            })
            .finally(() => {
              this.isLoading = false;
            });
        } else {
          this.addRetail(this.object).then(() => {
            this.close();
            this.$notify({
              group: 'notif',
              type: 'success',
              title: 'Ubah Retail',
              text: 'Berhasil mengubah retail',
            });
          })
            .catch((err) => {
              const { data } = err.response;
              if (data.code === 400) {
                this.errors = data.errors;
              }
              this.$notify({
                group: 'notif',
                type: 'error',
                title: 'Ubah Retail',
                text: 'Gagal mengubah retail',
              });
              this.isLoading = false;
            })
            .finally(() => {
              this.isLoading = false;
            });
        }
      }
    },
    deleteItem() {
      this.isLoading = true;
      this.sheet = false;
      this.deleteRetail({ index: this.deleteIndex, data: this.object }).then(() => {
        this.$notify({
          group: 'notif',
          type: 'success',
          title: 'Hapus Retail',
          text: 'Berhasil menghapus retail',
        });
        this.close();
      }).catch(() => {
        this.$notify({
          group: 'notif',
          type: 'error',
          title: 'Hapus Retail',
          text: 'Gagal menghapus retail',
        });
      }).finally(() => {
        this.isLoading = false;
      });
    },
    addProductPrompt() {
      this.object = {};
      this.editState = -1;
      this.showDialog = true;
    },
    showDeleteDialog(item) {
      this.deleteIndex = this.listC.indexOf(item);
      this.object = { ...item };
      this.deleteDialog = true;
    },
    validate() {
      return this.$refs.form.validate();
    },
    onMapClick(e) {
      const { latLng } = e;
      this.setMarkerPositionMap(latLng);
      this.object.y = latLng.lat();
      this.object.x = latLng.lng();
      this.valid = this.validate();
    },
    setMarkerPositionMap(latLng) {
      this.marker.setPosition(latLng);
      this.marker.setMap(this.map);
      this.map.panTo(latLng);
    },
  },
  created() {
    if (this.$mq === 'xs') {
      this.pagination(this.option);
    }
    /* eslint-disable no-undef */

    const script = document.createElement('script');

    script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAyoVGwS7yqbW6JYUOVSWtHlnBcO69C3ZE&callback=initMap&libraries=&v=weekly&libraries=geometry';
    script.defer = true;

    window.initMap = () => {
      this.map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: -6.2295712, lng: 106.7594781 },
        zoom: 16,
      });
      this.map.addListener('click', (e) => {
        this.onMapClick(e);
      });
      this.marker = new google.maps.Marker({
        position: { lat: -0.0182936, lng: 109.3424023 },
        icon: { scaledSize: new google.maps.Size(30, 30), url: '/favicon.ico' },
      });

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          // eslint-disable-next-line no-new
          new google.maps.Marker({
            position: pos,
            map: this.map,
            label: 'You',
          });

          this.map.setZoom(15);
          this.map.setCenter(pos);
        }, () => {
        // this.handleLocationError(true, this.map.getCenter());
        });
      } else {
      // Browser doesn't support Geolocation
      }
      // eslint-disable-next-line no-new
      // new google.maps.Marker({
      //   position: { lat: -0.0182936, lng: 109.3424023 },
      //   icon: { scaledSize: new google.maps.Size(30, 30), url: '/favicon.ico' },
      //   map: this.map,
      // }).addListener('click', () => {
      //       map.setZoom(8);
      //       map.setCenter(marker.getPosition() as google.maps.LatLng);

      //     });;
    };


    document.head.appendChild(script);
  },
};
</script>
