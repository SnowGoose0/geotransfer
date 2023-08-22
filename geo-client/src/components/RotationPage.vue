<script setup>
import rotateIcon from '../assets/rotate-device.svg'
</script>

<template>
  <div id="message">
    <h2>Rotate your device</h2>
    <img :src="rotateIcon"/>
  </div>
</template>

<style lang="scss">
  #message {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: var(--semi-dark);
    width: 100%;
    height: 100vh;

    h2 {
      color: var(--light);
    }

    img {
      margin: 7rem;
      height: 75px;
    }
  }
</style>