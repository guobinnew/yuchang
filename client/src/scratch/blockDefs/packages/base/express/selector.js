export default [
  {
    id: 'camp',
    name: '阵营选择器',
    shape: 'round',
    category: 'operator',
    draggable: true,
    state: {
      size: {
        padding: 4
      },
      data: {
        datatype: 'string',
        sections: [
          {
            type: 'argument',
            datatype: 'enum',
            data: {
              currentIndex: 0,
              values: [
                { name: '白方', value: 0 },
                { name: '红方', value: 1 },
                { name: '蓝方', value: 2 }
              ]
            }
          },
          {
            type: 'text',
            text: '的'
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
