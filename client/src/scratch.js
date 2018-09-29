import yuchg from './base'
import $ from 'jquery'
import uuidv4 from 'uuid/v4'
import logger from './logger'
import blocks from './blocks/index'

logger.setLevel('debug')

// 缺省文字字体大小
const ycFontSize = 12 // ASCII
const ycUnicodeFontSize = 16 // UNICODE
// 计算文字长度
function computeTextLength(txt) {
  // 根据文字计算长度
  if (!yuchg.isString(txt) || txt === '') {
    return 0
  }

  let length = txt.length * ycFontSize
  let bytes = yuchg.strByteLength(txt) - txt.length
  length += bytes * (ycUnicodeFontSize - ycFontSize)
  return length
}

function acquireCategoryContext(cate) {
  if (blocks.categories) {
    return blocks.categories[cate]
  }
  return null
}

function acquireArgumentContext(id) {
  if (blocks.args) {
    for (let v of blocks.args.values()) {
      if (v.id === id) {
        return v
      }
    }
  }
  return null
}

// SVG命名空间
const ycSvgNS = 'http://www.w3.org/2000/svg'
const ycEvents = {
  resize: 'ycBlockEventResize',
  position: 'ycBlockEventPosition',
  background: 'ycBlockEventBackground'
}

const ShapeUtils = {
  /*
   {
   width: 16  // 水平端宽度
   stroke:  ''  // 线条颜色
   fill: ''  // 填充色
   opacity: '1'   // 透明度
   classes: ''
   height: 40 // 默认高度
   }
   */
  event: function (option) {

  },
  /*
   {
   width: 16  // 水平端宽度
   stroke:  ''  // 线条颜色
   fill: ''  // 填充色
   opacity: '1'   // 透明度
   classes: ''
   height: 40 // 默认高度
   }
   */
  slot: function (option) {
    let path = document.createElementNS(ycSvgNS, 'path')
    let $elem = $(path)

    if (!option) {
      option = {}
    }

    let headWidth = 48
    let cornerRadius = 4
    let bulgeHeight = 8 // 凸起高度
    let minContentWidth = 40
    let minContentHeight = 40

    // 内部
    const boundbox = {
      width: minContentWidth + cornerRadius + headWidth,
      height: minContentHeight + cornerRadius * 2,
      contentWidth: minContentWidth,
      contentHeight: minContentHeight,
      outerWidth: minContentWidth + cornerRadius + headWidth, // 包围盒宽度
      outerHeight: minContentHeight + cornerRadius * 2 + bulgeHeight // 包围盒高度
    }

    // 计算内容大小
    let _size = (w, h) => {
      let modify = !!w || !!h
      if (w) {
        boundbox.contentWidth = Math.max(w - headWidth - cornerRadius, minContentWidth)
      }

      if (h) {
        boundbox.contentHeight = Math.max(h - cornerRadius * 2, minContentHeight)
      }

      if (modify) {
        // 更新宽高
        boundbox.width = boundbox.outerWidth = boundbox.contentWidth + cornerRadius + headWidth
        boundbox.height = boundbox.contentHeight + cornerRadius * 2
        boundbox.outerHeight = boundbox.height + bulgeHeight
      }
    }

    // 更新尺寸大小
    _size(option.width, option.height)

    let d = '`m 0,4 A 4,4 0 0,1 4,0 H 12 c 2,0 3,1 4,2 l 4,4 c 1,1 2,2 4,2 h 12 c 2,0 3,-1 4,-2 l 4,-4 c 1,-1 2,-2 4,-2 H ${ 48 + size.contentWidth } a 4,4 0 0,1 4,4 v ${ size.contentHeight } a 4,4 0 0,1 -4,4 H 48 c -2,0 -3,1 -4,2 l -4,4 c -1,1 -2,2 -4,2 h -12 c -2,0 -3,-1 -4,-2 l -4,-4 c -1,-1 -2,-2 -4,-2 H 4 a 4,4 0 0,1 -4,-4 z`'
    let dfunc = new Function('size', 'return ' + d)
    $elem.attr('d', dfunc(boundbox))
    option.stroke && $elem.attr('stroke', option.stroke)
    option.fill && $elem.attr('fill', option.fill)
    option.opacity && $elem.attr('fill-opacity', option.opacity)
    $elem.addClass('ycBlockPath ycBlockBackground' + (option.classes ? (' ' + option.classes) : ''))

    // 自定义事件
    $elem.on(ycEvents.resize, function (event, opt) {
      event.stopPropagation()

      let log = `slot ${ycEvents.resize} event: `
      if (!opt) {
        logger.warn(log + `opt is null`)
        return
      }

      const $this = $(this)
      const option = {}

      if (opt.width) {
        if (!yuchg.isNumber(opt.width)) {
          logger.warn(log + `width is not number`)
        } else {
          option.width = opt.width
        }
      }
      if (opt.height) {
        if (!yuchg.isNumber(opt.height)) {
          logger.warn(log + `height is not number`)
        } else {
          option.height = opt.height
        }
      }
      _size(option.width, option.height)
      $this.attr('d', dfunc(boundbox))
      $this[0].__boundbox__ = boundbox
    })

    // 计算大小
    $elem[0].__boundbox__ = boundbox
    return $elem
  },
  /*
    {
       height: 32  // 高度
       contentWidth: 16  // 内容宽度
       stroke:  '#2E8EB8'  // 线条颜色
       fill: '#5CB1D6'  // 填充色
       opacity: '1'   // 透明度
       classes: ''
    }
   */
  roundRect: function (option) {
    let path = document.createElementNS(ycSvgNS, 'path')
    let $elem = $(path)
    let minContentWidth = 8
    let minRadius = 16

    if (!option) {
      option = {}
    }

    // 内部
    const boundbox = {
      width: minContentWidth + minRadius * 2,
      height: minRadius * 2,
      radius: minRadius,
      contentWidth: minContentWidth,
      contentHeight: minRadius * 2,
      outerWidth: minContentWidth + minRadius * 2, // 包围盒宽度
      outerHeight: minRadius * 2 // 包围盒高度
    }

    // 计算内容大小
    let _size = (w, h) => {
      let modify = !!w || !!h
      if (h) {
        boundbox.radius = Math.max(h / 2, minRadius)
      }

      if (w) {
        boundbox.contentWidth = Math.max(w - boundbox.radius * 2, minContentWidth)
      }

      if (modify) {
        boundbox.width = boundbox.outerWidth = boundbox.contentWidth + boundbox.radius * 2
        boundbox.height = boundbox.outerHeight = boundbox.radius * 2
      }
    }
    _size(option.width, option.height)

    let d = '`m 0,0 m ${size.radius},0 H ${size.radius + size.contentWidth} a ${size.radius} ${size.radius} 0 0 1 0 ${size.radius * 2} H ${size.radius} a ${size.radius} ${size.radius} 0 0 1 0 ${size.radius * -2} z`'
    let dfunc = new Function('size', 'return ' + d)
    $elem.attr('d', dfunc(boundbox))

    option.stroke && $elem.attr('stroke', option.stroke)
    option.fill && $elem.attr('fill', option.fill)
    option.opacity && $elem.attr('fill-opacity', option.opacity)
    $elem.addClass('ycBlockPath ycBlockBackground' + (option.classes ? (' ' + option.classes) : ''))
    // 自定义事件
    $elem.on(ycEvents.resize, function (event, opt) {
      event.stopPropagation()

      const log = `roundRect ${ycEvents.resize} event: `
      if (!opt) {
        logger.debug(log + `opt is null`)
        return
      }

      const $this = $(this)
      const option = {}

      if (opt.width) {
        if (!yuchg.isNumber(opt.width)) {
          logger.warn(log + `width is not number`)
        } else {
          option.width = opt.width
        }
      }
      if (opt.height) {
        if (!yuchg.isNumber(opt.height)) {
          logger.warn(log + `height is not number`)
        } else {
          option.height = opt.height
        }
      }
      _size(option.width, option.height)
      $this.attr('d', dfunc(boundbox))
      $this[0].__boundbox__ = boundbox
    })

    $elem[0].__boundbox__ = boundbox
    return $elem
  },

  /*
    {
       height: 32  // 高度
       contentWidth: 16  // 内容宽度
       stroke:  '#2E8EB8'  // 线条颜色
       fill: '#5CB1D6'  // 填充色
       opacity: '1'   // 透明度
       classes: ''
    }
   */
  diamondRect: function (option) {
    let path = document.createElementNS(ycSvgNS, 'path')
    let $elem = $(path)
    let minContentWidth = 8
    let minSide = 16

    if (!option) {
      option = {}
    }

    // 内部
    const boundbox = {
      width: minContentWidth + minSide * 2,
      height: minSide * 2,
      side: minSide,
      contentWidth: minContentWidth,
      contentHeight: minSide * 2,
      outerWidth: minContentWidth + minSide * 2, // 包围盒宽度
      outerHeight: minSide * 2 // 包围盒高度
    }

    // 计算内容大小
    let _size = (w, h) => {
      let modify = !!w || !!h
      if (h) {
        boundbox.side = Math.max(h / 2, minSide)
      }

      if (w) {
        boundbox.contentWidth = Math.max(w - boundbox.side * 2, minContentWidth)
      }

      if (modify) {
        boundbox.width = boundbox.outerWidth = boundbox.contentWidth + boundbox.side * 2
        boundbox.height = boundbox.outerHeight = boundbox.side * 2
      }
    }
    _size(option.width, option.height)

    let d = '`m 0,0 m ${size.side},0 H ${size.side + size.contentWidth} l ${size.side} ${size.side} l ${-size.side} ${size.side} H ${size.side} l ${-size.side} ${-size.side} l ${size.side} ${-size.side} z`'
    let dfunc = new Function('size', 'return ' + d)
    $elem.attr('d', dfunc(boundbox))

    option.stroke && $elem.attr('stroke', option.stroke)
    option.fill && $elem.attr('fill', option.fill)
    option.opacity && $elem.attr('fill-opacity', option.opacity)
    $elem.addClass('ycBlockPath ycBlockBackground' + (option.classes ? (' ' + option.classes) : ''))
    // 自定义事件
    $elem.on(ycEvents.resize, function (event, opt) {
      event.stopPropagation()
      const log = `diamondRect ${ycEvents.resize} event: `
      if (!opt) {
        logger.debug(log + `opt is null`)
        return
      }

      const $this = $(this)
      const option = {}

      if (opt.width) {
        if (!yuchg.isNumber(opt.width)) {
          logger.warn(log + `width is not number`)
        } else {
          option.width = opt.width
        }
      }
      if (opt.height) {
        if (!yuchg.isNumber(opt.height)) {
          logger.warn(log + `height is not number`)
        } else {
          option.height = opt.height
        }
      }
      _size(option.width, option.height)
      $this.attr('d', dfunc(boundbox))
      $this[0].__boundbox__ = boundbox
    })

    $elem[0].__boundbox__ = boundbox
    return $elem
  },

  /*
   {
   stroke:  '#000000'  // 线条颜色
   fill: '#000000'  // 填充色
   opacity: '0.2'   // 透明度
   classes: ''
   }
   */
  markerPath: function (option) {
    let path = document.createElementNS(ycSvgNS, 'path')
    let $elem = $(path)
    $elem.attr('stroke', option.stroke)
    $elem.attr('fill', option.fill)
    $elem.attr('fill-opacity', option.opacity)
    $elem.addClass('ycBlockPath ycBlockBackground' + (option.classes ? (' ' + option.classes) : ''))
    return $elem
  },

  /*
   {
   anchor: 'middle'  // 半径
   baseline: 'central'  // 水平端长度
   classes: ''
   text: ''
   x:
   y:
   translatex:
   translatey:
   }
   */
  text: function (option) {
    let text = document.createElementNS(ycSvgNS, 'text')
    let $elem = $(text)
    if (!option) {
      option = {}
    }
    $elem.addClass('ycBlockText' + (option.classes ? (' ' + option.classes) : ''))
    $elem.attr('text-anchor', option.anchor ? option.anchor : 'middle')
    $elem.attr('dominant-baseline', option.baseline ? option.baseline : 'central')
    $elem.attr('dy', '0')

    $elem.attr('x', option.x ? option.x : 0)
    $elem.attr('y', option.y ? option.y : 0)
    $elem.attr('transform', `translate(${option.translatex ? option.translatex : 0}, ${option.translatey ? option.translatey : 0})`)

    $elem.html(option.text ? option.text : '')

    // 自定义事件
    $elem.on(ycEvents.position, function (event, opt) {
      event.stopPropagation()
      const log = `text ${ycEvents.position} event: `
      if (!opt) {
        logger.debug(log + 'opt is null')
        return
      }

      const $this = $(this)

      if (opt.x) {
        if (!yuchg.isNumber(opt.x)) {
          logger.debug(log + `x is not number`)
        } else {
          $this.attr('x', opt.x)
        }
      }

      if (opt.y) {
        if (!yuchg.isNumber(opt.y)) {
          logger.debug(log + `y is not number`)
        } else {
          $this.attr('y', opt.y)
        }
      }

      let tx = 0
      let ty = 0
      if (!yuchg.isNumber(opt.translatex)) {
        logger.debug(log + `translatex is not number`)
      } else {
        tx = opt.translatex
      }

      if (!yuchg.isNumber(opt.translatey)) {
        logger.debug(log + `translatey is not number`)
      } else {
        ty = opt.translatey
      }
      $this.attr('transform', `translate(${tx}, ${ty})`)
    })

    return $elem
  },

  /*
   {
   type:  //
   shape:   //
   category:
   draggable:
   classes: ''
   }
   */
  group: function (option) {
    let g = document.createElementNS(ycSvgNS, 'g')
    let $elem = $(g)
    option.type && $elem.attr('data-type', option.type)
    option.shape && $elem.attr('data-shape', option.shape)
    option.category && $elem.attr('data-category', option.category)

    if (option.draggable === true) {
      $elem.addClass('ycBlockDraggable')
    }
    $elem.addClass((option.classes ? (' ' + option.classes) : ''))

    // 自定义事件
    $elem.on(ycEvents.position, function (event, opt) {
      event.stopPropagation()
      const log = `arguGroup ${ycEvents.position} event: `
      if (!opt) {
        logger.debug(log + 'opt is null')
        return
      }

      const $this = $(this)

      let tx = 0
      let ty = 0
      if (!yuchg.isNumber(opt.translatex)) {
        logger.debug(log + `translatex is not number`)
      } else {
        tx = opt.translatex
      }

      if (!yuchg.isNumber(opt.translatey)) {
        logger.debug(log + `translatey is not number`)
      } else {
        ty = opt.translatey
      }

      $this.attr('transform', `translate(${tx}, ${ty})`)
    })
    return $elem
  },

  /*
   {
   type:  //
   shape:   //
   translatex:
   translatey:
   }
   */
  arguGroup: function (option) {
    let g = document.createElementNS(ycSvgNS, 'g')
    let $elem = $(g)
    option.type && $elem.attr('data-argument-type', option.id)
    option.shape && $elem.attr('data-shape', option.shape)
    $elem.attr('transform', `translate(${option.translatex ? option.translatex : 0}, ${option.translatey ? option.translatey : 0})`)

    // 自定义事件
    $elem.on(ycEvents.position, function (event, opt) {
      event.stopPropagation()

      const log = `arguGroup ${ycEvents.position} event: `
      if (!opt) {
        logger.debug(log + 'opt is null')
        return
      }

      const $this = $(this)

      let tx = 0
      let ty = 0
      if (!yuchg.isNumber(opt.translatex)) {
        logger.debug(log + `translatex is not number`)
      } else {
        tx = opt.translatex
      }

      if (!yuchg.isNumber(opt.translatey)) {
        logger.debug(log + `translatey is not number`)
      } else {
        ty = opt.translatey
      }
      $this.attr('transform', `translate(${tx}, ${ty})`)
    }).on(ycEvents.background, function (event, opt) {
      event.stopPropagation()

      const $this = $(this)
      const $path = $this.children('path')
      const log = `arguGroup ${ycEvents.background} event: `
      if (!opt) {
        logger.debug(log + 'opt is null')
        return
      }

      if (opt.stroke) {
        if (!yuchg.isString(opt.stroke)) {
          logger.debug(log + `stroke is not string`)
        } else {
          $path.attr('stroke', opt.stroke)
        }
      }

      if (opt.fill) {
        if (!yuchg.isString(opt.fill)) {
          logger.debug(log + `fill is not string`)
        } else {
          $path.attr('fill', opt.stroke)
        }
      }

      if (opt.opacity) {
        if (!yuchg.isNumber(+opt.opacity)) {
          logger.debug(log + `opacity is not number`)
        } else {
          $path.attr('fill-opacity', opt.opacity)
        }
      }
    })
    return $elem
  },

  /*
   {
   classes: ''
   text: ''
   translatex:
   translatey:
   width:
   height:
   }
   */
  flyoutLabel: function (option) {
    let g = document.createElementNS(ycSvgNS, 'g')
    let $elem = $(g)
    $elem.attr('display', 'block')
    $elem.attr('transform', `translate(${option.translatex ? option.translatex : 0}, ${option.translatey ? option.translatey : 0})`)
    $elem.addClass('ycBlockFlyoutLabel' + (option.classes ? (' ' + option.classes) : ''))

    let rect = document.createElementNS(ycSvgNS, 'rect')
    let $rect = $(rect)
    $rect.attr('rx', '4')
    $rect.attr('ry', '4')
    $rect.attr('width', option.width)
    $rect.attr('height', option.height)
    $rect.addClass('ycBlockFlyoutLabelBackground')
    $elem.append($rect)

    let text = document.createElementNS(ycSvgNS, 'text')
    let $text = $(text)
    $text.attr('x', '0')
    $text.attr('y', option.height / 2)
    $text.attr('dy', '0')
    $text.attr('text-anchor', 'start')
    $text.attr('dominant-baseline', 'central')
    $text.addClass('ycBlockFlyoutLabelText')
    $text.html(option.text ? option.text : '')
    $elem.append($text)

    return $elem
  },

  /*
   {
   translatex
   translatey
   value:
   x:
   y:
   }
   */
  editableText: function (option) {
    let g = document.createElementNS(ycSvgNS, 'g')
    let $elem = $(g)
    $elem.attr('transform', `translate(${option.translatex ? option.translatex : 8}, ${option.translatey ? option.translatey : 0})`)
    $elem.addClass('ycBlockEditableText')

    let text = document.createElementNS(ycSvgNS, 'text')
    let $text = $(text)

    $text.attr('x', option.x ? option.x : 0)
    $text.attr('y', option.y ? option.y : 0)
    $text.attr('text-anchor', 'middle')
    $text.attr('dominant-baseline', 'central')
    $text.attr('dy', '0')
    $text.addClass('ycBlockText')
    $elem.append($text)

    // 自定义事件
    $elem.on(ycEvents.position, function (event, opt) {
      event.stopPropagation()
      const log = `slot ${ycEvents.position} event: `
      if (!opt) {
        logger.debug(log + 'opt is null')
        return
      }

      const $this = $(this)

      let tx = 0
      let ty = 0
      if (!yuchg.isNumber(opt.translatex)) {
        logger.debug(log + `translatex is not number`)
      } else {
        tx = opt.translatex
      }

      if (!yuchg.isNumber(opt.translatey)) {
        logger.debug(log + `translatey is not number`)
      } else {
        ty = opt.translatey
      }
      $this.attr('transform', `translate(${tx}, ${ty})`)

      let $thistext = $this.children('text')
      if (!yuchg.isNumber(opt.x)) {
        logger.debug(log + `x is not number`)
      } else {
        $thistext.attr('x', opt.x)
      }

      if (!yuchg.isNumber(opt.y)) {
        logger.debug(log + `y is not number`)
      } else {
        $thistext.attr('y', opt.y)
      }
    })

    return $elem
  }
}

