export default [
  {
    id: 'commanddefine',
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
    },
    exports: {
      json: function (elem) {
        return {}
      }
    }
  }
]
