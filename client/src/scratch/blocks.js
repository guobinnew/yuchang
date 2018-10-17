import $ from 'jquery'
import * as d3 from "d3"
import uuidv4 from 'uuid/v4'
import yuchg from '../base'
import logger from '../logger'
import ShapeUtils from './shapes'
import Utils from './utils'
import Argument from './argus'

const ycDropMargin = 20
// 块实例
class BlockInstance {
  constructor(proto, state) {
    this.uid = uuidv4() // 唯一标示
    this.__proto = proto // 原型Block对象
    this.dom = null // DOM根节点
    this.regions = {} // 可投放区域

    // 复制状态
    this.state = $.extend(true, {}, this.__proto.def.state)
    // 更新状态
    this.update(state, {
      force: true
    })
  }

  /**
   * 获取布局宽度
   */
  layoutWidth() {
    return this.state.size.width
  }

  /**
   * 获取布局高度
   */
  layoutHeight() {
    if (this.__proto.def.shape === 'cup' || this.__proto.def.shape === 'cuptwo') {
      return this.state.size.wholeHeight
    }
    return this.state.size.height
  }

  /**
   * child类型
   */
  childType(newType) {
    let $elem = $(this.element())
    if (newType == null) {
      return $elem.attr('data-child')
    }

    const validType = ['', 'argument', 'resolve', 'reject']
    if (validType.indexOf(newType) < 0) {
      logger.warn('BlockInstance childType failed: invalid type --', newType)
      return
    }

    $elem.attr('data-child', newType)
  }
  /**
   * 调试输出
   */
  dump() {
    let $elem = $(this.element())
    let $path = $elem.children('path.ycBlockBackground')
    let bbox = $path[0].getBBox()

    let output = {
      uid: this.uid,
      protoId: this.__proto.def.id,
      CTM: this.element().getCTM(),
      Boundbox: bbox,
      Transform: $elem.attr('transform'),
      Region: this.getRegions(),
      State: {
        Size: this.state.size
      },
      stackPosition: this.__proto.stackPosition(),
      canstackPosition: this.__proto.canStackPosition(),
      childType: this.childType()
    }
    logger.debug('****** Instance Dump ******', output)
  }

