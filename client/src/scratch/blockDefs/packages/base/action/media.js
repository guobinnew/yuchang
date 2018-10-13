export default [
  {
    id: 'playaudio',
    shape: 'slot',
    category: 'media',
    draggable: true,
    state: {
      data: {
        sections: [
          {
            type: 'text',
            text: '将背景音乐'
          },
          {
            type: 'argument',
            datatype: 'enum',
            data: {
              currentIndex: 0,
              values: [
                { name: '关闭', value: 0 },
                { name: '打开', value: 1 }
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
