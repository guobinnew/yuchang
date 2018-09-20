<template>
  <div class="about">
    <h1>This is an about page {{ abc }}</h1>
  </div>
</template>


<script>
  // import yuchg from '../base.js'
  // import * as d3 from 'd3'

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
