export default [
  {
    id: 'move',
    shape: 'slot',
    category: 'motion',
    draggable: true,
    state: {
      data: {
        sections: [
          {
            type: 'text',
            text: '移动'
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
            text: '步'
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
    id: 'steer',
    shape: 'slot',
    category: 'motion',
    draggable: true,
    state: {
      data: {
        sections: [
          {
            type: 'text',
            text: '转向到'
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
            text: '度'
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
    id: 'movedestination',
    shape: 'slot',
    category: 'motion',
    draggable: true,
    state: {
      data: {
        sections: [
          {
            type: 'text',
            text: '设置航行目标为'
          },
          {
            type: 'argument',
            datatype: 'number',
            data: {
              value: 0
            }
          },
          {
            type: 'argument',
            datatype: 'number',
            data: {
              value: 0
            }
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
    id: 'sleep',
    shape: 'slot',
    category: 'control',
    draggable: true,
    state: {
      data: {
        sections: [
          {
            type: 'text',
            text: '等待'
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
            text: '秒'
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
