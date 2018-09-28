import yuchg from './base'
import $ from 'jquery'
import uuidv4 from 'uuid/v4'
import blocks from './blocks/index'

// 缺省文字字体大小
const ycFontSize = 12 // ASCII
const ycUnicodeFontSize = 16 // UNICODE
// 计算文字长度
function computeTextLength(txt) {
  // 根据文字计算长度
  if (!yuchg.isString(txt)) {
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
  position: 'ycBlockEventPosition'
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

    let minWidth = 40
    let minHeight = 16
    let size = {
      width: option.width ? option.width : minWidth,
      height: option.height ? option.height : minHeight
    }

    let d = '`m 0,4 A 4,4 0 0,1 4,0 H 12 c 2,0 3,1 4,2 l 4,4 c 1,1 2,2 4,2 h 12 c 2,0 3,-1 4,-2 l 4,-4 c 1,-1 2,-2 4,-2 H ${ size.width } a 4,4 0 0,1 4,4 v ${ size.height } a 4,4 0 0,1 -4,4 H 48 c -2,0 -3,1 -4,2 l -4,4 c -1,1 -2,2 -4,2 h -12 c -2,0 -3,-1 -4,-2 l -4,-4 c -1,-1 -2,-2 -4,-2 H 4 a 4,4 0 0,1 -4,-4 z`'
    let dfunc = new Function('size', 'return ' + d)
    $elem.attr('d', dfunc(size))
    option.stroke && $elem.attr('stroke', option.stroke)
    option.fill && $elem.attr('fill', option.fill)
    option.opacity && $elem.attr('fill-opacity', option.opacity)
    $elem.addClass('ycBlockPath ycBlockBackground' + (option.classes ? (' ' + option.classes) : ''))

    // 自定义事件
    $elem.on(ycEvents.resize, function (event, opt) {
      const $this = $(this)
      const log = `slot ${ycEvents.resize} event: `
      if (!opt) {
        console.log(log + `opt is null`)
        return
      }

      if (!yuchg.isNumber(opt.width)) {
        console.log(log + `width is not number`)
      } else {
        size.width = Math.max(opt.width, minWidth)
      }

      if (!yuchg.isNumber(opt.height)) {
        console.log(log + `height is not number`)
      } else {
        size.height = Math.max(opt.height, minHeight)
      }

      $this.attr('d', dfunc(size))
    })
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
    let minContentWidth = 16
    let minRadius = 16

    if (!option) {
      option = {}
    }

    let size = {
      radius: option.height ? option.height / 2 : minRadius,
      contentWidth: option.contentWidth ? option.contentWidth : minContentWidth
    }
    let d = '`m 0,0 m ${size.radius},0 H ${size.radius + size.contentWidth} a ${size.radius} ${size.radius} 0 0 1 0 ${size.radius * 2} H ${size.radius} a ${size.radius} ${size.radius} 0 0 1 0 ${size.radius * -2} z`'
    let dfunc = new Function('size', 'return ' + d)
    $elem.attr('d', dfunc(size))

    option.stroke && $elem.attr('stroke', option.stroke)
    option.fill && $elem.attr('fill', option.fill)
    option.opacity && $elem.attr('fill-opacity', option.opacity)
    $elem.addClass('ycBlockPath ycBlockBackground' + (option.classes ? (' ' + option.classes) : ''))
    // 自定义事件
    $elem.on(ycEvents.resize, function (event, opt) {
      const $this = $(this)
      const log = `slot ${ycEvents.resize} event: `
      if (!opt) {
        console.log(log + `event: opt is null`)
        return
      }

      if (!yuchg.isNumber(opt.height)) {
        console.log(log + `radius is not number`)
      } else {
        size.radius = Math.max(opt.height / 2, minRadius)
      }

      if (!yuchg.isNumber(opt.contentWidth)) {
        console.log(log + `width is not number`)
      } else {
        size.contentWidth = Math.max(opt.contentWidth, minContentWidth)
      }

      $this.attr('d', dfunc(size))
    })
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
    let minContentWidth = 16
    let minRadius = 16

    if (!option) {
      option = {}
    }

    let size = {
      radius: option.height ? option.height / 2 : minRadius,
      contentWidth: option.contentWidth ? option.contentWidth : minContentWidth
    }
    let d = '`m 0,0 m ${size.radius},0 H ${size.radius + size.contentWidth} l ${size.radius} ${size.radius} l ${-size.radius} ${size.radius} H ${size.radius} l ${-size.radius} ${-size.radius} l ${size.radius} ${-size.radius} z`'
    let dfunc = new Function('size', 'return ' + d)
    $elem.attr('d', dfunc(size))

    option.stroke && $elem.attr('stroke', option.stroke)
    option.fill && $elem.attr('fill', option.fill)
    option.opacity && $elem.attr('fill-opacity', option.opacity)
    $elem.addClass('ycBlockPath ycBlockBackground' + (option.classes ? (' ' + option.classes) : ''))
    // 自定义事件
    $elem.on(ycEvents.resize, function (event, opt) {
      const $this = $(this)
      const log = `slot ${ycEvents.resize} event: `
      if (!opt) {
        console.log(log + `event: opt is null`)
        return
      }

      if (!yuchg.isNumber(opt.height)) {
        console.log(log + `radius is not number`)
      } else {
        size.radius = Math.max(opt.height / 2, minRadius)
      }

      if (!yuchg.isNumber(opt.contentWidth)) {
        console.log(log + `width is not number`)
      } else {
        size.contentWidth = Math.max(opt.contentWidth, minContentWidth)
      }

      $this.attr('d', dfunc(size))
    })
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
      const $this = $(this)
      const log = `slot ${ycEvents.position} event: `
      if (!opt) {
        console.log(log + 'opt is null')
        return
      }

      if (!yuchg.isNumber(opt.x)) {
        console.log(log + `x is not number`)
      } else {
        $this.attr('x', opt.x)
      }

      if (!yuchg.isNumber(opt.y)) {
        console.log(log + `y is not number`)
      } else {
        $this.attr('y', opt.y)
      }

      let tx = 0
      let ty = 0
      if (!yuchg.isNumber(opt.translatex)) {
        console.log(log + `translatex is not number`)
      } else {
        tx = opt.translatex
      }

      if (!yuchg.isNumber(opt.translatey)) {
        console.log(log + `translatey is not number`)
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
      const $this = $(this)
      const log = `slot ${ycEvents.position} event: `
      if (!opt) {
        console.log(log + 'opt is null')
        return
      }

      let tx = 0
      let ty = 0
      if (!yuchg.isNumber(opt.translatex)) {
        console.log(log + `translatex is not number`)
      } else {
        tx = opt.translatex
      }

      if (!yuchg.isNumber(opt.translatey)) {
        console.log(log + `translatey is not number`)
      } else {
        ty = opt.translatey
      }
      $this.attr('transform', `translate(${tx}, ${ty})`)
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
      const $this = $(this)
      const log = `slot ${ycEvents.position} event: `
      if (!opt) {
        console.log(log + 'opt is null')
        return
      }

      let tx = 0
      let ty = 0
      if (!yuchg.isNumber(opt.translatex)) {
        console.log(log + `translatex is not number`)
      } else {
        tx = opt.translatex
      }

      if (!yuchg.isNumber(opt.translatey)) {
        console.log(log + `translatey is not number`)
      } else {
        ty = opt.translatey
      }
      $this.attr('transform', `translate(${tx}, ${ty})`)

      let $thistext = $this.children('text')
      if (!yuchg.isNumber(opt.x)) {
        console.log(log + `x is not number`)
      } else {
        $thistext.attr('x', opt.x)
      }

      if (!yuchg.isNumber(opt.y)) {
        console.log(log + `y is not number`)
      } else {
        $thistext.attr('y', opt.y)
      }
    })

    return $elem
  }
}

