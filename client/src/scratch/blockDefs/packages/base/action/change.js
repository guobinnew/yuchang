export default [
  {
    id: 'interference',
    shape: 'slot',
    category: 'motion',
    draggable: true,
    display: {
      space: 8,
      padding: 8
    },
    sections: [
      {
        type: 'text',
        text: '将干扰器'
      },
      {
        type: 'argument',
        datatype: 'enum',
        state: {
          display: {
            fill: '#4280D7'
          },
          currentIndex: 0,
          values: [
            { name: '打开我爹的', value: 1 },
            { name: '关闭', value: 0 }
          ]
        }
      }
    ],
    exports: {
      json: function (elem) {
        return {}
      }
    }
  }
]
