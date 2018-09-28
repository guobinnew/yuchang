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
      values: [{
        value: -1,
        name: '空'
      }],
      exports: {
        json: function (elem) {
          return {}
        }
      }
    }
  ]
}
