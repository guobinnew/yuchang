import $ from 'jquery'
import yuchg from '../base'
import logger from '../logger'

/**
 *  SVG命名空间
 */
const ycSvgNS = 'http://www.w3.org/2000/svg'

/**
 * 日志前缀
 */
function logPrefix(elem, evt) {
  const tagName = elem.tagName
  return `${tagName} ${evt} event: `
}

/**
 * 公共事件
 */
const ycEvents = {
  resize: 'ycBlockEventResize',
  position: 'ycBlockEventPosition',
  positionText: 'ycBlockEventPositionText',
  background: 'ycBlockEventBackground',
  change: 'ycBlockEventChange',
  changeImage: 'ycBlockEventChangeImage'
}
const ycEventFunctions = {}
ycEventFunctions[ycEvents.resize] = function (event, opt) {
  event.stopPropagation()
  const $this = $(this)
  const log = logPrefix(this, ycEvents.resize)

  if (!opt) {
    logger.warn(log + 'opt is null')
    return
  }

  if (!yuchg.isNumber(opt.width)) {
    logger.warn(log + `width is not number`)
  } else {
    $this.attr('width', opt.width)
  }

  if (!yuchg.isNumber(opt.height)) {
    logger.warn(log + `height is not number`)
  } else {
    $this.attr('width', opt.height)
  }
}

ycEventFunctions[ycEvents.position] = function (event, opt) {
  event.stopPropagation()
  const $this = $(this)
  const log = logPrefix(this, ycEvents.position)

  if (!opt) {
    logger.warn(log + 'opt is null')
    return
  }

  let tx = 0
  let ty = 0
  if (opt.translatex) {
    if (!yuchg.isNumber(opt.translatex)) {
      logger.warn(log + `translatex is not number`)
    } else {
      tx = opt.translatex
    }
  }
  if (opt.translatey) {
    if (!yuchg.isNumber(opt.translatey)) {
      logger.warn(log + `translatey is not number`)
    } else {
      ty = opt.translatey
    }
  }
  $this.attr('transform', `translate(${tx}, ${ty})`)
}

ycEventFunctions[ycEvents.positionText] = function (event, opt) {
  event.stopPropagation()
  const $this = $(this)
  const log = logPrefix(this, ycEvents.positionText)

  if (!opt) {
    logger.warn(log + 'opt is null')
    return
  }

  if (opt.x) {
    if (!yuchg.isNumber(opt.x)) {
      logger.warn(log + `x is not number`)
    } else {
      $this.attr('x', opt.x)
    }
  }

  if (opt.y) {
    if (!yuchg.isNumber(opt.y)) {
      logger.warn(log + `y is not number`)
    } else {
      $this.attr('y', opt.y)
    }
  }

  let tx = 0
  let ty = 0
  if (opt.translatex) {
    if (!yuchg.isNumber(opt.translatex)) {
      logger.warn(log + `translatex is not number`)
    } else {
      tx = opt.translatex
    }
  }
  if (opt.translatey) {
    if (!yuchg.isNumber(opt.translatey)) {
      logger.warn(log + `translatey is not number`)
    } else {
      ty = opt.translatey
    }
  }
  $this.attr('transform', `translate(${tx}, ${ty})`)
}

ycEventFunctions[ycEvents.background] = function (event, opt) {
  event.stopPropagation()

  const $this = $(this)
  const log = logPrefix(this, ycEvents.background)

  if (!opt) {
    logger.warn(log + 'opt is null')
    return
  }

  if (opt.stroke) {
    if (!yuchg.isString(opt.stroke)) {
      logger.warn(log + `stroke is not string`)
    } else {
      $this.attr('stroke', opt.stroke)
    }
  }

  if (opt.fill) {
    if (!yuchg.isString(opt.fill)) {
      logger.warn(log + `fill is not string`)
    } else {
      $this.attr('fill', opt.fill)
    }
  }

  if (opt.opacity) {
    if (!yuchg.isNumber(+opt.opacity)) {
      logger.warn(log + `opacity is not number`)
    } else {
      $this.attr('fill-opacity', opt.opacity)
    }
  }
}

ycEventFunctions[ycEvents.changeImage] = function (event, opt) {
  event.stopPropagation()
  const $this = $(this)
  const log = logPrefix(this, ycEvents.changeImage)

  if (!opt) {
    logger.warn(log + 'opt is null')
    return
  }

  if (opt.url) {
    if (!yuchg.isString(opt.url)) {
      logger.warn(log + `url is not string`)
    } else {
      $this[0].href.baseVal = opt.url
    }
  }
}

