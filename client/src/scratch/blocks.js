import $ from 'jquery'
import * as d3 from "d3"
import uuidv4 from 'uuid/v4'
import yuchg from '../base'
import logger from '../logger'
import ShapeUtils from './shapes'
import Utils from './utils'

// 块实例
class BlockInstance {
  constructor(proto, state) {
    this.uid = uuidv4() // 唯一标示
    this.__proto = proto // 原型Block对象
    this.elem = null // DOM根节点
    this.prev = null // 序列上一个节点（DOM父节点），NULL表示为序列头
    this.next = null // 序列下一个节点（DOM子节点），NULL表示为序列尾
    this.parent = null // 父元素（DOM父节点）
    this.children = [] // 内部子元素（DOM子节点）
    // 复制状态
    this.state = $.extend(true, {}, this.__proto.def.state)
    // 更新状态
    this.update(state, true)
  }

  // 获取对应的DOM根元素
  element() {
    if (!this.elem) {
      let $clone = $(this.__proto.prototypeElement).clone(true)
      this.elem = $clone[0]
    }
    return this.elem
  }

  // 更新状态
  update(newState, force = false) {
    let modify = [] // modify 表明更新类型：size 更新大小 backgroud 更新背景 tansform 更新位置变换 data 更新显示内容
    let _newState = null
    if (yuchg.isFunction(newState)) {
      _newState = newState()
    } else if (yuchg.isObject(newState)) {
      _newState = newState
    }

    if (yuchg.isNull(_newState) && !force) {
      logger.warn(`BlockInstance ${this.uid} update failed: newState is NULL`)
      return
    }

    if (!yuchg.isObject(_newState) && !force) {
      logger.warn(`BlockInstance ${this.uid} update failed: newState is not a Object --`, _newState)
      return
    }

    if (yuchg.isObject(_newState)) {
      // 检查需要更新的属性
      for (let [key, val] of Object.entries(_newState)) {
        if (yuchg.isObject(val)) {
          modify.push(key)
          this.state[key] = $.extend(true, this.state[key], val)
        }
      }
    }

    // 根据新状态重新渲染
    this.__proto.adjust({
      dom: this.element(),
      def: this.__proto.def,
      state: this.state,
      modify: force ? null : modify
    })
  }

  // next为true时，删除所有nextBlock
  // 为false时，仅删除自己，nextBlock上移
  clear(next = true) {
    // 删除子节点children
    for (let c of this.children.values()) {
      c.clear()
    }
    // 删除next
    if (this.next) {
      if (next) {
        this.next.clear()
      } else {
        this.next.prev = this.prev
      }
    }
    let index = this.__proto.instances.indexOf(this)
    if (index >= 0) {
      this.__proto.instances.splice(index, 1)
    }
    $(this.elem).remove()

    // 通知父对象更新
  }
}

const minWidth = 8 // Block头部最小宽度
const minHeight = 32 // Block头部最小高度
const minSpace = 4 // Section最小间距
/*
Block基类
*/
class Block {
  constructor(option) {
    this.instances = [] // 实例列表
    this.def = {
      state: { // 允许实例调整的数据
        size: { // 尺寸设置
          minWidth: minWidth, // 内容显示区域宽度，最小宽度
          minContentWidth: minWidth, // 内容显示区域宽度，最小宽度
          minHeight: minHeight,
          minContentHeight: minHeight, // 内容显示区域宽度，最小高度
          space: minSpace, // 间距
          contentWidth: minWidth,
          contentHeight: minHeight,
          width: minWidth, // width = contentWidth + padding.left + padding.right 高度值并不是真实完整宽度，仅指头部宽度；实际高度需要使用BBox()来获取
          height: minHeight //  height = contentWidth + padding.top + padding.bottom 高度值并不是真实完整高度，仅指头部高度；实际高度需要使用BBox()来获取
        },
        transform: { // 对应transform
          x: 0,
          y: 0,
          rotate: 0, // 旋转角度
          scale: 1 // 缩放比例
        },
        background: {}, // 背景属性
        data: {} // 其他相关数据
      }
    }

    // 更新display设置(深度拷贝)
    $.extend(true, this.def, option)

    // 创建原型节点，当创建Block实例时，只需要clone节点即可
    this.prototypeElement = this.createPrototype()
    if (this.prototypeElement) {
      $(this.prototypeElement).attr('data-block', this.def.id)
    }
  }

