<script>
/* eslint-disable no-undef */
import PeerCard from './components/PeerCard.vue';
import SelfCard from './components/SelfCard.vue';
import MessageCard from './components/MessageCard.vue';
import UploadForm from './components/UploadForm.vue';
import glyphSvg from './assets/user-marker.svg';

import ioClient from 'socket.io-client';
import { ref, onMounted } from 'vue'
import { Loader } from '@googlemaps/js-api-loader';

const GOOGLE_MAPS_API_KEY = 'AIzaSyDrA7hO41vHxBIxUewGFoGFJJQpYTsBiLA';

export default {
  components: {
    PeerCard, SelfCard, MessageCard, UploadForm,
  },

  setup() {
    const loader = new Loader({ 
      apiKey: GOOGLE_MAPS_API_KEY ,
    });

    const mapElement = ref(null);
    const fileInputElement = ref(null);
    const textInputElement = ref(null);

    const selectedRecipient = ref(null);
    const selectedMarker = ref(null);
    const receivedMessage = ref({});

    const userCoordinates = ref({longitude: null, latitude: null});
    const userHashedCoordinates = ref('');
    const activeUserList = ref({});
    const markerUserList = ref({});
    const selfInfo = ref({});

    const markerWidgets = {};
    let map = null;

    const socket = ioClient("http://localhost:8080/");

    const selectRecipient = (user) => {
      if (user === selfInfo.value.id) return;
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
          markerWidgets[hcoord].marker.map = null; 
          markerWidgets[hcoord].glyphElement.remove();
          markerWidgets[hcoord].glyphPinElement = null;

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
            const glyphIcon = document.createElement('img');
            glyphIcon.src = glyphSvg;
            glyphIcon.style.height = '30px';

            const pin = new PinElement({
              glyph: glyphIcon,
            });

            const marker = new AdvancedMarkerElement({
              position: { lat: coord.latitude, lng: coord.longitude },
              map: map,
              content: pin.element,
            });

            marker.addListener('click', () => {
              console.log('yay!')
              selectedMarker.value = markerUserList.value[hcoord];
            });

            markerWidgets[hcoord] = {
              marker: marker,
              glyphElement: glyphIcon,
              glyphPinElement: pin,
            };
          }          
        }

      } catch (error) {
        console.error('Error with rendering markers: ', error);
      }
    }

    socket.on('init-user', async (initParcel) => {
      activeUserList.value = initParcel.list;
      markerUserList.value = initParcel.markers;

      selfInfo.value = {
        id: initParcel.self,
        name: initParcel.list[initParcel.self],
      }

      selectedMarker.value = markerUserList.value[userHashedCoordinates.value];
      await renderMarkers();
    });

    socket.on('update-users', async (updateParcel) => {
      activeUserList.value = updateParcel.list;
      markerUserList.value = updateParcel.markers;
      selectedMarker.value = markerUserList.value[userHashedCoordinates.value];
      await renderMarkers();
    });

    socket.on('receive-file', (fileParcel) => {
      const blob = new Blob([fileParcel]);
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = 'filename.extension';
      downloadLink.click();

      URL.revokeObjectURL(downloadLink.href);
    });

    socket.on('receive-message', (messageParcel) => {
      receivedMessage.value = {
        message: messageParcel.message,
        sender: activeUserList.value[messageParcel.from],
      }
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

        userCoordinates.value = x[Math.floor((Math.random() * 100)) % 3];
        userHashedCoordinates.value = hashCoordinates(userCoordinates.value);

        // coordinates.value = position.coords;
        // console.log(coordinates.value)

        socket.emit('init-location', userHashedCoordinates.value);

        await loader.load();

        const { Map } = await google.maps.importLibrary("maps");

        map = new Map(mapElement.value, {
          center: { lat: userCoordinates.value.latitude, lng: userCoordinates.value.longitude },
          zoom: 12,
          mapId: '9fde6adeb966b26',
          mapTypeId: 'roadmap',
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
          scaleControl: true,
          rotateControl: false,
        });

        // socket.emit('init-location', userHashedCoordinates.value);

      } catch (error) {
        console.error('Error with geolocation services or library loading:', error);
      }

    });

    return {
      selectRecipient,

      mapElement,
      fileInputElement,
      textInputElement,
      activeUserList,
      selfInfo,
      selectedRecipient,
      selectedMarker,
      receivedMessage,
      socket,
    }
  },
}
</script>

<template>
  <div class="app">
    <MessageCard :message="receivedMessage.message" :sender="receivedMessage.sender"/>
    <div class="map-container">
      <div class="map" ref="mapElement"></div>
    </div>
    <div class="operation-container">
      <div class="user-container">
        <SelfCard :selfName="selfInfo.name"/>
        
        <PeerCard 
          class="user-items" 
          v-for="userId in selectedMarker"
          :uname="activeUserList[userId]"
          @click="selectRecipient(userId)"
          :style="{ backgroundColor: selectedRecipient === userId && selectedRecipient !== selfInfo.userId
            ? 'darkcyan' 
            : '#0F0F0F' }"
        />

      </div>
      <UploadForm
        :socket="socket"
        :recipient="selectedRecipient"
        :selfInfo="selfInfo"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto+Mono&display=swap');

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
        margin-top: .5rem;
        border-radius: .5rem;
        background-color: var(--semi-dark);
      }
    }

    .user-container::-webkit-scrollbar {
      display: none;
    }

    .form-container {
      width: 100%;
      background-color: var(--semi-dark);
      padding: 1rem;
      flex: 1;

      .input-field {
        width: 6rem;
        border-radius: .2rem;
        outline: none;
      }

      .submit-base {
        background-color: var(--light-dark);
        padding: 1rem;
        border-radius: 1rem;
        border: none;
        color: var(--light);
      }

      .box {
        width: 100%;
        padding: .1rem;
        background-color: var(--light-dark);
        border: solid;
        border-radius: .5rem;
        border-color: var(--light-light-dark);
      }

      #file-box {
        margin-bottom: 1rem;

        input[type=file]::-webkit-file-upload-button {
          height: 3.5rem;
          background-color: var(--semi-dark);
          border: none;
          color: var(--light);
          border-radius: .5rem;
          padding: .6rem;
          margin-left: .5rem;
          font-family: var(--fonts);
        }

        input[type=file] {
          width: 70%;
        }

        #file-submit {
          width: 30%;
          height: 5rem;
          border-radius: 0%;
          background-color: var(--semi-dark);
        }
      }

      #text-box {
        input[type=text] {
          height: 3rem;
          width: 70%;
          background-color: var(--light-dark);
          color: var(--light);
          padding-left: .5rem;
          border: 0rem;
        }

        #msg-submit {
          width: 30%;
          height: 3rem;
          border-radius: 0%;
          background-color: var(--semi-dark);
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