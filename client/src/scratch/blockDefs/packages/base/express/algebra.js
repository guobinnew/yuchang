export default [
  {
    id: 'add',
    name: '相加',
    shape: 'round',
    category: 'operator',
    draggable: true,
    display: {
      padding: 4
    },
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
    ],
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
    display: {
      padding: 4
    },
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
    ],
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
    display: {
      padding: 4
    },
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
    ],
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
    display: {
      padding: 4
    },
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
    ],
    exports: {
      json: function (elem) {
        return {}
      }
    }
  },
  {
    id: 'logicadd',
    name: '逻辑与',
    shape: 'boolean',
    category: 'operator',
    draggable: true,
    display: {
      padding: {
        left: 8,
        right: 8,
        top: 4,
        bottom: 4
      }
    },
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
    ],
    exports: {
      json: function (elem) {
        return {}
      }
    }
  },
  {
    id: 'logicor',
    name: '逻辑或',
    shape: 'boolean',
    category: 'operator',
    draggable: true,
    display: {
      padding: {
        left: 8,
        right: 8,
        top: 4,
        bottom: 4
      }
    },
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
    ],
    exports: {
      json: function (elem) {
        return {}
      }
    }
  },
  {
    id: 'greater',
    name: '大于',
    shape: 'boolean',
    category: 'operator',
    draggable: true,
    display: {
      padding: {
        left: 16,
        right: 16,
        top: 4,
        bottom: 4
      }
    },
    sections: [
      {
        type: 'argument',
        datatype: 'number'
      },
      {
        type: 'text',
        text: '>'
      },
      {
        type: 'argument',
        datatype: 'number'
      }
    ],
    exports: {
      json: function (elem) {
        return {}
      }
    }
  },
  {
    id: 'less',
    name: '小于',
    shape: 'boolean',
    category: 'operator',
    draggable: true,
    display: {
      padding: {
        left: 16,
        right: 16,
        top: 4,
        bottom: 4
      }
    },
    sections: [
      {
        type: 'argument',
        datatype: 'number'
      },
      {
        type: 'text',
        text: '<'
      },
      {
        type: 'argument',
        datatype: 'number'
      }
    ],
    exports: {
      json: function (elem) {
        return {}
      }
    }
  }
]