// 块实例
class BlockInstance {
  constructor(proto, state) {
    this.uid = uuidv4() // 唯一标示
    this.proto = proto
    this.elem = null
    this.prev = null
    this.next = null
    this.parent = null // 父元素
    this.children = [] // 内部子元素
    this.state = {}
    logger.debug('INSTANCE', state)
    this.update(state)
  }

  // 获取对应的DOM根元素
  element() {
    if (!this.elem) {
      this.elem = $(this.proto.prototypeElement).clone(true)
    }
    return this.elem
  }

  // 更新状态
  update(state, force = false) {
    let modify = []
    if (!force) {
      // 检查需要更新的属性
      for (let [key, val] of Object.entries(state)) {
        if (!yuchg.isDef(this.state[key]) || this.state[key] !== val) {
          modify.push(key)
        }
        this.state[key] = val
      }
    }

    const $elem = this.element()

    let opt = {
      dom: $elem,
      proto: this.proto,
      state: this.state,
      modify: modify
    }
    this.proto.adjust(opt)

    if (modify.length > 0 && (modify.indexOf('x') || modify.indexOf('y'))) {
      this.updatePosition($elem)
    }
  }

  // 更新位置
  updatePosition(dom) {
    dom.trigger(ycEvents.position, [{
      translatex: yuchg.isNumber(this.state.x) ? this.state.x : 0,
      translatey: yuchg.isNumber(this.state.y) ? this.state.y : 0
    }])
  }
}

