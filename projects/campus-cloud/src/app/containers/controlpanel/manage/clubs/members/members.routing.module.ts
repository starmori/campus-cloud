import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ClubsMembersComponent } from './list';

const appRoutes: Routes = [
  { path: '', component: ClubsMembersComponent, data: { zendesk: 'clubs', amplitude: 'IGNORE' } }
];
@NgModule({
  imports: [RouterModule.forChild(appRoutes)],
  exports: [RouterModule]
})
export class ClubsMembersRoutingModule {}