// 块实例
class BlockInstance {
  constructor(proto, states) {
    this.uid = uuidv4() // 唯一标示
    this.proto = proto
    this.elem = null
    this.prev = null
    this.next = null
    this.parent = null // 父元素
    this.children = [] // 内部子元素
    this.states = {}

    this.update(states)
  }

  // 获取对应的DOM根元素
  element() {
    if (!this.elem) {
      this.elem = $(this.proto.prototypeElement).clone()
    }
    return this.elem
  }

  // 绝对坐标（SVG）
  absolutPosition() {
    return {
      x: 0,
      y: 0
    }
  }

  // 更新状态
  update(states, force = false) {
    if (!this.states) {
      this.states = {}
    }

    if (states) {
      // 合并状态
      $.extend(true, this.states, states)
    }

    if (force) {
      // 强制全部更新
      this.updateState(this.states)
    } else if (states) {
      this.updateState(states)
    }
  }

  updateState(states) {
    this.updatePosition(states)
  }

  updatePosition(states) {
    // 重新更新
    let $elem = this.element()
    let x = states.x ? parseInt(states.x) : 0
    let y = states.y ? parseInt(states.y) : 0
    $elem.attr('transform', `translate(${x},${y})`)
  }
}

/*
Block基类
*/
class Block {
  constructor(def) {
    this.name = def.id // Block名称
    this.def = def
    this.instances = [] // 实例列表
    this.display = { // 显示设置
      minContentWidth: 16, // 内容显示区域宽度，最小宽度
      minHeight: 32,
      space: 4 // 边框/间距
    }
    this.state = {
      contentWidth: 16,
      height: 32,
      width: 16 // 宽度根据Block类型不同而不同，默认等于contentWidth
    }
    this.prototypeElement = this.createElement()
    if (this.prototypeElement) {
      this.prototypeElement.attr('data-block', this.name)
    }
  }

