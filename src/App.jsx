import { useState, useCallback } from 'react'
import LogoPanel from './components/LogoPanel'
import Sidebar from './components/Sidebar'
import Canvas from './components/Canvas'
import ExportPanel from './components/ExportPanel'
import MockupPreview from './components/MockupPreview'
import { ICON_LIBRARY, COLOR_PRESETS } from './icons'

const defaultConfig = {
  iconMode: 'library',
  icon: ICON_LIBRARY[0],
  iconText: 'KD',
  iconFontWeight: 700,
  iconLetterSpacing: -2,
  uploadedSvg: null,
  generatedImage: null,
  // Background
  bgShape: 'none',
  bgColor: COLOR_PRESETS[0].bg,
  iconColor: '#ffffff',
  isGradient: false,
  bgOpacity: 100,
  noiseIntensity: 0,
  glassEffect: false,
  // Icon
  iconSize: 60,
  iconStroke: 1.8,
  padding: 0,
  shadow: false,
  shadowBlur: 24,
  shadowOpacity: 0.35,
  rotation: 0,
  // Duotone
  duotone: false,
  duotoneFillColor: '#bfdbfe',
  duotoneFillOpacity: 0.4,
  // Stroke styles
  strokeStyle: 'solid',
  strokeDash: 6,
  strokeGap: 4,
  stroke3dDepth: 4,
  stroke3dColor: 'rgba(0,0,0,0.4)',
  neonGlow: 12,
  neonColor: '',
  secondStrokeColor: '',
  gradientStrokeColor: '#06b6d4',
  fillIcon: false,
  // Badge
  badgeType: 'none',
  badgePosition: 'top-right',
  badgeColor: '#ef4444',
  badgeText: '3',
}

export default function App() {
  const [config, setConfig] = useState(defaultConfig)
  const [mobilePanel, setMobilePanel] = useState(null)
  const [viewMode, setViewMode] = useState('canvas') // 'canvas' | 'mockups'

  const update = useCallback((key, val) => {
    setConfig(prev => ({ ...prev, [key]: val }))
  }, [])

  const updateMulti = useCallback((obj) => {
    setConfig(prev => ({ ...prev, ...obj }))
  }, [])

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'fixed',
        bottom: -120,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        height: '60%',
        pointerEvents: 'none',
        zIndex: 0,
        filter: 'blur(60px)',
        background: `
          radial-gradient(ellipse 60% 80% at 30% 100%, rgba(110,60,200,0.22) 0%, transparent 60%),
          radial-gradient(ellipse 50% 70% at 65% 100%, rgba(60,100,220,0.16) 0%, transparent 55%),
          radial-gradient(ellipse 45% 60% at 80% 100%, rgba(190,90,130,0.12) 0%, transparent 55%)
        `,
      }} />

      {/* Desktop layout */}
      <div className="desktop-layout" style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        position: 'relative',
        zIndex: 1,
      }}>
        <LogoPanel />
        <Sidebar config={config} update={update} updateMulti={updateMulti} />

        {/* Center area with view toggle */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* View toggle */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '12px 0 0',
            gap: 4,
          }}>
            {['canvas', 'mockups'].map(v => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                style={{
                  padding: '5px 16px',
                  fontSize: 11,
                  fontWeight: 500,
                  fontFamily: 'inherit',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  background: viewMode === v ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: viewMode === v ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.3)',
                }}
              >
                {v === 'canvas' ? 'Editor' : 'Mockups'}
              </button>
            ))}
          </div>

          {viewMode === 'canvas' ? (
            <Canvas config={config} />
          ) : (
            <MockupPreview config={config} style={{ flex: 1, padding: 20, overflow: 'auto' }} />
          )}
        </div>

        <ExportPanel config={config} />
      </div>

      {/* Mobile layout */}
      <div className="mobile-layout" style={{
        display: 'none',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <svg viewBox="0 0 18.62 11.73" style={{ width: 20, height: 13 }}>
            <polygon points="18.62 0 12 0 6 5.86 12 11.73 18.62 11.73 12.62 5.86 18.62 0" fill="#0339f8"/>
            <polygon points="0 0 0 11.72 6 5.86 0 0" fill="#0339f8"/>
          </svg>
          <span style={{ fontSize: 14, fontWeight: 500 }}>
            Icon <span className="display-italic">Builder</span>
          </span>
        </div>

        <div style={{ flex: 1, overflow: 'hidden' }}>
          <Canvas config={config} />
        </div>

        {mobilePanel && (
          <>
            <div
              onClick={() => setMobilePanel(null)}
              style={{
                position: 'fixed', inset: 0, zIndex: 10,
                background: 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(4px)',
              }}
            />
            <div style={{
              position: 'fixed',
              bottom: 64,
              left: 0, right: 0,
              height: '55vh',
              zIndex: 11,
              background: 'rgba(15,15,20,0.95)',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '20px 20px 0 0',
              overflow: 'auto',
              padding: '8px 0',
            }}>
              <div style={{
                width: 36, height: 4,
                borderRadius: 2,
                background: 'rgba(255,255,255,0.15)',
                margin: '4px auto 12px',
              }} />
              {mobilePanel === 'design' && (
                <div style={{ padding: '0 16px' }}>
                  <Sidebar config={config} update={update} updateMulti={updateMulti} mobile />
                </div>
              )}
              {mobilePanel === 'export' && (
                <div style={{ padding: '0 16px' }}>
                  <ExportPanel config={config} mobile />
                </div>
              )}
            </div>
          </>
        )}

        <div style={{
          display: 'flex',
          height: 64,
          borderTop: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(11,11,15,0.95)',
          backdropFilter: 'blur(12px)',
          position: 'relative',
          zIndex: 12,
        }}>
          {[
            { id: 'design', label: 'Design', icon: 'M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z' },
            { id: 'export', label: 'Export', icon: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setMobilePanel(mobilePanel === tab.id ? null : tab.id)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                background: 'none',
                border: 'none',
                color: mobilePanel === tab.id ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)',
                cursor: 'pointer',
                fontSize: 10,
                fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}
            >
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <path d={tab.icon} />
              </svg>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .desktop-layout { display: none !important; }
          .mobile-layout { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
