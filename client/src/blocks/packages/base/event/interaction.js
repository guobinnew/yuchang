export default [
  {
    id: 'click',
    shape: 'cap',
    category: 'event',
    draggable: true,
    sections: [
      {
        type: 'text',
        text: '当'
      },
      {
        type: 'image',
        url: '/img/green-flag.6a025d28.svg',
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
