export default [
  {
    id: 'click',
    shape: 'cap',
    category: 'event',
    draggable: true,
    begin: true,
    state: {
      data: {
        sections: [
          {
            type: 'text',
            text: '当'
          },
          {
            type: 'image',
            url: '/img/green-flag.svg',
            width: 24,
            height: 24
          },
          {
            type: 'text',
            text: '被点击'
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
    id: 'detect',
    shape: 'cap',
    category: 'event',
    draggable: true,
    begin: true,
    state: {
      data: {
        sections: [
          {
            type: 'text',
            text: '当探测到'
          },
          {
            type: 'argument',
            datatype: 'string'
          },
          {
            type: 'text',
            text: '时'
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