  /**
   * 动态计算padding
   */
  padding(option) {
    let p = {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    }

    // 获取state中的padding定义，如果没有，则默认为0
    if (yuchg.isObject(option)) {
      const state = option.state
      if (yuchg.isDefAndNotNull(state.size.padding)) {
        const pd = state.size.padding
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
      }
    }

    return p
  }

  /**
   * 创建原型
   */
  createPrototype() {
    const elem = this.createElement()
    this.adjust({
      dom: elem,
      def: this.def,
      state: this.def.state
    })
    return elem
  }

  /**
   * 创建DOM对象原型
   */
  createElement() {
    return this.createContainer()
  }

  /**
   * 创建顶层容器
   */
  createContainer() {
    // 创建顶层group
    const elem = ShapeUtils.base.group()
    const $elem = $(elem)

    const props = ['id', 'shape', 'type', 'category']
    for (let i of props) {
      let v = this.def[i]
      if (!yuchg.isString(v)) {
        logger.warn(`create Block: ${i} is not string --`, v)
      } else {
        $elem.attr('data-' + i, v)
      }
    }

    if (this.def.draggable === true) {
      $elem.addClass('ycBlockDraggable')
    }

    return elem
  }

  /**
   * 调整尺寸
   */
  adjust(option) {
    // 部分更新
    let modify = option.modify
    if (!modify) {
      modify = ['data', 'size', 'background', 'transform']
    }
    // 更新data
    if (modify.indexOf('data' >= 0)) {
      this.adjustData(option)
    }

    // 更新尺寸
    if (modify.indexOf('size' >= 0)) {
      this.adjustSize(option)
    }

    // 更新背景
    if (modify.indexOf('background' >= 0)) {
      this.adjustBackground(option)
    }

    // 更新位置
    if (modify.indexOf('transform' >= 0)) {
      this.adjustTransform(option)
    }
  }

  adjustData(option) {

  }

  adjustSize(option) {

  }

  adjustBackground(option) {

  }

  adjustTransform(option) {
    const $dom = $(option.dom)
    const state = option.state

    $dom.trigger(ShapeUtils.events.position, [{
      translatex: yuchg.isNumber(state.transform.x) ? state.transform.x : 0,
      translatey: yuchg.isNumber(state.transform.y) ? state.transform.y : 0
    }])
  }

  /**
   * 克隆一个对象实例, state为实例的状态变量
   */
  instance(state) {
    var inst = new BlockInstance(this, state)
    this.instances.push(inst)
    return inst
  }
}

/*
BlockArgument
*/
class BlockArgument extends Block {
  constructor(option) {
    if (option.shape === 'boolean') {
      option.display.minContentWidth = 16
    } else if (option.shape === 'dropdown') {
      option.display.buttonSize = 12
    }
    super(option)
  }

  createBoolean(parent, option) {
    let $parent = $(parent)
    this.def.state.value = this.def.value ? !!this.def.value : false
    option.contentWidth = 16
    let shape = ShapeUtils.path.diamondRect(option)
    $parent.append(shape)
    return shape
  }

  createNumber(parent, option) {
    let $parent = $(parent)
    this.def.state.value = this.def.value ? parseInt(this.def.value) : 0
    let shape = ShapeUtils.path.roundRect(option)
    $parent.append(shape)

    let text = ShapeUtils.group.editableText({
      text: this.def.state.value
    })
    $parent.append(text)
    return shape
  }