/*
Block基类
*/
class Block {
  constructor(def) {
    this.instances = [] // 实例列表
    this.def = {
      display: { // 显示设置
        minContentWidth: 8, // 内容显示区域宽度，最小宽度
        minHeight: 32,
        space: 4 // 边框/间距
      },
      background: {},
      state: { // 动态变换
        contentWidth: 8,
        contentHeight: 32,
        width: 8, // 宽度根据Block类型不同而不同，默认等于contentWidth
        height: 32 // 高度根据Block类型不同而不同，默认等于contentHeight
      }
    }

    // 获取默认类目信息
    let cate = acquireCategoryContext(def.category)
    if (cate && cate.background) {
      Object.assign(this.def.background, cate.background)
    }

    // 更新display设置(深度拷贝)
    $.extend(true, this.def, def)

    this.prototypeElement = this.createElement()
    if (this.prototypeElement) {
      this.prototypeElement.attr('data-block', this.def.id)
    }
  }

  // 内容padding
  padding() {
    let p = {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    }

    if (yuchg.isDefAndNotNull(this.def.display.padding)) {
      const pd = this.def.display.padding
      // 如果定义padding
      if (yuchg.isNumber(pd)) { // 如果是单个数值
        for (let key of Object.keys(p)) {
          p[key] = pd
        }
      } else if (yuchg.isObject(pd)) { // 分别指定, 默认为0
        for (let key of Object.keys(p)) {
          pd[key] && (p[key] = pd[key])
        }
      }
    } else { // 如果没有定义padding, 则根据类型进行动态计算

      // slot|control 固定padding为8
      if (this.def.shape === 'slot' || this.def.shape === 'control') {
        p.left = p.right = 8
      } else {
        p.left = p.right = this.def.state.height / 2 // 默认取高度一半
      }
    }
    return p
  }

