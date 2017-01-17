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
		keys: function(obj){
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

		var p, cmp, n = top = this.root, k = this.keys(obj), v = obj
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
		var newNode = {k:k, v:[v], p:p || this.root, h:0}
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
		var p, cmp, n = this.root, k = this.keys(obj)
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

	forEach: function(){

	},
})


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
			if (prev == n.p) { // Traversing down the tree.
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
			var dc = longest(c)
//			console.info('rebalance: n.h=', n.h, 'bfn=', bfn, 'f=', f, 'd=', d, 'dc=', dc, 'n=', n)
//			if (n.r.h == 2) console.info('rebalance: n.r=', n.r)
			if (d !== dc) {
				var cc = c[dc]

				// LR / RL
//				console.info('rebalance: before reverse rotate: c=', c)
				c = rotate(tree, c, d)
//				console.info('rebalance: after reverse rotate: c=', c)

			}
			p = n.p
//			console.info('rebalance: rotate', p)
			var newRoot = rotate(tree, n, o)
//			console.info('rebalance: rotate: newRoot=', newRoot)
			if (!p)	tree.root = newRoot	
		}
		n = n.p
	}
}

function rotate(tree, n, d) {
//	console.info('rotate', n, d)
	var o = opp(d), c = n[o], rd = n.p ? (n.p.l == n ? 'l' : 'r') : 0
	n[o] = c[d]
	c.p = n.p
	if (rd) n.p[rd] = c
	n.p = c
	c[d] = n
	n.h -= 2
	c.h++
	return c
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