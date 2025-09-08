#!/bin/bash

echo "🚀 Building PrivateVOD Automation Chrome Extension..."
echo ""

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf packages/
rm -rf build/

# Create packages directory
echo "📁 Creating packages directory..."
mkdir -p packages

# Create build directory and copy src files
echo "📦 Copying source files..."
mkdir -p build
cp -r src/* build/

# Create zip package
echo "📦 Creating extension package..."
PACKAGE_NAME="privatevod-automation-$(date +%Y-%m-%d).zip"
cd build && zip -r "../packages/$PACKAGE_NAME" . && cd ..

# Clean up build directory
echo "🧹 Cleaning up build directory..."
rm -rf build/

# Verify build
echo ""
echo "🔍 Verifying build..."
if [ -f "packages/$PACKAGE_NAME" ]; then
    PACKAGE_SIZE=$(du -h "packages/$PACKAGE_NAME" | cut -f1)
    echo "✅ Package created: $PACKAGE_NAME"
    echo "✅ Package size: $PACKAGE_SIZE"
    echo "✅ Package location: packages/$PACKAGE_NAME"
else
    echo "⚠️  Package verification failed"
fi

echo ""
echo "🎉 Build completed successfully!"
echo "📦 Extension package created: packages/$PACKAGE_NAME"
echo ""
echo "To load in Chrome:"
echo "1. Extract the zip file to a folder"
echo "2. Open chrome://extensions/"
echo "3. Enable \"Developer mode\""
echo "4. Click \"Load unpacked\""
echo "5. Select the extracted folder"
