
function pretty(tree) {
	var nodes = {}
	tree.forEach(function (values, idx, depth, node) {
		console.info('forEach', values, idx, depth, node.k)
		if (!nodes[depth]) { nodes[depth] = [] }
		nodes[depth].push({idx:idx, depth:depth, l:!!node.l, r:!!node.r, data:values})
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
			output += tree.keys(node.data[0])
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
