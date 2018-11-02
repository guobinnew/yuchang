import $ from 'jquery'
import yuchg from '../base'
import logger from '../logger'
import ShapeUtils from './shapes'
import Utils from './utils'

// 参数基本定义
const ArgumentDefs = {
  number: {
    name: '数值',
    shape: 'round',
    data: {
      background: {
        stroke: '#333333',
        fill: '#FFFFFF',
        opacity: '1'
      }
    }
  },
  string: {
    name: '字符串',
    shape: 'round',
    data: {
      background: {
        stroke: '#333333',
        fill: '#FFFFFF',
        opacity: '1'
      }
    }
  },
  boolean: {
    name: '布尔值',
    shape: 'diamond',
    data: {
      background: {
        chameleon: true,
        stroke: '#333333',
        fill: '#FFFFFF',
        opacity: '1'
      }
    }
  },
  enum: {
    name: '枚举值',
    shape: 'round',
    data: {
      background: {
        chameleon: true,
        stroke: '#333333',
        fill: '#FFFFFF',
        opacity: '1'
      },
      space: 4,
      button: {
        url: '/img/dropdown-arrow.svg',
        width: 12,
        height: 12
      }
    }
  }
}

/*
Argument
*/
class Argument {
  constructor(option) {
    this.section = option
  }

  /**
   * 计算文字长度
   */
  textWidth(text) {
    const parent = this.section.dom.__panel.dom.canvas
    let t = ShapeUtils.base.text({
      text: text
    })
    t.style.visibility = 'hidden'
    parent.appendChild(t)
    let w = t.getComputedTextLength()
    t.remove()
    return w
  }

  /**
   * 获取data-属性
   * @param {*} key 
   */

  data(key) {
    if (!key) {
      return null
    }
    return this.section.dom.getAttribute('data-' + key)
  } 

  /**
   * 将Section封装为一个Argument对象
   * @param {*} section 
   */

  static argument(section) {
    if (section.type !== 'argument') {
      logger.warn(`Argument wrapper failed: invalid param --`, section)
      return null
    }
    if (section.datatype === 'string') {
      return new ArgumentText(section)
    } else if (section.datatype === 'number') {
      return new ArgumentNumber(section)
    } else if (section.datatype === 'boolean') {
      return new ArgumentBool(section)
    } else if (section.datatype === 'enum') {
      return new ArgumentEnum(section)
    } else {
      logger.warn(`Argument wrapper failed: invalid datatype --`, section)
    }
    return null
  }

  static createContainer(def) {
    // 创建顶层group
    const elem = ShapeUtils.base.group()
    const $elem = $(elem)

    const props = ['shape', 'argument-type']
    for (let i of props) {
      let v = def[i]
      if (!yuchg.isString(v)) {
        logger.warn(`Argument createContainer failed: ${i} is not string --`, v)
      } else {
        elem.setAttribute('data-' + i, v)
      }
    }

    let opt = $.extend(true, {}, def.data.size, def.data.background)

    let shape = null
    if (def.shape === 'round') {
      shape = ShapeUtils.path.roundRect(opt)
    } else if (def.shape === 'diamond') {
      shape = ShapeUtils.path.diamondRect(opt)
    } else {
      // 默认类型round
      shape = ShapeUtils.path.roundRect(opt)
    }
    elem.appendChild(shape)

    // 绑定事件
    $elem.on(ShapeUtils.events.background, function (event, opt) {
      event.stopPropagation()
      let $shape = $(this).children('path')
      $shape.trigger(ShapeUtils.events.background, [opt])
    })

    return elem
  }

  static createElement(def) {
    if (!yuchg.isObject(def)) {
      logger.warn('Argument createElement failed: param is invalid --', def)
      return
    }

    // 获取参数定义
    const _def = ArgumentDefs[def.datatype]
    if (!_def) {
      logger.warn('Argument createElement failed: id is invalid --', def)
      return
    }
    def.name = _def.name
    def.shape = _def.shape
    def['argument-type'] = def.datatype
    if (yuchg.isObject(_def.data)) {
      def.data = $.extend(true, {
        size: { // 尺寸设置
          minWidth: 40, // 最小宽度
          minHeight: 32,
          width: 40,
          height: 32
        }
      }, _def.data, def.data)
    }

    if (yuchg.isNull(def.data)) {
      def.data = {}
    }

    let elem = null
    if (def.datatype === 'string') {
      elem = ArgumentText.createElement(def)
    } else if (def.datatype === 'number') {
      elem = ArgumentNumber.createElement(def)
    } else if (def.datatype === 'boolean') {
      elem = ArgumentBool.createElement(def)
    } else if (def.datatype === 'enum') {
      elem = ArgumentEnum.createElement(def)
    } else {
      logger.warn(`addArgument failed: unkown argument type -- ${def.datatype}`)
    }

    return elem
  }

  /**
   * 位移
   */
  translate(x, y) {
    $(this.section.dom).trigger(ShapeUtils.events.position, [{
      translatex: x,
      translatey: y
    }])
  }

  /**
   * 包围盒（canvas坐标下）
   */
  boundRect(offsetx, offsety) {
    const $path = $(this.section.dom).children('path.ycBlockBackground')
    const bbox = $path[0].getBBox()
    const m = this.section.dom.getCTM()

    return Utils.boundRect(
      Number(m.e) + offsetx,
      Number(m.f) + offsety,
      bbox.width,
      bbox.height,
      Number(m.a),
      Number(m.d)
    )
  }

  /**
   * 设置高亮
   * @param {*} enable 
   */
  highlight(enable = true) {
    const $path = $(this.section.dom).children('path.ycBlockBackground')
    $path.attr('filter', enable ? 'url(#ycBlockReplacementGlowFilter)' : '')
  }