  // 获取实例类型
  type() {
    return this.__proto ? this.__proto.def.type : 'unknown'
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

  // 是否包含子节点
  hasNext(instance) {
    if (!instance) {
      return false
    }

    let uid = instance.uid
    let found = false
    let $dom = $(this.element())

    $dom.find('g.ycBlockDraggable').each(function () {
      if ($(this).attr('data-uid') === uid) {
        found = true
        return false
      }
    })

    return found
  }

  /**
   * 
   */
  setTranslate(x, y) {
    if(!yuchg.isNumber(x) || !yuchg.isNumber(y)) {
      logger.warn('BlockInstance setTranslate failed: x or y is not a number')
      return
    }
    this.state.transform.x = x
    this.state.transform.y = y
    let $dom = $(this.element())
    $dom.attr('transform', `translate(${x},${y})`)
  }
  
  /**
   * 获取投放区域
   */
  getRegions() {
    this.updateDropRegions()
    return this.regions
  }

   /**
    * 
    */
  updateRegion_top(regions) {
    let m = this.element().getCTM()
    const shape = this.__proto.def.shape
    let $path = $(this.element()).children('path.ycBlockBackground')
    let bbox = $path[0].getBBox()

    // 获取panel的偏移
    let canvasOffset = this.__proto.def.__panel.viewPortOffset()

    if (shape === 'cap') {
      logger.debug('Instance _updateregion_top failed: cap can not stack in top')
      return
    }

    regions.stacks.top = Utils.boundRect(
      Number(m.e) / Number(m.a) - canvasOffset.x,
      Number(m.f) / Number(m.d) - ycDropMargin - canvasOffset.y,
      bbox.width,
      ycDropMargin
    )
  }

  updateRegion_bottom(regions) {
    let m = this.element().getCTM()
    const shape = this.__proto.def.shape
    let $path = $(this.element()).children('path.ycBlockBackground')
    let bbox = $path[0].getBBox()
    const size = this.state.size

    // 获取panel的偏移
    let canvasOffset = this.__proto.def.__panel.viewPortOffset()

    if (shape === 'slot') {
      regions.stacks.bottom = Utils.boundRect(
        Number(m.e) / Number(m.a) - canvasOffset.x,
        Number(m.f) / Number(m.d) - canvasOffset.y,
        bbox.width,
        bbox.height + ycDropMargin
      )
    } else if (shape === 'cap') {
      regions.stacks.bottom = Utils.boundRect(
        Number(m.e) / Number(m.a) - canvasOffset.x,
        Number(m.f) / Number(m.d) - canvasOffset.y,
        bbox.width,
        size.height + bbox.y + ycDropMargin
      )
    } else if (shape === 'cup' || shape === 'cuptwo') {
      regions.stacks.bottom = Utils.boundRect(
        Number(m.e) / Number(m.a) - canvasOffset.y,
        Number(m.f) / Number(m.d) + bbox.height - size.bottomHeight - canvasOffset.y,
        bbox.width,
        size.bottomHeight + ycDropMargin
      )
    }
  }

  updateRegion_resolve(regions) {
    let m = this.element().getCTM()
    const shape = this.__proto.def.shape
    let $path = $(this.element()).children('path.ycBlockBackground')
    let bbox = $path[0].getBBox()
    const size = this.state.size

    // 获取panel的偏移
    let canvasOffset = this.__proto.def.__panel.viewPortOffset()

    let validshapes = ['cup', 'cuptwo']
    if (validshapes.indexOf(shape) < 0) {
      logger.debug('Instance _updateregion_resolve failed: invalid shape -- ', shape)
      return
    }

    regions.stacks.resolve = Utils.boundRect(
      Number(m.e) / Number(m.a) - canvasOffset.x,
      Number(m.f) / Number(m.d) + size.height - canvasOffset.y,
      bbox.width,
      size.height
    )
  }

  updateRegion_reject(regions) {
    let m = this.element().getCTM()
    const shape = this.__proto.def.shape
    let $path = $(this.element()).children('path.ycBlockBackground')
    let bbox = $path[0].getBBox()
    const size = this.state.size

    let validshapes = ['cup', 'cuptwo']
    if (validshapes.indexOf(shape) < 0) {
      logger.debug('Instance _updateregion_reject failed: invalid shape -- ', shape)
      return
    }

    // 获取panel的偏移
    let canvasOffset = this.__proto.def.__panel.viewPortOffset()

    if (shape === 'cuptwo') {
      regions.stacks.reject = Utils.boundRect(
        Number(m.e) / Number(m.a) - canvasOffset.x,
        Number(m.f) / Number(m.d) + size.height + size.resolveHeight + size.centerHeight + size.cornerRadius * 2 - canvasOffset.y,
        bbox.width,
        size.centerHeight + size.cornerRadius * 2
      )
    }
  }

  // 获取实例的投放区域
  updateDropRegions() {
    logger.debug('updateDropRegions =====')
    this.regions = {}

    if (this.__proto.canStack()) {
      this.regions.stacks = {}
      // 根据Shape类型
      const pos = this.__proto.canStackPosition()
      for (let p of pos) {
        this[`updateRegion_${p}`](this.regions)
      }
    }

    // 计算参数投放区域
    if (this.__proto.canEmbed()) {
      this.regions.arguments = {}
      this.state.data.sections.forEach((sec, i) => {
        if (sec.type === 'argument') {
          let argu = Argument.argument(sec)
          if (argu) {
            // 获取参数位置
            let canvasOffset = this.__proto.def.__panel.viewPortOffset()
            this.regions.arguments[i] = argu.boundRect(-canvasOffset.x, -canvasOffset.y)
          }
        }
      })
    }
  }

  // 调试使用
  nextString() {
    let str = this.__proto.def.id
    $(this.element()).find('g .ycBlockDraggable').each(function () {
      str += $(this).attr('data-id')
    })
    return str
  }

  // 下一个Block
  nextBlock() {
    const $dom = $(this.element())
    const instances = this.__proto.def.__panel.instances
    let next = null
    $dom.children('g.ycBlockDraggable').each(function() {
      let $this = $(this)
      if ($this.attr('data-child') !== '') {
        return true
      }
      let uid = $this.attr('data-uid')
      next = instances[uid]
      return false
    })
    return next
  }

  // 上一个Block
  prevBlock() {
    let $dom = $(this.element())
    let $prev = $dom.parent('g.ycBlockDraggable')
    if ($prev.length > 0) {
      let uid = $prev.attr('data-uid')
      return this.__proto.def.__panel.instances[uid]
    }
    return null
  }

  /**
   * 从序列脱离，保留childType
   */
  pop() {
    let prev = this.prevBlock()
    let next = null
    let $dom = $(this.element())

    let childType = this.childType()
    if (childType === 'resolve') {
      next = this.resolveBlock()
    } else if (childType === 'reject') {
      next = this.rejectBlock()
    } else if (childType === 'argument') { // 参数不用pop自身的子节点
    } else { // 其余默认
      next = this.nextBlock()
    }

    if (prev) {
      $dom.detach()
      if (next) {
        // 将类型传递给新子节点
        next.childType(childType)
        $(prev.element()).append(next.element())
      }
    } else { // 将子节点加入canvas
      if (next) {
        // 清空childType
        next.childType('')
        let $canvas = $(this.__proto.def.__panel.dom.canvas)
        let canvasOffset = this.__proto.def.__panel.viewPortOffset()
        // 变换坐标
        let $next = $(next.element())
        let m = next.element().getCTM()
        next.update({
          transform: {
            x: Number(m.e) / Number(m.a) - canvasOffset.x,
            y: Number(m.f) / Number(m.d) - canvasOffset.y
          }
        })
        $canvas.append($next)
      }
      $dom.detach()
    }
  }

  clearNext() {
    let $dom = $(this.element())
    $dom.children('g.ycBlockDraggable').detach()
  }

  // 在序列后面插入instance
  next(instance) {
    if (!instance) {
      logger.warn('BlockInstance append failed: instance is null')
      return null
    }

    let next = this.nextBlock()
    let $dom = $(this.element())
    let $instElem = $(instance.element())

    $instElem.appendTo($dom)
    if (next) {
      instance.last(next)
    }
  }

  // 添加到序列末尾
  last(instance) {

    if (!instance) {
      logger.warn('BlockInstance append failed: instance is null')
      return null
    }

    let $dom = $(this.element())
    let next = this.nextBlock()

    if (next) {
      next.last(instance)
    } else {
      $dom.append(instance.element())
    }
  }

  /**
   * 
   */
  resolveBlock() {
    const $dom = $(this.element())
    const instances = this.__proto.def.__panel.instances
    let next = null
    $dom.children('g.ycBlockResolve').each(function() {
      let $this = $(this)
      let uid = $this.attr('data-uid')
      next = instances[uid]
      return false
    })
    return next
  }

  /**
   * 
   */
  rejectBlock() {
    const $dom = $(this.element())
    const instances = this.__proto.def.__panel.instances
    let next = null
    $dom.children('g.ycBlockReject').each(function() {
      let $this = $(this)
      let uid = $this.attr('data-uid')
      next = instances[uid]
      return false
    })
    return next
  }

  /**
   * 
   */
  resolve(instance) {
    if (!instance) {
      logger.warn('BlockInstance append failed: instance is null')
      return null
    }

    let next = this.resolveBlock()
    let $dom = $(this.element())
    let $instElem = $(instance.element())

    $instElem.appendTo($dom)
    if (next) {
      instance.last(next)
    }
  }

  /**
   * 
   */
  reject(instance) {
    if (!instance) {
      logger.warn('BlockInstance append failed: instance is null')
      return null
    }

    let next = this.rejectBlock()
    let $dom = $(this.element())
    let $instElem = $(instance.element())

    $instElem.appendTo($dom)
    if (next) {
      instance.last(next)
    }
  }

  // 移除并返回nextBlock（没有删除）
  removeNext(recursive = false) {
    let $dom = $(this.element())
    let next = this.nextBlock()
    logger.debug('remove', next, $dom)
    if (next) {
      if (!recursive) {
        let nextnext = next.nextBlock()
        if (nextnext) {
          $(nextnext.element()).insertBefore(next.element())
        }
      }
      $(next.element()).detach()
    }
    return next
  }

  // 更新状态
  update(newState, option) {
    let modify = [] // modify 表明更新类型：size 更新大小 backgroud 更新背景 tansform 更新位置变换 data 更新显示内容
    let _newState = null
    if (yuchg.isFunction(newState)) {
      _newState = newState()
    } else if (yuchg.isObject(newState)) {
      _newState = newState
    }

    if (!option) {
      option = {
        force: !newState,
        next: false,
        prev: false
      }
    }

    if (yuchg.isNull(_newState) && !option.force) {
      logger.warn(`BlockInstance ${this.uid} update failed: newState is NULL`)
      return
    }

    if (!yuchg.isObject(_newState) && !option.force) {
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
      modify: option.force ? null : modify
    })

    if (option.next === true) {
      let next = this.nextBlock()
      if (next) {
        next.update(null, {
          force: true,
          next: true,
          prev: false
        })
      }
    }

    if (option.prev === true) {
      let prev = this.prevBlock()
      if (prev) {
        prev.update(null, {
          force: true,
          next: false,
          prev: true
        })
      }
    }
  }

