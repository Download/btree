var spaces = require('./util/spaces');

module.exports = function pretty(tree) {
	if (tree.root) {tree = tree.root}

	var nodes = {}
	tree.inOrderTraversal(function (node, sequence, depth) {
		node.sequence = sequence
		node.depth = depth
		if (!nodes[depth]) { nodes[depth] = []; }
		nodes[depth].push(node)
	})

	var spaces_per_node = 5
	var node_depths = Object.keys(nodes)

	var result = ''
	node_depths.forEach(function (depth) {
		var nodes_at_depth = nodes[depth]
		var output = ''
		for (var i = 0; i < nodes_at_depth.length; i++) {
			var node = nodes_at_depth[i]
			var prev_node = nodes_at_depth[i - 1]
			var prev_sequence = prev_node ? prev_node.sequence : 0
			var sequence_diff = node.sequence - prev_sequence
			output += spaces(sequence_diff * spaces_per_node + (sequence_diff - 1))
			output += node.data[tree.key]
		}
		result += output + '\n'
	})

	return result
}
