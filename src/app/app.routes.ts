import {Routes} from '@angular/router';
import {ViewControllerComponent} from './components/view-controller/view-controller.component';

export const routes: Routes = [
  {path: '', component: ViewControllerComponent},
  {path: '', redirectTo: '', pathMatch: 'full'},
  {path: '**', redirectTo: ''}
];
