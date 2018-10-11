export default {
  name: '参数',
  members: [
    {
      id: 'number',
      name: '数值',
      shape: 'round',
      category: 'argument',
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
      category: 'argument',
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
      category: 'argument',
      background: {
        fill: '#389438'
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
      category: 'argument',
      background: {
        fill: '#389438'
      },
      button: {
        url: '/img/dropdown-arrow.be850da5.svg',
        width: 12,
        height: 12
      },
      values: [],
      exports: {
        json: function (elem) {
          return {}
        }
      }
    }
  ]
}
