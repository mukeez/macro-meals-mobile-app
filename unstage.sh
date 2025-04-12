#!/bin/bash

# Unstage the specified Android files
git restore --staged android/app/debug.keystore
git restore --staged android/app/proguard-rules.pro
git restore --staged android/app/src/debug/AndroidManifest.xml
git restore --staged android/app/src/main/AndroidManifest.xml
git restore --staged android/app/src/main/java/com/anonymous/macromeals/MainActivity.kt
git restore --staged android/app/src/main/java/com/anonymous/macromeals/MainApplication.kt

# Unstage drawable resources
git restore --staged android/app/src/main/res/drawable-hdpi/splashscreen_logo.png
git restore --staged android/app/src/main/res/drawable-mdpi/splashscreen_logo.png
git restore --staged android/app/src/main/res/drawable-xhdpi/splashscreen_logo.png
git restore --staged android/app/src/main/res/drawable-xxhdpi/splashscreen_logo.png
git restore --staged android/app/src/main/res/drawable-xxxhdpi/splashscreen_logo.png
git restore --staged android/app/src/main/res/drawable/ic_launcher_background.xml
git restore --staged android/app/src/main/res/drawable/rn_edit_text_material.xml

# Unstage launcher XML files
git restore --staged android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml
git restore --staged android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml

# Unstage hdpi resources
git restore --staged android/app/src/main/res/mipmap-hdpi/ic_launcher.webp
git restore --staged android/app/src/main/res/mipmap-hdpi/ic_launcher_foreground.webp
git restore --staged android/app/src/main/res/mipmap-hdpi/ic_launcher_round.webp

# Unstage mdpi resources
git restore --staged android/app/src/main/res/mipmap-mdpi/ic_launcher.webp
git restore --staged android/app/src/main/res/mipmap-mdpi/ic_launcher_foreground.webp
git restore --staged android/app/src/main/res/mipmap-mdpi/ic_launcher_round.webp

# Unstage xhdpi resources
git restore --staged android/app/src/main/res/mipmap-xhdpi/ic_launcher.webp
git restore --staged android/app/src/main/res/mipmap-xhdpi/ic_launcher_foreground.webp
git restore --staged android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.webp

# Unstage xxhdpi resources
git restore --staged android/app/src/main/res/mipmap-xxhdpi/ic_launcher.webp
git restore --staged android/app/src/main/res/mipmap-xxhdpi/ic_launcher_foreground.webp
git restore --staged android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.webp

# Unstage xxxhdpi resources
git restore --staged android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.webp
git restore --staged android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.webp
git restore --staged android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.webp

echo "All specified Android files have been unstaged."