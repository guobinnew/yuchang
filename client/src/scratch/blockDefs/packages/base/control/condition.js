export default [
  {
    id: 'if',
    shape: 'cup',
    category: 'control',
    end: false,
    draggable: true,
    sections: [
      {
        type: 'text',
        text: '如果'
      },
      {
        type: 'argument',
        datatype: 'boolean',
        state: {
          display: {
            fill: '#CF8B17'
          }
        }
      },
      {
        type: 'text',
        text: '那么'
      }
    ],
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
    sections: [
      {
        type: 'text',
        text: '如果'
      },
      {
        type: 'argument',
        datatype: 'boolean',
        state: {
          display: {
            fill: '#CF8B17'
          }
        }
      },
      {
        type: 'text',
        text: '那么'
      }
    ],
    others: [
      {
        type: 'text',
        text: '否则'
      }
    ],
    exports: {
      json: function (elem) {
        return {}
      }
    }
  }
]
