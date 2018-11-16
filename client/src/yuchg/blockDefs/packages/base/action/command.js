export default [
  {
    id: 'execute',
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
    },
    exports: {
      json: function (elem) {
        return {}
      }
    }
  }
]
