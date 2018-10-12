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
  constructor(section) {
  }

  static argument(section) {
    if (section.type !== 'argument') {
      logger.warn(`Argument wrapper failed: invalid param --`, section)
      return null
    }
    if (section.datatype === 'string') {
      return new ArgumentText(section)
    } else if (section.datatype === 'number') {
      return new ArgumentText(section)
    } else if (section.datatype === 'boolean') {
      return new ArgumentText(section)
    } else if (section.datatype === 'enum') {
      return new ArgumentText(section)
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

    let opt = $.extend(true, {}, def.data.background)

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
      def.data = $.extend(true, _def.data, def.data)
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
   * 获取尺寸
   */
  size() {

  }

  /**
   * 根据state调整布局
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
    let opt = $.extend(true, ArgumentDefs['text'])
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

  createElement() {
    let elem = this.createContainer()
    let $elem = $(elem)
    const state = this.def.state

    if (!yuchg.isString(state.data.value)) {
      state.data.value = ''
    }

    let text = ShapeUtils.group.editableText({
      text: state.data.value
    })
    $elem.append(text)

    return elem
  }

  adjustData(option) {
    const $dom = $(option.dom)
    const state = option.state

    let $text = $dom.children('text')
    $text.trigger(ShapeUtils.events.change, [state.data.value])
  }

  adjust(option) {
    const $dom = $(option.dom)
    const padding = this.padding(option)
    const state = option.state

    // 根据文字计算长度
    let length = Utils.computeTextLength(state.data.value)
    state.size.contentWidth = Math.max(length, state.size.minContentWidth)
    state.size.width = state.size.contentWidth + padding.left + padding.right

    let $shape = $dom.children('path')
    $shape.trigger(ShapeUtils.events.resize, [{
      width: state.size.width,
      height: state.size.height
    }])

    // 更新大小
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

  adjustData(option) {
    const $dom = $(option.dom)
    const state = option.state

    let $text = $dom.children('text')
    $text.trigger(ShapeUtils.events.change, ['' + state.data.value])
  }

  adjust(option) {
    const $dom = $(option.dom)
    const padding = this.padding(option)
    const state = option.state

    // 根据文字计算长度
    let length = Utils.computeTextLength('' + state.data.value)
    state.size.contentWidth = Math.max(length, state.size.minContentWidth)
    state.size.width = state.size.contentWidth + padding.left + padding.right

    let $shape = $dom.children('path')
    $shape.trigger(ShapeUtils.events.resize, [{
      width: state.size.width,
      height: state.size.height
    }])

    // 更新大小
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

class ArgumentBool extends Argument {
  constructor(option) {
    super(option)
  }

  static createElement(def) {
    def.state = $.extend(true, {
      size: {
        minContentWidth: 16,
        contentWidth: 16
      }
    }, def.state)
    let elem = Argument.createContainer(def)
    const state = def.state
    if (!yuchg.isBoolean(state.data.value)) {
      state.data.value = false
    }
    return elem
  }

  adjust(option) {
    const $dom = $(option.dom)
    const state = option.state

    let $shape = $dom.children('path')
    $shape.trigger(ShapeUtils.events.resize, [{
      width: state.size.width,
      height: state.size.height
    }])

    // 更新大小
    state.size.width = $shape[0].__boundbox.width
    state.size.height = $shape[0].__boundbox.height
    state.size.contentWidth = $shape[0].__boundbox.contentWidth
    state.size.contentHeight = $shape[0].__boundbox.contentHeight
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
    const $dom = $(option.dom)
    const padding = this.padding(option)
    const state = option.state

    // 根据文字计算最大长度
    let length = 0
    for (let item of option.state.data.values) {
      length = Math.max(Utils.computeTextLength(item.name), length)
    }
    length += state.data.button.width // 按钮宽度
    state.size.contentWidth = Math.max(length, state.size.minContentWidth)
    state.size.width = state.size.contentWidth + padding.left + padding.right

    let $shape = $dom.children('path')
    $shape.trigger(ShapeUtils.events.resize, [{
      width: state.size.width,
      height: state.size.height
    }])

    // 更新大小
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

export default Argument
