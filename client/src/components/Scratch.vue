<template>
    <div :id="id" class="scratch" style="position: relative">
        <svg class="ycBlockSvg"
             :width="size.width"
             :height="size.height"
             :data-virtual-width="size.virtualWidth"
             :data-virtual-height="size.virtualHeight"
             version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
            <defs>
                <pattern id="ycBlockGridPattern" patternUnits="userSpaceOnUse" width="38.879999999999995"
                         height="38.879999999999995" x="207.0918124072559" y="-1.856000000001302">
                    <line stroke="#ddd" stroke-width="0.972" x1="18.954" y1="19.926" x2="20.898" y2="19.926"></line>
                    <line stroke="#ddd" stroke-width="0.972" x1="19.926" y1="18.954" x2="19.926" y2="20.898"></line>
                </pattern>
                <filter id="ycBlockReplacementGlowFilter" height="160%" width="180%" y="-30%" x="-40%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="2"></feGaussianBlur>
                    <feComponentTransfer result="outBlur">
                        <feFuncA type="table" tableValues="0 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1"></feFuncA>
                    </feComponentTransfer>
                    <feFlood flood-color="#FFFFFF" flood-opacity="1" result="outColor"></feFlood>
                    <feComposite in="outColor" in2="outBlur" operator="in" result="outGlow"></feComposite>
                    <feComposite in="SourceGraphic" in2="outGlow" operator="over"></feComposite>
                </filter>
                <filter id="ycBlockStackGlowFilter" height="160%" width="180%" y="-30%" x="-40%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="4"></feGaussianBlur>
                    <feComponentTransfer result="outBlur">
                        <feFuncA type="table" tableValues="0 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1"></feFuncA>
                    </feComponentTransfer>
                    <feFlood flood-color="#FFF200" flood-opacity="1" result="outColor"></feFlood>
                    <feComposite in="outColor" in2="outBlur" operator="in" result="outGlow"></feComposite>
                    <feComposite in="SourceGraphic" in2="outGlow" operator="over"></feComposite>
                </filter>
            </defs>
            <g class="ycBlockWorkspace">
                <rect height="100%" width="100%" class="ycBlockMainBackground"
                      style="fill: url(#ycBlockGridPattern);"></rect>
                <text id="ycBlockInfo" class="ycBlockText" y="2" text-anchor="middle" dominant-baseline="middle" dy="0" x="8"
                      transform="translate(128, 24) ">X: 0  Y: 0</text>
                <g class="ycBlockCanvas">
                </g>
            </g>
             <g class="ycBlockZoom" transform="translate(20,20)">
                <image width="36" height="36" y="44" xlink:href="../assets/zoom-out.svg"></image>
                <image width="36" height="36" y="0" xlink:href="../assets/zoom-in.svg"></image>
                <image width="36" height="36" y="88" xlink:href="../assets/zoom-reset.svg"></image>
            </g>
        </svg>
        <svg class="ycBlockDragSurface"
             style="display: block;"
             version="1.1" xmlns="http://www.w3.org/2000/svg">
            <g class="ycBlockDragCanvas" filter="url(#ycBlockDragShadowFilter)">
            </g>
            <defs>
                <filter id="ycBlockDragShadowFilter" height="140%" width="140%" y="-20%" x="-20%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="6"></feGaussianBlur>
                    <feComponentTransfer result="offsetBlur">
                        <feFuncA type="linear" slope="0.6"></feFuncA>
                    </feComponentTransfer>
                    <feComposite in="SourceGraphic" in2="offsetBlur" operator="over"></feComposite>
                </filter>
            </defs>
        </svg>
        <svg class="ycBlockWsDragSurface ycBlockOverflowVisible"
             :width="size.width"
             :height="size.height"
             style="display: none;"
             version="1.1" xmlns="http://www.w3.org/2000/svg">
        </svg>
        <svg class="ycBlockFlyout" :width="flyout.width" :height="size.height">
            <defs>
                <clipPath id="ycBlockMenuClipPath">
                    <rect id="ycBlockMenuClipRect" :height="size.height" :width="flyout.width" y="0" x="0"></rect>
                </clipPath>
            </defs>
            <path class="ycBlockFlyoutBackground" :d="flyoutBackground"></path>
            <g class="ycBlockWorkspace" clip-path="url(#ycBlockMenuClipPath)">
                <g class="ycBlockCanvas" transform="translate(0,0) scale(0.675)">
                    <rect fill-opacity="0" x="12" y="1960" height="56" width="96"></rect>
                </g>
                <g class="ycBlockBubbleCanvas" transform="translate(0,0) scale(0.675)">
                </g>
            </g>
        </svg>
        <div class="ycBlockToolbox" dir="LTR" :height="size.height">
            <div class="ycBlockCategoryMenu">
            </div>
        </div>
    </div>
