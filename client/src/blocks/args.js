export default [
  {
    id: 'number',
    name: '数值',
    shape: 'round',
    background: {
      stroke: '#333333',
      fill: '#FFFFFF',
      opacity: '1'
    },
    exports: {
      json: function (elem) {
        return {}
      }
    }
  },
  {
    id: 'string',
    name: '字符串',
    shape: 'round',
    background: {
      stroke: '#333333',
      fill: '#FFFFFF',
      opacity: '1'
    },
    exports: {
      json: function (elem) {
        return {}
      }
    }
  },
  {
    id: 'boolean',
    name: '布尔值',
    shape: 'boolean',
    background: {
      stroke: '#333333',
      fill: '#FFFFFF',
      opacity: '1'
    },
    exports: {
      json: function (elem) {
        return {}
      }
    }
  },
  {
    id: 'enum',
    name: '枚举值',
    shape: 'dropdown',
    background: {
      stroke: '#333333',
      fill: '#FFFFFF',
      opacity: '1'
    },
    values: [
      { value: -1, name: '空' }
    ],
    exports: {
      json: function (elem) {
        return {}
      }
    }
  }
]
