export default [
  {
    id: 'locationx',
    name: 'X坐标',
    shape: 'round',
    category: 'sensing',
    draggable: true,
    text: 'X坐标',
    exports: {
      json: function (elem) {
        return {}
      }
    }
  },
  {
    id: 'locationy',
    name: 'Y坐标',
    shape: 'round',
    category: 'sensing',
    draggable: true,
    text: 'Y坐标',
    exports: {
      json: function (elem) {
        return {}
      }
    }
  }
]
