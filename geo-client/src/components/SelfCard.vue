<script>
export default {
  props: {
    selfName: String,
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
    background-color: var(--semi-dark);
    margin-bottom: 1rem;
    padding: 1.5rem;

    .identify-message {
      margin-bottom: 0.5rem;
    }

    .self {
      color: var(--light);
    }
  }
</style>