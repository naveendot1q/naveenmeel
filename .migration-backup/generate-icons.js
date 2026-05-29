#!/usr/bin/env node
/**
 * Run: node generate-icons.js
 * Generates all PWA icon sizes as SVG → PNG using sharp (if available)
 * Falls back to creating placeholder SVGs you can convert online.
 */

const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const outDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

function makeSvg(size) {
  const pad = Math.round(size * 0.15);
  const inner = size - pad * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.2)}" fill="#0d1117"/>
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.2)}" fill="url(#g)"/>
  <defs>
    <radialGradient id="g" cx="35%" cy="35%">
      <stop offset="0%" stop-color="#FF8C42" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#0d1117" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle"
    font-family="system-ui,sans-serif" font-weight="900"
    font-size="${Math.round(inner * 0.55)}" fill="#FF6B1A">NM</text>
  <text x="50%" y="80%" dominant-baseline="middle" text-anchor="middle"
    font-family="system-ui,sans-serif" font-weight="700"
    font-size="${Math.round(inner * 0.18)}" fill="#00D4FF">.DEV</text>
</svg>`;
}

// Write SVGs (usable as-is, or convert to PNG)
sizes.forEach(size => {
  const svgPath = path.join(outDir, `icon-${size}.svg`);
  fs.writeFileSync(svgPath, makeSvg(size));
  console.log(`✓ icon-${size}.svg`);
});

// Also write apple-touch-icon
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.svg'), makeSvg(180));
console.log('✓ apple-touch-icon.svg');

// Try to convert with sharp if available
try {
  const sharp = require('sharp');
  Promise.all(sizes.map(async size => {
    const svg = Buffer.from(makeSvg(size));
    await sharp(svg).png().toFile(path.join(outDir, `icon-${size}.png`));
    console.log(`✓ icon-${size}.png`);
  })).then(() => {
    sharp(Buffer.from(makeSvg(180))).png().toFile(path.join(outDir, 'apple-touch-icon.png'));
    console.log('\n✅ All PNG icons generated!');
  });
} catch {
  console.log('\n⚠️  sharp not installed. SVG icons created instead.');
  console.log('   To generate PNGs, run: npm install sharp && node generate-icons.js');
  console.log('   Or convert SVGs at: https://cloudconvert.com/svg-to-png');
}
