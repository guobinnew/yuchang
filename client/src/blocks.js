export default {
  categories:{
    'internal':{
      name: '内部',
      display: 'none',
      background: {
        stroke: '#000000',
        fill: '#000000',
        opacity: '0.2'
      },
    },
    'sensing':{
      name: '感知',
      background: {
        stroke: '#2E8EB8',
        fill: '#5CB1D6',
        opacity: '1'
      },
    },
    'motion':{
      name: '运动',
      background: {
        stroke: '#3373CC',
        fill: '#4C97FF',
        opacity: '1'
      },
    },
    'data':{
      name: '数据',
      background: {
        stroke: '#DB6E00',
        fill: '#FF8C1A',
        opacity: '1'
      },
    }
  },
  blocks: {
    'insertmarker': {
      type: 'marker',
      shape: 'none',
      category: 'internal',
      draggable: true
    },
    'locationx': {
      type: 'variant',
      shape: 'round',
      category: 'sensing',
      draggable: true,
      text: 'X坐标'
    },
    'locationy': {
      type: 'variant',
      shape: 'round',
      category: 'sensing',
      draggable: true,
      text: 'Y坐标'
    },
    'move': {
      type: 'stack',
      shape: 'slot',
      category: 'motion',
      draggable: true,
      space: 8,
      sections: [
        {
          type: 'text',
          text: '移动'
        },
        {
          type: 'argument',
          data: 'text',
          shape: 'round',
          length: 40,
          background:{
            fill: '#FFFFFF'
          },
          value: '0'
        },
        {
          type: 'text',
          text: '步'
        }
      ]
    }
  }
}