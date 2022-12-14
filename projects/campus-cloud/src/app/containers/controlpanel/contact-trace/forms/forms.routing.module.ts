import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { pageTitle } from '@campus-cloud/shared/constants';
import {
  FormsListComponent,
  FormsCreateBuilderComponent,
  FormsCreateComponent,
  FormsCreateInfoComponent,
  FormsCreateResultsComponent,
  FormsCreateShareComponent,
  FormsRespondentResponseComponent
} from '.';

// ToDo: PJ: Revisit complete code on this page including zendesk, pagetitle, AMPLITUDE

const appRoutes: Routes = [
  {
    path: '',
    data: { zendesk: 'forms', title: pageTitle.CONTACT_TRACE_FORMS, amplitude: 'IGNORE' },
    component: FormsListComponent
  },
  {
    path: 'edit/:formId',
    data: { zendesk: 'forms', amplitude: 'IGNORE', title: pageTitle.CONTACT_TRACE_FORMS },
    component: FormsCreateComponent,
    children: [
      {
        path: 'info',
        data: { zendesk: 'forms', amplitude: 'IGNORE', title: pageTitle.CONTACT_TRACE_FORMS },
        component: FormsCreateInfoComponent
      },
      {
        path: 'builder',
        data: { zendesk: 'forms', amplitude: 'IGNORE', title: pageTitle.CONTACT_TRACE_FORMS },
        component: FormsCreateBuilderComponent
      },
      {
        path: 'share',
        data: { zendesk: 'forms', amplitude: 'IGNORE', title: pageTitle.CONTACT_TRACE_FORMS },
        component: FormsCreateShareComponent
      },
      {
        path: 'results',
        data: { zendesk: 'forms', amplitude: 'IGNORE', title: pageTitle.CONTACT_TRACE_FORMS },
        component: FormsCreateResultsComponent
      }
    ]
  },
  {
    path: ':formId/response/:responseId',
    data: { zendesk: 'forms', title: pageTitle.CONTACT_TRACE_FORMS, amplitude: 'IGNORE' },
    component: FormsRespondentResponseComponent
  }
];
@NgModule({
  imports: [RouterModule.forChild(appRoutes)],
  exports: [RouterModule]
})
export class FormsRoutingModule {}