  // 清空
  clear() {
    // 删除子节点children

    // 删除next
    let next = this.nextBlock()
    if (next) {
      this.__proto.def.__panel.removeBlock(next.uid)
    }
    this.__proto.instances.delete(this.uid)
    $(this.dom).remove()
    this.dom = null
  }
}

// 块实例
class BlockMarkerInstance extends BlockInstance {
  constructor(proto, state) {
    super(proto, state)
    this.ghostInstance = null
    this.ghostOffset = {
      x: 0,
      y: 0
    }
    this.hostInstance = null
  }

  /**
   * 获取布局高度
   */
  layoutHeight() {
    if (this.ghostInstance) {
      return this.ghostInstance.layoutHeight()
    }
    return 0
  }

  empty() {
    let $dom = $(this.element())
    $dom.attr('visibility', 'hidden')
    $dom.children('path').remove()
    $dom.children().detach()
    $dom.detach()
    this.ghostInstance = null
    this.ghostOffset = {
      x: 0,
      y: 0
    }
    this.hostInstance = null
    this.childType('')
  }

  ghost(inst, visible = true) {
    if (!inst) {
      this.empty()
      return
    }

    let $dom = $(this.element())
    this.ghostInstance = inst
    this.hostInstance = null
    // 复制path
    let $elem = $(this.ghostInstance.element())
    let $path = $elem.children('path').clone()
    $path.attr('fill', '#000000')
    $path.attr('stroke', '#000000')
    $path.attr('fill-opacity', '0.2')
    $dom.children().remove()
    $dom.append($path)
    $(this.dom).attr('visibility', visible ? 'visible' : 'hidden')

    this.ghostOffset.x = 0
    this.ghostOffset.y = inst.layoutHeight()
  }

