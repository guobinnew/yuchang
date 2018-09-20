<template>
    <div :id="id" class="scratch" style="position: relative">
        <svg class="canvas blocklySvg" width="800" height="600" vwidth="1600" vheight="1200">
            <defs>
                <pattern id="blocklyGridPattern" patternUnits="userSpaceOnUse" width="38.879999999999995"
                         height="38.879999999999995" x="207.0918124072559" y="-1.856000000001302">
                    <line stroke="#ddd" stroke-width="0.972" x1="18.954" y1="19.926" x2="20.898" y2="19.926"></line>
                    <line stroke="#ddd" stroke-width="0.972" x1="19.926" y1="18.954" x2="19.926" y2="20.898"></line>
                </pattern>
                <filter id="blocklyReplacementGlowFilter" height="160%" width="180%" y="-30%" x="-40%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="2"></feGaussianBlur>
                    <feComponentTransfer result="outBlur">
                        <feFuncA type="table" tableValues="0 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1"></feFuncA>
                    </feComponentTransfer>
                    <feFlood flood-color="#FFFFFF" flood-opacity="1" result="outColor"></feFlood>
                    <feComposite in="outColor" in2="outBlur" operator="in" result="outGlow"></feComposite>
                    <feComposite in="SourceGraphic" in2="outGlow" operator="over"></feComposite>
                </filter>
            </defs>
            <g class="blocklyWorkspace">
                <rect height="100%" width="100%" class="blocklyMainBackground"
                      style="fill: url(#blocklyGridPattern);"></rect>
                <text id="info" class="blocklyText" y="2" text-anchor="middle" dominant-baseline="middle" dy="0" x="8"
                      transform="translate(128, 24) ">
                    X: {{ location.x }}  Y: {{ location.y }}
                </text>
                <g class="blocklyBlockCanvas">
                    <g class="blocklyDraggable" data-shapes="stack" data-category="motion"
                       transform="translate(42,265)">
                        <path class="blocklyPath blocklyBlockBackground" stroke="#3373CC" fill="#4C97FF"
                              fill-opacity="1"
                              d="m 0,4 A 4,4 0 0,1 4,0 H 12 c 2,0 3,1 4,2 l 4,4 c 1,1 2,2 4,2 h 12 c 2,0 3,-1 4,-2 l 4,-4 c 1,-1 2,-2 4,-2 H 148 a 4,4 0 0,1 4,4 v 40  a 4,4 0 0,1 -4,4 H 48   c -2,0 -3,1 -4,2 l -4,4 c -1,1 -2,2 -4,2 h -12 c -2,0 -3,-1 -4,-2 l -4,-4 c -1,-1 -2,-2 -4,-2 H 4 a 4,4 0 0,1 -4,-4 z"></path>
                        <g data-argument-type="text number" data-shapes="argument round" transform="translate(80,8)">
                            <path class="blocklyPath blocklyBlockBackground" stroke="#3373CC" fill="#FFFFFF"
                                  fill-opacity="1"
                                  d="m 0,0 m 16,0 H 24 a 16 16 0 0 1 0 32 H 16 a 16 16 0 0 1 0 -32 z"></path>
                            <g class="blocklyEditableText" transform="translate(8, 0) " style="cursor: text;">
                                <text class="blocklyText" x="12" y="18" dominant-baseline="middle" dy="0"
                                      text-anchor="middle">15
                                </text>
                            </g>
                        </g>
                        <text class="blocklyText" y="2" text-anchor="middle" dominant-baseline="middle" dy="0" x="16"
                              transform="translate(8, 24) ">右转
                        </text>
                        <g transform="translate(48, 12) ">
                            <image height="24px" width="24px" xlink:href="../assets/rotate-right.svg"></image>
                        </g>
                        <path class="blocklyPath" style="visibility: hidden" d="" fill="#3373CC"></path>
                        <text class="blocklyText" y="2" text-anchor="middle" dominant-baseline="middle" dy="0" x="8"
                              transform="translate(128, 24) ">度
                        </text>
                    </g>
                    <g class="blocklyDraggable" data-shapes="reporter round" data-category="sensing"
                       transform="translate(60,60)">
                        <path class="blocklyPath blocklyBlockBackground" stroke="#2E8EB8" fill="#5CB1D6"
                              fill-opacity="1"
                              d="m 0,0 m 20,0 H 35.99998664855957 a 20 20 0 0 1 0 40 H 20 a 20 20 0 0 1 0 -40 z"></path>
                        <text class="blocklyText" y="2" text-anchor="middle" dominant-baseline="middle" dy="0"
                              x="15.999993324279785" transform="translate(12, 20) ">X坐标
                        </text>
                    </g>
                    <g class="blocklyDraggable" data-shapes="c-block c-1" data-category="control"
                       transform="translate(166,490)">
                        <path class="blocklyPath blocklyBlockBackground" stroke="#CF8B17" fill="#FFAB19"
                              fill-opacity="1"
                              d="m 0,4 A 4,4 0 0,1 4,0 H 12 c 2,0 3,1 4,2 l 4,4 c 1,1 2,2 4,2 h 12 c 2,0 3,-1 4,-2 l 4,-4 c 1,-1 2,-2 4,-2 H 156 a 4,4 0 0,1 4,4 v 40  a 4,4 0 0,1 -4,4 H 64 c -2,0 -3,1 -4,2 l -4,4 c -1,1 -2,2 -4,2 h -12 c -2,0 -3,-1 -4,-2 l -4,-4 c -1,-1 -2,-2 -4,-2 h -8  a 4,4 0 0,0 -4,4 v 16 a 4,4 0 0,0 4,4 h  8 c 2,0 3,1 4,2 l 4,4 c 1,1 2,2 4,2 h 12 c 2,0 3,-1 4,-2 l 4,-4 c 1,-1 2,-2 4,-2 H 156 H 156 a 4,4 0 0,1 4,4 v 24  a 4,4 0 0,1 -4,4 H 48   c -2,0 -3,1 -4,2 l -4,4 c -1,1 -2,2 -4,2 h -12 c -2,0 -3,-1 -4,-2 l -4,-4 c -1,-1 -2,-2 -4,-2 H 4 a 4,4 0 0,1 -4,-4 z"></path>
                        <g data-argument-type="text number" data-shapes="argument round"
                           transform="translate(79.99997329711914,8)">
                            <path class="blocklyPath blocklyBlockBackground" stroke="#CF8B17" fill="#FFFFFF"
                                  fill-opacity="1"
                                  d="m 0,0 m 16,0 H 24 a 16 16 0 0 1 0 32 H 16 a 16 16 0 0 1 0 -32 z"></path>
                            <g class="blocklyEditableText" transform="translate(8, 0) " style="cursor: text;">
                                <text class="blocklyText" x="12" y="18" dominant-baseline="middle" dy="0"
                                      text-anchor="middle">10
                                </text>
                            </g>
                        </g>
                        <text class="blocklyText" y="2" text-anchor="middle" dominant-baseline="middle" dy="0"
                              x="31.99998664855957" transform="translate(8, 24) ">重复执行
                        </text>
                        <path class="blocklyPath" style="visibility: hidden" d="" fill="#CF8B17"></path>
                        <text class="blocklyText" y="2" text-anchor="middle" dominant-baseline="middle" dy="0"
                              x="7.999996662139893" transform="translate(127.99997329711914, 24) ">次
                        </text>
                        <g transform="translate(128, 76) ">
                            <image height="24px" width="24px" xlink:href="../assets/repeat.svg"></image>
                        </g>
                    </g>
                    <g class="blocklyDraggable" data-shapes="stack" data-category="events"
                       transform="translate(380,422)">
                        <path class="blocklyPath blocklyBlockBackground" stroke="#CC9900" fill="#FFBF00"
                              fill-opacity="1"
                              d="m 0,4 A 4,4 0 0,1 4,0 H 12 c 2,0 3,1 4,2 l 4,4 c 1,1 2,2 4,2 h 12 c 2,0 3,-1 4,-2 l 4,-4 c 1,-1 2,-2 4,-2 H 134.8959732055664 a 4,4 0 0,1 4,4 v 40  a 4,4 0 0,1 -4,4 H 48   c -2,0 -3,1 -4,2 l -4,4 c -1,1 -2,2 -4,2 h -12 c -2,0 -3,-1 -4,-2 l -4,-4 c -1,-1 -2,-2 -4,-2 H 4 a 4,4 0 0,1 -4,-4 z"></path>
                        <g data-shapes="argument round" transform="translate(48,8)">
                            <path class="blocklyPath blocklyBlockBackground" stroke="#CC9900" fill="#E6AC00"
                                  fill-opacity="1"
                                  d="m 0,0 m 16,0 H 66.8959732055664 a 16 16 0 0 1 0 32 H 16 a 16 16 0 0 1 0 -32 z"></path>
                            <g class="blocklyEditableText" transform="translate(8, 0) " style="cursor: default;">
                                <text class="blocklyText blocklyDropdownText" x="23.447986602783203" y="18"
                                      dominant-baseline="middle" dy="0" text-anchor="middle">消息1
                                </text>
                                <image height="12px" width="12px" xlink:href="../assets/dropdown-arrow.svg"
                                       transform="translate(50.895973205566406,11)"></image>
                            </g>
                        </g>
                        <text class="blocklyText" y="2" text-anchor="middle" dominant-baseline="middle" dy="0"
                              x="15.999993324279785" transform="translate(8, 24) ">发送
                        </text>
                        <path class="blocklyPath" style="visibility: hidden" d="" fill="#CC9900"></path>
                        <g class="blocklyDraggable" data-shapes="c-block c-1" data-category="control"
                           transform="translate(0,48)">
                            <path class="blocklyPath blocklyBlockBackground" stroke="#CF8B17" fill="#FFAB19"
                                  fill-opacity="1"
                                  d="m 0,4 A 4,4 0 0,1 4,0 H 12 c 2,0 3,1 4,2 l 4,4 c 1,1 2,2 4,2 h 12 c 2,0 3,-1 4,-2 l 4,-4 c 1,-1 2,-2 4,-2 H 156 a 4,4 0 0,1 4,4 v 40  a 4,4 0 0,1 -4,4 H 64 c -2,0 -3,1 -4,2 l -4,4 c -1,1 -2,2 -4,2 h -12 c -2,0 -3,-1 -4,-2 l -4,-4 c -1,-1 -2,-2 -4,-2 h -8  a 4,4 0 0,0 -4,4 v 40 a 4,4 0 0,0 4,4 h  8 c 2,0 3,1 4,2 l 4,4 c 1,1 2,2 4,2 h 12 c 2,0 3,-1 4,-2 l 4,-4 c 1,-1 2,-2 4,-2 H 156 H 156 a 4,4 0 0,1 4,4 v 24  a 4,4 0 0,1 -4,4 H 48   c -2,0 -3,1 -4,2 l -4,4 c -1,1 -2,2 -4,2 h -12 c -2,0 -3,-1 -4,-2 l -4,-4 c -1,-1 -2,-2 -4,-2 H 4 a 4,4 0 0,1 -4,-4 z"></path>
                            <g data-argument-type="text number" data-shapes="argument round"
                               transform="translate(79.99997329711914,8)">
                                <path class="blocklyPath blocklyBlockBackground" stroke="#CF8B17" fill="#FFFFFF"
                                      fill-opacity="1"
                                      d="m 0,0 m 16,0 H 24 a 16 16 0 0 1 0 32 H 16 a 16 16 0 0 1 0 -32 z"></path>
                                <g class="blocklyEditableText" transform="translate(8, 0) " style="cursor: text;">
                                    <text class="blocklyText" x="12" y="18" dominant-baseline="middle" dy="0"
                                          text-anchor="middle">10
                                    </text>
                                </g>
                            </g>
                            <text class="blocklyText" y="2" text-anchor="middle" dominant-baseline="middle" dy="0"
                                  x="31.99998664855957" transform="translate(8, 24) ">重复执行
                            </text>
                            <path class="blocklyPath" style="visibility: hidden" d="" fill="#CF8B17"></path>
                            <text class="blocklyText" y="2" text-anchor="middle" dominant-baseline="middle" dy="0"
                                  x="7.999996662139893" transform="translate(127.99997329711914, 24) ">次
                            </text>
                            <g transform="translate(128, 100) ">
                                <image height="24px" width="24px" xlink:href="../assets/repeat.svg"></image>
                            </g>
                        </g>
                    </g>
                    <g class="blocklyDraggable" data-shapes="stack" data-category="control"
                       transform="translate(386,322)">
                        <path class="blocklyPath blocklyBlockBackground" stroke="#CF8B17" fill="#FFAB19"
                              fill-opacity="1"
                              d="m 0,4 A 4,4 0 0,1 4,0 H 12 c 2,0 3,1 4,2 l 4,4 c 1,1 2,2 4,2 h 12 c 2,0 3,-1 4,-2 l 4,-4 c 1,-1 2,-2 4,-2 H 115.99999332427979 a 4,4 0 0,1 4,4 v 40  a 4,4 0 0,1 -4,4 H 48   c -2,0 -3,1 -4,2 l -4,4 c -1,1 -2,2 -4,2 h -12 c -2,0 -3,-1 -4,-2 l -4,-4 c -1,-1 -2,-2 -4,-2 H 4 a 4,4 0 0,1 -4,-4 z"></path>
                        <g data-argument-type="text number" data-shapes="argument round" transform="translate(48,8)">
                            <path class="blocklyPath blocklyBlockBackground" stroke="#CF8B17" fill="#FFFFFF"
                                  fill-opacity="1"
                                  d="m 0,0 m 16,0 H 24 a 16 16 0 0 1 0 32 H 16 a 16 16 0 0 1 0 -32 z"></path>
                            <g class="blocklyEditableText" transform="translate(8, 0) " style="cursor: text;">
                                <text class="blocklyText" x="12" y="18" dominant-baseline="middle" dy="0"
                                      text-anchor="middle">1
                                </text>
                            </g>
                        </g>
                        <text class="blocklyText" y="2" text-anchor="middle" dominant-baseline="middle" dy="0"
                              x="15.999993324279785" transform="translate(8, 24) ">等待
                        </text>
                        <path class="blocklyPath" style="visibility: hidden" d="" fill="#CF8B17"></path>
                        <text class="blocklyText" y="2" text-anchor="middle" dominant-baseline="middle" dy="0"
                              x="7.999996662139893" transform="translate(96, 24) ">秒
                        </text>
                    </g>
                </g>
                <g class="blocklyBubbleCanvas"></g>
                <g class="blocklyZoom" transform="translate(20,20)">
                    <image width="36" height="36" y="44" xlink:href="../assets/zoom-out.svg"></image>
                    <image width="36" height="36" y="0" xlink:href="../assets/zoom-in.svg"></image>
                    <image width="36" height="36" y="88" xlink:href="../assets/zoom-reset.svg"></image>
                </g>
            </g>
        </svg>
        <svg version="1.1" class="blocklyBlockDragSurface" style="display: block;">
            <g class="blocklyBlockDragCanvas" filter="url(#blocklyDragShadowFilter)">
            </g>
            <defs>
                <filter id="blocklyDragShadowFilter" height="140%" width="140%" y="-20%" x="-20%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="6"></feGaussianBlur>
                    <feComponentTransfer result="offsetBlur">
                        <feFuncA type="linear" slope="0.6"></feFuncA>
                    </feComponentTransfer>
                    <feComposite in="SourceGraphic" in2="offsetBlur" operator="over"></feComposite>
                </filter>
            </defs>
        </svg>
        <svg version="1.1" class="blocklyWsDragSurface blocklyOverflowVisible" width="927" height="614"
             style="display: none;">
        </svg>
    </div>
