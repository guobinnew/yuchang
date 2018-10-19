export default [
  {
    id: 'forever',
    shape: 'cup',
    category: 'control',
    end: true,
    draggable: true,
    state: {
      data: {
        sections: [
          {
            type: 'text',
            text: '重复执行'
          }
        ],
        subscript: {
          url: '/img/repeat.svg',
          width: 24,
          height: 24
        }
      }
    },
    exports: {
      json: function (elem) {
        return {}
      }
    }
  },
  {
    id: 'while',
    shape: 'cup',
    category: 'control',
    draggable: true,
    state: {
      data: {
        sections: [
          {
            type: 'text',
            text: '重复执行直到'
          },
          {
            type: 'argument',
            datatype: 'boolean'
          }
        ],
        subscript: {
          url: '/img/repeat.svg',
          width: 24,
          height: 24
        }
      }
    },
    exports: {
      json: function (elem) {
        return {}
      }
    }
  },
  {
    id: 'for',
    shape: 'cup',
    category: 'control',
    end: false,
    draggable: true,
    state: {
      data: {
        sections: [
          {
            type: 'text',
            text: '重复执行'
          },
          {
            type: 'argument',
            datatype: 'number',
            data: {
              value: 1
            }
          },
          {
            type: 'text',
            text: '次'
          }
        ],
        subscript: {
          url: '/img/repeat.svg',
          width: 24,
          height: 24
        }
      }
    },
    exports: {
      json: function (elem) {
        return {}
      }
    }
  }
]
