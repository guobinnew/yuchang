import variants from './variant'
import markers from './marker'
import actions from './action'
import events from './event'
import exps from './express'
import controls from './control'
import args from './args'
import categories from './categories'

export default {
  categories: categories,
  args: args,
  blocks: {
    variant: variants,
    marker: markers,
    action: actions,
    event: events,
    express: exps,
    control: controls
  }
}
