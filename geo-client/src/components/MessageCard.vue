<script>
  import { ref, watch } from 'vue';

  export default {
    props: {
      message: String,
      sender: String,
    },

    setup(props) {
      const showMessage = ref(false);

      const newMessage = () => {
        showMessage.value = true;
      }

      const closeMessage = () => {
        showMessage.value = false;
      }

      watch(() => props.message, newMessage);

      return {
        newMessage,
        closeMessage,
        showMessage,
      }
    }
  }
</script>

<template>
  <div class="pop-up-container" v-if="showMessage">
    <h3 class="pop-up-message" @change="newMessage">
      <span class="sender">
        {{ sender }}
      </span>: {{ message }}</h3>
    <button class="close-pop-up" @click="showMessage = false">Close</button>
  </div>
</template>

<style lang="scss" scoped>
.pop-up-container {
  // display: flex;
  width: 25%;
  max-height: 50%;
  padding: 1rem;
  background-color: var(--semi-dark);
  margin: 1rem;
  border-radius: 1rem;
  border-style: solid;
  border-color: var(--aquatic);
  border-width: 0.025rem;
  position: absolute;
  z-index: 10;

  .pop-up-message {
    padding: .5rem;
    
    .sender {
      color: var(--aquatic);
    }
  }

  .close-pop-up {
    background-color: var(--light-dark);
    padding: .75rem;
    border-radius: 1rem;
    border: none;
    color: var(--light);
  }
}
</style>