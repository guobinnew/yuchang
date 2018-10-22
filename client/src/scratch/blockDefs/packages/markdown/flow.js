
import logger from '../../../../logger'

// 唯一Id
let _mdUniqueId = 1
function _uniqueId () {
  return _mdUniqueId++
}

export default [
  {
    id: 'mk-flow',
    type: 'event',
    shape: 'cap',
    category: 'presentation',
    draggable: true,
    begin: true,
    state: {
      data: {
        sections: [
          {
            type: 'text',
            text: 'MarkDown 流程图'
          }
        ]
      }
    },
    export: [
      {
        menuItem: true, // 是否添加到菜单上
        menuName: '导出为MarkDown',
        fmt: 'markdown',
        ext: '.md',
        action: function() {
          // 导出为MD flow
          const fmt = 'markdown'
          // 遍历脚本树，先查找Block定义，如果没有则生成定义代码，如果有定义则生成flow代码
          let start = this.nextBlock()
          if (start.protoId() !== 'mk-flow-start') {
            logger.warn('MarkDown Export: first block is not <start> Block')
          }

          let cellmap = {}
          let instancemap = {}
          let defList = []
          let seqList = []
          let error = false
          let errorString = ''

          const _getCell = (instance, fmt) => {
            // 先检查map
            if (instancemap[instance.uid]) {
              return instancemap[instance.uid]
            }
            let cell = instance.export(fmt)
            cell = _indexCell(cell)
            if (cell) {
              instancemap[instance.uid] = cell
            }
            return cell
          }

          const _indexCell = (cell) => {
            if (!cell) {
              return null
            }

            if (cell.index > 0) {
              // 先检查是否已经定义过
              if (!cellmap[cell.index]) {
                cellmap[cell.index] = cell
                defList.push(cell.def)
              } else {
                // 检查之前声明是否类型匹配
                if (cellmap[cell.index].type !== cell.type) {
                  error = true
                  errorString = `导出失败: MarkDown Export failed: index [${cell.index}] has different type`
                }
                // 取之前的定义，因为后续的Block不用重复设置属性
                cell = cellmap[cell.index]
              }
            } else { // 添加定义
              defList.push(cell.def)
            }
            return cell
          }

          const _processBranch = (begin, end, prefix = []) => {
            let seq = []
            prefix.length > 0 && seq.push(prefix)

            let next = begin
            while (next) {
              let cell = _getCell(next, fmt)
              if (cell) {
                if (cell.type === 'c') {
                  seq.push(cell.name)
                  // 分解为三个分支
                  let end = next.nextBlock()
                  _processBranch(end)

                  let resolve = next.resolveBlock()
                  if (resolve) {
                    _processBranch(resolve, end, [cell.yes])
                  }

                  let reject = next.rejectBlock()
                  if (reject) {
                    _processBranch(reject, end, [cell.no])
                  }
                  break
                } else {
                  seq.push(cell.cell)
                }
              }
  
              // 中止处理
              if (error) {
                break
              }
              // 如果是条件分支
              next = next.nextBlock()
            }

            if (end) {
              let endcell = _getCell(end)
              seq.push(endcell.name)
            }

            seq.length > 0 && seqList.push(seq.join('->'))
          }

          _processBranch(start)

          // 如果出错，则返回
          if (error) {
            return errorString
          }

          let output = ''
          output += defList.join('\n')
          output += '\n'
          output += seqList.reverse().join('\n')

          return output
        }
      }
    ]
  },
  {
    id: 'mk-flow-start',
    type: 'action',
    shape: 'slot',
    category: 'presentation',
    draggable: true,
    state: {
      data: {
        sections: [
          {
            type: 'text',
            text: 'START'
          },
          {
            type: 'argument',
            datatype: 'number'
          },
          {
            type: 'text',
            text: 'TAG'
          },
          {
            type: 'argument',
            datatype: 'string',
            data: {
              value: '开始'
            }
          },
          {
            type: 'text',
            text: 'URL'
          },
          {
            type: 'argument',
            datatype: 'string'
          }
        ]
      }
    },
    export: [
      {
        fmt: 'markdown',
        ext: '.md',
        action: function() {
          let output = {
            type: 'st', // 类型
            index: 0, // 数字索引，必须 >0
            name: '',
            def: '', // 格式 st=>start: 开始:> http://www.baidu.com
            cell: '' // 格式 st
          }
          // 生成唯一变量名
          output.name = output.type + _uniqueId()
          output.index = this.sectionValue(1)
          // 获取title
          let title = this.sectionValue(3)
          output.def = `${output.name}=>start: ${title}`
          // 如果有超链接
          let url = this.sectionValue(5)
          if (url.length > 0) {
            output.def += `:> ${url}`
          }
          // cell格式
          output.cell = `${output.name}`
          return output
        }
      }
    ]
  },
  {
    id: 'mk-flow-end',
    type: 'action',
    shape: 'slot',
    category: 'presentation',
    draggable: true,
    end: true,
    state: {
      data: {
        sections: [
          {
            type: 'text',
            text: 'END'
          },
          {
            type: 'argument',
            datatype: 'number'
          },
          {
            type: 'text',
            text: 'TAG'
          },
          {
            type: 'argument',
            datatype: 'string',
            data: {
              value: '结束'
            }
          }
        ]
      }
    },
    export: [
      {
        fmt: 'markdown',
        ext: '.md',
        action: function() {
          let output = {
            type: 'e', // 类型
            index: 0, // 数字索引，必须 >0
            name: '',
            def: '', // 格式 e=>end: 开始
            cell: '' // 格式 e
          }
          // 生成唯一变量名
          output.name = output.type + _uniqueId()
          output.index = this.sectionValue(1)
          // 获取title
          let title = this.sectionValue(3)
          output.def = `${output.name}=>end: ${title}`
          // cell格式
          output.cell = `${output.name}`
          return output
        }
      }
    ]
  },
  {
    id: 'mk-flow-operation',
    type: 'action',
    shape: 'slot',
    category: 'presentation',
    draggable: true,
    state: {
      data: {
        sections: [
          {
            type: 'text',
            text: 'OP'
          },
          {
            type: 'argument',
            datatype: 'number'
          },
          {
            type: 'text',
            text: 'TAG'
          },
          {
            type: 'argument',
            datatype: 'string',
            data: {
              value: '程序'
            }
          },
          {
            type: 'text',
            text: 'URL'
          },
          {
            type: 'argument',
            datatype: 'string'
          },
          {
            type: 'argument',
            datatype: 'enum',
            data: {
              currentIndex: 3,
              values: [
                { name: 'left', value: 0 },
                { name: 'top', value: 1 },
                { name: 'right', value: 2 },
                { name: 'bottom', value: 3 }
              ]
            }
          }
        ]
      }
    },
    export: [
      {
        fmt: 'markdown',
        ext: '.md',
        action: function() {
          let output = {
            type: 'op', // 类型
            index: 0, // 数字索引，必须 >0
            name: '',
            def: '', // 格式 op=>operation: 程序:> http://www.baidu.com
            cell: '' // 格式 st(bottom)
          }
          // 生成唯一变量名
          output.name = output.type + _uniqueId()
          output.index = this.sectionValue(1)
          // 获取title
          let title = this.sectionValue(3)
          output.def = `${output.name}=>operation: ${title}`
          // 如果有超链接
          let url = this.sectionValue(5)
          if (url.length > 0) {
            output.def += `:> ${url}`
          }
          // cell格式
          let direction = this.sectionValue(6)
          output.cell = `${output.name}(${direction.name})`

          return output
        }
      }
    ]
  },
  {
    id: 'mk-flow-subroutine',
    type: 'action',
    shape: 'slot',
    category: 'presentation',
    draggable: true,
    state: {
      data: {
        sections: [
          {
            type: 'text',
            text: 'SUB'
          },
          {
            type: 'argument',
            datatype: 'number'
          },
          {
            type: 'text',
            text: 'TAG'
          },
          {
            type: 'argument',
            datatype: 'string',
            data: {
              value: '子程序'
            }
          },
          {
            type: 'text',
            text: 'URL'
          },
          {
            type: 'argument',
            datatype: 'string'
          },
          {
            type: 'argument',
            datatype: 'enum',
            data: {
              currentIndex: 3,
              values: [
                { name: 'left', value: 0 },
                { name: 'top', value: 1 },
                { name: 'right', value: 2 },
                { name: 'bottom', value: 3 }
              ]
            }
          }
        ]
      }
    },
    export: [
      {
        fmt: 'markdown',
        ext: '.md',
        action: function() {
          let output = {
            type: 'sub', // 类型
            index: 0, // 数字索引，必须 >0
            name: '',
            def: '', // 格式 sub=>subroutine: 子程序:> http://www.baidu.com
            cell: '' // 格式 sub(bottom)
          }
          // 生成唯一变量名
          output.name = output.type + _uniqueId()
          output.index = this.sectionValue(1)
          // 获取title
          let title = this.sectionValue(3)
          output.def = `${output.name}=>subroutine: ${title}`
          // 如果有超链接
          let url = this.sectionValue(5)
          if (url.length > 0) {
            output.def += `:> ${url}`
          }
          // cell格式
          let direction = this.sectionValue(6)
          output.cell = `${output.name}(${direction.name})`

          return output
        }
      }
    ]
  },
  {
    id: 'mk-flow-inputoutput',
    type: 'action',
    shape: 'slot',
    category: 'presentation',
    draggable: true,
    state: {
      data: {
        sections: [
          {
            type: 'text',
            text: 'I/O'
          },
          {
            type: 'argument',
            datatype: 'number'
          },
          {
            type: 'text',
            text: 'TAG'
          },
          {
            type: 'argument',
            datatype: 'string',
            data: {
              value: '输出'
            }
          },
          {
            type: 'text',
            text: 'URL'
          },
          {
            type: 'argument',
            datatype: 'string'
          },
          {
            type: 'argument',
            datatype: 'enum',
            data: {
              currentIndex: 3,
              values: [
                { name: 'left', value: 0 },
                { name: 'top', value: 1 },
                { name: 'right', value: 2 },
                { name: 'bottom', value: 3 }
              ]
            }
          }
        ]
      }
    },
    export: [
      {
        fmt: 'markdown',
        ext: '.md',
        action: function() {
          let output = {
            type: 'io', // 类型
            index: 0, // 数字索引，必须 >0
            name: '',
            def: '', // 格式 io=>inputoutput: 子程序:> http://www.baidu.com
            cell: '' // 格式 io(bottom)
          }
          // 生成唯一变量名
          output.name = output.type + _uniqueId()
          output.index = this.sectionValue(1)
          // 获取title
          let title = this.sectionValue(3)
          output.def = `${output.name}=>inputoutput: ${title}`
          // 如果有超链接
          let url = this.sectionValue(5)
          if (url.length > 0) {
            output.def += `:> ${url}`
          }
          // cell格式
          let direction = this.sectionValue(6)
          output.cell = `${output.name}(${direction.name})`

          return output
        }
      }
    ]
  },
  {
    id: 'mk-flow-condition',
    type: 'control',
    shape: 'cuptwo',
    category: 'presentation',
    draggable: true,
    state: {
      data: {
        other: {
          type: 'text',
          text: 'No'
        },
        sections: [
          {
            type: 'text',
            text: 'COND'
          },
          {
            type: 'argument',
            datatype: 'number'
          },
          {
            type: 'text',
            text: 'TAG'
          },
          {
            type: 'argument',
            datatype: 'string',
            data: {
              value: '条件'
            }
          },
          {
            type: 'text',
            text: 'Yes'
          },
          {
            type: 'argument',
            datatype: 'enum',
            data: {
              currentIndex: 2,
              values: [
                { name: 'left', value: 0 },
                { name: 'top', value: 1 },
                { name: 'right', value: 2 },
                { name: 'bottom', value: 3 }
              ]
            }
          }
        ]
      }
    },
    export: [
      {
        fmt: 'markdown',
        ext: '.md',
        action: function() {
          let output = {
            type: 'c', // 类型
            index: 0, // 数字索引，必须 >0
            name: '',
            def: '', // 格式 c=>condition: 条件
            yes: '', // 格式 c(bottom)
            no: ''
          }
          // 生成唯一变量名
          output.name = output.type + _uniqueId()
          output.index = this.sectionValue(1)
          // 获取title
          let title = this.sectionValue(3)
          output.def = `${output.name}=>condition: ${title}`
          // cell格式
          let direction = this.sectionValue(5)
          output.yes = `${output.name}(yes, ${direction.name})`
          output.no = `${output.name}(no)`
          return output
        }
      }
    ]
  }
]