  createDropDown(parent, option) {
    let $parent = $(parent)
    this.def.state.currentIndex = this.def.currentIndex ? parseInt(this.def.currentIndex) : -1
    this.def.state.values = this.def.values

    const index = this.def.state.currentIndex
    let values = this.def.values
    let shape = ShapeUtils.path.roundRect(option)
    $parent.append(shape)

    let text = values[index] ? values[index].name : ''
    $parent.append(ShapeUtils.base.text({
      text: text
    }))

    $parent.append(ShapeUtils.base.image({
      width: this.def.display.buttonSize,
      height: this.def.display.buttonSize,
      url: '/img/dropdown-arrow.be850da5.svg'
    }))
    return shape
  }

  createElement() {
    let elem = ShapeUtils.base.arguGroup(this.def)
    let $elem = $(elem)
    let opt = {
      contentWidth: this.def.state.width,
      height: this.def.state.height
    }
    Object.assign(opt, this.def.background)

    let shape = null
    if (this.def.shape === 'boolean') {
      shape = this.createBoolean($elem, opt)
    } else if (this.def.shape === 'dropdown') {
      shape = this.createDropDown($elem, opt)
    } else if (this.def.shape === 'number') {
      shape = this.createNumber($elem, opt)
    } else {
      // 默认类型
      shape = this.createNumber($elem, opt)
    }

    // 修改值
    let that = this
    $elem.on(ShapeUtils.events.change, function (event, val) {
      event.stopPropagation()

      let $this = $(this)
      if (that.def.shape === 'boolean') {

      } else if (that.def.shape === 'dropdown') {

      } else if (that.def.shape === 'number') {

      } else {
        // 默认类型
        let $text = $this.find('text')
        $text.trigger(ShapeUtils.events.change, [val])
      }
    })

    this.def.state.width = shape.__boundbox__.width
    this.def.state.height = shape.__boundbox__.height
    this.def.state.contentWidth = shape.__boundbox__.contentWidth
    this.def.state.contentHeight = shape.__boundbox__.contentHeight

    this.adjust({
      dom: elem,
      proto: this,
      state: this.def.state
    })
    return elem
  }

  adjust(option) {

    const $dom = $(option.dom)
    const def = option.proto.def
    const padding = option.proto.padding()
    const buttonSize = def.display.buttonSize
    // 根据def计算尺寸
    if (def.shape === 'dropdown') {
      // 根据文字计算
      let length = 0
      for (let item of option.state.values.values()) {
        length = Math.max(Utils.computeTextLength(item.name), length)
      }
      length += buttonSize // 按钮宽度
      option.state.contentWidth = length < def.display.minContentWidth ? def.display.minContentWidth : length
      option.state.width = option.state.contentWidth + padding.left + padding.right

      let $shape = $dom.children('path')
      $shape.trigger(ShapeUtils.events.resize, [{
        width: option.state.width,
        height: option.state.height
      }])

      // 更新背景
      if (option.state.display) {
        $shape.trigger(ShapeUtils.events.background, [{
          fill: option.state.display.fill
        }])
      }

      // 更新大小
      option.state.width = $shape[0].__boundbox__.width
      option.state.height = $shape[0].__boundbox__.height
      option.state.contentWidth = $shape[0].__boundbox__.contentWidth
      option.state.contentHeight = $shape[0].__boundbox__.contentHeight

      // 调整文字位置 
      let $text = $dom.children('text')
      // 更新文字
      let index = option.state.currentIndex ? option.state.currentIndex : 0
      let textstr = option.state.values[index] ? option.state.values[index].name : ''
      $text.trigger(ShapeUtils.events.change, [textstr])

      $text.trigger(ShapeUtils.events.positionText, [{
        x: option.state.height / 2 + (option.state.contentWidth - buttonSize) / 2,
        translatex: 0,
        translatey: option.state.height / 2
      }])

      // 调整按钮位置 
      let $image = $dom.children('image')
      $image.trigger(ShapeUtils.events.position, [{
        translatex: option.state.width - (option.state.height + buttonSize) / 2,
        translatey: (option.state.height - buttonSize) / 2
      }])
    } else {
      let txt = ''
      // 根据文字计算长度
      if (def.shape !== 'boolean') {
        txt = '' + option.state.value
      } else {
        def.display.minContentWidth = 16
      }
      let length = Utils.computeTextLength(txt)
      option.state.contentWidth = length < def.display.minContentWidth ? def.display.minContentWidth : length
      option.state.width = option.state.contentWidth + padding.left + padding.right

      let $shape = $dom.children('path')
      $shape.trigger(ShapeUtils.events.resize, [{
        width: option.state.width,
        height: option.state.height
      }])

      // 更新背景
      if (option.state.display) {
        $shape.trigger(ShapeUtils.events.background, [{
          fill: option.state.display.fill
        }])
      }

      // 更新大小
      option.state.width = $shape[0].__boundbox__.width
      option.state.height = $shape[0].__boundbox__.height
      option.state.contentWidth = $shape[0].__boundbox__.contentWidth
      option.state.contentHeight = $shape[0].__boundbox__.contentHeight

      let $text = $dom.children('text')
      $text.trigger(ShapeUtils.events.positionText, [{
        x: option.state.width / 2,
        y: option.state.height / 2,
        translatex: 0,
        translatey: option.state.height / 2
      }])
    }
  }
}