</template>

<style scoped>
    .scratch {
        overflow: hidden;
        height: 100%;
    }
    .canvas {
        background-color: white;
    }

    .blocklySvg {
        background-color: #F9F9F9;
        outline: none;
        overflow: hidden;
        position: absolute;
        display: block;
    }

    .blocklyMainWorkspaceScrollbar {
        z-index: 20;
    }

    .blocklyScrollbarHorizontal, .blocklyScrollbarVertical {
        position: absolute;
        outline: none;
    }

    .blocklyScrollbarBackground {
        opacity: 0;
    }

    .blocklyScrollbarHandle {
        fill: #CECDCE;
    }

    .blocklyBlockDragSurface {
        pointer-events: none;
    }

    .blocklyBlockDragSurface {
        display: none;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        overflow: visible !important;
        z-index: 50;
    }

    .blocklyPath {
        fill-opacity: 1.0;
        stroke-opacity: 1.0;
    }

    .blocklyInsertionMarker > .blocklyPath {
        stroke: none;
    }
</style>

<script>
  import $ from 'jquery'
  import * as d3 from 'd3'

  let grapPoint = {x: 0, y: 0}
  let lastPoint = {x: 0, y: 0}
  let $selected = null
  let currentZoomFactor = 1.0
  let startDrag = false

  export default {
    name: 'scracth',
    data: function () {
      return {
        id: 'scratch',
        zoomRate: 1.1,
        location: {x: 0, y: 0}
      }
    },
    components: {},
    created: function () {
    },
    mounted: function () {
      let that = this
      const $svg = $(".blocklySvg")
      const svg = d3.select(that.$el).select(".blocklySvg")

      currentZoomFactor = svg.attr('currentScale')
      if(!currentZoomFactor){
        currentZoomFactor = 1.0
      }

      console.log(svg.size())

      let resizeCanvas = function () {
        let $main = $('.el-main')
        that.width = $main[0].clientWidth
        that.height = $main[0].clientHeight
        d3.select(that.$el).select('svg.canvas')
          .attr('width', that.width)
          .attr('height', that.height)
      }

      const $blockcanvas = $(".blocklyBlockCanvas")
      const $bubblecanvas = $(".blocklyBubbleCanvas")
      const $dragcanvas = $(".blocklyBlockDragCanvas")
      const $canvasList = [$blockcanvas, $bubblecanvas, $dragcanvas]
      function setCanvasTransfrom(trans) {
        $canvasList.forEach(function (item) {
          item.attr("transform", trans)
        })
      }

      function isInArray(arr, value) {
        for (let i = 0; i < arr.length; i++) {
          if (value === arr[i]) {
            return true;
          }
        }
        return false;
      }

      const blocks = svg.selectAll('.blocklyDraggable')
      const ws = svg.select(".blocklyWorkspace")
      const $dragsurface = $(".blocklyBlockDragSurface")
      const backDrop = d3.select(that.$el).select("#BackDrop")

      blocks.selectAll('g').filter(function (d, i) {
        let type = d3.select(this).attr("data-shapes")
        if (!type) {
          return false
        }
        let types = type.split(' ')
        return isInArray(types, 'argument')
      }).on('mouseover', function () {
        d3.select(this).classed("blocklyReplaceable", true)
        d3.select(this).selectAll(".blocklyBlockBackground").attr("filter", "url(#blocklyReplacementGlowFilter)")
      }).on('mouseout', function () {
        d3.select(this).classed("blocklyReplaceable", false)
        d3.select(this).selectAll(".blocklyBlockBackground").attr("filter", "")
      })

      d3.select(that.$el).selectAll(".blocklyZoom image").each(function (d, i) {
        d3.select(this).on('mousedown', function () {
          if (i == 0) {
            currentZoomFactor /= that.zoomRate
          }
          else if (i == 1) {
            currentZoomFactor *= that.zoomRate
          }
          else {
            currentZoomFactor = 1.0
            setCanvasTransfrom("translate(0,0) scale(1.0)")
            return
          }
          let m = $blockcanvas[0].getCTM()
          let trans = "translate(" + Number(m.e) + "," + Number(m.f) + ") " + "scale(" + currentZoomFactor + ")"
          setCanvasTransfrom(trans)
        })
      })

      blocks.on('mousedown', function () {
        $selected = $(this)
        let m = this.getCTM()
        let pm = $blockcanvas[0].getCTM()

        let X = $svg.offset().left;
        let Y = $svg.offset().top;

        lastPoint.x = event.pageX
        lastPoint.y = event.pageY
        grapPoint.x = (Number(m.e) - Number(pm.e))
        grapPoint.y = (Number(m.f) - Number(pm.f))
        $selected.addClass("blocklySelected")
        return false
      })

      svg.on('mousedown',function () {
        lastPoint.x = event.pageX
        lastPoint.y = event.pageY
        startDrag = true
        return false
      }).on('mousemove',function () {
        let X = $svg.offset().left;
        let Y = $svg.offset().top;
        that.location.x = event.pageX - X
        that.location.y = event.pageY - Y

        let deltaX = event.pageX - lastPoint.x
        let deltaY = event.pageY - lastPoint.y

        if (!$selected && startDrag) {
          lastPoint.x = event.pageX
          lastPoint.y = event.pageY
          let m = $blockcanvas[0].getCTM();
          let trans = "translate(" + (Number(m.e) + deltaX) + "," + (Number(m.f) + deltaY) + ") " + "scale(" + currentZoomFactor + ")"
          setCanvasTransfrom(trans)
        }
        else if ($selected && $selected.hasClass("blocklySelected")) {
          // 改变父节点
          if (!$selected.hasClass("blocklyDragging")) {
            // 插入占位
            var $marker = $('<g class="blocklyInsertionMarker blocklyDraggable"><path class="blocklyPath blocklyBlockBackground" stroke="#000000" fill="#000000" fill-opacity="0.2"></path></g>')
            $marker.insertAfter($selected)
            $dragsurface.attr("style", "display: block;")
            $dragcanvas.append($selected)
            $selected.addClass("blocklyDragging")
          }

          // 根据鼠标位置调整surface
          //var dm = dragsurface.offset()[0].getCTM();
          $dragsurface.attr("style", "display: block; transform: translate3d(" + deltaX + "px," + deltaY + "px,0px)")
        }
      }).on('mouseup',function () {
        startDrag = false
        if ($selected && $selected.hasClass("blocklySelected")) {
          if ($selected.hasClass("blocklyDragging")) {
            // 插入占位
            let $marker = $blockcanvas.find(".blocklyInsertionMarker")
            $selected.insertBefore($marker)
            $selected.removeClass("blocklyDragging")
            $marker.remove()
            // 更新变换
            let dm = $dragsurface.css("transform").replace(/[^0-9\-,]/g, '').split(',')
            let m = $selected[0].getCTM()
            $selected.attr("transform", "translate(" + (Number(dm[4]) + grapPoint.x) / Number(m.a) + "," + (Number(dm[5]) + grapPoint.y) / Number(m.d) + ")")
            $dragsurface.attr('style', 'display: none;')
          }
          $selected.removeClass("blocklySelected")
          $selected = null
        }
      })


      window.onresize = function () {
        resizeCanvas()
      }

      resizeCanvas()
    }
  }

</script>
