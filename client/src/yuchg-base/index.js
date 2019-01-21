import actions from './action'
import events from './event'
import exps from './express'
import controls from './control'
import variants from './variant'
import categories from './categories'

let blocks = []
blocks = blocks.concat(variants, actions, events, exps, controls)

export default {
  categories: categories,
  blocks: blocks
}