class BlockMarker extends Block {
  constructor(option) {
    super(option)
  }

  createContainer() {
    let elem = super.createContainer()
    let $elem = $(elem)
    if (this.def.id === 'insertmarker') {
      $elem.addClass('ycBlockInsertionMarker')
    }
    return elem
  }
}

class BlockVariant extends Block {
  constructor(option) {
    option.state = $.extend(true, {
      size: {
        minHeight: 40,
        height: 40
      }
    }, option.state)
    super(option)
  }

  padding(option) {
    let p = super.padding(option)
    if (yuchg.isObject(option)) {
      const state = option.state
      if (yuchg.isNull(state.size.padding)) {
        p.left = p.right = state.size.height / 2 // 默认取高度一半
      }
    }
    return p
  }

  createElement() {
    // 创建顶层容器
    let elem = this.createContainer()
    let $elem = $(elem)
    const state = this.def.state

    // 创建shape
    let opt = {
      height: state.size.height
    }
    $.extend(opt, state.background)
    let shape = null
    if (this.def.shape === 'boolean') { // 布尔类型
      shape = ShapeUtils.path.diamondRect(opt)
    } else {
      // 缺省外形
      shape = ShapeUtils.path.roundRect(opt)
    }
    $elem.append(shape)

    // 创建text
    $elem.append(ShapeUtils.base.text())

    return elem
  }

  adjustData(option) {
    const $dom = $(option.dom)
    const state = option.state
    let $text = $dom.children('text')
    $text.trigger(ShapeUtils.events.change, [state.data.text])
  }

