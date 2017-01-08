(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

module.exports = function Node(opts) {
  opts = opts || {};

  return {
    data: opts,
    left: opts.left,
    right: opts.right,
    parent: opts.parent,

    setRightChild: function setRightChild(node) {
      this.right = node;
      node.parent = this;
    },

    setLeftChild: function setLeftChild(node) {
      this.left = node;
      node.parent = this;
    },

    isRoot: function isRoot() {
      return !this.parent;
    },

    isLeaf: function isLeaf() {
      return !this.left && !this.right;
    },

    hasOneChild: function hasOneChild() {
      return this.right && !this.left || this.left && !this.right;
    },

    isRightChildOfParent: function isRightChildOfParent(parent) {
      return parent && parent.right === this;
    },

    isLeftChildOfParent: function isLeftChildOfParent(parent) {
      return parent && parent.left === this;
    },

    largestChild: function largestChild(key) {
      if (this.right && this.left) {
        return this.right.data[key] > this.left.data[key] ? this.right : this.left;
      }

      return this.right !== undefined ? this.right : this.left;
    }
  };
};

},{}],2:[function(require,module,exports){
'use strict';

var Node = require('./node');
var spaces = require('./util/spaces');

module.exports = function (opts) {
  opts = opts || {};

  return {
    key: opts.key || 'key',

    unique: opts.unique || false,

    findPaths: function findPaths() {
      var result = [];
      this._findPaths(this.root, [], result);

      return result;
    },

    _findPaths: function _findPaths(currentNode, currentPath, paths) {
      if (!currentNode) {
        return;
      }

      var newPath = currentPath.slice(0);
      newPath.push(currentNode);

      if (currentNode.isLeaf()) {
        paths.push(newPath);
      } else {
        this._findPaths(currentNode.left, newPath, paths);
        this._findPaths(currentNode.right, newPath, paths);
      }
    },

    isEmpty: function isEmpty() {
      return this.height() === 0;
    },

    find: function find(key) {
      return this._search(key, this.root);
    },

    next: function next(node) {
      if (!node) {
        return;
      }
      if (node.right) {
        return this.min(node.right);
      } else {
        var parent = node.parent;
        while (parent) {
          if (parent.left === node) {
            return parent;
          }
          node = parent;
          parent = parent.parent;
        }
      }
    },

    prev: function prev(node) {
      if (!node) {
        return;
      }
      if (node.left) {
        return this.max(node.left);
      } else {
        var parent = node.parent;
        while (parent) {
          if (parent.right === node) {
            return parent;
          }
          node = parent;
          parent = parent.parent;
        }
      }
    },

    _search: function _search(key, currentNode) {
      if (!currentNode) {
        return;
      } else if (currentNode.data[this.key] === key) {
        return currentNode;
      } else if (key < currentNode.data[this.key]) {
        return this._search(key, currentNode.left);
      } else if (key > currentNode.data[this.key]) {
        return this._search(key, currentNode.right);
      }
    },

    delete: function _delete(key) {
      var node = typeof key === 'number' ? this.find(key) : key;
      // no need to fail spectacularly on this
      // if (!node) { throw new Error('Cannot delete non-existent node'); }
      this._delete(node);
    },

    _delete: function _delete(node) {
      var parent = node.parent;

      if (node.isRoot()) {
        delete this.root;
      }

      // case 1: node is a leaf
      if (node.isLeaf()) {
        if (node.isRightChildOfParent(parent)) {
          delete parent.right;
        } else if (node.isLeftChildOfParent(parent)) {
          delete parent.left;
        }
        this.rebalance(parent);
      } // case 2: node with one child
      else if (node.hasOneChild()) {
          var child = node.left || node.right;

          if (node.isRightChildOfParent(parent)) {
            parent.right = child;
          } else if (node.isLeftChildOfParent(parent)) {
            parent.left = child;
          }

          child.parent = parent;
          this.rebalance(parent);
        } // case 3: node has two children
        else {
            var replacementNode = this.max(node.left);
            this.swap(node, replacementNode);
            this._delete(node);
          }
    },

    min: function min(currentNode) {
      return this._min(currentNode || this.root);
    },

    _min: function _min(currentNode) {
      return currentNode.left ? this._min(currentNode.left) : currentNode;
    },

    max: function max(currentNode) {
      return this._max(currentNode || this.root);
    },

    _max: function _max(currentNode) {
      return currentNode.right ? this._max(currentNode.right) : currentNode;
    },

    postOrderTraversal: function postOrderTraversal(callback, currentNode) {
      currentNode = arguments.length > 1 ? currentNode : this.root;

      if (currentNode.left) {
        this.postOrderTraversal(callback, currentNode.left);
      }

      if (currentNode.right) {
        this.postOrderTraversal(callback, currentNode.right);
      }

      callback(currentNode);
    },

    preOrderTraversal: function preOrderTraversal(callback, currentNode) {
      currentNode = arguments.length > 1 ? currentNode : this.root;

      callback(currentNode);

      if (currentNode.left) {
        this.preOrderTraversal(callback, currentNode.left);
      }

      if (currentNode.right) {
        this.preOrderTraversal(callback, currentNode.right);
      }
    },

    inOrderTraversal: function inOrderTraversal(callback, currentNode, depth) {
      if (arguments.length === 1) {
        currentNode = this.root;
        this._sequence = 1;
        depth = 1;
      }

      if (currentNode.left) {
        this.inOrderTraversal(callback, currentNode.left, depth + 1);
      }

      callback(currentNode, this._sequence++, depth);

      if (currentNode.right) {
        this.inOrderTraversal(callback, currentNode.right, depth + 1);
      }
    },

    insert: function insert(node) {
      if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments);
        for (var i = 0, arg; i < args.length; i++) {
          this.insert(args[i]);
        }
        return;
      }

      if (typeof node == 'number') {
        var data = {};
        data[this.key] = node;
        node = new Node(data);
      }

      if (!this.root) {
        this.root = node;
      } else {
        this._insert(node, this.root);
      }
    },

    _insert: function _insert(node, currentRoot) {
      if (node.data[this.key] === currentRoot.data[this.key] && this.unique) {
        throw new Error('Duplicate key violation');
      } else if (node.data[this.key] > currentRoot.data[this.key]) {
        if (currentRoot.right) {
          this._insert(node, currentRoot.right);
        } else {
          currentRoot.setRightChild(node);
          this.rebalance(currentRoot.parent);
        }
      } else if (node.data[this.key] < currentRoot.data[this.key]) {
        if (currentRoot.left) {
          this._insert(node, currentRoot.left);
        } else {
          currentRoot.setLeftChild(node);
          this.rebalance(currentRoot.parent);
        }
      }
    },

    invert: function invert(node) {
      var node = arguments.length > 0 ? node : this.root;
      if (!node) {
        return;
      }
      if (this.height(node) === 1) {
        return;
      }

      this.invert(node.left);
      this.invert(node.right);

      var parent = node;
      var child = node.largestChild(this.key);
      this.swap(parent, child);

      if (child.isRoot()) {
        this.root = child;
      }
    },

    swap: function swap(n1, n2) {
      var n1parent = n1.parent;
      var n1left = n1.left;
      var n1right = n1.right;

      var n2parent = n2.parent;
      var n2left = n2.left;
      var n2right = n2.right;

      // connect nodes surrounding n1 and n2 to new nodes
      if (n1parent) {
        if (n1parent.right === n1) {
          n1parent.right = n2;
        } else {
          n1parent.left = n2;
        }
      }
      if (n1left) {
        n1left.parent = n2;
      }
      if (n1right) {
        n1right.parent = n2;
      }

      if (n2parent) {
        if (n2parent.right === n2) {
          n2parent.right = n1;
        } else {
          n2parent.left = n1;
        }
      }
      if (n2left) {
        n2left.parent = n1;
      }
      if (n2right) {
        n2right.parent = n1;
      }

      // now connect n1 and n2 to their correct surroundings
      n2.parent = n1parent !== n2 ? n1parent : n1;
      n2.right = n1right !== n2 ? n1right : n1;
      n2.left = n1left !== n2 ? n1left : n1;

      n1.parent = n2parent !== n1 ? n2parent : n2;
      n1.right = n2right !== n1 ? n2right : n2;
      n1.left = n2left !== n1 ? n2left : n2;

      if (n1.isRoot()) {
        this.root = n1;
      } else if (n2.isRoot()) {
        this.root = n2;
      }
    },

    rebalance: function rebalance(node) {
      if (!node) {
        return;
      }

      var height_left = this.height(node.left);
      var height_right = this.height(node.right);

      var diff = height_left - height_right;
      if (diff === 2) {
        var child = node.left;

        if (this.height(child.right) > this.height(child.left)) {
          this.rotateLeft(child);
          node.left = child.parent;
        }

        this.rotateRight(node);
      } else if (diff === -2) {
        var child = node.right;

        if (this.height(child.left) > this.height(child.right)) {
          this.rotateRight(child);
          node.right = child.parent;
        }

        this.rotateLeft(node);
      }

      this.rebalance(node.parent);
    },

    rotateLeft: function rotateLeft(node) {
      var parent = node.parent;
      var child = node.right;
      var child_left_child = child.left;

      child.parent = parent;
      if (parent) {
        if (parent.right === node) {
          parent.right = child;
        } else if (parent.left === node) {
          parent.left = child;
        }
      }
      child.left = node;

      node.parent = child;
      node.right = child_left_child;
      if (child_left_child) {
        child_left_child.parent = node;
      }

      if (!parent) {
        this.root = child;
      }
    },

    rotateRight: function rotateRight(node) {
      var parent = node.parent;
      var child = node.left;
      var child_right_child = child.right;

      child.parent = parent;
      if (parent) {
        if (parent.right === node) {
          parent.right = child;
        } else if (parent.left === node) {
          parent.left = child;
        }
      }
      child.right = node;

      node.parent = child;
      node.left = child_right_child;
      if (child_right_child) {
        child_right_child.parent = node;
      }

      if (!parent) {
        this.root = child;
      }
    },

    height: function height(node) {
      var node = arguments.length > 0 ? node : this.root;
      if (!node) {
        return 0;
      }

      return 1 + Math.max(this.height(node.left), this.height(node.right));
    }
  };
};

},{"./node":1,"./util/spaces":3}],3:[function(require,module,exports){
'use strict';

module.exports = function (number) {
  var spaces = '';
  for (var i = 0; i < number; i++) {
    spaces += ' ';
  }
  return spaces;
};

},{}],4:[function(require,module,exports){
'use strict';

var Tree = require('./tree');
var Node = require('./node');

module.exports = {
  Tree: Tree,
  Node: Node
};

},{"./node":1,"./tree":2}]},{},[4]);
