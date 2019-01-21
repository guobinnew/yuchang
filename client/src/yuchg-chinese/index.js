import poems from './poem'
import categories from './categories'

let blocks = []
blocks = blocks.concat(poems)

export default {
  categories: categories,
  blocks: blocks
}
