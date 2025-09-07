import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('🚀 Building PrivateVOD Automation Chrome Extension...\n');

try {
  // Clean previous builds
  console.log('🧹 Cleaning previous builds...');
  if (fs.existsSync(path.join(projectRoot, 'dist'))) {
    fs.rmSync(path.join(projectRoot, 'dist'), { recursive: true });
  }
  if (fs.existsSync(path.join(projectRoot, 'packages'))) {
    fs.rmSync(path.join(projectRoot, 'packages'), { recursive: true });
  }

  // Run webpack build
  console.log('📦 Running webpack build...');
  execSync('npm run build', { 
    cwd: projectRoot, 
    stdio: 'inherit' 
  });

  // Create packages directory
  console.log('📁 Creating packages directory...');
  fs.mkdirSync(path.join(projectRoot, 'packages'), { recursive: true });

  // Create zip package directly from dist
  console.log('📦 Creating extension package...');
  const packageName = `privatevod-automation-${new Date().toISOString().split('T')[0]}.zip`;
  const packagePath = path.join(projectRoot, 'packages', packageName);
  
  // Create zip directly from dist directory
  try {
    execSync(`cd dist && zip -r "${packagePath}" .`, { stdio: 'inherit' });
    console.log(`✅ Extension package created: ${packageName}`);
  } catch (error) {
    console.error('❌ Failed to create zip package:', error.message);
    throw error;
  }
  
  // Clean up dist directory after zip creation
  console.log('🧹 Cleaning up dist directory...');
  fs.rmSync(path.join(projectRoot, 'dist'), { recursive: true });
  console.log('✅ Dist directory cleaned up');

  // Verify build
  console.log('\n🔍 Verifying build...');
  const packageExists = fs.existsSync(packagePath);
  if (packageExists) {
    const stats = fs.statSync(packagePath);
    console.log(`✅ Package created: ${packageName}`);
    console.log(`✅ Package size: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`✅ Package location: packages/${packageName}`);
  } else {
    console.log('⚠️  Package verification failed');
  }

  console.log('\n🎉 Build completed successfully!');
  console.log('📦 Extension package created: packages/' + packageName);
  console.log('\nTo load in Chrome:');
  console.log('1. Extract the zip file to a folder');
  console.log('2. Open chrome://extensions/');
  console.log('3. Enable "Developer mode"');
  console.log('4. Click "Load unpacked"');
  console.log('5. Select the extracted folder');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
