import yuchg from '../base'
import {
  utils
} from 'mocha';

// 缺省文字字体大小
const ycFontSize = 12 // ASCII
const ycUnicodeFontSize = 16 // UNICODE

const Utils = {
  // 计算文字长度
  computeTextLength: function (txt) {
    // 根据文字计算长度
    if (!yuchg.isString(txt) || txt === '') {
      return 0
    }

    let length = txt.length * ycFontSize
    let bytes = yuchg.strByteLength(txt) - txt.length
    length += bytes * (ycUnicodeFontSize - ycFontSize)
    return length
  },

  // 包围盒相交
  // v代表垂直距离，h代表水平距离
  isIntersects: function (box1, box2, vdist = 0, hdist = 0) {
    let nbox1 = Utils.normalizeBoundbox(box1)
    let nbox2 = Utils.normalizeBoundbox(box2)
    let v = yuchg.isNumber(vdist) ? Math.max(vdist, 0) : 0
    let h = yuchg.isNumber(hdist) ? Math.max(hdist, 0) : 0

    // AABB相交检测
    if (
      nbox1.left > (nbox2.right + h) ||
      nbox1.right < (nbox2.left - h) ||
      nbox1.top > (nbox2.bottom + v) ||
      nbox1.bottom < (nbox2.top - v)) {
      return false
    }

    return true
  },

  /**
   * 
   */
  isContains: function (box, point, vdist = 0, hdist = 0) {
    let nbox = Utils.normalizeBoundbox(box)
    let v = yuchg.isNumber(vdist) ? Math.max(vdist, 0) : 0
    let h = yuchg.isNumber(hdist) ? Math.max(hdist, 0) : 0

    // AABB相交检测
    if (
      point.x > (nbox.right + h) ||
      point.x < (nbox.left - h) ||
      point.y > (nbox.bottom + v) ||
      point.y < (nbox.top - v)) {
      return false
    }

    return true
  },

  //
  normalizeBoundbox(box) {
    let newbox = Object.assign({}, box)
    if (box.left > box.right) {
      newbox.left = box.right
      newbox.right = box.left
    }
    if (box.top > box.bottom) {
      newbox.top = box.bottom
      newbox.bottom = box.top
    }
    return newbox
  },

  // 计算AABB Rect
  boundRect(x, y, width, height, zoomx, zoomy) {
    let zx = yuchg.isNumber(zoomx) ? zoomx : 1.0
    let zy = yuchg.isNumber(zoomy) ? zoomy : 1.0
    return {
      left: x / zx,
      top: y / zy,
      right: (x / zx + width),
      bottom: (y / zy + height)
    }
  },

  /**
   * 平移
   */
  translateRect(rect, offsetx, offsety) {
    return {
      left: rect.left + offsetx,
      top: rect.top + offsety,
      right: rect.right + offsetx,
      bottom: rect.bottom + offsety
    }
  },

  /**
   * 清空子节点
   * @param {*} elem 
   */
  domClearChildren(elem) {
    while (elem.firstChild) {
      elem.removeChild(elem.firstChild)
    }
  },

  /**
   * 返回直接子节点元素
   * @param {*} sel 
   */
  domChildrenByTagName(elem, tag) {
    var objChild = []
    var objs = elem.getElementsByTagName(tag)
    for (let obj of objs) {
      if (obj.nodeType !== 1) {
        continue
      }
      var temp = objs.parentNode
      if (temp.nodeType === 1) {
        if (temp === elem) {
          objChild.push(obj)
        }
      } else if (temp.parentNode === obj) {
        objChild.push(obj)
      }
    }
    return objChild
  },

  /**
   * 返回第一级子节点
   * @param {*} obj 
   */
  domChildren(elem) {
    return utils.domQuerySelectByTagName(elem, '*')
  }
}

export default Utils