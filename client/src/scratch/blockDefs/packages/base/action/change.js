export default [
  {
    id: 'interference',
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
                { name: '打开我爹的', value: 1 },
                { name: '关闭', value: 0 }
              ]
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
  }
]
