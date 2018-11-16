export default [
  {
    id: 'submarine',
    name: '潜艇',
    shape: 'round',
    category: 'sensing',
    draggable: true,
    state: {
      data: {
        datatype: 'string',
        text: '潜艇'
      }
    },
    exports: {
      json: function (elem) {
        return {}
      }
    }
  },
  {
    id: 'ship',
    name: '水面船只',
    shape: 'round',
    category: 'sensing',
    draggable: true,
    state: {
      data: {
        datatype: 'string',
        text: '水面船只'
      }
    },
    exports: {
      json: function (elem) {
        return {}
      }
    }
  }
]
