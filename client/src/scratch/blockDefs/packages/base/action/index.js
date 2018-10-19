import motions from './motion'
import changes from './change'
import medias from './media'
import commands from './command'

let blocks = []
blocks = blocks.concat(motions, changes, medias, commands)

export default blocks