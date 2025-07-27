const { format } = require('timeago.js');

const helpers = {};

// Suma 1 al índice
helpers.inc = (value) => parseInt(value) + 1;

// Si tienes otros helpers:
helpers.timeago = (timestamp) => format(timestamp);

module.exports = helpers;