  update(newState, option) {
    if (!this.ghostInstance) {
      return
    }

    let that = this
    let $dom = $(this.element())
    // 更新子元素位置
    let offsety = this.ghostOffset.y
    $dom.children('g.ycBlockDraggable[data-child=""]').each(function () {
      let selectUid = $(this).attr('data-uid')
      let selectInst = that.__proto.def.__panel.instances[selectUid]
      selectInst.update({
        transform: {
          x: 0,
          y: offsety
        }
      })
      offsety += selectInst.layoutHeight()
    })
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

  // 是否可以Stack其他Block
  canStack() {
    return false
  }

  isStackBlock() {
    return false
  }

  // 其他Block可以Stack到自己上面的位置
  canStackPosition() {
    return []
  }

  // 自身可以Stack到其他Block上面的位置
  stackPosition() {
    return []
  }

  // 是否嵌入Embed
  canEmbed() {
    return false
  }

  // 是否为嵌入Block类型
  isEmbedBlock() {
    return false
  }

  // 是否为内部对象
  isInternal() {
    return this.def.category === 'internal'
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
    const props = ['id', 'shape', 'type', 'category', 'child']
    for (let i of props) {
      let v = this.def[i]
      if (!yuchg.isString(v)) {
        logger.warn(`create Block: ${i} is not string --`, v)
        v = ''
      }
      $elem.attr('data-' + i, v)
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
    $elem.attr('visibility', 'hidden')
    return elem
  }

  adjustBackground(option) {}

  adjustTransform(option) {}

  /**
   * 克隆一个对象实例, state为实例的状态变量
   */
  instance(state) {
    var inst = new BlockMarkerInstance(this, state)
    const dom = inst.element()
    dom.__instance = inst
    dom.__panel = inst.__proto.def.__panel
    this.instances.set(inst.uid, inst)
    return inst
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

  // 是否嵌入Embed
  canEmbed() {
    return false
  }

  // 是否为嵌入Block类型
  isEmbedBlock() {
    return true
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
    let length = this.textWidth(state.data.text)
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

  // 是否可以Stack其他Block
  canStack() {
    return true
  }

  isStackBlock() {
    return true
  }

  // 可以Stack其他Block的位置
  canStackPosition() {
    let pos = []
    if (!!this.def.begin === false) {
      pos.push('top')
    }

    if (!!this.def.end === false) {
      pos.push('bottom')
    }
    // 根据形状来确定
    return pos
  }

  // 自身可以Stack的位置
  stackPosition() {
    let pos = ['resolve', 'reject']
    if (!!this.def.end === false) {
      pos.push('top')
    }

    if (!!this.def.begin === false) {
      pos.push('bottom')
    }
    return pos
  }

   // 是否嵌入Embed
   canEmbed() {
    return true
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
    let that = this
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
            // 如果是拖放状态
            if (that.def.__panel.startDrag && that.def.__panel.selected) {
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
                this.__instance.update(null, {
                  force: true
                })
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
            // 如果是拖放状态
            if (that.def.__panel.startDrag && that.def.__panel.selected) {
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
                this.__instance.update(null, {
                  force: true
                })
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
        if (!sec.__assign) {
          argu.show()
        } else {
          argu.hide()
          sec.__assign.update()
        }
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
    let offsety = padding.top
    let contentHeight = 20

    // 先计算宽度和最大高度
    for (let sec of sections.values()) {
      if (sec.type === 'argument' && sec.dom) {
        if (sec.__assign) { // 计算Assgin Block的大小
          sec.__width = sec.__assign.layoutWidth()
          contentHeight = Math.max(contentHeight, sec.__assign.layoutHeight())
        } else {
          sec.__width = sec.data.size.width
          contentHeight = Math.max(contentHeight, sec.data.size.height)
        }
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
        if (sec.__assign) {
          sec.__assign.update({
            transform: {
              x: offsetx,
              y: (contentHeight - sec.__assign.layoutHeight()) / 2 + padding.top
            }
          })
        } else {
          // 根据高度调整文本位置
          let argu = Argument.argument(sec)
          argu.translate(offsetx, (contentHeight - sec.data.size.height) / 2 + padding.top)
        }
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

    // 更新子元素位置
    offsety = state.size.height
    $dom.children('g.ycBlockDraggable[data-child=""]').each(function () {
      let $this = $(this)
      let selectInst = null
      if ($this.attr('data-id') === 'insertmarker') {
        selectInst = def.__panel.marker
      } else {
        selectInst = def.__panel.instances[$this.attr('data-uid')]
      }

      selectInst.setTranslate(0, offsety)
      offsety += selectInst.layoutHeight()
    })
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

  // 是否可以Stack其他Block
  canStack() {
    return false
  }

  isStackBlock() {
    return false
  }

  // 可以Stack其他Block的位置
  canStackPosition() {
    return []
  }

  // 自身可以Stack的位置
  stackPosition() {
    return []
  }

  // 是否嵌入Embed
  canEmbed() {
    return true
  }

  // 是否为嵌入Block类型
  isEmbedBlock() {
    return true
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

  // 可以Stack其他Block的位置
  canStackPosition() {
    let pos = super.canStackPosition()
    
    pos.push('resolve')
    // 根据形状来确定
    if (this.def.shape === 'cuptwo') {
      pos.push('reject')
    }
    return pos
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
        if (sec.__assign) { // 计算Assgin Block的大小
          sec.__width = sec.__assign.layoutWidth()
          contentHeight = Math.max(contentHeight, sec.__assign.layoutHeight())
        } else {
          sec.__width = sec.data.size.width
          contentHeight = Math.max(contentHeight, sec.data.size.height)
        }
      } else if (sec.type === 'text' && sec.dom) {
        sec.__width = this.textWidth(sec.text)
      } else if (sec.type === 'image' && sec.dom) {
        sec.__width = sec.width
      }
      contentWidth += sec.__width
      contentWidth += space
    }
    contentWidth -= space

    // 计算other文字宽度
    if (def.shape === 'cuptwo' && state.data.other) {
      const other = state.data.other
      other.__width = 0
      // 计算分支文字
      if (other.type === 'text') {
        other.__width = this.textWidth(other.text)
      }
      contentWidth = Math.max(contentWidth, other.__width)
    }

    // 计算resolve高度
    let resolveHeight = 0
    $dom.children('g.ycBlockDraggable[data-child="resolve"]').each(function () {
      let $this = $(this)
      let selectInst = null
      if ($this.attr('data-id') === 'insertmarker') {
        selectInst = def.__panel.marker
      } else {
        selectInst = def.__panel.instances[$this.attr('data-uid')]
      }
      resolveHeight += selectInst.layoutHeight()
    })

    // 计算reject高度 
    let rejectHeight = 0
    if (def.shape === 'cuptwo') {
      $dom.children('g.ycBlockDraggable[data-child="reject"]').each(function () {
        let $this = $(this)
        let selectInst = null
        if ($this.attr('data-id') === 'insertmarker') {
          selectInst = def.__panel.marker
        } else {
          selectInst = def.__panel.instances[$this.attr('data-uid')]
        }
        rejectHeight += selectInst.layoutHeight()
      })
    }

    // 调整容器大小
    let $shape = $dom.children('path')
    state.size.contentWidth = contentWidth + padding.right + padding.left
    state.size.contentHeight = contentHeight + padding.top + padding.bottom

    if (def.shape === 'cup') {
      $shape.trigger(ShapeUtils.events.resize, [{
        contentWidth: state.size.contentWidth,
        contentHeight: state.size.contentHeight,
        slotHeight: resolveHeight
      }])
    } else if (def.shape === 'cuptwo') {
      $shape.trigger(ShapeUtils.events.resize, [{
        contentWidth: state.size.contentWidth,
        contentHeight: state.size.contentHeight,
        slotHeight: [resolveHeight, rejectHeight]
      }])
    }
   
    // 更新容器大小
    state.size.width = $shape[0].__boundbox.width
    state.size.height = $shape[0].__boundbox.height
    state.size.contentWidth = $shape[0].__boundbox.contentWidth
    state.size.contentHeight = $shape[0].__boundbox.contentHeight

    state.size.cornerRadius = $shape[0].__boundbox.cornerRadius
    state.size.bottomHeight = $shape[0].__boundbox.bottomHeight
    
    if (def.shape === 'cup') {
      state.size.resolveHeight = $shape[0].__boundbox.slotHeight
    } else if (def.shape === 'cuptwo') {
      state.size.resolveHeight = $shape[0].__boundbox.slotHeight[0]
      state.size.rejectHeight = $shape[0].__boundbox.slotHeight[1]
    }
    state.size.wholeHeight = $shape[0].__boundbox.wholeHeight

    contentHeight = state.size.height - padding.top - padding.bottom
    let offsety = padding.top
    let offsetx = padding.left
    // 根据新大小调整位置
    for (let sec of sections) {
      let $child = null
      if (sec.type === 'argument' && sec.dom) {
        if (sec.__assign) {
          sec.__assign.update({
            transform: {
              x: offsetx,
              y: (contentHeight - sec.__assign.layoutHeight()) / 2 + padding.top
            }
          })
        } else {
          // 根据高度调整文本位置
          let argu = Argument.argument(sec)
          argu.translate(offsetx, (contentHeight - sec.data.size.height) / 2 + padding.top)
        }
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

    // 调整Resolve位置
    $dom.children('g.ycBlockDraggable[data-child="resolve"]').each(function () {
      let $this = $(this)
      let selectInst = null
      if ($this.attr('data-id') === 'insertmarker') {
        selectInst = def.__panel.marker
      } else {
        selectInst = def.__panel.instances[$this.attr('data-uid')]
      }
      selectInst.setTranslate(16, offsety)
      offsety += selectInst.layoutHeight()
    })
    offsety += state.size.resolveHeight

    // 调整位置
    if (def.shape === 'cuptwo' && state.data.other) {
      offsety += state.size.cornerRadius
      state.size.centerHeight = $shape[0].__boundbox.centerHeight
      // 更新other文字位置
      let $other = $dom.children('.ycBlockOther')
      $other.trigger(ShapeUtils.events.positionText, [{
        x: padding.left + state.data.other.__width / 2,
        y: 0,
        translatex: 0,
        translatey: offsety + state.size.centerHeight / 2
      }])
      offsety += state.size.cornerRadius

      // 调整Reject位置
      $dom.children('g.ycBlockDraggable[data-child="reject"]').each(function () {
        let $this = $(this)
        let selectInst = null
        if ($this.attr('data-id') === 'insertmarker') {
          selectInst = def.__panel.marker
        } else {
          selectInst = def.__panel.instances[$this.attr('data-uid')]
        }
        selectInst.setTranslate(16, offsety)
        offsety += selectInst.layoutHeight()
      })
      offsety += state.size.rejectHeight
    } 

    // 调整下标位置
    if (state.data.subscript) {
      offsety += state.size.cornerRadius
      let $sub = $dom.children('.ycBlockSubscript')
      $sub.trigger(ShapeUtils.events.position, [{
        translatex: state.size.width - padding.right - state.data.subscript.width,
        translatey: state.size.wholeHeight - state.size.bottomHeight - state.size.cornerRadius + (state.size.bottomHeight - state.data.subscript.height) / 2
      }])
    }

    // 更新next节点
    offsety = state.size.wholeHeight
    $dom.children('g.ycBlockDraggable[data-child=""]').each(function () {
      let $this = $(this)
      let selectInst = null
      if ($this.attr('data-id') === 'insertmarker') {
        selectInst = def.__panel.marker
      } else {
        selectInst = def.__panel.instances[$this.attr('data-uid')]
      }

      selectInst.setTranslate(0, offsety)
      offsety += selectInst.layoutHeight()
    })
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

   // 自身可以Stack的位置
   stackPosition() {
    return ['top']
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