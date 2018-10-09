export default [
  {
    id: 'forever',
    shape: 'cup',
    category: 'control',
    end: true,
    draggable: true,
    sections: [
      {
        type: 'text',
        text: '重复执行'
      }
    ],
    exports: {
      json: function (elem) {
        return {}
      }
    }
  },
  {
    id: 'for',
    shape: 'cup',
    category: 'control',
    end: false,
    draggable: true,
    sections: [
      {
        type: 'text',
        text: '重复执行'
      },
      {
        type: 'argument',
        datatype: 'number',
        state: {
          value: 1
        }
      },
      {
        type: 'text',
        text: '次'
      }
    ],
    exports: {
      json: function (elem) {
        return {}
      }
    }
  }
]
