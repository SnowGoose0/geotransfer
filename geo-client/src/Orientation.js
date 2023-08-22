import { ref, onMounted, onUnmounted } from 'vue';

const MOBILE_WIDTH_THRESHOLD = 768;
const MOBILE_VERT_ANGLE = 0;

export const useOrientation = () => {
  const isDeviceMobile = ref(false);
  const isOrientationVertical = ref(false);

  const checkMobileOrientation = () => {
    isDeviceMobile.value = screen.width <= MOBILE_WIDTH_THRESHOLD;
    isOrientationVertical.value = screen.orientation.angle == MOBILE_VERT_ANGLE;
  }

  onMounted(() => {
    checkMobileOrientation();
    window.addEventListener('resize', checkMobileOrientation);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', checkMobileOrientation);
  });

  return {
    isDeviceMobile,
    isOrientationVertical,
  };
}