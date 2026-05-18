// ── Tree layout engine (absolute positioning + SVG connectors) ────────

export const NODE_W = 240
export const NODE_H = 130
export const H_GAP  = 80
export const V_GAP  = 120

export function subtreeWidth(id, nodesMap, collapsedSet) {
  if (collapsedSet.has(id)) return NODE_W
  const children = nodesMap[id]?.children || []
  if (!children.length) return NODE_W
  const total = children.reduce((s, c) => s + subtreeWidth(c.id, nodesMap, collapsedSet), 0)
  return Math.max(NODE_W, total + (children.length - 1) * H_GAP)
}

export function buildLayout(nodeId, x, y, level, nodesMap, collapsedSet, result) {
  const sw   = subtreeWidth(nodeId, nodesMap, collapsedSet)
  const cx   = x + sw / 2 - NODE_W / 2
  const node = nodesMap[nodeId]
  if (!node) return
  result.push({ node, x: cx, y, level })

  if (!collapsedSet.has(nodeId)) {
    const children = node.children || []
    if (children.length) {
      const childY   = y + NODE_H + V_GAP
      const totalW   = children.reduce((s, c) => s + subtreeWidth(c.id, nodesMap, collapsedSet), 0)
                       + (children.length - 1) * H_GAP
      let cx2 = x + sw / 2 - totalW / 2
      children.forEach(child => {
        const csw = subtreeWidth(child.id, nodesMap, collapsedSet)
        buildLayout(child.id, cx2, childY, level + 1, nodesMap, collapsedSet, result)
        cx2 += csw + H_GAP
      })
    }
  }
}

export function buildConnectorPaths(layout, nodesMap, collapsedSet) {
  const paths  = []
  const posMap = {}
  layout.forEach(e => { posMap[e.node.id] = e })

  let debugInfo = []
  
  layout.forEach(e => {
    if (collapsedSet.has(e.node.id)) return
    const children = (nodesMap[e.node.id]?.children || [])
    debugInfo.push({ nodeId: e.node.id, childCount: children.length, nodeTitle: e.node.title })
    if (!children.length) return

    const px = e.x + NODE_W / 2
    const pb = e.y + NODE_H
    const curveDepth = V_GAP / 3  // Bezier curve control point depth
    const midY = pb + V_GAP / 2

    if (children.length === 1) {
      // Single child: smooth curve
      const ce = posMap[children[0].id]
      if (!ce) return
      const ccx = ce.x + NODE_W / 2
      const ccy = ce.y
      // Quadratic Bezier curve: M (start) Q (control) (end)
      paths.push(`M${px},${pb} Q${px},${midY} ${ccx},${ccy}`)
    } else {
      // Multiple children: smooth curve down, horizontal line, curves to children
      // Curve from parent down
      paths.push(`M${px},${pb} L${px},${midY}`)
      
      const lx = posMap[children[0].id]?.x + NODE_W / 2
      const rx = posMap[children[children.length - 1].id]?.x + NODE_W / 2
      if (lx && rx) {
        // Horizontal line at midpoint
        paths.push(`M${lx},${midY} L${rx},${midY}`)
      }
      
      // Curves from midpoint to each child
      children.forEach(c => {
        const ce = posMap[c.id]
        if (!ce) return
        const ccx = ce.x + NODE_W / 2
        const ccy = ce.y
        // Smooth curve from horizontal line to child
        paths.push(`M${ccx},${midY} Q${ccx},${midY + curveDepth} ${ccx},${ccy}`)
      })
    }
  })
  
  console.log('DEBUG buildConnectorPaths:', { debugInfo, totalPaths: paths.length, paths })
  return paths
}

export function flatToMap(nodes) {
  // nodes is flat array from API, build id→node map with children
  const map = {}
  nodes.forEach(n => { map[n.id] = { ...n, children: [] } })
  nodes.forEach(n => {
    if (n.parent_id && map[n.parent_id]) {
      map[n.parent_id].children.push(map[n.id])
    }
  })
  return map
}

export function getLevel(id, map) {
  let level = 1, node = map[id]
  while (node && node.parent_id) {
    level++
    node = map[node.parent_id]
  }
  return level
}
