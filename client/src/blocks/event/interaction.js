export default [
  {
    id: 'click',
    shape: 'event',
    category: 'event',
    draggable: true,
    sections: [
      {
        type: 'text',
        text: '当'
      },
      {
        type: 'image',
        url: '../assets/green-flag.svg',
        width: 24,
        height: 24
      },
      {
        type: 'text',
        text: '被点击'
      }
    ],
    exports: {
      json: function (elem) {
        return {}
      }
    }
  }
]