  adjustSize(option) {
    // 根据文字计算长度
    const $dom = $(option.dom)
    const def = option.def
    const state = option.state
    const padding = this.padding(option)
    let length = Utils.computeTextLength(state.data.text)
    state.size.contentWidth = Math.max(length, state.size.minContentWidth)

    if (def.shape === 'dropdown') {
      // 枚举变量
    } else {
      state.size.width = Math.max(length, state.size.minContentWidth) + padding.left + padding.right
    }

    let $shape = $dom.children('path')
    $shape.trigger(ShapeUtils.events.resize, [{
      width: state.size.width,
      height: state.size.height
    }])

    // 获取实际的更新大小
    state.size.width = $shape[0].__boundbox.width
    state.size.height = $shape[0].__boundbox.height
    state.size.contentWidth = $shape[0].__boundbox.contentWidth
    state.size.contentHeight = $shape[0].__boundbox.contentHeight

    let $text = $dom.children('text')
    $text.trigger(ShapeUtils.events.positionText, [{
      x: state.size.width / 2,
      y: 0,
      translatex: 0,
      translatey: state.size.height / 2
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
    let elem = this.createContainer()
    let $elem = $(elem)
    this.sections = []

    // 创建Section
    for (let sec of this.def.sections.values()) {
      let secblock = Object.assign({}, sec)
      this.sections.push(secblock)
      let child = this.createSection(secblock)
      if (!child) {
        logger.debug('block' + this.name + 'createSection failed:' + sec)
        continue
      }
      let $child = $(child)
      // 修改边框颜色
      if (this.def.background && this.def.background.stroke) {
        $child.trigger(ShapeUtils.events.background, [{
          stroke: this.def.background.stroke
        }])
      }
      $elem.append($child)
    }
    return elem
  }

  // 创建Sections
  createSection(sec) {
    let that = this
    if (sec.type === 'argument') {
      let inst = this.addArgument(sec)
      let elem = inst.element()

      if (sec.datatype === 'number' || sec.datatype === 'string') {

        $(elem).on('mouseup', function () {
          let $this = $(this)
          let $path = $this.children('path')
          let m = $path[0].getCTM()
          let bbox = $path[0].getBBox()
          if (!$this.parent().hasClass('ycBlockFlyout')) {
            logger.debug('click me')
            that.def.__panel.showInputWidget({
              type: 'string',
              x: Number(m.e),
              y: Number(m.f),
              width: bbox.width + 1,
              height: bbox.height + 1,
              callback: function (v) {
                inst.update({
                  value: v
                })
                //$this.trigger(ShapeUtils.events.change, [v])
              }
            })
          }
        })
      }
      return elem
    } else if (sec.type === 'text') {
      sec.elem = ShapeUtils.base.text(sec)
      return sec.elem
    } else if (sec.type === 'image') {
      sec.elem = ShapeUtils.group.image(sec)
      return sec.elem
    }
  }

  addArgument(sec, parent) {
    if (!sec || !sec.datatype) {
      return
    }

    // 创建Block实例
    let inst = this.def.__panel.createBlockInstance(sec.datatype, sec.state)
    if (!inst) {
      return
    }

    sec.instance = inst
    return sec.instance
  }

  adjust(option) {
    const $dom = $(option.dom)
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
      } else if (sec.type === 'text' && sec.elem) {
        let l = Utils.computeTextLength(sec.text)
        offsetx += l
      } else if (sec.type === 'image' && sec.elem) {
        let l = sec.width ? sec.width : 24
        offsetx += l
      }
      offsetx += space
    }

    offsetx -= space
    option.state.contentWidth = offsetx + padding.right
    option.state.contentHeight = contentHeight + padding.top + padding.bottom

    // 如果是表达式
    if (this.def.type === 'express') {

    }

    // 调整容器大小
    let $shape = $dom.children('path')
    logger.debug('Stack resize =====', option.state)
    $shape.trigger(ShapeUtils.events.resize, [{
      contentWidth: option.state.contentWidth,
      contentHeight: option.state.contentHeight
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
        // 根据高度调整文本位置
        sec.instance.update({
          x: offsetx,
          y: (option.state.height - sec.instance.state.height) / 2
        })
        offsetx += sec.instance.state.width
      } else if (sec.type === 'text' && sec.elem) {
        $child = $(sec.elem)
        let bbox = sec.elem.getBBox()
        // 根据高度调整文本位置
        $child.trigger(ShapeUtils.events.positionText, [{
          x: bbox.width / 2, // 文字宽度一半
          y: 0,
          translatex: offsetx,
          translatey: option.state.height / 2
        }])
        offsetx += bbox.width
      } else if (sec.type === 'image' && sec.elem) {
        $child = $(sec.elem)
        let l = sec.width ? sec.width : 24
        // 根据高度调整文本位置
        $child.trigger(ShapeUtils.events.position, [{
          translatex: offsetx,
          translatey: (option.state.height - sec.height) / 2
        }])
        offsetx += l
      }
      offsetx += space
    }
  }



}

class BlockExpress extends BlockStack {
  constructor(def) {
    super(def)
  }

  createContainer() {
    let g = ShapeUtils.base.group(this.def)
    let opt = Object.assign({}, this.def.background)
    let shape = null
    if (this.def.shape === 'boolean') { // 布尔类型
      shape = ShapeUtils.path.diamondRect(opt)
    } else {
      // 缺省外形
      shape = ShapeUtils.path.roundRect(opt)
    }
    $(g).append(shape)
    // 更新大小
    this.def.state.width = shape.__boundbox__.width
    this.def.state.height = shape.__boundbox__.height
    this.def.state.contentWidth = shape.__boundbox__.contentWidth
    this.def.state.contentHeight = shape.__boundbox__.contentHeight

    return g
  }

  adjust(option) {
    const $dom = $(option.dom)
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
      } else if (sec.type === 'text' && sec.elem) {
        let l = Utils.computeTextLength(sec.text)
        offsetx += l
      } else if (sec.type === 'image' && sec.elem) {
        let l = sec.width ? sec.width : 24
        offsetx += l
      }
      offsetx += space
    }

    offsetx -= space
    option.state.width = option.state.contentWidth = offsetx + padding.right
    option.state.height = option.state.contentHeight = contentHeight + padding.top + padding.bottom

    // 调整容器大小
    let $shape = $dom.children('path')
    $shape.trigger(ShapeUtils.events.resize, [{
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
        sec.instance.update({
          x: offsetx,
          y: (option.state.height - sec.instance.state.height) / 2
        })
        offsetx += sec.instance.state.width
      } else if (sec.type === 'text' && sec.elem) {
        $child = $(sec.elem)
        let l = Utils.computeTextLength(sec.text)
        // 根据高度调整文本位置
        $child.trigger(ShapeUtils.events.positionText, [{
          x: l / 2, // 文字宽度一半
          y: 0,
          translatex: offsetx,
          translatey: option.state.height / 2
        }])
        offsetx += l
      } else if (sec.type === 'image' && sec.elem) {
        $child = $(sec.elem)
        let l = sec.width ? sec.width : 24
        // 根据高度调整文本位置
        $child.trigger(ShapeUtils.events.position, [{
          translatex: offsetx,
          translatey: (option.state.height - sec.height) / 2
        }])
        offsetx += l
      }
      offsetx += space
    }
  }
}

class BlockControl extends BlockStack {
  constructor(def) {
    def.state.contentHeight = 40
    def.display.minContentHeight = 40
    super(def)
  }

