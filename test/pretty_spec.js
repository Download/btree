var chai = require('chai')
var expect = require('chai').expect

var Tree = require('../src/tree')
var pretty = require('../src/pretty')
var spaces = require('../src/pretty').spaces

describe('pretty', function () {
  it('returns a pretty-printed string representation of the tree', function () {

    var tree = new Tree()
    tree.insert(2, 3, 5, 7, 9, 11)
    var expected = '                       7\n           3                 9\n     2           5                 11\n';
    var actual = pretty(tree);

    expect(actual).to.eq(expected)
  })
})

describe('pretty.spaces', function () {
  it('returns the number of spaces passed in as first argument', function () {
    var generated = spaces(22)
    expect(generated.length).to.eq(22)

    for (var i=0, len=generated.length; i<len; i++) {
      expect(generated.charAt(i)).to.eq(' ')
    }
  })
})
