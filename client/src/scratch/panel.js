import $ from 'jquery'
import * as d3 from "d3"
import yuchg from '../base'
import logger from '../logger'
import BlockDefs from './blockDefs/index'
import ShapeUtils from './shapes'
import Utils from './utils'
import Blocks from './blocks'

logger.setLevel('debug')

/**
 * 查找类目上下文
 * category: string 类目名称
 */
function acquireCategoryContext(category) {
  if (BlockDefs.categories) {
    return BlockDefs.categories[category]
  }
  return null
}

/**
 * 编辑面板，提供可视化编辑UI
 */
class Panel {
  constructor(node) {
    this.dom = {}
    this.dom.root = node

    let $node = $(node)
    let $svg = $node.children('.ycBlockSvg')
    this.dom.svg = $svg[0]

    this.dom.info = $svg.find('#ycBlockInfo')[0]
    this.dom.canvas = $svg.find('.ycBlockCanvas')[0]
    this.dom.bubblecanvas = $node.find('.ycBlockBubbleCanvas')[0]
    this.dom.dragsurface = $node.find('.ycBlockDragSurface')[0]
    this.dom.dragcanvas = $node.find('.ycBlockDragCanvas')[0]
    this.dom.canvasList = [this.dom.canvas, this.dom.bubblecanvas, this.dom.dragcanvas]

    let $flyout = $node.find('.ycBlockFlyout')
    this.dom.flyout = $flyout[0]
    this.dom.flyoutcanvas = $flyout.find('.ycBlockCanvas')[0]
    this.dom.flyoutbubblecanvas = $flyout.find('.ycBlockBubbleCanvas')[0]
    this.dom.flyoutcanvasList = [this.dom.flyoutcanvas, this.dom.flyoutbubblecanvas]

    this.dom.menu = $node.find('.ycBlockCategoryMenu')[0]
    this.dom.widget = $node.find('.ycBlockWidgetDiv')[0]

    this.marker = null // 辅助插入标志占位

    this.registries = {} // block注册列表
    this.instances = {} // block实例数组

    this.grapPoint = {
      x: 0,
      y: 0
    }
    this.lastPoint = {
      x: 0,
      y: 0
    }

    this.selected = null
    this.currentZoomFactor = 1.0
    this.zoomRate = 0.25
    this.startDrag = false

    this.flyoutgrapPoint = {
      x: 0,
      y: 0
    }
    this.flyoutlastPoint = {
      x: 0,
      y: 0
    }
    this.flyoutselected = null
    this.flyoutstartDrag = false
    this.flyoutZoomFactor = 0.675
    this.flyoutHeight = 0

    this.option = {
      width: 800,
      height: 600,
      virtualWidth: 1600,
      virtualHeight: 1200,
      blocks: BlockDefs
    }

    let that = this
    // 鼠标事件
    $(this.dom.svg).on('mousedown', () => {
      this.lastPoint.x = event.pageX
      this.lastPoint.y = event.pageY
      this.startDrag = true
      $(this.dom.flyout).css('pointer-events', 'none')
    }).on('mousemove', function () {
      // 获取SVG的位置
      let X = $(this).offset().left
      let Y = $(this).offset().top
      // 获取canvas的偏移（由鼠标拖动引起的）
      let cm = that.dom.canvas.getCTM()
      // 显示坐标为画布坐标（不是屏幕坐标）
      that.updateInfo({
        x: event.pageX - X - Number(cm.e),
        y: event.pageY - Y - Number(cm.f)
      })

      // 鼠标移动偏移量
      let deltaX = event.pageX - that.lastPoint.x
      let deltaY = event.pageY - that.lastPoint.y

      // 如果没有点击Block
      if (!that.selected && that.startDrag) {
        that.lastPoint.x = event.pageX
        that.lastPoint.y = event.pageY
        let m = that.dom.canvas.getCTM()
        let trans = 'translate(' + (Number(m.e) + deltaX) + ',' + (Number(m.f) + deltaY) + ') ' + 'scale(' + that.currentZoomFactor + ')'
        that.setCanvasTransfrom(that.dom.canvasList, trans)
      } else if (that.selected) {
        let $selected = $(that.selected)
        // 如果Block被选中（点击）并且没有拖动
        if ( $selected.hasClass('ycBlockSelected') && !$selected.hasClass('ycBlockDragging')) {
          // 插入占位
          var $marker = $(that.marker.element())
          $marker.insertAfter($selected)
          $(that.dom.dragsurface).css('display', 'block')
          $(that.dom.dragcanvas).append($selected)
          $selected.addClass('ycBlockDragging')
        }
        // 根据鼠标位置调整surface
        $(that.dom.dragsurface).attr('style', 'display: block; transform: translate3d(' + deltaX + 'px,' + deltaY + 'px,0px)')
      }
    }).on('mouseup mouseleave', () => {
      that.startDrag = false
      $(this.dom.flyout).css('pointer-events', 'auto')

      if (that.selected) {
        let $selected = $(that.selected)
        if ($selected.hasClass('ycBlockSelected') && $selected.hasClass('ycBlockDragging')) {
          // 插入占位
          var $marker = $(that.marker.element())
          // 判断是否在Flyout区域
          if (this.isInFlyoutRegion(event.pageX, event.pageY)) {
            // 删除Block实例
            let uid = $selected.attr('data-uid')
            this.removeBlock(uid)
            that.selected = null
            return
          } else {
            $selected.insertBefore($marker)
            $selected.removeClass('ycBlockDragging')
            // 更新变换
            let dm = $(that.dom.dragsurface).css('transform').replace(/[^0-9\-,]/g, '').split(',')
            let m = that.selected.getCTM()
            $selected.attr('transform', 'translate(' + (Number(dm[4]) + that.grapPoint.x) / Number(m.a) + ',' + (Number(dm[5]) + that.grapPoint.y) / Number(m.d) + ')')
          }
          $marker.remove()
          $(that.dom.dragsurface).css('display', 'none;')
        }
        $selected.removeClass('ycBlockSelected')
        that.selected = null
      }
    })

    $(this.dom.flyout).on('mousedown', () => {
      this.flyoutlastPoint.x = event.pageX
      this.flyoutlastPoint.y = event.pageY
      this.flyoutstartDrag = true
    }).on('mousemove', function () {
      let $this = $(this)
      let deltaY = event.pageY - that.flyoutlastPoint.y
      if (!that.flyoutselected && that.flyoutstartDrag) { // 上下滚动拖放
        that.flyoutlastPoint.x = event.pageX
        that.flyoutlastPoint.y = event.pageY
        let m = that.dom.flyoutcanvas.getCTM()

        let y = Number(m.f) + deltaY
        if (y > 0) {
          y = 0
        }
        let height = Number($this.attr('height'))
        let maxY = (height - that.flyoutHeight) * that.flyoutZoomFactor

        if (y < maxY) {
          y = maxY
        }

        let trans = 'translate(0,' + y + ') ' + 'scale(' + that.flyoutZoomFactor + ')'
        that.setCanvasTransfrom(that.dom.flyoutcanvasList, trans)

      } else if (that.flyoutselected) { // 拖动Block
        // 获取选中的类型
        let bid = $(that.flyoutselected).attr('data-id')
        let proto = that.registries[bid]

        // 根据当前鼠标位置计算在SVG中位置
        let svgOffset = $(that.dom.svg).offset()
        let X = svgOffset.left
        let Y = svgOffset.top
        let cm = that.dom.canvas.getCTM()

        // 根据Block尺寸调整位置
        let bbox = that.flyoutselected.getBBox()
        that.grapPoint.x = event.pageX - bbox.width / 2 - X + bbox.x - Number(cm.e)
        that.grapPoint.y = event.pageY - bbox.height / 2 - Y + bbox.y - Number(cm.f)

        let newInst = that.addBlock({
          type: proto.def.id,
          state: {
            transform: {
              x: that.grapPoint.x,
              y: that.grapPoint.y
            }
          }
        }, that.dom.dragcanvas)

        that.selected = newInst.element()
        $(that.selected).addClass('ycBlockSelected ycBlockDragging')

        // 插入占位(在末尾添加)
        var $marker = $(that.marker.element())
        $(that.dom.canvas).append($marker)

        that.flyoutselected = null
        that.lastPoint.x = event.pageX
        that.lastPoint.y = event.pageY
        let deltaX = event.pageX - that.lastPoint.x
        let deltaY = event.pageY - that.lastPoint.y
        // 根据鼠标位置调整surface
        let $dragsurface = $(that.dom.dragsurface)
        $dragsurface.attr('style', 'display: block; transform: translate3d(' + deltaX + 'px,' + deltaY + 'px,0px)')
        $dragsurface.css('display', 'block')

        that.startDrag = true
        $this.css('pointer-events', 'none')
      }
    }).on('mouseup mouseleave', () => {
      this.flyoutstartDrag = false
      this.flyoutselected = null
    })
  }