  createElement() {
    let elem = this.createContainer()
    let $elem = $(elem)
    this.sections = []
    // 创建Section
    for (let sec of this.def.sections.values()) {
      let secblock = Object.assign({}, sec)
      this.sections.push(secblock)
      let $child = $(this.createSection(secblock))
      if (!$child) {
        logger.debug('block' + this.name + 'createSection failed:' + sec)
        continue
      }
      // 修改边框颜色
      if (this.def.background && this.def.background.stroke) {
        $child.trigger(ShapeUtils.events.background, [{
          stroke: this.def.background.stroke
        }])
      }

      $elem.append($child)
    }

    this.others = []
    if (this.def.others) {
      // 创建Section
      for (let sec of this.def.others.values()) {
        let secblock = Object.assign({}, sec)
        this.others.push(secblock)
        let $child = $(this.createSection(secblock))
        if (!$child) {
          logger.debug('block' + this.name + 'createSection failed:' + sec)
          continue
        }
        // 修改边框颜色
        if (this.def.background && this.def.background.stroke) {
          $child.trigger(ShapeUtils.events.background, [{
            stroke: this.def.background.stroke
          }])
        }
        $elem.append($child)
      }
    }

    this.adjust({
      dom: elem,
      proto: this,
      state: this.def.state
    })

    return elem
  }

  createContainer() {
    let g = ShapeUtils.base.group(this.def)
    let opt = Object.assign({}, this.def.background)
    // 默认为非中止block
    opt.end = !!this.def.end
    // 缺省外形
    let shape = null
    if (this.def.shape === 'cup') {
      shape = ShapeUtils.path.cup(opt)
    } else if (this.def.shape === 'cuptwo') {
      shape = ShapeUtils.path.cuptwo(opt)
    }
    $(g).append(shape)
    // 更新大小
    this.def.state.width = shape.__boundbox__.width
    this.def.state.height = shape.__boundbox__.height
    this.def.state.contentWidth = shape.__boundbox__.contentWidth
    this.def.state.contentHeight = shape.__boundbox__.contentHeight
    return g
  }

