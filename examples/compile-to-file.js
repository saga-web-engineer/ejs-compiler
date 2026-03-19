import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compile, loadOptionsData } from 'ejs-compiler';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  console.log('=== EJS Compiler Library Usage Example ===\n');

  // Load data from JSON file
  const dataPath = join(__dirname, 'data.json');
  const data = await loadOptionsData(dataPath);

  console.log('📋 Loaded data:', data);
  console.log();

  // Compile templates
  const results = await compile('**/[!_]*.ejs', {
    baseDir: join(__dirname, 'templates/pages'),
    outDir: join(__dirname, 'dist'),
    data,
    exclude: ['about.ejs'], // Exclude about.ejs as an example
  });

  console.log(`✅ Compiled ${results.length} file(s):\n`);

  for (const result of results) {
    console.log(`📄 Source: ${result.source}`);
    console.log(`📦 Output: ${result.output}`);
    console.log(`📝 Preview: ${result.content.slice(0, 100)}...`);
    console.log();
  }
}

main().catch(console.error);
