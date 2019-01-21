export default [
  {
    id: 'if',
    type: 'control',
    desc: 'If条件',
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
    }
  },
  {
    id: 'ifelse',
    type: 'control',
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
    }
  },
  {
    id: 'forever',
    type: 'control',
    shape: 'cup',
    category: 'control',
    end: true,
    draggable: true,
    state: {
      data: {
        sections: [
          {
            type: 'text',
            text: '重复执行'
          }
        ],
        subscript: {
          url: '/img/repeat.svg',
          width: 24,
          height: 24
        }
      }
    }
  },
  {
    id: 'while',
    type: 'control',
    shape: 'cup',
    category: 'control',
    draggable: true,
    state: {
      data: {
        sections: [
          {
            type: 'text',
            text: '重复执行直到'
          },
          {
            type: 'argument',
            datatype: 'boolean'
          }
        ],
        subscript: {
          url: '/img/repeat.svg',
          width: 24,
          height: 24
        }
      }
    }
  },
  {
    id: 'for',
    type: 'control',
    shape: 'cup',
    category: 'control',
    end: false,
    draggable: true,
    state: {
      data: {
        sections: [
          {
            type: 'text',
            text: '重复执行'
          },
          {
            type: 'argument',
            datatype: 'number',
            data: {
              value: 1
            }
          },
          {
            type: 'text',
            text: '次'
          }
        ],
        subscript: {
          url: '/img/repeat.svg',
          width: 24,
          height: 24
        }
      }
    }
  }
]
