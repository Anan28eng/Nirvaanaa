const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const toIco = require('to-ico');

async function generateFavicon() {
  try {
    const publicDir = path.join(__dirname, '..', 'public');
    const svgPath = path.join(publicDir, 'favicon.svg');
    const icoPath = path.join(publicDir, 'favicon.ico');

    console.log('Generating favicon.ico from SVG...');

    // Check if SVG exists
    if (!fs.existsSync(svgPath)) {
      console.error('Error: favicon.svg not found at', svgPath);
      return;
    }

    // Convert SVG to PNG at multiple sizes for ICO
    const sizes = [16, 32, 48];
    const pngBuffers = [];

    for (const size of sizes) {
      const pngBuffer = await sharp(svgPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 245, g: 241, b: 235, alpha: 1 } // #f5f1eb
        })
        .png()
        .toBuffer();
      
      pngBuffers.push(pngBuffer);
      console.log(`Generated ${size}x${size} PNG`);
    }

    // Convert PNGs to ICO
    const icoBuffer = await toIco(pngBuffers);
    
    // Write ICO file
    fs.writeFileSync(icoPath, icoBuffer);
    console.log('✓ Successfully created favicon.ico at', icoPath);
    
  } catch (error) {
    console.error('Error generating favicon:', error);
    process.exit(1);
  }
}

generateFavicon();
