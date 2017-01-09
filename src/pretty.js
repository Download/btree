
function pretty(tree) {
//	if (tree.root) {tree = tree.root}

	var nodes = {}
	tree.forEach(function (node, idx, depth) {
		if (!nodes[depth]) { nodes[depth] = [] }
		nodes[depth].push({idx:idx, depth:depth, data:node.data})
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
			var prev_idx = prev_node ? (prev_node.idx + 1) : 0
			var idx_diff = (node.idx+1) - prev_idx
			output += pretty.spaces(idx_diff * spaces_per_node + (idx_diff - 1))
			output += node.data[tree.key]
		}
		result += output + '\n'
	})

	return result
}

pretty.spaces = function spaces(number) {
  var spaces = '';
  for (var i = 0; i < number; i++) { spaces += ' '; }
  return spaces;
}

module.exports = pretty
