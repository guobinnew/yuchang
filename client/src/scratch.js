import yuchg from './base'
import $ from 'jquery'
import uuidv4 from 'uuid/v4'
import blocks from './blocks'

// 缺省文字字体大小
const ycFontSize = 12  // ASCII
const ycUnicodeFontSize = 16  // UNICODE
// 计算文字长度
function computeTextLength(txt) {
  // 根据文字计算长度
  if( !yuchg.isString(txt)){
    return 0
  }

  var length = txt.length * ycFontSize
  var bytes = yuchg.strByteLength(txt) - txt.length
  length += bytes * ( ycUnicodeFontSize -  ycFontSize )
  return length
}

function acquireCategoryContext(cate) {
  if( blocks.categories ){
    return blocks.categories[cate]
  }
  return null
}

// SVG命名空间
const ycSvgNS = "http://www.w3.org/2000/svg"

const ShapeUtils = {
  section: function (def) {
    if( def.type == 'variant'){
      if( def.shape == 'round'){
        return ShapeUtils.roundRect(def)
      }
    }
  },
  /*
   {
   length: 16  // 水平端长度
   stroke:  ''  // 线条颜色
   fill: ''  // 填充色
   opacity: '1'   // 透明度
   classes: ''
   }
   */
  slot: function (option) {
    var path = document.createElementNS(ycSvgNS, "path")
    var $elem =  $(path)
    var height = 40
    var headlen = 48

    var d=`m 0,4 A 4,4 0 0,1 4,0 H 12 c 2,0 3,1 4,2 l 4,4 c 1,1 2,2 4,2 h 12 c 2,0 3,-1 4,-2 l 4,-4 c 1,-1 2,-2 4,-2 H ${ option.length } a 4,4 0 0,1 4,4 v ${ height }  a 4,4 0 0,1 -4,4 H ${ headlen }   c -2,0 -3,1 -4,2 l -4,4 c -1,1 -2,2 -4,2 h -12 c -2,0 -3,-1 -4,-2 l -4,-4 c -1,-1 -2,-2 -4,-2 H 4 a 4,4 0 0,1 -4,-4 z`
    $elem.attr('d', d )
    $elem.attr('stroke', option.stroke)
    $elem.attr('fill', option.fill)
    $elem.attr('fill-opacity', option.opacity)
    $elem.addClass('ycBlockPath ycBlockBackground' + (option.classes ? (' ' + option.classes) : ''))
    return $elem
  },
  /*
    {
       radius: 20  // 半径
       length: 16  // 水平端长度
       stroke:  '#2E8EB8'  // 线条颜色
       fill: '#5CB1D6'  // 填充色
       opacity: '1'   // 透明度
       classes: ''
    }
   */
  roundRect: function (option) {
    var path = document.createElementNS(ycSvgNS, "path")
    var $elem =  $(path)
    $elem.attr('d', `m 0,0 m ${option.radius},0 H ${option.radius + option.length} a ${option.radius} ${option.radius} 0 0 1 0 ${option.radius *2} H ${option.radius} a ${option.radius} ${option.radius} 0 0 1 0 ${option.radius * -2} z`)
    $elem.attr('stroke', option.stroke)
    $elem.attr('fill', option.fill)
    $elem.attr('fill-opacity', option.opacity)
    $elem.addClass('ycBlockPath ycBlockBackground' + (option.classes ? (' ' + option.classes) : ''))
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
    var path = document.createElementNS(ycSvgNS, "path")
    var $elem =  $(path)
    $elem.attr('stroke', option.stroke)
    $elem.attr('fill', option.fill)
    $elem.attr('fill-opacity', option.opacity)
    $elem.addClass('ycBlockPath ycBlockBackground' + (option.classes ? (' ' + option.classes) : ''))
    return $elem
  },

  /*
   {
   anchor: 'middle'  // 半径
   baseline: 'middle'  // 水平端长度
   classes: ''
   text: ''
   offset: {x:0,y:0}
   translate:{ x:0, y:0 }
   }
   */
  text: function (option) {
    var text = document.createElementNS(ycSvgNS, "text")
    var $elem = $(text)
    $elem.addClass('ycBlockText' + (option.classes ? (' ' + option.classes) : ''))
    $elem.attr('text-anchor', option.anchor ? option.anchor : "middle")
    $elem.attr('dominant-baseline', option.baseline ? option.baseline :"central")
    $elem.attr('dy', "0")
    $elem.attr('x', ''+option.offset.x)
    $elem.attr('y', ''+option.offset.y)
    $elem.attr('transform',`translate(${option.translate.x}, ${option.translate.y})`)
    $elem.html(option.text ? option.text : '')
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
    var g = document.createElementNS(ycSvgNS, "g")
    var $elem = $(g)
    $elem.attr('data-type', option.type)
    $elem.attr('data-shape', option.shape)
    $elem.attr('data-category', option.category)

    if(option.draggable === true){
      $elem.addClass('ycBlockDraggable')
    }
    $elem.addClass((option.classes ? (' ' + option.classes) : ''))
    return $elem
  },

  /*
   {
   classes: ''
   text: ''
   translate:{ x:0, y:0 }
   width:
   height:
   }
   */
  flyoutLabel: function (option) {
    var g = document.createElementNS(ycSvgNS, "g")
    var $elem = $(g)
    $elem.attr('display', 'block')
    $elem.attr('transform',`translate(${option.translate.x}, ${option.translate.y})`)
    $elem.addClass('ycBlockFlyoutLabel' + (option.classes ? (' ' + option.classes) : ''))

    var rect = document.createElementNS(ycSvgNS, "rect")
    var $rect = $(rect)
    $rect.attr('rx', '4')
    $rect.attr('ry', '4')
    $rect.attr('width', option.width)
    $rect.attr('height', option.height)
    $rect.addClass('ycBlockFlyoutLabelBackground')
    $elem.append($rect)

    var text = document.createElementNS(ycSvgNS, "text")
    var $text = $(text)
    $text.attr('x', '0')
    $text.attr('y',  option.height / 2)
    $text.attr('dy',  '0')
    $text.attr('text-anchor', 'start')
    $text.attr('dominant-baseline', 'central')
    $text.addClass('ycBlockFlyoutLabelText')
    $text.html(option.text ? option.text : '')
    $elem.append($text)

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
    this.parent = null  // 父元素
    this.children = []  // 内部子元素

    this.update(states)
  }

  element(){
    if( !this.elem ){
      this.elem = $(this.proto.prototypeElement).clone()
    }
    return this.elem
  }

  // 更新状态
  update(states){
    this.states = states
    // 重新更新
    var $elem = this.element()
    if(this.states){
      $elem.attr('transform',`translate(${this.states.x},${this.states.y})`)
    }
  }
}

