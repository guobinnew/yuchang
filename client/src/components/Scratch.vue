<template>
    <div :id="id" class="scratch" style="position: relative" onselectstart="return false" oncontextmenu="return false">
        <svg class="ycBlockSvg"
             :width="size.width"
             :height="size.height"
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
             <g class="ycBlockButtons" transform="translate(20,20)">
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
                <g class="ycBlockCanvas">
                    <rect fill-opacity="0" x="12" y="1960" height="56" width="96"></rect>
                </g>
                <g class="ycBlockBubbleCanvas">
                </g>
            </g>
        </svg>
        <div class="ycBlockToolbox" style="direction: ltr;" :height="size.height">
            <div class="ycBlockCategoryMenu">
            </div>
        </div>
        <div class="ycBlockWidgetDiv"></div>
        <div class="ycBlockDropDownDiv">
          <div class="ycBlockDropDownContent"></div>
          <div class="ycBlockDropDownArrow"></div>
        </div>
        <div class="ycBlockTooltipDiv"></div>
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

.ycBlockWsDragSurface.ycBlockOverflowVisible {
  overflow: visible;
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

.ycBlockButtions image {
  cursor: pointer;
}

.ycBlockWidgetDiv {
  display: none;
  position: absolute;
  z-index: 99999;
  direction: ltr;
  margin-left: 0px;
  border-radius: 16.5px;
}

.ycBlockWidgetDiv.fieldTextInput {
  overflow: hidden;
  border: 1px solid;
  box-sizing: border-box;
  transform-origin: 0 0;
  -ms-transform-origin: 0 0;
  -moz-transform-origin: 0 0;
  -webkit-transform-origin: 0 0;
}

.ycBlockHtmlInput {
  border-radius: 16.5px;
  transition: font-size 0.25s ease 0s;
  font-size: 12pt;
  border: none;
  font-family: "Helvetica Neue", Helvetica, sans-serif;
  height: 100%;
  margin: 0;
  outline: none;
  box-sizing: border-box;
  width: 100%;
  text-align: center;
  color: #575e75;
  font-weight: 500;
}

.ycBlockNonEditableText > text,
.ycBlockEditableText > text {
  fill: #575e75;
}

.ycBlockDropDownDiv {
  direction: ltr;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 1000;
  display: none;
  border: 1px solid;
  border-radius: 4px;
  box-shadow: 0px 0px 8px 1px rgba(0, 0, 0, 0.3);
  padding: 4px;
  -webkit-user-select: none;
  min-height: 26px;
}

.ycBlockDropDownContent {
  max-height: 300px;
  overflow: auto;
}

.ycBlockDropDownMenu {
  cursor: default;
  font: normal 13px "Helvetica Neue", Helvetica, sans-serif;
  outline: none;
  z-index: 20000;
}

.ycBlockWidgetDiv .ycBlockContextMenu {
  background: #fff;
  border-color: #ccc #666 #666 #ccc;
  border-style: solid;
  border-width: 1px;
  cursor: default;
  font: normal 13px "Helvetica Neue", Helvetica, sans-serif;
  margin: 0;
  outline: none;
  padding: 4px 0;
  position: absolute;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 20000;
  border-radius: 4px;
}

.ycBlockDropDownDiv .ycBlockDropDownMenuItemHover,
.ycBlockWidgetDiv .ycBlockContextMenuItemHover {
  background-color: rgba(0, 0, 0, 0.2);
}

.ycBlockDropDownMenuItem {
  color: #fff;
  font: normal 13px "Helvetica Neue", Helvetica, sans-serif;
  font-weight: bold;
  list-style: none;
  margin: 0;
  min-height: 18px;
  padding: 4px 7em 4px 28px;
  white-space: nowrap;
}

.ycBlockContextMenuItem {
  color: #333;
  font: normal 13px "Helvetica Neue", Helvetica, sans-serif;
  list-style: none;
  margin: 0;
  min-height: 18px;
  padding: 4px 7em 4px 28px;
  white-space: nowrap;
}

.ycBlockDropDownDiv .ycBlockSelected .ycBlockMenuItemCheckBox,
.ycBlockDropDownDiv .ycBlockSelected .ycBlockMenuItemIcon {
  background: url(../assets/sprites.png) no-repeat -48px -16px !important;
  position: static;
  float: left;
  margin-left: -24px;
}

.ycBlockDropDownDiv .ycBlockMenuItemCheckBox,
.ycBlockDropDownDiv .ycBlockMenuItemIcon {
  background-repeat: no-repeat;
  height: 16px;
  left: 6px;
  position: absolute;
  right: auto;
  vertical-align: middle;
  width: 16px;
}

.ycBlockDropDownArrow {
  position: absolute;
  left: 0;
  top: 0;
  width: 16px;
  height: 16px;
  z-index: -1;
  background-color: inherit;
  border-color: inherit;
}

.ycBlockArrowTop {
  border-top: 1px solid;
  border-left: 1px solid;
  border-top-left-radius: 4px;
  border-color: inherit;
}

.ycBlockArrowBottom {
  border-bottom: 1px solid;
  border-right: 1px solid;
  border-bottom-right-radius: 4px;
  border-color: inherit;
}
</style>

<script>
import Scratch from "../scratch/index"
import yuchg from "../base"
import logger from "../logger"

logger.setLevel("debug")

export default {
  name: "Scratch",
  props: ["width", "height", "flex", "loadbtn", "savebtn", "export"],
  data: function() {
    return {
      id: "scratch",
      size: {
        width: 800,
        height: 600
      },
      flyout: {
        width: 250
      },
      editor: null
    }
  },
  computed: {
    flyoutBackground: function() {
      return `M 0,0 h ${this.flyout.width} a 0 0 0 0 1 0 0 v ${
        this.size.height
      } a 0 0 0 0 1 0 0 h ${-this.flyout.width} z`
    }
  },
  created: function() {
    if (this.width != undefined) {
      this.size.width = parseInt(this.width)
    }

    if (this.height != undefined) {
      this.size.height = parseInt(this.height)
    }
  },
  mounted: function() {
    let that = this;
    that.editor = Scratch.init(that.$el)

    let _flex = parseInt(that.flex)
    if (_flex === 1) {
      // 随窗口动态改变大小
      var resizeEditor = function() {
        that.size.width = that.$el.clientWidth
        that.size.height = that.$el.clientHeight
      }

      window.onresize = function() {
        resizeEditor()
      }

      resizeEditor()
    }

    let buttons = []
    if (yuchg.isObject(this.loadbtn)) {
      buttons.push({
        id: "load",
        img: this.loadbtn.img,
        action: this.loadbtn.action
      })
    } else if (yuchg.isFunction(this.loadbtn)) {
      // 返回格式为 { img: '', action: func()}
      let btn = this.loadbtn()
      buttons.push({
        id: "load",
        img: btn.img,
        action: btn.action
      })
    }

    if (yuchg.isObject(this.savebtn)) {
      buttons.push({
        id: "save",
        img: this.savebtn.img,
        action: this.savebtn.action
      })
    } else if (yuchg.isFunction(this.savebtn)) {
      let btn = this.savebtn()
      buttons.push({
        id: "save",
        img: btn.img,
        action: btn.action
      })
    }

    that.editor.setOption({
      buttons: buttons,
      exportCallback: this.export
    })
  },
  methods: {}
};
</script>
