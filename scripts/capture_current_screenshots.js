const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT_DIR = path.resolve(__dirname, '../docs/screenshots/current');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log('Starting backend server on port 3001...');
  const server = spawn('node', ['server/dist/index.js'], {
    env: { ...process.env, PORT: '3001', NODE_ENV: 'production' },
    stdio: 'ignore',
  });

  console.log('Starting client preview on port 5173...');
  const client = spawn('npx', ['vite', 'preview', '--port', '5173', '--strictPort'], {
    cwd: path.resolve(__dirname, '../client'),
    stdio: 'ignore',
  });

  // Wait 4 seconds for servers to start
  await sleep(4000);

  const pages = [
    { name: '01_overview', url: 'http://localhost:5173/' },
    { name: '02_market_trends', url: 'http://localhost:5173/market-trends' },
    { name: '03_forecasting', url: 'http://localhost:5173/forecasting' },
    { name: '04_neighborhood_intel', url: 'http://localhost:5173/neighborhood' },
    { name: '05_neighborhood_compare', url: 'http://localhost:5173/neighborhood/compare' },
    { name: '06_transformation', url: 'http://localhost:5173/transformation' },
    { name: '07_affordability', url: 'http://localhost:5173/affordability' },
    { name: '08_data_sources', url: 'http://localhost:5173/data-sources' },
    { name: '09_methodology', url: 'http://localhost:5173/methodology' },
  ];

  for (const page of pages) {
    const outFile = path.join(OUT_DIR, `${page.name}.png`);
    console.log(`Capturing ${page.name} (${page.url}) -> ${outFile}...`);
    try {
      execSync(
        `"${CHROME_PATH}" --headless=new --user-data-dir=/tmp/chrome-headless-profile --no-sandbox --disable-gpu --virtual-time-budget=5000 --window-size=1440,900 --screenshot="${outFile}" "${page.url}"`,
        { timeout: 15000 }
      );
      console.log(`✓ Saved ${page.name}.png`);
    } catch (err) {
      console.error(`Failed to capture ${page.name}:`, err.message);
    }
  }

  console.log('Cleaning up servers...');
  server.kill('SIGTERM');
  client.kill('SIGTERM');
  console.log('Done.');
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
