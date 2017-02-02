function Tree(options) {
	extend(this, Tree.OPTIONS, options)
}

extend(Tree, {
	PRE_ORDER: 1,
	IN_ORDER: 2,
	POST_ORDER: 3,
	OPTIONS: {
		unique: false,
		keyProps: ['id'],
		key: function(obj){
			var i, p, result = []
			for (i=0; p=this.keyProps[i]; i++) result.push(obj[p])
			return result
		},
		compare: function(x,y) {
			for (var i=0; i<this.keyProps.length; i++) {
				if (x[i] < y[i]) return -1
				if (x[i] > y[i]) return 1
			}
			return 0
		},
	}
})

extend(Tree.prototype, {
	set: function(obj) {
		var i, args
		if (args = arguments.length > 1 ? [].slice.call(arguments) : Array.isArray(obj) ? obj : undefined) {
			for (i=0; i<args.length; i++) this.set(args[i])
			return
		}

		var p, cmp, n = top = this.root, k = this.key(obj), v = obj
		while (n && ((cmp = this.compare(k, n.k)) !== 0)) {
			var d = dir(cmp)
			if (longest(n)) top = n
			p = n
			n = p[d]
		}
		if (n) {
			if (this.unique) throw new UniqueConstraintViolation(k)
			n.v.push(v)
			return n;
		}
		var newNode = node(k, v, p) // {k:k, v:[v], p:p || this.root, h:0}
		if (p) p[d] = newNode
		else this.root = newNode
		rebalance(this, newNode, top || this.root)
	},

	get: function(obj){
		var results = [], i, args
		if (args = arguments.length > 1 ? [].slice.call(arguments) : Array.isArray(obj) ? obj : undefined) {
			for (i=0; i<args.length; i++) results.push(this.get(args[i]))
			return results
		}
		var p, cmp, n = this.root, k = this.key(obj)
		while (n && ((cmp = this.compare(k, n.k)) !== 0)) {
			var d = dir(cmp)
			p = n
			n = p[d]
		}
		return n && n.v
	},

	del: function(){

	},

	preOrder: function(){return new TreeIterator(this, Tree.PRE_ORDER)},
	inOrder: function(){return new TreeIterator(this)},
	postOrder: function(){return new TreeIterator(this, Tree.POST_ORDER)},

	forEach: function(fn, order){
		var r, it = new TreeIterator(this, order)
		while (! (r = it.next()).done) {
			fn(r.value, r.index, r.depth, r.node)
		}
	},
})

function node(k, v, p){
	return {
		k:k, 
		v:[v], 
		p:p || this.root, 
		h:0,
		valueOf: function(){return this.k + ':' + this.v + (this.l || this.r ? '(' + (this.l || '') + ',' + (this.r || '') + ')' : '')}
	}
}

// Support ES2015 iterators
if (typeof Symbol == 'function' && Symbol.iterator) {Tree.prototype[Symbol.iterator] = Tree.prototype.inOrder}

function TreeIterator(tree, order) {
	extend(this, {
		next: traverse(tree.root, order || Tree.IN_ORDER)
	})
}

function traverse(n, order) {
	var idx = 0, depth = 0, prev
	function result(n) {return {done:false, value:n.v, index:idx++, depth:depth, node:n}}
	return function next(){
		var res
		while (!res && n) {
			console.info('traverse', res, n && n.k, prev && prev.k, prev && prev.p && prev.p.k, n && n.p && n.p.k)
			if (prev && prev.p && n && n.p && prev.p === n.p) {
				// infinite loop
				console.info('traverse prev.p.l===prev', prev.p.l===prev)
				console.info('traverse prev.p===n.p', prev.p===n.p)
				console.info('traverse prev.p.l===n', prev.p.l===n)
				console.info('traverse prev.p.r===n', prev.p.r===n)
			}
			if (prev == n.p) { // Traversing down the tree.
				console.info('traversing down')
				if (order == Tree.PRE_ORDER) res = result(n)
				prev = n
				if (n.l) {
					n = n.l
					depth++
				}
				else {
					if (order == Tree.IN_ORDER) res = result(n)
					if (n.r) {
						n = n.r
						depth++
					}
					else {
						if (order == Tree.POST_ORDER) res = result(n)
						n = n.p
						depth--
					}
				}
			} 
			else if (prev == n.l) { // Traversing up the tree from the left.
				console.info('traversing up from left')
				prev = n
				if (order == Tree.IN_ORDER) res = result(n)
				if (n.r) {
					n = n.r
					depth++
				}
				else {
					if (order == Tree.POST_ORDER) res = result(n)
					n = n.p
					depth--
				}
			} 
			else if (prev == n.r) { // Traversing up the tree from the right.
				console.info('traversing up from right')
				prev = n
				if (order == Tree.POST_ORDER) res = result(n)
				n = n.p
				depth--
			}
		}
		return res || {done:true}
	}
}


