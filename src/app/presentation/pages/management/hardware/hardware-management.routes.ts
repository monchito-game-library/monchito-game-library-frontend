import { Routes } from '@angular/router';

import { hardwareBrandRepositoryProvider } from '@/di/repositories/hardware-brand.repository.provider';
import { hardwareModelRepositoryProvider } from '@/di/repositories/hardware-model.repository.provider';
import { hardwareEditionRepositoryProvider } from '@/di/repositories/hardware-edition.repository.provider';
import { hardwareConsoleSpecsRepositoryProvider } from '@/di/repositories/hardware-console-specs.repository.provider';
import { hardwareBrandUseCasesProvider } from '@/di/use-cases/hardware-brand.use-cases.provider';
import { hardwareModelUseCasesProvider } from '@/di/use-cases/hardware-model.use-cases.provider';
import { hardwareEditionUseCasesProvider } from '@/di/use-cases/hardware-edition.use-cases.provider';
import { hardwareConsoleSpecsUseCasesProvider } from '@/di/use-cases/hardware-console-specs.use-cases.provider';

export const hardwareManagementRoutes: Routes = [
  {
    path: '',
    providers: [
      hardwareBrandRepositoryProvider,
      hardwareModelRepositoryProvider,
      hardwareEditionRepositoryProvider,
      hardwareConsoleSpecsRepositoryProvider,
      hardwareBrandUseCasesProvider,
      hardwareModelUseCasesProvider,
      hardwareEditionUseCasesProvider,
      hardwareConsoleSpecsUseCasesProvider
    ],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./hardware-brands-management.component').then((m) => m.HardwareBrandsManagementComponent)
      },
      {
        // Static segment 'models' must come before dynamic ':brandId' to avoid conflicts
        path: 'models/:modelId/editions',
        loadComponent: () =>
          import('./hardware-editions-management.component').then((m) => m.HardwareEditionsManagementComponent)
      },
      {
        path: ':brandId/models',
        loadComponent: () =>
          import('./hardware-models-management.component').then((m) => m.HardwareModelsManagementComponent)
      }
    ]
  }
];
