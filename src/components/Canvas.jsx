import { useRef, useEffect } from 'react'

let noiseCanvas = null
function getNoiseCanvas() {
  if (noiseCanvas) return noiseCanvas
  noiseCanvas = document.createElement('canvas')
  noiseCanvas.width = 256
  noiseCanvas.height = 256
  const ctx = noiseCanvas.getContext('2d')
  const imageData = ctx.createImageData(256, 256)
  for (let i = 0; i < imageData.data.length; i += 4) {
    const v = Math.random() * 255
    imageData.data[i] = v
    imageData.data[i + 1] = v
    imageData.data[i + 2] = v
    imageData.data[i + 3] = 255
  }
  ctx.putImageData(imageData, 0, 0)
  return noiseCanvas
}

export default function Canvas({ config }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (config.iconMode === 'generate' && config.generatedImage) {
      drawGeneratedIcon(canvasRef.current, config, 512)
    } else {
      drawIcon(canvasRef.current, config, 512)
    }
  }, [config])

  const iconName = config.iconMode === 'text'
    ? (config.iconText || 'Text')
    : config.iconMode === 'upload'
      ? (config.uploadedSvg?.name || 'Upload')
      : config.iconMode === 'generate'
        ? 'AI Generated'
        : config.icon.name

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      gap: 20,
      minWidth: 0,
    }}>
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 20,
          overflow: 'hidden',
          background: `repeating-conic-gradient(rgba(255,255,255,0.03) 0% 25%, rgba(255,255,255,0.06) 0% 50%) 50% / 24px 24px`,
        }} />
        <canvas
          ref={canvasRef}
          width={512}
          height={512}
          style={{ width: 280, height: 280, borderRadius: 20, position: 'relative' }}
        />
      </div>
      <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>
        <span style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{iconName}</span>
        <span style={{ margin: '0 8px', color: 'rgba(255,255,255,0.15)' }}>|</span>
        <span style={{ fontFamily: 'monospace', fontSize: 10 }}>512 x 512</span>
      </div>
    </div>
  )
}

// ===== BACKGROUND SHAPE PATHS =====
function drawBgShapePath(ctx, shape, x, y, w, h) {
  const cx = x + w / 2
  const cy = y + h / 2
  const r = w / 2

  switch (shape) {
    case 'square':
      ctx.rect(x, y, w, h)
      break
    case 'rounded':
      roundedRect(ctx, x, y, w, h, w * 0.11)
      break
    case 'squircle':
      roundedRect(ctx, x, y, w, h, w * 0.22)
      break
    case 'circle':
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      break
    case 'hexagon': {
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 2
        const px = cx + r * Math.cos(angle)
        const py = cy + r * Math.sin(angle)
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
      }
      ctx.closePath()
      break
    }
    case 'shield': {
      const sw = w * 0.5, sh = h * 0.55
      ctx.moveTo(cx, y + h * 0.05)
      ctx.lineTo(cx + sw, y + h * 0.18)
      ctx.lineTo(cx + sw, cy)
      ctx.quadraticCurveTo(cx + sw, cy + sh, cx, y + h * 0.95)
      ctx.quadraticCurveTo(cx - sw, cy + sh, cx - sw, cy)
      ctx.lineTo(cx - sw, y + h * 0.18)
      ctx.closePath()
      break
    }
    case 'diamond':
      ctx.moveTo(cx, y)
      ctx.lineTo(x + w, cy)
      ctx.lineTo(cx, y + h)
      ctx.lineTo(x, cy)
      ctx.closePath()
      break
    case 'star-bg': {
      const outerR = r
      const innerR = r * 0.45
      for (let i = 0; i < 10; i++) {
        const angle = (Math.PI / 5) * i - Math.PI / 2
        const rad = i % 2 === 0 ? outerR : innerR
        const px = cx + rad * Math.cos(angle)
        const py = cy + rad * Math.sin(angle)
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
      }
      ctx.closePath()
      break
    }
    case 'blob': {
      ctx.moveTo(cx + r * 0.8, cy - r * 0.2)
      ctx.bezierCurveTo(cx + r * 0.9, cy - r * 0.8, cx + r * 0.2, cy - r * 0.95, cx - r * 0.1, cy - r * 0.8)
      ctx.bezierCurveTo(cx - r * 0.5, cy - r * 0.7, cx - r * 0.85, cy - r * 0.5, cx - r * 0.8, cy - r * 0.05)
      ctx.bezierCurveTo(cx - r * 0.75, cy + r * 0.4, cx - r * 0.9, cy + r * 0.7, cx - r * 0.4, cy + r * 0.85)
      ctx.bezierCurveTo(cx, cy + r * 0.95, cx + r * 0.5, cy + r * 0.9, cx + r * 0.75, cy + r * 0.5)
      ctx.bezierCurveTo(cx + r * 0.95, cy + r * 0.15, cx + r * 0.7, cy + r * 0.3, cx + r * 0.8, cy - r * 0.2)
      ctx.closePath()
      break
    }
    case 'badge': {
      const br = r * 0.85
      ctx.moveTo(cx, y + h * 0.02)
      ctx.lineTo(cx + br * 0.6, y + h * 0.12)
      ctx.lineTo(cx + br, y + h * 0.25)
      ctx.lineTo(cx + br, cy + h * 0.05)
      ctx.quadraticCurveTo(cx + br * 0.8, y + h * 0.85, cx, y + h * 0.98)
      ctx.quadraticCurveTo(cx - br * 0.8, y + h * 0.85, cx - br, cy + h * 0.05)
      ctx.lineTo(cx - br, y + h * 0.25)
      ctx.lineTo(cx - br * 0.6, y + h * 0.12)
      ctx.closePath()
      break
    }
    default:
      roundedRect(ctx, x, y, w, h, w * 0.11)
  }
}

