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
    this.__proto.instances.delete(this.uid)
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
      const pd = option.state.size.padding
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
    const container = this.createContainer()
    const shape = this.createShape()
    if (shape) {
      $(container).append(shape)
    }
    return container
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
   * 创建Shape
   */
  createShape() {

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
   * 创建Shape
   */
  createShape() {
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
    return shape
  }

  createElement() {
    // 创建顶层容器
    let elem = super.createElement()
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
    let length = this.textWidth(state.data.text) //Utils.computeTextLength(state.data.text)
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
    let elem = super.createElement()
    let $elem = $(elem)

    const state = this.def.state
    if (yuchg.isArray(state.data.sections)) {
      // 创建Section
      state.data.sections.forEach((sec, i) => {
        let child = this.createSection(sec)
        if (!child) {
          logger.warn(`Block<${ this.def.id }> createSection failed:`, sec)
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
    let elem = null
    if (sec.type === 'argument') {
      // 如果当前有highlightFill
      elem = Argument.createElement(sec)

      if (elem) {
        let $elem = $(elem)
        $elem.__panel = this.def.__panel
        $elem.on('mousedown', function () {
          let $this = $(this)
          let $parent = $this.parent()
          if ($parent.hasClass('ycBlockFlyout')) {
            return
          }
          event.stopPropagation()
        })

        // 绑定事件
        if (sec.datatype === 'number' || sec.datatype === 'string') {

          $elem.on('mouseup', function () {
            let $this = $(this)
            let $parent = $this.parent()
            if ($parent.hasClass('ycBlockFlyout')) {
              return
            }
            event.stopPropagation()
            
            let $path = $this.children('path')
            let m = $path[0].getCTM()
            let bbox = $path[0].getBBox()

            let background = {
              fill: $path.attr('fill'),
              stroke: $path.attr('stroke')
            }
            // 获取父背景颜色
            let $parentpath = $this.parent().children('path')
            if ($parentpath.length > 0) {
              background.fill = $parentpath.attr('fill')
              background.stroke = $parentpath.attr('stroke')
            }

            // 显示输入框
            this.__panel.showInputWidget({
              dom: this,
              type: this.__section.datatype,
              x: Number(m.e),
              y: Number(m.f),
              width: bbox.width + 1,
              height: bbox.height + 1,
              background: background,
              value: this.__section.data.value,
              callback: (v) => {
                this.__section.data.value = v
                // 更新整个Block
                this.__instance.update(null, true)
              }
            })
          })
        } else if (sec.datatype === 'enum') {
          $elem.on('mouseup', function () {
            let $this = $(this)
            let $parent = $this.parent()
            if ($parent.hasClass('ycBlockFlyout')) {
              return
            }
            event.stopPropagation()

            let $path = $this.children('path')
            let m = $path[0].getCTM()
            let bbox = $path[0].getBBox()
            let background = {
              fill: $path.attr('fill'),
              stroke: $path.attr('stroke')
            }
            // 获取父背景颜色
            let $parentpath = $this.parent().children('path')
            if ($parentpath.length > 0) {
              background.fill = $parentpath.attr('fill')
              background.stroke = $parentpath.attr('stroke')
            }
            
            // 显示输入框
            this.__panel.showDropdownWidget({
              dom: this,
              type: this.__section.datatype,
              x: Number(m.e) + bbox.width / 2 * Number(m.a),
              y: Number(m.f) + bbox.height * Number(m.d),
              background: background,
              select: this.__section.data.currentIndex,
              values: this.__section.data.values,
              callback: (i) => {
                this.__section.data.currentIndex = i
                // 更新整个Block
                this.__instance.update(null, true)
              }
            })
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
      if (sec.type === 'argument' && sec.dom) { // 只修改参数内容
        let $child = $(sec.dom)
        // 修改边框颜色
        let opt = {}
        if (state.background) {
          if (state.background.stroke) {
            opt.stroke = state.background.stroke
          }

          if (sec.data.background.chameleon) {
            opt.fill = state.background.stroke
          }
          $child.trigger(ShapeUtils.events.background, [opt])
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
    const def = option.def
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
        sec.__width = this.textWidth(sec.text)
      } else if (sec.type === 'image' && sec.dom) {
        sec.__width = sec.width
      }
      offsetx += sec.__width
      offsetx += space
    }
    offsetx -= space

    // 调整容器大小
    let $shape = $dom.children('path')
    if (def.shape === 'round' || def.shape === 'diamond') {
      state.size.width = offsetx + padding.right
      state.size.height = contentHeight + padding.top + padding.bottom
      $shape.trigger(ShapeUtils.events.resize, [{
        width: state.size.width,
        height: state.size.height
      }])
    } else {
      state.size.contentWidth = offsetx + padding.right
      state.size.contentHeight = contentHeight + padding.top + padding.bottom
      $shape.trigger(ShapeUtils.events.resize, [{
        contentWidth: state.size.contentWidth,
        contentHeight: state.size.contentHeight
      }])
    }

    // 更新容器大小
    state.size.width = $shape[0].__boundbox.width
    state.size.height = $shape[0].__boundbox.height
    state.size.contentWidth = $shape[0].__boundbox.contentWidth
    state.size.contentHeight = $shape[0].__boundbox.contentHeight

    contentHeight = state.size.height - padding.top - padding.bottom
    offsetx = padding.left
    // 根据新大小调整位置
    for (let sec of sections) {
      let $child = null
      if (sec.type === 'argument' && sec.dom) {
        // 根据高度调整文本位置
        let argu = Argument.argument(sec)
        argu.translate(offsetx, (contentHeight - sec.data.size.height) / 2 + padding.top)
      } else if (sec.type === 'text' && sec.dom) {
        $child = $(sec.dom)
        // 根据高度调整文本位置
        $child.trigger(ShapeUtils.events.positionText, [{
          x: sec.__width / 2,
          y: 0,
          translatex: offsetx,
          translatey: contentHeight / 2 + padding.top // 中心定位
        }])
      } else if (sec.type === 'image' && sec.dom) {
        $child = $(sec.dom)
        // 根据高度调整文本位置
        $child.trigger(ShapeUtils.events.position, [{
          translatex: offsetx,
          translatey: (contentHeight - sec.height) / 2 + padding.top
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
    $dom.children().each(function () {
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

  /**
   * 创建Shape
   */
  createShape() {
    let opt = Object.assign({}, this.def.state.background)
    let shape = null
    if (this.def.shape === 'diamond') { // 布尔类型
      shape = ShapeUtils.path.diamondRect(opt)
    } else {
      // 缺省外形
      shape = ShapeUtils.path.roundRect(opt)
    }
    return shape
  }

  padding(option) {
    let p = super.padding(option)
    return p
  }
}

class BlockControl extends BlockStack {
  constructor(option) {
    option.state = $.extend(true, {
      size: {
        space: 8,
        padding: {
          left: 8,
          right: 8,
          top: 8,
          bottom: 4
        },
        contentHeight: 40,
        minContentHeight: 40
      }
    }, option.state)
    super(option)
  }

  createElement() {
    const elem = super.createElement()
    const $elem = $(elem)
    const state = this.def.state

    // other
    if (this.def.shape === 'cuptwo' && state.data.other) {
      if (state.data.other.type === 'text') {
        let other = ShapeUtils.base.text(state.data.other)
        $(other).addClass('ycBlockOther')
        $elem.append(other)
      }
    }

    // subscript
    if (state.data.subscript) {
      let sub = state.data.subscript
      if (!sub.width) {
        sub.width = 0
      }
      if (!sub.height) {
        sub.height = 0
      }
      let subscript = ShapeUtils.group.image(sub)
      $(subscript).addClass('ycBlockSubscript')
      $elem.append(subscript)
    }

    return elem
  }

  /**
   * 创建Shape
   */
  createShape() {
    let opt = Object.assign({}, this.def.state.background)
    // 默认为非中止block
    opt.end = !!this.def.end
    // 缺省外形
    let shape = null
    if (this.def.shape === 'cup') {
      shape = ShapeUtils.path.cup(opt)
    } else if (this.def.shape === 'cuptwo') {
      shape = ShapeUtils.path.cuptwo(opt)
    }
    return shape
  }

  adjustSize(option) {
    const $dom = $(option.dom)
    const def = option.def
    const padding = this.padding(option)
    const state = option.state
    const sections = state.data.sections

    // 计算section尺寸
    let space = state.size.space
    let contentHeight = 20
    let contentWidth = 0
    // 先计算宽度和最大高度
    for (let sec of sections.values()) {
      if (sec.type === 'argument' && sec.dom) {
        sec.__width = sec.data.size.width
        contentHeight = Math.max(contentHeight, sec.data.size.height)
      } else if (sec.type === 'text' && sec.dom) {
        sec.__width = this.textWidth(sec.text)
      } else if (sec.type === 'image' && sec.dom) {
        sec.__width = sec.width
      }
      contentWidth += sec.__width
      contentWidth += space
    }
    contentWidth -= space

    if (def.shape === 'cuptwo' && state.data.other) {
      const other = state.data.other
      other.__width = 0
      // 计算分支文字
      if (other.type === 'text') {
        other.__width = this.textWidth(other.text)
      }
      contentWidth = Math.max(contentWidth, other.__width)
    }

    // 调整容器大小
    let $shape = $dom.children('path')
    state.size.contentWidth = contentWidth + padding.right + padding.left
    state.size.contentHeight = contentHeight + padding.top + padding.bottom
    $shape.trigger(ShapeUtils.events.resize, [{
      contentWidth: state.size.contentWidth,
      contentHeight: state.size.contentHeight
    }])

    // 更新容器大小
    state.size.width = $shape[0].__boundbox.width
    state.size.height = $shape[0].__boundbox.height
    state.size.contentWidth = $shape[0].__boundbox.contentWidth
    state.size.contentHeight = $shape[0].__boundbox.contentHeight

    state.size.cornerRadius = $shape[0].__boundbox.cornerRadius
    state.size.bottomHeight = $shape[0].__boundbox.bottomHeight
    state.size.slotHeight = $shape[0].__boundbox.slotHeight

    contentHeight = state.size.height - padding.top - padding.bottom
    let offsety = padding.top
    let offsetx = padding.left
    // 根据新大小调整位置
    for (let sec of sections) {
      let $child = null
      if (sec.type === 'argument' && sec.dom) {
        // 根据高度调整文本位置
        let argu = Argument.argument(sec)
        argu.translate(offsetx, (contentHeight - sec.data.size.height) / 2 + padding.top)
      } else if (sec.type === 'text' && sec.dom) {
        $child = $(sec.dom)
        // 根据高度调整文本位置
        $child.trigger(ShapeUtils.events.positionText, [{
          x: sec.__width / 2,
          y: 0,
          translatex: offsetx,
          translatey: contentHeight / 2 + padding.top // 中心定位
        }])
      } else if (sec.type === 'image' && sec.dom) {
        $child = $(sec.dom)
        // 根据高度调整文本位置
        $child.trigger(ShapeUtils.events.position, [{
          translatex: offsetx,
          translatey: (contentHeight - sec.height) / 2 + padding.top
        }])
      }
      offsetx += sec.__width
      offsetx += space
    }
    offsety = state.size.height

    // 调整位置
    if (def.shape === 'cuptwo' && state.data.other) {
      state.size.centerHeight = $shape[0].__boundbox.centerHeight
      // 更新other文字位置
      offsety += state.size.slotHeight[0]
      offsety += state.size.cornerRadius * 3
      let $other = $dom.children('.ycBlockOther')

      $other.trigger(ShapeUtils.events.positionText, [{
        x: padding.left + state.data.other.__width / 2,
        y: 0,
        translatex: 0,
        translatey: offsety + state.size.centerHeight / 2
      }])
      offsety += state.size.cornerRadius
    } else {
      offsety += state.size.slotHeight
      offsety += state.size.cornerRadius * 2
    }

    // 调整下标位置
    if (state.data.subscript) {
      offsety += state.size.cornerRadius
      let $sub = $dom.children('.ycBlockSubscript')
      $sub.trigger(ShapeUtils.events.position, [{
        translatex: state.size.width - padding.right - state.data.subscript.width,
        translatey: offsety + (state.size.bottomHeight - state.data.subscript.height) / 2
      }])
    }
  }
}

class BlockAction extends BlockStack {
  constructor(option) {
    option.state = $.extend(true, {
      size: {
        space: 8,
        padding: {
          left: 8,
          right: 8,
          top: 8,
          bottom: 4
        },
        contentHeight: 40,
        minContentHeight: 40
      }
    }, option.state)
    super(option)
  }

  /**
   * 创建Shape
   */
  createShape() {
    let opt = Object.assign({}, this.def.state.background)
    // 缺省外形
    let shape = ShapeUtils.path.slot(opt)
    return shape
  }
}

class BlockEvent extends BlockAction {
  constructor(def) {
    super(def)
  }

  /**
   * 创建Shape
   */
  createShape() {
    let opt = Object.assign({}, this.def.state.background)
    // 缺省外形
    let shape = ShapeUtils.path.cap(opt)
    return shape
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