  // 创建DOM对象原型
  createElement() {
    return null
  }

  // 调整尺寸
  /*
  {
    proto: // 为原型定义
    state: // 状态
    dom: // DOM根元素
    modify: // 为需要更新的状态列表
  }
   */
  adjust(option) {
    if (yuchg.isArray(option.modify) && option.modify.length > 0) {
      // 开启部分更新

    }
    option.dom.trigger(ycEvents.position, [{
      translatex: yuchg.isNumber(option.state.x) ? option.state.x : 0,
      translatey: yuchg.isNumber(option.state.y) ? option.state.y : 0
    }])
  }

  // 克隆一个对象实例, state为状态变量 
  /*
  {
     x: // X坐标
     y: // Y坐标
  }
   */
  instance(state) {
    let s = Object.assign({}, this.def.state, state) // 拷贝当前的state
    var inst = new BlockInstance(this, s)
    this.instances.push(inst)
    return inst
  }
}

/*
Block基类
*/
class BlockArgument extends Block {
  constructor(def) {
    if (def.shape === 'boolean') {
      def.display.minContentWidth = 16
    }
    super(def)
  }

  createElement() {
    var $elem = ShapeUtils.arguGroup(this.def)
    let opt = {
      contentWidth: this.def.state.width,
      height: this.def.state.height
    }
    Object.assign(opt, this.def.background)

    let $shape = null
    if (this.def.shape === 'boolean') {
      this.def.state.value = this.def.value ? !!this.def.value : false
      opt.contentWidth = 16
      $shape = ShapeUtils.diamondRect(opt)
      $elem.append($shape)
    } else if (this.def.shape === 'dropdown') {
      this.def.state.currentIndex = this.def.currentIndex ? parseInt(this.def.currentIndex) : -1
      this.def.state.values = this.def.values
      $shape = ShapeUtils.roundRect(opt)
    } else if (this.def.shape === 'number') {
      this.def.state.value = this.def.value ? parseInt(this.def.value) : 0
      $shape = ShapeUtils.roundRect(opt)
      $elem.append($shape)
      $elem.append(ShapeUtils.editableText({
        text: this.def.state.value
      }))
    } else {
      this.def.state.value = this.def.value ? this.def.value : ''
      // 缺省外形
      $shape = ShapeUtils.roundRect(opt)
      $elem.append($shape)
      $elem.append(ShapeUtils.editableText({
        text: this.def.state.value
      }))
    }

    this.def.state.width = $shape[0].__boundbox__.width
    this.def.state.height = $shape[0].__boundbox__.height
    this.def.state.contentWidth = $shape[0].__boundbox__.contentWidth
    this.def.state.contentHeight = $shape[0].__boundbox__.contentHeight

    this.adjust({
      dom: $elem,
      proto: this,
      state: this.def.state
    })
    return $elem
  }

