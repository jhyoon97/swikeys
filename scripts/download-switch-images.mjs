/**
 * 스위치 이미지 일괄 다운로드 + 최적화 스크립트
 * 사용법: node scripts/download-switch-images.mjs
 * 출력: public/images/switches/{slug}.webp (800px, quality 90)
 */

import sharp from 'sharp';
import { writeFileSync, mkdirSync, copyFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const OUT_DIR = resolve('public/images/switches');
mkdirSync(OUT_DIR, { recursive: true });

// slug → image source URL mapping
const IMAGES = {
  // AEBoards
  'aeboards-raeds-he': 'https://cannonkeys.com/cdn/shop/files/DSC03707_grande.jpg?v=1745613325',

  // Wooting
  'lekker-linear45-(l45)-v2': 'https://wooting-website.ams3.cdn.digitaloceanspaces.com/products/switches/l45_v2_OG.webp',
  'lekker-linear60-(l60)-v1': 'https://wooting-website.ams3.cdn.digitaloceanspaces.com/products/switches/l60_v1_OG.webp',
  'lekker-linear60-(l60)-v2': 'https://wooting-website.ams3.cdn.digitaloceanspaces.com/products/switches/l60_v2_OG.webp',
  'lekker-tikken-medium': 'https://wooting-website.ams3.cdn.digitaloceanspaces.com/products/switches/lekker-tikken/lekker-tikken-single-main.webp',

  // BSUN - Tactile
  'bsun-dustproof-blue': 'https://switchoddities.com/cdn/shop/products/BSUN_2BDustproof_2BBlue_2B1.jpg?v=1676979855',
  'bsun-blue': 'https://switchoddities.com/cdn/shop/products/BSUN_2BBlue_2B1.jpg?v=1676979848',
  'bsun-brown': 'https://switchoddities.com/cdn/shop/products/BSUN_2BBrown_2B1.jpg?v=1676979841',
  'bsun-red': 'https://switchoddities.com/cdn/shop/products/BSUN_2BRed_2B1.jpg?v=1676979827',
  'yok-bsun-smoky-black': 'https://kprepublic.com/cdn/shop/files/YOK-BSun-Smoky-Black-Switch-RGB-SMD-Tactile-Switch-For-Mechanical-keyboard-65g-Transparent-Black-Stem.jpg?v=1686887940',
  'bsun-dragon-fruit-(panda-v2)': 'https://res.cloudinary.com/milktooth/image/upload/v1708480954/switch-photos/Dragon%20Fruit/Dragon_Fruit_1_qkjott.jpg',
  'bsun-x-zuoce-cheese-grape': 'https://www.keebzncables.com/cdn/shop/files/Zuoce_Cheese_Grape_Product_WEB-1.jpg?v=1768547730',
  'bsun-cliff': 'https://res.cloudinary.com/milktooth/image/upload/v1719694868/switch-photos/Cliff/Cliff_1_at52xw.jpg',
  'bsun-sea-fog': 'https://unikeyboards.com/cdn/shop/files/DSC_2573.jpg?v=1727156743',
  'bsun-ocean': 'https://lumekeebs.com/cdn/shop/files/Untitled-2_e2cebb03-27a2-4101-89f1-b6f2ab0c488f.png',
  'bsun-mozzarella-cheese': 'https://divinikey.com/cdn/shop/files/bsun-mozzarella-cheese-tactile-switches-9168049.webp?v=1771072508',
  'bsun-strawberry-cheesecake': 'https://kukey.studio/cdn/shop/files/IMG_0872.webp?v=1725081696',
  'bsun-olive': 'https://mechanicalkeyboards.com/cdn/shop/files/23609-YC8ED-BSUN_OLV.jpg?v=1731534731',
  'bsun-ruben-hornet-tactile': 'https://kprepublic.com/cdn/shop/files/02_de102c98-214a-4107-9e3b-2181d1976e86.jpg?v=1748413933',
  'bsun-crystal-purple': 'https://kprepublic.com/cdn/shop/files/BSun-Crystal-Purple-Switch-RGB-SMD-Tactile-Switch-For-Mechanical-keyboard-38g-65g-Purple-POM-80M.jpg?v=1696925019',
  'bsun-clear': 'https://kprepublic.com/cdn/shop/files/S2d3224746d41407ba317fa71cee24552N.jpg_960x960q75.webp?v=1736233770',
  'bsun-hutt': 'https://mechanicalkeyboards.com/cdn/shop/files/24470-NAEP8-BSUN-Hutt-40g-Tactile-Switch.jpg?v=1740756004',
  'bsun-raw-tactile': 'https://keebsforall.com/cdn/shop/files/bsunraw_45d89c5a-a564-4eed-a66b-9d03e2b9edd8.webp?v=1702575219',
  'bsun-pine': 'https://divinikey.com/cdn/shop/products/bsun-pine-tactile-switches-337790.webp?v=1707582552',
  'bsun-holy-panda-v2': 'https://beaverkeys.ca/cdn/shop/files/resized_2200_x_20240610_0078.png?v=1718071893',
  'bsun-golden-apple': 'https://images.squarespace-cdn.com/content/v1/5e5af256556661723b861bd1/f7379b95-27b2-444d-9ccd-88e8dc4821f3/blwoout.JPG',

  // BSUN - Linear
  'yok-bsun-banana-white': 'https://kprepublic.com/cdn/shop/files/YOK-BSun-Banana-Switch-RGB-SMD-Tactile-Linear-Switch-For-Mechanical-keyboard-56g-MX-Stem-80M.jpg?v=1695872135',
  'yok-bsun-litchi': 'https://kprepublic.com/cdn/shop/files/YOK-BSun-Panda-Switch-RGB-SMD-Linear-Switch-Litchi-Switch-For-Mechanical-keyboard-65g-Milky-Housing.jpg?v=1686555705',
  'yok-bsun-pine-ash': 'https://kprepublic.com/cdn/shop/files/YOK-BSun-Panda-Switch-RGB-SMD-Linear-Switch-Dragon-Fruit-Avocado-Polaris-Pine-Ash-Primitive-White.jpg?v=1686205043',
  'bsun-x-zuoce-sweet-grape-fruit': 'https://www.keebzncables.com/cdn/shop/files/DSC0632.jpg?v=1753430798',
  'bsun-x-zuoce-macaron': 'https://www.keebzncables.com/cdn/shop/files/zuoce-studio-keyboard-switches-macaron-green-bsun-x-zuoce-studio-macaron-linear-switches-58187822498101.jpg?v=1745917172',
  'bsun-x-zuoce-marshmallow': 'https://lumekeebs.com/cdn/shop/files/Untitled-6_3d75f725-3b85-4daf-94dd-ba9284d7b268.png?v=1756334814',
  'bsun-x-zuoce-lavender': 'https://res.cloudinary.com/milktooth/image/upload/v1708892380/switch-photos/Lavender/Lavender_1_rcrvhd.jpg',
  'bsun-rise-tiramisu-45g': 'https://kprepublic.com/cdn/shop/files/Rise-Tiramisu-Switch-Linear-Switch-for-Gaming-Mechanical-Keyboard-35g-40g-45g-5pin-POM-PA-Y3.webp?v=1714028584',
  'bsun-chiikawa-45g': 'https://zkeebs.com/cdn/shop/files/bsun-chiikawa-linear-switches-502.jpg?v=1724',
  'bsun-k1-45g': 'https://lumekeebs.com/cdn/shop/files/1_774ae41f-d585-4d47-b01c-30d816be1f9d.png?v=1739612725',
  'bsun-ragdoll': 'https://res.cloudinary.com/milktooth/image/upload/v1727575143/switch-photos/Ragdoll/Ragdoll_1_goyarq.jpg',
  'bsun-akashi': 'https://lumekeebs.com/cdn/shop/files/1_256ebc30-f7a3-47d5-a07d-0e02eb92e54d.png?v=1745027978',
  'bsun-maple-sugar': 'https://unikeyboards.com/cdn/shop/files/zt00255.jpg?v=1734168114',
  'bsun-ruben-hornet-linear': 'https://kprepublic.com/cdn/shop/files/02_de102c98-214a-4107-9e3b-2181d1976e86.jpg?v=1748413933',
  'bsun-snow-diane': 'https://unikeyboards.com/cdn/shop/files/6_ef9da42c-a541-4e4b-b322-e338d110d7ff.jpg?v=1722822849',
  'bsun-kiki-red': 'https://res.cloudinary.com/milktooth/image/upload/v1708482150/switch-photos/Kiki%20Red/Kiki_Red_1_i02mxt.jpg',
  'bsun-guyu': 'https://divinikey.com/cdn/shop/products/bsun-guyu-linear-switches-652280.webp?v=1686975231',
  'everglide-bsun-sunset-yellow': 'https://kprepublic.com/cdn/shop/files/Everglide-BSun-Sunset-Yellow-Switch-RGB-SMD-Linear-51g-Switches-For-Mechanical-keyboard-MX-Stem-5pin.jpg?v=1693623001',
  'bsun-rise-dream-42g': 'https://keybumps.com/img/switch/bsun-rise-dream.jpg',
  'bsun-buzz-42g': 'https://kprepublic.com/cdn/shop/files/BSun-Buzz-Switch-RGB-SMD-Linear-Switch-For-Gaming-Mechanical-keyboard-37g-42g-POM-LY-Long.webp?v=1721717010',
  'bsun-pop': 'https://kprepublic.com/cdn/shop/files/BSun-POP-Switch-RGB-SMD-Pre-Advanced-Tactile-Switch-For-Mechanical-keyboard-50g-Modified-LY-Stem.jpg?v=1690360129',
  'bsun-jade-rosales': 'https://mechanicalkeyboards.com/cdn/shop/files/24471-GGW4D-BSUN-Jade-Rosales-45g-Linear-Switch.jpg?v=1740757265',
  'bsun-dragon-42g': 'https://mechanicalkeyboards.com/cdn/shop/files/24107-WX183-BSUN-Dragon-Linear-PCB-Mount-Switch.jpg?v=1738182004',
  'bsun-bubble-v2': 'https://mech.land/cdn/shop/files/bubble-v2.jpg?v=1707983058',
  'bsun-bubble': 'https://mechanicalkeyboards.com/cdn/shop/files/23611-FF9YJ-BSUN_BBL.jpg?v=1731534785',
  'bsun-light-sakura-silent': 'https://mechanicalkeyboards.com/cdn/shop/files/23608-YJXYT-BSUN-Sakura-37g-Linear-PCB-Mount.jpg?v=1731534724',
  'bsun-bunny-(tuzi)': 'https://res.cloudinary.com/milktooth/image/upload/v1708892861/switch-photos/Tuzi%20%28Bunny%29/Tuzi_1_rwppno.jpg',
  'bsun-milk-tea-siam-v2': 'https://switchoddities.com/cdn/shop/files/MilkTea21.jpg?v=1723254978',
  'bsun-milk-tea-siam': 'https://dangkeebs.com/cdn/shop/files/BsunMilkTeaSiam.jpg?v=1692813807',
  'bsun-milk-dragon': 'https://lumekeebs.com/cdn/shop/files/1_611e0a56-d07f-46d5-a6c1-79d3017fd8c3.png?v=1747769505',
  'bsun-dusty-rose': 'https://lumekeebs.com/cdn/shop/files/1_f384eca3-63b6-4218-b13f-05aca4588a4d.png?v=1743555117',
  'bsun-raw-linear-60g': 'https://divinikey.com/cdn/shop/files/bsun-raw-linear-switches-166008.webp?v=1733977938',
  'bsun-tai-chi': 'https://divinikey.com/cdn/shop/files/bsun-tai-chi-linear-switches-663843.webp?v=1715378485',
  'bsun-aniya-r2-45g': 'https://chosfox.com/cdn/shop/files/1_89702e94-873d-4e29-ad63-aca047e5b836.png?v=1711605480',
  'bsun-agarwood': 'https://images.squarespace-cdn.com/content/v1/5e5af256556661723b861bd1/a918dd8e-632b-4bff-b4c7-2dfe2bc49e6a/blowout.JPG',
  'bsun-flower-shadow-v2': 'https://res.cloudinary.com/kineticlabs/image/upload/q_auto/c_fit,w_1300/f_auto/v1/api-images/products/flower-shadow-switches/v2/DSC05265_monghu',
  'bsun-x-v1': 'https://assets.bigcartel.com/product_images/380073054/1_bf5b4277-150a-4366-9eef-fe7012007137.webp?auto=format&fit=max&h=1200&w=1200',
};

// Variants that share the same image (slug → source slug)
const COPIES = {
  'bsun-rise-tiramisu-40g': 'bsun-rise-tiramisu-45g',
  'bsun-rise-tiramisu-35g': 'bsun-rise-tiramisu-45g',
  'bsun-chiikawa-37g': 'bsun-chiikawa-45g',
  'bsun-chiikawa-28g': 'bsun-chiikawa-45g',
  'bsun-dragon-33g': 'bsun-dragon-42g',
  'bsun-raw-linear-50g': 'bsun-raw-linear-60g',
  'bsun-raw-linear-40g': 'bsun-raw-linear-60g',
  'bsun-aniya-r2-28g': 'bsun-aniya-r2-45g',
  'bsun-buzz-37g': 'bsun-buzz-42g',
  'bsun-k1-37g': 'bsun-k1-45g',
  'yok-bsun-avocado': 'yok-bsun-pine-ash',
  'yok-bsun-polaris': 'yok-bsun-pine-ash',
  'yok-bsun-banana-black': 'yok-bsun-banana-white',
  'bsun-rise-dream-37g': 'bsun-rise-dream-42g',
};

async function downloadAndConvert(slug, url) {
  const dest = resolve(OUT_DIR, `${slug}.webp`);
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const outBuf = await sharp(buf)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 90 })
      .toBuffer();
    writeFileSync(dest, outBuf);
    return true;
  } catch (e) {
    console.error(`FAIL: ${slug} - ${e.message}`);
    return false;
  }
}

async function main() {
  const entries = Object.entries(IMAGES);
  console.log(`Downloading ${entries.length} images...`);

  let ok = 0, fail = 0;
  // Process in batches of 10
  for (let i = 0; i < entries.length; i += 10) {
    const batch = entries.slice(i, i + 10);
    const results = await Promise.all(
      batch.map(([slug, url]) => downloadAndConvert(slug, url))
    );
    results.forEach(r => r ? ok++ : fail++);
    process.stdout.write(`  ${ok + fail}/${entries.length}\r`);
  }

  console.log(`\nDownloaded: ${ok} OK, ${fail} failed`);

  // Copy variants
  let copied = 0;
  for (const [dest, src] of Object.entries(COPIES)) {
    const srcPath = resolve(OUT_DIR, `${src}.webp`);
    const destPath = resolve(OUT_DIR, `${dest}.webp`);
    if (existsSync(srcPath)) {
      copyFileSync(srcPath, destPath);
      copied++;
    } else {
      console.error(`COPY FAIL: ${dest} (source ${src} missing)`);
    }
  }
  console.log(`Copied: ${copied} variants`);
  console.log(`Total: ${ok + copied} images in ${OUT_DIR}`);
}

main().catch(console.error);