  // 创建DOM对象原型
  createElement() {
    return null
  }

  // 调整尺寸
  // dom为DOM根元素
  adjust(dom) {

  }

  // 克隆一个对象实例, state为状态变量 
  /*
  {
     x: // X坐标
     y: // Y坐标
  }
   */
  instance(state) {
    let s = $.extend({}, this.state)
    $.extend(s, state)
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
    super(def)
  }

  createElement() {
    var $g = ShapeUtils.arguGroup(this.def)

    let cate = acquireCategoryContext(this.def.category)
    let opt = {}
    $.extend(opt, cate.background)
    $g.append(ShapeUtils.markerPath(opt))

    if (this.def.shape === 'boolean') {
      this.state.value = this.def.value ? !!this.def.value : false
      $g.append(ShapeUtils.diamondRect(opt))
    } else if (this.def.shape === 'dropdown') {
      this.state.currentIndex = this.def.currentIndex ? parseInt(this.def.currentIndex) : -1
      this.state.values = this.def.values
    } else if (this.def.shape === 'number') {
      this.state.value = this.def.value ? parseInt(this.def.value) : 0
      opt.height = this.display.height
      $g.append(ShapeUtils.roundRect(opt))
      $g.append(ShapeUtils.editableText({
        text: this.state.value
      }))
    } else {
      this.state.value = this.def.value ? this.def.value : ''
      // 缺省外形
      $g.append(ShapeUtils.roundRect(opt))
      $g.append(ShapeUtils.editableText({
        text: this.state.value
      }))
    }
    this.adjust($g)
    return $g
  }

  adjust(dom) {
    // 根据def计算尺寸
    if (this.def.shape === 'boolean') {

    } else if (this.def.shape === 'dropdown') {

    } else {
      // 根据文字计算长度
      let txt = '' + this.value
      let length = computeTextLength(txt)
      let roundlength = length < this.display.minContentWidth ? this.display.minContentWidth : length

      let $path = dom.children('path')
      $path.trigger(ycEvents.resize, [{
        contentWidth: roundlength,
        height: this.state.height
      }])

      let $text = dom.children('text')
      $text.trigger(ycEvents.position, [{
        x: this.display.height / 2 + roundlength / 2,
        y: 0,
        translatex: 0,
        translatey: this.display.height / 2
      }])
    }
  }
}

class BlockMarker extends Block {
  constructor(def) {
    super(def)
  }

  createElement() {
    var $g = ShapeUtils.group(this.def)

    if (this.name === 'insertmarker') {
      $g.addClass('ycBlockInsertionMarker')
    }

    let cate = acquireCategoryContext(this.def.category)
    let opt = {}
    $.extend(opt, cate.background)
    $g.append(ShapeUtils.markerPath(opt))
    return $g
  }
}

class BlockVariant extends Block {
  constructor(def) {
    super(def)
  }

  createElement() {
    this.display.minHeight = 40
    this.state.height = 40

    let $g = ShapeUtils.group(this.def)
    let cate = acquireCategoryContext(this.def.category)
    this.def.background = cate.background
    let opt = {
      height: this.state.height
    }
    $.extend(opt, cate.background)
    if (this.def.shape === 'boolean') { // 布尔类型
      $g.append(ShapeUtils.diamondRect(opt))
    } else {
      // 缺省外形
      $g.append(ShapeUtils.roundRect(opt))
    }
    $g.append(ShapeUtils.text({
      text: this.def.text
    }))

    this.adjust($g)
    return $g
  }

  // 计算调整内部子元素位置
  adjust(dom) {
    // 根据文字计算长度
    let txt = this.def.text
    let length = computeTextLength(txt)
    this.state.contentWidth = length < this.display.minContentWidth ? this.display.minContentWidth : length

    let $path = dom.children('path')
    $path.trigger(ycEvents.resize, [{
      contentWidth: this.state.contentWidth,
      height: this.state.height
    }])
    
    let $text = dom.children('text')
    $text.trigger(ycEvents.position, [{
      x: this.state.height / 2 + this.state.contentWidth / 2,
      y: 0,
      translatex: 0,
      translatey: this.state.height / 2
    }])
  }
}