  adjust(option) {

    const def = option.proto.def
    const padding = option.proto.padding()
    // 根据def计算尺寸
    if (def.shape === 'dropdown') {

    } else {
      let txt = ''
      // 根据文字计算长度
      if (def.shape !== 'boolean') {
        txt = '' + option.state.value
      } else {
        def.display.minContentWidth = 16
      }
      let length = computeTextLength(txt)
      option.state.contentWidth = length < def.display.minContentWidth ? def.display.minContentWidth : length
      option.state.width = option.state.contentWidth + padding.left + padding.right

      let $shape = option.dom.children('path')
      $shape.trigger(ycEvents.resize, [{
        width: option.state.width,
        height: option.state.height
      }])

      // 更新大小
      option.state.width = $shape[0].__boundbox__.width
      option.state.height = $shape[0].__boundbox__.height
      option.state.contentWidth = $shape[0].__boundbox__.contentWidth
      option.state.contentHeight = $shape[0].__boundbox__.contentHeight

      let $text = option.dom.children('text')
      $text.trigger(ycEvents.position, [{
        x: option.state.height / 2 + option.state.contentWidth / 2,
        translatex: 0,
        translatey: option.state.height / 2
      }])
    }
  }

  instance(state) {
    let inst = super.instance(state)
    // 给实例添加方法
    // inst.setText = function (txt) {
    //   this.proto && yuchg.isFunction(this.proto.adjust) && this.proto.adjust()
    // }
    return inst
  }
}

class BlockMarker extends Block {
  constructor(def) {
    super(def)
  }

  createElement() {
    var $elem = ShapeUtils.group(this.def)
    if (this.def.id === 'insertmarker') {
      $elem.addClass('ycBlockInsertionMarker')
    }
    $elem.append(ShapeUtils.markerPath(this.def.background))
    this.adjust({
      dom: $elem,
      proto: this,
      state: this.def.state
    })
    return $elem
  }
}

class BlockVariant extends Block {
  constructor(def) {
    def.display.minHeight = 40
    def.state.height = 40
    super(def)
  }

  createElement() {
    let $elem = ShapeUtils.group(this.def)
    let opt = {
      height: this.def.state.height
    }
    $.extend(opt, this.def.background)
    let $shape = null
    if (this.def.shape === 'boolean') { // 布尔类型
      $shape = ShapeUtils.diamondRect(opt)
    } else {
      // 缺省外形
      $shape = ShapeUtils.roundRect(opt)
    }
    $elem.append($shape)

    // 更新大小
    this.def.state.width = $shape[0].__boundbox__.width
    this.def.state.height = $shape[0].__boundbox__.height
    this.def.state.contentWidth = $shape[0].__boundbox__.contentWidth
    this.def.state.contentHeight = $shape[0].__boundbox__.contentHeight

    $elem.append(ShapeUtils.text({
      text: this.def.text
    }))

    this.adjust({
      dom: $elem,
      proto: this,
      state: this.def.state
    })
    return $elem
  }

  // 计算调整内部子元素位置
  adjust(option) {

    // 根据文字计算长度
    const def = option.proto.def
    const padding = option.proto.padding()

    let length = computeTextLength(def.text)
    option.state.contentWidth = length < def.display.minContentWidth ? def.display.minContentWidth : length

    if (def.shape === 'dropdown') {
      // 枚举变量
    } else {
      option.state.width = option.state.contentWidth + padding.left + padding.right
    }

    let $shape = option.dom.children('path')
    $shape.trigger(ycEvents.resize, [{
      width: option.state.width,
      height: option.state.height
    }])

    // 更新大小
    option.state.width = $shape[0].__boundbox__.width
    option.state.height = $shape[0].__boundbox__.height
    option.state.contentWidth = $shape[0].__boundbox__.contentWidth
    option.state.contentHeight = $shape[0].__boundbox__.contentHeight

    let $text = option.dom.children('text')
    $text.trigger(ycEvents.position, [{
      x: padding.left + option.state.contentWidth / 2,
      y: 0,
      translatex: 0,
      translatey: option.state.height / 2
    }])
  }
}

class BlockStack extends Block {
  constructor(def) {
    def.display.minHeight = 40
    def.state.height = 40
    super(def)
  }

  createElement() {
    let $elem = this.createContainer()
    this.sections = []
    // 创建Section
    for (let sec of this.def.sections.values()) {
      let secblock = Object.assign({}, sec)
      this.sections.push(secblock)
      let $child = this.createSection(secblock)
      if (!$child) {
        logger.debug('block' + this.name + 'createSection failed:' + sec)
        continue
      }
      // 修改边框颜色
      if (this.def.background && this.def.background.stroke) {
        $child.trigger(ycEvents.background, [{
          stroke: this.def.background.stroke
        }])
      }

      $elem.append($child)
    }

    this.adjust({
      dom: $elem,
      proto: this,
      state: this.def.state
    })

    return $elem
  }

  // 创建Sections
  createSection(sec) {
    if (sec.type === 'argument') {
      return this.addArgument(sec)
    } else if (sec.type === 'text') {
      sec.$elem = ShapeUtils.text(sec)
      return sec.$elem
    }
  }

  addArgument(sec, parent) {
    if (!sec || !sec.datatype) {
      return
    }

    // 创建Block实例
    let inst = this.def.__panel__.createBlockInstance(sec.datatype, sec.state)
    if (!inst) {
      return
    }

    sec.instance = inst
    return sec.instance.element()
  }

