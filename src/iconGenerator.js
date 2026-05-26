// Procedural icon generator — creates unique SVG path data from text prompts
// Uses deterministic hashing + seeded PRNG for reproducible results

function hashString(str) {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

function createRng(seed) {
  let s = seed | 0 || 1
  return () => {
    s ^= s << 13
    s ^= s >> 17
    s ^= s << 5
    return ((s >>> 0) / 4294967296)
  }
}

// ===== PRIMITIVE BUILDERS =====
function circle(cx, cy, r, segments = 32) {
  const pts = []
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2
    const x = cx + r * Math.cos(a)
    const y = cy + r * Math.sin(a)
    pts.push(i === 0 ? `M${f(x)} ${f(y)}` : `L${f(x)} ${f(y)}`)
  }
  pts.push('Z')
  return pts.join(' ')
}

function polygon(cx, cy, r, sides, rotation = -Math.PI / 2) {
  const pts = []
  for (let i = 0; i <= sides; i++) {
    const a = rotation + (i / sides) * Math.PI * 2
    const x = cx + r * Math.cos(a)
    const y = cy + r * Math.sin(a)
    pts.push(i === 0 ? `M${f(x)} ${f(y)}` : `L${f(x)} ${f(y)}`)
  }
  pts.push('Z')
  return pts.join(' ')
}

function star(cx, cy, outerR, innerR, points) {
  const pts = []
  for (let i = 0; i < points * 2; i++) {
    const a = -Math.PI / 2 + (i / (points * 2)) * Math.PI * 2
    const r = i % 2 === 0 ? outerR : innerR
    const x = cx + r * Math.cos(a)
    const y = cy + r * Math.sin(a)
    pts.push(i === 0 ? `M${f(x)} ${f(y)}` : `L${f(x)} ${f(y)}`)
  }
  pts.push('Z')
  return pts.join(' ')
}

function roundedRect(x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2)
  return `M${f(x + r)} ${f(y)} L${f(x + w - r)} ${f(y)} Q${f(x + w)} ${f(y)} ${f(x + w)} ${f(y + r)} L${f(x + w)} ${f(y + h - r)} Q${f(x + w)} ${f(y + h)} ${f(x + w - r)} ${f(y + h)} L${f(x + r)} ${f(y + h)} Q${f(x)} ${f(y + h)} ${f(x)} ${f(y + h - r)} L${f(x)} ${f(y + r)} Q${f(x)} ${f(y)} ${f(x + r)} ${f(y)} Z`
}

function line(x1, y1, x2, y2) {
  return `M${f(x1)} ${f(y1)} L${f(x2)} ${f(y2)}`
}

function arc(cx, cy, r, startAngle, endAngle) {
  const x1 = cx + r * Math.cos(startAngle)
  const y1 = cy + r * Math.sin(startAngle)
  const x2 = cx + r * Math.cos(endAngle)
  const y2 = cy + r * Math.sin(endAngle)
  const large = endAngle - startAngle > Math.PI ? 1 : 0
  return `M${f(x1)} ${f(y1)} A${f(r)} ${f(r)} 0 ${large} 1 ${f(x2)} ${f(y2)}`
}

function bezierBlob(cx, cy, r, rng, irregularity = 0.3) {
  const points = 6
  const angles = []
  for (let i = 0; i < points; i++) {
    angles.push((i / points) * Math.PI * 2 + (rng() - 0.5) * irregularity)
  }
  const pts = angles.map(a => ({
    x: cx + r * (0.8 + rng() * 0.4) * Math.cos(a),
    y: cy + r * (0.8 + rng() * 0.4) * Math.sin(a),
  }))
  let d = `M${f(pts[0].x)} ${f(pts[0].y)}`
  for (let i = 0; i < pts.length; i++) {
    const curr = pts[i]
    const next = pts[(i + 1) % pts.length]
    const cpDist = r * 0.4
    const a1 = Math.atan2(next.y - curr.y, next.x - curr.x)
    const a2 = Math.atan2(curr.y - next.y, curr.x - next.x)
    d += ` C${f(curr.x + cpDist * Math.cos(a1))} ${f(curr.y + cpDist * Math.sin(a1))}`
    d += ` ${f(next.x + cpDist * Math.cos(a2))} ${f(next.y + cpDist * Math.sin(a2))}`
    d += ` ${f(next.x)} ${f(next.y)}`
  }
  return d + ' Z'
}

function f(n) { return Math.round(n * 100) / 100 }

