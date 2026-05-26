import { useState, useRef, useMemo } from 'react'
import { ICON_LIBRARY, ICON_CATEGORIES, BG_SHAPES, COLOR_PRESETS, STYLE_PRESETS, STROKE_STYLES, BADGE_TYPES, BADGE_POSITIONS, ICON_PACKS } from '../icons'
import { generateHarmony, HARMONY_MODES } from '../colorHarmony'
import { GENERATE_STYLES } from '../iconGenerator'

export default function Sidebar({ config, update, updateMulti, mobile }) {
  const [iconSearch, setIconSearch] = useState('')
  const [tab, setTab] = useState('icon')
  const [category, setCategory] = useState('all')
  const [harmonyMode, setHarmonyMode] = useState('complementary')
  const [harmonySeed, setHarmonySeed] = useState('#0339f8')
  const fileRef = useRef(null)

  const filteredIcons = ICON_LIBRARY.filter(i => {
    const matchSearch = i.name.toLowerCase().includes(iconSearch.toLowerCase())
    const matchCat = category === 'all' || i.cat === category
    return matchSearch && matchCat
  })

  const harmonyColors = useMemo(() => generateHarmony(harmonySeed, harmonyMode), [harmonySeed, harmonyMode])

  const handleSvgUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const svgText = ev.target.result
      const pathMatch = svgText.match(/\bd="([^"]+)"/g)
      if (pathMatch) {
        const allPaths = pathMatch.map(m => m.match(/d="([^"]+)"/)[1]).join(' ')
        const vbMatch = svgText.match(/viewBox="([^"]+)"/)
        const viewBox = vbMatch ? vbMatch[1] : '0 0 24 24'
        updateMulti({
          iconMode: 'upload',
          uploadedSvg: { paths: allPaths, viewBox, name: file.name.replace('.svg', '') },
        })
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const containerStyle = mobile ? {} : {
    width: 290,
    minWidth: 290,
    height: '100%',
    borderRight: '1px solid rgba(255,255,255,0.06)',
    background: 'rgba(255,255,255,0.02)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  }

  const tabs = [
    { id: 'icon', label: 'Icon' },
    { id: 'stroke', label: 'Stroke' },
    { id: 'background', label: 'BG' },
    { id: 'presets', label: 'Presets' },
  ]

  const [selectedPack, setSelectedPack] = useState(null)
  const [genPrompt, setGenPrompt] = useState('')
  const [genStyle, setGenStyle] = useState('minimal')
  const [generatedImages, setGeneratedImages] = useState([])
  const [genLoading, setGenLoading] = useState(false)
  const [genError, setGenError] = useState('')
  const [apiReady, setApiReady] = useState(null) // null=unchecked, true/false

  const handleGenerate = async () => {
    if (!genPrompt.trim() || genLoading) return
    setGenLoading(true)
    setGenError('')
    try {
      const res = await fetch('/api/generate-icon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: genPrompt.trim(), style: genStyle }),
      })
      const data = await res.json()
      if (!res.ok) {
        setGenError(data.error || 'Generation failed')
        return
      }
      if (data.images && data.images.length > 0) {
        setGeneratedImages(data.images)
        const firstUrl = `data:${data.images[0].mimeType};base64,${data.images[0].data}`
        updateMulti({ iconMode: 'generate', generatedImage: firstUrl })
      }
    } catch (err) {
      setGenError('Could not connect to server. Run: npm run server')
    } finally {
      setGenLoading(false)
    }
  }

  const iconModes = [
    { id: 'library', label: 'Library' },
    { id: 'text', label: 'Text' },
    { id: 'upload', label: 'Upload' },
    { id: 'packs', label: 'Packs' },
    { id: 'generate', label: 'Generate' },
  ]

  const Toggle = ({ value, onChange }) => (
    <button
      onClick={onChange}
      style={{
        width: 36, height: 20, borderRadius: 999, border: 'none', cursor: 'pointer',
        background: value ? '#0339f8' : 'rgba(255,255,255,0.1)',
        position: 'relative', transition: 'all 0.15s', padding: 0,
      }}
    >
      <div style={{
        width: 14, height: 14, borderRadius: '50%',
        background: value ? '#ffffff' : 'rgba(255,255,255,0.3)',
        position: 'absolute', top: 3, left: value ? 19 : 3, transition: 'all 0.15s',
      }} />
    </button>
  )

  return (
    <div style={containerStyle}>
      {!mobile && (
        <div style={{ padding: '18px 18px 0' }}>
          <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 2 }}>
            Icon <span className="display-italic">Builder</span>
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 16 }}>
            Design custom icons for apps & brands
          </div>
        </div>
      )}

      <div style={{
        display: 'flex', gap: 2,
        padding: mobile ? '0 0 12px' : '0 18px 12px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1, padding: '7px 0', fontSize: 11, fontWeight: 500, fontFamily: 'inherit',
              border: 'none', borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s',
              background: tab === t.id ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: tab === t.id ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: mobile ? '14px 0' : '14px 18px' }}>

        {/* ====== ICON TAB ====== */}
        {tab === 'icon' && (
          <>
            <div className="section-label">Source</div>
            <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
              {iconModes.map(m => (
                <button
                  key={m.id}
                  onClick={() => update('iconMode', m.id)}
                  style={{
                    flex: 1, padding: '6px 0', fontSize: 10, fontWeight: 500, fontFamily: 'inherit',
                    border: config.iconMode === m.id ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 8,
                    background: config.iconMode === m.id ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.02)',
                    color: config.iconMode === m.id ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.4)',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {config.iconMode === 'library' && (
              <>
                <div style={{ marginBottom: 10 }}>
                  <input
                    type="text" placeholder="Search icons..."
                    value={iconSearch} onChange={e => setIconSearch(e.target.value)}
                    style={{
                      width: '100%', padding: '8px 12px', fontSize: 12, fontFamily: 'inherit',
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 10, color: 'rgba(255,255,255,0.8)', outline: 'none',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
                  {ICON_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      style={{
                        padding: '4px 8px', fontSize: 9, fontWeight: 500, fontFamily: 'inherit',
                        border: 'none', borderRadius: 6, cursor: 'pointer', transition: 'all 0.15s',
                        background: category === cat.id ? 'rgba(3,57,248,0.3)' : 'rgba(255,255,255,0.04)',
                        color: category === cat.id ? '#6b9fff' : 'rgba(255,255,255,0.35)',
                      }}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginBottom: 8 }}>{filteredIcons.length} icons</div>

                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 5,
                  marginBottom: 16, maxHeight: 260, overflow: 'auto',
                }}>
                  {filteredIcons.map(icon => (
                    <button
                      key={icon.id}
                      onClick={() => update('icon', icon)}
                      title={icon.name}
                      style={{
                        aspectRatio: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: config.icon.id === icon.id ? '1px solid rgba(3,57,248,0.6)' : '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 8,
                        background: config.icon.id === icon.id ? 'rgba(3,57,248,0.15)' : 'rgba(255,255,255,0.02)',
                        cursor: 'pointer', transition: 'all 0.15s', padding: 0,
                      }}
                    >
                      <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
                        stroke={config.icon.id === icon.id ? '#6b9fff' : 'rgba(255,255,255,0.4)'}
                        strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
                      >
                        <path d={icon.path} />
                      </svg>
                    </button>
                  ))}
                </div>
              </>
            )}

            {config.iconMode === 'text' && (
              <>
                <div className="section-label">Text / Monogram</div>
                <input
                  type="text" value={config.iconText}
                  onChange={e => update('iconText', e.target.value.slice(0, 4))}
                  placeholder="KD" maxLength={4}
                  style={{
                    width: '100%', padding: '12px 14px', fontSize: 20, fontWeight: 700,
                    fontFamily: 'inherit', textAlign: 'center', letterSpacing: config.iconLetterSpacing,
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 12, color: 'rgba(255,255,255,0.9)', outline: 'none', marginBottom: 16,
                  }}
                />
                <div className="control-row">
                  <span className="control-label">Weight</span>
                  <input type="range" min="300" max="900" step="100" value={config.iconFontWeight}
                    onChange={e => update('iconFontWeight', +e.target.value)} style={{ flex: 1 }} />
                  <span className="control-value">{config.iconFontWeight}</span>
                </div>
                <div className="control-row">
                  <span className="control-label">Spacing</span>
                  <input type="range" min="-6" max="8" step="1" value={config.iconLetterSpacing}
                    onChange={e => update('iconLetterSpacing', +e.target.value)} style={{ flex: 1 }} />
                  <span className="control-value">{config.iconLetterSpacing}px</span>
                </div>
              </>
            )}

            {config.iconMode === 'upload' && (
              <>
                <div className="section-label">Upload SVG</div>
                <input ref={fileRef} type="file" accept=".svg" onChange={handleSvgUpload} style={{ display: 'none' }} />
                {config.uploadedSvg ? (
                  <div style={{
                    padding: 16, background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, textAlign: 'center', marginBottom: 16,
                  }}>
                    <svg viewBox={config.uploadedSvg.viewBox} style={{ width: 48, height: 48, marginBottom: 8 }}
                      fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d={config.uploadedSvg.paths} />
                    </svg>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>{config.uploadedSvg.name}</div>
                    <button onClick={() => fileRef.current?.click()} style={{
                      padding: '6px 16px', fontSize: 10, fontWeight: 500, fontFamily: 'inherit',
                      border: '1px solid rgba(255,255,255,0.1)', borderRadius: 999,
                      background: 'transparent', color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
                    }}>Replace</button>
                  </div>
                ) : (
                  <button onClick={() => fileRef.current?.click()} style={{
                    width: '100%', padding: '28px 16px', background: 'rgba(255,255,255,0.02)',
                    border: '2px dashed rgba(255,255,255,0.08)', borderRadius: 14, cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginBottom: 16,
                  }}>
                    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                    </svg>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Drop SVG or click to upload</span>
                  </button>
                )}
              </>
            )}

            {config.iconMode === 'packs' && (
              <>
                <div className="section-label">Icon Packs</div>
                {!selectedPack ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6, marginBottom: 16 }}>
                    {ICON_PACKS.map(pack => (
                      <button
                        key={pack.id}
                        onClick={() => {
                          setSelectedPack(pack)
                          const firstIcon = ICON_LIBRARY.find(i => i.id === pack.icons[0])
                          if (firstIcon) {
                            updateMulti({ ...pack.style, icon: firstIcon, iconMode: 'packs' })
                          }
                        }}
                        style={{
                          display: 'flex', flexDirection: 'column', gap: 6,
                          padding: '10px 8px', background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10,
                          cursor: 'pointer', transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                        }}
                      >
                        <div style={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
                          {pack.icons.slice(0, 4).map(iconId => {
                            const icon = ICON_LIBRARY.find(i => i.id === iconId)
                            return icon ? (
                              <div key={iconId} style={{
                                width: 24, height: 24, borderRadius: 5,
                                background: pack.color + '22',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                                <svg width={12} height={12} viewBox="0 0 24 24" fill="none"
                                  stroke={pack.color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                                  <path d={icon.path} />
                                </svg>
                              </div>
                            ) : null
                          })}
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.8)' }}>{pack.name}</div>
                          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>{pack.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setSelectedPack(null)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '6px 10px', marginBottom: 12,
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 8, cursor: 'pointer', fontSize: 11, fontFamily: 'inherit',
                        color: 'rgba(255,255,255,0.5)', transition: 'all 0.15s',
                      }}
                    >
                      <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                      </svg>
                      All Packs
                    </button>
                    <div style={{
                      padding: '10px 12px', marginBottom: 12,
                      background: selectedPack.color + '11',
                      border: `1px solid ${selectedPack.color}33`,
                      borderRadius: 10,
                    }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginBottom: 2 }}>
                        {selectedPack.name}
                      </div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>
                        {selectedPack.icons.length} icons — {selectedPack.desc}
                      </div>
                    </div>
                    <div style={{
                      display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5,
                      marginBottom: 16,
                    }}>
                      {selectedPack.icons.map(iconId => {
                        const icon = ICON_LIBRARY.find(i => i.id === iconId)
                        if (!icon) return null
                        const isSelected = config.icon.id === icon.id
                        return (
                          <button
                            key={iconId}
                            onClick={() => updateMulti({ icon, iconMode: 'packs' })}
                            title={icon.name}
                            style={{
                              aspectRatio: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              border: isSelected ? `1px solid ${selectedPack.color}99` : '1px solid rgba(255,255,255,0.06)',
                              borderRadius: 8,
                              background: isSelected ? selectedPack.color + '22' : 'rgba(255,255,255,0.02)',
                              cursor: 'pointer', transition: 'all 0.15s', padding: 0,
                            }}
                          >
                            <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
                              stroke={isSelected ? selectedPack.color : 'rgba(255,255,255,0.4)'}
                              strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                              <path d={icon.path} />
                            </svg>
                          </button>
                        )
                      })}
                    </div>
                    <button
                      onClick={() => updateMulti(selectedPack.style)}
                      style={{
                        width: '100%', padding: '9px 0', marginBottom: 12,
                        fontSize: 11, fontWeight: 500, fontFamily: 'inherit',
                        border: `1px solid ${selectedPack.color}44`,
                        borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s',
                        background: selectedPack.color + '18',
                        color: selectedPack.color,
                      }}
                    >
                      Apply Pack Style
                    </button>
                  </>
                )}
              </>
            )}

            {config.iconMode === 'generate' && (
              <>
                <div className="section-label">AI Icon Generator</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginBottom: 10, lineHeight: 1.5 }}>
                  Powered by Google Gemini — generates unique icons from your description
                </div>
                <div style={{ marginBottom: 12 }}>
                  <input
                    type="text" placeholder="Describe your icon... e.g. rocket, shield, music"
                    value={genPrompt} onChange={e => setGenPrompt(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && genPrompt.trim() && !genLoading) {
                        handleGenerate()
                      }
                    }}
                    style={{
                      width: '100%', padding: '10px 12px', fontSize: 12, fontFamily: 'inherit',
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 10, color: 'rgba(255,255,255,0.8)', outline: 'none', marginBottom: 8,
                    }}
                  />
                  <div style={{ display: 'flex', gap: 4, marginBottom: 10, flexWrap: 'wrap' }}>
                    {GENERATE_STYLES.map(s => (
                      <button
                        key={s.id}
                        onClick={() => setGenStyle(s.id)}
                        style={{
                          padding: '4px 8px', fontSize: 9, fontWeight: 500, fontFamily: 'inherit',
                          border: 'none', borderRadius: 6, cursor: 'pointer', transition: 'all 0.15s',
                          background: genStyle === s.id ? 'rgba(3,57,248,0.3)' : 'rgba(255,255,255,0.04)',
                          color: genStyle === s.id ? '#6b9fff' : 'rgba(255,255,255,0.35)',
                        }}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleGenerate}
                    disabled={genLoading || !genPrompt.trim()}
                    style={{
                      width: '100%', padding: '10px 0', fontSize: 11, fontWeight: 600, fontFamily: 'inherit',
                      border: 'none', borderRadius: 8, cursor: genLoading ? 'wait' : 'pointer',
                      transition: 'all 0.15s',
                      background: genLoading ? 'rgba(3,57,248,0.5)' : '#0339f8',
                      color: '#ffffff',
                      opacity: !genPrompt.trim() ? 0.5 : 1,
                    }}
                  >
                    {genLoading ? 'Generating...' : 'Generate Icon'}
                  </button>
                </div>

                {genError && (
                  <div style={{
                    padding: '10px 12px', marginBottom: 12,
                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: 8, fontSize: 10, color: '#fca5a5', lineHeight: 1.5,
                  }}>
                    {genError}
                  </div>
                )}

                {generatedImages.length > 0 && (
                  <>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginBottom: 8 }}>
                      {generatedImages.length} result{generatedImages.length > 1 ? 's' : ''} — click to use
                    </div>
                    <div style={{
                      display: 'grid', gridTemplateColumns: `repeat(${Math.min(generatedImages.length, 3)}, 1fr)`, gap: 6,
                      marginBottom: 16,
                    }}>
                      {generatedImages.map((img, i) => {
                        const dataUrl = `data:${img.mimeType};base64,${img.data}`
                        const isSelected = config.generatedImage === dataUrl
                        return (
                          <button
                            key={i}
                            onClick={() => updateMulti({
                              iconMode: 'generate',
                              generatedImage: dataUrl,
                            })}
                            style={{
                              aspectRatio: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              border: isSelected ? '2px solid #0339f8' : '1px solid rgba(255,255,255,0.08)',
                              borderRadius: 10, overflow: 'hidden',
                              background: 'rgba(255,255,255,0.04)',
                              cursor: 'pointer', transition: 'all 0.15s', padding: 4,
                            }}
                          >
                            <img src={dataUrl} alt={`Generated ${i + 1}`}
                              style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 6 }} />
                          </button>
                        )
                      })}
                    </div>
                  </>
                )}

                {generatedImages.length === 0 && !genLoading && !genError && (
                  <div style={{
                    padding: '24px 12px', background: 'rgba(255,255,255,0.02)',
                    border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 12,
                    textAlign: 'center', marginBottom: 16,
                  }}>
                    <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)"
                      strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 8 }}>
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', lineHeight: 1.6 }}>
                      Describe what you want and hit Generate.<br />
                      <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)' }}>
                        Requires backend: <code style={{ fontSize: 9 }}>npm run server</code>
                      </span>
                    </div>
                  </div>
                )}

                {genLoading && (
                  <div style={{
                    padding: '28px 12px', textAlign: 'center', marginBottom: 16,
                  }}>
                    <div style={{
                      width: 24, height: 24, border: '2px solid rgba(255,255,255,0.1)',
                      borderTopColor: '#0339f8', borderRadius: '50%',
                      margin: '0 auto 10px',
                      animation: 'spin 0.8s linear infinite',
                    }} />
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                      Generating with Gemini...
                    </div>
                    <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                  </div>
                )}
              </>
            )}

            {/* Icon controls */}
            <div className="section-label" style={{ marginTop: 4 }}>Icon Settings</div>
            <div className="control-row">
              <span className="control-label">Color</span>
              <input type="color" value={config.iconColor.startsWith('rgba') ? '#ffffff' : config.iconColor}
                onChange={e => update('iconColor', e.target.value)} style={{ width: 32, height: 32 }} />
            </div>
            <div className="control-row">
              <span className="control-label">Size</span>
              <input type="range" min="20" max="90" value={config.iconSize}
                onChange={e => update('iconSize', +e.target.value)} style={{ flex: 1 }} />
              <span className="control-value">{config.iconSize}%</span>
            </div>
            <div className="control-row">
              <span className="control-label">Rotation</span>
              <input type="range" min="-180" max="180" value={config.rotation}
                onChange={e => update('rotation', +e.target.value)} style={{ flex: 1 }} />
              <span className="control-value">{config.rotation}&deg;</span>
            </div>

            {/* Duotone */}
            {config.iconMode !== 'text' && (
              <>
                <div className="section-label" style={{ marginTop: 8 }}>Duotone</div>
                <div className="control-row">
                  <span className="control-label">Enable</span>
                  <Toggle value={config.duotone} onChange={() => update('duotone', !config.duotone)} />
                </div>
                {config.duotone && (
                  <>
                    <div className="control-row">
                      <span className="control-label">Fill Color</span>
                      <input type="color" value={config.duotoneFillColor}
                        onChange={e => update('duotoneFillColor', e.target.value)} style={{ width: 32, height: 32 }} />
                    </div>
                    <div className="control-row">
                      <span className="control-label">Fill Opacity</span>
                      <input type="range" min="0" max="100" step="5"
                        value={Math.round(config.duotoneFillOpacity * 100)}
                        onChange={e => update('duotoneFillOpacity', +e.target.value / 100)} style={{ flex: 1 }} />
                      <span className="control-value">{Math.round(config.duotoneFillOpacity * 100)}%</span>
                    </div>
                  </>
                )}
              </>
            )}

            {/* Shadow */}
            <div className="section-label" style={{ marginTop: 8 }}>Shadow</div>
            <div className="control-row">
              <span className="control-label">Enable</span>
              <Toggle value={config.shadow} onChange={() => update('shadow', !config.shadow)} />
            </div>
            {config.shadow && (
              <>
                <div className="control-row">
                  <span className="control-label">Blur</span>
                  <input type="range" min="4" max="64" value={config.shadowBlur}
                    onChange={e => update('shadowBlur', +e.target.value)} style={{ flex: 1 }} />
                  <span className="control-value">{config.shadowBlur}px</span>
                </div>
                <div className="control-row">
                  <span className="control-label">Opacity</span>
                  <input type="range" min="0" max="100" step="5"
                    value={Math.round(config.shadowOpacity * 100)}
                    onChange={e => update('shadowOpacity', +e.target.value / 100)} style={{ flex: 1 }} />
                  <span className="control-value">{Math.round(config.shadowOpacity * 100)}%</span>
                </div>
              </>
            )}

            {/* Badges */}
            <div className="section-label" style={{ marginTop: 8 }}>Badge</div>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, marginBottom: 10,
            }}>
              {BADGE_TYPES.map(b => (
                <button
                  key={b.id}
                  onClick={() => update('badgeType', b.id)}
                  style={{
                    padding: '6px 0', fontSize: 9, fontWeight: 500, fontFamily: 'inherit',
                    border: config.badgeType === b.id ? '1px solid rgba(3,57,248,0.6)' : '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 6,
                    background: config.badgeType === b.id ? 'rgba(3,57,248,0.15)' : 'rgba(255,255,255,0.02)',
                    color: config.badgeType === b.id ? '#6b9fff' : 'rgba(255,255,255,0.35)',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {b.name}
                </button>
              ))}
            </div>
            {config.badgeType !== 'none' && (
              <>
                <div className="control-row">
                  <span className="control-label">Position</span>
                  <select
                    value={config.badgePosition}
                    onChange={e => update('badgePosition', e.target.value)}
                    style={{
                      padding: '4px 8px', fontSize: 10, fontFamily: 'inherit',
                      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 6, color: 'rgba(255,255,255,0.7)', outline: 'none',
                    }}
                  >
                    {BADGE_POSITIONS.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="control-row">
                  <span className="control-label">Color</span>
                  <input type="color" value={config.badgeColor}
                    onChange={e => update('badgeColor', e.target.value)} style={{ width: 32, height: 32 }} />
                </div>
                {config.badgeType === 'count' && (
                  <div className="control-row">
                    <span className="control-label">Text</span>
                    <input type="text" value={config.badgeText} maxLength={3}
                      onChange={e => update('badgeText', e.target.value)}
                      style={{
                        width: 40, padding: '4px 8px', fontSize: 11, fontFamily: 'inherit', textAlign: 'center',
                        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 6, color: 'rgba(255,255,255,0.8)', outline: 'none',
                      }}
                    />
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ====== STROKE TAB ====== */}
        {tab === 'stroke' && (
          <>
            {config.iconMode === 'text' ? (
              <div style={{
                padding: '20px 12px', background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10,
                fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center',
              }}>
                Stroke styles apply to Library and Upload icons only
              </div>
            ) : (
              <>
                <div className="section-label">Stroke Weight</div>
                <div className="control-row">
                  <span className="control-label">Width</span>
                  <input type="range" min="0.5" max="4" step="0.1" value={config.iconStroke}
                    onChange={e => update('iconStroke', +e.target.value)} style={{ flex: 1 }} />
                  <span className="control-value">{config.iconStroke.toFixed(1)}</span>
                </div>

                <div className="section-label" style={{ marginTop: 8 }}>Stroke Style</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5, marginBottom: 16 }}>
                  {STROKE_STYLES.map(style => (
                    <button
                      key={style.id}
                      onClick={() => update('strokeStyle', style.id)}
                      style={{
                        padding: '8px 0', fontSize: 10, fontWeight: 500, fontFamily: 'inherit',
                        border: config.strokeStyle === style.id ? '1px solid rgba(3,57,248,0.6)' : '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 8,
                        background: config.strokeStyle === style.id ? 'rgba(3,57,248,0.15)' : 'rgba(255,255,255,0.02)',
                        color: config.strokeStyle === style.id ? '#6b9fff' : 'rgba(255,255,255,0.4)',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >
                      {style.name}
                    </button>
                  ))}
                </div>

                <div className="control-row">
                  <span className="control-label">Fill Icon</span>
                  <Toggle value={config.fillIcon} onChange={() => update('fillIcon', !config.fillIcon)} />
                </div>

                {config.strokeStyle === 'dashed' && (
                  <>
                    <div className="section-label" style={{ marginTop: 8 }}>Dash Settings</div>
                    <div className="control-row">
                      <span className="control-label">Dash</span>
                      <input type="range" min="2" max="16" value={config.strokeDash}
                        onChange={e => update('strokeDash', +e.target.value)} style={{ flex: 1 }} />
                      <span className="control-value">{config.strokeDash}</span>
                    </div>
                    <div className="control-row">
                      <span className="control-label">Gap</span>
                      <input type="range" min="1" max="12" value={config.strokeGap}
                        onChange={e => update('strokeGap', +e.target.value)} style={{ flex: 1 }} />
                      <span className="control-value">{config.strokeGap}</span>
                    </div>
                  </>
                )}

                {config.strokeStyle === '3d' && (
                  <>
                    <div className="section-label" style={{ marginTop: 8 }}>3D Settings</div>
                    <div className="control-row">
                      <span className="control-label">Depth</span>
                      <input type="range" min="1" max="16" value={config.stroke3dDepth}
                        onChange={e => update('stroke3dDepth', +e.target.value)} style={{ flex: 1 }} />
                      <span className="control-value">{config.stroke3dDepth}</span>
                    </div>
                    <div className="control-row">
                      <span className="control-label">Shadow</span>
                      <input type="color" value={config.stroke3dColor?.startsWith('rgba') ? '#000000' : (config.stroke3dColor || '#000000')}
                        onChange={e => update('stroke3dColor', e.target.value)} style={{ width: 32, height: 32 }} />
                    </div>
                  </>
                )}

                {config.strokeStyle === 'neon' && (
                  <>
                    <div className="section-label" style={{ marginTop: 8 }}>Neon Settings</div>
                    <div className="control-row">
                      <span className="control-label">Glow Size</span>
                      <input type="range" min="4" max="40" value={config.neonGlow}
                        onChange={e => update('neonGlow', +e.target.value)} style={{ flex: 1 }} />
                      <span className="control-value">{config.neonGlow}</span>
                    </div>
                    <div className="control-row">
                      <span className="control-label">Color</span>
                      <input type="color" value={config.neonColor || config.iconColor}
                        onChange={e => update('neonColor', e.target.value)} style={{ width: 32, height: 32 }} />
                    </div>
                  </>
                )}

                {config.strokeStyle === 'double' && (
                  <>
                    <div className="section-label" style={{ marginTop: 8 }}>Double Settings</div>
                    <div className="control-row">
                      <span className="control-label">Outer Color</span>
                      <input type="color" value={config.secondStrokeColor || config.iconColor}
                        onChange={e => update('secondStrokeColor', e.target.value)} style={{ width: 32, height: 32 }} />
                    </div>
                  </>
                )}

                {config.strokeStyle === 'gradient' && (
                  <>
                    <div className="section-label" style={{ marginTop: 8 }}>Gradient Colors</div>
                    <div className="control-row">
                      <span className="control-label">Start</span>
                      <input type="color" value={config.iconColor.startsWith('rgba') ? '#ffffff' : config.iconColor}
                        onChange={e => update('iconColor', e.target.value)} style={{ width: 32, height: 32 }} />
                    </div>
                    <div className="control-row">
                      <span className="control-label">End</span>
                      <input type="color" value={config.gradientStrokeColor || '#06b6d4'}
                        onChange={e => update('gradientStrokeColor', e.target.value)} style={{ width: 32, height: 32 }} />
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}

        {/* ====== BACKGROUND TAB ====== */}
        {tab === 'background' && (
          <>
            <div className="section-label">Shape</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5, marginBottom: 16 }}>
              {BG_SHAPES.map(shape => (
                <button
                  key={shape.id}
                  onClick={() => update('bgShape', shape.id)}
                  style={{
                    padding: '7px 0', fontSize: 9, fontWeight: 500, fontFamily: 'inherit',
                    border: config.bgShape === shape.id ? '1px solid rgba(3,57,248,0.6)' : '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 6,
                    background: config.bgShape === shape.id ? 'rgba(3,57,248,0.15)' : 'rgba(255,255,255,0.02)',
                    color: config.bgShape === shape.id ? '#6b9fff' : 'rgba(255,255,255,0.35)',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {shape.name}
                </button>
              ))}
            </div>

            {config.bgShape !== 'none' && (
              <>
                <div className="section-label">Color Presets</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
                  {COLOR_PRESETS.map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => updateMulti({ bgColor: preset.bg, iconColor: preset.icon, isGradient: !!preset.isGradient })}
                      style={{
                        aspectRatio: 1, borderRadius: 10,
                        border: config.bgColor === preset.bg ? '2px solid rgba(255,255,255,0.4)' : '1px solid rgba(255,255,255,0.08)',
                        background: preset.bg, cursor: 'pointer', transition: 'all 0.15s', padding: 0,
                      }}
                      title={preset.name}
                    />
                  ))}
                </div>

                <div className="section-label">Custom Color</div>
                <div className="control-row">
                  <span className="control-label">Background</span>
                  <input type="color" value={config.isGradient ? '#0339f8' : config.bgColor}
                    onChange={e => updateMulti({ bgColor: e.target.value, isGradient: false })} style={{ width: 32, height: 32 }} />
                </div>
                <div className="control-row">
                  <span className="control-label">Opacity</span>
                  <input type="range" min="0" max="100" value={config.bgOpacity}
                    onChange={e => update('bgOpacity', +e.target.value)} style={{ flex: 1 }} />
                  <span className="control-value">{config.bgOpacity}%</span>
                </div>
                <div className="control-row">
                  <span className="control-label">Padding</span>
                  <input type="range" min="0" max="30" value={config.padding}
                    onChange={e => update('padding', +e.target.value)} style={{ flex: 1 }} />
                  <span className="control-value">{config.padding}px</span>
                </div>

                <div className="section-label" style={{ marginTop: 8 }}>Effects</div>
                <div className="control-row">
                  <span className="control-label">Noise / Grain</span>
                  <input type="range" min="0" max="20" value={config.noiseIntensity}
                    onChange={e => update('noiseIntensity', +e.target.value)} style={{ flex: 1 }} />
                  <span className="control-value">{config.noiseIntensity}%</span>
                </div>
                <div className="control-row">
                  <span className="control-label">Glass Effect</span>
                  <Toggle value={config.glassEffect} onChange={() => update('glassEffect', !config.glassEffect)} />
                </div>
              </>
            )}

            {/* Color Harmony Engine */}
            <div className="section-label" style={{ marginTop: 16 }}>Color Harmony</div>
            <div className="control-row">
              <span className="control-label">Seed</span>
              <input type="color" value={harmonySeed}
                onChange={e => setHarmonySeed(e.target.value)} style={{ width: 32, height: 32 }} />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10, marginTop: 6 }}>
              {HARMONY_MODES.map(m => (
                <button
                  key={m.id}
                  onClick={() => setHarmonyMode(m.id)}
                  style={{
                    padding: '4px 8px', fontSize: 9, fontWeight: 500, fontFamily: 'inherit',
                    border: 'none', borderRadius: 6, cursor: 'pointer',
                    background: harmonyMode === m.id ? 'rgba(3,57,248,0.3)' : 'rgba(255,255,255,0.04)',
                    color: harmonyMode === m.id ? '#6b9fff' : 'rgba(255,255,255,0.35)',
                  }}
                >
                  {m.name}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              {harmonyColors.map((color, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (config.bgShape !== 'none') {
                      updateMulti({ bgColor: color, isGradient: false })
                    } else {
                      update('iconColor', color)
                    }
                  }}
                  title={`Click to apply: ${color}`}
                  style={{
                    flex: 1, height: 32, borderRadius: 8, background: color,
                    border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                />
              ))}
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginBottom: 8 }}>
              Click a swatch to apply as {config.bgShape !== 'none' ? 'background' : 'icon'} color
            </div>
          </>
        )}

        {/* ====== PRESETS TAB ====== */}
        {tab === 'presets' && (
          <>
            <div className="section-label">Style Presets</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 20 }}>
              {STYLE_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => updateMulti(preset.config)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: 8, padding: '14px 8px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 12, cursor: 'pointer', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                  }}
                >
                  <div style={{
                    width: 44, height: 44,
                    borderRadius: preset.config.bgShape === 'circle' ? '50%'
                      : preset.config.bgShape === 'squircle' ? 12
                      : preset.config.bgShape === 'rounded' ? 8 : 4,
                    background: preset.config.bgShape !== 'none' ? preset.config.bgColor : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: preset.config.bgShape === 'none' ? '1px solid rgba(255,255,255,0.08)' : 'none',
                  }}>
                    <svg width={20} height={20} viewBox="0 0 24 24" fill="none"
                      stroke={preset.config.iconColor} strokeWidth={1.5}
                      strokeLinecap="round" strokeLinejoin="round">
                      <path d={config.icon?.path || ICON_LIBRARY[0].path} />
                    </svg>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.8)' }}>{preset.name}</div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>{preset.desc}</div>
                  </div>
                </button>
              ))}
            </div>

            <div style={{
              padding: '10px 12px', background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10,
              fontSize: 10, color: 'rgba(255,255,255,0.3)', lineHeight: 1.6,
            }}>
              Apply a style preset, then customize in other tabs. Your icon choice is preserved.
            </div>
          </>
        )}
      </div>
    </div>
  )
}
