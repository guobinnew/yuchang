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
      let $clone = $(this.proto.prototypeElement).clone(true)
      this.elem = $clone[0]
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

    const elem = this.element()

    let opt = {
      dom: elem,
      proto: this.proto,
      state: this.state,
      modify: modify
    }
    this.proto.adjust(opt)

    if (modify.length > 0 && (modify.indexOf('x') || modify.indexOf('y'))) {
      this.updatePosition(elem)
    }
  }

  // 更新位置
  updatePosition(dom) {
    $(dom).trigger(ShapeUtils.events.position, [{
      translatex: yuchg.isNumber(this.state.x) ? this.state.x : 0,
      translatey: yuchg.isNumber(this.state.y) ? this.state.y : 0
    }])
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
    let index = this.proto.instances.indexOf(this)
    if (index >= 0) {
      this.proto.instances.splice(index, 1)
    }
    $(this.elem).remove()

    // 通知父对象更新
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

    // 更新display设置(深度拷贝)
    $.extend(true, this.def, def)

    this.prototypeElement = this.createElement()
    if (this.prototypeElement) {
      $(this.prototypeElement).attr('data-block', this.def.id)
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
      if (this.def.shape === 'slot' || this.def.shape === 'cap' || this.def.shape === 'cup' || this.def.shape === 'cuptwo') {
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
    const $dom = $(option.dom)
    if (yuchg.isArray(option.modify) && option.modify.length > 0) {
      // 开启部分更新

    }
    $dom.trigger(ShapeUtils.events.position, [{
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
BlockArgument
*/
class BlockArgument extends Block {
  constructor(def) {
    if (def.shape === 'boolean') {
      def.display.minContentWidth = 16
    } else if (def.shape === 'dropdown') {
      def.display.buttonSize = 12
    }
    super(def)
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
    $elem.on(ShapeUtils.events.change, function(event, val){
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
  constructor(def) {
    super(def)
  }

  createElement() {
    let elem = ShapeUtils.base.group(this.def)
    let $elem = $(elem)
    if (this.def.id === 'insertmarker') {
      $elem.addClass('ycBlockInsertionMarker')
    }
    $elem.append(ShapeUtils.path.marker(this.def.background))
    this.adjust({
      dom: elem,
      proto: this,
      state: this.def.state
    })
    return elem
  }
}

class BlockVariant extends Block {
  constructor(def) {
    def.display.minHeight = 40
    def.state.height = 40
    super(def)
  }

  createElement() {
    let elem = ShapeUtils.base.group(this.def)
    let $elem = $(elem)
    let opt = {
      height: this.def.state.height
    }
    $.extend(opt, this.def.background)
    let shape = null
    if (this.def.shape === 'boolean') { // 布尔类型
      shape = ShapeUtils.path.diamondRect(opt)
    } else {
      // 缺省外形
      shape = ShapeUtils.path.roundRect(opt)
    }
    $elem.append(shape)

    // 更新大小
    this.def.state.width = shape.__boundbox__.width
    this.def.state.height = shape.__boundbox__.height
    this.def.state.contentWidth = shape.__boundbox__.contentWidth
    this.def.state.contentHeight = shape.__boundbox__.contentHeight
   
    $elem.append(ShapeUtils.base.text({
      text: this.def.text
    }))

    this.adjust({
      dom: elem,
      proto: this,
      state: this.def.state
    })
    return elem
  }

  // 计算调整内部子元素位置
  adjust(option) {

    // 根据文字计算长度
    const $dom = $(option.dom)
    const def = option.proto.def
    const padding = option.proto.padding()

    let length = Utils.computeTextLength(def.text)
    option.state.contentWidth = Math.max(length, def.display.minContentWidth)

    if (def.shape === 'dropdown') {
      // 枚举变量
    } else {
      option.state.width = Math.max(length, def.display.minContentWidth) + padding.left + padding.right
    }

    option.state.height = 40
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

    let $text = $dom.children('text')
    $text.trigger(ShapeUtils.events.positionText, [{
      x: option.state.width / 2,
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

    this.adjust({
      dom: elem,
      proto: this,
      state: this.def.state
    })

    return elem
  }

  // 创建Sections
  createSection(sec) {
    let that = this
    if (sec.type === 'argument') {
      let inst = this.addArgument(sec)
      let elem = inst.element()

      if (sec.datatype === 'number' || sec.datatype === 'string') {

        $(elem).on('mouseup', function() {
          let $this = $(this)
          let $path = $this.children('path')
          let m = $path[0].getCTM()
          let bbox = $path[0].getBBox()
          if (!$this.parent().hasClass('ycBlockFlyout')) {
            logger.debug('click me')
            that.def.__panel__.showInputWidget({
              type: 'string',
              x: Number(m.e),
              y: Number(m.f),
              width: bbox.width + 1,
              height: bbox.height + 1,
              callback: function(v) {
                inst.update({value: v})
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
    let inst = this.def.__panel__.createBlockInstance(sec.datatype, sec.state)
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
      } else if (sec.type === 'text' && sec.$elem) {
        let l = Utils.computeTextLength(sec.text)
        offsetx += l
      } else if (sec.type === 'image' && sec.$elem) {
        let l = sec.width ? sec.width : 24
        offsetx += l
      }
      offsetx += space
    }

    offsetx -= space
    option.state.width = offsetx + padding.right
    option.state.height = contentHeight + padding.top + padding.bottom

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
    option.state.outerWidth = $shape[0].__boundbox__.outerWidth
    option.state.outerHeight = $shape[0].__boundbox__.outerHeight

    offsetx = padding.left

    // 调整位置
    for (let sec of sections.values()) {
      let $child = null
      if (sec.type === 'argument' && sec.instance) {
        $child = $(sec.instance.element())
        // 根据高度调整文本位置
        $child.trigger(ShapeUtils.events.position, [{
          translatex: offsetx,
          translatey: (option.state.height - sec.instance.state.height) / 2
        }])

        if (sec.datatype === 'number' || sec.datatype === 'string') {
          //sec.instance.update()
        }

        offsetx += sec.instance.state.width
      } else if (sec.type === 'text' && sec.$elem) {
        $child = $(sec.elem)
        let l = Utils.computeTextLength(sec.text)
        // 根据高度调整文本位置
        $child.trigger(ShapeUtils.events.positionText, [{
          x: l / 2,   // 文字宽度一半
          y: 0,
          translatex: offsetx,
          translatey: (option.state.height - space) / 2
        }])
        offsetx += l
      } else if (sec.type === 'image' && sec.$elem) {
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

  createContainer() {
    return null
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
    this.def.state.outerWidth = shape.__boundbox__.outerWidth
    this.def.state.outerHeight = shape.__boundbox__.outerHeight

    return g
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
      } else if (sec.type === 'text' && sec.$elem) {
        let l = Utils.computeTextLength(sec.text) // 字体大小固定，不需要考虑字体
        offsetx += l
      } else if (sec.type === 'image' && sec.$elem) {
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
      } else if (sec.type === 'text' && sec.$elem) {
        let l = Utils.computeTextLength(sec.text)
        offsetx += l
      } else if (sec.type === 'image' && sec.$elem) {
        let l = sec.width ? sec.width : 24
        offsetx += l
        otherHeight = Math.max(otherHeight, sec.height)
      }
      offsetx += space
    }
    otherWidth = offsetx - space + padding.right

    option.state.width = Math.max(otherWidth, contentWidth)
    option.state.height = contentHeight + padding.top + padding.bottom

    // 调整容器大小
    let $shape = $dom.children('path')
    $shape.trigger(ShapeUtils.events.resize, [{
      width: option.state.width,
      height: option.state.height,
      otherHeight: otherHeight
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
        $child = $(sec.instance.element())
        // 根据高度调整文本位置
        $child.trigger(ShapeUtils.events.position, [{
          translatex: offx,
          translatey: (option.state.height - sec.instance.state.height) / 2 + offy
        }])
        offx += sec.instance.state.width
      } else if (sec.type === 'text' && sec.$elem) {
        $child = $(sec.elem)
        let l = computeTextLength(sec.text)
        // 根据高度调整文本位置
        $child.trigger(ShapeUtils.events.positionText, [{
          x: l / 2,
          y: 0,
          translatex: offx,
          translatey: option.state.height / 2 + offy // 中心定位
        }])
        offx += l
      } else if (sec.type === 'image' && sec.$elem) {
        $child = $(sec.$elem)
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
      } else if (sec.type === 'text' && sec.$elem) {
        let l = Utils.computeTextLength(sec.text)
        offsetx += l
      } else if (sec.type === 'image' && sec.$elem) {
        let l = sec.width ? sec.width : 24
        offsetx += l
      }
      offsetx += space
    }

    offsetx -= space
    option.state.width = offsetx + padding.right
    option.state.height = contentHeight + padding.top + padding.bottom

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

    // 根据新大小调整位置
    for (let sec of sections.values()) {
      let $child = null
      if (sec.type === 'argument' && sec.instance) {
        $child = $(sec.instance.element())
        // 根据高度调整文本位置
        $child.trigger(ShapeUtils.events.position, [{
          translatex: offsetx,
          translatey: (option.state.height - sec.instance.state.height) / 2 + 2  // 微调
        }])
        offsetx += sec.instance.state.width
      } else if (sec.type === 'text' && sec.$elem) {
        $child = $(sec.elem)
        let l = computeTextLength(sec.text)
        // 根据高度调整文本位置
        $child.trigger(ShapeUtils.events.positionText, [{
          x: l / 2,
          y: 0,
          translatex: offsetx,
          translatey: option.state.height / 2 + 2 // 中心定位
        }])
        offsetx += l
      } else if (sec.type === 'image' && sec.$elem) {
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
  createPrototype: function(option) {
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