// ===== MAIN DRAW =====
export function drawIcon(canvas, config, size) {
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  const s = size
  canvas.width = s
  canvas.height = s
  ctx.clearRect(0, 0, s, s)

  const pad = config.padding * (s / 100)
  const drawSize = s - pad * 2
  const shape = config.bgShape || 'none'

  // ===== BACKGROUND =====
  if (shape !== 'none') {
    ctx.save()
    ctx.beginPath()
    drawBgShapePath(ctx, shape, pad, pad, drawSize, drawSize)
    ctx.clip()

    if (config.isGradient && config.bgColor.includes('gradient')) {
      const colors = parseGradientColors(config.bgColor)
      const angle = parseGradientAngle(config.bgColor)
      const grad = createAngledGradient(ctx, pad, pad, drawSize, drawSize, angle)
      grad.addColorStop(0, colors[0])
      grad.addColorStop(1, colors[1])
      ctx.globalAlpha = config.bgOpacity / 100
      ctx.fillStyle = grad
    } else {
      ctx.globalAlpha = config.bgOpacity / 100
      ctx.fillStyle = config.bgColor
    }
    ctx.fill()

    if (config.glassEffect) {
      const glassGrad = ctx.createLinearGradient(pad, pad, pad, pad + drawSize)
      glassGrad.addColorStop(0, 'rgba(255,255,255,0.18)')
      glassGrad.addColorStop(0.45, 'rgba(255,255,255,0.04)')
      glassGrad.addColorStop(0.55, 'rgba(255,255,255,0)')
      glassGrad.addColorStop(1, 'rgba(0,0,0,0.08)')
      ctx.globalAlpha = 1
      ctx.fillStyle = glassGrad
      ctx.beginPath()
      drawBgShapePath(ctx, shape, pad, pad, drawSize, drawSize)
      ctx.fill()
    }

    if (config.noiseIntensity > 0) {
      const noise = getNoiseCanvas()
      ctx.globalAlpha = config.noiseIntensity / 100
      ctx.globalCompositeOperation = 'overlay'
      for (let nx = pad; nx < pad + drawSize; nx += 256) {
        for (let ny = pad; ny < pad + drawSize; ny += 256) {
          ctx.drawImage(noise, nx, ny, 256, 256)
        }
      }
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = 1
    }

    ctx.restore()
  }

  // ===== ICON =====
  const iconDrawSize = drawSize * (config.iconSize / 100)
  const iconOffset = (s - iconDrawSize) / 2

  ctx.save()

  if (config.rotation !== 0) {
    ctx.translate(s / 2, s / 2)
    ctx.rotate((config.rotation * Math.PI) / 180)
    ctx.translate(-s / 2, -s / 2)
  }

  if (config.shadow) {
    ctx.shadowColor = `rgba(0,0,0,${config.shadowOpacity})`
    ctx.shadowBlur = config.shadowBlur * (s / 256)
    ctx.shadowOffsetY = config.shadowBlur * 0.2 * (s / 256)
  }

  if (config.iconMode === 'text') {
    const text = config.iconText || 'KD'
    const fontSize = iconDrawSize * 0.65
    ctx.font = `${config.iconFontWeight} ${fontSize}px Inter, system-ui, -apple-system, sans-serif`
    ctx.fillStyle = config.iconColor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.letterSpacing = `${config.iconLetterSpacing}px`
    ctx.fillText(text, s / 2, s / 2 + fontSize * 0.03)
  } else if (config.iconMode === 'upload' && config.uploadedSvg) {
    const vb = config.uploadedSvg.viewBox.split(/[\s,]+/).map(Number)
    const vbW = vb[2] || 24
    const vbH = vb[3] || 24
    const scale = iconDrawSize / Math.max(vbW, vbH)
    ctx.translate(iconOffset, iconOffset)
    ctx.translate((iconDrawSize - vbW * scale) / 2, (iconDrawSize - vbH * scale) / 2)
    ctx.scale(scale, scale)
    const path = new Path2D(config.uploadedSvg.paths)
    drawStyledPath(ctx, path, config, iconDrawSize / scale)
  } else {
    const scale = iconDrawSize / 24
    ctx.translate(iconOffset, iconOffset)
    ctx.scale(scale, scale)
    const path = new Path2D(config.icon.path)
    drawStyledPath(ctx, path, config, 24)
  }

  ctx.restore()

  // ===== BADGE =====
  if (config.badgeType && config.badgeType !== 'none') {
    drawBadge(ctx, config, s, pad, drawSize)
  }
}

