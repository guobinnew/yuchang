export default [
  {
    id: 'add',
    name: '相加',
    shape: 'round',
    category: 'operator',
    draggable: true,
    sections: [
      {
        type: 'argument',
        datatype: 'number'
      },
      {
        type: 'text',
        text: '+'
      },
      {
        type: 'argument',
        datatype: 'number'
      }
    ],
    exports: {
      json: function (elem) {
        return {}
      }
    }
  }
]