  adjust(option) {
    const def = option.proto.def
    const padding = option.proto.padding()
    const sections = option.proto.sections

    // 计算section尺寸
    let space = def.display.space
    let offsetx = padding.left
    let contentHeight = 20

    // 先计算宽度和最大高度
    for (let sec of sections.values()) {
      if (sec.type === 'argument' && sec.instance) {
        offsetx += sec.instance.state.width
        contentHeight = Math.max(contentHeight, sec.instance.state.height)
      } else if (sec.type === 'text' && sec.$elem) {
        let l = computeTextLength(sec.text)
        offsetx += l
      }
      offsetx += space
    }

    offsetx -= space
    option.state.width = offsetx + padding.right
    option.state.height = contentHeight + padding.top + padding.bottom

    // 调整容器大小
    let $shape = option.dom.children('path')
    $shape.trigger(ycEvents.resize, [{
      width: option.state.width,
      height: option.state.height
    }])

    // 更新大小
    option.state.width = $shape[0].__boundbox__.width
    option.state.height = $shape[0].__boundbox__.height
    option.state.contentWidth = $shape[0].__boundbox__.contentWidth
    option.state.contentHeight = $shape[0].__boundbox__.contentHeight


    offsetx = padding.left
  
    // 调整位置
    for (let sec of sections.values()) {
      let $child = null
      if (sec.type === 'argument' && sec.instance) {
        $child = sec.instance.element()
        // 根据高度调整文本位置
        $child.trigger(ycEvents.position, [{
          translatex: offsetx,
          translatey: (option.state.height - sec.instance.state.height) / 2
        }])
        offsetx += sec.instance.state.width
      } else if (sec.type === 'text' && sec.$elem) {
        $child = sec.$elem
        let l = computeTextLength(sec.text)
        // 根据高度调整文本位置
        $child.trigger(ycEvents.position, [{
          x: l / 2,
          y: -space / 2,
          translatex: offsetx,
          translatey: option.state.height / 2
        }])
        offsetx += l
      }
      offsetx += space
    }
  }

  createContainer() {
    return null
  }

  instance(state) {
    let inst = super.instance(state)
    // 给实例添加方法
    // inst.setText = function (txt) {
    //   this.proto && yuchg.isFunction(this.proto.adjust) && this.proto.adjust()
    // }
    return inst
  }
}

class BlockExpress extends BlockStack {
  constructor(def) {
    super(def)
  }

  createContainer() {
    let $g = ShapeUtils.group(this.def)
    let opt = Object.assign({}, this.def.background)
    let $shape = null
    if (this.def.shape === 'boolean') { // 布尔类型
      $shape = ShapeUtils.diamondRect(opt)
    } else {
      // 缺省外形
      $shape = ShapeUtils.roundRect(opt)
    }
    $g.append($shape)
    // 更新大小
    this.def.state.width = $shape[0].__boundbox__.width
    this.def.state.height = $shape[0].__boundbox__.height
    this.def.state.contentWidth = $shape[0].__boundbox__.contentWidth
    this.def.state.contentHeight = $shape[0].__boundbox__.contentHeight
    return $g
  }
}

class BlockEvent extends BlockStack {
  constructor(def) {
    super(def)
  }

  createContainer() {
    let $g = ShapeUtils.group(this.def)
    let opt = {}
    $.extend(opt, this.def.background)
    // 缺省外形
    let $shape = ShapeUtils.event(opt)
    $g.append($shape)

    // 更新大小
    this.def.state.width = $shape[0].__boundbox__.width
    this.def.state.height = $shape[0].__boundbox__.height
    this.def.state.contentWidth = $shape[0].__boundbox__.contentWidth
    this.def.state.contentHeight = $shape[0].__boundbox__.contentHeight

    return $g
  }
}

class BlockAction extends BlockStack {
  constructor(def) {
    def.state.contentHeight = 40
    def.display.minContentHeight = 40
    super(def)
  }

  createContainer() {
    let $g = ShapeUtils.group(this.def)
    let opt = Object.assign({}, this.def.background)
    // 缺省外形
    let $shape = ShapeUtils.slot(opt)
    $g.append($shape)

    // 更新大小
    this.def.state.width = $shape[0].__boundbox__.width
    this.def.state.height = $shape[0].__boundbox__.height
    this.def.state.contentWidth = $shape[0].__boundbox__.contentWidth
    this.def.state.contentHeight = $shape[0].__boundbox__.contentHeight

    return $g
  }

  adjust(option) {
    const def = option.proto.def
    const padding = option.proto.padding()
    const sections = option.proto.sections

    // 计算section尺寸
    let space = def.display.space
    let offsetx = padding.left
    let contentHeight = 20

    // 先计算宽度和最大高度
    for (let sec of sections.values()) {
      if (sec.type === 'argument' && sec.instance) {
        offsetx += sec.instance.state.width
        contentHeight = Math.max(contentHeight, sec.instance.state.height)
      } else if (sec.type === 'text' && sec.$elem) {
        let l = computeTextLength(sec.text)
        offsetx += l
      }
      offsetx += space
    }

    offsetx -= space
    option.state.width = offsetx + padding.right
    option.state.height = contentHeight + padding.top + padding.bottom

    // 调整容器大小
    let $shape = option.dom.children('path')
    $shape.trigger(ycEvents.resize, [{
      width: option.state.width,
      height: option.state.height
    }])

    // 更新大小
    option.state.width = $shape[0].__boundbox__.width
    option.state.height = $shape[0].__boundbox__.height
    option.state.contentWidth = $shape[0].__boundbox__.contentWidth
    option.state.contentHeight = $shape[0].__boundbox__.contentHeight

    offsetx = padding.left
   
    // 根据新大小调整位置
    for (let sec of sections.values()) {
      let $child = null
      if (sec.type === 'argument' && sec.instance) {
        $child = sec.instance.element()
        // 根据高度调整文本位置
        $child.trigger(ycEvents.position, [{
          translatex: offsetx,
          translatey: (option.state.height - sec.instance.state.height) / 2
        }])
        offsetx += sec.instance.state.width
      } else if (sec.type === 'text' && sec.$elem) {
        $child = sec.$elem
        let l = computeTextLength(sec.text)
        // 根据高度调整文本位置
        $child.trigger(ycEvents.position, [{
          x: l / 2,
          y: 0,
          translatex: offsetx,
          translatey: option.state.height / 2 // 中心定位
        }])
        offsetx += l
      }
      offsetx += space
    }
  }
}

class BlockControl extends BlockStack {
  constructor(def) {
    super(def)
  }

  createContainer() {

  }
}