// ===== COMPOSITION STRATEGIES =====
function generateGeometric(rng) {
  const paths = []
  const cx = 12, cy = 12
  const baseShape = Math.floor(rng() * 5)

  // Main shape
  if (baseShape === 0) {
    const sides = 3 + Math.floor(rng() * 5)
    paths.push(polygon(cx, cy, 8 + rng() * 2, sides))
  } else if (baseShape === 1) {
    paths.push(circle(cx, cy, 7 + rng() * 3))
  } else if (baseShape === 2) {
    paths.push(star(cx, cy, 9, 4 + rng() * 2, 4 + Math.floor(rng() * 4)))
  } else if (baseShape === 3) {
    paths.push(roundedRect(3, 3, 18, 18, 2 + rng() * 4))
  } else {
    const sides = 5 + Math.floor(rng() * 3)
    paths.push(polygon(cx, cy, 10, sides))
  }

  // Inner element
  const inner = Math.floor(rng() * 6)
  if (inner === 0) {
    paths.push(circle(cx, cy, 3 + rng() * 2))
  } else if (inner === 1) {
    const s = 2 + rng() * 2
    paths.push(polygon(cx, cy, s, 3 + Math.floor(rng() * 4)))
  } else if (inner === 2) {
    paths.push(line(cx - 3, cy, cx + 3, cy))
    paths.push(line(cx, cy - 3, cx, cy + 3))
  } else if (inner === 3) {
    paths.push(star(cx, cy, 4, 2, 4 + Math.floor(rng() * 3)))
  } else if (inner === 4) {
    paths.push(circle(cx, cy, 2))
    paths.push(circle(cx, cy, 5, 24))
  } else {
    const r = 3
    paths.push(roundedRect(cx - r, cy - r, r * 2, r * 2, 1))
  }

  // Accent details
  if (rng() > 0.5) {
    const dotR = 1 + rng()
    const dotDist = 6 + rng() * 3
    const dots = 2 + Math.floor(rng() * 3)
    for (let i = 0; i < dots; i++) {
      const a = (i / dots) * Math.PI * 2 - Math.PI / 2
      paths.push(circle(cx + dotDist * Math.cos(a), cy + dotDist * Math.sin(a), dotR, 12))
    }
  }

  return paths.join(' ')
}

function generateAbstract(rng) {
  const paths = []
  const cx = 12, cy = 12

  // Organic main shape
  paths.push(bezierBlob(cx, cy, 7 + rng() * 3, rng))

  // Overlay elements
  const overlayType = Math.floor(rng() * 4)
  if (overlayType === 0) {
    // Concentric circles
    paths.push(circle(cx, cy, 4 + rng() * 2))
    paths.push(circle(cx, cy, 2))
  } else if (overlayType === 1) {
    // Crossing lines
    const count = 2 + Math.floor(rng() * 3)
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI
      const len = 5 + rng() * 4
      paths.push(line(cx - len * Math.cos(a), cy - len * Math.sin(a), cx + len * Math.cos(a), cy + len * Math.sin(a)))
    }
  } else if (overlayType === 2) {
    // Off-center circle
    const ox = (rng() - 0.5) * 6
    const oy = (rng() - 0.5) * 6
    paths.push(circle(cx + ox, cy + oy, 3 + rng() * 2))
  } else {
    // Arc segments
    const segments = 2 + Math.floor(rng() * 3)
    for (let i = 0; i < segments; i++) {
      const start = (i / segments) * Math.PI * 2
      const end = start + (Math.PI * 2 / segments) * 0.7
      paths.push(arc(cx, cy, 5 + rng() * 3, start, end))
    }
  }

  return paths.join(' ')
}

function generateTech(rng) {
  const paths = []
  const cx = 12, cy = 12

  // Circuit board style
  const baseType = Math.floor(rng() * 3)
  if (baseType === 0) {
    // Chip/processor
    paths.push(roundedRect(5, 5, 14, 14, 2))
    paths.push(roundedRect(7, 7, 10, 10, 1))
    // Pins
    const pins = 3 + Math.floor(rng() * 2)
    for (let i = 0; i < pins; i++) {
      const t = 6 + (12 / (pins + 1)) * (i + 1)
      paths.push(line(t, 2, t, 5))
      paths.push(line(t, 19, t, 22))
      paths.push(line(2, t, 5, t))
      paths.push(line(19, t, 22, t))
    }
  } else if (baseType === 1) {
    // Network nodes
    const nodes = 3 + Math.floor(rng() * 4)
    const positions = []
    for (let i = 0; i < nodes; i++) {
      const a = (i / nodes) * Math.PI * 2
      const r = 5 + rng() * 4
      positions.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) })
    }
    // Center node
    paths.push(circle(cx, cy, 2.5))
    positions.forEach(p => {
      paths.push(circle(p.x, p.y, 1.5, 12))
      paths.push(line(cx, cy, p.x, p.y))
    })
    // Connect some outer nodes
    if (rng() > 0.4) {
      for (let i = 0; i < positions.length - 1; i++) {
        if (rng() > 0.5) {
          paths.push(line(positions[i].x, positions[i].y, positions[i + 1].x, positions[i + 1].y))
        }
      }
    }
  } else {
    // Shield/badge with tech element
    paths.push(`M12 2 L20 6 L20 14 Q20 20 12 22 Q4 20 4 14 L4 6 Z`)
    const innerType = Math.floor(rng() * 3)
    if (innerType === 0) {
      paths.push(line(12, 7, 12, 17))
      paths.push(line(8, 12, 16, 12))
      paths.push(circle(12, 12, 3))
    } else if (innerType === 1) {
      paths.push(polygon(12, 12, 4, 6))
      paths.push(circle(12, 12, 2, 12))
    } else {
      paths.push(`M8 10 L11 13 L16 8`)
    }
  }

  return paths.join(' ')
}

