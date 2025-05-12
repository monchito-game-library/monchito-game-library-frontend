import { Component } from '@angular/core';
import { TranslocoPipe } from '@ngneat/transloco';
import { HomeActionCardComponent } from '../../components/home-action-card/home-action-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [TranslocoPipe, HomeActionCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {}
