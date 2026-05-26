import { useRef, useEffect, useState } from 'react'
import { drawIcon } from './Canvas'

export default function MockupPreview({ config, style }) {
  const canvasRef = useRef(document.createElement('canvas'))
  const [iconUrl, setIconUrl] = useState(null)

  useEffect(() => {
    const canvas = canvasRef.current
    drawIcon(canvas, config, 128)
    setIconUrl(canvas.toDataURL())
  }, [config])

  const card = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    overflow: 'hidden',
  }

  const label = {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontWeight: 500,
    marginTop: 'auto',
  }

  const placeholder = (size, radius = 6) => ({
    width: size,
    height: size,
    borderRadius: radius,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.04)',
    flexShrink: 0,
  })

  const iconImg = (size, radius = 10) => ({
    width: size,
    height: size,
    borderRadius: radius,
    objectFit: 'cover',
  })

  return (
    <div style={{ ...style, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

      {/* 1 — Phone Home Screen */}
      <div style={card}>
        <div style={{
          width: 120,
          height: 200,
          background: '#111114',
          borderRadius: 18,
          border: '2px solid rgba(255,255,255,0.1)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '18px 10px 10px',
          overflow: 'hidden',
        }}>
          {/* Notch */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 40,
            height: 12,
            background: '#000',
            borderRadius: '0 0 10px 10px',
          }} />
          {/* App grid 4x4 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 6,
            marginTop: 8,
            width: '100%',
          }}>
            {Array.from({ length: 16 }).map((_, i) => (
              i === 5 && iconUrl
                ? <img key={i} src={iconUrl} alt="" style={iconImg(18, 5)} />
                : <div key={i} style={placeholder(18, 5)} />
            ))}
          </div>
          {/* Dock */}
          <div style={{
            position: 'absolute',
            bottom: 8,
            left: 10,
            right: 10,
            height: 26,
            background: 'rgba(255,255,255,0.06)',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '0 8px',
          }}>
            {[0,1,2,3].map(i =>
              i === 1 && iconUrl
                ? <img key={i} src={iconUrl} alt="" style={iconImg(16, 4)} />
                : <div key={i} style={placeholder(16, 4)} />
            )}
          </div>
        </div>
        <span style={label}>iOS Home Screen</span>
      </div>

      {/* 2 — Browser Tab */}
      <div style={card}>
        <div style={{
          width: '100%',
          background: '#18181c',
          borderRadius: 10,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          {/* Tab bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: '#1e1e24',
            height: 28,
            padding: '0 8px',
            gap: 6,
          }}>
            {/* Inactive tab */}
            <div style={{
              height: 20,
              padding: '0 8px',
              borderRadius: 5,
              background: 'rgba(255,255,255,0.04)',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: 'rgba(255,255,255,0.1)' }} />
              <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>Tab</span>
            </div>
            {/* Active tab with user icon */}
            <div style={{
              height: 20,
              padding: '0 8px',
              borderRadius: 5,
              background: 'rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}>
              {iconUrl && <img src={iconUrl} alt="" style={{ width: 10, height: 10, borderRadius: 2 }} />}
              <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>My App</span>
            </div>
            {/* Another inactive tab */}
            <div style={{
              height: 20,
              padding: '0 8px',
              borderRadius: 5,
              background: 'rgba(255,255,255,0.04)',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: 'rgba(255,255,255,0.1)' }} />
              <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>Tab</span>
            </div>
          </div>
          {/* Address bar */}
          <div style={{
            height: 20,
            margin: '4px 8px',
            borderRadius: 6,
            background: 'rgba(255,255,255,0.05)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 8px',
          }}>
            <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)' }}>myapp.com</span>
          </div>
          {/* Page content placeholder */}
          <div style={{ padding: '10px 12px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ height: 6, width: '70%', borderRadius: 3, background: 'rgba(255,255,255,0.06)' }} />
            <div style={{ height: 6, width: '100%', borderRadius: 3, background: 'rgba(255,255,255,0.04)' }} />
            <div style={{ height: 6, width: '85%', borderRadius: 3, background: 'rgba(255,255,255,0.04)' }} />
            <div style={{ height: 24, width: '100%', borderRadius: 6, background: 'rgba(255,255,255,0.03)', marginTop: 4 }} />
          </div>
        </div>
        <span style={label}>Browser Tab</span>
      </div>

      {/* 3 — App Store Card */}
      <div style={card}>
        <div style={{
          width: '100%',
          background: '#18181c',
          borderRadius: 10,
          border: '1px solid rgba(255,255,255,0.06)',
          padding: 14,
          display: 'flex',
          gap: 12,
          alignItems: 'center',
        }}>
          {iconUrl && <img src={iconUrl} alt="" style={iconImg(52, 12)} />}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>My App</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Studio</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
              <div style={{ display: 'flex', gap: 1 }}>
                {[1,2,3,4,5].map(i => (
                  <svg key={i} width="8" height="8" viewBox="0 0 24 24" fill={i <= 4 ? '#f9a825' : 'none'} stroke="#f9a825" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>4.8</span>
            </div>
          </div>
          <div style={{
            padding: '4px 14px',
            borderRadius: 14,
            background: '#0339f8',
            color: '#fff',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 0.3,
            flexShrink: 0,
          }}>GET</div>
        </div>
        <span style={label}>App Store</span>
      </div>

      {/* 4 — Desktop Dock */}
      <div style={card}>
        <div style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          alignItems: 'center',
          minHeight: 100,
        }}>
          {/* Desktop wallpaper area */}
          <div style={{
            width: '100%',
            flex: 1,
            borderRadius: '10px 10px 0 0',
            background: 'linear-gradient(135deg, #0a0a12 0%, #14142a 100%)',
            marginBottom: 8,
            minHeight: 50,
          }} />
          {/* Dock */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 12,
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(12px)',
          }}>
            {[0,1,2,3,4,5,6].map(i =>
              i === 3 && iconUrl
                ? <img key={i} src={iconUrl} alt="" style={iconImg(22, 5)} />
                : <div key={i} style={placeholder(22, 5)} />
            )}
          </div>
        </div>
        <span style={label}>macOS Dock</span>
      </div>

    </div>
  )
}
