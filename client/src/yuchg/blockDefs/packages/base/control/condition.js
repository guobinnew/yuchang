export default [
  {
    id: 'if',
    shape: 'cup',
    category: 'control',
    end: false,
    draggable: true,
    state: {
      data: {
        sections: [
          {
            type: 'text',
            text: '如果'
          },
          {
            type: 'argument',
            datatype: 'boolean'
          },
          {
            type: 'text',
            text: '那么'
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
    id: 'ifelse',
    shape: 'cuptwo',
    category: 'control',
    end: false,
    draggable: true,
    state: {
      data: {
        sections: [
          {
            type: 'text',
            text: '如果'
          },
          {
            type: 'argument',
            datatype: 'boolean'
          },
          {
            type: 'text',
            text: '那么'
          }
        ],
        other: {
          type: 'text',
          text: '否则'
        }
      }
    },
    exports: {
      json: function (elem) {
        return {}
      }
    }
  }
]
