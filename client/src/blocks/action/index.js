import motions from './motion'
import changes from './change'

let blocks = []

blocks = blocks.concat(motions, changes)

export default {
  name: '动作',
  members: blocks
}
