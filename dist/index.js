
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./trouty.cjs.production.min.js')
} else {
  module.exports = require('./trouty.cjs.development.js')
}