// ===== GENERATED IMAGE RENDERING =====
function drawGeneratedIcon(canvas, config, size) {
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const s = size
  canvas.width = s
  canvas.height = s
  ctx.clearRect(0, 0, s, s)

  const pad = config.padding * (s / 100)
  const drawSize = s - pad * 2
  const shape = config.bgShape || 'none'

  // Draw background shape (same as drawIcon)
  if (shape !== 'none') {
    ctx.save()
    ctx.beginPath()
    drawBgShapePath(ctx, shape, pad, pad, drawSize, drawSize)
    ctx.clip()

    if (config.isGradient && config.bgColor.includes('gradient')) {
      const colors = parseGradientColors(config.bgColor)
      const angle = parseGradientAngle(config.bgColor)
      const grad = createAngledGradient(ctx, pad, pad, drawSize, drawSize, angle)
      grad.addColorStop(0, colors[0])
      grad.addColorStop(1, colors[1])
      ctx.globalAlpha = config.bgOpacity / 100
      ctx.fillStyle = grad
    } else {
      ctx.globalAlpha = config.bgOpacity / 100
      ctx.fillStyle = config.bgColor
    }
    ctx.fill()

    if (config.glassEffect) {
      const glassGrad = ctx.createLinearGradient(pad, pad, pad, pad + drawSize)
      glassGrad.addColorStop(0, 'rgba(255,255,255,0.18)')
      glassGrad.addColorStop(0.45, 'rgba(255,255,255,0.04)')
      glassGrad.addColorStop(0.55, 'rgba(255,255,255,0)')
      glassGrad.addColorStop(1, 'rgba(0,0,0,0.08)')
      ctx.globalAlpha = 1
      ctx.fillStyle = glassGrad
      ctx.beginPath()
      drawBgShapePath(ctx, shape, pad, pad, drawSize, drawSize)
      ctx.fill()
    }

    if (config.noiseIntensity > 0) {
      const noise = getNoiseCanvas()
      ctx.globalAlpha = config.noiseIntensity / 100
      ctx.globalCompositeOperation = 'overlay'
      for (let nx = pad; nx < pad + drawSize; nx += 256) {
        for (let ny = pad; ny < pad + drawSize; ny += 256) {
          ctx.drawImage(noise, nx, ny, 256, 256)
        }
      }
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = 1
    }

    ctx.restore()
  }

  // Draw the AI-generated image
  const img = new Image()
  img.onload = () => {
    const iconDrawSize = drawSize * (config.iconSize / 100)
    const iconOffset = (s - iconDrawSize) / 2
    ctx.save()
    if (config.rotation !== 0) {
      ctx.translate(s / 2, s / 2)
      ctx.rotate((config.rotation * Math.PI) / 180)
      ctx.translate(-s / 2, -s / 2)
    }
    if (config.shadow) {
      ctx.shadowColor = `rgba(0,0,0,${config.shadowOpacity})`
      ctx.shadowBlur = config.shadowBlur * (s / 256)
      ctx.shadowOffsetY = config.shadowBlur * 0.2 * (s / 256)
    }
    ctx.drawImage(img, iconOffset, iconOffset, iconDrawSize, iconDrawSize)
    ctx.restore()

    if (config.badgeType && config.badgeType !== 'none') {
      drawBadge(ctx, config, s, pad, drawSize)
    }
  }
  img.src = config.generatedImage
}

