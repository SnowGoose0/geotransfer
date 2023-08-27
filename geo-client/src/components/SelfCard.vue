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
    padding: 2rem;

    .identify-message {
      color: var(--light-light-dark);
      margin-bottom: .75rem;
      cursor: pointer;
    }

    .self {
      color: var(--light);
      text-shadow: 1px 1px var(--green);
      cursor: pointer;
    }
  }
</style>