const ycCaveRight = 48 // 凹槽起右边位置
const ycCaveSecondRight = 64 // 子凹槽起右边位置
const ycCapBulgeWidth = 96 // 帽子凸起宽度
const ycCapBulgeHeight = 22 // 帽子凸起高度
const ycCornerRadius = 4 // 圆角半径

/**
 * 参数合法检验
 * param：Any
 * validate： Function 返回布尔值
 */
function checkParameter(param, validate) {
  if (!yuchg.isFunction(validate)) {
    return param
  }
  return validate(param) ? param : null
}

const ShapeUtils = {
  events: ycEvents,
  path: {
    /**
     * 帽子
     */
    cap: function (option) {
      const path = document.createElementNS(ycSvgNS, 'path')
      const $elem = $(path)

      if (!option) {
        option = {}
      }

      const minContentWidth = ycCapBulgeWidth + 16 // 包含左右padding
      const minContentHeight = 40 // 包含上下padding

      // 最小尺寸
      let boundbox = {
        caveRight: ycCaveRight,
        bulgeWidth: ycCapBulgeWidth,
        cornerRadius: ycCornerRadius,
        bulgeHeight: ycCapBulgeHeight,
        width: minContentWidth + ycCornerRadius * 2,
        height: minContentHeight + ycCornerRadius * 2, // 仅仅是头部显示区域，不是完整高度，完整高度使用BBox()获取
        contentWidth: minContentWidth,
        contentHeight: minContentHeight
      }

      /**
       * 根据content大小计算外形大小
       */
      const _size = (box, opt) => {
        let _boundbox = Object.assign({}, box)
        if (!opt) {
          return _boundbox
        }

        let modify = false
        if (yuchg.isNumber(opt.contentWidth)) {
          modify = true
          _boundbox.contentWidth = Math.max(opt.contentWidth, minContentWidth)
        }

        if (yuchg.isNumber(opt.contentHeight)) {
          modify = true
          _boundbox.contentHeight = Math.max(opt.contentHeight, minContentHeight)
        }

        if (modify) {
          // 更新宽高
          _boundbox.width = _boundbox.contentWidth + _boundbox.cornerRadius * 2
          _boundbox.height = _boundbox.contentHeight + _boundbox.cornerRadius * 2
        }
        return _boundbox
      }

      // 更新尺寸大小
      boundbox = _size(boundbox, option)

      const d = '`m 0,0 c 25, ${ -size.bulgeHeight } 71,${ -size.bulgeHeight } ${ size.bulgeWidth },0 H ${ size.width - size.cornerRadius } a 4,4 0 0,1 4,4 v ${size.contentHeight}  a 4,4 0 0,1 -4,4 H ${ size.caveRight }   c -2,0 -3,1 -4,2 l -4,4 c -1,1 -2,2 -4,2 h -12 c -2,0 -3,-1 -4,-2 l -4,-4 c -1,-1 -2,-2 -4,-2 H 4 a 4,4 0 0,1 -4,-4 z`'
      const _dfunc = new Function('size', 'return ' + d)
      $elem.attr('d', _dfunc(boundbox))

      option.stroke && $elem.attr('stroke', option.stroke)
      option.fill && $elem.attr('fill', option.fill)
      option.opacity && $elem.attr('fill-opacity', option.opacity)

      $elem.addClass('ycBlockPath ycBlockBackground' + (option.classes ? (' ' + option.classes) : ''))

      // 自定义事件
      $elem.on(ycEvents.resize, function (event, opt) {
        event.stopPropagation()

        let log = logPrefix(this, ycEvents.resize)
        if (!opt) {
          logger.warn(log + `opt is null`)
          return
        }

        opt.contentWidth = checkParameter(opt.contentWidth, yuchg.isNumber)
        opt.contentHeight = checkParameter(opt.contentHeight, yuchg.isNumber)

        boundbox = _size(boundbox, opt)
        const $this = $(this)
        $this.attr('d', _dfunc(boundbox))
        this.__boundbox = boundbox
      })

      // 计算大小
      path.__boundbox = boundbox
      return path
    },

    /*
      C型
      */
    cup: function (option) {
      const path = document.createElementNS(ycSvgNS, 'path')
      const $elem = $(path)

      if (!option) {
        option = {}
      }

      const minContentWidth = ycCaveRight + 104
      const minContentHeight = 40
      const bottomHeight = 24
      const emptySlotHeight = 24

      // 内部
      let boundbox = {
        caveRight: ycCaveRight,
        caveSecondRight: ycCaveSecondRight,
        cornerRadius: ycCornerRadius,
        width: minContentWidth + ycCornerRadius * 2,
        height: minContentHeight + ycCornerRadius * 2,
        contentWidth: minContentWidth,
        contentHeight: minContentHeight,
        slotHeight: emptySlotHeight, // 含ycCornerRadius * 2
        bottomHeight: bottomHeight,
        wholeHeight: minContentHeight + emptySlotHeight + bottomHeight + ycCornerRadius * 4
      }

      // 计算内容大小
      const _size = (box, opt) => {
        let _boundbox = Object.assign({}, box)
        if (!opt) {
          return _boundbox
        }

        let modify = false

        if (yuchg.isNumber(opt.contentWidth)) {
          modify = true
          _boundbox.contentWidth = Math.max(opt.contentWidth, minContentWidth)
        }

        if (yuchg.isNumber(opt.contentHeight)) {
          modify = true
          _boundbox.contentHeight = Math.max(opt.contentHeight, minContentHeight)
        }

        if (yuchg.isNumber(opt.slotHeight)) {
          modify = true
          _boundbox.slotHeight = Math.max(opt.slotHeight, emptySlotHeight)
        }

        if (modify) {
          _boundbox.width = _boundbox.contentWidth + _boundbox.cornerRadius * 2
          _boundbox.height = _boundbox.contentHeight + _boundbox.cornerRadius * 2
          _boundbox.wholeHeight = _boundbox.height + _boundbox.slotHeight + _boundbox.bottomHeight + ycCornerRadius * 2
        }

        return _boundbox
      }

      // 更新尺寸大小
      boundbox = _size(boundbox, option)
      const d = '`m 0,4 A 4,4 0 0,1 4,0 H 12 c 2,0 3,1 4,2 l 4,4 c 1,1 2,2 4,2 h 12 c 2,0 3,-1 4,-2 l 4,-4 c 1,-1 2,-2 4,-2 H ${ size.width - size.cornerRadius } a 4,4 0 0,1 4,4 v ${ size.contentHeight}  a 4,4 0 0,1 -4,4 H ${ size.caveSecondRight } c -2,0 -3,1 -4,2 l -4,4 c -1,1 -2,2 -4,2 h -12 c -2,0 -3,-1 -4,-2 l -4,-4 c -1,-1 -2,-2 -4,-2 h -8  a 4,4 0 0,0 -4,4 v ${ size.slotHeight - size.cornerRadius * 2 } a 4,4 0 0,0 4,4 h  8 c 2,0 3,1 4,2 l 4,4 c 1,1 2,2 4,2 h 12 c 2,0 3,-1 4,-2 l 4,-4 c 1,-1 2,-2 4,-2 H ${ size.width - size.cornerRadius } a 4,4 0 0,1 4,4 v ${ size.bottomHeight }  a 4,4 0 0,1 -4,4 '
      const end = [
        ' H ${ size.caveRight } c -2,0 -3,1 -4,2 l -4,4 c -1,1 -2,2 -4,2 h -12 c -2,0 -3,-1 -4,-2 l -4,-4 c -1,-1 -2,-2 -4,-2 H 4 a 4,4 0 0,1 -4,-4 z`',
        ' H 4 a 4,4 0 0,1 -4,-4 z`'
      ]

      const _dfunc = new Function('size', 'return ' + d + (option.end ? end[1] : end[0]))
      $elem.attr('d', _dfunc(boundbox))

      option.stroke && $elem.attr('stroke', option.stroke)
      option.fill && $elem.attr('fill', option.fill)
      option.opacity && $elem.attr('fill-opacity', option.opacity)
      $elem.addClass('ycBlockPath ycBlockBackground' + (option.classes ? (' ' + option.classes) : ''))

      // 绑定事件
      const bindEvents = [ycEvents.background]
      for (let evt of bindEvents.values()) {
        $elem.on(evt, ycEventFunctions[evt])
      }

      // 自定义事件
      $elem.on(ycEvents.resize, function (event, opt) {
        event.stopPropagation()

        let log = logPrefix(this, ycEvents.resize)
        if (!opt) {
          logger.warn(log + `opt is null`)
          return
        }

        opt.contentWidth = checkParameter(opt.contentWidth, yuchg.isNumber)
        opt.contentHeight = checkParameter(opt.contentHeight, yuchg.isNumber)
        opt.slotHeight = checkParameter(opt.slotHeight, yuchg.isNumber)

        boundbox = _size(boundbox, opt)

        const $this = $(this)
        $this.attr('d', _dfunc(boundbox))
        this.__boundbox = boundbox
      })

      // 计算大小
      path.__boundbox = boundbox
      return path
    },
    /**
     * C2型
     */
    cuptwo: function (option) {
      const path = document.createElementNS(ycSvgNS, 'path')
      const $elem = $(path)

      if (!option) {
        option = {}
      }

      const minContentWidth = ycCaveRight + 104
      const minContentHeight = 40
      const bottomHeight = 24
      const emptySlotHeight = 24
      const centerHeight = 24

      // 内部
      let boundbox = {
        caveRight: ycCaveRight,
        caveSecondRight: ycCaveSecondRight,
        cornerRadius: ycCornerRadius,
        width: minContentWidth + ycCornerRadius * 2,
        height: minContentHeight + ycCornerRadius * 2,
        contentWidth: minContentWidth,
        contentHeight: minContentHeight,
        slotHeight: [emptySlotHeight, emptySlotHeight],  // 含 ycCornerRadius * 2
        centerHeight: centerHeight,
        bottomHeight: bottomHeight,
        wholeHeight: minContentHeight + emptySlotHeight * 2 + centerHeight + bottomHeight + ycCornerRadius * 6
      }

      // 计算内容大小
      const _size = (box, opt) => {
        let _boundbox = Object.assign({}, box)
        if (!opt) {
          return _boundbox
        }

        let modify = false
        if (yuchg.isNumber(opt.contentWidth)) {
          modify = true
          _boundbox.contentWidth = Math.max(opt.contentWidth, minContentWidth)
        }

        if (yuchg.isNumber(opt.contentHeight)) {
          modify = true
          _boundbox.contentHeight = Math.max(opt.contentHeight, minContentHeight)
        }

        if (opt.slotHeight && yuchg.isArray(opt.slotHeight)) {
          modify = true
          _boundbox.slotHeight[0] = Math.max(opt.slotHeight[0], emptySlotHeight)
          _boundbox.slotHeight[1] = Math.max(opt.slotHeight[1], emptySlotHeight)
        }

        if (modify) {
          // 更新宽高
          _boundbox.width = _boundbox.contentWidth + _boundbox.cornerRadius * 2
          _boundbox.height = _boundbox.contentHeight + _boundbox.cornerRadius * 2
          _boundbox.wholeHeight = _boundbox.height + _boundbox.slotHeight[0] + _boundbox.centerHeight + _boundbox.slotHeight[1] + _boundbox.bottomHeight + ycCornerRadius * 4
        }

        return _boundbox
      }

      // 更新尺寸大小
      boundbox = _size(boundbox, option)

      const d = '`m 0,4 A 4,4 0 0,1 4,0 H 12 c 2,0 3,1 4,2 l 4,4 c 1,1 2,2 4,2 h 12 c 2,0 3,-1 4,-2 l 4,-4 c 1,-1 2,-2 4,-2 H ${ size.width - size.cornerRadius } a 4,4 0 0,1 4,4 v ${size.contentHeight}  a 4,4 0 0,1 -4,4 H ${size.caveSecondRight} c -2,0 -3,1 -4,2 l -4,4 c -1,1 -2,2 -4,2 h -12 c -2,0 -3,-1 -4,-2 l -4,-4 c -1,-1 -2,-2 -4,-2 h -8  a 4,4 0 0,0 -4,4 v ${size.slotHeight[0] - size.cornerRadius * 2} a 4,4 0 0,0 4,4 h  8 c 2,0 3,1 4,2 l 4,4 c 1,1 2,2 4,2 h 12 c 2,0 3,-1 4,-2 l 4,-4 c 1,-1 2,-2 4,-2 H ${size.width - size.cornerRadius} a 4,4 0 0,1 4,4 v ${size.centerHeight}  a 4,4 0 0,1 -4,4 H ${size.caveSecondRight} c -2,0 -3,1 -4,2 l -4,4 c -1,1 -2,2 -4,2 h -12 c -2,0 -3,-1 -4,-2 l -4,-4 c -1,-1 -2,-2 -4,-2 h -8  a 4,4 0 0,0 -4,4 v ${size.slotHeight[1] - size.cornerRadius * 2} a 4,4 0 0,0 4,4 h  8 c 2,0 3,1 4,2 l 4,4 c 1,1 2,2 4,2 h 12 c 2,0 3,-1 4,-2 l 4,-4 c 1,-1 2,-2 4,-2 H ${ size.width - size.cornerRadius } a 4,4 0 0,1 4,4 v ${ size.bottomHeight }  a 4,4 0 0,1 -4,4 '
      const end = [
        ' H ${ size.caveRight } c -2,0 -3,1 -4,2 l -4,4 c -1,1 -2,2 -4,2 h -12 c -2,0 -3,-1 -4,-2 l -4,-4 c -1,-1 -2,-2 -4,-2 H 4 a 4,4 0 0,1 -4,-4 z`',
        ' H 4 a 4,4 0 0,1 -4,-4 z`'
      ]

      const _dfunc = new Function('size', 'return ' + d + (option.end ? end[1] : end[0]))
      $elem.attr('d', _dfunc(boundbox))

      option.stroke && $elem.attr('stroke', option.stroke)
      option.fill && $elem.attr('fill', option.fill)
      option.opacity && $elem.attr('fill-opacity', option.opacity)
      $elem.addClass('ycBlockPath ycBlockBackground' + (option.classes ? (' ' + option.classes) : ''))


      // 绑定事件
      const bindEvents = [ycEvents.background]
      for (let evt of bindEvents.values()) {
        $elem.on(evt, ycEventFunctions[evt])
      }

      // 自定义事件
      $elem.on(ycEvents.resize, function (event, opt) {
        event.stopPropagation()

        let log = logPrefix(this, ycEvents.resize)
        if (!opt) {
          logger.warn(log + `opt is null`)
          return
        }

        opt.contentWidth = checkParameter(opt.contentWidth, yuchg.isNumber)
        opt.contentHeight = checkParameter(opt.contentHeight, yuchg.isNumber)

        if (yuchg.isArray(opt.slotHeight)) {
          opt.slotHeight[0] = checkParameter(opt.slotHeight[0], yuchg.isNumber)
          opt.slotHeight[1] = checkParameter(opt.slotHeight[1], yuchg.isNumber)
        } else {
          opt.slotHeight = null
        }

        boundbox = _size(boundbox, opt)

        const $this = $(this)
        $this.attr('d', _dfunc(boundbox))
        this.__boundbox = boundbox
      })

      // 计算大小
      path.__boundbox = boundbox
      return path
    },

    /*
     */
    slot: function (option) {
      const path = document.createElementNS(ycSvgNS, 'path')
      const $elem = $(path)

      if (!option) {
        option = {}
      }

      const minContentWidth = 84
      const minContentHeight = 40

      // 内部
      let boundbox = {
        caveRight: ycCaveRight,
        cornerRadius: ycCornerRadius,
        width: minContentWidth + ycCornerRadius * 2,
        height: minContentHeight + ycCornerRadius * 2,
        contentWidth: minContentWidth,
        contentHeight: minContentHeight
      }

      // 计算内容大小
      const _size = (box, opt) => {
        let _boundbox = Object.assign({}, box)
        if (!opt) {
          return _boundbox
        }

        let modify = false

        if (yuchg.isNumber(opt.contentWidth)) {
          modify = true
          _boundbox.contentWidth = Math.max(opt.contentWidth, minContentWidth)
        }

        if (yuchg.isNumber(opt.contentHeight)) {
          modify = true
          _boundbox.contentHeight = Math.max(opt.contentHeight, minContentHeight)
        }

        if (modify) {
          // 更新宽高
          _boundbox.width = _boundbox.contentWidth + _boundbox.cornerRadius * 2
          _boundbox.height = _boundbox.contentHeight + _boundbox.cornerRadius * 2
        }

        return _boundbox
      }

      // 更新尺寸大小
      boundbox = _size(boundbox, option)

      const d = '`m 0,4 A 4,4 0 0,1 4,0 H 12 c 2,0 3,1 4,2 l 4,4 c 1,1 2,2 4,2 h 12 c 2,0 3,-1 4,-2 l 4,-4 c 1,-1 2,-2 4,-2 H ${ size.width - size.cornerRadius } a 4,4 0 0,1 4,4 v ${ size.contentHeight } a 4,4 0 0,1 -4,4 H ${ size.caveRight } c -2,0 -3,1 -4,2 l -4,4 c -1,1 -2,2 -4,2 h -12 c -2,0 -3,-1 -4,-2 l -4,-4 c -1,-1 -2,-2 -4,-2 H 4 a 4,4 0 0,1 -4,-4 z`'
      const _dfunc = new Function('size', 'return ' + d)
      $elem.attr('d', _dfunc(boundbox))

      option.stroke && $elem.attr('stroke', option.stroke)
      option.fill && $elem.attr('fill', option.fill)
      option.opacity && $elem.attr('fill-opacity', option.opacity)
      $elem.addClass('ycBlockPath ycBlockBackground' + (option.classes ? (' ' + option.classes) : ''))

      // 绑定事件
      const bindEvents = [ycEvents.background]
      for (let evt of bindEvents.values()) {
        $elem.on(evt, ycEventFunctions[evt])
      }

      // 自定义事件
      $elem.on(ycEvents.resize, function (event, opt) {
        event.stopPropagation()
        let log = logPrefix(this, ycEvents.resize)
        if (!opt) {
          logger.warn(log + `opt is null`)
          return
        }
        opt.contentWidth = checkParameter(opt.contentWidth, yuchg.isNumber)
        opt.contentHeight = checkParameter(opt.contentHeight, yuchg.isNumber)
        boundbox = _size(boundbox, opt)
        const $this = $(this)
        $this.attr('d', _dfunc(boundbox))
        this.__boundbox = boundbox
      })

      path.__boundbox = boundbox
      return path
    },

    /*
     */
    roundRect: function (option) {
      let path = document.createElementNS(ycSvgNS, 'path')
      let $elem = $(path)

      if (!option) {
        option = {}
      }

      const minWidth = 40
      const minRadius = 16

      // 内部
      let boundbox = {
        width: minWidth,
        height: minRadius * 2,
        radius: minRadius,
        contentWidth: minWidth - minRadius * 2,
        contentHeight: minRadius * 2
      }

      // 计算内容大小
      const _size = (box, opt) => {
        let _boundbox = Object.assign({}, box)
        if (!opt) {
          return _boundbox
        }

        let modify = false
        if (yuchg.isNumber(opt.height)) {
          modify = true
          _boundbox.radius = Math.max(opt.height / 2, minRadius)
        }

        if (yuchg.isNumber(opt.width)) {
          modify = true
          _boundbox.width = Math.max(opt.width, minWidth)
        }

        if (modify) {
          _boundbox.height = _boundbox.radius * 2
          _boundbox.contentWidth = _boundbox.width - _boundbox.height
        }

        return _boundbox
      }
      boundbox = _size(boundbox, option)

      const d = '`m 0,0 m ${size.radius},0 H ${size.radius + size.contentWidth} a ${size.radius} ${size.radius} 0 0 1 0 ${size.radius * 2} H ${size.radius} a ${size.radius} ${size.radius} 0 0 1 0 ${size.radius * -2} z`'
      const _dfunc = new Function('size', 'return ' + d)
      $elem.attr('d', _dfunc(boundbox))

      option.stroke && $elem.attr('stroke', option.stroke)
      option.fill && $elem.attr('fill', option.fill)
      option.opacity && $elem.attr('fill-opacity', option.opacity)
      $elem.addClass('ycBlockPath ycBlockBackground' + (option.classes ? (' ' + option.classes) : ''))

      // 绑定事件
      const bindEvents = [ycEvents.background]
      for (let evt of bindEvents.values()) {
        $elem.on(evt, ycEventFunctions[evt])
      }

      // 自定义事件
      $elem.on(ycEvents.resize, function (event, opt) {
        event.stopPropagation()

        const log = logPrefix(this, ycEvents.resize)
        if (!opt) {
          logger.warn(log + `opt is null`)
          return
        }

        opt.width = checkParameter(opt.width, yuchg.isNumber)
        opt.height = checkParameter(opt.height, yuchg.isNumber)
        boundbox = _size(boundbox, opt)
        const $this = $(this)
        $this.attr('d', _dfunc(boundbox))
        this.__boundbox = boundbox
      })

      path.__boundbox = boundbox
      return path
    },

    /*
     */
    diamondRect: function (option) {
      let path = document.createElementNS(ycSvgNS, 'path')
      let $elem = $(path)
      const minWidth = 40
      const minSide = 16

      if (!option) {
        option = {}
      }

      // 内部
      let boundbox = {
        width: minWidth,
        height: minSide * 2,
        side: minSide,
        contentWidth: minWidth - minSide * 2,
        contentHeight: minSide * 2
      }

      // 计算内容大小
      const _size = (box, opt) => {
        let _boundbox = Object.assign({}, box)
        if (!opt) {
          return _boundbox
        }

        let modify = false
        if (yuchg.isNumber(opt.height)) {
          modify = true
          _boundbox.side = Math.max(opt.height / 2, minSide)
        }

        if (yuchg.isNumber(opt.width)) {
          _boundbox.width = Math.max(opt.width, minWidth)
        }

        if (modify) {
          _boundbox.height = _boundbox.side * 2
          _boundbox.contentWidth = _boundbox.width - _boundbox.height
        }

        return _boundbox
      }

      boundbox = _size(boundbox, option)

      const d = '`m 0,0 m ${size.side},0 H ${size.side + size.contentWidth} l ${size.side} ${size.side} l ${-size.side} ${size.side} H ${size.side} l ${-size.side} ${-size.side} l ${size.side} ${-size.side} z`'
      const _dfunc = new Function('size', 'return ' + d)
      $elem.attr('d', _dfunc(boundbox))

      option.stroke && $elem.attr('stroke', option.stroke)
      option.fill && $elem.attr('fill', option.fill)
      option.opacity && $elem.attr('fill-opacity', option.opacity)
      $elem.addClass('ycBlockPath ycBlockBackground' + (option.classes ? (' ' + option.classes) : ''))

      // 绑定事件
      const bindEvents = [ycEvents.background]
      for (let evt of bindEvents.values()) {
        $elem.on(evt, ycEventFunctions[evt])
      }

      // 自定义事件
      $elem.on(ycEvents.resize, function (event, opt) {
        event.stopPropagation()
        const log = logPrefix(this, ycEvents.resize)

        if (!opt) {
          logger.warn(log + `opt is null`)
          return
        }

        opt.width = checkParameter(opt.width, yuchg.isNumber)
        opt.height = checkParameter(opt.height, yuchg.isNumber)

        boundbox = _size(boundbox, opt)
        const $this = $(this)
        $this.attr('d', _dfunc(boundbox))
        this.__boundbox = boundbox
      })
      path.__boundbox = boundbox
      return path
    },
    /*
     {
     stroke:  '#000000'  // 线条颜色
     fill: '#000000'  // 填充色
     opacity: '0.2'   // 透明度
     classes: ''
     }
     */
    marker: function (option) {
      let path = document.createElementNS(ycSvgNS, 'path')
      let $elem = $(path)
      $elem.attr('stroke', option.stroke)
      $elem.attr('fill', option.fill)
      $elem.attr('fill-opacity', option.opacity)
      $elem.addClass('ycBlockPath ycBlockBackground' + (option.classes ? (' ' + option.classes) : ''))
      return path
    }
  },
  group: {

    /*
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

      return g
    },
    /*
     */
    editableText: function (option) {
      let g = document.createElementNS(ycSvgNS, 'g')
      let $elem = $(g)
      $elem.attr('transform', `translate(${option.translatex ? option.translatex : 4}, ${option.translatey ? option.translatey : 0})`)
      $elem.addClass('ycBlockEditableText')

      let $text = ShapeUtils.base.text(option)
      $elem.append($text)

      // 自定义事件
      $elem.on(ycEvents.positionText, function (event, opt) {
        event.stopPropagation()
        const $this = $(this)
        const log = logPrefix(this, ycEvents.positionText)
        if (!opt) {
          logger.warn(log + 'opt is null')
          return
        }

        let tx = 0
        let ty = 0
        if (opt.translatex) {
          if (!yuchg.isNumber(opt.translatex)) {
            logger.warn(log + `translatex is not number`)
          } else {
            tx = opt.translatex
          }
        }
        if (opt.translatey) {
          if (opt.translatey && !yuchg.isNumber(opt.translatey)) {
            logger.warn(log + `translatey is not number`)
          } else {
            ty = opt.translatey
          }
        }
        $this.attr('transform', `translate(${tx}, ${ty})`)

        // 向下传递
        let $thistext = $this.children('text')
        $thistext.trigger(ycEvents.positionText, [{
          x: opt.x,
          y: opt.y
        }])
      }).on(ycEvents.change, function (event, v) {
        event.stopPropagation()
        const $this = $(this)
        let $thistext = $this.children('text')
        $thistext.trigger(ycEvents.change, [v])
      })

      return g
    },
    /*
     */
    image: function (option) {
      let g = document.createElementNS(ycSvgNS, 'g')
      let $elem = $(g)
      $elem.attr('transform', `translate(${option.translatex ? option.translatex : 0}, ${option.translatey ? option.translatey : 0})`)

      let img = ShapeUtils.base.image(option)
      $elem.append(img)

      // 绑定事件
      const bindEvents = [ycEvents.position]
      for (let evt of bindEvents.values()) {
        $elem.on(evt, ycEventFunctions[evt])
      }

      $elem.on(ycEvents.changeImage, function (event, opt) {
        event.stopPropagation()
        let $this = $(this)
        let $thisimg = $this.children('image')

        // 向下传递
        $thisimg.trigger(ycEvents.changeImage, opt)
      })

      return g
    }
  },
  base: {
    /*
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

      // 绑定事件
      const bindEvents = [ycEvents.positionText]
      for (let evt of bindEvents.values()) {
        $elem.on(evt, ycEventFunctions[evt])
      }

      $elem.on(ycEvents.change, function (event, v) {
        event.stopPropagation()

        const $this = $(this)
        const log = logPrefix(this, ycEvents.change)

        if (v) {
          if (!yuchg.isString(v)) {
            logger.warn(log + 'value is not string')
          } else {
            $this.html('' + v)
          }
        }
      })
      return text
    },

    /*
     */
    group: function (option) {
      let g = document.createElementNS(ycSvgNS, 'g')
      let $elem = $(g)
      // 绑定事件
      const bindEvents = [ycEvents.position]
      for (let evt of bindEvents.values()) {
        $elem.on(evt, ycEventFunctions[evt])
      }
      return g
    },
    /*
    适用于number boolean类型
      */
    arguGroup: function (option) {
      let g = document.createElementNS(ycSvgNS, 'g')
      let $elem = $(g)
      option.type && $elem.attr('data-argument-type', option.id)
      option.shape && $elem.attr('data-shape', option.shape)
      $elem.attr('transform', `translate(${option.translatex ? option.translatex : 0}, ${option.translatey ? option.translatey : 0})`)

      // 绑定事件
      const bindEvents = [ycEvents.position]
      for (let evt of bindEvents.values()) {
        $elem.on(evt, ycEventFunctions[evt])
      }

      // 自定义事件
      $elem.on(ycEvents.background, function (event, opt) {
        event.stopPropagation()

        const $this = $(this)
        const $path = $this.children('path')
        const log = `arguGroup ${ycEvents.background} event: `
        if (!opt) {
          logger.warn(log + 'opt is null')
          return
        }

        if (opt.stroke) {
          if (!yuchg.isString(opt.stroke)) {
            logger.warn(log + `stroke is not string`)
          } else {
            $path.attr('stroke', opt.stroke)
          }
        }

        if (opt.fill) {
          if (!yuchg.isString(opt.fill)) {
            logger.warn(log + `fill is not string`)
          } else {
            $path.attr('fill', opt.stroke)
          }
        }

        if (opt.opacity) {
          if (!yuchg.isNumber(+opt.opacity)) {
            logger.warn(log + `opacity is not number`)
          } else {
            $path.attr('fill-opacity', opt.opacity)
          }
        }
      })
      return g
    },

    /*
     */
    rect: function (option) {
      let rect = document.createElementNS(ycSvgNS, 'rect')
      let $rect = $(rect)

      let radius = option.radius ? option.radius : 4
      $rect.attr('rx', radius)
      $rect.attr('ry', radius)
      $rect.attr('width', option.width ? option.width : 0)
      $rect.attr('height', option.height ? option.height : 0)
      option.stroke && $rect.attr('stroke', option.stroke)
      option.fill && $rect.attr('fill', option.fill)
      option.opacity && $rect.attr('fill-opacity', option.opacity)
      $rect.addClass('ycBlockBackground')

      // 绑定事件
      const bindEvents = [ycEvents.resize, ycEvents.background]
      for (let evt of bindEvents.values()) {
        $rect.on(evt, ycEventFunctions[evt])
      }

      return rect
    },
    /*
     */
    image: function (option) {
      let img = document.createElementNS(ycSvgNS, 'image')
      let $img = $(img)

      $img.attr('height', option.width ? option.width : 0)
      $img.attr('width', option.height ? option.height : 0)
      $img.attr('transform', 'translate(0,0)')
      img.href.baseVal = option.url

      // 绑定事件
      const bindEvents = [ycEvents.resize, ycEvents.position, ycEvents.changeImage]
      for (let evt of bindEvents.values()) {
        $img.on(evt, ycEventFunctions[evt])
      }

      return img
    }
  }
}

export default ShapeUtils