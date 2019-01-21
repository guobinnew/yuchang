
export default [
  {
    id: 'commanddefine',
    type: 'event',
    shape: 'hat',
    category: 'event',
    draggable: true,
    begin: true,
    state: {
      data: {
        sections: [
          {
            type: 'text',
            text: '定义命令'
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
    id: 'click',
    type: 'event',
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
    }
  },
  {
    id: 'detect',
    type: 'event',
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
    }
  }
]
