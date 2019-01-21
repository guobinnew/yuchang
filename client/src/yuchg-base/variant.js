export default [
  {
    id: 'locationx',
    type: 'variant',
    desc: 'X坐标',
    shape: 'round',
    category: 'sensing',
    draggable: true,
    state: {
      data: {
        datatype: 'number',
        text: 'X坐标'
      }
    }
  },
  {
    id: 'locationy',
    type: 'variant',
    desc: 'Y坐标',
    shape: 'round',
    category: 'sensing',
    draggable: true,
    state: {
      data: {
        datatype: 'number',
        text: 'Y坐标'
      }
    }
  },
  {
    id: 'origin',
    type: 'variant',
    desc: '是否在原点',
    shape: 'diamond',
    category: 'sensing',
    draggable: true,
    state: {
      data: {
        datatype: 'boolean',
        text: '是否在原点'
      }
    }
  }
]
