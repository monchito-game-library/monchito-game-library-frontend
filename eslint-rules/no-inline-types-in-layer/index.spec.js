'use strict';

const { RuleTester } = require('eslint');
const rule = require('./index');

const tester = new RuleTester({
  languageOptions: {
    parser: require('@typescript-eslint/parser')
  }
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Options that restrict src/app/presentation (the default). */
const DEFAULT_OPTIONS = [{ restrictedPaths: ['src/app/presentation'], excludeFilePatterns: ['.spec.ts'] }];

/** Path inside the restricted zone. */
const RESTRICTED_FILE = '/project/src/app/presentation/pages/orders/order-detail.component.ts';

/** Path outside the restricted zone (entities layer). */
const ALLOWED_FILE = '/project/src/app/entities/interfaces/orders/member-cost.interface.ts';

/** Path that matches an exclusion pattern (.spec.ts). */
const SPEC_FILE = '/project/src/app/presentation/pages/orders/order-detail.component.spec.ts';

// ─── Tests ───────────────────────────────────────────────────────────────────

tester.run('no-inline-types-in-layer', rule, {
  valid: [
    // interface in entities (not restricted path) → OK
    {
      code: 'export interface MemberCost { userId: string; total: number; }',
      filename: ALLOWED_FILE,
      options: DEFAULT_OPTIONS
    },
    // type alias in entities → OK
    {
      code: "export type ReadyDialogResult = string[];",
      filename: ALLOWED_FILE,
      options: DEFAULT_OPTIONS
    },
    // spec file inside restricted path → excluded by default pattern
    {
      code: 'interface LocalHelper { id: number; }',
      filename: SPEC_FILE,
      options: DEFAULT_OPTIONS
    },
    // file outside all restricted paths when using custom restrictedPaths → OK
    {
      code: 'export interface Foo { bar: string; }',
      filename: '/project/src/app/domain/use-cases/game/game.use-cases.ts',
      options: [{ restrictedPaths: ['src/app/presentation'], excludeFilePatterns: [] }]
    },
    // type import (not TSTypeAliasDeclaration) is always OK
    {
      code: "import type { Foo } from './foo';",
      filename: RESTRICTED_FILE,
      options: DEFAULT_OPTIONS
    }
  ],

  invalid: [
    // interface inside restricted path → error
    {
      code: 'export interface GroupedLine { productId: number; qty: number; }',
      filename: RESTRICTED_FILE,
      options: DEFAULT_OPTIONS,
      errors: [{ messageId: 'noInlineInterface', data: { name: 'GroupedLine' } }]
    },
    // type alias inside restricted path → error
    {
      code: "export type GameListSortField = 'created_at' | 'title' | 'price';",
      filename: RESTRICTED_FILE,
      options: DEFAULT_OPTIONS,
      errors: [{ messageId: 'noInlineType', data: { name: 'GameListSortField' } }]
    },
    // multiple inline declarations → one error each
    {
      code: `
        export interface Foo { id: number; }
        export type Bar = string | number;
      `,
      filename: RESTRICTED_FILE,
      options: DEFAULT_OPTIONS,
      errors: [
        { messageId: 'noInlineInterface', data: { name: 'Foo' } },
        { messageId: 'noInlineType', data: { name: 'Bar' } }
      ]
    },
    // custom restrictedPaths that matches the domain layer
    {
      code: 'export interface DomainConcept { value: string; }',
      filename: '/project/src/app/domain/use-cases/game/game.use-cases.ts',
      options: [{ restrictedPaths: ['src/app/domain'], excludeFilePatterns: ['.spec.ts'] }],
      errors: [{ messageId: 'noInlineInterface', data: { name: 'DomainConcept' } }]
    },
    // default excludeFilePatterns only excludes .spec.ts — other patterns are NOT excluded
    {
      code: 'export interface LocalModel { id: number; }',
      filename: '/project/src/app/presentation/pages/orders/order-detail.component.ts',
      options: [{ restrictedPaths: ['src/app/presentation'], excludeFilePatterns: ['.e2e.ts'] }],
      errors: [{ messageId: 'noInlineInterface', data: { name: 'LocalModel' } }]
    }
  ]
});

console.log('no-inline-types-in-layer: all tests passed ✓');
