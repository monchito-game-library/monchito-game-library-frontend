const fs = require('fs');
const path = require('path');

const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'RAWG_API_KEY'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const sentryDsn = process.env.SENTRY_DSN || 'https://346eebf4b4c5378fa15fa4cd7617006b@o4511262696079360.ingest.de.sentry.io/4511262726357072';

const prodContent = `export const environment = {
  production: true,
  supabase: {
    url: '${process.env.SUPABASE_URL}',
    anonKey: '${process.env.SUPABASE_ANON_KEY}'
  },
  rawg: {
    apiUrl: 'https://api.rawg.io/api',
    apiKey: '${process.env.RAWG_API_KEY}'
  },
  sentry: {
    dsn: '${sentryDsn}',
    enabled: ${!!sentryDsn}
  }
};
`;

const devContent = `export const environment = {
  production: false,
  supabase: {
    url: '${process.env.SUPABASE_URL}',
    anonKey: '${process.env.SUPABASE_ANON_KEY}'
  },
  rawg: {
    apiUrl: 'https://api.rawg.io/api',
    apiKey: '${process.env.RAWG_API_KEY}'
  },
  sentry: {
    dsn: '',
    enabled: false
  }
};
`;

const envDir = path.join(__dirname, '..', 'src', 'environments');

fs.writeFileSync(path.join(envDir, 'environment.prod.ts'), prodContent);
console.log('environment.prod.ts generated');

fs.writeFileSync(path.join(envDir, 'environment.ts'), devContent);
console.log('environment.ts generated');
