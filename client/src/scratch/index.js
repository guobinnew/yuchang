import Panel from './panel'

const Scratch = {
  /**
   * 初始化编辑面板
   * dom: 用于绘制面板的DOM节点
   */
  init: function (dom, err) {
    if (!dom) {
      err && err('dom is invalid')
      return
    }
    return new Panel(dom)
  }
}

export default Scratch
