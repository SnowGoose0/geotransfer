<script>
/* eslint-disable no-undef */
import User from "./components/User.vue";
import io from 'socket.io-client';
import { ref, onMounted, onBeforeMount } from 'vue'
import { Loader } from "@googlemaps/js-api-loader";

const GOOGLE_MAPS_API_KEY = 'AIzaSyDrA7hO41vHxBIxUewGFoGFJJQpYTsBiLA';

export default {
  setup() {
    const loader = new Loader({ apiKey : GOOGLE_MAPS_API_KEY })
    const mapDiv = ref(null);
    const users = ref([]);
    const socket = io("http://localhost:8080/");

    socket.on('user-update', (data) => {
      console.log(data);
      users.value = data;
    })

    onMounted(async () => {
      await loader.load();
      const { Map } = await google.maps.importLibrary("maps");
      new Map(mapDiv.value, {
        center: { lat: 22.3193, lng: 114.1694 },
        zoom: 12,
        mapId: '9fde6adeb966b26',
      })
    })

    onBeforeMount(async () => {
      // try {
      //   const res = await fetch("http://localhost:8080/");
      //   const d = await res.json();
      //   this.users = [d.self];
      // } catch(e) {
      //   console.error(e); 
      // }
    })

    return { 
      mapDiv,
      users,
      socket,
    }
  },

  components: {
    User
  },

  methods: {
  }
}
</script>

<template>
  <div class="app">
    <div class="map-container">
      <div class="map" ref="mapDiv">

      </div>
    </div>
    <div class="operation-container">
      <div class="user-container">
        <User class="user-item" v-for="user in users" :uname="user"/>
      </div>

      <div class="form-container">
        suss
      </div>
    </div>
  </div>
</template>

<style lang="scss">

.app {
  display: flex;

  .map-container {
    background-color: red;
    flex: 3;
    
    .map {
      height: 100vh;
    }
  }

  .operation-container {
    display: flex;
    background-color: green;
    flex-direction: column;
    flex: 1;
    align-content: flex-end;

    .user-container {
      display: flex;
      flex-direction: column;
      width: 100%;
      flex: 5;
      overflow-y: scroll;
      overflow-x: hidden;

      .user-item {
        width: 100%;
        margin-top: 0.5em;
        border-radius: 0.5em;
        background-color: blue;
      }
    }

    .form-container {
      width: 100%;
      background-color: purple;
      flex: 1;
    }
  }
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

</style>
