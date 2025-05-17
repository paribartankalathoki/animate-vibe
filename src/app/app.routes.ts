import {Routes} from '@angular/router';
import {ViewControllerComponent} from './components/view-controller/view-controller.component';
import { ActiveChatComponent } from './components/active-chat/active-chat.component';

export const routes: Routes = [
  {path: '', component: ViewControllerComponent},
  {path: '', redirectTo: '', pathMatch: 'full'},
  {path: '**', redirectTo: ''}
];