</template>

<style>
.scratch {
  overflow: hidden;
  height: 100%;
}

.ycBlockText {
  fill: #fff;
  font-family: "Helvetica Neue", Helvetica, sans-serif;
  font-size: 12pt;
  font-weight: 500;
}

.ycBlockPath {
  stroke-width: 1px;
}

.ycBlockDraggable {
  cursor: grab;
  cursor: -webkit-grab;
  cursor: -moz-grab;
}

#ycBlockInfo {
  fill: #333;
}

.ycBlockDragSurface {
  pointer-events: none;
  display: none;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: visible !important;
  z-index: 50;
}

.ycBlockInsertionMarker > .ycBlockPath {
  stroke: none;
}

.ycBlockFlyout {
  border-right: 1px solid hsla(0, 0%, 0%, 0.15);
  border-left: 1px solid hsla(0, 0%, 0%, 0.15);
  box-sizing: content-box;
  position: absolute;
  top: 0;
  right: 60px;
}

.ycBlockFlyoutBackground {
  fill: #f9f9f9;
  fill-opacity: 0.8;
}

.ycBlockToolbox {
  border-left: 1px solid hsla(0, 0%, 0%, 0.15);
  border-bottom: 1px solid hsla(0, 0%, 0%, 0.15);
  -webkit-box-sizing: content-box;
  box-sizing: content-box;
  -ms-overflow-style: none;
  position: absolute;
  top: 0;
  right: 0;
  width: 60px;
  line-height: 17px;
  height: 100%;
}

.ycBlockCategoryMenu {
  height: 100%;
  width: 60px;
  background: #ffffff;
  color: #575e75;
  font-size: 0.7rem;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.ycBlockCategoryMenuRow {
  padding-top: 8px;
}

.ycBlockCategoryMenuItem {
  padding: 0.375rem 0px;
  cursor: pointer;
  text-align: center;
}

.ycBlockCategoryItemBubble {
  width: 1.25rem;
  height: 1.25rem;
  border: 1px solid;
  border-radius: 100%;
  margin: 0 auto 0.125rem;
}

.ycBlockCategoryMenuItemLabel {
  font-size: 0.65rem;
}

.ycBlockFlyoutLabel {
  cursor: default;
}

.ycBlockFlyoutLabelBackground {
  opacity: 0;
}

.ycBlockFlyoutLabelText {
  font-family: "Helvetica Neue", Helvetica, sans-serif;
  font-size: 14pt;
  fill: #575e75;
  font-weight: bold;
}

.ycBlockEditableText {
  cursor: text;
}

.ycBlockZoom image{
  cursor: pointer;
}
</style>

<script>
import yuchg from "../base";
import scratch from "../scratch";
import $ from "jquery";
import * as d3 from "d3";

var editor = null;

export default {
  name: "Scratch",
  props: ["width", "height", "virtual-width", "virtual-height", "flex"],
  data: function() {
    return {
      id: "scratch",
      size: {
        width: 800,
        height: 600,
        virtualWidth: 1600,
        virtualHeight: 1200
      },
      flyout: {
        width: 250
      }
    };
  },
  computed: {
    flyoutBackground: function(){
      return `M 0,0 h ${this.flyout.width} a 0 0 0 0 1 0 0 v ${this.size.height} a 0 0 0 0 1 0 0 h ${-this.flyout.width} z`
    }
  },
  created: function() {
    if (this.width != undefined) {
      this.size.width = parseInt(this.width);
    }

    if (this.height != undefined) {
      this.size.height = parseInt(this.height);
    }

    if (this["virtual-width"] != undefined) {
      this.size.virtualWidth = parseInt(this["virtual-width"]);
    }

    if (this["virtual-height"] != undefined) {
      this.size.virtualHeight = parseInt(this["virtual-height"]);
    }
  },
  mounted: function() {
    let that = this;
    editor = scratch.init($(that.$el));

    let _flex = parseInt(that.flex);
    if (_flex === 1) {
      // 随窗口动态改变大小
      var resizeEditor = function() {
        let $parentElement = $(that.$el);
        that.size.width = $parentElement[0].clientWidth;
        that.size.height = $parentElement[0].clientHeight;
      };

      window.onresize = function() {
        resizeEditor();
      };

      resizeEditor();
    }

    console.log(editor);

    editor.setOption({});
    //

    // 测试
    editor.addBlock({
      type: "locationx",
      state: {
        x: 100,
        y: 200
      }
    });

    editor.addBlock({
      type: "locationx",
      state: {
        x: 300,
        y: 200
      }
    });

  },
  methods: {}
};
</script>
