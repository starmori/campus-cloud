import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BannerListComponent } from './list';

const appRoutes: Routes = [
  {
    path: '',
    data: { zendesk: 'studio' },
    component: BannerListComponent
  }
];
@NgModule({
  imports: [RouterModule.forChild(appRoutes)],
  exports: [RouterModule]
})
export class BannerRoutingModule {}
