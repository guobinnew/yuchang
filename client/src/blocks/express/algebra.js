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
    id: 'logicadd',
    name: '逻辑与',
    shape: 'boolean',
    category: 'operator',
    draggable: true,
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
    id: 'greater',
    name: '大于',
    shape: 'boolean',
    category: 'operator',
    draggable: true,
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
  }
]
