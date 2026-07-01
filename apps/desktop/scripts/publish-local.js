import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const desktopDir = path.resolve(__dirname, '..');
const websiteDir = path.resolve(desktopDir, '../website');
const releaseDir = path.join(desktopDir, 'release');
const downloadDir = path.join(websiteDir, 'download');

const macDir = path.join(downloadDir, 'mac');
const winDir = path.join(downloadDir, 'windows');
const linuxDir = path.join(downloadDir, 'linux');

// Ensure download directories exist
[macDir, winDir, linuxDir].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Read version
const pkgPath = path.join(desktopDir, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const version = pkg.version;

console.log(`Publishing local version: ${version}...`);

// Cleanup old files
const clearDir = (dir) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        fs.unlinkSync(path.join(dir, file));
    }
};

clearDir(macDir);
clearDir(winDir);
clearDir(linuxDir);

// Define copy mappings
const filesToCopy = [
    { ext: '.dmg', destDir: macDir, destName: `DevDock-${version}.dmg` },
    { ext: 'Setup ' + version + '.exe', destDir: winDir, destName: `DevDock-${version}.exe` },
    { ext: '.AppImage', destDir: linuxDir, destName: `DevDock-${version}.AppImage` },
    { ext: '.deb', destDir: linuxDir, destName: `DevDock-${version}.deb` }
];

let copiedFiles = {
    mac: '',
    win: '',
    appImage: '',
    deb: ''
};

// Find and copy files
if (fs.existsSync(releaseDir)) {
    const releasedFiles = fs.readdirSync(releaseDir);
    
    filesToCopy.forEach(mapping => {
        const file = releasedFiles.find(f => f.endsWith(mapping.ext));
        if (file) {
            const src = path.join(releaseDir, file);
            const dest = path.join(mapping.destDir, mapping.destName);
            fs.copyFileSync(src, dest);
            console.log(`Copied: ${file} -> ${mapping.destName}`);
            
            if (mapping.ext.includes('.dmg')) copiedFiles.mac = `./download/mac/${mapping.destName}`;
            if (mapping.ext.includes('.exe')) copiedFiles.win = `./download/windows/${mapping.destName}`;
            if (mapping.ext.includes('.AppImage')) copiedFiles.appImage = `./download/linux/${mapping.destName}`;
            if (mapping.ext.includes('.deb')) copiedFiles.deb = `./download/linux/${mapping.destName}`;
        }
    });
} else {
    console.error("Release directory not found! Run the package command first.");
}

// Update index.html
const htmlPath = path.join(websiteDir, 'index.html');
if (fs.existsSync(htmlPath)) {
    let htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    // Regex to replace the specific local fallback variables
    htmlContent = htmlContent.replace(/const localVersion = '.*?';/, `const localVersion = 'v${version}';`);
    
    if (copiedFiles.mac) {
        htmlContent = htmlContent.replace(/const localMac = '.*?';/, `const localMac = '${copiedFiles.mac}';`);
    }
    if (copiedFiles.win) {
        htmlContent = htmlContent.replace(/const localWin = '.*?';/, `const localWin = '${copiedFiles.win}';`);
    }
    if (copiedFiles.appImage) {
        htmlContent = htmlContent.replace(/const localLinuxAppImage = '.*?';/, `const localLinuxAppImage = '${copiedFiles.appImage}';`);
    }
    if (copiedFiles.deb) {
        htmlContent = htmlContent.replace(/const localLinuxDeb = '.*?';/, `const localLinuxDeb = '${copiedFiles.deb}';`);
    }

    fs.writeFileSync(htmlPath, htmlContent, 'utf8');
    console.log("Updated website index.html with new local download paths and version.");
}

// Auto-delete release directory to save space
if (fs.existsSync(releaseDir)) {
    fs.rmSync(releaseDir, { recursive: true, force: true });
    console.log("Cleaned up temporary release directory to save disk space.");
}

console.log("Local publish complete!");
