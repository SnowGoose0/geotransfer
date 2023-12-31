<script>
  import { ref, toRef, watch } from 'vue';

  export default {
    props: {
      fileLinkElement: Object,
      fileName: String,
      sender: String,
    },

    emits: ['user-request-outstanding', 'user-request-resolved'],

    setup(props, ctx) {
      const showTransferRequest = ref(false);
      const downloadLink = toRef(props, 'fileLinkElement');

      const displayRequestCard = () => {
        showTransferRequest.value = true;
      }

      const closeRequestCard = () => {
        showTransferRequest.value = false;
        URL.revokeObjectURL(downloadLink.value.href);

        ctx.emit('user-request-resolved');
      }

      const acceptTransferRequest = () => {
        if (downloadLink.value != null) {
          downloadLink.value.click();
        }

        closeRequestCard();
      }

      const rejectTransferRequest = () => {
        showTransferRequest.value = false;
        closeRequestCard();
      }

      watch(() => downloadLink.value, (newDownloadLink) => {
        if (newDownloadLink != null) {
          ctx.emit('user-request-outstanding');
          displayRequestCard();
        }
      });

      return {
        acceptTransferRequest,
        rejectTransferRequest,
        showTransferRequest,
      }
    }
  }
</script>

<template>
  <div class="pop-up-container" v-if="showTransferRequest">
    <h3 class="pop-up-message">
      <span class="sender">
        {{ sender }}
      </span> wants to share '{{ fileName }}' with you</h3>
    <button class="pop-up-button accept" @click="acceptTransferRequest">Accept</button>
    <button class="pop-up-button reject" @click="rejectTransferRequest">Reject</button>
  </div>
</template>

<style lang="scss" scoped>
.pop-up-container {
  align-self: end;
  width: 25%;
  max-height: 50%;
  padding: 1rem;
  background-color: var(--semi-dark);
  margin: 1rem;
  border-radius: 1rem;
  border-style: solid;
  border-color: var(--orange);
  border-width: 0.025rem;
  position: absolute;
  z-index: 10;

  .pop-up-message {
    padding: .5rem;
    
    .sender {
      color: var(--orange);
    }
  }

  .pop-up-button {
    background-color: var(--light-dark);
    padding: .75rem;
    border-radius: 1rem;
    border: none;
    color: var(--light);
  }

  .reject {
    margin-left: 1rem;
  }
}
</style>