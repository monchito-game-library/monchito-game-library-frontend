import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AddGameComponent } from './pages/add-game/add-game.component';
import {GameListComponent} from './pages/game-list/game-list.component';
import {DatabaseToolsComponent} from './pages/database-tools/database-tools.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'add', component: AddGameComponent },
  { path: 'list', component: GameListComponent },
  { path: 'add', component: AddGameComponent },
  { path: 'tools', component: DatabaseToolsComponent },
  { path: '**', redirectTo: '' } // fallback para rutas inválidas
];
