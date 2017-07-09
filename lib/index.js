var Napchart = {}

/* helper functions */
require('./helpers')(Napchart)
require('./draw/canvasHelpers')(Napchart)

/* config files */
require('./config')(Napchart)

/* real shit */
require('./core')(Napchart)

/* drawing */
require('./shape/shape')(Napchart)
require('./draw/draw')(Napchart)
require('./interactCanvas/interactCanvas')(Napchart)

module.exports = Napchart