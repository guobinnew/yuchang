import $ from 'jquery'
import * as d3 from "d3"
import uuidv4 from 'uuid/v4'
import yuchg from '../base'
import logger from '../logger'
import ShapeUtils from './shapes'
import Utils from './utils'
import Argument from './argus'

// 块实例
class BlockInstance {
  constructor(proto, state) {
    this.uid = uuidv4() // 唯一标示
    this.__proto = proto // 原型Block对象
    this.dom = null // DOM根节点
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
    if (!this.dom) {
      let $clone = $(this.__proto.prototypeElement).clone(true)
      this.dom = $clone[0]
      this.dom.__inst = this
    }
    return this.dom
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

    logger.debug('####################', this.state)
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
    $(this.dom).remove()

    // 通知父对象更新
  }
}

const minWidth = 40 // Block头部最小宽度
const minHeight = 32 // Block头部最小高度
const minSpace = 4 // Section最小间距
/*
Block基类
*/
class Block {
  constructor(option) {
    this.instances = new Map() // 实例Map列表
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
  }

   /**
   * 计算文字长度
   */
  textWidth(text) {
    const $parent = $(this.def.__panel.dom.canvas)
    let t = ShapeUtils.base.text({
      text: text
    })
    $(t).css('visibility', 'hidden')
    $parent.append(t)
    let w = t.getComputedTextLength()
    t.remove()
    return w
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
    elem.__proto = this

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
    // 给顶层path绘制背景
    const $dom = $(option.dom)
    // 调整容器大小
    const $shape = $dom.children('path')
    let opt = Object.assign({}, option.state.background)
    $shape.trigger(ShapeUtils.events.background, [opt])
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
    const dom = inst.element()
    dom.__instance = inst
    dom.__panel = inst.__proto.def.__panel
    this.instances.set(inst.uid, inst)
    return inst
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

  /**
   * 创建顶层容器
   */
  createContainer() {
    let elem = super.createContainer()
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

    return elem
  }

  createElement() {
    // 创建顶层容器
    let elem = this.createContainer()
    let $elem = $(elem)

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
  constructor(option) {
    option.state = $.extend(true, {
      size: {
        minHeight: 40,
        height: 40
      }
    }, option.state)
    super(option)
  }

  createElement() {
    let elem = this.createContainer()
    let $elem = $(elem)

    const state = this.def.state
    if (yuchg.isArray(state.data.sections)) {
      // 创建Section
      state.data.sections.forEach((sec, i) => {
        let child = this.createSection(sec)
        if (!child) {
          logger.debug(`Block<${ this.def.id }> createSection failed:`, sec)
        } else {
          sec.dom = child
          $(sec.dom).attr('data-index', i)
          $elem.append(child)
        }
      })
    } else {
      logger.warn(`Block<${ this.def.id }> has no sections:`, state.data.sections)
      state.data.sections = []
    }
    return elem
  }

  // 创建Sections
  createSection(sec) {
    let that = this
    let elem = null
    if (sec.type === 'argument') {
      elem = Argument.createElement(sec)

      if (elem) {
        let $elem = $(elem)
        $elem.__panel = this.def.__panel

        // 绑定事件
        if (sec.datatype === 'number' || sec.datatype === 'string') {
          $elem.on('mouseup', function() {
            let $this = $(this)
            let $path = $this.children('path')
            let $text = $this.find('.ycBlockEditableText>text')
            
            let m = $path[0].getCTM()
            let bbox = $path[0].getBBox()
            if (!$this.parent().hasClass('ycBlockFlyout')) {
              // 显示输入框
              this.__panel.showInputWidget({
                dom: this,
                type: this.__section.datatype,
                x: Number(m.e),
                y: Number(m.f),
                width: bbox.width + 1,
                height: bbox.height + 1,
                value: $text.html(),
                callback: (v) => {
                  this.__section.data.value = v
                  // 更新整个Block
                  this.__instance.update(null, true)
                }
              })
            }
          })
        }
      }
    } else if (sec.type === 'text') {
      elem = ShapeUtils.base.text(sec)
    } else if (sec.type === 'image') {
      if (!sec.width) {
        sec.width = 0
      }
      if (!sec.height) {
        sec.height = 0
      }
      elem = ShapeUtils.group.image(sec)
    }
    return elem
  }

  adjustBackground(option) {
    // 修改Section边框
    const state = option.state
    for (let sec of state.data.sections) {
      if (sec.dom) {
        let $child = $(sec.dom)
        // 修改边框颜色
        if (state.background && state.background.stroke) {
          $child.trigger(ShapeUtils.events.background, [{
            stroke: state.background.stroke
          }])
        }
      }
    }
  }

  adjustData(option) {
    // 修改section内容
    const state = option.state
    for (let sec of state.data.sections) {
      if (sec.type === 'argument' && sec.dom) { // 只修改参数内容
        sec.dom.__panel = option.def.__panel
        let argu = Argument.argument(sec)
        argu.adjust()
      }
    }
  }

  adjustSize(option) {
    const $dom = $(option.dom)
    const padding = this.padding(option)
    const state = option.state
    const sections = state.data.sections

    // 计算section尺寸
    let space = state.size.space
    let offsetx = padding.left
    let contentHeight = 20

    // 先计算宽度和最大高度
    for (let sec of sections.values()) {
      if (sec.type === 'argument' && sec.dom) {
        sec.__width = sec.data.size.width
        contentHeight = Math.max(contentHeight, sec.data.size.height)
      } else if (sec.type === 'text' && sec.dom) {
        sec.__width = Utils.computeTextLength(sec.text)
      } else if (sec.type === 'image' && sec.dom) {
        sec.__width = sec.width
      }
      offsetx += sec.__width
      offsetx += space
    }

    offsetx -= space
    state.size.contentWidth = offsetx + padding.right
    state.size.contentHeight = contentHeight + padding.top + padding.bottom

    // 调整容器大小
    let $shape = $dom.children('path')
    $shape.trigger(ShapeUtils.events.resize, [{
      contentWidth: state.size.contentWidth,
      contentHeight: state.size.contentHeight
    }])

    // 更新容器大小
    state.size.width = $shape[0].__boundbox.width
    state.size.height = $shape[0].__boundbox.height
    state.size.contentWidth = $shape[0].__boundbox.contentWidth
    state.size.contentHeight = $shape[0].__boundbox.contentHeight

    offsetx = padding.left
    // 根据新大小调整位置
    for (let sec of sections) {
      let $child = null
      if (sec.type === 'argument' && sec.dom) {
        // 根据高度调整文本位置
        let argu = Argument.argument(sec)
        argu.translate(offsetx, (state.size.height - sec.data.size.height) / 2 + 2)
      } else if (sec.type === 'text' && sec.dom) {
        $child = $(sec.dom)
        // 根据高度调整文本位置
        $child.trigger(ShapeUtils.events.positionText, [{
          x: sec.__width / 2,
          y: 0,
          translatex: offsetx,
          translatey: state.size.height / 2 + 2 // 中心定位
        }])
      } else if (sec.type === 'image' && sec.dom) {
        $child = $(sec.dom)
        // 根据高度调整文本位置
        $child.trigger(ShapeUtils.events.position, [{
          translatex: offsetx,
          translatey: (state.size.height - sec.height) / 2 + 2
        }])
      }
      offsetx += sec.__width
      offsetx += space
    }
  }

    /**
   * 克隆一个对象实例, state为实例的状态变量
   */
  instance(state) {
    const inst = super.instance(state)
    // 更新Section
    // 当前inst.state.data.sections中的dom还是指向原型
    // 需要重新更新dom
    const sections = inst.state.data.sections
    const $dom = $(inst.element())
    $dom.children().each(function() {
      const index = $(this).attr('data-index')
      if (index) {
        const section = sections[index]
        section.dom = this
        section.dom.__panel = inst.__proto.def.__panel
        section.dom.__section = sections[index]
        section.dom.__instance = inst
      }
    })
    return inst
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
  constructor(option) {
    option.state = $.extend(true, {
      size: {
        contentHeight: 40,
        minContentHeight: 40
      }
    }, option.state)
    super(option)
  }

  padding(option) {
    let p = super.padding(option)
    p.top += 2 // 微调
    return p
  }

  createContainer() {
    let g = super.createContainer()
    let opt = Object.assign({}, this.def.state.background)
    // 缺省外形
    let shape = ShapeUtils.path.slot(opt)
    $(g).append(shape)
    return g
  }
}

class BlockEvent extends BlockAction {
  constructor(def) {
    super(def)
  }

  createContainer() {
    let g = ShapeUtils.base.group(this.def)
    let opt = Object.assign({}, this.def.state.background)

    // 缺省外形
    let shape = ShapeUtils.path.cap(opt)
    $(g).append(shape)

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
    } else {
      logger.warn(`createPrototype failed: unkown type -- ${option.type}`)
    }
    return proto
  }
}

export default Blocks