<template>
    <v-app>
        <MainAppBar/>
        <MainBottomAppBar/>
        <v-content  class="background">
            <router-view
             class="pa-3 mx-auto"

             style="max-width:1200px; min-height:100%"></router-view>
        </v-content>
        <Footer  style="margin-bottom:84px;"/>

        <v-dialog v-model="showDialog" max-width="500px" persistent>
          <v-form v-model="valid" ref="form" @submit.prevent="validate">
            <v-card>
              <v-card-title>
                <span class="headline">Pilih Retail</span>
              </v-card-title>
              <v-divider></v-divider>

              <v-card-text class="pa-5">

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

                <label>Lokasi (<b><i>Klik Salah Satu Blimart</i></b>)</label>
                <div id="map"></div>

                <v-expand-transition>
                  <v-card v-if="object.name" outlined class="mt-6" >
                    <v-cart-text>
                      <v-row>
                        <v-col cols="auto">
                          <v-img src="/favicon.png" width="75" height="75"></v-img>
                        </v-col>
                        <v-col cols="auto">
                          <div class="subtitle-1 font-weight-bold">{{object.name}}</div>
                          <div class="text--secondary">Latitude : <b>{{object.y}}</b></div>
                          <div class="text--secondary">longitude: <b> {{object.x}}</b></div>
                        </v-col>
                      </v-row>
                    </v-cart-text>
                  </v-card>
                </v-expand-transition>


              </v-card-text>
              <v-divider></v-divider>

              <v-card-actions class="px-4 py-2">
                <v-spacer></v-spacer>
                <v-btn
                  id="save"
                  color="secondary"
                  :disabled="!valid"
                  @click="save"
                  :loading="isLoading"
                  type="submit"
                >Simpan</v-btn>
              </v-card-actions>
            </v-card>
          </v-form>
        </v-dialog>
    </v-app>
</template>
<style lang="css" scoped>

#map {
  height: 300px;
}
</style>
<script>
import { mapGetters, mapActions } from 'vuex';
import MainAppBar from './MainAppBar.vue';
import MainBottomAppBar from './MainBottomAppBar.vue';
import Footer from './Footer.vue';

/* eslint-disable no-undef */
export default {
  components: {
    MainAppBar,
    MainBottomAppBar,
    Footer,
  },
  data() {
    return {

      map: null,
      myPos: null,
      showDialog: false,
      valid: false,
      isLoading: false,
      object: {},
      rules: {
        coordinate: [() => (!!this.object.x && !!this.object.y) || 'Koordinat tidak boleh kosong'],
      },
    };
  },
  methods: {
    save() {
      this.setRetail(this.object.id);
    },
    validate() {
      return this.$refs.form.validate();
    },
    ...mapGetters('products', ['blimartId']),
    ...mapActions('products', ['setRetail']),
    ...mapActions('retails', ['getRetails']),
    onClickMarker(item) {
      this.object = item;
    },
  },
  created() {
    if (!this.blimartId()) {
      this.showDialog = true;

      const script = document.createElement('script');

      script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAyoVGwS7yqbW6JYUOVSWtHlnBcO69C3ZE&callback=initMap&libraries=&v=weekly&libraries=geometry';
      script.defer = true;

      window.initMap = () => {
        this.map = new google.maps.Map(document.getElementById('map'), {
          center: { lat: -6.2295712, lng: 106.7594781 },
          zoom: 8,
        });
        this.polyLine = new google.maps.Polyline();

        const infoWindow = new google.maps.InfoWindow();

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((position) => {
            this.myPos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };

            infoWindow.setPosition(this.myPos);
            infoWindow.setContent('<b class="black--text">Your Location.</b>');
            infoWindow.open(this.map);

            // eslint-disable-next-line no-new
            new google.maps.Marker({
              position: this.myPos,
              map: this.map,
              label: 'You',
            });

            this.map.setZoom(15);
            this.map.setCenter(this.myPos);
          }, () => {
            // this.handleLocationError(true, this.map.getCenter());
          });
        }
        this.getRetails().then((res) => {
          res.data.data.forEach((element) => {
            // eslint-disable-next-line no-new
            const marker = new google.maps.Marker({
              position: { lat: element.y, lng: element.x },
              icon: {
                scaledSize: new google.maps.Size(30, 30),
                url: '/favicon.ico',
                labelOrigin: new google.maps.Point(15, -5),
              },
              map: this.map,
              title: element.name,
              label: {
                color: '#0193d9',
                fontWeight: '700',
                text: element.name,
              },
            });
            marker.addListener('click', () => {
              this.map.setZoom(15);
              this.map.panTo(marker.getPosition());
              this.onClickMarker(element);
            });
          });
        });
      };


      document.head.appendChild(script);
    }
  },

};
</script>
