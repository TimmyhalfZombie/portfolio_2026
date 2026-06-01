import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const directoryPath = path.join(process.cwd(), 'public', 'stickers');

async function processImages() {
  const files = fs.readdirSync(directoryPath);
  
  for (const file of files) {
    if (file.endsWith('.png')) {
      const filePath = path.join(directoryPath, file);
      const newFileName = file.replace('.png', '.webp');
      const newFilePath = path.join(directoryPath, newFileName);
      
      console.log(`Converting ${file} to WebP...`);
      
      try {
        await sharp(filePath)
          .webp({ quality: 80, effort: 6 })
          .toFile(newFilePath);
          
        // Delete original PNG
        fs.unlinkSync(filePath);
        console.log(`Successfully converted ${file}`);
      } catch (err) {
        console.error(`Error processing ${file}:`, err);
      }
    }
  }
}

processImages();
