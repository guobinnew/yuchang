<template>
    <div class="container">
        <Scratch flex=1 />
    </div>
</template>

<style scoped>
    .container {
        overflow: hidden;
        height: 100%;
    }
</style>

<script>

  import Scratch from '../components/Scratch.vue'

  export default {
    data: function () {
      return {}
    },
    components: {
      Scratch
    }
  }

</script>
