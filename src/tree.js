function Tree(o) {
  if (! this instanceof Tree) return new Tree(o)
  this.p = o instanceof Tree ? o : undefined,
  console.log('Tree: this.p=', this.p)
  o = extend({}, Tree.OPTIONS, this.p ? this.p.options : o)
  if (! this.p) {this.root = new Tree(this); delete this.root.p}
  Object.defineProperties(this, {
    options: {get: function options(){return this.p ? this.p.options : o}},
    size: {enumerable:true, get:function size() {return s(rt(this))}},
    height: {enumerable:true, get:function height() {return h(rt(this))}},
    min: {get:function min() {return m(rt(this), 'l')}},
    max: {get:function max() {return m(rt(this), 'r')}},
    prev: {get:function prev() {return go(rt(this), 'l')}},
    next: {get:function next() {return go(rt(this), 'r')}},
  })
}

extend(Tree.prototype, {
  isEmpty: function isEmpty() {return ! rt(this).d},
  isParent: function isParent(){return !!(rt(this).l || rt(this).r)},

  forEach: function forEach(fn, order, n, idx, depth) {
    order = order || Tree.IN_ORDER
    n = n === undefined ? rt(this) : n;
    idx = idx === undefined ? 0 : idx
    depth = depth ? depth + 1 : 1
    if (n && n.d) {
      if (order === Tree.PRE_ORDER) fn(n, idx++, depth)
      idx = n.forEach(fn, order, n.l || null, idx, depth)
      if (order === Tree.IN_ORDER) fn(n, idx++, depth)
      idx = n.forEach(fn, order, n.r || null, idx, depth)
      if (order === Tree.POST_ORDER) fn(n, idx++, depth)
    }
    return idx
  },

  get: function get(obj) {
    var k = this.options.key(obj), comp = this.options.compare(k, rt(this).d.k),
        c = (comp < 0 && rt(this).l) || (comp > 0 && rt(this).r)
    return comp === 0 ? rt(this) : c && c.get(k)
  },

  set: function set(obj) {
    var c, comp, args, o = this.options
    if (args = ((arguments.length > 1 && [].slice.call(arguments)) || (Array.isArray(obj) && obj))) {
      for (var i=0; i<args.length; i++) this.set(args[i])
      return this
    }

    if (!rt(this).d) {
      rt(this).d = {k:o.key(obj), v:[obj]}
      return this
    } 

    if ((comp = o.compare(o.key(obj), rt(this).d.k)) === 0) { 
      if (o.unique) throw new UniqueConstraintViolation(o.key(obj))
      rt(this).d.v.push(obj)
      return this
    }

    var c = comp > 0 
        ? (rt(this).r || (rt(this).r = new Tree(rt(this)))) 
        : (rt(this).l || (rt(this).l = new Tree(rt(this))))
/*
    if (comp > 0) {
      c = rt(this).r
      if (! rt(this) )
    }
*/
    console.info(rt(this) == c)
    c.set(obj)
    var newRoot = rebalance(rt(this));
    if (this.root) this.root = newRoot || this.root
    return this;
  },

  del: function del(obj) {
    var comp, args, o = this.options
    if (args = (arguments.length > 1 && [].slice.call(arguments)) || (Array.isArray(obj) && obj)) {
      for (var i=0; i<args.length; i++) this.del(args[i])
      return this
    }

    var n = obj instanceof Tree ? obj : this.find(o.key(obj))
    if (!n) return this

    var p = n.p;
    if (! n.isParent()) {
      if (p && n === p.r) delete p.r
      else if (p && n === p.l) delete p.l
      else delete n.d
      if (this.root) this.root = rebalance(p) || n
      return this
    } 
    
    if ((n.r && !n.l) || (n.l && !n.r)) {
      var c = n.l || n.r
      if (p && n === p.r) p.r = c
      else if (p && n == p.l) p.l = c
      else delete n.d
      c.p = p
      if (this.root) this.root = rebalance(p) || c
      return this
    } 

    swap(n, n.l.max);
    this.del(n);
  }
})

Tree.PRE_ORDER = 1
Tree.IN_ORDER = 2
Tree.POST_ORDER = 3
Tree.OPTIONS = {
  unique: false,
  keys: ['id'],
  comparable: function(val) {
    return (typeof x == 'number') || (x instanceof Number) ||
            (typeof x == 'string' || x instanceof String) || (x instanceof Date)
  },
  compare: function(x, y) {
    if (x && x.compare) return x.compare(y)
    if (y && y.compare) return 0 - y.compare(x)
    for (var i=0; i<x.length; i++) {
      if (x[i] < y[i]) return -1
      if (x[i] > y[i]) return 1
    }
    return x == y ? 0 : 1
  },
  key: function key(obj){
    var results = [];
    for (var i=0,x; x=this.keys[i]; i++) {
      results.push(obj[x]);
    }
    return results;
  }
}

function rt(n){return n && n.root || n}

function h(n){
  return (!n || !n.d 
      ? 0 
      : 1 + Math.max(
        h(n.l), 
        h(n.r)
      )
  )
}

function s(n){return !n || !n.d ? 0 : 1 + s(n.l) + s(n.r)}
function m(n,d) {return n[d] ? m(n[d]) : n.d && n}
function go(n,d) {
  if (!n || !n.d) return
  var p = c = n, o = d == 'l' ? 'r' : 'l'
  if (n[d]) return m(n[d], d)
  while (p = p.p) {
    if (p[o] == c) return p
    c = p;
  }
}


function rebalance(n) {
  if (!n) return n
  console.info('rebalance', n.l == n, n.r == n)
  var p = n.p, 
      diff = h(n.l) - h(n.r), 
      d = diff == 2 
        ? 'l' 
        : (diff == -2 
          ? 'r' 
          : undefined
        )
  if (d) {
    var o = d == 'l' ? 'r' : 'l', c = n[d]
    if (h(c[o]) > h(c[d])) {
      rotate(c, d);
      n[d] = c.p;
    }
    n = rotate(n, o);
  }      
  return rebalance(p) || n
}

function rotate(n, d) {
  var o = d == 'l' ? 'r' : 'l', p = n.p, c = n[o]
  c.p = p
  if (p) {
    if (p[o] === n) {
      p[o] = c;
    } else if (p[d] === n) {
      p[d] = c
    }
  }
  c[d] = n
  n.p = c
  n[o] = c[d]
  if (c[d]) c[d].p = n
  return c
}

function swap(n1, n2) {
  var n1p = n1.p, n1l = n1.l, n1r = n1.r, n2p = n2.p, n2l = n2.l, n2r = n2.r
  // connect nodes surrounding n1 and n2 to new nodes
  if (n1p) {
    if (n1p.r === n1) n1p.r = n2 
    else n1p.l = n2
  }
  if (n1l) n1l.p = n2
  if (n1r) n1r.p = n2
  if (n2p) {
    if (n2p.r === n2) n2p.r = n1
    else n2p.l = n1
  }
  if (n2l) n2l.p = n1
  if (n2r) n2r.p = n1
  // now connect n1 and n2 to their correct surroundings
  n2.p = n1p !== n2 ? n1p : n1
  n2.r = n1r !== n2 ? n1r : n1
  n2.l = n1l !== n2 ? n1l : n1
  n1.p = n2p !== n1 ? n2p : n2
  n1.r = n2r !== n1 ? n2r : n2
  n1.l = n2l !== n1 ? n2l : n2
  return !n1.p ? n1 : !n2.p ? n2 : undefined
}

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
module.exports.UniqueConstraintViolation = UniqueConstraintViolation
