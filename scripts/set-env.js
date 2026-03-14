const fs = require('fs');
const path = require('path');

const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'RAWG_API_KEY'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const content = `export const environment = {
  production: true,
  supabase: {
    url: '${process.env.SUPABASE_URL}',
    anonKey: '${process.env.SUPABASE_ANON_KEY}'
  },
  rawg: {
    apiUrl: 'https://api.rawg.io/api',
    apiKey: '${process.env.RAWG_API_KEY}'
  }
};
`;

const outputPath = path.join(__dirname, '..', 'src', 'environments', 'environment.prod.ts');
fs.writeFileSync(outputPath, content);
console.log(`environment.prod.ts generated at ${outputPath}`);
