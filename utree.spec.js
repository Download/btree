var expect = require('chai').expect
var Tree = require('./utree')
var TreeIterator = require('./utree').TreeIterator
var pretty = require('./pretty')

describe('Tree(options)', function(){
	var tree

	beforeEach(function(){
		tree = new Tree()
	})
/*
	it('is a constructor function', function(){
		expect(Tree).to.be.a('function')
	})

	it('creates an instance of `Tree`', function(){
		expect(tree).to.be.an.instanceof(Tree)
	})

	it('creates an ES2015 Iterable object', function(){
		expect(tree).to.have.a.property(Symbol.iterator)
		expect(tree[Symbol.iterator]).to.be.a('function')
		expect(tree[Symbol.iterator]()).to.be.an('object')
		expect(tree[Symbol.iterator]()).to.have.a.property('next')
		expect(tree[Symbol.iterator]().next).to.be.a('function')
	})

	it('accepts an optional parameter `options`', function(){
		expect(new Tree({})).to.be.an.instanceof(Tree)
	})

 	describe('set(obj)', function(){
		it('is a method on instances of Tree', function(){
			expect(tree).to.have.a.property('set')
			expect(tree.set).to.be.a('function')
		})

		it('accepts an object to add to the tree', function(){
			tree.set({id:1})
			expect(tree).to.have.a.property('root')
			expect(tree.root).to.have.a.property('k')
			expect(tree.root.k).to.deep.eq([1])
		})
		
		it('accepts an array of objects to add to the tree', function(){
			tree.set([{id:1}, {id:2}, {id:3}])
			expect(tree).to.have.a.property('root')
			expect(tree.root).to.have.a.property('k')
			expect(tree.root.k).to.deep.eq([2])
		})
		
		it('accepts multiple arguments to add to the tree', function(){
			tree.set({id:1}, {id:2}, {id:3})
			expect(tree).to.have.a.property('root')
			expect(tree.root).to.have.a.property('k')
			expect(tree.root.k).to.deep.eq([2])
		})
		
		it('creates a binary tree from the added items', function(){
			tree.set({id:10})
			tree.set({id:20})
			tree.set({id:5})
			expect(tree).to.have.a.property('root')
			expect(tree.root).to.have.a.property('k')
			expect(tree.root.k).to.deep.eq([10])
			expect(tree.root).to.have.a.property('h')
			expect(tree.root.h).to.eq(2)
			expect(tree.root).to.have.a.property('r')
			expect(tree.root.r).to.have.a.property('k')
			expect(tree.root.r.k).to.deep.eq([20])
			expect(tree.root.r).to.have.a.property('h')
			expect(tree.root.r.h).to.eq(1)
			expect(tree.root).to.have.a.property('l')
			expect(tree.root.l).to.have.a.property('k')
			expect(tree.root.l.k).to.deep.eq([5])
			expect(tree.root.l).to.have.a.property('h')
			expect(tree.root.l.h).to.eq(1)
		})

*/		
		it('automatically re-balances the tree as items are added', function(){
			function id(id){return {id:id, toString:function(){return id.toString()}, valueOf:function(){id.toString()}}}
			tree.set(id(10), id(20), id(30))
			expect(tree).to.have.a.property('root')
			expect(tree.root).to.have.a.property('k')
			expect(tree.root.k).to.deep.eq([20])
			expect(tree.root).to.have.a.property('r')
			expect(tree.root.r).to.have.a.property('k')
			expect(tree.root.r.k).to.deep.eq([30])
			expect(tree.root).to.have.a.property('l')
			expect(tree.root.l).to.have.a.property('k')
			expect(tree.root.l.k).to.deep.eq([10])
			/*
			tree = new Tree()
			tree.set({id:10}, {id:30}, {id:20})
			expect(tree).to.have.a.property('root')
			expect(tree.root).to.have.a.property('k')
			expect(tree.root.k).to.deep.eq([20])
			expect(tree.root).to.have.a.property('r')
			expect(tree.root.r).to.have.a.property('k')
			expect(tree.root.r.k).to.deep.eq([30])
			expect(tree.root).to.have.a.property('l')
			expect(tree.root.l).to.have.a.property('k')
			expect(tree.root.l.k).to.deep.eq([10])
			tree = new Tree()
			tree.set({id:30}, {id:10}, {id:20}, {id:40}, {id:50}, {id:60})
			expect(tree).to.have.a.property('root')
			expect(tree.root).to.have.a.property('k')
			expect(tree.root.k).to.deep.eq([30])
			expect(tree.root).to.have.a.property('r')
			expect(tree.root.r).to.have.a.property('k')
			expect(tree.root.r.k).to.deep.eq([50])
			expect(tree.root).to.have.a.property('l')
			expect(tree.root.l).to.have.a.property('k')
			expect(tree.root.l.k).to.deep.eq([20])
			*/
		})
	})