// 创建原型对象
function createPrototype(opt) {
  if (!opt.type) {
    return null
  }

  var proto = null
  if (opt.type === 'variant') {
    proto = new BlockVariant(opt)
  } else if (opt.type === 'marker') {
    proto = new BlockMarker(opt)
  } else if (opt.type === 'action') {
    proto = new BlockAction(opt)
  } else if (opt.type === 'event') {
    proto = new BlockEvent(opt)
  } else if (opt.type === 'express') {
    proto = new BlockExpress(opt)
  } else if (opt.type === 'control') {
    proto = new BlockControl(opt)
  } else if (opt.type === 'argument') {
    proto = new BlockArgument(opt)
  }

  return proto
}

class Panel {
  constructor(dom) {
    this.dom = {}
    this.dom.$root = dom
    this.dom.$svg = dom.find('.ycBlockSvg')
    this.dom.$info = this.dom.$svg.find('#ycBlockInfo')
    this.dom.$ws = this.dom.$svg.find('.ycBlockWorkspace')
    this.dom.$canvas = this.dom.$ws.find('.ycBlockCanvas')

    this.dom.$bubblecanvas = dom.find('.ycBlockBubbleCanvas')
    this.dom.$dragsurface = dom.find('.ycBlockDragSurface')
    this.dom.$dragcanvas = dom.find('.ycBlockDragCanvas')
    this.dom.$canvasList = [this.dom.$canvas, this.dom.$bubblecanvas, this.dom.$dragcanvas]

    this.dom.$flyout = dom.find('.ycBlockFlyout')
    this.dom.$flyoutws = this.dom.$flyout.find('.ycBlockWorkspace')
    this.dom.$flyoutcanvas = this.dom.$flyoutws.find('.ycBlockCanvas')
    this.dom.$flyoutbubblecanvas = this.dom.$flyoutws.find('.ycBlockBubbleCanvas')
    this.dom.$flyoutcanvasList = [this.dom.$flyoutcanvas, this.dom.$flyoutbubblecanvas]

    this.dom.$menu = dom.find('.ycBlockCategoryMenu')

    this.marker = null

    this.registries = {} // block注册列表
    this.instances = [] // block实例数组

    this.grapPoint = {
      x: 0,
      y: 0
    }
    this.lastPoint = {
      x: 0,
      y: 0
    }
    this.mousePoint = {
      x: 0,
      y: 0
    }

    this.$selected = null
    this.currentZoomFactor = 1.0
    this.startDrag = false

    this.flyoutgrapPoint = {
      x: 0,
      y: 0
    }
    this.flyoutlastPoint = {
      x: 0,
      y: 0
    }
    this.$flyoutselected = null
    this.flyoutstartDrag = false
    this.flyoutZoomFactor = 0.675
    this.flyoutHeight = 0

    this.option = {
      width: 800,
      height: 600,
      virtualWidth: 1600,
      virtualHeight: 1200,
      blocks: blocks
    }

    let that = this
    // 鼠标事件
    this.dom.$svg.on('mousedown', () => {
      this.lastPoint.x = event.pageX
      this.lastPoint.y = event.pageY
      this.startDrag = true
      return false
    }).on('mousemove', function () {
      let X = $(this).offset().left
      let Y = $(this).offset().top
      that.updateInfo({
        x: event.pageX - X,
        y: event.pageY - Y
      })

      let deltaX = event.pageX - that.lastPoint.x
      let deltaY = event.pageY - that.lastPoint.y

      if (!that.$selected && that.startDrag) {
        that.lastPoint.x = event.pageX
        that.lastPoint.y = event.pageY
        let m = that.dom.$canvas[0].getCTM()
        let trans = 'translate(' + (Number(m.e) + deltaX) + ',' + (Number(m.f) + deltaY) + ') ' + 'scale(' + that.currentZoomFactor + ')'
        that.setCanvasTransfrom(that.dom.$canvasList, trans)
      } else if (that.$selected && that.$selected.hasClass('ycBlockSelected')) {
        // 改变父节点
        if (!that.$selected.hasClass('ycBlockDragging')) {
          // 插入占位
          var $marker = that.marker.element()
          $marker.insertAfter(that.$selected)
          that.dom.$dragsurface.css('display', 'block')
          that.dom.$dragcanvas.append(that.$selected)
          that.$selected.addClass('ycBlockDragging')
        }
        // 根据鼠标位置调整surface
        that.dom.$dragsurface.attr('style', 'display: block; transform: translate3d(' + deltaX + 'px,' + deltaY + 'px,0px)')
      }
    }).on('mouseup mouseleave', function () {
      that.startDrag = false
      if (that.$selected && that.$selected.hasClass('ycBlockSelected')) {
        if (that.$selected.hasClass('ycBlockDragging')) {
          // 插入占位
          var $marker = that.marker.element()
          that.$selected.insertBefore($marker)
          that.$selected.removeClass('ycBlockDragging')
          $marker.remove()
          // 更新变换
          let dm = that.dom.$dragsurface.css('transform').replace(/[^0-9\-,]/g, '').split(',')
          let m = that.$selected[0].getCTM()
          that.$selected.attr('transform', 'translate(' + (Number(dm[4]) + that.grapPoint.x) / Number(m.a) + ',' + (Number(dm[5]) + that.grapPoint.y) / Number(m.d) + ')')
          that.dom.$dragsurface.css('display', 'none;')
        }
        that.$selected.removeClass('ycBlockSelected')
        that.$selected = null
      }
    })

    this.dom.$flyout.on('mousedown', () => {
      this.flyoutlastPoint.x = event.pageX
      this.flyoutlastPoint.y = event.pageY
      this.flyoutstartDrag = true
      return false
    }).on('mousemove', function () {
      let deltaY = event.pageY - that.flyoutlastPoint.y
      if (!that.$flyoutselected && that.flyoutstartDrag) {
        that.flyoutlastPoint.x = event.pageX
        that.flyoutlastPoint.y = event.pageY
        let m = that.dom.$flyoutcanvas[0].getCTM()

        let y = Number(m.f) + deltaY
        if (y > 0) {
          y = 0
        }
        let height = Number(that.dom.$flyout.attr('height'))
        let maxY = (height - that.flyoutHeight) * that.flyoutZoomFactor

        if (y < maxY) {
          y = maxY
        }

        let trans = 'translate(0,' + y + ') ' + 'scale(' + that.flyoutZoomFactor + ')'
        that.setCanvasTransfrom(that.dom.$flyoutcanvasList, trans)

      } else if (that.$flyoutselected && that.$flyoutselected.hasClass('ycBlockSelected')) {}
    }).on('mouseup mouseleave', function () {
      that.flyoutstartDrag = false
      if (that.$flyoutselected && that.$flyoutselected.hasClass('ycBlockSelected')) {}
    })
  }

