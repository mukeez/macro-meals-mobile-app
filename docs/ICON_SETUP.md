# Icon Setup for iOS Flavors

This document explains how the dynamic icon system works for different iOS environments.

## Overview

The app uses different icons for different environments to help developers and testers identify which version they're running:

- **Development**: Uses `icon-dev.png` (smaller, distinctive icon)
- **Staging**: Uses `icon-dev.png` (same as development for easy identification)
- **Production**: Uses `icon.png` (official app icon)

## File Structure

```
assets/
├── icon.png                    # Production icon (original)
├── icon-dev.png               # Development/Staging icon
├── adaptive-icon.png          # Production adaptive icon
├── adaptive-icon/foreground.png # Source for dev/stg adaptive icon
└── icons/
    ├── dev/
    │   ├── icon.png           # Copy of icon-dev.png
    │   └── adaptive-icon.png  # Copy of adaptive-icon/foreground.png
    ├── stg/
    │   ├── icon.png           # Copy of icon-dev.png
    │   └── adaptive-icon.png  # Copy of adaptive-icon/foreground.png
    └── prod/
        ├── icon.png           # Copy of icon.png
        └── adaptive-icon.png  # Copy of adaptive-icon.png
```

## How It Works

1. **Before building**: The `scripts/copy-icons.js` script runs
2. **Environment detection**: Script reads `NODE_ENV` environment variable
3. **Icon copying**: Copies appropriate icons from environment folder to main assets folder
4. **Build process**: Expo uses the copied icons for the build

## Script Execution

The icon copy script runs automatically before each iOS build:

```bash
# Development
yarn ios:dev
# Runs: node scripts/copy-icons.js && expo run:ios --scheme macromeals-dev

# Staging
yarn ios:stg
# Runs: node scripts/copy-icons.js && expo run:ios --scheme macromeals-stg

# Production
yarn ios:prod
# Runs: node scripts/copy-icons.js && expo run:ios --scheme macromeals-prod
```

## Manual Icon Copy

You can manually copy icons for testing:

```bash
# Copy development icons
NODE_ENV=development node scripts/copy-icons.js

# Copy staging icons
NODE_ENV=staging node scripts/copy-icons.js

# Copy production icons
NODE_ENV=production node scripts/copy-icons.js
```

## Adding New Icons

To add new icons for different environments:

1. **Add your icon** to the appropriate environment folder:
   ```
   assets/icons/dev/icon.png
   assets/icons/stg/icon.png
   assets/icons/prod/icon.png
   ```

2. **Update the script** if you add new icon types:
   ```javascript
   // In scripts/copy-icons.js
   const filesToCopy = [
     { source: 'icon.png', target: 'icon.png' },
     { source: 'adaptive-icon.png', target: 'adaptive-icon.png' },
     { source: 'new-icon.png', target: 'new-icon.png' } // Add new icons here
   ];
   ```

## Troubleshooting

### Icons not updating
- **Clean build**: `expo run:ios --clear`
- **Check script**: Run `node scripts/copy-icons.js` manually
- **Verify environment**: Check `NODE_ENV` is set correctly

### Wrong icon showing
- **Check file sizes**: Different environments should have different file sizes
- **Verify copy**: Check that icons were copied to main assets folder
- **Rebuild**: Clean and rebuild the app

### Script errors
- **Check paths**: Ensure icon folders exist
- **Check permissions**: Ensure script has read/write access
- **Check Node.js**: Ensure Node.js is installed and accessible

## Environment Detection

The app logs the current environment and expected icon:

```typescript
console.log('🔍 Current environment:', Config.ENVIRONMENT);
console.log('🎨 App icon should be:', Config.ENVIRONMENT === 'development' ? 'dev' : Config.ENVIRONMENT === 'staging' ? 'stg' : 'prod');
```

This helps verify that the correct environment and icon are being used. 