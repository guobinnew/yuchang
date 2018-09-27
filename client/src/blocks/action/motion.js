export default [
  {
    id: 'move',
    shape: 'slot',
    category: 'motion',
    draggable: true,
    space: 8,
    sections: [
      {
        type: 'text',
        ext: '移动'
      },
      {
        type: 'argument',
        data: 'number',
        shape: 'round',
        value: '0'
      },
      {
        type: 'text',
        text: '步'
      }
    ],
    exports: {
      json: function (elem) {
        return {}
      }
    }
  }
]
