import { onUnmounted, onMounted, ref } from "vue";

const setCoords = (position, coords) => {
    coords.value = position.coords;
}

const errorCoords = (error, coords) => {
    console.error(error);

    coords.value = {
        latitude: null,
        longitude: null,
    };
}

export const useGeolocation = () => {
    const coords = ref({latitude: 22.3193, longitude: 114.1694});
    
    onMounted(() => {
        navigator.geolocation.getCurrentPosition(setCoords(position, coords), errorCoords(error, coords));
    });

    return {coords};
}