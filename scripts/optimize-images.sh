#!/bin/bash

# Check if pngquant is installed
if ! command -v pngquant &> /dev/null; then
    echo "pngquant is not installed. Installing..."
    brew install pngquant
fi

# Directory containing PNG files
ASSETS_DIR="assets"

# Find all PNG files and optimize them
find $ASSETS_DIR -name "*.png" -print0 | while IFS= read -r -d '' file; do
    echo "Optimizing: $file"
    pngquant --force --quality=65-80 --skip-if-larger --strip --verbose "$file" --output "${file%.png}-optimized.png"
    if [ -f "${file%.png}-optimized.png" ]; then
        mv "${file%.png}-optimized.png" "$file"
    fi
done

echo "Image optimization complete!" 