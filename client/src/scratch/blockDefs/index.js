import categories from './categories'
// 加载Block包
import base from './packages/base'
import chinese from './packages/chinese'
import ml from './packages/ml'
import markdown from './packages/markdown'

export default {
  categories: categories,
  packages: [base, chinese, ml, markdown]
}
