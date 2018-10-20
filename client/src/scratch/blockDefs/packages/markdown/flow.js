export default [
  {
    id: 'mk-flow',
    type: 'event',
    shape: 'cap',
    category: 'presentation',
    draggable: true,
    state: {
      data: {
        sections: [
          {
            type: 'text',
            text: 'MarkDown 流程图'
          },
          {
            type: 'argument',
            datatype: 'string'
          }
        ]
      }
    }
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
            datatype: 'string'
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
    }
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
            datatype: 'string'
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
    }
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
            datatype: 'string'
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
    }
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
            datatype: 'string'
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
    }
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
            datatype: 'string'
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
    }
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
            datatype: 'string'
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
    }
  }
]
