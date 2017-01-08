var log = require('ulog')('printer')
var Tree = require('../src/tree')
var pretty = require('../src/pretty')

var tree = new Tree()

tree.insert(
  1, 3, 5, 2, 4, 6, 7, 8, 9, 15, 11, 13, 17, 18, 14, 19, 25, 30, 22, 21, 10, 16
)

log.info(pretty(tree))
