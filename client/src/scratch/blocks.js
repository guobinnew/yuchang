import $ from 'jquery'
import uuidv4 from 'uuid/v4'
import yuchg from '../base'
import logger from '../logger'
import ShapeUtils from './shapes'
import Utils from './utils'
import Argument from './argus'

// 投放区域外边框
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
   * 到处接口函数
   */
  exportItems() {
    return this.__proto.def.export ? this.__proto.def.export : []
  }

  /**
   * 获取section的Value，
   * 如果时Text， 返回text
   * 如果时Argument， 返回value
   * @param {*} i 
   */
  sectionValue(i) {
    const data = this.stateData()
    if (!yuchg.isArray(data.sections)) {
      logger.warn('BlockInstance sectionValue failed: no section data')
      return null
    }

    if (data.sections.length <= i) {
      logger.warn('BlockInstance sectionValue failed: index out of bound - ', data.sections.length)
      return null
    }

    const sec = data.sections[i]
    if (sec.type === 'text') {
      return sec.text
    } else if (sec.type === 'argument') {
      if (sec.datatype === 'enum') {
        logger.debug('sectionValue', i, sec)
        return sec.data.values[sec.data.currentIndex]
      } else {
        return sec.data.value
      }
    }

    return null
  }

  /**
   * 导出 
   */
  export(fmt) {
    let output = null
    for (let exp of this.exportItems()) {
      if (exp.fmt === fmt) {
        output = exp.action.call(this)
      }
    }
    return output
  }

  /**
   * 原型Id
   */
  protoId() {
    return this.__proto ? this.__proto.def.id : 'unknown'
  }

  /**
   * 获取Panel对象
   */
  panel() {
    return this.__proto ? this.__proto.def.__panel : null
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
   * 获取后面整序列高度
   */
  sequenceHeight() {
    let height = this.layoutHeight()
    const next = this.nextBlock()

    if (next) {
      height += next.sequenceHeight()
    }
    return height
  }

  /**
   * child类型
   */
  childType(newType) {
    let elem = this.element()
    if (newType == null) {
      return elem.getAttribute('data-child')
    }

    const validType = ['', 'argument', 'resolve', 'reject']
    if (validType.indexOf(newType) < 0) {
      logger.warn('BlockInstance childType failed: invalid type --', newType)
      return
    }

    elem.setAttribute('data-child', newType)
  }

  /**
   * 调试输出
   */
  dump() {
    const $elem = $(this.element())
    const $path = $elem.children('path.ycBlockBackground')
    const bbox = $path[0].getBBox()

    const next = this.nextBlock()
    const prev = this.prevBlock()
    const resolve = this.rejectBlock()
    const reject = this.rejectBlock()

    const output = {
      uid: this.uid,
      protoId: this.protoId(),
      CTM: this.element().getCTM(),
      boundbox: bbox,
      transform: $elem.attr('transform'),
      regions: this.getRegions(),
      state: {
        size: this.state.size
      },
      stackPosition: this.__proto.stackPosition(),
      canstackPosition: this.__proto.canStackPosition(),
      childType: this.childType(),
      layoutHeight: this.layoutHeight(),
      sequenceHeight: this.sequenceHeight(),
      child: {
        next: next ? next.protoId() : null,
        prev: prev ? prev.protoId() : null,
        resolve: resolve ? resolve.protoId() : null,
        reject: reject ? reject.protoId() : null
      },
      encode: this.encode()
    }
    logger.debug('****** Instance Dump ******', output)
  }

  // 获取实例类型
  protoType() {
    return this.__proto ? this.__proto.def.type : 'unknown'
  }

  /**
   * 原型的图形类型
   */
  protoShape() {
    return this.__proto ? this.__proto.def.shape : 'unknown'
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
  hasInclude(instance) {
    if (!instance) {
      return false
    }

    // 是否为自己
    if (this.uid === instance.uid) {
      return true
    }

    let found = false
    $(this.element()).find('g.ycBlockDraggable').each(function () {
      if (this.getAttribute('data-uid') === instance.uid) {
        found = true
        return false
      }
    })

    return found
  }

  /**
   * 设置位置变换
   */
  setTranslate(x, y) {
    if (!yuchg.isNumber(x) || !yuchg.isNumber(y)) {
      logger.warn('BlockInstance setTranslate failed: x or y is not a number')
      return
    }
    this.state.transform.x = x
    this.state.transform.y = y
    this.element().setAttribute('transform', `translate(${x},${y})`)
  }
  
  getRegions() {
    this.updateDropRegions()
    return this.regions
  }

  /**
   * 
   * 获取在Canvas上的坐标
   */
  canvasPosition() {
    const m = this.element().getCTM()
    // 获取panel的偏移
    const canvasOffset = this.panel().viewPortOffset()
    return {
      x: (Number(m.e) - canvasOffset.x) / Number(m.a),
      y: (Number(m.f) - canvasOffset.y) / Number(m.d)
    }
  }

  /**
  * 计算top投放区域
  */
  updateRegion_top(regions) {
    if (this.protoShape() === 'cap' || this.protoShape() === 'hat') {
      logger.warn('Instance _updateregion_top failed: cap or hat can not stack in top')
      return
    }

    const $path = $(this.element()).children('path.ycBlockBackground')
    const bbox = $path[0].getBBox()
    const canvasPos = this.canvasPosition()

    regions.stacks.top = Utils.boundRect(
      canvasPos.x,
      canvasPos.y - ycDropMargin,
      bbox.width,
      ycDropMargin
    )
  }

  updateRegion_bottom(regions) {
    const shape = this.protoShape()
    const $path = $(this.element()).children('path.ycBlockBackground')
    const bbox = $path[0].getBBox()
    const size = this.state.size
    const canvasPos = this.canvasPosition()

    if (shape === 'slot') {
      regions.stacks.bottom = Utils.boundRect(
        canvasPos.x,
        canvasPos.y,
        bbox.width,
        bbox.height + ycDropMargin
      )
    } else if (shape === 'cap' || shape === 'hat') {
      regions.stacks.bottom = Utils.boundRect(
        canvasPos.x,
        canvasPos.y + bbox.y,
        bbox.width,
        size.height + ycDropMargin
      )
    } else if (shape === 'cup' || shape === 'cuptwo') {
      regions.stacks.bottom = Utils.boundRect(
        canvasPos.x,
        canvasPos.y + bbox.height - size.bottomHeight,
        bbox.width,
        size.bottomHeight + ycDropMargin
      )
    }
  }

  updateRegion_resolve(regions) {
    const shape = this.protoShape()
    const $path = $(this.element()).children('path.ycBlockBackground')
    const bbox = $path[0].getBBox()
    const size = this.state.size
    const canvasPos = this.canvasPosition()

    let validshapes = ['cup', 'cuptwo']
    if (validshapes.indexOf(shape) < 0) {
      logger.warn('Instance _updateregion_resolve failed: invalid shape -- ', shape)
      return
    }

    regions.stacks.resolve = Utils.boundRect(
      canvasPos.x,
      canvasPos.y,
      bbox.width,
      size.height
    )
  }

  updateRegion_reject(regions) {
    const shape = this.protoShape()
    const $path = $(this.element()).children('path.ycBlockBackground')
    const bbox = $path[0].getBBox()
    const size = this.state.size
    const canvasPos = this.canvasPosition()

    let validshapes = ['cup', 'cuptwo']
    if (validshapes.indexOf(shape) < 0) {
      logger.warn('Instance _updateregion_reject failed: invalid shape -- ', shape)
      return
    }

    if (shape === 'cuptwo') {
      regions.stacks.reject = Utils.boundRect(
        canvasPos.x,
        canvasPos.y + size.height + size.resolveHeight,
        bbox.width,
        size.centerHeight + size.cornerRadius * 2
      )
    }
  }

  /**
   * 可以stack到其他Block上的位置
   * seq: 是否考虑序列
   */
  stackPosition(seq = false) {
    let pos = this.__proto.stackPosition()
    if (seq) {
      // 考虑last的元素
      const last = this.lastBlock()
      if (last !== this) {
        const lastpos = last.__proto.stackPosition()
        if (lastpos.indexOf('top') < 0) {
          pos.splice(pos.findIndex(v => v === 'top'), 1)
        }
      }
    }
    return pos
  }

  // 获取实例的投放区域
  updateDropRegions() {

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
          if (sec.__assign) {
            // 获取已赋值参数实例尺寸
          } else {
            const argu = Argument.argument(sec)
            if (argu) {
              // 获取参数位置
              const canvasOffset = this.panel().viewPortOffset()
              this.regions.arguments[i] = {
                shape: argu.data('shape'),
                datatype: sec.datatype,
                rect: argu.boundRect(-canvasOffset.x, -canvasOffset.y)
              }
            }
          }
        }
      })
    }
  }

  // 下一个Block
  nextBlock() {
    const $dom = $(this.element())
    const panel = this.panel()
    const instances = panel.instances
    let next = null
    $dom.children('g.ycBlockDraggable[data-child=""]').each(function() {
      if (this.getAttribute('data-id') === 'insertmarker') {
        next = panel.marker
        return false
      }

      let uid = this.getAttribute('data-uid')
      next = instances[uid]
      return false
    })
    return next
  }

  // 上一个Block
  prevBlock() {
    const instances = this.panel().instances
    const $prev = $(this.element()).parent('g.ycBlockDraggable')
    if ($prev.length > 0) {
      let uid = $prev.attr('data-uid')
      return instances[uid]
    }
    return null
  }

  // 末尾Block
  lastBlock() {
    let last = this
    let temp = this.nextBlock()
    while (temp) {
      last = temp
      temp = temp.nextBlock()
    }
    return last
  }

  // 头部Block
  firstBlock() {
    let first = this
    let temp = this.prevBlock()
    while (temp) {
      first = temp
      temp = temp.prevBlock()
    }
    return first
  }

  /**
   * 从序列脱离，保留childType
   */
  pop() {
    let prev = this.prevBlock()
    let next = null
    const $dom = $(this.element())

    const childType = this.childType()
    if (childType === 'argument') { // 参数不用pop自身的子节点
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
        const $canvas = $(this.panel().dom.canvas)
        const canvasOffset = this.panel().viewPortOffset()
        // 变换坐标
        let $next = $(next.element())
        let m = next.element().getCTM()
        next.update({
          transform: {
            x: (Number(m.e) - canvasOffset.x) / Number(m.a),
            y: (Number(m.f) - canvasOffset.y) / Number(m.d)
          }
        })
        $canvas.append($next)
      }
      $dom.detach()
    }
  }

  // 在序列后面插入instance
  next(instance) {
    if (!instance) {
      logger.warn('BlockInstance append failed: instance is null')
      return null
    }

    instance.childType('')

    const next = this.nextBlock()
    $(instance.element()).appendTo(this.element())
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

    const next = this.nextBlock()
    if (next) {
      next.last(instance)
    } else {
      $(this.element()).append(instance.element())
    }
  }

  /**
   * 获取resolve子节点
   */
  resolveBlock() {
    const instances = this.panel().instances
    let next = null
    $(this.element()).children('g.ycBlockDraggable[data-child="resolve"]').each(function() {
      let uid = this.getAttribute('data-uid')
      next = instances[uid]
      return false
    })
    return next
  }

  /**
   * 
   */
  rejectBlock() {
    const instances = this.panel().instances
    let next = null
    $(this.element()).children('g.ycBlockDraggable[data-child="reject"]').each(function() {
      let uid = this.getAttribute('data-uid')
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

    instance.childType('resolve')
    const next = this.resolveBlock()
    $(instance.element()).appendTo(this.element())
    if (next) {
      next.childType('')
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
    instance.childType('reject')
    let next = this.rejectBlock()
    $(instance.element()).appendTo(this.element())
    if (next) {
      next.childType('')
      instance.last(next)
    }
  }

  // 移除并返回nextBlock（没有删除）
  removeNext(recursive = false) {
    const next = this.nextBlock()
    if (next) {
      if (!recursive) {
        const nextnext = next.nextBlock()
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
  }

  // 清空
  clear() {
    // 删除子节点
    let panel = this.panel()
    $(this.element()).children('g.ycBlockDraggable').each(function() {
      if (this.getAttribute('data-id') === 'insertmarker') {
        return true
      }
      let uid = this.getAttribute('data-uid')
      panel.removeBlock(uid)
    })
 
    this.__proto.instances.delete(this.uid)
    $(this.dom).remove()
    this.dom = null
  }

  /**
   * 
   * @param {*} source 
   */
  stateData() {
    if (!this.state.data) {
      this.state.data = {}
    }
    return this.state.data
  }

  /**
   * 
   */
  include(instance, child) {
    if (!instance) {
      return
    }

    if (yuchg.isString(child)) {
      instance.childType(child)
    }
    $(this.element()).append(instance.element())
  }

  /**
   * 克隆参数，确保source与自己是同类型Block
   */
  cloneArgument(source) {
    if (!source) {
      logger.warn(`BlockInstance cloneArgument failed: source is null `)
      return
    }

    if (source.protoId() !== this.protoId()) {
      logger.warn(`BlockInstance cloneArgument failed: source protoId [${source.protoId()}] is not same - `, this.protoId())
      return
    }

    const sourceData = source.stateData()
    if (!sourceData.sections) {
      return
    }
  
    const sections = this.stateData().sections
    const dest = this
    sourceData.sections.forEach(function(sec, i) {
      const destsec = sections[i]
      // 检查类型是否匹配
      if (sec.type !== 'argument') {
        return true
      }

      if (destsec.type !== 'argument') {
        logger.warn(`BlockInstance cloneArgument failed: section [${i}] is not argument - `, destsec.type)
        return false
      }

      if (sec.datatype !== destsec.datatype) {
        logger.warn(`BlockInstance cloneArgument failed: section [${i}] datatype [${destsec.datatype}] is not same as - `, sec.datatype)
        return false
      }

      $.extend(true, sections[i].data, sec.data)

      // 复制参数Block
      if (sec.__assign) {
        const secclone = sec.__assign.cloneSelf(true)
        sections[i].__assign = secclone
        dest.include(secclone, 'argument')
      }
    })
  }

  /**
   * 克隆Resolve
   */
  cloneResolve(source) {
    const resolve = source.resolveBlock()
    if (!resolve) {
      return
    }
    const resolveClone = resolve.cloneSelf(true)
    this.include(resolveClone, 'resolve')
  }

   /**
   * 克隆Reject
   */
  cloneReject(source) {
    const reject = source.rejectBlock()
    if (!reject) {
      return
    }
    const rejectClone = reject.cloneSelf(true)
    this.include(rejectClone, 'reject')
  }

  /**
   * 克隆Next
  */
  cloneNext(source, seq = false) {
    const next = source.nextBlock()
    if (!next) {
      return
    }
    const nextClone = next.cloneSelf(seq)
    this.include(nextClone, '')
  }

  /**
   * 克隆自己
   */
  cloneSelf(seq = false) {
    // 根据类型复制自己
    const clone = this.panel().addBlock({
      type: this.protoId()
    })

    // 复制childtype
    clone.childType(this.childType())

    // 复制参数值
    clone.cloneArgument(this)
    // 复制resolve
    clone.cloneResolve(this)
    // 复制reject
    clone.cloneReject(this)

    // 复制next节点
    if (seq) {
      clone.cloneNext(this, true)
    }

    clone.update()
    return clone
  }

  /**
   * 
   */
  cloneStateData() {

    const clone = {}
    const sourceData = this.stateData()
    // 克隆sections数据
    if (!sourceData.sections) {
      return
    }

    clone.sections = []
    sourceData.sections.forEach(function(sec, i) {
      const excepts = ['dom', '__width']
      let secclone = {}
      for (let [key, val] of Object.entries(sec)) {
        if (excepts.indexOf(key) >= 0) {
          continue
        }

        if (key === 'data') {
          secclone.data = $.extend(true, {}, sec.data)
        } else if (key === '__assign') {
          if (val) {
            secclone.__assign = val.encode()
          }
        } else {
          logger.debug('clonedata =====', key, val)
          secclone[key] = yuchg.cloneObject(val)
        }
      }
      clone.sections.push(secclone)
    })

    return clone
  }

  // 编码
  encode() {
    const next = this.nextBlock()
    const resolve = this.resolveBlock()
    const reject = this.rejectBlock()

    const data = {
      protoId: this.protoId(),
      state: {
        data: this.cloneStateData(),
        transform: this.state.transform
      },
      child: {
        next: next ? next.encode() : null,
        resolve: resolve ? resolve.encode() : null,
        reject: reject ? reject.encode() : null
      }
    }
    return data
  }

  /**
   * 解析state数据
   * @param {} data 
   */
  decodeStateData(data) {
    if (!data) {
      return
    }
    const panel = this.panel()
    const sourceData = this.stateData()
    // 克隆sections数据
    if (!data.sections) {
      return
    }

    logger.debug(sourceData, data)
    data.sections.forEach((sec, i) => {
      let sourcesec = sourceData.sections[i]

      // 检查类型匹配
      if (sourcesec.type !== sec.type) {
        logger.warn(`BlockInstance decodeStateData failed: section [${i}] type [${sourcesec.type}] is not same - `, sec.type)
        return false
      }

      if (sec.type === 'argument' && sec.datatype !== sourcesec.datatype) {
        logger.warn(`BlockInstance cloneArgument failed: section [${i}] datatype [${sourcesec.datatype}] is not same as - `, sec.datatype)
        return false
      }

      for (let [key, val] of Object.entries(sec)) {
        if (key === 'data') {
          sourcesec.data = $.extend(true, {}, val)
        } else if (key === '__assign') {
          if (val) {
            sourcesec.__assign = panel.createBlock(val)
            this.include(sourcesec.__assign, 'argument')
          }
        } else {
          logger.debug('clonedata =====', key, val)
          sourcesec[key] = yuchg.cloneObject(val)
        }
      }
    })
  }

  // 解码
  decode(data) {
    // 更新状态
    const panel = this.panel()

    // 更新参数状态
    this.decodeStateData(data.state.data)

    // 更新resolve
    if (data.child.resolve) {
      let resolve = panel.createBlock(data.child.resolve)
      this.include(resolve, 'resolve')
    }

    // 更新reject
    if (data.child.reject) {
      let reject = panel.createBlock(data.child.reject)
      this.include(reject, 'reject')
    }

    // 更新next
    if (data.child.next) {
      let next = panel.createBlock(data.child.next)
      this.include(next, '')
    }

    this.update()
  }
}

// 块实例
class BlockMarkerInstance extends BlockInstance {
  constructor(proto, state) {
    super(proto, state)
    this.ghostInstance = null
    this.hostInstance = null
    this.ghostOffset = {
      x: 0,
      y: 0
    }
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
    const $dom = $(this.element())
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
    this.dom.setAttribute('visibility', visible ? 'visible' : 'hidden')

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
      let selectUid = this.getAttribute('data-uid')
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
      child: '',
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

    const props = ['id', 'shape', 'type', 'category', 'child']
    for (let i of props) {
      let v = this.def[i]
      if (!yuchg.isString(v)) {
        logger.warn(`create Block: ${i} is not string --`, v)
        v = ''
      }
      elem.setAttribute('data-' + i, v)
    }

    if (this.def.draggable === true) {
      elem.classList.add('ycBlockDraggable')
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
    if (this.def.id === 'insertmarker') {
      elem.classList.add('ycBlockInsertionMarker')
    }
    elem.setAttribute('visibility', 'hidden')
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
    if (this.def.shape === 'diamond') { // 布尔类型
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
    const state = this.def.state
    if (yuchg.isArray(state.data.sections)) {
      // 创建Section
      state.data.sections.forEach((sec, i) => {
        let child = this.createSection(sec)
        if (!child) {
          logger.warn(`Block<${ this.def.id }> createSection failed:`, sec)
        } else {
          sec.dom = child
          sec.dom.setAttribute('data-index', i)
          elem.appendChild(child)
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

            if (event.button === 0) {
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
                  if (this.__section.datatype === 'number' && v === '') {
                    v = 0
                  }
                  this.__section.data.value = v
                  // 更新整个Block
                  this.__instance.update(null, {
                    force: true
                  })
                }
              })
            }
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

            if (event.button === 0) {
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
                center: Number(m.e) + bbox.width / 2 * Number(m.a),
                bottom: Number(m.f) + bbox.height * Number(m.d),
                top: Number(m.f),
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
      let selectInst = null
      if (this.getAttribute('data-id') === 'insertmarker') {
        selectInst = def.__panel.marker
      } else {
        selectInst = def.__panel.instances[this.getAttribute('data-uid')]
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
      const index = this.getAttribute('data-index')
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
    const state = this.def.state

    // other
    if (this.def.shape === 'cuptwo' && state.data.other) {
      if (state.data.other.type === 'text') {
        let other = ShapeUtils.base.text(state.data.other)
        other.classList.add('ycBlockOther')
        elem.appendChild(other)
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
      subscript.classList.add('ycBlockSubscript')
      elem.appendChild(subscript)
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
      let selectInst = null
      if (this.getAttribute('data-id') === 'insertmarker') {
        selectInst = def.__panel.marker
      } else {
        selectInst = def.__panel.instances[this.getAttribute('data-uid')]
      }
      resolveHeight += selectInst.sequenceHeight()
    })

    // 计算reject高度 
    let rejectHeight = 0
    if (def.shape === 'cuptwo') {
      $dom.children('g.ycBlockDraggable[data-child="reject"]').each(function () {
        let selectInst = null
        if (this.getAttribute('data-id') === 'insertmarker') {
          selectInst = def.__panel.marker
        } else {
          selectInst = def.__panel.instances[this.getAttribute('data-uid')]
        }
        rejectHeight += selectInst.sequenceHeight()
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
      state.size.centerHeight = $shape[0].__boundbox.centerHeight
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
    let resolveOffsety = offsety
    $dom.children('g.ycBlockDraggable[data-child="resolve"]').each(function () {
      let selectInst = null
      if (this.getAttribute('data-id') === 'insertmarker') {
        selectInst = def.__panel.marker
      } else {
        selectInst = def.__panel.instances[this.getAttribute('data-uid')]
      }
      selectInst.setTranslate(16, resolveOffsety)
      resolveOffsety += selectInst.sequenceHeight()
    })
    offsety += state.size.resolveHeight

    // 调整位置
    if (def.shape === 'cuptwo' && state.data.other) {
      offsety += state.size.cornerRadius
      // 更新other文字位置
      let $other = $dom.children('.ycBlockOther')
      $other.trigger(ShapeUtils.events.positionText, [{
        x: padding.left + state.data.other.__width / 2,
        y: 0,
        translatex: 0,
        translatey: offsety + state.size.centerHeight / 2
      }])
      offsety += state.size.centerHeight
      offsety += state.size.cornerRadius

      // 调整Reject位置
      let rejectOffsety = offsety
      $dom.children('g.ycBlockDraggable[data-child="reject"]').each(function () {
        let selectInst = null
        if (this.getAttribute('data-id') === 'insertmarker') {
          selectInst = def.__panel.marker
        } else {
          selectInst = def.__panel.instances[this.getAttribute('data-uid')]
        }
        selectInst.setTranslate(16, rejectOffsety)
        rejectOffsety += selectInst.sequenceHeight()
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
      let selectInst = null
      if (this.getAttribute('data-id') === 'insertmarker') {
        selectInst = def.__panel.marker
      } else {
        selectInst = def.__panel.instances[this.getAttribute('data-uid')]
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
    // 默认为非中止block
    opt.end = !!this.def.end
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
    let shape = null
    if (this.def.shape === 'hat') {
      shape = ShapeUtils.path.hat(opt)
    } else {
      shape = ShapeUtils.path.cap(opt)
    }
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