function generateMinimal(rng) {
  const paths = []
  const cx = 12, cy = 12

  const type = Math.floor(rng() * 7)
  if (type === 0) {
    // Letter-like abstract mark
    const strokes = 2 + Math.floor(rng() * 3)
    for (let i = 0; i < strokes; i++) {
      const x1 = 4 + rng() * 6
      const y1 = 4 + rng() * 16
      const x2 = 14 + rng() * 6
      const y2 = 4 + rng() * 16
      paths.push(line(x1, y1, x2, y2))
    }
  } else if (type === 1) {
    // Stacked shapes
    const count = 2 + Math.floor(rng() * 2)
    const gap = 16 / (count + 1)
    for (let i = 0; i < count; i++) {
      const y = 4 + gap * (i + 1)
      const w = 8 + rng() * 8
      paths.push(line(cx - w / 2, y, cx + w / 2, y))
    }
    paths.push(circle(cx, 4, 2, 12))
  } else if (type === 2) {
    // Concentric shapes
    paths.push(circle(cx, cy, 9))
    paths.push(circle(cx, cy, 6))
    paths.push(circle(cx, cy, 3))
  } else if (type === 3) {
    // Arrow/chevron mark
    const size = 5 + rng() * 3
    paths.push(`M${f(cx - size)} ${f(cy - size)} L${f(cx)} ${f(cy)} L${f(cx - size)} ${f(cy + size)}`)
    paths.push(`M${f(cx)} ${f(cy - size)} L${f(cx + size)} ${f(cy)} L${f(cx)} ${f(cy + size)}`)
  } else if (type === 4) {
    // Grid dots
    const gridSize = 2 + Math.floor(rng() * 2)
    const spacing = 14 / (gridSize - 1)
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const x = 5 + col * spacing
        const y = 5 + row * spacing
        if (rng() > 0.3) {
          paths.push(circle(x, y, 1 + rng() * 0.8, 8))
        }
      }
    }
  } else if (type === 5) {
    // Wave lines
    const waves = 2 + Math.floor(rng() * 3)
    for (let i = 0; i < waves; i++) {
      const y = 5 + (14 / (waves - 1 || 1)) * i
      const amp = 2 + rng() * 2
      paths.push(`M3 ${f(y)} Q8 ${f(y - amp)} 12 ${f(y)} Q16 ${f(y + amp)} 21 ${f(y)}`)
    }
  } else {
    // Split circle
    paths.push(arc(cx, cy, 8, -Math.PI / 2, Math.PI / 2))
    paths.push(arc(cx, cy, 8, Math.PI / 2, Math.PI * 1.5))
    paths.push(line(cx, cy - 8, cx, cy + 8))
  }

  return paths.join(' ')
}

