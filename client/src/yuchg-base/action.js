
export default [
  {
    id: 'interference',
    type: 'action',
    desc: '控制干扰器开关状态',
    shape: 'slot',
    category: 'motion',
    draggable: true,
    state: {
      data: {
        sections: [
          {
            type: 'text',
            text: '将干扰器'
          },
          {
            type: 'argument',
            datatype: 'enum',
            data: {
              currentIndex: 0,
              values: [
                { name: '关闭', value: 0 },
                { name: '打开', value: 1 }
              ]
            }
          }
        ]
      }
    }
  },
  {
    id: 'execute',
    type: 'action',
    desc: '执行命令',
    shape: 'slot',
    category: 'control',
    draggable: true,
    state: {
      data: {
        sections: [
          {
            type: 'text',
            text: '执行命令'
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
    id: 'playaudio',
    type: 'action',
    desc: '播放背景音乐',
    shape: 'slot',
    category: 'media',
    draggable: true,
    state: {
      data: {
        sections: [
          {
            type: 'text',
            text: '将背景音乐'
          },
          {
            type: 'argument',
            datatype: 'enum',
            data: {
              currentIndex: 0,
              values: [
                { name: '关闭', value: 0 },
                { name: '打开', value: 1 }
              ]
            }
          }
        ]
      }
    }
  },
  {
    id: 'move',
    type: 'action',
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
    }
  },
  {
    id: 'steer',
    type: 'action',
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
    }
  },
  {
    id: 'movedestination',
    type: 'action',
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
    }
  },
  {
    id: 'sleep',
    type: 'action',
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
    }
  }
]
