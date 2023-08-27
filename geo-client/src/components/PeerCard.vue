<script>
export default {
  props: {
    uname: String,
  },
}
</script>

<template>
  <div class="user">
    <h3> {{ uname }}</h3>
  </div>
</template>

<style lang="scss">
  .user {
    text-align: center;
    margin: .5rem 1rem .5rem 1rem;
    border-radius: 0.5rem;
    padding: 0.75rem;

    h3 {
      padding: .5rem;
      color: var(--light);
    }
  }
</style>