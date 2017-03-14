import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../../../config/guards';

import { ManageComponent } from './manage.component';


const appRoutes: Routes = [
  { path: '', redirectTo: 'events', pathMatch: 'full' },

  {
    path: '',
    component: ManageComponent,
    canActivate: [ AuthGuard ],
    children: [
      { path: 'events', loadChildren: './events/events.module#EventsModule' },

      { path: 'services', loadChildren: './services/services.module#ServicesModule' },

      { path: 'team', loadChildren: './team/team.module#TeamModule' },
    ]
  }
];
@NgModule({
  imports: [
    RouterModule.forChild(appRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class ManageRoutingModule {}
