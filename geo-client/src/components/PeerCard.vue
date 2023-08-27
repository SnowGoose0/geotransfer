<script>
export default {
  props: {
    userName: String,
    isSelf: Boolean,
    uId: String,
    selfId: String,
  },

  setup() {
    return {
      selfClass: "user-card u-self",
      userClass: "user-card u-peer",
    };
  }
}
</script>

<template>
  <button :class="isSelf ? selfClass : userClass">
    <h3>
      {{ userName }}<span v-if="isSelf"> (Me)</span>
    </h3>
  </button>
</template>

<style lang="scss">
  .user-card {
    text-align: center;
    border: none;
    margin: .5rem 1rem .5rem 1rem;
    border-radius: 1rem;
    padding: .75rem;
    box-shadow: 2px 2px 4px var(--darkest);

    h3 {
      padding: .5rem;
      color: var(--light);
      cursor: pointer;
      user-select: false;
    }
  }

  .user-card.u-peer {
    background-color: var(--semi-dark);
  }

  .user-card.u-peer:focus {
    -webkit-box-shadow:inset 0px 0px 0px .2rem var(--green);
    -moz-box-shadow:inset 0px 0px 0px .2rem var(--green);
    box-shadow:inset 0px 0px 0px .2rem var(--green);
  }

  .user-card.u-peer:hover {
    background-color: var(--darkest);
  }

  .user-card.u-self {
    background-color: var(--green);
  }
</style>