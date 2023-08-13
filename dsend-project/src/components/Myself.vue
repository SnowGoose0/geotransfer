<script>
export default {
  props: ['selfName'],
  setup() {

  },
}
</script>

<template>
  <div class="self-identifier">
    <h6 class="identify-message">I am known as</h6>
    <h2 class="self">{{ selfName }}</h2>
  </div>
</template>

<style lang="scss">
  .self-identifier {
    text-align: center;
    background-color: rgb(15, 15, 15);
    margin-bottom: 1em;
    padding: 1.5em;

    .self-identifier {
      margin-bottom: 0.5em;
    }

    .self {
      color: white;
    }
  }
</style>