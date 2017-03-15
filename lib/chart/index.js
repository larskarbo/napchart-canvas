var Napchart = require('./init')()

/* helper functions */
require('./helpers')(Napchart)
require('./draw/canvasHelpers')(Napchart)

/* config files */
require('./config')(Napchart)

/* real shit */
require('./chart')(Napchart)

/* drawing */
require('./shape/shape')(Napchart)
require('./draw/draw')(Napchart)

/* other modules */
require('./fancymodule')(Napchart)

module.exports = Napchart