// ===== BADGE RENDERING =====
function drawBadge(ctx, config, s, pad, drawSize) {
  const badgeSize = drawSize * 0.18
  const pos = config.badgePosition || 'top-right'
  let bx, by

  const margin = drawSize * 0.08
  if (pos === 'top-right') { bx = pad + drawSize - margin; by = pad + margin }
  else if (pos === 'top-left') { bx = pad + margin; by = pad + margin }
  else if (pos === 'bottom-right') { bx = pad + drawSize - margin; by = pad + drawSize - margin }
  else { bx = pad + margin; by = pad + drawSize - margin }

  ctx.save()
  // White ring behind badge
  ctx.beginPath()
  ctx.arc(bx, by, badgeSize * 0.65, 0, Math.PI * 2)
  ctx.fillStyle = config.bgShape !== 'none' ? (config.isGradient ? '#ffffff' : config.bgColor) : '#0b0b0f'
  ctx.fill()

  // Badge circle
  ctx.beginPath()
  ctx.arc(bx, by, badgeSize * 0.5, 0, Math.PI * 2)
  ctx.fillStyle = config.badgeColor || '#ef4444'
  ctx.fill()

  const type = config.badgeType
  ctx.fillStyle = '#ffffff'
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = badgeSize * 0.06
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  if (type === 'count') {
    const text = config.badgeText || '3'
    const fs = badgeSize * 0.35
    ctx.font = `600 ${fs}px Inter, system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, bx, by + fs * 0.05)
  } else if (type === 'check') {
    const r = badgeSize * 0.2
    ctx.beginPath()
    ctx.moveTo(bx - r, by)
    ctx.lineTo(bx - r * 0.2, by + r * 0.7)
    ctx.lineTo(bx + r, by - r * 0.5)
    ctx.stroke()
  } else if (type === 'plus') {
    const r = badgeSize * 0.2
    ctx.beginPath()
    ctx.moveTo(bx, by - r)
    ctx.lineTo(bx, by + r)
    ctx.moveTo(bx - r, by)
    ctx.lineTo(bx + r, by)
    ctx.stroke()
  } else if (type === 'star') {
    const r = badgeSize * 0.22
    ctx.beginPath()
    for (let i = 0; i < 10; i++) {
      const angle = (Math.PI / 5) * i - Math.PI / 2
      const rad = i % 2 === 0 ? r : r * 0.45
      const px = bx + rad * Math.cos(angle)
      const py = by + rad * Math.sin(angle)
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)
    }
    ctx.closePath()
    ctx.fill()
  } else if (type === 'ring') {
    ctx.beginPath()
    ctx.arc(bx, by, badgeSize * 0.35, 0, Math.PI * 2)
    ctx.fillStyle = 'transparent'
    ctx.fill()
    ctx.beginPath()
    ctx.arc(bx, by, badgeSize * 0.3, 0, Math.PI * 2)
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = badgeSize * 0.07
    ctx.stroke()
  }
  // 'dot' = just the colored circle, nothing on top

  ctx.restore()
}

// ===== STYLED PATH DRAWING (stroke styles + duotone) =====
function drawStyledPath(ctx, path, config, viewBoxSize) {
  const style = config.strokeStyle || 'solid'
  const color = config.iconColor
  const stroke = config.iconStroke

  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  // Duotone fill layer
  if (config.duotone && config.iconMode !== 'text') {
    ctx.save()
    ctx.globalAlpha = config.duotoneFillOpacity || 0.4
    ctx.fillStyle = config.duotoneFillColor || '#bfdbfe'
    ctx.fill(path)
    ctx.restore()
  }

  // 3D
  if (style === '3d') {
    const depth = config.stroke3dDepth || 4
    const depthColor = config.stroke3dColor || 'rgba(0,0,0,0.4)'
    for (let i = depth; i > 0; i--) {
      ctx.save()
      ctx.translate(i * 0.5, i * 0.5)
      ctx.strokeStyle = depthColor
      ctx.lineWidth = stroke
      ctx.setLineDash([])
      ctx.stroke(path)
      ctx.restore()
    }
    ctx.strokeStyle = color
    ctx.lineWidth = stroke
    ctx.setLineDash([])
    ctx.stroke(path)
    return
  }

  // Neon
  if (style === 'neon') {
    const glowColor = config.neonColor || color
    const glowSize = config.neonGlow || 12
    ctx.save()
    ctx.shadowColor = glowColor
    ctx.shadowBlur = glowSize
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
    ctx.strokeStyle = glowColor
    ctx.lineWidth = stroke
    ctx.setLineDash([])
    ctx.stroke(path)
    ctx.shadowBlur = glowSize * 0.4
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = stroke * 0.6
    ctx.stroke(path)
    ctx.restore()
    return
  }

  // Double
  if (style === 'double') {
    const outerColor = config.secondStrokeColor || color
    ctx.strokeStyle = outerColor
    ctx.lineWidth = stroke * 2.5
    ctx.setLineDash([])
    ctx.stroke(path)
    ctx.save()
    ctx.globalCompositeOperation = 'destination-out'
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = stroke * 1.2
    ctx.stroke(path)
    ctx.restore()
    ctx.strokeStyle = color
    ctx.lineWidth = stroke * 0.6
    ctx.stroke(path)
    return
  }

  // Gradient stroke
  if (style === 'gradient') {
    const grad = ctx.createLinearGradient(0, 0, viewBoxSize, viewBoxSize)
    grad.addColorStop(0, color)
    grad.addColorStop(1, config.gradientStrokeColor || '#06b6d4')
    ctx.strokeStyle = grad
    ctx.lineWidth = stroke
    ctx.setLineDash([])
    if (config.fillIcon) {
      const fillGrad = ctx.createLinearGradient(0, 0, viewBoxSize, viewBoxSize)
      fillGrad.addColorStop(0, color)
      fillGrad.addColorStop(1, config.gradientStrokeColor || '#06b6d4')
      ctx.fillStyle = fillGrad
      ctx.fill(path)
    }
    ctx.stroke(path)
    return
  }

  // Sketch
  if (style === 'sketch') {
    for (let i = 0; i < 3; i++) {
      ctx.save()
      ctx.translate((Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.6)
      ctx.strokeStyle = color
      ctx.globalAlpha = i === 0 ? 1 : 0.3
      ctx.lineWidth = stroke * (i === 0 ? 1 : 0.7)
      ctx.setLineDash([])
      ctx.stroke(path)
      ctx.restore()
    }
    return
  }

  // Emboss
  if (style === 'emboss') {
    ctx.save()
    ctx.translate(-0.5, -0.5)
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'
    ctx.lineWidth = stroke
    ctx.setLineDash([])
    ctx.stroke(path)
    ctx.restore()
    ctx.save()
    ctx.translate(0.5, 0.5)
    ctx.strokeStyle = 'rgba(0,0,0,0.4)'
    ctx.lineWidth = stroke
    ctx.stroke(path)
    ctx.restore()
    ctx.strokeStyle = color
    ctx.lineWidth = stroke
    ctx.stroke(path)
    return
  }

  // Dashed / Dotted / Solid
  if (style === 'dashed') {
    ctx.setLineDash([config.strokeDash || 6, config.strokeGap || 4])
  } else if (style === 'dotted') {
    ctx.setLineDash([0.1, stroke * 2.2])
    ctx.lineCap = 'round'
  } else {
    ctx.setLineDash([])
  }

  if (config.fillIcon) {
    ctx.fillStyle = color
    ctx.fill(path)
  }

  ctx.strokeStyle = color
  ctx.lineWidth = stroke
  ctx.stroke(path)
  ctx.setLineDash([])
}

// ===== ASYNC EXPORT =====
export function drawIconAsync(canvas, config, size) {
  return new Promise((resolve) => {
    // Handle AI-generated images
    if (config.iconMode === 'generate' && config.generatedImage) {
      drawGeneratedIcon(canvas, config, size)
      // Wait for image to load
      setTimeout(resolve, 200)
      return
    }

    drawIcon(canvas, config, size)

    if (config.iconMode === 'text' || (config.strokeStyle && config.strokeStyle !== 'solid') || config.fillIcon || config.duotone) {
      resolve()
      return
    }

    const pad = config.padding * (size / 100)
    const drawSize = size - pad * 2
    const iconDrawSize = drawSize * (config.iconSize / 100)
    const iconOffset = (size - iconDrawSize) / 2

    const pathData = config.iconMode === 'upload' && config.uploadedSvg
      ? config.uploadedSvg.paths
      : config.icon.path
    const viewBox = config.iconMode === 'upload' && config.uploadedSvg
      ? config.uploadedSvg.viewBox
      : '0 0 24 24'

    const svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" width="${iconDrawSize}" height="${iconDrawSize}" viewBox="${viewBox}" fill="none" stroke="${escapeXml(config.iconColor)}" stroke-width="${config.iconStroke}" stroke-linecap="round" stroke-linejoin="round"><path d="${escapeXml(pathData)}"/></svg>`

    const img = new Image()
    img.onload = () => {
      const ctx = canvas.getContext('2d')
      ctx.save()
      if (config.rotation !== 0) {
        ctx.translate(size / 2, size / 2)
        ctx.rotate((config.rotation * Math.PI) / 180)
        ctx.translate(-size / 2, -size / 2)
      }
      if (config.shadow) {
        ctx.shadowColor = `rgba(0,0,0,${config.shadowOpacity})`
        ctx.shadowBlur = config.shadowBlur * (size / 256)
        ctx.shadowOffsetY = config.shadowBlur * 0.2 * (size / 256)
      }
      ctx.drawImage(img, iconOffset, iconOffset, iconDrawSize, iconDrawSize)
      ctx.restore()

      if (config.badgeType && config.badgeType !== 'none') {
        drawBadge(ctx, config, size, pad, drawSize)
      }

      resolve()
    }
    img.onerror = () => resolve()
    img.src = 'data:image/svg+xml;base64,' + btoa(svgMarkup)
  })
}

// ===== HELPERS =====
function roundedRect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2)
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function parseGradientColors(gradient) {
  const matches = gradient.match(/#[0-9a-fA-F]{6}/g)
  return matches || ['#0339f8', '#06b6d4']
}

function parseGradientAngle(gradient) {
  const match = gradient.match(/(\d+)deg/)
  return match ? parseInt(match[1]) : 135
}

function createAngledGradient(ctx, x, y, w, h, angleDeg) {
  const angleRad = (angleDeg - 90) * Math.PI / 180
  const cx = x + w / 2
  const cy = y + h / 2
  const len = Math.max(w, h) * 0.7071
  return ctx.createLinearGradient(
    cx - Math.cos(angleRad) * len,
    cy - Math.sin(angleRad) * len,
    cx + Math.cos(angleRad) * len,
    cy + Math.sin(angleRad) * len,
  )
}

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
