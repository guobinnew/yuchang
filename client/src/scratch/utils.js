import yuchg from '../base'

// 缺省文字字体大小
const ycFontSize = 12 // ASCII
const ycUnicodeFontSize = 16 // UNICODE

const Utils = {
  // 计算文字长度
  computeTextLength: function(txt) {
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
  isIntersects: function(box1, box2, vdist = 0, hdist = 0) {
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
  }
}

export default Utils
