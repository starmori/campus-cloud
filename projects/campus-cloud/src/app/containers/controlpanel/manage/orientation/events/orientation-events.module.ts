import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { SharedModule } from '../../../../../shared/shared.module';
import { EventsModule } from '../../events/events.module';

import { OrientationEventsService } from './orientation.events.service';
import { OrientationEventsComponent } from './orientation-events.component';
import { OrientationEventsRoutingModule } from './orientation-events.routing.module';
import {
  OrientationEventsInfoComponent,
  OrientationEventsEditComponent,
  OrientationEventsExcelComponent,
  OrientationEventsCreateComponent,
  OrientationEventsAttendanceComponent
} from './components';

@NgModule({
  declarations: [
    OrientationEventsComponent,
    OrientationEventsEditComponent,
    OrientationEventsInfoComponent,
    OrientationEventsExcelComponent,
    OrientationEventsCreateComponent,
    OrientationEventsAttendanceComponent
  ],

  imports: [
    CommonModule,
    SharedModule,
    RouterModule,
    ReactiveFormsModule,
    OrientationEventsRoutingModule,
    EventsModule
  ],

  providers: [OrientationEventsService]
})
export class OrientationEventsModule {}
