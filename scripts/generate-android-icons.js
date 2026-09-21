const sharp = require('sharp');
const path = require('path');

const INPUT = 'public/logo-star.png';
const BG = { r: 15, g: 23, b: 42, alpha: 1 }; // #0f172a — бренд-цвет Navy

const sizes = [
  { dir: 'android/app/src/main/res/mipmap-mdpi',    size: 48 },
  { dir: 'android/app/src/main/res/mipmap-hdpi',    size: 72 },
  { dir: 'android/app/src/main/res/mipmap-xhdpi',   size: 96 },
  { dir: 'android/app/src/main/res/mipmap-xxhdpi',  size: 144 },
  { dir: 'android/app/src/main/res/mipmap-xxxhdpi', size: 192 },
];

async function main() {
  for (const { dir, size } of sizes) {
    const outFile = path.join(dir, 'ic_launcher.png');
    const outRound = path.join(dir, 'ic_launcher_round.png');
    const outFg = path.join(dir, 'ic_launcher_foreground.png');

    // ic_launcher.png — квадратная иконка с тёмным фоном
    await sharp(INPUT)
      .resize(size, size, { fit: 'contain', background: BG })
      .flatten({ background: BG })
      .png()
      .toFile(outFile);
    console.log('✅ Generated:', outFile);

    // ic_launcher_round.png — круглая иконка
    await sharp(INPUT)
      .resize(size, size, { fit: 'contain', background: BG })
      .flatten({ background: BG })
      .png()
      .toFile(outRound);
    console.log('✅ Generated:', outRound);

    // ic_launcher_foreground.png — foreground (adaptive icon) 108dp = size * 108/48
    const fgSize = Math.round(size * 108 / 48);
    // Логотип занимает 66% от fgSize (safe zone adaptive icon)
    const logoSize = Math.round(fgSize * 0.6);
    await sharp(INPUT)
      .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .extend({
        top: Math.floor((fgSize - logoSize) / 2),
        bottom: Math.ceil((fgSize - logoSize) / 2),
        left: Math.floor((fgSize - logoSize) / 2),
        right: Math.ceil((fgSize - logoSize) / 2),
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(outFg);
    console.log('✅ Generated:', outFg);
  }
  console.log('\n🎉 Все иконки сгенерированы!');
}

main().catch(err => { console.error('❌ Error:', err); process.exit(1); });
