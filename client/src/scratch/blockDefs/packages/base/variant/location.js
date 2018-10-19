export default [
  {
    id: 'locationx',
    name: 'X坐标',
    shape: 'round',
    category: 'sensing',
    draggable: true,
    state: {
      data: {
        datatype: 'number',
        text: 'X坐标'
      }
    },
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
    state: {
      data: {
        datatype: 'number',
        text: 'Y坐标'
      }
    },
    exports: {
      json: function (elem) {
        return {}
      }
    }
  },
  {
    id: 'origin',
    name: '是否在原点',
    shape: 'diamond',
    category: 'sensing',
    draggable: true,
    state: {
      data: {
        datatype: 'boolean',
        text: '是否在原点'
      }
    },
    exports: {
      json: function (elem) {
        return {}
      }
    }
  }
]
