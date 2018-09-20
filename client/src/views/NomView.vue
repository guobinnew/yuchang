<template>
    <div :id="id" class="nom" style="position: relative">
        <svg class="canvas" width="800" height="600">
            <text id="info" class="blocklyText" y="2" text-anchor="middle" dominant-baseline="middle" dy="0" x="8"
                  transform="translate(128, 24) "></text>
            <g class="blocklyZoom" transform="translate(20,20)">
                <image width="36" height="36" y="44" xlink:href="../assets/zoom-out.svg"></image>
                <image width="36" height="36" y="0" xlink:href="../assets/zoom-in.svg"></image>
                <image width="36" height="36" y="88" xlink:href="../assets/zoom-reset.svg"></image>
                <image width="36" height="36" y="132" xlink:href="../assets/zoom-reset.svg"></image>
                <image width="36" height="36" y="176" xlink:href="../assets/zoom-reset.svg"></image>
            </g>
        </svg>
    </div>
</template>

<style scoped>
    .container {

    }
    .nom {
        height: 100%;
        overflow: hidden;
    }
</style>

<script>
  import $ from 'jquery'
  import * as d3 from 'd3'

export default {
  name: 'nomview',
  data: function () {
    return {
      id: 'nom'
    }
  },
  components: {
  },
  created: function() {
  },
  mounted: function () {
    var that = this
    var resizeCanvas = function() {
      var $main = $('.el-main')
      that.width = $main[0].clientWidth
      that.height = $main[0].clientHeight
      d3.select(that.$el).select('svg.canvas')
        .attr('width', that.width)
        .attr('height', that.height)
    }

    window.onresize = function () {
      resizeCanvas()
    }

    resizeCanvas()
  }
}

</script>
