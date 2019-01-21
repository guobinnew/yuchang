
export default [
  {
    id: 'add',
    type: 'express',
    desc: '两个数字相加',
    shape: 'round',
    category: 'operator',
    draggable: true,
    state: {
      size: {
        padding: 4
      },
      data: {
        datatype: 'number',
        sections: [
          {
            type: 'argument',
            datatype: 'number'
          },
          {
            type: 'text',
            text: '+'
          },
          {
            type: 'argument',
            datatype: 'number'
          }
        ]
      }
    }
  },
  {
    id: 'minus',
    type: 'express',
    desc: '相减',
    shape: 'round',
    category: 'operator',
    draggable: true,
    state: {
      size: {
        padding: 4
      },
      data: {
        datatype: 'number',
        sections: [
          {
            type: 'argument',
            datatype: 'number'
          },
          {
            type: 'text',
            text: '-'
          },
          {
            type: 'argument',
            datatype: 'number'
          }
        ]
      }
    }
  },
  {
    id: 'divide',
    type: 'express',
    desc: '相除',
    shape: 'round',
    category: 'operator',
    draggable: true,
    state: {
      size: {
        padding: 4
      },
      data: {
        datatype: 'number',
        sections: [
          {
            type: 'argument',
            datatype: 'number'
          },
          {
            type: 'text',
            text: '/'
          },
          {
            type: 'argument',
            datatype: 'number'
          }
        ]
      }
    }
  },
  {
    id: 'multiply',
    type: 'express',
    desc: '相乘',
    shape: 'round',
    category: 'operator',
    draggable: true,
    state: {
      size: {
        padding: 4
      },
      data: {
        datatype: 'number',
        sections: [
          {
            type: 'argument',
            datatype: 'number'
          },
          {
            type: 'text',
            text: '✖'
          },
          {
            type: 'argument',
            datatype: 'number'
          }
        ]
      }
    }
  },
  {
    id: 'logicadd',
    type: 'express',
    desc: '逻辑与',
    shape: 'diamond',
    category: 'operator',
    draggable: true,
    state: {
      size: {
        padding: {
          left: 8,
          right: 8,
          top: 4,
          bottom: 4
        }
      },
      data: {
        datatype: 'boolean',
        sections: [
          {
            type: 'argument',
            datatype: 'boolean'
          },
          {
            type: 'text',
            text: '与'
          },
          {
            type: 'argument',
            datatype: 'boolean'
          }
        ]
      }
    }
  },
  {
    id: 'logicor',
    type: 'express',
    desc: '逻辑或',
    shape: 'diamond',
    category: 'operator',
    draggable: true,
    state: {
      size: {
        padding: {
          left: 8,
          right: 8,
          top: 4,
          bottom: 4
        }
      },
      data: {
        datatype: 'boolean',
        sections: [
          {
            type: 'argument',
            datatype: 'boolean'
          },
          {
            type: 'text',
            text: '或'
          },
          {
            type: 'argument',
            datatype: 'boolean'
          }
        ]
      }
    }
  },
  {
    id: 'greater',
    type: 'express',
    desc: '大于',
    shape: 'diamond',
    category: 'operator',
    draggable: true,
    state: {
      size: {
        padding: {
          left: 16,
          right: 16,
          top: 4,
          bottom: 4
        }
      },
      data: {
        datatype: 'boolean',
        sections: [
          {
            type: 'argument',
            datatype: 'number'
          },
          {
            type: 'text',
            text: '大于'
          },
          {
            type: 'argument',
            datatype: 'number'
          }
        ]
      }
    }
  },
  {
    id: 'less',
    type: 'express',
    desc: '小于',
    shape: 'diamond',
    category: 'operator',
    draggable: true,
    state: {
      size: {
        padding: {
          left: 16,
          right: 16,
          top: 4,
          bottom: 4
        }
      },
      data: {
        datatype: 'boolean',
        sections: [
          {
            type: 'argument',
            datatype: 'number'
          },
          {
            type: 'text',
            text: '小于'
          },
          {
            type: 'argument',
            datatype: 'number'
          }
        ]
      }
    }
  },
  {
    id: 'equal',
    type: 'express',
    desc: '等于',
    shape: 'diamond',
    category: 'operator',
    draggable: true,
    state: {
      size: {
        padding: {
          left: 16,
          right: 16,
          top: 4,
          bottom: 4
        }
      },
      data: {
        datatype: 'boolean',
        sections: [
          {
            type: 'argument',
            datatype: 'number'
          },
          {
            type: 'text',
            text: '等于'
          },
          {
            type: 'argument',
            datatype: 'number'
          }
        ]
      }
    }
  },
  {
    id: 'camp',
    type: 'express',
    desc: '阵营选择器',
    shape: 'round',
    category: 'operator',
    draggable: true,
    state: {
      size: {
        padding: 4
      },
      data: {
        datatype: 'string',
        sections: [
          {
            type: 'argument',
            datatype: 'enum',
            data: {
              currentIndex: 0,
              values: [
                { name: '白方', value: 0 },
                { name: '红方', value: 1 },
                { name: '蓝方', value: 2 }
              ]
            }
          },
          {
            type: 'text',
            text: '的'
          },
          {
            type: 'argument',
            datatype: 'string'
          }
        ]
      }
    }
  }
]