  show() {
    this.section.dom.setAttribute('visibility', 'visible')
  }

  hide() {
    this.section.dom.setAttribute('visibility', 'hidden')
  }

  /**
   * 调整布局
   */
  adjust() {}
}

class ArgumentText extends Argument {
  constructor(option) {
    super(option)
  }

  static createElement(def) {
    // 获取
    let elem = Argument.createContainer(def)
    let $elem = $(elem)

    if (!yuchg.isString(def.data.value)) {
      def.data.value = ''
    }

    let text = ShapeUtils.group.editableText({
      text: def.data.value
    })
    $elem.append(text)

    return elem
  }

  adjust() {
    const $dom = $(this.section.dom)
    const data = this.section.data

    // 设置文字
    let $text = $dom.children('.ycBlockEditableText')
    $text.trigger(ShapeUtils.events.change, ['' + data.value])

    // 根据文字计算长度
    let padding = data.size.height / 2
    let length = this.textWidth('' + data.value)
    data.size.width = Math.max(length + padding * 2, data.size.minWidth)

    // 调整尺寸
    let $shape = $dom.children('path')
    $shape.trigger(ShapeUtils.events.resize, [{
      width: data.size.width,
      height: data.size.height
    }])

    // 更新大小
    data.size.width = $shape[0].__boundbox.width
    data.size.height = $shape[0].__boundbox.height

    // 调整文字位置
    $text.trigger(ShapeUtils.events.positionText, [{
      x: data.size.width / 2,
      y: 0,
      translatex: 0,
      translatey: data.size.height / 2
    }])
  }
}

class ArgumentNumber extends Argument {
  constructor(option) {
    super(option)
  }

  static createElement(def) {
    const elem = Argument.createContainer(def)
    const $elem = $(elem)

    if (!yuchg.isNumber(def.data.value)) {
      def.data.value = 0
    }
    let text = ShapeUtils.group.editableText({
      text: '' + def.data.value
    })
    $elem.append(text)

    return elem
  }

  adjust() {
    const $dom = $(this.section.dom)
    const data = this.section.data

    // 设置文字
    let $text = $dom.children('.ycBlockEditableText')
    $text.trigger(ShapeUtils.events.change, ['' + data.value])

    // 根据文字计算长度
    let padding = data.size.height / 2
    let length = this.textWidth('' + data.value)
    data.size.width = Math.max(length + padding * 2, data.size.minWidth)

    // 调整尺寸
    let $shape = $dom.children('path')
    $shape.trigger(ShapeUtils.events.resize, [{
      width: data.size.width,
      height: data.size.height
    }])

    // 更新大小
    data.size.width = $shape[0].__boundbox.width
    data.size.height = $shape[0].__boundbox.height

    // 调整文字位置
    $text.trigger(ShapeUtils.events.positionText, [{
      x: data.size.width / 2,
      y: 0,
      translatex: 0,
      translatey: data.size.height / 2
    }])
  }
}

class ArgumentBool extends Argument {
  constructor(option) {
    super(option)
  }

  static createElement(def) {
    def.data = $.extend(true, def.data, {
      size: {
        minWidth: 48,
        width: 48
      }
    })
    let elem = Argument.createContainer(def)

    if (!yuchg.isBoolean(def.data.value)) {
      def.data.value = false
    }
    return elem
  }

  adjust() {
    const $dom = $(this.section.dom)
    const data = this.section.data

    let $shape = $dom.children('path')
    $shape.trigger(ShapeUtils.events.resize, [{
      width: data.size.width,
      height: data.size.height
    }])

    // 更新大小
    data.size.width = $shape[0].__boundbox.width
    data.size.height = $shape[0].__boundbox.height
  }
}

class ArgumentEnum extends Argument {
  constructor(option) {
    super(option)
  }

  static createElement(def) {
    let elem = Argument.createContainer(def)
    let $elem = $(elem)

    if (!yuchg.isArray(def.data.values)) {
      def.data.values = [{
        name: '空',
        value: -1
      }]
    }

    if (!yuchg.isNumber(def.data.currentIndex) || def.data.currentIndex >= def.data.values.length) {
      def.data.currentIndex = 0
    }

    // 文字
    let text = def.data.values[def.data.currentIndex]
    $elem.append(ShapeUtils.base.text({
      text: text
    }))

    // 下拉按钮
    $elem.append(ShapeUtils.base.image(def.data.button))
    return elem
  }

  adjust() {
    const $dom = $(this.section.dom)
    const data = this.section.data

    let $text = $dom.children('text')
    let currentText = data.values[data.currentIndex].name
    $text.trigger(ShapeUtils.events.change, [currentText])

    // 根据文字计算最大长度
    let length = 0
    let padding = data.size.height / 2
    for (let item of data.values) {
      length = Math.max(this.textWidth('' + item.name), length)
    }
    length += data.button.width // 按钮宽度
    length += data.space // 间距
    data.size.width = Math.max(length + padding * 2, data.size.minWidth)

    let $shape = $dom.children('path')
    $shape.trigger(ShapeUtils.events.resize, [{
      width: data.size.width,
      height: data.size.height
    }])

    // 更新大小
    data.size.width = $shape[0].__boundbox.width
    data.size.height = $shape[0].__boundbox.height

    // 更新文字位置
    padding = data.size.height / 2
    length = this.textWidth('' + currentText)
    $text.trigger(ShapeUtils.events.positionText, [{
      x: length / 2,
      y: 0,
      translatex: padding,
      translatey: padding
    }])

    // 更新按钮位置
    let $image = $dom.children('image')
    $image.trigger(ShapeUtils.events.position, [{
      translatex: data.size.width - padding - data.button.width / 2,
      translatey: (data.size.height - data.button.height) / 2
    }])
  }
}

export default Argument