  /**
   * 判断坐标点是否在Flyout区域
   */
  isInFlyoutRegion(x, y) {
    let $bg = $(this.dom.flyout).find('.ycBlockFlyoutBackground')
    let bbox = $bg[0].getBBox()
    let ctm = $bg[0].getScreenCTM()

    let left = ctm.e + bbox.x
    let right = left + bbox.width
    let top = ctm.f + bbox.y
    let bottom = top + bbox.height
    return x >= left && x <= right && y >= top && y <= bottom
  }

  /**
   * 显示坐标信息
   */
  updateInfo(info) {
    $(this.dom.info).html(`X: ${info.x} Y: ${info.y}`)
  }

  /**
   * 统一设置canvas变换矩阵（平移，缩放）
   */
  setCanvasTransfrom(canvas, trans) {
    canvas.forEach(function (item) {
      $(item).attr('transform', trans)
    })
  }

  /**
   * 处理包定义
   * package: Object block包定义
   */
  processPackage(pkg) {
    if (!this.option.blocks.defs) {
      this.option.blocks.defs = {
        variant: {
          name: '变量',
          members: []
        },
        marker: {
          name: '标记',
          members: []
        },
        action: {
          name: '动作',
          members: []
        },
        event: {
          name: '事件',
          members: []
        },
        express: {
          name: '表达式',
          members: []
        },
        control: {
          name: '控制',
          members: []
        }
      }
    }

    let defs = this.option.blocks.defs
    if (yuchg.isArray(pkg)) {
      for (const item of pkg) {
        let type = item.type
        if (defs[type]) {
          defs[type].members = defs[type].members.concat(item)
        }
      }
    } else if (yuchg.isObject(pkg)) {
      for (let [type, val] of Object.entries(pkg)) {
        if (yuchg.isArray(val)) {
          if (defs[type]) {
            defs[type].members = defs[type].members.concat(val)
          }
        }
      }
    }
  }

