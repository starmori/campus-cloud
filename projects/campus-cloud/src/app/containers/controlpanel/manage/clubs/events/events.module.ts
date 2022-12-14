import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { SharedModule } from '../../../../../shared/shared.module';
import { EventsModule } from '../../events/events.module';

import { ClubsEventsComponent } from './clubs-events.component';
import { ClubsEventsRoutingModule } from './events.routing.module';

import {
  ClubsEventEditComponent,
  ClubsEventInfoComponent,
  ClubsEventsAttendanceComponent,
  ClubsEventsCreateComponent,
  ClubsEventsExcelComponent
} from './components';

/**
 * External Modules
 */

@NgModule({
  declarations: [
    ClubsEventsComponent,
    ClubsEventsCreateComponent,
    ClubsEventsAttendanceComponent,
    ClubsEventInfoComponent,
    ClubsEventEditComponent,
    ClubsEventsExcelComponent
  ],

  imports: [
    CommonModule,
    SharedModule,
    RouterModule,
    ReactiveFormsModule,
    ClubsEventsRoutingModule,
    EventsModule
  ],

  exports: [
    ClubsEventsComponent,
    ClubsEventsCreateComponent,
    ClubsEventsAttendanceComponent,
    ClubsEventInfoComponent,
    ClubsEventEditComponent,
    ClubsEventsExcelComponent
  ],

  providers: []
})
export class ClubsEventsModule {}
