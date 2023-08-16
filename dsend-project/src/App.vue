<script>
/* eslint-disable no-undef */
import User from "./components/User.vue";
import Myself from "./components/Myself.vue";
import io from 'socket.io-client';
import { ref, onMounted, onBeforeMount } from 'vue'
import { Loader } from "@googlemaps/js-api-loader";
import userIconSvg from './assets/user-marker.svg'

const GOOGLE_MAPS_API_KEY = 'AIzaSyDrA7hO41vHxBIxUewGFoGFJJQpYTsBiLA';

export default {
  components: {
    User, Myself
  },

  setup() {
    const loader = new Loader({ 
      apiKey: GOOGLE_MAPS_API_KEY ,
      version: 'weekly'
    });

    const mapDiv = ref(null);
    let userIcon;
    
    const fileList = ref([]);
    const fileInput = ref(null);
    const textInput = ref(null);
    const selectedRecipient = ref(null);
    const selectedMarker = ref(null);

    const coordinates = ref({longitude: null, latitude: null});
    const hcoordinates = ref('');
    const users = ref({});
    const self = ref({});
    const markerUserList = ref({});

    const markerWidgets = {};
    let map = null;
    let userPinElement = null;

    const socket = io("http://localhost:8080/");

    const sendMessage = () => {
      const messageContent = textInput.value.value;

      socket.emit('send-message', {
        sender: self.value.id,
        recipient: selectedRecipient.value,
        message: messageContent,
      });
      
      textInput.value.value = '';
    }

    const sendFiles = () => {
      const file = fileList.value[0];

      this.socket.emit('send-file', {
        recipient: selectedRecipient.value,
        rawFile: file,
      });
    }

    const stageFiles = () => {
      fileList.value = fileInput.value.files;
    }

    const selectRecipient = (user) => {
      if (user === self.value.id) {
        return;
      }

      selectedRecipient.value = user;
    }

    const hashCoordinates = (coords) => {
      return coords.longitude.toString() + coords.latitude.toString();
    }

    const unhashCoordinates = (hcoords) => {
      const hcoordsReversed = [...hcoords].reverse().join('');
      const offset = hcoordsReversed.indexOf('.') + 1;

      const firstDecimalIndex = hcoords.indexOf('.');
      const lngString = hcoords.substring(0, firstDecimalIndex + offset);
      const latString = hcoords.substring(firstDecimalIndex + offset, hcoords.length);

      return {
        longitude: parseFloat(lngString),
        latitude: parseFloat(latString),
      }
    }

    const cleanseMarkers = () => {
      if (Object.keys(markerWidgets).length === 0)
        return;

      for (const hcoord in markerWidgets) {
        if (markerUserList.value[hcoord] === undefined) {
          markerWidgets[hcoord].map = null;
          delete markerWidgets[hcoord];
        }
      }
    }

    const renderMarkers = async () => {
      cleanseMarkers();

      try {
        const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");

        for (const hcoord in markerUserList.value) {
          if (markerWidgets[hcoord] === undefined) {
            const coord = unhashCoordinates(hcoord);

            const marker = new AdvancedMarkerElement({
              position: { lat: coord.latitude, lng: coord.longitude },
              map: map,
              //content: userPinElement.element,
            });

            console.log(hcoord);

            marker.addListener('click', () => {
              console.log('yay!')
              selectedMarker.value = markerUserList.value[hcoord];
            });

            //markerWidgets.push(marker);
            markerWidgets[hcoord] = marker;
          }
          
        }

      } catch (error) {
        console.error('Error with rendering markers: ', error);
      }
    }

    socket.on('init-user', async (parcel) => {
      users.value = parcel.list;
      markerUserList.value = parcel.markers;

      self.value = {
        id: parcel.self,
        name: parcel.list[parcel.self],
      }

      selectedMarker.value = markerUserList.value[hcoordinates.value];
      await renderMarkers();
    });

    socket.on('update-users', async (updateParcel) => {
      users.value = updateParcel.list;
      markerUserList.value = updateParcel.markers;
      selectedMarker.value = markerUserList.value[hcoordinates.value];
      await renderMarkers();
    });

    socket.on('receive-file', (file) => {
      const blob = new Blob([file]);
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = 'filename.extension';
      downloadLink.click();

      URL.revokeObjectURL(downloadLink.href);
    });

    socket.on('receive-message', (parcel) => {
      alert(`${users.value[parcel.from]}: ${parcel.message}`);
    });

    onBeforeMount(() => {
      userIcon = document.createElement('img');
      userIcon.className = 'user-icon-glyph'
      userIcon.src = userIconSvg;
    });

    onMounted(async () => {
      try {
        // const position = await new Promise((resolve, reject) => {
        //   navigator.geolocation.getCurrentPosition(resolve, reject);
        // });

        const x = [
          {latitude: 22.3193, longitude: 114.1694},
          {latitude: 23.1291, longitude: 113.2644},
          {latitude: 22.5429, longitude: 114.0596},
          // {latitude: 22.3193, longitude: 114.1694},
          // {latitude: 22.3193, longitude: 114.1694},
        ];

        coordinates.value = x[Math.floor((Math.random() * 100)) % 3];
        hcoordinates.value = hashCoordinates(coordinates.value);

        // socket.emit('init-location', hcoordinates.value);

        // coordinates.value = position.coords;
        // console.log(coordinates.value)
        await loader.load(); // Load the necessary library




        /* const { Map } = await google.maps.importLibrary("maps");
        const { PinElement } = await google.maps.importLibrary("marker");

        map = new Map(mapDiv.value, {
          center: { lat: coordinates.value.latitude, lng: coordinates.value.longitude },
          zoom: 12,
          mapId: '9fde6adeb966b26',
          mapTypeId: 'roadmap',
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
          scaleControl: true,
          rotateControl: false,
        }); */




        // new google.maps.Marker({
        //   position: { lat: coordinates.value.latitude, lng: coordinates.value.longitude },
        //   map,
        // });

        userPinElement = new PinElement({
          glyph: userIcon,
        });

        socket.emit('init-location', hcoordinates.value);

      } catch (error) {
        console.error('Error with geolocation services or library loading:', error);
      }

    });

    return {
      sendFiles,
      sendMessage,
      stageFiles,
      selectRecipient,
      renderMarkers,
      cleanseMarkers,

      mapDiv,
      users,
      self,
      coordinates,
      socket,
      fileInput,
      textInput,
      selectedRecipient,
      selectedMarker,
      fileList,
    }
  },
}
</script>