// https://upload.wikimedia.org/wikipedia/commons/c/c4/Tree_Rebalancing.gif
// we look only at LeftLeft and LeftRight as the other two are mirror images
//         5        5
//        /       /
//       3      3
//      /        \
//     2          4
//
//      LL       LR

function rebalance(tree, n, top) {
//	console.info('rebalance', n.k)
	var p, f;
	while (n !== top.p) {
		n.h = height(n)
		var bfn = bf(n)
		var f = Math.abs(bfn)
		if (f > 1) {
			var d = longest(n)
			var o = opp(d)
			var c = n[d] // child
//			console.info('rebalance: n.h=', n.h, 'bfn=', bfn, 'f=', f, 'd=', d, 'dc=', dc, 'n=', n)
//			if (n.r.h == 2) console.info('rebalance: n.r=', n.r)
			if (d !== longest(c)) {
//				var cc = c[dc]

				// LR / RL
				console.info('rebalance: before reverse rotate: \nc=', c)
				rotate(tree, c, d)
				sanityCheck(tree.root)
				console.info('rebalance: after reverse rotate: \nc=', c)

			}
			console.info('rebalance: before rotate: \nn=', n, '\nn.p=', n.p)
			rotate(tree, n, o)
			console.info('rebalance: rotate: \nn=', n, '\nn.p=', n.p)
			sanityCheck(tree.root)
		}
		n = n.p
	}
}

function rotate(tree, n, d) {
	console.info('rotate ' + (d === 'r' ? 'right' : 'left') + ': \nn=', n, '\nd=', d)
	var o = opp(d), c = n[o], p = n.p
	n[o] = c[d]
	n.p = c
	c[d] = n
	c.p = p
	if (c.p) c.p[d] = n
	n.h--
	c.h++
	if (!p) tree.root = c;
	sanityCheck(c)
	return c
}

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


function h(n){
//	console.info('h', n)
	return n && n.h ? n.h : 0
}
function height(n){
//	console.info('height', n)
	var hl = h(n.l),
			hr = h(n.r)
	return 1 + Math.max(hl, hr)
}
function dir(cmp){return cmp < 0 ? 'l' : 'r'}
function opp(dir){return dir == 'l' ? 'r' : 'l'}
function bf(n){return n ? h(n.l) - h(n.r) : 0}
function longest(n){var f = bf(n); return f > 0 ? 'l' : (f < 0 ? 'r' : 0)}

function UniqueConstraintViolation(keys) {
  if (! this instanceof UniqueConstraintViolation) return new UniqueConstraintViolation(keys)
  var e = new Error(), s = e.stack && e.stack.split && e.stack.split(/\r?\n/g) || []
  if (s[0] && s[0] === 'Error') s[0] = this.name
  if (s[1] && s[1].indexOf && s[1].indexOf('UniqueConstraintViolation') !== -1) s.splice(1,1)
  s = s.join('\n')
  Object.defineProperties(this, {stack: {get: function(){return s}}})
  this.message = 'A record with the key(s) [' + keys + '] already exists.'
}
UniqueConstraintViolation.prototype = extend(new Error(), {
  name: 'UniqueConstraintViolation',
  constructor: UniqueConstraintViolation,
  inspect: function inspect() {return this.name + ': ' + this.message + '\n' + this.stack}
})

function extend() {
  var args = [].slice.call(arguments), dst = args.shift()
  for (var a=0,arg; a<args.length; a++) {
    if (arg=args[a]) {
      var keys = Object.keys(arg)
      for (var k=0,key; key=keys[k]; k++) {
        dst[key] = arg[key]
      }
    }
  }
  return dst
}

module.exports = Tree
module.exports.TreeIterator = TreeIterator
module.exports.UniqueConstraintViolation = UniqueConstraintViolation