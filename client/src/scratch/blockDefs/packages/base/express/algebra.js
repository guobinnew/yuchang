export default [
  {
    id: 'add',
    name: '相加',
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
    },
    exports: {
      json: function (elem) {
        return {}
      }
    }
  },
  {
    id: 'minus',
    name: '相减',
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
    },
    exports: {
      json: function (elem) {
        return {}
      }
    }
  },
  {
    id: 'divide',
    name: '相除',
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
    },
    exports: {
      json: function (elem) {
        return {}
      }
    }
  },
  {
    id: 'multiply',
    name: '相乘',
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
    },
    exports: {
      json: function (elem) {
        return {}
      }
    }
  },
  {
    id: 'logicadd',
    name: '逻辑与',
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
    },
    exports: {
      json: function (elem) {
        return {}
      }
    }
  },
  {
    id: 'logicor',
    name: '逻辑或',
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
    },
    exports: {
      json: function (elem) {
        return {}
      }
    }
  },
  {
    id: 'greater',
    name: '大于',
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
    },
    exports: {
      json: function (elem) {
        return {}
      }
    }
  },
  {
    id: 'less',
    name: '小于',
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
    },
    exports: {
      json: function (elem) {
        return {}
      }
    }
  },
  {
    id: 'equal',
    name: '等于',
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
    },
    exports: {
      json: function (elem) {
        return {}
      }
    }
  }
]
