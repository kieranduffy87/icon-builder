export default function LogoPanel() {
  return (
    <div style={{
      width: 64,
      minWidth: 64,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: 20,
      gap: 16,
      borderRight: '1px solid rgba(255,255,255,0.06)',
      background: 'rgba(255,255,255,0.02)',
    }}>
      {/* KD Logo */}
      <div style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <svg viewBox="0 0 18.62 11.73" style={{ width: 18, height: 12 }}>
          <polygon points="18.62 0 12 0 6 5.86 12 11.73 18.62 11.73 12.62 5.86 18.62 0" fill="#0339f8"/>
          <polygon points="0 0 0 11.72 6 5.86 0 0" fill="#0339f8"/>
        </svg>
      </div>

      {/* Vertical text */}
      <div style={{
        writingMode: 'vertical-rl',
        textOrientation: 'mixed',
        fontSize: 11,
        letterSpacing: '0.06em',
        color: 'rgba(255,255,255,0.2)',
        fontWeight: 500,
        transform: 'rotate(180deg)',
        marginTop: 8,
      }}>
        Icon <span className="display-italic" style={{ color: 'rgba(255,255,255,0.35)' }}>Builder</span>
      </div>
    </div>
  )
}