  updateInfo(info) {
    this.mousePoint.x = info.x
    this.mousePoint.y = info.y
    this.dom.$info.html('X: ' + info.x + '  Y: ' + info.y)
  }

  // 统一设置canvas变换矩阵（平移，缩放）
  setCanvasTransfrom(canvas, trans) {
    canvas.forEach(function (item) {
      item.attr('transform', trans)
    })
  }

  setOption(opt) {
    // 合并
    $.extend(true, this.option, opt)

    let registries = this.registries
    let defs = this.option.blocks.blocks
    let args = this.option.blocks.args
    //
    let cates = this.option.blocks.categories
    for (let val of Object.values(cates)) {
      val.blocks = []
    }

    // 先注册参数对象（后面注册Block需要用到）
    for (let def of args.members.values()) {
      // 提示重复
      if (registries[def.id]) {
        logger.debug('argument registered repeated: ' + def.id)
      }
      registries[def.id] = createPrototype(Object.assign({
        type: 'argument',
        __panel__: this,
        display: {},
        background: {},
        state: {}
      }, def))
      if (!registries[def.id]) {
        logger.debug('argument registered failed: ' + def.id)
      } else {
        logger.debug('argument registered successed: ' + def.id)
      }
    }

    // 注册Block
    for (let [type, val] of Object.entries(defs)) {
      for (let def of val.members.values()) {
        // 提示重复
        if (registries[def.id]) {
          logger.debug('block registered repeated: ' + def.id)
        }

        registries[def.id] = createPrototype(Object.assign({
          type: type,
          __panel__: this,
          display: {},
          background: {},
          state: {}
        }, def))
        if (!registries[def.id]) {
          logger.debug('block registered failed: ' + def.id)
        } else {
          cates[def.category].blocks.push(def.id)
          logger.debug('block registered successed: ' + def.id)
        }
      }
    }

    this.prepare()
  }

  prepare() {
    this.marker = this.createBlockInstance('insertmarker')
    // 初始化toolbox
    this.initCategoryToolbox()
  }

  initCategoryToolbox() {
    var categories = this.option.blocks.categories
    var dom = this.dom
    var registries = this.registries

    function createMenu(key) {
      var cate = categories[key]
      if (!cate) {
        logger.debug('category can not found: ' + key)
        return
      }
      var $menurow = $('<div class="ycBlockCategoryMenuRow"></div>')
      var $menuitem = $(`<div class="ycBlockCategoryMenuItem" data-id="${ key }"></div>`)
      $menuitem.append($(`<div class="ycBlockCategoryItemBubble" style="background-color: ${ cate.background.fill }; border-color: ${ cate.background.stroke };"></div>`))
      $menuitem.append($(`<div class="ycBlockCategoryMenuItemLabel">${ cate.name }</div>`))
      $menurow.append($menuitem)

      $menuitem.on('click', function () {
        logger.debug('click ----- ' + $(this).data('id'))
      })

      return $menurow
    }

    let offsety = 12
    let toolboxspace = 64
    $.each(categories, function (key, val) {
      if (!val.display || val.display !== 'none') {
        // 创建菜单
        let $menuitem = createMenu(key)
        categories[key].$menuitem = $menuitem
        dom.$menu.append($menuitem)

        // 创建Label
        let labellen = computeTextLength(val.name) + 16

        let $label = ShapeUtils.flyoutLabel({
          text: val.name,
          width: labellen,
          height: 40,
          translatex: 20,
          translatey: offsety
        })
        categories[key].$flyoutlable = $label
        dom.$flyoutcanvas.append($label)
        offsety += toolboxspace

        // 创建列表
        if (val.blocks) {
          $.each(val.blocks, function (index, block) {
            let proto = registries[block]
            if (proto && proto.prototypeElement) {
              let $elem = $(proto.prototypeElement).clone(true)
              $elem.attr('transform', `translate(36, ${offsety})`)
              dom.$flyoutcanvas.append($elem)
              offsety += toolboxspace
            } else {
              logger.debug('block registry is corrupted:' + block)
            }
          })
        }
      }
    })

    // 记录总高度
    this.flyoutHeight = offsety
  }

  createBlockInstance(type, state) {
    // 坚持类型是否注册
    if (!this.hasRegistered(type)) {
      logger.warn('block is unregistered: ' + type)
      return
    }

    // 创建Block实例
    let prototype = this.registries[type]
    // 放入队列中
    let inst = prototype.instance(state)
    this.instances.push(inst)
    return inst
  }

  addBlock(option, parent) {
    if (!option || !option.type) {
      return
    }

    let inst = this.createBlockInstance(option.type, option.state)
    if (!inst) {
      return
    }

    let $elem = inst.element()

    var that = this
    var dom = this.dom

    $elem.on('mousedown', function () {
      that.$selected = $(this)
      let m = this.getCTM()
      let pm = dom.$canvas[0].getCTM()

      that.lastPoint.x = event.pageX
      that.lastPoint.y = event.pageY
      that.grapPoint.x = (Number(m.e) - Number(pm.e))
      that.grapPoint.y = (Number(m.f) - Number(pm.f))
      that.$selected.addClass('ycBlockSelected')
      return false
    }).on('mouseup', function () {

    })

    if (parent) {
      parent.append(inst.element())
    } else {
      this.dom.$canvas.append(inst.element())
    }
  }

  addBlocks(blocks) {
    if (yuchg.isArray(blocks)) {
      var that = this
      // 创建多个Block
      $.each(blocks, function (i, elem) {
        that.addBlock(elem)
      })
    } else if (yuchg.isObject(blocks)) {
      // 创建单个Block
      this.addBlock(blocks)
    }
  }

  findBlock(id) {

  }

  findBlocksByType(type) {

  }

  removeBlocks(ids) {

  }

  removeBlocksByTypes(types) {

  }

  registerBlock(defs) {

  }

  unregisterBlock(types) {

  }

  hasRegistered(type) {
    if (this.registries.hasOwnProperty(type) && this.registries[type]) {
      return true
    }
    return false
  }
}

const Scratch = {

  init: function (dom, err) {
    if (!dom) {
      err && err('dom is invalid')
      return
    }

    return new Panel(dom)
  },

  block: function (def) {

  }
}

export default Scratch