const HARMONY_MODES = [
  { id: 'complementary', name: 'Complementary' },
  { id: 'analogous', name: 'Analogous' },
  { id: 'triadic', name: 'Triadic' },
  { id: 'split-complementary', name: 'Split Complementary' },
  { id: 'monochromatic', name: 'Monochromatic' },
  { id: 'tetradic', name: 'Tetradic' },
];

function hexToHsl(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 0, s: 0, l: 0 };
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * Math.max(0, Math.min(1, color))).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function generateHarmony(hexColor, mode) {
  const { h, s, l } = hexToHsl(hexColor);
  const shift = (deg) => hslToHex((h + deg + 360) % 360, s, l);

  switch (mode) {
    case 'complementary':
      return [
        hexColor,
        hslToHex(h, clamp(s - 15, 0, 100), clamp(l + 10, 0, 100)),
        shift(180),
        hslToHex((h + 180) % 360, clamp(s - 15, 0, 100), clamp(l + 10, 0, 100)),
        hslToHex((h + 180) % 360, s, clamp(l - 15, 0, 100)),
      ];
    case 'analogous':
      return [
        shift(-30),
        shift(-15),
        hexColor,
        shift(15),
        shift(30),
      ];
    case 'triadic':
      return [
        hexColor,
        shift(120),
        shift(240),
        hslToHex(h, clamp(s - 20, 0, 100), clamp(l + 15, 0, 100)),
        hslToHex((h + 120) % 360, clamp(s - 20, 0, 100), clamp(l + 15, 0, 100)),
      ];
    case 'split-complementary':
      return [
        hexColor,
        shift(150),
        shift(210),
        hslToHex((h + 150) % 360, s, clamp(l + 10, 0, 100)),
        hslToHex((h + 210) % 360, s, clamp(l + 10, 0, 100)),
      ];
    case 'monochromatic':
      return [
        hslToHex(h, s, clamp(l - 30, 0, 100)),
        hslToHex(h, s, clamp(l - 15, 0, 100)),
        hexColor,
        hslToHex(h, s, clamp(l + 15, 0, 100)),
        hslToHex(h, clamp(s - 25, 0, 100), clamp(l + 30, 0, 100)),
      ];
    case 'tetradic':
      return [
        hexColor,
        shift(90),
        shift(180),
        shift(270),
        hslToHex(h, clamp(s - 20, 0, 100), clamp(l + 10, 0, 100)),
      ];
    default:
      return [hexColor, hexColor, hexColor, hexColor, hexColor];
  }
}

export { hexToHsl, hslToHex, generateHarmony, HARMONY_MODES };
