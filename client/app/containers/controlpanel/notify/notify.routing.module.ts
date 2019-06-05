import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { PrivilegesGuard } from '@app/config/guards';
import { NotifyComponent } from './notify.component';
import { CP_PRIVILEGES_MAP, pageTitle } from '@shared/constants';

const appRoutes: Routes = [
  { path: '', redirectTo: 'announcements', pathMatch: 'full' },

  {
    path: '',
    component: NotifyComponent,
    children: [
      {
        path: 'announcements',
        canActivate: [PrivilegesGuard],
        loadChildren: () =>
          import('./announcements/announcements.module').then((m) => m.AnnouncementsModule),
        data: {
          zendesk: 'announcements',
          title: pageTitle.NOTIFY_ANNOUNCEMENT,
          privilege: CP_PRIVILEGES_MAP.campus_announcements
        }
      },

      {
        path: 'templates',
        canActivate: [PrivilegesGuard],
        loadChildren: () => import('./templates/templates.module').then((m) => m.TemplatesModule),
        data: {
          zendesk: 'templates',
          title: pageTitle.NOTIFY_ANNOUNCEMENT,
          privilege: CP_PRIVILEGES_MAP.campus_announcements
        }
      }
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(appRoutes)],
  exports: [RouterModule]
})
export class NotifyRoutingModule {}