class BlockStack extends Block {
  constructor(def) {
    super(def)
  }

  createElement() {
    let $elem = this.createContainer()
    // this.sections = []
    // // 创建Section
    // for (let sec of this.def.sections.values()) {
    //   let secblock = $.extend({
    //     category: this.def.category
    //   }, sec)
    //   this.sections.push(secblock)
    //   let $child = this.createSection(secblock)
    //   if (!$child) {
    //     console.log('block' + this.name + 'createSection failed:' + sec)
    //     continue
    //   }
    //   $elem.append($child)
    // }
    this.adjust($elem)
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

  addArgument(def, parent) {
    if (!def || !def.datatype) {
      return
    }

    // 检查是否注册
    if (!def.prototypeElement) {
      def.prototypeElement = new BlockArgument(def)
    }

    // 创建Block实例
    let prototype = def.prototypeElement
    // 放入队列中
    def.instance = prototype.instance(def)
    if (!def.instance) {
      console.log('block' + this.name + 'createSection failed:' + def)
      return
    }

    //var that = this
    //var dom = this.dom
    // $elem.on('mousedown', function () {
    //   that.$selected = $(this)
    //   let m = this.getCTM()
    //   let pm = dom.$canvas[0].getCTM()

    //   that.lastPoint.x = event.pageX
    //   that.lastPoint.y = event.pageY
    //   that.grapPoint.x = (Number(m.e) - Number(pm.e))
    //   that.grapPoint.y = (Number(m.f) - Number(pm.f))
    //   that.$selected.addClass('ycBlockSelected')
    //   return false
    // }).on('mouseup', function () {
    // })
    return def.instance.element()
  }

  adjust(dom) {
    // $.extend(this.display, this.def.display)

    // // 创建Section
    // let space = this.display.space
    // let childSize = {width:0, height:0}
    // let offsetx = space
    // let outersize = {
    //   width: (this.sections.length + 1) * space,
    //   height: 40
    // }
    // for (let sec of this.sections.values()) {
    //   let $child = null
    //   if (sec.type === 'argument' && sec.instance) {
    //     $child = sec.instance.element()
    //   } else if (sec.type === 'text' && sec.$elem) {
    //     $child = sec.$elem
    //     childSize.width = computeTextLength(sec.value)

    //   }
    //   $child.trigger(ycEvents.position, [{
    //     x: offsetx,
    //     y: 0
    //   }])
    //   //console.log('stack child size:', sec.size)
    //   //outersize.width += sec.size.width
    // }
    // // 调整容器大小
    // dom.trigger(ycEvents.resize, [outersize])
  }

  createContainer() {
    return null
  }

  instance(states) {
    let inst = super.instance(states)
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
    let cate = acquireCategoryContext(this.def.category)
    this.def.background = cate.background
    let opt = {}
    $.extend(opt, cate.background)
    if (this.def.shape === 'boolean') { // 布尔类型

    } else {
      // 缺省外形
      $g.append(ShapeUtils.roundRect(opt))
    }
    return $g
  }
}

class BlockEvent extends BlockStack {
  constructor(def) {
    super(def)
    this.next = null // 下一个Block
  }

  createContainer() {
    let $g = ShapeUtils.group(this.def)
    let cate = acquireCategoryContext(this.def.category)
    this.def.background = cate.background
    let opt = {}
    $.extend(opt, cate.background)
    // 缺省外形
    $g.append(ShapeUtils.event(opt))
    this.adjust($g)
    return $g
  }
}

class BlockAction extends BlockStack {
  constructor(def) {
    super(def)
    this.prev = null // 上一个Block
    this.next = null // 下一个Block
  }

