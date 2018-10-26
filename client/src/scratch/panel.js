import $ from 'jquery'
import * as d3 from "d3"
import yuchg from '../base'
import logger from '../logger'
import BlockDefs from './blockDefs/index'
import ShapeUtils from './shapes'
import Utils from './utils'
import Blocks from './blocks'
import Argument from './argus'

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

const ycMinZoom = 0.5
const ycMaxZoom = 2
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
    this.dom.dropdown = $node.find('.ycBlockDropDownDiv')[0]
    this.dom.tooltip = $node.find('.ycBlockTooltipDiv')[0]
    this.dom.buttons = $node.find('.ycBlockButtons')[0]

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
    this.zoomRate = 1.2
    this.currentZoomFactor = 1.0 / this.zoomRate
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
    this.flyoutZoomFactor = 0.5
    this.flyoutHeight = 0

    this.option = {
      width: 800,
      height: 600,
      blocks: BlockDefs,
      buttons: [
        {
          id: 'zoomout',
          img: '/img/zoom-out.svg',
          action: () => {
            this.zoomCanvas(this.currentZoomFactor / this.zoomRate)
          }
        },
        {
          id: 'zoomin',
          img: '/img/zoom-in.svg',
          action: () => {
            this.zoomCanvas(this.currentZoomFactor * this.zoomRate)
          }
        },
        {
          id: 'reset',
          img: '/img/zoom-reset.svg',
          action: () => {
            this.resetCanvas()
          }
        }
      ]
    }

    this.setCanvasTransfrom(this.dom.canvasList, 'scale(' + this.currentZoomFactor + ')')
    this.setCanvasTransfrom(this.dom.flyoutcanvasList, 'scale(' + this.flyoutZoomFactor + ')')
   
    // 鼠标事件
    $(this.dom.root).on('mousedown', () => {
      this.hideDropdownWidget()
      this.hideWidget()
    })

    $(this.dom.dropdown).on('mousedown', () => {
      event.stopPropagation()
    }).on('mouseup', () => {
      event.stopPropagation()
    })

    $(this.dom.widget).on('mousedown', () => {
      event.stopPropagation()
    }).on('mouseup', () => {
      event.stopPropagation()
    })

    //
    this.bindCanvasEvent()
  }

  /**
   * 缩放画布
   */
  zoomCanvas(zoom) {
    if (!zoom) {
      logger.warn('Panel zoomCanvas failed: zoom is null')
      return
    }

    if (zoom < ycMinZoom || zoom > ycMaxZoom) {
      return
    }

    this.currentZoomFactor = zoom
    let m = this.dom.canvas.getCTM()
    let trans = 'translate(' + (Number(m.e)) + ',' + (Number(m.f)) + ') ' + 'scale(' + this.currentZoomFactor + ')'
    this.setCanvasTransfrom(this.dom.canvasList, trans)
  }

  /**
   * 重置画布
   */
  resetCanvas() {
    this.currentZoomFactor = 1.0
    this.setCanvasTransfrom(this.dom.canvasList, 'translate(0,0) scale(1.0)')
  }
  
  /**
   * 绑定事件
   */
  bindCanvasEvent() {
    let that = this
    $(this.dom.svg).on('mousedown', () => {
      if (event.button === 0) {
        this.lastPoint.x = event.pageX
        this.lastPoint.y = event.pageY
        this.startDrag = true
        $(this.dom.flyout).css('pointer-events', 'none')
      }
    }).on('mousemove', function () {
      // 获取SVG的位置
      let X = $(this).offset().left
      let Y = $(this).offset().top
      // 获取canvas的偏移（由鼠标拖动引起的）
      let cm = that.dom.canvas.getCTM()
      // 显示坐标为画布坐标（不是屏幕坐标）
      that.updateInfo({
        x: Math.round((event.pageX - X - Number(cm.e)) / Number(cm.a)),
        y: Math.round((event.pageY - Y - Number(cm.f)) / Number(cm.d))
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
        let selectUid = $(that.selected).attr('data-uid')
        let selectInst = that.instances[selectUid]

        // 如果Block被选中（点击）并且没有拖动
        if ($selected.hasClass('ycBlockSelected') && !$selected.hasClass('ycBlockDragging')) {
          // 插入占位
          that.marker.ghost(selectInst)
          let $marker = $(that.marker.element())
          $marker.attr('visibility', 'hidden')

          // 如果是Stack类型
          if (selectInst.__proto.isStackBlock()) {
            // 复制childType
            that.marker.childType(selectInst.childType())
            $marker.insertAfter($selected)
          } else if (selectInst.__proto.isEmbedBlock()) {
            that.marker.childType('')
            $(that.dom.canvas).append($marker)
          } else {
            logger.warn('mouse move: unknown block type')
          }
  
          // 如果有父节点, 给selected添加变换
          let prevBlock = selectInst.prevBlock()
          if (prevBlock) {
            let canvasOffset = that.viewPortOffset()
            let _m = $selected[0].getCTM()
            let _x = (Number(_m.e) - canvasOffset.x) / Number(_m.a)
            let _y = (Number(_m.f) - canvasOffset.y) / Number(_m.d) 
            $selected.attr('transform', `translate(${_x},${_y})`)

            // 如果是嵌入类型，需要将当前位置更新给marker
            if (selectInst.__proto.isEmbedBlock()) {
              $marker.attr('transform', `translate(${_x},${_y})`)
              // 需要恢复父对象
              const sections = prevBlock.state.data.sections
              for (let sec of sections) {
                if (sec.__assign === selectInst) {
                  sec.__assign = null
                  break
                }
              }
            }
          }

          $(that.dom.dragsurface).css('display', 'block')
          $(that.dom.dragcanvas).append($selected)
          selectInst.childType('')
          $selected.addClass('ycBlockDragging')

          // 如果选中的Block有父节点，需要向上通知所有父节点更新
          if (prevBlock) {
            prevBlock.update(null, {
              force: true,
              prev: true
            })
          }
        }
        // 根据鼠标位置调整surface
        $(that.dom.dragsurface).attr('style', 'display: block; transform: translate3d(' + deltaX + 'px,' + deltaY + 'px,0px)')

        // 判断selected与其他Block的相交距离，选取距离最小的Block
        // 如果位于Block上方，则插入Marker，将Block设为Marker子节点
        // 如果位于Block下方，则将Block中插入一个Marker

        // 计算当前Selected的包围盒
        let sbbox = that.selected.getBBox()
        let sm = that.selected.getCTM()
        let canvasx = (deltaX + that.grapPoint.x) / Number(sm.a)
        let canvasy = (deltaY + that.grapPoint.y) / Number(sm.d)

        // 计算头部投放区域(取包围盒前半部分)
        const dropBoundbox = function (x, y, bbox) {
          return {
            left: x + bbox.x,
            top: y + bbox.y,
            right: x + bbox.x + bbox.width / 2,
            bottom: y + bbox.y + bbox.height
          }
        }
        let selectBox = dropBoundbox(canvasx, canvasy, sbbox)

        // 遍历实例列表
        let validHostList = []
        for (let inst of Object.values(that.instances)) {
          if (inst.__proto.id === 'insertmarker') {
            continue
          }
          // 排除内部Block
          if (inst.__proto.isInternal()) {
            continue
          }

          // 排除选中序列中其他Block
          if (selectInst.hasInclude(inst)) {
            continue
          }

          // 类型兼容
          if (selectInst.__proto.isStackBlock() && !inst.__proto.canStack()) {
            continue
          }

          // 类型兼容
          if (selectInst.__proto.isEmbedBlock() && !inst.__proto.canEmbed()) {
            continue
          }

          // 获取可投放区域
          let regions = inst.getRegions()

          // 检查符合的唯一投放区域
          let validRegion = {}
          if (selectInst.__proto.isEmbedBlock() && regions.arguments) { // 仅判断参数位置
            validRegion.index = -1
            for (let [index, argu] of Object.entries(regions.arguments)) {
              // 检查形状是否匹配
              if (selectInst.__proto.def.shape !== argu.shape) {
                continue
              }

              // 检查数据类型是否匹配
              if (selectInst.stateData().datatype !== argu.datatype) {
                continue
              }

              // 取x坐标最小的
              if (Utils.isIntersects(selectBox, argu.rect)) {
                if (validRegion.index < 0 || argu.rect.left < validRegion.rect.left) {
                  validRegion.index = index
                  validRegion.rect = argu.rect
                }
              }
            }

            if (validRegion.index >= 0) {
              validHostList.push({
                instance: inst,
                region: validRegion // 投放位置
              })
            }
          } else if (selectInst.__proto.isStackBlock() && regions.stacks) { // 仅判断stack位置
            validRegion.position = ''

            // 获取序列可投放区域
            let stackpos = selectInst.stackPosition(true)
            for (let [pos, cbox] of Object.entries(regions.stacks)) {

              if (stackpos.indexOf(pos) < 0) {
                continue
              }

              // 如果Stack有Prev节点，则top区域无效
              if (pos === 'top' && inst.prevBlock()) {
                continue
              }

              // 如果Stack有Next节点，检查Next节点是否能够连接到Select序列的尾部
              if (pos === 'bottom') {
                const next = inst.nextBlock()
                if (next && next.protoId() !== 'insertmarker') {
                  let canstack = selectInst.lastBlock().__proto.canStackPosition()
                  if (canstack.indexOf('bottom') < 0) {
                    continue
                  }
                }
              }

              // 取y坐标最小的
              if (Utils.isIntersects(selectBox, cbox)) {
                if (validRegion.position === '' || cbox.top < validRegion.rect.top) {
                  validRegion.position = pos
                  validRegion.rect = cbox
                }
              }
            }

            if (validRegion.position !== '') {
              validHostList.push({
                instance: inst,
                region: validRegion // 投放位置
              })
            }
          }
        }

        // 从候选列表中提取最很合适的节点，
        // 优先取  x | y 坐标 最小的
        let hostInst = null
        if (validHostList.length > 0) {
          if (selectInst.__proto.isEmbedBlock()) {
            for (let h of validHostList) { // 检查
              if (!hostInst) {
                hostInst = h
              } else {
                if (h.region.rect.left < hostInst.region.rect.left) {
                  hostInst = h
                }
              }
            }
          } else if (selectInst.__proto.isStackBlock()) {
            for (let h of validHostList.reverse()) { // 倒序检查
              if (!hostInst) {
                hostInst = h
              } else {
                if (h.region.rect.top < hostInst.region.rect.top) {
                  hostInst = h
                }
              }
            }
          }
        }

        if (hostInst) {
          if (selectInst.__proto.isEmbedBlock()) {
            hostInst.insert = Number(hostInst.region.index)
          } else if (selectInst.__proto.isStackBlock()) {
            hostInst.insert = hostInst.region.position
          }
        }

        // 调整marker状态
        let $marker = $(that.marker.element())
        let oldhostInst = that.marker.hostInstance

        logger.debug('marker oldhost======', oldhostInst ? oldhostInst.instance.__proto.def.id + '--' + oldhostInst.insert : null)
        logger.debug('marker newhost======', hostInst ? hostInst.instance.__proto.def.id + '--' + hostInst.insert : null)

        if (selectInst.__proto.isEmbedBlock()) { // 参数变换
          $marker.attr('visibility', 'hidden')

          if (!oldhostInst) { // 在canvas上
            if (!hostInst) { // 没有新host, 仅更新位置
              $marker.attr('transform', `translate(${canvasx},${canvasy})`)
            } else { // 有新host, 给参数加特效
              let sec = hostInst.instance.state.data.sections[hostInst.insert]
              let argu = Argument.argument(sec)
              argu.highlight()
            }
          } else { // 如果在oldhost上
            if (!hostInst) { // 如果没有新host 
              let oldsec = oldhostInst.instance.state.data.sections[oldhostInst.insert]
              let oldargu = Argument.argument(oldsec)
              oldargu.highlight(false)
              // 更新transform
              $marker.attr('transform', `translate(${canvasx},${canvasy})`)
            } else { // 从oldhost移动到newhost上  
              if (oldhostInst.instance !== hostInst.instance || oldhostInst.insert !== hostInst.insert) {
                let oldsec = oldhostInst.instance.state.data.sections[oldhostInst.insert]
                let oldargu = Argument.argument(oldsec)
                oldargu.highlight(false)

                let sec = hostInst.instance.state.data.sections[hostInst.insert]
                let argu = Argument.argument(sec)
                argu.highlight()
              }
            }
          }
        } else if (selectInst.__proto.isStackBlock()) { // Stack

          if (!oldhostInst) { // 在canvas上
            if (!hostInst) { // 没有新host, 仅更新位置
              $marker.attr('visibility', 'hidden')
              $marker.attr('transform', `translate(${canvasx},${canvasy})`)
            } else { // 有新host, 将Marker添加到host中
              
              if (hostInst.insert === 'bottom') {
                hostInst.instance.next(that.marker)
                // 更新
                hostInst.instance.update(null, {
                  force: true,
                  prev: true
                })
              } else if (hostInst.insert === 'top') {
                // 从上方插入
                let hostPrevBlock = hostInst.instance.prevBlock()
                if (hostPrevBlock) {
                  hostPrevBlock.next(that.marker)
                  hostPrevBlock.update(null, {
                    force: true,
                    prev: true
                  })
                } else {
                  let canvasOffset = that.viewPortOffset()
                  // 更新位置
                  let _m = hostInst.instance.element().getCTM()
                  let _x = (Number(_m.e) - canvasOffset.x) / Number(_m.a) - that.marker.ghostOffset.x
                  let _y = (Number(_m.f) - canvasOffset.y) / Number(_m.d) - that.marker.ghostOffset.y
                  $marker.attr('transform', `translate(${_x},${_y})`)
                  that.marker.childType('')
                  that.marker.next(hostInst.instance)
                  $(that.dom.canvas).append($marker)
                }
              } else if (hostInst.insert === 'resolve') {
                hostInst.instance.resolve(that.marker)
                hostInst.instance.update(null, {
                  force: true,
                  prev: true
                })
              } else if (hostInst.insert === 'reject') {
                hostInst.instance.reject(that.marker)
                hostInst.instance.update(null, {
                  force: true,
                  prev: true
                })
              }
              that.marker.update()
              $marker.attr('visibility', 'visible')
            }
          } else { // 如果在oldhost上
            if (!hostInst) { // 如果没有新host, 从oldhost删除，添加到canvas中
              $marker.attr('visibility', 'hidden')
              that.marker.pop()
              that.marker.childType('')
              $(that.dom.canvas).append($marker)
              // 更新transform
              $marker.attr('transform', `translate(${canvasx},${canvasy})`)
              // 更新
              if (oldhostInst.insert !== 'bottom') {
                let oldhostPrevBlock = oldhostInst.instance.prevBlock()
                if (oldhostPrevBlock) {
                  oldhostPrevBlock.update(null, {
                    force: true,
                    prev: true
                  })
                }
                oldhostInst.instance.update()
              } else {
                oldhostInst.instance.update(null, {
                  force: true,
                  prev: true
                })
              }
            } else { // 从oldhost移动到newhost上  
              if (oldhostInst.instance !== hostInst.instance || oldhostInst.insert !== hostInst.insert) {
                // 取出Marker
                that.marker.pop()
                if (oldhostInst.insert === 'top') {
                  let oldhostPrevBlock = oldhostInst.instance.prevBlock()
                  if (oldhostPrevBlock) {
                    oldhostPrevBlock.update(null, {
                      force: true,
                      prev: true
                    })
                  }
                } 

                if (oldhostInst.instance !== hostInst.instance ||
                  (oldhostInst.insert === 'resolve' || oldhostInst.insert === 'reject')) {
                  oldhostInst.instance.update(null, {
                    force: true,
                    prev: true
                  })
                }

                if (hostInst.insert === 'bottom') {
                  hostInst.instance.next(that.marker)
                } else if (hostInst.insert === 'top') {
                  // 从上方插入
                  let hostPrevBlock = hostInst.instance.prevBlock()
                  if (hostPrevBlock) {
                    hostPrevBlock.next(that.marker)
                    hostPrevBlock.update(null, {
                      force: true,
                      prev: true
                    })
                  } else {
                    let canvasOffset = that.viewPortOffset()
                    // 更新位置
                    let _m = hostInst.instance.element().getCTM()
                    let _x = (Number(_m.e) - canvasOffset.x) / Number(_m.a) - that.marker.ghostOffset.x 
                    let _y = (Number(_m.f) - canvasOffset.y) / Number(_m.d) - that.marker.ghostOffset.y 
                    that.marker.childType('')
                    $marker.attr('transform', `translate(${_x},${_y})`)
                    that.marker.next(hostInst.instance)
                    $(that.dom.canvas).append($marker)
                  }
                } else if (hostInst.insert === 'resolve') {
                  hostInst.instance.resolve(that.marker)

                } else if (hostInst.insert === 'reject') {
                  hostInst.instance.reject(that.marker)
                }
                // 更新
                that.marker.update()
                hostInst.instance.update(null, {
                  force: true,
                  prev: true
                })
              }
            }
          }
        }
        that.marker.hostInstance = hostInst
      }
    }).on('mouseup mouseleave', () => {
      that.startDrag = false
      $(this.dom.flyout).css('pointer-events', 'auto')
      let $dragsurface = $(that.dom.dragsurface)
      if (that.selected) {
        let $selected = $(that.selected)
        let uid = $selected.attr('data-uid')
        if ($selected.hasClass('ycBlockSelected') && $selected.hasClass('ycBlockDragging')) {
          // 插入占位
          var $marker = $(that.marker.element())
          // 判断是否在Flyout区域
          if (this.isInFlyoutRegion(event.pageX, event.pageY)) {
            // 删除Block实例
            this.removeBlock(uid)
          } else {
            let selectUid = $(that.selected).attr('data-uid')
            let selectInst = that.instances[selectUid]
          
            // 如果是Stack类型
            if (selectInst.__proto.isStackBlock()) {
              // 拷贝childtype
              let childType = that.marker.childType()
              selectInst.childType(childType)
              const oldLayoutHeight = selectInst.layoutHeight()
              const oldSeqHeight = selectInst.sequenceHeight()

              let prev = that.marker.prevBlock()
              let next = that.marker.nextBlock()

              if (!prev) {
                // 如果有next,将next添加到selected上
                if (next) {
                  selectInst.last(next)
                }
                $selected.insertBefore($marker)
              } else {
                that.marker.pop()
                if (childType === 'resolve') {
                  prev.resolve(selectInst)
                } else if (childType === 'reject') {
                  prev.reject(selectInst)
                } else {
                  prev.next(selectInst)
                }
              }

              // 更新变换，只需拷贝marker的transform
              let m = $marker.attr('transform').replace(/[^0-9\-.,]/g, '').split(',')

              if (next) {
                selectInst.update({
                  transform: {
                    x: Number(m[0]),
                    y: Number(m[1]) + oldLayoutHeight - oldSeqHeight
                  }
                })
              } else {
                selectInst.update({
                  transform: {
                    x: Number(m[0]),
                    y: Number(m[1])
                  }
                })
              }
            } else if (selectInst.__proto.isEmbedBlock()) { // 如果是嵌入类型
              let hostInst = that.marker.hostInstance

              // 获取参数对象
              if (!hostInst) {
                selectInst.childType('')
                $selected.insertBefore($marker)
                // 更新变换，只需拷贝marker的transform
                let m = $marker.attr('transform').replace(/[^0-9\-.,]/g, '').split(',')

                that.selected.__instance.update({
                  transform: {
                    x: Number(m[0]),
                    y: Number(m[1])
                  }
                })
              } else {
                let sec = hostInst.instance.state.data.sections[hostInst.insert]
                let argu = Argument.argument(sec)
                argu.highlight(false)
                selectInst.childType('argument')
                $(hostInst.instance.element()).append($selected)
                sec.__assign = selectInst
                // 通知父节点更新布局
                hostInst.instance.update(null, {
                  force: true,
                  prev: true
                })
              }
            }
            $selected.removeClass('ycBlockDragging')
            $selected.removeClass('ycBlockSelected')

            // 更新
            selectInst.update(null, {
              force: true,
              prev: true,
              next: true
            })
          }
          that.marker.ghost(null)
          $dragsurface.css('display', 'none')
          $dragsurface.attr('style', 'transform: translate3d(0px,0px,0px)')
        }
        that.selected = null
      }
    })

    $(this.dom.flyout).on('mousedown', () => {
      if (event.button === 0) {
        this.flyoutlastPoint.x = event.pageX
        this.flyoutlastPoint.y = event.pageY
        this.flyoutstartDrag = true
      }
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

        // 根据鼠标位置计算得到在Canvas中的位置，然后根据Block的包围盒计算中心锚点偏移
        // 这样就能将Block的中心放在当前鼠标的位置
        that.grapPoint.x = (event.pageX - X - Number(cm.e)) / Number(cm.a) - (bbox.width / 2 + bbox.x)
        that.grapPoint.y = (event.pageY - Y - Number(cm.f)) / Number(cm.a) - (bbox.height / 2 + bbox.y)

        let newInst = that.addBlock({
          type: proto.def.id,
          state: {
            transform: {
              x: that.grapPoint.x,
              y: that.grapPoint.y
            }
          }
        }, that.dom.dragcanvas)

        // 将坐标转回屏幕位置
        that.grapPoint.x *= Number(cm.a)
        that.grapPoint.y *= Number(cm.d)

        that.selected = newInst.element()
        $(that.selected).addClass('ycBlockSelected ycBlockDragging')

        // 插入占位(在末尾添加)
        that.marker.ghost(newInst)
        var $marker = $(that.marker.element())
        $marker.attr('visibility', 'hidden')
        $(that.dom.canvas).append($marker)

        that.flyoutselected = null
        that.lastPoint.x = event.pageX
        that.lastPoint.y = event.pageY
        let deltaX = event.pageX - that.lastPoint.x
        let deltaY = event.pageY - that.lastPoint.y
        // 根据鼠标位置调整surface
        let $dragsurface = $(that.dom.dragsurface)
        $dragsurface.attr('style', 'transform: translate3d(' + deltaX + 'px,' + deltaY + 'px,0px)')
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
   * 获取Viewport偏移量(Canvas坐标)
   */
  viewPortOffset() {
    let m = this.dom.canvas.getCTM()
    return {
      x: Number(m.e),
      y: Number(m.f)
    }
  }

  /**
   * 获取编辑面板的视口(SVG坐标)
   */
  viewPortBoundbox() {
    let m = this.dom.canvas.getCTM()
    return {
      left: Number(m.e) * Number(m.a),
      top: Number(m.f) * Number(m.d),
      right: (Number(m.e) + $(this.dom.svg).attr('width')) * Number(m.a),
      bottom: (Number(m.f) + $(this.dom.svg).attr('height')) * Number(m.d)
    }
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
    logger.debug('$$$$$$$$$$$$$', option)
    // 清空之前的定义
    this.option.blocks.defs = null
    // 合并Buttons
    let buttons = [].concat(this.option.buttons, option.buttons)
    delete option['buttons']
    // 合并
    $.extend(true, this.option, option)
    this.option.buttons = buttons
    logger.debug('$$$$$$$$$$$$$', option)

    // 提取Block包定义
    for (let p of this.option.blocks.packages.values()) {
      this.processPackage(p)
    }

    let defs = this.option.blocks.defs
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
    // 初始化按钮面板
    this.initButtons()
  }

  /**
   * 
   */
  initButtons() {
    const $group = $(this.dom.buttons)
    $group.children().remove()

    let offsety = 0
    for (let btn of this.option.buttons) {
      let img = ShapeUtils.base.image({
        width: 36,
        height: 36,
        y: offsety,
        url: btn.img
      })

      $(img).attr('data-id', btn.id)
      let panel = this
      $(img).mousedown(function() {
        yuchg.isFunction(btn.action) && btn.action(panel)
      })

      $group.append(img)
      offsety += 44
    }
  }

  initCategoryToolbox() {
    const categories = this.option.blocks.categories
    const registries = this.registries
    let zoom = this.flyoutZoomFactor
    let that = this

    function createMenu(key, offset) {
      let cate = categories[key]

      if (!cate) {
        logger.warn('category can not found: ' + key)
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
              logger.warn('block registry is corrupted:' + block)
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

    if (!option) {
      this.hideWidget()
      return
    }

    let $parent = $(this.dom.widget)
    $parent.children().remove()

    let panel = this
    let $input = null
    let dom = option.dom

    $parent.addClass('fieldTextInput')
    $parent.attr('style', 'transition: box-shadow 0.25s ease 0s;box-shadow: rgba(255, 255, 255, 0.3) 0px 0px 0px 4px;')
    // 根据option设置边框颜色
    $parent.css('border-color', option.background.stroke)
    // 设置缩放比例
    $parent.css('transform', `scale(${panel.currentZoomFactor})`)
    $parent.css('top', option.y)
    $parent.css('left', option.x)
    $parent.css('width', option.width)
    $parent.css('height', option.height)

    $input = $(`<input class="ycBlockHtmlInput" spellcheck="true" value="">`)
    $input.attr('type', 'text')
    $input.val(option.value)

    $input.on('input', function () {
      let newValue = $(this).val()
      if (option.type === 'number') {
        newValue = newValue.replace(/[^\d.]/g, '')
      }
      $(this).val(newValue)
      // 动态刷新大小
      callback && callback(newValue)
      // 调整控件大小
      $parent.css('width', dom.__section.data.size.width)
    })
    let callback = option.callback
    $input.on('blur', function () {
      let newValue = $(this).val()
      callback && callback(newValue)
      panel.hideWidget()
    })
    $parent.append($input)
    $parent.css('display', 'block')
    $input.focus()
  }

  hideWidget() {
    let $parent = $(this.dom.widget)
    $parent.attr('class', 'ycBlockWidgetDiv')
    $parent.attr('style', '')
    $parent.children().remove()
  }

  showDropdownWidget(option) {
    if (!option) {
      this.hideDropdownWidget()
      return
    }

    let $parent = $(this.dom.dropdown)
    let $content = $parent.children('.ycBlockDropDownContent')
    $content.children().remove()

    let panel = this
    // 根据option设置边框颜色
    $parent.attr('style', 'transition: opacity 0.25s ease 0s;')
    $parent.css('border-color', option.background.stroke)
    $parent.css('background-color', option.background.fill)

    const createPopMenu = function (option) {
      let $menu = $('<div class="ycBlockDropDownMenu" role="menu" aria-haspopup="true" tabindex="0" style="user-select: none;">')
      // 添加菜单项
      option.values.forEach((item, i) => {
        let $menuitem = $(`<div class="ycBlockDropDownMenuItem" role="menuitemcheckbox" style="user-select: none;" data-index="${i}" data-value="${item.value}"></div>`)
        let $menucontent = $(`<div class="ycBlockDropDownMenuItemContent" style="user-select: none;"><div class="ycBlockMenuItemCheckBox" style="user-select: none;"></div>${item.name}</div>`)
        if (i === option.select) {
          $menucontent.addClass('ycBlockSelected')
        }
        let callback = option.callback

        $menuitem.on('mouseover', function () {
          $(this).addClass('ycBlockDropDownMenuItemHover')
        }).on('mouseout', function () {
          $(this).removeClass('ycBlockDropDownMenuItemHover')
        }).on('mousedown', function () {
          event.stopPropagation()
          // 更新索引
          let i = $(this).attr('data-index')
          let v = $(this).attr('data-value')
          callback && callback(Number(i), Number(v))
          panel.hideDropdownWidget()
        })
        $menuitem.append($menucontent)
        $menu.append($menuitem)
      })
      return $menu
    }

    let $menu = createPopMenu(option)
    $content.append($menu)
    let $arrow = $parent.children('.ycBlockDropDownArrow')

    // 判断菜单是否被遮挡
    let menuWidth = $parent.outerWidth() / 2
    let menuHeight = $parent.outerHeight()
    let ws = $(this.dom.svg).find('.ycBlockWorkspace')
    let cbox = ws[0].getBBox()

    // 根据屏幕位置，调整菜单
    if (option.bottom + menuHeight > cbox.height) { // 调整为顶部显示
      $parent.css('transform', 'translate(0px, -20px)')
      $parent.css('top', option.top - menuHeight)
      $parent.css('left', option.center - menuWidth)
      $arrow.removeClass('ycBlockArrowTop')
      $arrow.addClass('ycBlockArrowBottom')
      $arrow.attr('style', `transform: translate(${menuWidth - 9}px, ${menuHeight - 9}px) rotate(45deg);`)
    } else {
      $parent.css('transform', 'translate(0px, 20px)')
      $parent.css('top', option.bottom)
      $parent.css('left', option.center - menuWidth)
      $arrow.removeClass('ycBlockArrowBottom')
      $arrow.addClass('ycBlockArrowTop')
      $arrow.attr('style', `transform: translate(${menuWidth - 9}px, -9px) rotate(45deg);`)
    }

    $parent.css('opacity', '1')
    $parent.css('display', 'block')
  }

  hideDropdownWidget() {
    let $parent = $(this.dom.dropdown)
    $parent.attr('class', 'ycBlockDropDownDiv')
    $parent.attr('style', 'display: none; opacity: 0;')

    let $content = $parent.children('.ycBlockDropDownContent')
    $content.children().remove()
  }

  addBlock(option, parent) {
    if (!option || !option.type) {
      return
    }

    let inst = this.createBlockInstance(option.type, option.state)
    if (!inst) {
      return
    }

    let panel = this
    let dom = panel.dom
    let $svg = $(dom.svg)
    let $elem = $(inst.element())
    $elem.attr('data-uid', inst.uid)
    $elem.on('mousedown', function () {
      event.stopPropagation()

      if (event.button === 0) {
        panel.hideWidget()

        panel.selected = this
        let m = this.getCTM()
        let pm = dom.canvas.getCTM()
        panel.grapPoint.x = (Number(m.e) - Number(pm.e))
        panel.grapPoint.y = (Number(m.f) - Number(pm.f))
        $(panel.selected).addClass('ycBlockSelected')

        // 父类
        panel.lastPoint.x = event.pageX
        panel.lastPoint.y = event.pageY
        panel.startDrag = true
        $(panel.dom.flyout).css('pointer-events', 'none')
      } else if (event.button === 2) {

        let X = $svg.offset().left
        let Y = $svg.offset().top
        let selectUid = $(this).attr('data-uid')
        let selectInst = panel.instances[selectUid]

        // Debug
        selectInst.dump()

        // 弹出上下文菜单
        if (!selectInst.__proto.isInternal()) {

          // 生成菜单项
          let menuitems = [
            {
              id: 'copy',
              name: '复制',
              action: () => {
                panel.cloneBlock(selectUid, true)
              }
            },
            {
              id: 'copyself',
              name: '复制自己',
              action: () => {
                panel.cloneBlock(selectUid)
              }
            },
            {
              id: 'delete',
              name: '删除',
              action: () => {
                panel.removeBlock(selectUid)
              }
            }
          ]

          // 生成导出菜单项
          for (let item of selectInst.exportItems()) {
            const ext = item.ext
            const fmt = item.fmt
            if (item.menuItem === true) {
              menuitems.push({
                id: 'export@' + fmt,
                name: item.menuName ? item.menuName : ('导出' + fmt),
                action: () => {
                  let data = selectInst.export(fmt)
                  logger.debug('MENU ACTION', data)
                  panel.option.exportCallback && panel.option.exportCallback(panel, ext, data)
                }
              })
            }
          }

          panel.showContextMenu({
            x: event.pageX - X,
            y: event.pageY - Y,
            items: menuitems
          })
        }
      }
      panel.hideDropdownWidget()
    }).on('mouseup', function () {
      if (event.button === 2) {
        event.stopPropagation()
      }
    })

    if (parent) {
      $(parent).append($elem)
    } else {
      $(this.dom.canvas).append($elem)
    }
    return inst
  }

  showContextMenu(option) {
    if (!option || !yuchg.isArray(option.items) || option.items.length === 0) {
      this.hideWidget()
      return
    }

    let $parent = $(this.dom.widget)
    $parent.children().remove()

    let panel = this
    let $menu = null
 
    $parent.attr('style', 'direction: ltr;')
    $parent.css('top', option.y)
    $parent.css('left', option.x)
   
    $menu = $(`<div class="ycBlockContextMenu" role="menu" aria-haspopup="true" tabindex="0" style="user-select: none;"></div>`)
    
    for (let item of option.items) {
      let $item = $(`<div class="ycBlockContextMenuItem" role="menuitem" id="cm-${item.id}" style="user-select: none;"><div class="ycBlockContextMenuItemContent" style="user-select: none;">${item.name}</div></div>`)
      $item.on('mouseover', function () {
        $(this).addClass('ycBlockContextMenuItemHover')
      }).on('mouseout', function () {
        $(this).removeClass('ycBlockContextMenuItemHover')
      }).on('mousedown', function () {
        event.stopPropagation()
        if (event.button === 0) {
          // 响应
          item.action()
        }
        panel.hideWidget()
      })
      $menu.append($item)
    }
  
    $parent.append($menu)
    $parent.css('display', 'block')
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

  /**
   * 根据UID
   * @param {*} uid 
   */

  findBlock(uid) {
    return this.instances[uid]
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
      logger.warn(`${def.type} registered repeated:  ${def.id}`)
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
      logger.warn(`${def.type} registered failed:  ${def.id}`)
    } else {
      list && list[def.category].blocks.push(def.id)
      logger.log(`${def.type} registered successed:  ${def.id}`)
    }
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

  /**
   * 克隆Block
   * seq = true 时，复制整个序列
   */

  cloneBlock(uid, seq = false) {
    let instance = this.instances[uid]
    if (!instance) {
      logger.warn(`Panel CloneBlock failed: can not find Instance [${uid}]`)
      return
    }

    const clone = instance.cloneSelf(seq)
    // 调整位置
    const oldPos = instance.canvasPosition()
    clone.setTranslate(oldPos.x + 64, oldPos.y + 64)
  }

  /**
   * 清空所有Blocks
   */
  clearBlocks() {
    const panel = this
    $(this.dom.canvas).children('g.ycBlockDraggable').each(function() {
      let $this = $(this)
      if ($this.attr('data-id') === 'insertmarker') {
        return false
      }
      let uid = $this.attr('data-uid')
      panel.removeBlock(uid)
    })
    
    for (let uid of Object.keys(this.instances)) {
      logger.warn(`Panel ClearBlocks: Instance [${uid}] still existed`)
    }
  }

  /**
   * 脚步格式化导出
   * @param {*} type  json | js | html
   */

  export(type) {

  }

  /**
   * 保存为内部格式
   */
  save() {
    // 
    let $canvas = $(this.dom.canvas)
    const panel = this
    let data = {
      author: 'Unique',
      blocks: []
    }
    $canvas.children('g.ycBlockDraggable').each(function() {
      let $this = $(this)

      if ($this.attr('data-id') === 'insertmarker') {
        return true
      }
      let uid = $this.attr('data-uid')
      let instance = panel.instances[uid]
      data.blocks.push(instance.encode())
    })
    return JSON.stringify(data)
  }


  /**
   * 
   * @param {*} data 
   */
   createBlock(data) {
    let instance = this.addBlock({
      type: data.protoId,
      state: {
        transform: data.state.transform
      }
    })
    // 
    instance.decode(data)
    return instance
   }

  /**
   * 从内部格式加载
   */
  load(data) {
     // 清空内容
    this.clearBlocks()

    if (!data) {
      return
    }

    if (yuchg.isString(data)) {
      let trimData = yuchg.trimString(data)

      if (trimData !== '') {
        let data = JSON.parse(trimData)
        if (!data) {
          logger.warn('Panel load failed: data corrupted -- ', trimData)
          return
        }

        if (!yuchg.isArray(data.blocks) || data.blocks.length === 0) {
          return
        }

        // 加载数据
        for (let block of data.blocks) {
          this.createBlock(block)
        }
      }
    }
  }
}

export default Panel