  adjust(option) {
    const $dom = $(option.dom)
    const def = option.proto.def
    const padding = option.proto.padding()
    const sections = option.proto.sections
    const others = option.proto.others

    // 计算section尺寸
    let space = def.display.space
    let offsetx = padding.left
    let contentWidth = 0
    let contentHeight = 20
    let otherWidth = 0
    let otherHeight = 24

    // 先计算Sections部分宽度和最大高度
    for (let sec of sections.values()) {
      if (sec.type === 'argument' && sec.instance) {
        offsetx += sec.instance.state.width
        contentHeight = Math.max(contentHeight, sec.instance.state.height)
      } else if (sec.type === 'text' && sec.elem) {
        let l = Utils.computeTextLength(sec.text) // 字体大小固定，不需要考虑字体
        offsetx += l
      } else if (sec.type === 'image' && sec.elem) {
        let l = sec.width ? sec.width : 24
        contentHeight = Math.max(otherHeight, sec.height)
        offsetx += l
      }
      offsetx += space
    }

    contentWidth = offsetx - space + padding.right

    offsetx = padding.left
    // 先计算Others宽度和最大高度
    for (let sec of others.values()) {
      if (sec.type === 'argument' && sec.instance) {
        offsetx += sec.instance.state.width
        otherHeight = Math.max(otherHeight, sec.instance.state.height)
      } else if (sec.type === 'text' && sec.elem) {
        let l = Utils.computeTextLength(sec.text)
        offsetx += l
      } else if (sec.type === 'image' && sec.elem) {
        let l = sec.width ? sec.width : 24
        offsetx += l
        otherHeight = Math.max(otherHeight, sec.height)
      }
      offsetx += space
    }
    otherWidth = offsetx - space + padding.right

    option.state.contentWidth = Math.max(otherWidth, contentWidth)
    option.state.contentHeight = contentHeight + padding.top + padding.bottom

    // 调整容器大小
    let $shape = $dom.children('path')
    $shape.trigger(ShapeUtils.events.resize, [{
      contentWidth: option.state.contentWidth,
      contentHeight: option.state.contentHeight
    }])

    // 更新大小
    option.state.width = $shape[0].__boundbox__.width
    option.state.height = $shape[0].__boundbox__.height
    option.state.contentWidth = $shape[0].__boundbox__.contentWidth
    option.state.contentHeight = $shape[0].__boundbox__.contentHeight
    option.state.outerWidth = $shape[0].__boundbox__.outerWidth
    option.state.outerHeight = $shape[0].__boundbox__.outerHeight

    let adjustSection = function (sec, offx, offy) {
      let $child = null
      if (sec.type === 'argument' && sec.instance) {
        sec.instance.update({
          x: offx,
          y: (option.state.height - sec.instance.state.height) / 2 + offy
        })
        offx += sec.instance.state.width
      } else if (sec.type === 'text' && sec.elem) {
        $child = $(sec.elem)
        let l = Utils.computeTextLength(sec.text)
        // 根据高度调整文本位置
        $child.trigger(ShapeUtils.events.positionText, [{
          x: l / 2,
          y: 0,
          translatex: offx,
          translatey: option.state.height / 2 + offy // 中心定位
        }])
        offx += l
      } else if (sec.type === 'image' && sec.elem) {
        $child = $(sec.elem)
        let l = sec.width ? sec.width : 24
        // 根据高度调整文本位置
        $child.trigger(ShapeUtils.events.position, [{
          translatex: offx,
          translatey: (option.state.height - sec.height) / 2 + offy
        }])
        offx += l
      }
      return offx
    }
    // 根据新大小调整Sections位置
    let offsety = 0
    offsetx = padding.left
    for (let sec of sections.values()) {
      offsetx = adjustSection(sec, offsetx, offsety)
      offsetx += space
    }

    // 根据新大小调整Others位置
    offsety = option.state.height + 16 // 补充：计算child高度
    offsetx = padding.left
    for (let sec of others.values()) {
      offsetx = adjustSection(sec, offsetx, offsety)
      offsetx += space
    }
  }
}

class BlockAction extends BlockStack {
  constructor(def) {
    def.state.contentHeight = 40
    def.display.minContentHeight = 40
    super(def)
  }