<template>
  <div class="app">
    <div class="map-container">
      <div class="map" ref="mapDiv"></div>
    </div>
    <div class="operation-container">
      <div class="user-container">
        <Myself :selfName="self.name"/>
        <User 
          class="user-item" 
          v-for="userId in selectedMarker"
          :uname="users[userId]"
          @click="selectRecipient(userId)"
          :style="{ backgroundColor: selectedRecipient === userId && selectedRecipient !== self.userId
            ? 'darkcyan' 
            : '#0F0F0F' }"
          />
      </div>
      <div class="form-container">
        <form @submit.prevent="sendFiles">
          <input type="file" ref="fileInput" @change="stageFiles" class="input-field file">
          <input type="submit" class="input-button submit" value="Send"> 
        </form>

        <form @submit.prevent="sendMessage">
          <div class="message-box">
            <input type="text" ref="textInput" class="input-field text">
            <input type="submit" class="input-button submit" id="msg-send" value="Send">
          </div>
        </form>

        <button @click="cleanseMarkers"></button>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
:root {
  --darkest: rgb(5, 5, 5);
  --semi-dark: rgb(15, 15, 15);
  --light-dark: rgb(22, 22, 22);
  --aquatic: rgb(0, 166, 207);
  --light: rgb(255, 255, 255);
}

.app {
  display: flex;

  .map-container {
    background-color: var(--darkest);
    flex: 3;
    
    .map {
      height: 100vh;
    }
  }

  .operation-container {
    display: flex;
    background-color: var(--light-dark);
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
        margin-top: 0.5rem;
        border-radius: 0.5rem;
        background-color: var(--semi-dark);
      }
    }

    .form-container {
      width: 100%;
      background-color: var(--semi-dark);
      padding: 1rem;
      flex: 1;

      input[type=file]::-webkit-file-upload-button {
        background-color: var(--aquatic);
        border: none;
        color: var(--light);
        border-radius: .2rem;
        padding: .5rem;
      }

      input[type=file] {
        width: 100%;
      }

      .input-field {
        height: 3rem;
        width: 6rem;
        border-radius: 0.2rem;
        outline: none;
      }

      .submit {
        background-color: var(--light-dark);
        padding: 1em;
        border-radius: 1rem;
        border: none;
        color: var(--light);
      }

      .message-box {
        width: 100%;

        input[type=text] {
          width: 70%;
          background-color: var(--light-dark);
          color: var(--light);
          padding-left: 1rem;
          border: 0rem;
        }

        #msg-send {
          width: 30%;
        }
      }
    }
  }

  .user-icon-glyph {
    height: 30px;
    width: 30px;
  }
}

</style>
