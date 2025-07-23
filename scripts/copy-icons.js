const fs = require('fs');
const path = require('path');

// Get environment from EAS build or default to production
const environment = process.env.ENV || 'production';

console.log(`🎨 Setting up icons for ${environment} environment...`);

// Map of environment to icon files
const iconMap = {
  development: 'assets/icon-dev.png',
  staging: 'assets/icon-dev.png',
  production: 'assets/icon.png'
};

// Source icon for current environment
const sourceIcon = iconMap[environment];
const targetIcon = 'assets/icon.png';

// Check if source icon exists
if (fs.existsSync(sourceIcon)) {
  // Copy the environment-specific icon to the main icon location
  fs.copyFileSync(sourceIcon, targetIcon);
  console.log(`✅ Successfully copied ${sourceIcon} to ${targetIcon} for ${environment} environment`);
} else {
  console.log(`⚠️  Warning: Icon not found at ${sourceIcon}`);
  console.log(`📁 Available icons: ${Object.values(iconMap).join(', ')}`);
  
  // If environment-specific icon doesn't exist, check if default icon exists
  if (fs.existsSync('assets/icon.png')) {
    console.log(`✅ Using default icon: assets/icon.png`);
  } else {
    console.log(`❌ Error: No icon found. Please create an icon at assets/icon.png`);
    process.exit(1);
  }
}

console.log(`🎯 Icon setup complete for ${environment} environment`); 