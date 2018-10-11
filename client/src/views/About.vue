<template>
  <div class="about">
    <h1>This is an about page {{ abc }}</h1>
  </div>
</template>

<script>
  export default {
    name: 'about',
    data: function() {
      return {
        abc: '1111'
      }
    },
    created: function() {

    },
    mounted: function () {

    },
    methods: {

    }
  }
</script>