class Block {
  constructor(name, def) {
    this.name = name
    this.def = def
    this.prototypeElement = this.createElement()
    if( this.prototypeElement ){
      this.prototypeElement.attr('data-block', this.name)
    }

    this.instances = []  // 实例列表
  }

  createElement() {
    return null
  }

  // 克隆一个对象实例
  /*
  {
     x: // X坐标
     y: // Y坐标
  }
   */
  instance(states){
    var inst = new BlockInstance(this, states)
    this.instances.push(inst)
    return inst
  }
}

class BlockMarker extends Block {
  constructor(name, def) {
    super(name, def)
  }

  createElement() {
    var $g =  ShapeUtils.group(this.def)

    if( this.name == 'insertmarker'){
      $g.addClass('ycBlockInsertionMarker')
    }

    let cate = acquireCategoryContext(this.def.category)
    let opt = {
      stroke:  '#000000',  // 线条颜色
      fill: '#000000',  // 填充色
      opacity: '0.2'
    }
    $.extend(opt, cate.background)
    $g.append(ShapeUtils.markerPath(opt))
    return $g
  }

}

class BlockVariant extends Block{
  constructor(name, def) {
    super(name, def)
  }

  createElement() {
    var $g =  ShapeUtils.group(this.def)

    var radius = 20  // 半圆半径
    var minLen = 16  // 最小长度

    // 根据文字计算长度
    var txt = this.def.text
    var length = computeTextLength(txt)
    var roundlength = length < minLen ? minLen : length

    let cate = acquireCategoryContext(this.def.category)
    let opt = {
      stroke:  '#2E8EB8',  // 线条颜色
      fill: '#5CB1D6',  // 填充色
      opacity: '1'   // 透明度
    }
    $.extend(opt, cate.background)

    if( this.def.shape == 'round' ){
      opt.radius = radius
      opt.length = roundlength
      $g.append(ShapeUtils.roundRect(opt))
    }

    $g.append(ShapeUtils.text({
      text: this.def.text,
      offset:{
        x: radius + roundlength / 2,
        y:0
      },
      translate:{
        x: 0,
        y: radius
      }
    }))

    return $g
  }

}




