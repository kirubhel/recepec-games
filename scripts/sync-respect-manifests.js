const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const UNITS_DIR = path.join(PUBLIC_DIR, 'units');
const NEXT_DIR = path.join(__dirname, '..', '.next');

// Base URL prefix for the app
const BASE_PATH = '/respect-minimal-games';

/**
 * Scans .next directory to find all static chunks
 */
function findNextStaticAssets() {
  const assets = [];
  const staticDirs = [
    path.join(NEXT_DIR, 'static'),
    path.join(NEXT_DIR, 'dev', 'static') // Handle dev mode too
  ];

  staticDirs.forEach(staticDir => {
    if (!fs.existsSync(staticDir)) return;

    function walk(dir) {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
          walk(filePath);
        } else {
          // Convert system path to URL path
          const relativePath = path.relative(path.join(staticDir, '..', '..'), filePath);
          const urlPath = '/' + relativePath.split(path.sep).join('/');
          // Add prefix
          assets.push(BASE_PATH + urlPath);
        }
      });
    }
    
    walk(staticDir);
  });

  return assets;
}

const NEXT_ASSETS = findNextStaticAssets();
console.log(`Found ${NEXT_ASSETS.length} Next.js static assets.`);

// Patterns for static assets that should always be cached
const STATIC_ASSETS = [
  `${BASE_PATH}/logo.png`,
  `${BASE_PATH}/favicon.ico`,
  `${BASE_PATH}/background.png`,
  `${BASE_PATH}/sw.js`,
  ...NEXT_ASSETS
];

function getUnitManifests() {
  if (!fs.existsSync(UNITS_DIR)) return [];
  return fs.readdirSync(UNITS_DIR)
    .map(dir => path.join(UNITS_DIR, dir, 'manifest.json'))
    .filter(file => fs.existsSync(file));
}

function updateManifest(manifestPath) {
  console.log(`Updating ${manifestPath}...`);
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  
  // Ensure resources array exists
  if (!manifest.resources) {
    manifest.resources = [];
  }

  // Add assets if not already there
  STATIC_ASSETS.forEach(asset => {
    if (!manifest.resources.find(r => r.href === asset)) {
      const ext = path.extname(asset).toLowerCase();
      const type = ext === '.png' ? 'image/png' : 
                   ext === '.ico' ? 'image/x-icon' : 
                   ext === '.js' ? 'application/javascript' :
                   ext === '.css' ? 'text/css' : 'application/octet-stream';
      manifest.resources.push({ href: asset, type });
    }
  });

  // Also ensure images from metadata are in resources
  if (manifest.images) {
    manifest.images.forEach(img => {
      if (!manifest.resources.find(r => r.href === img.href)) {
        manifest.resources.push({ href: img.href, type: img.type });
      }
    });
  }

  // Ensure unique resources
  manifest.resources = Array.from(new Set(manifest.resources.map(r => r.href)))
    .map(href => manifest.resources.find(r => r.href === href));

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
}

const manifests = getUnitManifests();
manifests.forEach(updateManifest);

const mainManifestPath = path.join(PUBLIC_DIR, 'RESPECT_MANIFEST.json');
if (fs.existsSync(mainManifestPath)) {
  updateManifest(mainManifestPath);
}

// Special case: include the API data URLs for each unit
function addApiDataResources() {
  const manifests = getUnitManifests();
  manifests.forEach(manifestPath => {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const acquisitionLink = manifest.links?.find(l => l.rel === 'http://opds-spec.org/acquisition');
    
    if (acquisitionLink) {
      // Extract game ID from URL
      const gameId = acquisitionLink.href.split('/').pop();
      if (gameId) {
        const apiUrl = `https://learningcloud.et/api/respect/gamesdata/${gameId}`;
        console.log(`Adding API resource for game ${gameId}...`);
        
        if (!manifest.resources) manifest.resources = [];
        if (!manifest.resources.find(r => r.href === apiUrl)) {
          manifest.resources.push({ href: apiUrl, type: 'application/json' });
          fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
        }
      }
    }
  });
}

addApiDataResources();

console.log('Done! All manifests updated with a complete resource list for offline pinning.');
