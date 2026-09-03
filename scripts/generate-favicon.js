const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function main() {
  const inputFile = path.join(__dirname, '../public/logo-star.png');
  const sizes = [16, 32, 48, 64, 128, 256];

  // 1. Create ICO buffer with multiple resolutions
  const pngBuffers = [];
  for (const size of sizes) {
    const buf = await sharp(inputFile)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    pngBuffers.push({ size, buf });
  }

  const count = pngBuffers.length;
  const headerSize = 6;
  const directorySize = 16 * count;
  let currentOffset = headerSize + directorySize;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // ICO type (1 = icon)
  header.writeUInt16LE(count, 4); // Number of images

  const directoryEntries = [];
  for (const item of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(item.size >= 256 ? 0 : item.size, 0); // Width
    entry.writeUInt8(item.size >= 256 ? 0 : item.size, 1); // Height
    entry.writeUInt8(0, 2); // Color palette
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(item.buf.length, 8); // Image size in bytes
    entry.writeUInt32LE(currentOffset, 12); // Image offset
    directoryEntries.push(entry);
    currentOffset += item.buf.length;
  }

  const icoBuffer = Buffer.concat([
    header,
    ...directoryEntries,
    ...pngBuffers.map(b => b.buf)
  ]);

  const appFavicon = path.join(__dirname, '../app/favicon.ico');
  const publicFavicon = path.join(__dirname, '../public/favicon.ico');
  fs.writeFileSync(appFavicon, icoBuffer);
  fs.writeFileSync(publicFavicon, icoBuffer);
  console.log('Saved app/favicon.ico and public/favicon.ico successfully');

  // 2. Save icon.png and apple-icon.png
  await sharp(inputFile).resize(512, 512).toFile(path.join(__dirname, '../app/icon.png'));
  await sharp(inputFile).resize(512, 512).toFile(path.join(__dirname, '../public/icon.png'));
  await sharp(inputFile).resize(180, 180).toFile(path.join(__dirname, '../app/apple-icon.png'));
  await sharp(inputFile).resize(180, 180).toFile(path.join(__dirname, '../public/apple-touch-icon.png'));
  console.log('Saved icon PNGs');

  // 3. Save favicon.svg
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <rect width="100" height="100" rx="20" fill="#0f172a" />
  <polygon points="50,15 61.8,38.9 88.2,42.7 69.1,61.3 73.6,87.6 50,75.2 26.4,87.6 30.9,61.3 11.8,42.7 38.2,38.9" fill="#f97316" />
</svg>`;
  fs.writeFileSync(path.join(__dirname, '../public/favicon.svg'), svgContent);
  fs.writeFileSync(path.join(__dirname, '../app/icon.svg'), svgContent);
  console.log('Saved SVG icons');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
