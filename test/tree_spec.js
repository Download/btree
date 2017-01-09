'use strict';

var chai = require('chai')
var expect = require('chai').expect
var Tree = require('../src')
var Node = require('../src').Node
var pretty = require('../src/pretty')

describe('Tree', function () {
  it('is a class', function () {
    expect(Tree).to.be.a('function')
  })

  describe('PRE_ORDER', function () {
    it('is a static integer constant set to 1', function () {
      expect(Tree.PRE_ORDER).to.eq(1)
    })
  })

  describe('IN_ORDER', function () {
    it('is a static integer constant set to 2', function () {
      expect(Tree.IN_ORDER).to.eq(2)
    })
  })

  describe('POST_ORDER', function () {
    it('is a static integer constant set to 3', function () {
      expect(Tree.POST_ORDER).to.eq(3)
    })
  })

  describe('constructor(options)', function () {
    it('can be called without arguments', function () {
      var tree = new Tree()
      tree.insert(1)
      expect(tree.find(1)).to.eq(tree.root)
    });

    it('accepts an options object', function () {
      var tree = new Tree({})
      tree.insert(1)
      expect(tree.find(1)).to.eq(tree.root)
    });

    describe('options', function () {
      it('can be used to set tree options `unique`, `key` and `compare`', function () {
        expect(new Tree({key:'test'}).key).to.eq('test')
        expect(new Tree({unique:true}).unique).to.eq(true)
      });

      describe('unique', function () {
        it('is not tested yet', function () {
        });
      });

      describe('key', function () {
        it('determines the name of the key property when storing objects', function () {
          var tree = new Tree({ key: 'value' })
          var root = new Node({ key: 30, value: 50 })
          var leaf = new Node({ key: 50, value: 30 })
          tree.insert(root)
          tree.insert(leaf)
          expect(tree.find(root.data.value)).to.eq(root)
          expect(tree.find(leaf.data.value)).to.eq(leaf)
        });
      });
    });
  });

  describe('#isEmpty', function () {
    it('returns true when no nodes have been inserted', function () {
      var tree = new Tree();
      expect(tree.isEmpty()).to.eq(true);
    });

    it('returns false when nodes have been inserted', function () {
      var tree = new Tree();
      tree.insert(new Node({ key: 10, value: 'plop' }));

      expect(tree.isEmpty()).to.eq(false);

      tree.delete(10);
      expect(tree.isEmpty()).to.eq(true);
    });
  });

  describe('#findPaths', function () {
    it('returns all the paths from root to leaf', function () {
      var tree = new Tree();
      tree.insert(1, 2, 3, 4, 5, 6, 7, 8, 9);

      var paths = tree.findPaths();
      expect(paths.length).to.eq(5);

      var expected_paths = [
        [4, 2, 1],
        [4, 2, 3],
        [4, 6, 5],
        [4, 6, 8, 7],
        [4, 6, 8, 9]
      ];

      var path_index = 0;
      paths.forEach(function (path) {
        var node_index = 0;
        path.forEach(function (node) {
          expect(expected_paths[path_index][node_index++]).to.eq(node.data.key);
        });

        path_index++;
      });
    });
  });

  describe('#next', function () {
    it('returns the next node in the tree', function () {
      var tree = new Tree();
      tree.insert(6, 7, 8, 1, 2, 3, 4, 5);

      for (var i = 1; i < 8; i++) {
        expect(tree.next(tree.find(i))).to.eq(tree.find(i + 1));
      }
    });

    it('returns undefined if no node passed in', function () {
      var tree = new Tree();

      expect(tree.next()).to.eq(undefined);
    });

    it('returns undefined if no next element', function () {
      var tree = new Tree();
      tree.insert(5);

      expect(tree.next(tree.find(5))).to.eq(undefined);
    });
  });

  describe('#prev', function () {
    it('returns the prev node in the tree', function () {
      var tree = new Tree();
      tree.insert(6, 7, 8, 1, 2, 3, 4, 5);

      for (var i = 2; i <= 8; i++) {
        expect(tree.prev(tree.find(i))).to.eq(tree.find(i - 1));
      }
    });

    it('returns undefined if no node passed in', function () {
      var tree = new Tree();

      expect(tree.prev()).to.eq(undefined);
    });

    it('returns undefined if no prev element', function () {
      var tree = new Tree();
      tree.insert(5);

      expect(tree.prev(tree.find(5))).to.eq(undefined);
    });
  });

  describe('#delete', function () {
    var tree;

    beforeEach(function () {
      tree = new Tree();
      tree.insert(100, 50, 150, 175, 125);
    });

    it('can delete the root', function () {
      tree.delete(tree.root.data.key);

      expect(tree.root.data.key).to.eq(150);
    });

    it('can delete the root when many elements in tree', function () {
      tree = new Tree();
      tree.insert(
        1, 3, 5, 2, 4, 6, 7, 8, 9, 15, 11, 13, 17, 18, 14, 19, 25, 30, 22, 21, 10, 16
      );
      tree.delete(tree.root);
      tree.delete(tree.root);
      tree.delete(tree.root);

      expect(tree.root.data.key).to.eq(9);
    });

    it('can delete when node has one child on left', function () {
      tree = new Tree();
      tree.insert(50, 25, 75, 12);
      tree.delete(25);

      expect(tree.root.left.data.key).to.eq(12);
      expect(tree.root.left.parent).to.eq(tree.root);
    });

    it('can delete when node has one child on right', function () {
      tree = new Tree();
      tree.insert(50, 25, 75, 33);
      tree.delete(25);

      expect(tree.root.left.data.key).to.eq(33);
      expect(tree.root.left.parent).to.eq(tree.root);
    });

    it('can delete when node has two children', function () {
      tree.delete(150);

      expect(tree.root.right.data.key).to.eq(125);
      expect(tree.root.right.parent).to.eq(tree.root);
      expect(tree.root.right.right.data.key).to.eq(175);
      expect(tree.root.right.right.parent).to.eq(tree.root.right);
    });

    it('can delete when node is a leaf', function () {
      tree.delete(tree.root.left.data.key);
      // rebalancing results in 100 on left
      expect(tree.root.left.data.key).to.eq(100);
    });

    /*
    it('throws error if node not found', function () {
      function runner() { tree.delete(99); }

      expect(runner).to.throw('Cannot delete non-existent node');
    });
    */
  });

  describe('#min', function () {
    it('returns the root when it is the only element', function () {
      var tree = new Tree();
      tree.insert(9);

      expect(tree.min().data.key).to.eq(9);
    });

    it('returns node with smallest key when tree has multiple levels', function () {
      var tree = new Tree();
      tree.insert(9, 10, 3, 5, 0, 4, 2, 7);

      expect(tree.min().data.key).to.eq(0);
    });
  });

  describe('#max', function () {
    it('returns the root when it is the only element', function () {
      var tree = new Tree();
      tree.insert(9);

      expect(tree.max().data.key).to.eq(9);
    });

    it('returns node with smallest key when tree has multiple levels', function () {
      var tree = new Tree();
      tree.insert(9, 10, 3, 5, 0, 4, 2, 7);

      expect(tree.max().data.key).to.eq(10);
    });
  });

  describe('#height', function () {
    it('returns 0 when there is no root', function () {
      expect(new Tree().height()).to.eq(0);
    });

    it('returns 1 when there is only a root', function () {
      var root = new Node({ key: 10 });
      var tree = new Tree();
      tree.insert(root);

      expect(tree.height()).to.eq(1);
    });

    it('returns 2 when there is a second level of tree', function () {
      var root = new Node({ key: 10 });
      var leaf = new Node({ key: 15 });
      var leaf2 = new Node({ key: 8 });
      var tree = new Tree();
      tree.insert(root);
      tree.insert(leaf);
      tree.insert(leaf2);

      expect(tree.height()).to.eq(2);
    });

    it('returns height of subtree when subtree passed in', function () {
      var root = new Node({ key: 10 });
      var leaf = new Node({ key: 15 });
      var leaf2 = new Node({ key: 8 });
      var tree = new Tree();
      tree.insert(root);
      tree.insert(leaf);
      tree.insert(leaf2);

      expect(tree.height(leaf)).to.eq(1);
    });
  });

  describe('#find', function () {
    var tree;

    beforeEach(function () {
      tree = new Tree()
    })

    it('can return the matching node from left tree', function () {
      tree.insert(5, 3, 6, 4)
      expect(tree.find(4).data.key).to.eq(4)
    })

    it('can return the matching node from right tree', function () {
      tree.insert(5, 3, 6, 4)
      expect(tree.find(6).data.key).to.eq(6)
    })

    it('can return the matching node from root', function () {
      tree.insert(5)
      expect(tree.find(5).data.key).to.eq(5)
    })

    it('returns undefined when the node is not found', function () {
      tree.insert(5, 3, 6, 4)
      expect(tree.find(8)).to.eq(undefined)
    })
  });

  describe('#insert', function () {
    it('can accept a number', function () {
      var tree = new Tree()
      tree.insert(5)
      expect(tree.root.data.key).to.eq(5)
    })

    it('can accept a number when there is custom key', function () {
      var tree = new Tree({ key: 'index' })
      tree.insert(5)
      expect(tree.root.data.index).to.eq(5)
    })

    it('inserts to root when there is no root', function () {
      var tree = new Tree()
      var node = new Node({ key: 10 })
      tree.insert(node)
      expect(tree.root).to.eq(node)
    })

    it('throws error when key present and unique: true', function () {
      var tree = new Tree({ unique: true })
      tree.insert(4, 5, 6)
      expect(function () { tree.insert(5); }).to.throw('Duplicate key violation')
    })

    it('does not throw error when key present and unique: false', function () {
      var tree = new Tree()
      tree.insert(4, 5, 6)
      expect(function () { tree.insert(5); }).not.to.throw()
    })

    it('inserts to correct subtree when root present', function () {
      var tree = new Tree()
      var node1 = new Node({ key: 10 })
      tree.insert(node1)
      var node2 = new Node({ key: 20 })
      tree.insert(node2)
      expect(tree.root.right).to.eq(node2)
      var node3 = new Node({ key: 5 })
      tree.insert(node3)
      expect(tree.root.left).to.eq(node3)
    })

    it('sets the correct parent on the inserted node', function () {
      var tree = new Tree()
      tree.insert(10, 5, 15, 2, 8)
      expect(tree.find(2).parent).to.eq(tree.find(5))
    })

    it('rebalances tree to left when right side gets too long', function () {
      var tree = new Tree()
      var node1 = new Node({ key: 10 })
      var node2 = new Node({ key: 20 })
      var node3 = new Node({ key: 30 })
      tree.insert(node1)
      tree.insert(node2)
      tree.insert(node3)
      expect(tree.root).to.eq(node2)
      expect(tree.root.left).to.eq(node1)
      expect(tree.root.right).to.eq(node3)
      expect(tree.height()).to.eq(2)
    })

    it('rebalances tree to left when right side gets too long, case 2', function () {
      var tree = new Tree();
      var node1 = new Node({ key: 10 });
      var node2 = new Node({ key: 20 });
      var node3 = new Node({ key: 15 });
      tree.insert(node1);
      tree.insert(node2);
      tree.insert(node3);

      expect(tree.root).to.eq(node3);
      expect(tree.root.left).to.eq(node1);
      expect(tree.root.right).to.eq(node2);
      expect(tree.height()).to.eq(2);
    })

    it('rebalances tree to left when right side gets too long, case 3', function () {
      var tree = new Tree()
      tree.insert(1, 2, 3, 4, 5, 6)
      expect(tree.root.data.key).to.eq(4)
      expect(tree.root.left.data.key).to.eq(2)
      expect(tree.root.left.parent).to.eq(tree.root)
      expect(tree.root.left.left.data.key).to.eq(1)
      expect(tree.root.left.left.parent).to.eq(tree.root.left)
      expect(tree.root.left.right.data.key).to.eq(3)
      expect(tree.root.left.right.parent).to.eq(tree.root.left)
      expect(tree.root.right.data.key).to.eq(5)
      expect(tree.root.right.parent).to.eq(tree.root)
      expect(tree.root.right.right.data.key).to.eq(6)
      expect(tree.root.right.right.parent).to.eq(tree.root.right)
    })

    it('rebalances tree to right when left side gets too long', function () {
      var tree = new Tree()
      var node1 = new Node({ key: 30 })
      var node2 = new Node({ key: 20 })
      var node3 = new Node({ key: 10 })
      tree.insert(node1)
      tree.insert(node2)
      tree.insert(node3)
      expect(tree.root).to.eq(node2)
      expect(tree.root.right).to.eq(node1)
      expect(tree.root.left).to.eq(node3)
      expect(tree.height()).to.eq(2)
    })

    it('rebalances tree to right when left side gets too long, case 2', function () {
      var tree = new Tree()
      var node1 = new Node({ key: 30 })
      var node2 = new Node({ key: 10 })
      var node3 = new Node({ key: 20 })
      tree.insert(node1)
      tree.insert(node2)
      tree.insert(node3)
      expect(tree.root).to.eq(node3)
      expect(tree.root.right).to.eq(node1)
      expect(tree.root.left).to.eq(node2)
      expect(tree.height()).to.eq(2)
    })

    it('rebalances tree to right when left side gets too long, case 3', function () {
      var tree = new Tree()
      tree.insert(6, 5, 4, 3, 2, 1)
      expect(tree.root.data.key).to.eq(3)
      expect(tree.root.left.data.key).to.eq(2)
      expect(tree.root.left.parent).to.eq(tree.root)
      expect(tree.root.left.left.data.key).to.eq(1)
      expect(tree.root.left.left.parent).to.eq(tree.root.left)
      expect(tree.root.right.data.key).to.eq(5)
      expect(tree.root.right.parent).to.eq(tree.root)
      expect(tree.root.right.left.data.key).to.eq(4)
      expect(tree.root.right.left.parent).to.eq(tree.root.right)
      expect(tree.root.right.right.data.key).to.eq(6)
      expect(tree.root.right.right.parent).to.eq(tree.root.right)
    })

    it('can insert multiple values at once by passing multiple arguments', function () {
      var tree = new Tree()
      tree.insert(10, 5, 15, 3, 6, 12, 18, 21)
      expect(tree.root.data.key).to.eq(10)
      expect(tree.root.left.data.key).to.eq(5)
      expect(tree.root.left.left.data.key).to.eq(3)
      expect(tree.root.left.right.data.key).to.eq(6)
      expect(tree.root.right.data.key).to.eq(15)
      expect(tree.root.right.left.data.key).to.eq(12)
      expect(tree.root.right.right.data.key).to.eq(18)
      expect(tree.root.right.right.right.data.key).to.eq(21)
    })
  })

  describe('#swap', function () {
    var tree
    var root

    beforeEach(function () {
      tree = new Tree()
      tree.insert(50, 25, 75)
      root = tree.root
    })

    it('swaps the two elements when child is the left child', function () {
      tree.swap(root, root.left)

      expect(tree.root.data.key).to.eq(25)
      expect(tree.root.left.data.key).to.eq(50)
      expect(tree.root.right.data.key).to.eq(75)
    })

    it('swaps the two elements when child is the right child', function () {
      tree.swap(root, root.right);

      expect(tree.root.data.key).to.eq(75);
      expect(tree.root.left.data.key).to.eq(25);
      expect(tree.root.right.data.key).to.eq(50);
    })

    it('swaps two elements when first is child and second is parent', function () {
      tree.swap(root.right, root)

      expect(tree.root.data.key).to.eq(75)
      expect(tree.root.left.data.key).to.eq(25)
      expect(tree.root.right.data.key).to.eq(50)
    })

    it('correctly updates the parents on the swapped elements', function () {
      tree.swap(tree.root, tree.root.right)
      expect(tree.root.right.parent).to.eq(tree.root)

      tree.swap(tree.root, tree.root.left)
      expect(tree.root.left.parent).to.eq(tree.root)
    })

    it('can swap at more than 1 level deep', function () {
      tree.insert(60, 80)

      tree.swap(root.right, root.right.left)
      expect(tree.root.right.data.key).to.eq(60)

      tree.swap(tree.root.right, tree.root.right.right)
      expect(tree.root.right.data.key).to.eq(80)

      tree.swap(tree.root, tree.root.right)
      expect(tree.root.data.key).to.eq(80)
      expect(tree.root.right.data.key).to.eq(50)
      expect(tree.root.right.parent).to.eq(tree.root)
      expect(tree.root.left.parent).to.eq(tree.root)

      tree.swap(tree.root.left, tree.root)
      expect(tree.root.data.key).to.eq(25)
      expect(tree.root.left.data.key).to.eq(80)
      expect(tree.root.left.parent).to.eq(tree.root)
      expect(tree.root.right.parent).to.eq(tree.root)
    })

    it('can swap any two nodes (not just parent/child)', function () {
      tree.insert(12,  33)
      // swap siblings
      tree.swap(tree.root.left.left, tree.root.left.right)

      expect(tree.root.left.left.data.key).to.eq(33)
      expect(tree.root.left.left.parent.data.key).to.eq(25)
      expect(tree.root.left.right.data.key).to.eq(12)
      expect(tree.root.left.right.parent.data.key).to.eq(25)
    })
  })

  describe('#invert', function () {
    it('puts the max value at the root', function () {
      var tree = new Tree()
      tree.insert(20, 25)
      tree.invert()

      expect(tree.root.data.key).to.eq(25)
    })

    it('inverts all the subtrees', function () {
      var tree = new Tree()
      tree.insert(20, 25, 15, 22, 28)
      expect(tree.root.data.key).to.eq(20)
      expect(tree.root.left.data.key).to.eq(15)
      expect(tree.root.right.data.key).to.eq(25)

      tree.invert()

      expect(tree.root.data.key).to.eq(28)
      expect(tree.root.left.data.key).to.eq(15)
      expect(tree.root.right.data.key).to.eq(20)
      expect(tree.root.right.left.data.key).to.eq(22)
      expect(tree.root.right.right.data.key).to.eq(25)
    })
  })

  describe('traverse(fn, order)', function () {
    var expected = [12, 25, 30, 50, 75, 80]
    var expectedIdxs = [0, 1, 2, 3, 4, 5] 
    var expectedDepths = [3, 2, 3, 1, 2, 3]
    var preExpected = [50, 25, 12, 30, 75, 80]
    var postExpected = [12, 30, 25, 80, 75, 50]
    
    var tree, actual, actualIdxs, actualDepths

    beforeEach(function(){  // reset
      tree = new Tree()
      tree.insert(50, 25, 75, 12, 80, 30)
      actual = []
      actualIdxs = []
      actualDepths = []
    })

    function update(node, idx, depth) {
      actual.push(node && node.data.key || 0)
      actualIdxs.push(idx)
      actualDepths.push(depth)
    }

    it('calls `fn` for all tree nodes in the given `order`, with metadata', function () {
      tree.forEach(update)
      expect(actual).to.deep.eq(expected)
    });

    describe('fn(node, idx, depth)', function () {
      it('is called for each node', function () {
        expect(tree.isEmpty()).to.eq(false)
        tree.forEach(update)
        expect(actual).to.deep.eq(expected)
      });

      describe('node', function () {
        it('is the current node being visited', function () {
          tree.forEach(function (node, idx, depth) {
            expect(node).to.not.be.undefined
            expect(node.data.key).to.eq(expected[idx])
          })
        })
      })

      describe('idx', function () {
        it('is the index of the current node being visited', function () {
          tree.forEach(function (node, idx, depth) {
            expect(idx).to.eq(expectedIdxs[idx])
          })
        })
      })
      
      describe('depth', function () {
        it('is the depth of the current node being visited (root is at depth=1)', function () {
          tree.forEach(function (node, idx, depth) {
            expect(depth).to.eq(expectedDepths[idx])
          })
        })
      })
    })

    describe('order', function () {
      it('determines whether nodes are visited in pre-, in- or post-order', function () {})
      it('makes traversal happen in pre-order when set to `Tree.PRE_ORDER`', function () {
        tree.forEach(update, Tree.PRE_ORDER)
        expect(actual).to.deep.eq(preExpected)
      })
      it('makes traversal happen in order of key when set to `Tree.IN_ORDER`', function () {
        tree.forEach(update, Tree.IN_ORDER)
        expect(actual).to.deep.eq(expected)
      })
      it('makes traversal happen in post-order when set to `Tree.POST_ORDER`', function () {
        tree.forEach(update, Tree.POST_ORDER)
        expect(actual).to.deep.eq(postExpected)
      })
      it('defaults to `Tree.IN_ORDER`', function () {
        tree.forEach(update)
        expect(actual).to.deep.eq(expected)
      })
    })
  })
})