  createContainer() {
    let g = ShapeUtils.base.group(this.def)
    let opt = Object.assign({}, this.def.background)
    // 缺省外形
    let shape = ShapeUtils.path.slot(opt)
    $(g).append(shape)

    // 更新大小
    this.def.state.width = shape.__boundbox__.width
    this.def.state.height = shape.__boundbox__.height
    this.def.state.contentWidth = shape.__boundbox__.contentWidth
    this.def.state.contentHeight = shape.__boundbox__.contentHeight

    return g
  }

  adjust(option) {
    const $dom = $(option.dom)
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
      } else if (sec.type === 'text' && sec.elem) {
        let l = Utils.computeTextLength(sec.text)
        offsetx += l
      } else if (sec.type === 'image' && sec.elem) {
        let l = sec.width ? sec.width : 24
        offsetx += l
      }
      offsetx += space
    }

    offsetx -= space
    option.state.contentWidth = offsetx + padding.right
    option.state.contentHeight = contentHeight + padding.top + padding.bottom

    logger.debug('ACTION ======', option.state)
    // 调整容器大小
    let $shape = $dom.children('path')
    $shape.trigger(ShapeUtils.events.resize, [{
      contentWidth: option.state.contentWidth,
      contentHeight: option.state.contentHeight
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
        // 根据高度调整文本位置
        sec.instance.update({
          x: offsetx,
          y: (option.state.height - sec.instance.state.height) / 2 + 2 // 微调
        })
        offsetx += sec.instance.state.width
      } else if (sec.type === 'text' && sec.elem) {
        $child = $(sec.elem)
        let l = Utils.computeTextLength(sec.text)
        // 根据高度调整文本位置
        $child.trigger(ShapeUtils.events.positionText, [{
          x: l / 2,
          y: 0,
          translatex: offsetx,
          translatey: option.state.height / 2 + 2 // 中心定位
        }])
        offsetx += l
      } else if (sec.type === 'image' && sec.elem) {
        $child = $(sec.elem)
        let l = sec.width ? sec.width : 24
        // 根据高度调整文本位置
        $child.trigger(ShapeUtils.events.position, [{
          translatex: offsetx,
          translatey: (option.state.height - sec.height) / 2 + 2
        }])
        offsetx += l
      }
      offsetx += space
    }
  }
}

class BlockEvent extends BlockAction {
  constructor(def) {
    super(def)
  }

  createContainer() {
    let g = ShapeUtils.base.group(this.def)
    let opt = Object.assign({}, this.def.background)

    // 缺省外形
    let shape = ShapeUtils.path.cap(opt)
    $(g).append(shape)

    // 更新大小
    this.def.state.width = shape.__boundbox__.width
    this.def.state.height = shape.__boundbox__.height
    this.def.state.contentWidth = shape.__boundbox__.contentWidth
    this.def.state.contentHeight = shape.__boundbox__.contentHeight

    return g
  }
}

const Blocks = {
  /**
   * 创建Block原型对象
   * option: Object 原型属性
   */
  createPrototype: function (option) {
    if (!option.type) {
      return null
    }

    let proto = null
    if (option.type === 'variant') {
      proto = new BlockVariant(option)
    } else if (option.type === 'marker') {
      proto = new BlockMarker(option)
    } else if (option.type === 'action') {
      proto = new BlockAction(option)
    } else if (option.type === 'event') {
      proto = new BlockEvent(option)
    } else if (option.type === 'express') {
      proto = new BlockExpress(option)
    } else if (option.type === 'control') {
      proto = new BlockControl(option)
    } else if (option.type === 'argument') {
      proto = new BlockArgument(option)
    }
    return proto
  }
}

export default Blocks