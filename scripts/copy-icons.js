const fs = require('fs');
const path = require('path');

const environment = process.env.NODE_ENV || 'development';

const iconSourceMap = {
  development: 'assets/icons/dev',
  staging: 'assets/icons/stg',
  production: 'assets/icons/prod'
};

const sourceDir = iconSourceMap[environment];

if (!sourceDir) {
  console.error(`❌ Unknown environment: ${environment}`);
  process.exit(1);
}

if (!fs.existsSync(sourceDir)) {
  console.error(`❌ Icon source directory not found: ${sourceDir}`);
  process.exit(1);
}

const targetDir = 'assets';

// Files to copy
const filesToCopy = [
  { source: 'icon.png', target: 'icon.png' },
  { source: 'adaptive-icon.png', target: 'adaptive-icon.png' }
];

console.log(`🔄 Copying ${environment} icons...`);

try {
  filesToCopy.forEach(({ source, target }) => {
    const sourcePath = path.join(sourceDir, source);
    const targetPath = path.join(targetDir, target);
    
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`✅ Copied ${source} → ${target}`);
    } else {
      console.warn(`⚠️  Source file not found: ${sourcePath}`);
    }
  });
  
  console.log(`🎉 Successfully copied ${environment} icons!`);
} catch (error) {
  console.error(`❌ Error copying icons:`, error.message);
  process.exit(1);
} 