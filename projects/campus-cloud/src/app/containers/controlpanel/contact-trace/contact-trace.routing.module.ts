import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { PrivilegesGuard } from '@campus-cloud/config/guards';
import { CP_PRIVILEGES_MAP } from '@campus-cloud/shared/constants';
import { ContactTraceComponent } from './contact-trace.component';

const appRoutes: Routes = [
  { path: '', redirectTo: 'forms', pathMatch: 'full' },

  {
    path: '',
    component: ContactTraceComponent,
    data: { amplitude: 'IGNORE' },
    children: [
      {
        path: 'cases',
        data: {
          zendesk: 'cases',
          amplitude: 'Cases',
          privilege: CP_PRIVILEGES_MAP.contact_trace_cases
        },
        loadChildren: () => import('./cases/cases.module').then((m) => m.CasesModule)
      },
      {
        path: 'forms',
        canActivate: [PrivilegesGuard],
        data: {
          zendesk: 'forms',
          amplitude: 'Forms',
          privilege: CP_PRIVILEGES_MAP.contact_trace_forms
        },
        loadChildren: () => import('./forms/forms.module').then((m) => m.CTFormsModule)
      },
      {
        path: 'qr',
        canActivate: [PrivilegesGuard],
        data: {
          zendesk: 'qr',
          amplitude: 'Qr',
          privilege: CP_PRIVILEGES_MAP.contact_trace_qr
        },
        loadChildren: () => import('./qr/qr.module').then((m) => m.QrModule)
      },
      {
        path: 'health-pass',
        canActivate: [PrivilegesGuard],
        data: {
          zendesk: 'health-pass',
          amplitude: 'Health Pass',
          privileges: [
            CP_PRIVILEGES_MAP.contact_trace_forms,
            CP_PRIVILEGES_MAP.contact_trace_exposure_notification
          ]
        },
        loadChildren: () =>
          import('./health-pass/health-pass.module').then((m) => m.HealthPassModule)
      },
      {
        path: 'exposure-notification',
        canActivate: [PrivilegesGuard],
        data: {
          zendesk: 'exposure notification',
          amplitude: 'Exposure Notification',
          privilege: CP_PRIVILEGES_MAP.contact_trace_exposure_notification
        },
        loadChildren: () =>
          import('./exposure-notification/exposure-notification.module').then(
            (m) => m.ExposureNotificationModule
          )
      },
      {
        path: 'health-dashboard',
        canActivate: [PrivilegesGuard],
        data: {
          zendesk: 'health dashboard',
          amplitude: 'Health Dashboard',
          privilege: CP_PRIVILEGES_MAP.contact_trace_health_dashboard
        },
        loadChildren: () =>
          import('./health-dashboard/health-dashboard.module').then((m) => m.HealthDashboardModule)
      }
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(appRoutes)],
  exports: [RouterModule]
})
export class ContactTraceRoutingModule {}
