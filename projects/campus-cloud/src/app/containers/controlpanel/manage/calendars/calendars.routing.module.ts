import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { CalendarsListComponent } from './list';
import { CalendarsDetailComponent } from './details';
import { pageTitle } from '@campus-cloud/shared/constants';
import { CalendarsItemsBulkCreateComponent } from './items/bulk-create/calendats-items-bulk-create.component';
import {
  CalendarsItemsEditComponent,
  CalendarsItemCreateComponent,
  CalendarsItemsDetailsComponent
} from './items';

const appRoutes: Routes = [
  {
    path: '',
    component: CalendarsListComponent,
    data: { zendesk: 'calendars', title: pageTitle.MANAGE_CALENDARS, amplitude: 'IGNORE' }
  },
  {
    path: ':calendarId',
    component: CalendarsDetailComponent,
    data: { zendesk: 'calendars', title: pageTitle.MANAGE_CALENDARS, amplitude: 'Calendar Events' }
  },
  // TODO: Split to its own module
  {
    path: ':calendarId/items/create',
    component: CalendarsItemCreateComponent,
    data: { zendesk: 'calendars', title: pageTitle.MANAGE_CALENDARS, amplitude: 'Calendar Events' }
  },
  {
    path: ':calendarId/integrations',
    data: { amplitude: 'Integrations' },
    loadChildren: () =>
      import('./integrations/items-integrations.module').then((m) => m.ItemsIntegrationsModule)
  },
  {
    path: ':calendarId/items/import',
    component: CalendarsItemsBulkCreateComponent,
    data: { zendesk: 'calendars', title: pageTitle.MANAGE_CALENDARS, amplitude: 'Calendar Events' }
  },
  {
    path: ':calendarId/items/:itemId',
    component: CalendarsItemsDetailsComponent,
    data: { zendesk: 'calendars', title: pageTitle.MANAGE_CALENDARS, amplitude: 'Calendar Events' }
  },
  {
    path: ':calendarId/items/:itemId/edit',
    component: CalendarsItemsEditComponent,
    data: { zendesk: 'calendars', title: pageTitle.MANAGE_CALENDARS, amplitude: 'Calendar Events' }
  }
];
@NgModule({
  imports: [RouterModule.forChild(appRoutes)],
  exports: [RouterModule]
})
export class CalendarRoutingModule {}
