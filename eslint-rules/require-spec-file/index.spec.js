'use strict';

const { RuleTester } = require('eslint');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const rule = require('./index.js');

const tester = new RuleTester({
  languageOptions: {
    parser: require('@typescript-eslint/parser'),
    parserOptions: { ecmaVersion: 2022, sourceType: 'module' }
  }
});

// Build a fresh tmp scaffold so the rule's fs.existsSync check has predictable results.
const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'require-spec-file-'));
const appDir = path.join(tmpRoot, 'src', 'app');
fs.mkdirSync(appDir, { recursive: true });

function makeFile(relPath) {
  const absPath = path.join(appDir, relPath);
  fs.mkdirSync(path.dirname(absPath), { recursive: true });
  fs.writeFileSync(absPath, '');
  return absPath;
}

const componentWithSpec = makeFile('a.component.ts');
makeFile('a.component.spec.ts');
const componentWithoutSpec = makeFile('b.component.ts');
const serviceWithoutSpec = makeFile('foo.service.ts');
const dtoFile = makeFile('foo.dto.ts');
const interfaceFile = makeFile('foo.interface.ts');
const modelFile = makeFile('foo.model.ts');
const providerFile = makeFile('foo.provider.ts');
const routesFile = makeFile('foo.routes.ts');
const moduleFile = makeFile('foo.module.ts');
const indexFile = makeFile('index.ts');
const mockFile = makeFile('helpers/foo-mock.ts');
const helpersFile = makeFile('helpers/auth-spec.helpers.ts');
const translocoLoader = makeFile('transloco-loader.ts');

// Files OUTSIDE src/app should be ignored entirely (e.g. src/main.ts).
const outsidePath = path.join(tmpRoot, 'src', 'main.ts');
fs.mkdirSync(path.dirname(outsidePath), { recursive: true });
fs.writeFileSync(outsidePath, '');

tester.run('require-spec-file', rule, {
  valid: [
    { code: '', filename: componentWithSpec },
    { code: '', filename: dtoFile },
    { code: '', filename: interfaceFile },
    { code: '', filename: modelFile },
    { code: '', filename: providerFile },
    { code: '', filename: routesFile },
    { code: '', filename: moduleFile },
    { code: '', filename: indexFile },
    { code: '', filename: mockFile },
    { code: '', filename: helpersFile },
    { code: '', filename: translocoLoader },
    { code: '', filename: outsidePath }
  ],
  invalid: [
    {
      code: '',
      filename: componentWithoutSpec,
      errors: [{ messageId: 'missingSpec' }]
    },
    {
      code: '',
      filename: serviceWithoutSpec,
      errors: [{ messageId: 'missingSpec' }]
    }
  ]
});
