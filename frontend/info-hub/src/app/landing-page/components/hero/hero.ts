import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
@Component({
  selector: 'app-hero',
  imports: [CardModule],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero {}
