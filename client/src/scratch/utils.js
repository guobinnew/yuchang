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
  }
}

export default Utils