  createElement() {
    var $g = ShapeUtils.group(this.def)

    var space = this.def.space ? this.def.space : 8 // section间距
    var minLen = 64

    // 根据sections起始位置
    var secoffsets = []
    secoffsets.push(space)
    var length = (this.def.sections.length + 1) * space
    this.def.sections.forEach(function (sec, i) {
      let l = 0
      if (sec.type === 'text') {
        l = computeTextLength(sec.text)
      } else if (sec.type === 'argument') {
        l = sec.length ? sec.length : 0
      }
      secoffsets.push(secoffsets[i] + l + space)
      length += l
    })

    var roundlength = length < minLen ? minLen : length

    let cate = acquireCategoryContext(this.def.category)
    let opt = {
      stroke: '#2E8EB8', // 线条颜色
      fill: '#5CB1D6', // 填充色
      opacity: '1', // 透明度
      length: roundlength
    }
    $.extend(opt, cate.background)

    $g.append(ShapeUtils.slot(opt))

    this.def.sections.forEach(function (sec, i) {
      if (sec.type === 'text') {
        $g.append(ShapeUtils.text({
          text: sec.text,
          anchor: 'start',
          offset: {
            x: secoffsets[i],
            y: 0
          },
          translate: {
            x: 0,
            y: 24
          }
        }))
      } else if (sec.type === 'argument') {

      }
    })

    return $g
  }

  createContainer() {
    let $g = ShapeUtils.group(this.def)
    let cate = acquireCategoryContext(this.def.category)
    this.def.background = cate.background
    let opt = {}
    $.extend(opt, cate.background)
    if (this.def.shape === 'boolean') { // 布尔类型

    } else {
      // 缺省外形
      $g.append(ShapeUtils.roundRect(opt))
    }

    this.adjust($g)
    return $g
  }
}

class BlockControl extends BlockStack {
  constructor(def) {
    super(def)
    this.fail = null
    this.success = null
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

    this.option = {
      width: 800,
      height: 600,
      virtualWidth: 1600,
      virtualHeight: 1200,
      blocks: blocks
    }

    let that = this
    // 鼠标事件
    this.dom.$svg.on('mousedown', function () {
      that.lastPoint.x = event.pageX
      that.lastPoint.y = event.pageY
      that.startDrag = true
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
        that.setCanvasTransfrom(trans)
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

    // 鼠标事件
    this.dom.$flyout.on('mousedown', function () {

    })
  }

  updateInfo(info) {
    this.mousePoint.x = info.x
    this.mousePoint.y = info.y
    this.dom.$info.html('X: ' + info.x + '  Y: ' + info.y)
  }

  // 统一设置canvas变换矩阵（平移，缩放）
  setCanvasTransfrom(trans) {
    this.dom.$canvasList.forEach(function (item) {
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

    // 注册参数
    for (let def of args.members.values()) {
      def.type = 'argument'
      // 提示重复
      if (registries[def.id]) {
        console.log('block registered repeated: ' + def.id)
      }
      registries[def.id] = createPrototype(def)
      if (!registries[def.id]) {
        console.log('block registered failed: ' + def.id)
      } else {
        console.log('block registered successed: ' + def.id)
      }
    }

    // 注册Block
    for (let [type, val] of Object.entries(defs)) {
      for (let def of val.members.values()) {
        def.type = type

        // 提示重复
        if (registries[def.id]) {
          console.log('block registered repeated: ' + def.id)
        }

        registries[def.id] = createPrototype(def)
        if (!registries[def.id]) {
          console.log('block registered failed: ' + def.id)
        } else {
          cates[def.category].blocks.push(def.id)
          console.log('block registered successed: ' + def.id)
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
        console.log('category can not found: ' + key)
        return
      }
      var $menurow = $('<div class="ycBlockCategoryMenuRow"></div>')
      var $menuitem = $(`<div class="ycBlockCategoryMenuItem" data-id="${ key }"></div>`)
      $menuitem.append($(`<div class="ycBlockCategoryItemBubble" style="background-color: ${ cate.background.fill }; border-color: ${ cate.background.stroke };"></div>`))
      $menuitem.append($(`<div class="ycBlockCategoryMenuItemLabel">${ cate.name }</div>`))
      $menurow.append($menuitem)

      $menuitem.on('click', function () {
        console.log('click ----- ' + $(this).data('id'))
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
              let $elem = $(proto.prototypeElement).clone()
              $elem.attr('transform', `translate(36, ${offsety})`)
              dom.$flyoutcanvas.append($elem)
              offsety += toolboxspace
            } else {
              console.log('block registry is corrupted:' + block)
            }
          })
        }
      }
    })
  }

  createBlockInstance(type, states) {
    // 坚持类型是否注册
    if (!this.hasRegistered(type)) {
      console.error('block registered failed: ' + type)
      return
    }

    // 创建Block实例
    let prototype = this.registries[type]
    // 放入队列中
    let inst = prototype.instance(states)
    this.instances.push(inst)
    return inst
  }

  addBlock(states, parent) {
    if (!states || !states.type) {
      return
    }

    let inst = this.createBlockInstance(states.type, states)
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