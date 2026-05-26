import { useCallback } from 'react'
import { EXPORT_SIZES } from '../icons'
import { drawIconAsync } from './Canvas'

export default function ExportPanel({ config, mobile }) {
  const exportPNG = useCallback(async (size) => {
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    await drawIconAsync(canvas, config, size)

    const link = document.createElement('a')
    const name = config.iconMode === 'text' ? config.iconText : config.iconMode === 'upload' ? (config.uploadedSvg?.name || 'custom') : config.iconMode === 'generate' ? 'ai-generated' : config.icon.id
    link.download = `icon-${name}-${size}x${size}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }, [config])

  const exportSVG = useCallback(() => {
    const size = 512
    const pad = config.padding * (size / 100)
    const drawSize = size - pad * 2
    const radius = (config.borderRadius / 100) * (drawSize / 2)
    const iconDrawSize = drawSize * (config.iconSize / 100)
    const iconOffset = (size - iconDrawSize) / 2

    let bgFill = ''
    if (config.bgShape && config.bgShape !== 'none') {
      if (config.isGradient && config.bgColor.includes('gradient')) {
        const colors = config.bgColor.match(/#[0-9a-fA-F]{6}/g) || ['#0339f8', '#06b6d4']
        bgFill = `
          <defs>
            <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="${colors[0]}"/>
              <stop offset="100%" stop-color="${colors[1]}"/>
            </linearGradient>
          </defs>
          <rect x="${pad}" y="${pad}" width="${drawSize}" height="${drawSize}" rx="${radius}" fill="url(#bg)" opacity="${config.bgOpacity / 100}"/>
        `
      } else {
        bgFill = `<rect x="${pad}" y="${pad}" width="${drawSize}" height="${drawSize}" rx="${radius}" fill="${config.bgColor}" opacity="${config.bgOpacity / 100}"/>`
      }
    }

    const rotation = config.rotation !== 0
      ? ` transform="rotate(${config.rotation}, ${size / 2}, ${size / 2})"`
      : ''

    let strokeAttrs = ''
    if (config.strokeStyle === 'dashed') {
      strokeAttrs = ` stroke-dasharray="${config.strokeDash} ${config.strokeGap}"`
    } else if (config.strokeStyle === 'dotted') {
      strokeAttrs = ` stroke-dasharray="0.1 ${config.iconStroke * 2.2}" stroke-linecap="round"`
    }
    const fillAttr = config.fillIcon ? ` fill="${config.iconColor}"` : ' fill="none"'

    const pathData = config.iconMode === 'upload' && config.uploadedSvg
      ? config.uploadedSvg.paths
      : config.icon.path

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  ${bgFill}
  <svg x="${iconOffset}" y="${iconOffset}" width="${iconDrawSize}" height="${iconDrawSize}" viewBox="0 0 24 24"${fillAttr} stroke="${config.iconColor}" stroke-width="${config.iconStroke}" stroke-linecap="round" stroke-linejoin="round"${rotation}${strokeAttrs}>
    <path d="${pathData}"/>
  </svg>
</svg>`

    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const link = document.createElement('a')
    const name = config.iconMode === 'text' ? config.iconText : config.iconMode === 'upload' ? (config.uploadedSvg?.name || 'custom') : config.iconMode === 'generate' ? 'ai-generated' : config.icon.id
    link.download = `icon-${name}.svg`
    link.href = URL.createObjectURL(blob)
    link.click()
    URL.revokeObjectURL(link.href)
  }, [config])

  const exportAllSizes = useCallback(() => {
    EXPORT_SIZES.forEach((size, i) => {
      setTimeout(() => exportPNG(size), i * 150)
    })
  }, [exportPNG])

  const containerStyle = mobile ? {} : {
    width: 220,
    minWidth: 220,
    height: '100%',
    borderLeft: '1px solid rgba(255,255,255,0.06)',
    background: 'rgba(255,255,255,0.02)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    padding: '18px 16px',
  }

  return (
    <div style={containerStyle}>
      <div className="section-label" style={mobile ? {} : { marginBottom: 14 }}>Export</div>

      {/* Quick export sizes */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 6,
        marginBottom: 16,
      }}>
        {EXPORT_SIZES.map(size => (
          <button
            key={size}
            onClick={() => exportPNG(size)}
            style={{
              padding: '9px 0',
              fontSize: 11,
              fontWeight: 500,
              fontFamily: 'monospace',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 10,
              background: 'rgba(255,255,255,0.02)',
              color: 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              e.target.style.background = 'rgba(255,255,255,0.08)'
              e.target.style.color = 'rgba(255,255,255,0.85)'
              e.target.style.borderColor = 'rgba(255,255,255,0.15)'
            }}
            onMouseLeave={e => {
              e.target.style.background = 'rgba(255,255,255,0.02)'
              e.target.style.color = 'rgba(255,255,255,0.5)'
              e.target.style.borderColor = 'rgba(255,255,255,0.06)'
            }}
          >
            {size}px
          </button>
        ))}
      </div>

      {/* SVG export */}
      <button
        onClick={exportSVG}
        style={{
          width: '100%',
          padding: '10px 0',
          fontSize: 12,
          fontWeight: 500,
          fontFamily: 'inherit',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 10,
          background: 'rgba(255,255,255,0.04)',
          color: 'rgba(255,255,255,0.6)',
          cursor: 'pointer',
          transition: 'all 0.15s',
          marginBottom: 8,
        }}
        onMouseEnter={e => {
          e.target.style.background = 'rgba(255,255,255,0.08)'
          e.target.style.color = 'rgba(255,255,255,0.85)'
        }}
        onMouseLeave={e => {
          e.target.style.background = 'rgba(255,255,255,0.04)'
          e.target.style.color = 'rgba(255,255,255,0.6)'
        }}
      >
        Export SVG
      </button>

      {/* Export all */}
      <button
        onClick={exportAllSizes}
        style={{
          width: '100%',
          padding: '11px 0',
          fontSize: 12,
          fontWeight: 600,
          fontFamily: 'inherit',
          border: 'none',
          borderRadius: 10,
          background: '#0339f8',
          color: '#ffffff',
          cursor: 'pointer',
          transition: 'all 0.15s',
          marginBottom: 20,
        }}
        onMouseEnter={e => e.target.style.background = '#0247ff'}
        onMouseLeave={e => e.target.style.background = '#0339f8'}
      >
        Export All Sizes
      </button>

      {/* Size reference */}
      <div className="section-label">Size Guide</div>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', lineHeight: 1.8 }}>
        <div><span style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.35)' }}>16px</span> — Favicon</div>
        <div><span style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.35)' }}>32px</span> — Browser tab</div>
        <div><span style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.35)' }}>64px</span> — Taskbar</div>
        <div><span style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.35)' }}>128px</span> — Small icon</div>
        <div><span style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.35)' }}>256px</span> — Medium icon</div>
        <div><span style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.35)' }}>512px</span> — App Store</div>
        <div><span style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.35)' }}>1024px</span> — Apple App Store</div>
      </div>
    </div>
  )
}
