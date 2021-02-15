<template>
<div  tag="section">
    <div id="map"></div>


</div>

</template>
<style scoped>
  #map {
    height: 700px;
  }

</style>

<script>
import { mapActions } from 'vuex';
// @ is an alias to /src
/* eslint-disable no-undef */
export default {

  name: 'Experiment',
  components: {},
  data() {
    return {
      map: null,
      myPos: null,
      polyLine: null,
    };
  },
  watch: {
  },
  computed: {
    listC() {
      return this.products();
    },
    totalItemC() {
      return this.listC.length;
    },
  },
  created() {
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
            this.onClickMarker(marker);
          });
        });
      });
    };


    document.head.appendChild(script);
  },
  methods: {
    ...mapActions('map', ['getRoute']),
    ...mapActions('retails', ['getRetails']),
    onClickMarker(marker) {
      this.getRoute({
        origin: this.myPos,
        destination: { lat: marker.getPosition().lat(), lng: marker.getPosition().lng() },
      }).then((res) => {
        const { data } = res;
        const { northeast, southwest } = data.routes[0].bounds;

        const sw = new google.maps.LatLng(southwest.lat, southwest.lng);

        const ne = new google.maps.LatLng(northeast.lat, northeast.lng);

        data.routes[0].bounds = new google.maps.LatLngBounds(sw, ne);


        const paths = google
          .maps.geometry.encoding.decodePath(data.routes[0].overview_polyline.points);
        this.polyLine.setOptions({
          path: paths,
          map: this.map,
          strokeColor: '#6495ED',
          strokeWeight: 8,
        });
        this.map.setZoom(14);
      });
    },
  },
};
</script>