class BlockStack extends BlockVariant{
  constructor(name, def) {
    super(name, def)
    this.prev = null // 上一个Block
    this.next = null  // 下一个Block
  }

  createElement() {
    var $g =  ShapeUtils.group(this.def)

    var space = this.def.space ? this.def.space : 8  // section间距
    var minLen = 64

    // 根据sections起始位置
    var secoffsets = []
    secoffsets.push(space )
    var length = (this.def.sections.length + 1 ) * space
    this.def.sections.forEach(function (sec, i) {
      let l = 0
      if( sec.type == 'text'){
        l = computeTextLength(sec.text)
      }
      else if( sec.type == 'argument') {
        l = sec.length ? sec.length : 0
      }
      secoffsets.push(secoffsets[i] + l + space)
      length += l
    })

    var roundlength = length < minLen ? minLen : length

    let cate = acquireCategoryContext(this.def.category)
    let opt = {
      stroke: '#2E8EB8',  // 线条颜色
      fill: '#5CB1D6',  // 填充色
      opacity: '1',   // 透明度
      length: roundlength
    }
    $.extend(opt, cate.background)

    $g.append(ShapeUtils.slot(opt))

    this.def.sections.forEach(function (sec, i) {
      if(sec.type == 'text'){
        $g.append(ShapeUtils.text({
          text: sec.text,
          anchor: 'start',
          offset:{
            x: secoffsets[i],
            y: 0
          },
          translate:{
            x: 0,
            y: 24
          }
        }))
      }
      else if( sec.type == 'argument'){

      }
    })

    return $g

  }
}


class BlockControl extends BlockStack{
  constructor(name, def) {
    super(name, def)
    this.success = []
  }

  createElement() {

  }

}


class BlockControlTwo extends BlockStack{
  constructor(name, def) {
    super(name, def)
    this.fail = null
  }

  createElement() {

  }
}