  setOption(option) {
    // 清空之前的定义
    this.option.blocks.defs = null
    // 合并
    $.extend(true, this.option, option)

    // 提取Block包定义
    for (let p of this.option.blocks.packages.values()) {
      this.processPackage(p)
    }
    logger.debug(this.option.blocks.defs)
    let defs = this.option.blocks.defs
    let args = this.option.blocks.args
    //
    let cates = this.option.blocks.categories
    for (let val of Object.values(cates)) {
      val.blocks = []
    }

    // 注册Block
    for (let [type, val] of Object.entries(defs)) {
      for (let def of val.members.values()) {
        def.type = type
        this.registerBlock(def, cates)
      }
    }

    this.prepare()
  }

  prepare() {
    this.marker = this.createBlockInstance('insertmarker')
    // 初始化toolbox
    this.initCategoryToolbox()
    this.initZoomPanel()
  }

  initZoomPanel() {
    let that = this
    // 设置缩放按钮
    $('.ycBlockZoom image').each(function (index, elem) {
      $(this).mousedown(function () {
        if (index === 0) {
          that.currentZoomFactor -= that.zoomRate
        } else if (index === 1) {
          that.currentZoomFactor += that.zoomRate
        } else if (index === 2) {
          that.currentZoomFactor = 1.0
          that.setCanvasTransfrom(that.dom.canvasList, 'translate(0,0) scale(1.0)')
          return
        }

        let m = that.dom.canvas.getCTM()
        let trans = 'translate(' + (Number(m.e)) + ',' + (Number(m.f)) + ') ' + 'scale(' + that.currentZoomFactor + ')'
        that.setCanvasTransfrom(that.dom.canvasList, trans)
      })
    })
  }

