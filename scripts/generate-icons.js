import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const publicDir = path.resolve('public');
const svgPath = path.join(publicDir, 'icon.svg');
const svgBuffer = fs.readFileSync(svgPath);

async function run() {
  await sharp(svgBuffer).resize(192, 192).png().toFile(path.join(publicDir, 'pwa-192x192.png'));
  await sharp(svgBuffer).resize(512, 512).png().toFile(path.join(publicDir, 'pwa-512x512.png'));
  await sharp(svgBuffer).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // Maskable icon with 10% padding
  await sharp(svgBuffer)
    .resize(410, 410)
    .extend({
      top: 51,
      bottom: 51,
      left: 51,
      right: 51,
      background: { r: 15, g: 15, b: 15, alpha: 1 }
    })
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));

  // Android TV Leanback Banner 320x180 (16:9)
  await sharp(svgBuffer)
    .resize(160, 160)
    .extend({
      top: 10,
      bottom: 10,
      left: 80,
      right: 80,
      background: { r: 15, g: 15, b: 15, alpha: 1 }
    })
    .resize(320, 180)
    .png()
    .toFile(path.join(publicDir, 'banner.png'));

  console.log('Successfully generated all PWA & Android TV icons!');
}

run().catch(console.error);