/*
	describe('get(obj)', function(){
		beforeEach(function(){
			tree.set({id:30}, {id:10}, {id:20}, {id:40}, {id:50}, {id:60})
		})

		it('is a method on instances of Tree', function(){
			expect(tree).to.have.a.property('get')
			expect(tree.get).to.be.a('function')
		})

		it('accepts an object with key to get from the tree', function(){
			var arr = tree.get({id:20})
			expect(arr).to.not.be.undefined
		})
		
		it('returns an array with one or more objects associated with key', function(){
			var arr = tree.get({id:20})
			expect(arr).to.not.be.undefined
			expect(arr).to.be.an('array')
			expect(arr.length).to.eq(1)
			expect(arr[0]).to.be.an('object')
			expect(arr[0]).to.have.a.property('id')
			expect(arr[0].id).to.eq(20)
		})
		
		it('accepts an array of objects to get from the tree', function(){
			var arr = tree.get([{id:20}, {id:30}])
			expect(arr).to.not.be.undefined
		})
		
		it('accepts multiple arguments to get from the tree', function(){
			var arr = tree.get({id:20}, {id:30})
			expect(arr).to.not.be.undefined
		})
		
		it('returns an array of arrays when called with an array or multiple arguments', function(){
			var arr = tree.get([{id:20}, {id:30}])
			expect(arr).to.not.be.undefined
			expect(arr).to.be.an('array')
			expect(arr.length).to.eq(2)
			expect(arr[0]).to.be.an('array')
			expect(arr[0].length).to.eq(1)
			expect(arr[0][0]).to.have.a.property('id')
			expect(arr[0][0].id).to.eq(20)
			expect(arr[1]).to.be.an('array')
			expect(arr[1].length).to.eq(1)
			expect(arr[1][0]).to.have.a.property('id')
			expect(arr[1][0].id).to.eq(30)
			arr = tree.get({id:20}, {id:30})
			expect(arr).to.not.be.undefined
			expect(arr).to.be.an('array')
			expect(arr.length).to.eq(2)
			expect(arr[0]).to.be.an('array')
			expect(arr[0].length).to.eq(1)
			expect(arr[0][0]).to.have.a.property('id')
			expect(arr[0][0].id).to.eq(20)
			expect(arr[1]).to.be.an('array')
			expect(arr[1].length).to.eq(1)
			expect(arr[1][0]).to.have.a.property('id')
			expect(arr[1][0].id).to.eq(30)
		})
	})
	
	describe('del(obj)', function(){
		it('is a method on instances of Tree', function(){
			expect(tree).to.have.a.property('del')
			expect(tree.del).to.be.a('function')
		})
	})
	
	describe('forEach(fn [, order])', function(){
		it('is a method on instances of Tree', function(){
			expect(tree).to.have.a.property('forEach')
			expect(tree.forEach).to.be.a('function')
		})

		it('accepts a function which it calls for each key in the tree', function(){
			tree.set({id:30}, {id:10}, {id:20}, {id:40}, {id:50}, {id:60})
			expect(tree).to.have.a.property('forEach')
			expect(tree.forEach).to.be.a('function')
			var called = 0, expected = 6
			tree.forEach(function(){called++})
			expect(called).to.eq(expected)
		})

		it('defaults to Tree.IN_ORDER traversal', function(){
			tree.set({id:30}, {id:10}, {id:20}, {id:40}, {id:50}, {id:60})
			console.info(pretty(tree))
			var results = [], expected = [{id:10}, {id:20}, {id:30}, {id:40}, {id:50}, {id:60}]
			tree.forEach(function(values){results.push(values[0])})
			expect(results).to.deep.eq(expected)
		})

		it('accepts a second argument `order`', function(){
			tree.set({id:30}, {id:10}, {id:20}, {id:40}, {id:50}, {id:60})
			var results = [], expected = [{id:30}, {id:20}, {id:10}, {id:50}, {id:40}, {id:60}]
			tree.forEach(function(values){results.push(values[0])}, Tree.PRE_ORDER)
			expect(results).to.deep.eq(expected)
		})

			// tree.forEach(function(items, idx, depth, node){
			// 	expect(items).to.be.an('array')
			// 	expect(idx).to.eq(called++)
			// })

	})

	describe('preOrder()', function(){
		it('is a method on instances of Tree', function(){
			expect(tree).to.have.a.property('preOrder')
			expect(tree.preOrder).to.be.a('function')
		})

		it('accepts no arguments', function(){
			var result = tree.preOrder()
			expect(result).to.not.be.undefined
		})

		it('returns a TreeIterator', function(){
			var result = tree.preOrder()
			expect(result.constructor.name).to.eq('TreeIterator')
		})
	})
	
	describe('inOrder()', function(){
		it('is a method on instances of Tree', function(){
			expect(tree).to.have.a.property('inOrder')
			expect(tree.inOrder).to.be.a('function')
		})

		it('accepts no arguments', function(){
			var result = tree.inOrder()
			expect(result).to.not.be.undefined
		})

		it('returns a TreeIterator', function(){
			var result = tree.inOrder()
			expect(result.constructor.name).to.eq('TreeIterator')
		})
	})
	
	describe('postOrder()', function(){
		it('is a method on instances of Tree', function(){
			expect(tree).to.have.a.property('postOrder')
			expect(tree.postOrder).to.be.a('function')
		})

		it('accepts no arguments', function(){
			var result = tree.postOrder()
			expect(result).to.not.be.undefined
		})

		it('returns a TreeIterator', function(){
			var result = tree.postOrder()
			expect(result.constructor.name).to.eq('TreeIterator')
		})
	})
	
	describe('TreeIterator(tree, order)', function(){
		it('is a constructor function', function(){
			expect(TreeIterator).to.be.a('function')
		})

		it('accepts parameters `tree` and `order`', function(){
			var iterator = new TreeIterator(tree, Tree.IN_ORDER)
			expect(iterator).to.not.be.undefined
			expect(iterator).to.be.an('object')
		})

		it('returns an instance of TreeIterator', function(){
			var iterator = new TreeIterator(tree)
			expect(iterator).to.be.an.instanceof(TreeIterator)
		})

		describe('next()', function(){
			var iterator

			beforeEach(function(){
				iterator = new TreeIterator(tree, Tree.IN_ORDER)
			})

			it('is a method on TreeIterator instances', function(){
				expect(iterator).to.have.a.property('next')
				expect(iterator.next).to.be.a('function')
			})

			it('accepts no arguments', function(){
				expect(iterator.next).to.not.throw
			})

			it('consforms to the ES2015 iteration protocol', function(){
				expect(iterator).to.have.a.property('next')
				expect(iterator.next).to.be.a('function')
			})

			it('returns an object', function(){
				var result = iterator.next()
				expect(result).to.not.be.undefined
				expect(result).to.be.an('object')
				expect(result).to.have.a.property('done')
				expect(result.done).to.eq(true)
			})

			it('traverses items using Tree.IN_ORDER traversal', function(){
				tree.set({id:50},{id:30},{id:40},{id:10})
				iterator = tree.inOrder()
				var result = iterator.next()
				expect(result).to.not.be.undefined
				expect(result).to.be.an('object')
				expect(result).to.have.a.property('done')
				expect(result.done).to.eq(false)
				expect(result).to.have.a.property('value')
				expect(result.value).to.deep.eq([{id:10}])
				result = iterator.next()
				expect(result.done).to.eq(false)
				expect(result.value).to.deep.eq([{id:30}])
				result = iterator.next()
				expect(result.done).to.eq(false)
				expect(result.value).to.deep.eq([{id:40}])
				result = iterator.next()
				expect(result.done).to.eq(false)
				expect(result.value).to.deep.eq([{id:50}])
				result = iterator.next()
				expect(result.done).to.eq(true)
			})		
		})
	})
})

function sanityCheck(node) {
	if (! node) return
	if (node) {
		console.info('sanityCheck')
		if (node.p && (! (node.p.l === node || node.p.r === node))) {
			console.error('node has a parent that does not have node as a child', node)
		}
		if (node.l && node.l.p !== node) {
			console.error('node has a left child whose parent does not point to node', node)
		}
		if (node.r && node.r.p !== node) {
			console.error('node has a right child whose parent does not point to node', node)
		}
		sanityCheck(node.l)
		sanityCheck(node.r)
	}
}

describe('pretty', function () {
  it('returns a pretty-printed string representation of the tree', function () {
    var tree = new Tree()
    tree.set({id:2}, {id:3}, {id:5}, {id:7}, {id:9}, {id:11})
//		sanityCheck(tree.root)
//		var it = tree.inOrder()

		//
//    var expected = '                       7\n           3                 9\n     2           5                 11\n';
//    var actual = pretty(tree)
//    expect(actual).to.eq(expected)
  })

  // it('returns a pretty-printed string representation of the tree', function () {
  //   var tree = new Tree()
  //   tree.set({id:2}, {id:3}, {id:5}, {id:7}, {id:9}, {id:11})
  //   var expected = '                       7\n           3                 9\n     2           5                 11\n';
  //   var actual = pretty(tree);
  //   expect(actual).to.eq(expected)
  // })

	// describe('spaces', function () {
	// 	it('returns the number of spaces passed in as first argument', function () {
	// 		var generated = spaces(22)
	// 		expect(generated.length).to.eq(22)
	// 		for (var i=0, len=generated.length; i<len; i++) {
	// 			expect(generated.charAt(i)).to.eq(' ')
	// 		}
	// 	})
	// })
})

*/