  initCategoryToolbox() {
    const categories = this.option.blocks.categories
    const registries = this.registries
    let zoom = this.flyoutZoomFactor
    let that = this

    function createMenu(key, offset) {
      let cate = categories[key]
     
      if (!cate) {
        logger.debug('category can not found: ' + key)
        return
      }
      let state = cate.state
      var $menurow = $('<div class="ycBlockCategoryMenuRow"></div>')
      var $menuitem = $(`<div class="ycBlockCategoryMenuItem" data-id="${ key }"></div>`)
      $menuitem.append($(`<div class="ycBlockCategoryItemBubble" style="background-color: ${ state.background.fill }; border-color: ${ state.background.stroke };"></div>`))
      $menuitem.append($(`<div class="ycBlockCategoryMenuItemLabel">${ cate.name }</div>`))
      $menurow.append($menuitem)

      let trans = 'translate(0,' + (-offset * zoom) + ') scale(' + zoom + ')'
      $menuitem.on('click', function () {
        d3.selectAll('.ycBlockFlyout>.ycBlockWorkspace>g')
          .transition()
          .duration(500)
          .attr('transform', trans)
      })

      return $menurow
    }

    let padding = 12
    let offsety = padding
    let toolboxspace = 64
    let $menu = $(this.dom.menu)
    let $flyoutcanvas = $(this.dom.flyoutcanvas)
    $.each(categories, function (key, val) {
      if (!val.display || val.display !== 'none') {
        // 创建菜单
        let $menuitem = createMenu(key, offsety - padding)
        categories[key].menuitem = $menuitem[0]
        $menu.append($menuitem)

        // 创建Label
        let labellen = Utils.computeTextLength(val.name) + 16

        let $label = ShapeUtils.group.flyoutLabel({
          text: val.name,
          width: labellen,
          height: 40,
          translatex: 20,
          translatey: offsety
        })
        categories[key].flyoutlable = $label[0]
        $flyoutcanvas.append($label)
        offsety += toolboxspace

        // 创建列表
        if (val.blocks) {
          $.each(val.blocks, function (index, block) {
            let proto = registries[block]
            if (proto && proto.prototypeElement) {
              // 仅克隆DOM（并非创建实例）
              let $elem = $(proto.prototypeElement).clone(true)
              $elem.addClass('ycBlockFlyout')
              $flyoutcanvas.append($elem)

               // 获取包围盒大小
              let bbox = $elem[0].getBBox()
              offsety += (-bbox.y)
              $elem.attr('transform', `translate(36, ${offsety})`)

              offsety += (bbox.height + 16)

              // 添加事件
              $elem.on('mousedown', function () {
                that.flyoutselected = this
              }).on('mouseup', function () {
                if (!that.startDrag) {
                  that.flyoutselected = null
                }
              })
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
    this.instances[inst.uid] = inst
    return inst
  }

  removeBlock(uid) {
    if (!yuchg.isString(uid)) {
      logger.warn('removeBlock failed: wrond uid - ', uid)
      return
    }
    let inst = this.instances[uid]
    if (!inst) {
      logger.warn('removeBlock failed: can not found uid - ', uid)
      return
    }

    //let m = this.dom.$dragcanvas[0].getCTM()
    //d3.select('.ycBlockDragSurface>g')
    //.transition()
    //.duration(500)
    //.attr('transform', 'scale(0.001)')

    inst.clear()
    delete this.instances[uid]
  }

  showInputWidget(option) {
    logger.debug('input')
    if (!option) {
      this.hideInputWidget()
      return
    }

    let $parent = $(this.dom.widget)
    $parent.children().remove()

    let that = this
    let $input = null
    if (option.type === 'string') {
      $parent.addClass('fieldTextInput')
      $parent.attr('style', 'direction: ltr; margin-left: 0px; border-radius: 16.5px; border-color: rgb(204, 153, 0); transition: box-shadow 0.25s ease 0s; box-shadow: rgba(255, 255, 255, 0.3) 0px 0px 0px 4px;')
      $parent.css('direction', 'ltr')

      $parent.css('top', option.y)
      $parent.css('left', option.x)
      $parent.css('width', option.width)
      $parent.css('height', option.height)

      $input = $('<input class="ycBlockHtmlInput" spellcheck="true" value="">')
      $input.val(10)

      let callback = option.callback
      $input.on('blur', function () {
        let newValue = $(this).val()
        callback && callback(newValue)
        that.hideInputWidget()
      })
      $parent.append($input)
      $input.focus()
    }

    $parent.css('display', 'block')
    $input.focus()
  }

  hideInputWidget() {
    let $parent = $(this.dom.widget)
    $parent.attr('class', 'ycBlockWidgetDiv')
    $parent.attr('style', '')
    $parent.children().remove()
  }

  addBlock(option, parent) {
    if (!option || !option.type) {
      return
    }

    let inst = this.createBlockInstance(option.type, option.state)
    if (!inst) {
      return
    }

    let that = this
    let dom = that.dom
    let $elem = $(inst.element())
    $elem.attr('data-uid', inst.uid)
    $elem.on('mousedown', function () {
      that.selected = this
      let m = this.getCTM()
      let pm = dom.canvas.getCTM()
      that.grapPoint.x = (Number(m.e) - Number(pm.e))
      that.grapPoint.y = (Number(m.f) - Number(pm.f))
      $(that.selected).addClass('ycBlockSelected')
    })

    if (parent) {
      $(parent).append($elem)
    } else {
      $(this.dom.canvas).append($elem)
    }

    return inst
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

  /**
 * 注册Block
 */
  registerBlock(def, list) {
    let registries = this.registries
    // 提示重复
    if (registries[def.id]) {
      logger.debug(`${def.type} registered repeated:  ${def.id}`)
    }

    // 获取默认类目信息
    let cate = acquireCategoryContext(def.category)
    if (cate && cate.state) {
      if (!def.state) {
        def.state = {}
      }
      def.state = $.extend(true, def.state, cate.state)
    }

    registries[def.id] = Blocks.createPrototype(Object.assign({
      type: def.type,
      __panel: this,
      state: {}
    }, def))
    if (!registries[def.id]) {
      logger.debug(`${def.type} registered failed:  ${def.id}`)
    } else {
      list && list[def.category].blocks.push(def.id)
      logger.debug(`${def.type} registered successed:  ${def.id}`)
    }
  }

  unregisterBlock(types) {

  }

  /**
 * 检查Block是否注册
 */
  hasRegistered(type) {
    if (this.registries.hasOwnProperty(type) && this.registries[type]) {
      return true
    }
    return false
  }
}

export default Panel