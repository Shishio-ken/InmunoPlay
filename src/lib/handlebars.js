const { format } = require('timeago.js');

const helpers = {};

// Suma 1 al índice
helpers.inc = (value) => parseInt(value) + 1;

// Fecha formateada
helpers.timeago = (timestamp) => format(timestamp);

// NUEVO: helper de comparación como bloque
helpers.ifEq = function(a, b, options) {
  if (a === b) {
    return options.fn(this);
  }
  return options.inverse(this);
};


module.exports = helpers;
