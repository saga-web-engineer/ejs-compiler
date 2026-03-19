import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compile } from 'ejs-compiler';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  console.log('=== Compile to Memory Example ===\n');

  // Compile without writing to disk (no outDir specified)
  const results = await compile('index.ejs', {
    baseDir: join(__dirname, 'templates/pages'),
    data: {
      title: 'In-Memory Compilation',
      heading: 'Hello from Memory!',
      description: 'This content exists only in memory.',
    },
  });

  console.log('✅ Compiled in memory (no files written)\n');

  for (const result of results) {
    console.log(`📄 Source: ${result.source}`);
    console.log(`📦 Output: ${result.output || 'N/A (memory only)'}`);
    console.log('\n📝 Full content:\n');
    console.log(result.content);
  }
}

main().catch(console.error);
