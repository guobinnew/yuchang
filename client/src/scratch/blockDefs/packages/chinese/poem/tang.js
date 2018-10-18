export default [
  {
    id: 'yonger',
    type: 'event',
    shape: 'cap',
    category: 'data',
    draggable: true,
    state: {
      data: {
        sections: [
          {
            type: 'text',
            text: '《咏鹅》'
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
    id: 'yonger@1',
    type: 'action',
    shape: 'slot',
    category: 'data',
    draggable: true,
    state: {
      data: {
        sections: [
          {
            type: 'text',
            text: '鹅鹅鹅，'
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
    id: 'yonger@2',
    type: 'action',
    shape: 'slot',
    category: 'data',
    draggable: true,
    state: {
      data: {
        sections: [
          {
            type: 'argument',
            datatype: 'string'
          },
          {
            type: 'text',
            text: '向天歌。'
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
    id: 'yonger@3',
    type: 'action',
    shape: 'slot',
    category: 'data',
    draggable: true,
    state: {
      data: {
        sections: [
          {
            type: 'text',
            text: '白毛'
          },
          {
            type: 'argument',
            datatype: 'string'
          },
          {
            type: 'text',
            text: '绿水，'
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
    id: 'yonger@4',
    type: 'action',
    shape: 'slot',
    category: 'data',
    draggable: true,
    end: true,
    state: {
      data: {
        sections: [
          {
            type: 'text',
            text: '红掌拨'
          },
          {
            type: 'argument',
            datatype: 'string'
          },
          {
            type: 'text',
            text: '。'
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
