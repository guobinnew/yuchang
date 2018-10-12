export default [
  {
    id: 'move',
    shape: 'slot',
    category: 'motion',
    draggable: true,
    state: {
      size: {
        space: 8,
        padding: 8
      },
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
  }
]