function generateOrganic(rng) {
  const paths = []
  const cx = 12, cy = 12

  const type = Math.floor(rng() * 5)
  if (type === 0) {
    // Leaf / petal shapes
    const petals = 3 + Math.floor(rng() * 4)
    for (let i = 0; i < petals; i++) {
      const a = (i / petals) * Math.PI * 2
      const len = 6 + rng() * 3
      const w = 2 + rng() * 2
      const ex = cx + len * Math.cos(a)
      const ey = cy + len * Math.sin(a)
      const perp = a + Math.PI / 2
      paths.push(`M${f(cx)} ${f(cy)} Q${f(cx + w * Math.cos(perp) + len * 0.5 * Math.cos(a))} ${f(cy + w * Math.sin(perp) + len * 0.5 * Math.sin(a))} ${f(ex)} ${f(ey)} Q${f(cx - w * Math.cos(perp) + len * 0.5 * Math.cos(a))} ${f(cy - w * Math.sin(perp) + len * 0.5 * Math.sin(a))} ${f(cx)} ${f(cy)} Z`)
    }
  } else if (type === 1) {
    // Tree / branch
    paths.push(line(cx, 20, cx, 8))
    const branches = 3 + Math.floor(rng() * 3)
    for (let i = 0; i < branches; i++) {
      const y = 8 + (10 / branches) * i
      const side = i % 2 === 0 ? 1 : -1
      const len = 3 + rng() * 4
      paths.push(line(cx, y, cx + side * len, y - 2 - rng() * 3))
    }
    // Canopy
    paths.push(circle(cx, 6, 4 + rng() * 2))
  } else if (type === 2) {
    // Spiral
    let x = cx, y = cy
    let d = `M${f(x)} ${f(y)}`
    const turns = 2 + rng() * 2
    const steps = 40
    for (let i = 1; i <= steps; i++) {
      const t = i / steps
      const a = t * turns * Math.PI * 2
      const r = t * 8
      x = cx + r * Math.cos(a)
      y = cy + r * Math.sin(a)
      d += ` L${f(x)} ${f(y)}`
    }
    paths.push(d)
  } else if (type === 3) {
    // Double blob
    paths.push(bezierBlob(cx - 3, cy, 5 + rng() * 2, rng, 0.4))
    paths.push(bezierBlob(cx + 3, cy, 4 + rng() * 2, rng, 0.3))
  } else {
    // Flower
    const petals = 5 + Math.floor(rng() * 3)
    for (let i = 0; i < petals; i++) {
      const a = (i / petals) * Math.PI * 2
      const pr = 5 + rng() * 2
      const px = cx + pr * Math.cos(a)
      const py = cy + pr * Math.sin(a)
      paths.push(circle(px, py, 2.5 + rng(), 12))
    }
    paths.push(circle(cx, cy, 2.5, 12))
  }

  return paths.join(' ')
}

function generateBrand(rng) {
  const paths = []
  const cx = 12, cy = 12

  const type = Math.floor(rng() * 5)
  if (type === 0) {
    // Monogram-style overlapping shapes
    paths.push(circle(cx - 3, cy, 5))
    paths.push(circle(cx + 3, cy, 5))
  } else if (type === 1) {
    // Shield mark
    paths.push(`M12 2 L21 7 L21 14 Q21 20 12 22 Q3 20 3 14 L3 7 Z`)
    paths.push(polygon(cx, cy + 1, 4, 3 + Math.floor(rng() * 3)))
  } else if (type === 2) {
    // Letterform with shapes
    paths.push(roundedRect(4, 3, 16, 18, 3 + rng() * 3))
    const innerShapes = Math.floor(rng() * 3)
    if (innerShapes === 0) {
      paths.push(polygon(cx, cy, 5, 3))
    } else if (innerShapes === 1) {
      paths.push(star(cx, cy, 5, 2.5, 4))
    } else {
      paths.push(circle(cx, cy, 4))
      paths.push(line(cx, cy - 4, cx, cy + 4))
    }
  } else if (type === 3) {
    // Stacked chevrons / dynamic mark
    const layers = 2 + Math.floor(rng() * 2)
    for (let i = 0; i < layers; i++) {
      const offset = i * 4
      const w = 8 - i * 1.5
      paths.push(`M${f(cx - w)} ${f(4 + offset)} L${f(cx)} ${f(8 + offset)} L${f(cx + w)} ${f(4 + offset)}`)
    }
  } else {
    // Diamond mark
    const size = 7 + rng() * 2
    paths.push(`M${f(cx)} ${f(cy - size)} L${f(cx + size)} ${f(cy)} L${f(cx)} ${f(cy + size)} L${f(cx - size)} ${f(cy)} Z`)
    paths.push(circle(cx, cy, size * 0.35, 16))
  }

  return paths.join(' ')
}

// ===== MAIN GENERATOR =====
const STYLES = [
  { id: 'geometric', name: 'Geometric', fn: generateGeometric },
  { id: 'abstract', name: 'Abstract', fn: generateAbstract },
  { id: 'tech', name: 'Tech', fn: generateTech },
  { id: 'minimal', name: 'Minimal', fn: generateMinimal },
  { id: 'organic', name: 'Organic', fn: generateOrganic },
  { id: 'brand', name: 'Brand', fn: generateBrand },
]

export function generateIcons(prompt, style = 'geometric', count = 8) {
  const baseHash = hashString(prompt + style)
  const results = []

  for (let i = 0; i < count; i++) {
    const seed = baseHash + i * 7919 // prime offset for variety
    const rng = createRng(seed)
    const generator = STYLES.find(s => s.id === style)?.fn || generateGeometric
    const path = generator(rng)

    results.push({
      id: `gen-${style}-${i}-${seed}`,
      name: `${prompt} #${i + 1}`,
      path,
      generated: true,
    })
  }

  return results
}

export const GENERATE_STYLES = STYLES.map(s => ({ id: s.id, name: s.name }))
