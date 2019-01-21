import categories from './categories'
import flows from './flow'

let blocks = []
blocks = blocks.concat(flows)

export default {
  categories: categories,
  blocks: blocks
}
