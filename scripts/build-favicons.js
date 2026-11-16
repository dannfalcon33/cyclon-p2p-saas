const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// SVG definition mirroring the Navbar brand icon:
// Container: rounded square with #08090d background, #00ff66/15 inner glow, and #00ff66/40 border
// Center: Lucide Zap lightning bolt in bright neon #00ff66
const createSvg = (size = 64) => {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${size}" height="${size}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0e131d"/>
      <stop offset="100%" stop-color="#08090d"/>
    </linearGradient>
    <radialGradient id="neonGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#00ff66" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#00ff66" stop-opacity="0.02"/>
    </radialGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="2.5" flood-color="#00ff66" flood-opacity="0.5"/>
    </filter>
  </defs>

  <!-- Container Base -->
  <rect x="2" y="2" width="60" height="60" rx="15" fill="url(#bgGrad)" stroke="#00ff66" stroke-width="2.5" stroke-opacity="0.45"/>
  <rect x="3.5" y="3.5" width="57" height="57" rx="13.5" fill="url(#neonGlow)"/>

  <!-- Centered Zap Lightning Bolt (scaled to fit within 64x64 container) -->
  <g transform="translate(32, 32) scale(1.65) translate(-12, -12)" filter="url(#glow)">
    <path
      d="M15.914 4a1.5 1.5 0 00-2.474-1.561l-9 9A1.5 1.5 0 005.5 14h4.002a.5.5 0 01.471.666L8.086 20a1.5 1.5 0 002.475 1.56l9-9A1.5 1.5 0 0018.5 10h-3.997a.5.5 0 01-.472-.667z"
      fill="#00ff66"
      stroke="#00ff66"
      stroke-width="0.8"
      stroke-linejoin="round"
    />
  </g>
</svg>`;
};

// Also an ultra-clean SVG version without filter for pure vector rendering across all browsers
const createCleanSvg = () => {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0d121c"/>
      <stop offset="100%" stop-color="#08090d"/>
    </linearGradient>
  </defs>

  <!-- Container Base -->
  <rect x="1" y="1" width="30" height="30" rx="7.5" fill="url(#bgGrad)" stroke="#00ff66" stroke-width="1.5" stroke-opacity="0.45"/>
  <rect x="2" y="2" width="28" height="28" rx="6.5" fill="#00ff66" fill-opacity="0.12"/>

  <!-- Centered Zap Lightning Bolt -->
  <g transform="translate(16, 16) scale(0.85) translate(-12, -12)">
    <path
      d="M15.914 4a1.5 1.5 0 00-2.474-1.561l-9 9A1.5 1.5 0 005.5 14h4.002a.5.5 0 01.471.666L8.086 20a1.5 1.5 0 002.475 1.56l9-9A1.5 1.5 0 0018.5 10h-3.997a.5.5 0 01-.472-.667z"
      fill="#00ff66"
      stroke="#00ff66"
      stroke-width="0.5"
      stroke-linejoin="round"
    />
  </g>
</svg>`;
};

// Build standard ICO format from array of PNG buffers
function createIcoFromPngs(pngBuffersWithSizes) {
  const count = pngBuffersWithSizes.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  let offset = headerSize + count * dirEntrySize;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // 1 = ICO
  header.writeUInt16LE(count, 4); // count of images

  const dirEntries = [];
  for (const item of pngBuffersWithSizes) {
    const entry = Buffer.alloc(dirEntrySize);
    const size = item.size >= 256 ? 0 : item.size;
    entry.writeUInt8(size, 0); // width
    entry.writeUInt8(size, 1); // height
    entry.writeUInt8(0, 2); // color palette
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bpp
    entry.writeUInt32LE(item.buffer.length, 8); // image size
    entry.writeUInt32LE(offset, 12); // image offset
    dirEntries.push(entry);
    offset += item.buffer.length;
  }

  return Buffer.concat([
    header,
    ...dirEntries,
    ...pngBuffersWithSizes.map((i) => i.buffer),
  ]);
}

async function run() {
  const masterSvg = createSvg(512);
  const cleanSvg = createCleanSvg();

  // Generate PNG sizes
  const sizes = [16, 32, 48];
  const icoPngs = [];

  for (const size of sizes) {
    const png = await sharp(Buffer.from(masterSvg))
      .resize(size, size, { fit: 'contain' })
      .png()
      .toBuffer();
    icoPngs.push({ size, buffer: png });
  }

  const icoBuffer = createIcoFromPngs(icoPngs);

  // Apple touch icon (180x180)
  const appleIcon = await sharp(Buffer.from(masterSvg))
    .resize(180, 180, { fit: 'contain' })
    .png()
    .toBuffer();

  // 192x192 and 512x512 icons for PWA / Web manifest
  const icon192 = await sharp(Buffer.from(masterSvg))
    .resize(192, 192, { fit: 'contain' })
    .png()
    .toBuffer();

  const icon512 = await sharp(Buffer.from(masterSvg))
    .resize(512, 512, { fit: 'contain' })
    .png()
    .toBuffer();

  // Targets:
  // 1. src/app/favicon.ico
  // 2. src/app/icon.svg (App router native icon)
  // 3. src/app/apple-icon.png (App router native apple-icon)
  // 4. public/favicon.ico
  // 5. public/icon.svg
  // 6. public/apple-touch-icon.png
  // 7. public/icon-192.png, public/icon-512.png

  fs.writeFileSync(path.join(__dirname, '../src/app/favicon.ico'), icoBuffer);
  fs.writeFileSync(path.join(__dirname, '../src/app/icon.svg'), cleanSvg, 'utf8');
  fs.writeFileSync(path.join(__dirname, '../src/app/apple-icon.png'), appleIcon);

  fs.writeFileSync(path.join(__dirname, '../public/favicon.ico'), icoBuffer);
  fs.writeFileSync(path.join(__dirname, '../public/icon.svg'), cleanSvg, 'utf8');
  fs.writeFileSync(path.join(__dirname, '../public/apple-touch-icon.png'), appleIcon);
  fs.writeFileSync(path.join(__dirname, '../public/icon-192.png'), icon192);
  fs.writeFileSync(path.join(__dirname, '../public/icon-512.png'), icon512);

  console.log('✅ All favicons and icons successfully generated!');
}

run().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