// 创建原型对象
function createPrototype(opt) {
  if( !opt.def.type ){
    return null
  }

  var proto = null
  if( opt.def.type == 'variant'){
    proto = new BlockVariant(opt.name, opt.def)
  }
  else if( opt.def.type == 'marker'){
    proto = new BlockMarker(opt.name, opt.def)
  }
  else if( opt.def.type == 'stack'){
    proto = new BlockStack(opt.name, opt.def)
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
    this.dom.$canvas = this.dom.$ws.find(".ycBlockCanvas")

    this.dom.$bubblecanvas = dom.find(".ycBlockBubbleCanvas")
    this.dom.$dragsurface = dom.find(".ycBlockDragSurface")
    this.dom.$dragcanvas = dom.find(".ycBlockDragCanvas")
    this.dom.$canvasList = [this.dom.$canvas, this.dom.$bubblecanvas, this.dom.$dragcanvas]

    this.dom.$flyout = dom.find('.ycBlockFlyout')
    this.dom.$flyoutws = this.dom.$flyout.find('.ycBlockWorkspace')
    this.dom.$flyoutcanvas = this.dom.$flyoutws.find('.ycBlockCanvas')
    this.dom.$menu = dom.find('.ycBlockCategoryMenu')
    
    this.marker = null

    this.registries = {}  // block注册列表
    this.instances = []  // block实例数组

    this.grapPoint = {x: 0, y: 0}
    this.lastPoint = {x: 0, y: 0}
    this.mousePoint = {x: 0, y: 0}
    this.$selected = null
    this.currentZoomFactor = 1.0
    this.startDrag = false

    this.option = {
      width: 800
      , height: 600
      , virtualWidth: 1600
      , virtualHeight: 1200
      // classed: ''  // 缺省ycBlockSvg 额外class
      // defs: ['']
      , blocks: blocks
    }

    var that = this
    var dom = this.dom

    // 鼠标事件
    this.dom.$svg.on('mousedown',function () {
      that.lastPoint.x = event.pageX
      that.lastPoint.y = event.pageY
      that.startDrag = true
      return false
    }).on('mousemove',function () {
      let X = dom.$svg.offset().left;
      let Y = dom.$svg.offset().top;
      that.updateInfo({
        x: event.pageX - X,
        y: event.pageY - Y
      })

      let deltaX = event.pageX - that.lastPoint.x
      let deltaY = event.pageY - that.lastPoint.y

      if (!that.$selected && that.startDrag) {
        that.lastPoint.x = event.pageX
        that.lastPoint.y = event.pageY
        let m = dom.$canvas[0].getCTM();
        let trans = "translate(" + (Number(m.e) + deltaX) + "," + (Number(m.f) + deltaY) + ") " + "scale(" + that.currentZoomFactor + ")"
        that.setCanvasTransfrom(trans)
      }
      else if (that.$selected && that.$selected.hasClass("ycBlockSelected")) {
        // 改变父节点
        if (!that.$selected.hasClass("ycBlockDragging")) {
          // 插入占位
          var $marker = that.marker.element()
          $marker.insertAfter(that.$selected)
          dom.$dragsurface.css("display", "block")
          dom.$dragcanvas.append(that.$selected)
          that.$selected.addClass("ycBlockDragging")
        }
        // 根据鼠标位置调整surface
        dom.$dragsurface.attr("style", "display: block; transform: translate3d(" + deltaX + "px," + deltaY + "px,0px)")
      }
    }).on('mouseup',function () {
      that.startDrag = false
      if (that.$selected && that.$selected.hasClass("ycBlockSelected")) {
        if (that.$selected.hasClass("ycBlockDragging")) {
          // 插入占位
          var $marker = that.marker.element()
          that.$selected.insertBefore($marker)
          that.$selected.removeClass("ycBlockDragging")
          $marker.remove()
          // 更新变换
          let dm = dom.$dragsurface.css("transform").replace(/[^0-9\-,]/g, '').split(',')
          let m = that.$selected[0].getCTM()
          that.$selected.attr("transform", "translate(" + (Number(dm[4]) + that.grapPoint.x) / Number(m.a) + "," + (Number(dm[5]) + that.grapPoint.y) / Number(m.d) + ")")
          dom.$dragsurface.css('display', 'none;')
        }
        that.$selected.removeClass("ycBlockSelected")
        that.$selected = null
      }
    })

    // 鼠标事件
    this.dom.$flyout.on('mousedown',function () {

    })

  }

  updateInfo(info){
    this.mousePoint.x = info.x
    this.mousePoint.y = info.y
    this.dom.$info.html('X: ' + info.x + '  Y: ' + info.y)
  }

  // 统一设置canvas变换矩阵（平移，缩放）
  setCanvasTransfrom(trans) {
    this.dom.$canvasList.forEach(function (item) {
      item.attr("transform", trans)
    })
  }

  setOption(opt) {
    var that = this
    // 合并
    $.extend(true, this.option, opt)

    //注册Block, 创建Block对象
    var defs = this.option.blocks.blocks

    $.each(that.option.blocks.categories, function(key, val) {
      val.blocks = []
    })

    $.each(defs, function(key, val){
      that.registries[key] = createPrototype({
        name: key,
        def: val
      })

      if( !that.registries[key]){
        console.log('block registered failed: ' + key)
      }
      else{
        that.option.blocks.categories[val.category].blocks.push(key)
        console.log('block registered successed: ' + key)
      }
    })

    this.prepare()
  }

  prepare(){
    this.marker = this.createBlockInstance('insertmarker')
    // 初始化toolbox
    this.initCategoryToolbox()
  }
  
  initCategoryToolbox(){
    var categories = this.option.blocks.categories
    var dom = this.dom
    var registries = this.registries

    function createMenu(key) {
      var cate = categories[key]
      if(!cate){
        console.log('category can not found: ' + key)
        return
      }
      var $menurow = $('<div class="ycBlockCategoryMenuRow"></div>')
      var $menuitem = $(`<div class="ycBlockCategoryMenuItem" data-id="${key}"></div>`)
      $menuitem.append($(`<div class="ycBlockCategoryItemBubble" style="background-color: ${ cate.background.fill }; border-color: ${ cate.background.stroke };"></div>`))
      $menuitem.append($(`<div class="ycBlockCategoryMenuItemLabel">${ cate.name }</div>`))
      $menurow.append($menuitem)

      $menuitem.on('click',function () {
        console.log('click ----- ' + $(this).data('id'))
      })

      return $menurow
    }

    let offsety = 12
    let toolboxspace = 64
    $.each(categories, function (key, val) {
      if( !val.display || val.display != 'none'){
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
          translate: {
            x: 12,
            y: offsety
          }
        })
        categories[key].$flyoutlable = $label
        dom.$flyoutcanvas.append($label)
        offsety += toolboxspace

        // 创建列表
        if( val.blocks ){
          $.each(val.blocks, function (index, block) {
            let proto = registries[block]
            if( proto && proto.prototypeElement ){
              let $elem = $(proto.prototypeElement).clone()
              $elem.attr('transform', `translate(12, ${offsety})`)
              dom.$flyoutcanvas.append($elem)
              offsety += toolboxspace
            }
            else{
              console.log('block registry is corrupted:' + block)
            }
          })
        }
      }
    })
  }

  createBlockInstance(type, states){
    // 坚持类型是否注册
    if(!this.hasRegistered(type)){
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



  addBlock(states, parent){
    if(!states || !states.type){
      return
    }

    let inst = this.createBlockInstance(states.type, states)
    if(!inst){
      return
    }

    let $elem = inst.element()

    var that = this
    var dom = this.dom

    $elem.on('mousedown', function () {
      that.$selected = $(this)
      let m = this.getCTM()
      let pm = dom.$canvas[0].getCTM()

      let X = dom.$svg.offset().left;
      let Y = dom.$svg.offset().top;

      that.lastPoint.x = event.pageX
      that.lastPoint.y = event.pageY
      that.grapPoint.x = (Number(m.e) - Number(pm.e))
      that.grapPoint.y = (Number(m.f) - Number(pm.f))
      that.$selected.addClass("ycBlockSelected")
      return false
    }).on('mouseup',function () {

    })

    if(parent){
      parent.append(inst.element())
    }
    else{
      this.dom.$canvas.append(inst.element())
    }
  }
  
  addBlocks(blocks) {
    
    if( yuchg.isArray(blocks) ){
      var that = this
      // 创建多个Block
      $.each(blocks, function (i, elem) {
        that.addBlock(elem)
      })
    }
    else if( yuchg.isObject(blocks)) {
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

  hasRegistered(type){
    if( this.registries.hasOwnProperty(type) && this.registries[type] ){
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
