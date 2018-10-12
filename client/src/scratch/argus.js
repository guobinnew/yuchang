import $ from 'jquery'
import * as d3 from "d3"
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
        stroke: '#333333',
        fill: '#FFFFFF',
        opacity: '1'
      },
      button: {
        url: '/img/dropdown-arrow.be850da5.svg',
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
    const $parent = $(this.section.dom.__panel.dom.canvas)
    let t = ShapeUtils.base.text({
      text: text
    })
    $(t).css('visibility', 'hidden')
    $parent.append(t)
    let w = t.getComputedTextLength()
    t.remove()
    return w
  }

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
        $elem.attr('data-' + i, v)
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
    $elem.append(shape)

    return elem
  }

  static createElement(def) {
    if (!yuchg.isObject(def)) {
      logger.warn('Argument createElement failed: param is invalid --', def)
      return
    }

    // 获取参数定义
    let _def = ArgumentDefs[def.datatype]
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
    let $dom = $(this.section.dom)
    $dom.trigger(ShapeUtils.events.position, [{
      translatex: x,
      translatey: y
    }])
  }

  /**
   * 调整布局
   */
  adjust() {

  }
}

class ArgumentText extends Argument {
  constructor(option) {
    super(option)
  }

  static createElement(def) {
    // 获取
    let elem = Argument.createContainer(def)
    let $elem = $(elem)
    const state = def.state

    if (!yuchg.isString(state.data.value)) {
      state.data.value = ''
    }

    let text = ShapeUtils.group.editableText({
      text: state.data.value
    })
    $elem.append(text)

    return elem
  }

  adjust() {
    const $dom = $(this.section.dom)
    const data = this.section.data

    // 设置文字
    let $text = $dom.children('.ycBlockEditableText')
    $text.trigger(ShapeUtils.events.change, [data.value])

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
    let elem = Argument.createContainer(def)
    let $elem = $(elem)
   
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
    def.data = $.extend(true, {
      size: {
        minWidth: 16
      }
    }, def.state)
    let elem = Argument.createContainer(def)
    const state = def.state
    if (!yuchg.isBoolean(state.data.value)) {
      state.data.value = false
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
    const state = this.def.state

    if (!yuchg.isArray(state.data.values)) {
      state.data.values = [
        { name: '空', value: -1 }
      ]
    }

    if (!yuchg.isNumber(state.data.currentIndex) || state.data.currentIndex >= state.data.values.length) {
      state.data.currentIndex = 0
    }

    // 文字
    let text = state.data.values[state.data.currentIndex]
    $elem.append(ShapeUtils.base.text({
      text: text
    }))

    // 下拉按钮
    $elem.append(ShapeUtils.base.image(state.data.button))
    return elem
  }

  adjustData(option) {
    const $dom = $(option.dom)
    const state = option.state

    let $text = $dom.children('text')
    $text.trigger(ShapeUtils.events.change, [state.data.values[state.data.currentIndex]])
  }

  adjust(option) {
    const $dom = $(this.section.dom)
    const data = this.section.data

    // 根据文字计算最大长度
    let length = 0
    let padding = data.size.height / 2
    for (let item of option.state.data.values) {
      length = Math.max(this.textWidth('' + item.name), length)
    }
    length += data.button.width // 按钮宽度
    data.size.width = Math.max(length + padding * 2, data.size.minWidth)

    let $shape = $dom.children('path')
    $shape.trigger(ShapeUtils.events.resize, [{
      width: data.size.width,
      height: data.size.height
    }])

    // 更新大小
    data.size.width = $shape[0].__boundbox.width
    data.size.height = $shape[0].__boundbox.height
  
    let $text = $dom.children('text')
    $text.trigger(ShapeUtils.events.positionText, [{
      x: data.size.width / 2,
      y: 0,
      translatex: 0,
      translatey: data.size.height / 2
    }])
  }
}

export default Argument
