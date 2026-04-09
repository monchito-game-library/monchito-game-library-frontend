'use strict';

const { RuleTester } = require('eslint');
const rule = require('./index');

const tester = new RuleTester({
  languageOptions: {
    parser: require('@typescript-eslint/parser')
  }
});

// ─── File-path helpers ────────────────────────────────────────────────────────

const file = (layer, name = 'foo.ts') => `/project/src/app/${layer}/components/${name}`;

// ─── Tests ────────────────────────────────────────────────────────────────────

tester.run('clean-architecture-boundaries', rule, {
  valid: [
    // presentation → entities: always OK
    {
      code: "import { GameModel } from 'src/app/entities/models/game.model';",
      filename: file('presentation')
    },
    // presentation → domain (non-repository): OK
    {
      code: "import { GAME_USE_CASES } from 'src/app/domain/use-cases/game/game.use-cases.contract';",
      filename: file('presentation')
    },
    // presentation → di: OK
    {
      code: "import { provideGames } from 'src/app/di/providers/game.provider';",
      filename: file('presentation')
    },
    // data → entities: OK
    {
      code: "import { GameModel } from 'src/app/entities/models/game.model';",
      filename: file('data')
    },
    // data → domain with .contract (exception allows it)
    {
      code: "import { GameRepositoryContract } from 'src/app/domain/repositories/game.repository.contract';",
      filename: file('data')
    },
    // domain → entities: OK
    {
      code: "import { GameModel } from 'src/app/entities/models/game.model';",
      filename: file('domain')
    },
    // di → data: OK
    {
      code: "import { SupabaseGameRepository } from 'src/app/data/repositories/supabase-game.repository';",
      filename: file('di')
    },
    // di → domain: OK
    {
      code: "import { GAME_USE_CASES } from 'src/app/domain/use-cases/game/game.use-cases.contract';",
      filename: file('di')
    },
    // self-import: presentation → presentation is fine (same layer)
    {
      code: "import { SomeComponent } from 'src/app/presentation/components/other/other.component';",
      filename: file('presentation')
    },
    // file outside all known layers → rule skips it
    {
      code: "import { anything } from 'src/app/data/repositories/game.repository';",
      filename: '/project/scripts/generate-env.ts'
    },
    // relative import with no layer in path → treated as self or unknown, allowed
    {
      code: "import { helper } from '../utils/helper';",
      filename: file('presentation')
    }
  ],

  invalid: [
    // presentation → data: not allowed
    {
      code: "import { SupabaseGameRepository } from 'src/app/data/repositories/supabase-game.repository';",
      filename: file('presentation'),
      errors: [{ message: 'presentation layer is not allowed to import from data layer.' }]
    },
    // presentation → domain/repositories: blocked by exception
    {
      code: "import { GameRepository } from 'src/app/domain/repositories/game.repository';",
      filename: file('presentation'),
      errors: [{ message: 'presentation layer is not allowed to import from domain layer (block by exception).' }]
    },
    // data → presentation: not allowed
    {
      code: "import { GameListComponent } from 'src/app/presentation/pages/game-list/game-list.component';",
      filename: file('data'),
      errors: [{ message: 'data layer is not allowed to import from presentation layer.' }]
    },
    // data → domain without .contract: not allowed (only .contract paths are excepted)
    {
      code: "import { GameUseCases } from 'src/app/domain/use-cases/game/game.use-cases';",
      filename: file('data'),
      errors: [{ message: 'data layer is not allowed to import from domain layer.' }]
    },
    // domain → data: not allowed
    {
      code: "import { SupabaseGameRepository } from 'src/app/data/repositories/supabase-game.repository';",
      filename: file('domain'),
      errors: [{ message: 'domain layer is not allowed to import from data layer.' }]
    },
    // domain → presentation: not allowed
    {
      code: "import { GameListComponent } from 'src/app/presentation/pages/game-list/game-list.component';",
      filename: file('domain'),
      errors: [{ message: 'domain layer is not allowed to import from presentation layer.' }]
    },
    // entities → any other layer: not allowed
    {
      code: "import { GameUseCases } from 'src/app/domain/use-cases/game/game.use-cases';",
      filename: file('entities'),
      errors: [{ message: 'entities layer is not allowed to import from domain layer.' }]
    },
    // invalid configuration: unknown layer in allowedImports → reports on line 1
    {
      code: "import { Foo } from './foo';",
      filename: file('presentation'),
      options: [
        {
          layers: ['presentation', 'domain'],
          allowedImports: { presentation: ['domain'], domain: [], unknown: [] }
        }
      ],
      errors: [{ message: "[layer-boundaries] Unknown layer 'unknown' in allowedImports." }]
    },
    // invalid configuration: circular rule → reports on line 1
    {
      code: "import { Foo } from './foo';",
      filename: file('presentation'),
      options: [
        {
          layers: ['presentation', 'domain'],
          allowedImports: { presentation: ['domain'], domain: ['presentation'] }
        }
      ],
      errors: [
        {
          message:
            "[layer-boundaries] Circular import rule detected between 'presentation' and 'domain'."
        }
      ]
    }
  ]
});

console.log('clean-architecture-boundaries: all tests passed ✓');
