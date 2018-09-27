import variants from './variant'
import markers from './marker'
import actions from './action'
import events from './event'
import exps from './express'
import args from './argument'
import controls from './control'
import categories from './categories'

export default {
  categories: categories,
  blocks: {
    variant: variants,
    marker: markers,
    action: actions,
    event: events,
    express: exps,
    argument: args,
    control: controls
  }
}
