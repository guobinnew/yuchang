export default [
  {
    id: 'changecolor',
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
        values: [
          { name: '打开', value: 1 },
          { name: '关闭', value: 0 }
        ],
        state: {
          value: 0
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
