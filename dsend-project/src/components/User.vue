<script>
export default {
  props: ['uname'],
  setup() {

  },

  methods: {
    
  }
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
    margin: 0.5em 1em 0.5em 1em;
    h3 {
      padding: 0.5em;
      color: white;
    }
  }
</style>