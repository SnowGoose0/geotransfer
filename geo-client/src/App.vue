<script>
/* eslint-disable no-undef */
import { ref, onMounted } from 'vue'
import { Loader } from '@googlemaps/js-api-loader';

import PeerCard from './components/PeerCard.vue';
import SelfCard from './components/SelfCard.vue';
import MessageCard from './components/MessageCard.vue';
import FileCard from './components/FileCard.vue';
import UploadForm from './components/UploadForm.vue';
import RotationPage from './components/RotationPage.vue';

import { useOrientation } from './Orientation.js'

import glyphSvg from './assets/user-marker.svg';

import ioClient from 'socket.io-client';

const GOOGLE_MAPS_API_KEY = 'AIzaSyDrA7hO41vHxBIxUewGFoGFJJQpYTsBiLA';

export default {
  components: {
    PeerCard, 
    SelfCard,
    MessageCard, 
    FileCard, 
    UploadForm, 
    RotationPage,
  },

  setup() {
    const loader = new Loader({ 
      apiKey: GOOGLE_MAPS_API_KEY,
    });

    const { isDeviceMobile, isOrientationVertical } = useOrientation();

    const mapElement = ref(null);
    const fileInputElement = ref(null);
    const textInputElement = ref(null);

    const selectedRecipient = ref(null);
    const selectedMarker = ref(null);
    const receivedMessage = ref({});
    const receivedFile = ref({});

    const userCoordinates = ref({longitude: null, latitude: null});
    const userHashedCoordinates = ref('');
    const activeUserList = ref({});
    const markerUserList = ref({});
    const selfInfo = ref({});
    const userRequestBusy = ref(false);

    const markerWidgets = {};
    let map = null;

    const socket = ioClient(import.meta.env.VITE_SOCKET_HOST_ADDR_DEV);

    const selectRecipient = (user) => {
      if (user === selfInfo.value.id) return;
      selectedRecipient.value = user;
    }

    const roundCoordinates = (coords) => {
      const roundFloat = (number) => {
        const roundedNumber = parseFloat(number.toFixed(3));
        const bottom = (roundedNumber * 1000) % 10;

        if (bottom === 0) {
          return roundedNumber + 0.001;
        }

        return roundedNumber;
      }
      const truncLongitude = roundFloat(coords.longitude);
      const truncLatitude = roundFloat(coords.latitude);

      return {
        longitude: truncLongitude,
        latitude: truncLatitude,
      }
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
      if (userRequestBusy.value === true) return;

      const fileBlob = new Blob([fileParcel.file]);
      const dlElement = document.createElement('a');

      dlElement.href = URL.createObjectURL(fileBlob);
      dlElement.download = fileParcel.fileName;
      
      receivedFile.value = {
        from: activeUserList.value[fileParcel.from],
        file: fileParcel.file,
        fileName: fileParcel.fileName,
        downloadElement: dlElement,
      };
    });

    socket.on('receive-message', (messageParcel) => {
      receivedMessage.value = {
        message: messageParcel.message,
        from: activeUserList.value[messageParcel.from],
      }
    });

    onMounted(async () => {
      try {
        await loader.load();
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        userCoordinates.value = roundCoordinates(position.coords);
        userHashedCoordinates.value = hashCoordinates(userCoordinates.value);

        socket.emit('init-location', userHashedCoordinates.value);

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

      } catch (error) {
        console.error('Error with geolocation services or library loading:', error);
      }

    });

    return {
      selectRecipient,

      isDeviceMobile,
      isOrientationVertical,

      mapElement,
      fileInputElement,
      textInputElement,
      receivedFile,
      socket,
      activeUserList,
      userRequestBusy,
      selfInfo,
      selectedRecipient,
      selectedMarker,
      receivedMessage,
    }
  },
}
</script>

<template>
  <RotationPage v-if="isDeviceMobile && isOrientationVertical"/>
  <div class="app">
    <MessageCard :message="receivedMessage.message" :sender="receivedMessage.from"/>
    <FileCard 
      :fileLinkElement="receivedFile.downloadElement" 
      :fileName="receivedFile.fileName"
      :sender="receivedFile.from" 
      @user-request-resolved="() => {
        receivedFile = {};
        userRequestBusy = false;
      }"
      @user-request-outstanding="userRequestBusy = true"
    />
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
            ? 'rgb(234, 68, 53)' 
            : 'var(--semi-dark)' }"
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
  }
  .user-icon-glyph {
    height: 30px;
    width: 30px;
  }
}
</style>