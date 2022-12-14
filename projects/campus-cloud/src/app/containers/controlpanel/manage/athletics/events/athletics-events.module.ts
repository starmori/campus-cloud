import { NgModule } from '@angular/core';

import { AthleticsEventsComponent } from './athletics-events.component';
import { ClubsEventsModule } from '../../clubs/events/events.module';
import { AthleticsEventsRoutingModule } from './athletics-events.routing.module';

import {
  AthleticsEventsEditComponent,
  AthleticsEventsInfoComponent,
  AthleticsEventsExcelComponent,
  AthleticsEventsCreateComponent,
  AthleticsEventsAtthendanceComponent
} from './components';

@NgModule({
  declarations: [
    AthleticsEventsComponent,
    AthleticsEventsEditComponent,
    AthleticsEventsInfoComponent,
    AthleticsEventsExcelComponent,
    AthleticsEventsCreateComponent,
    AthleticsEventsAtthendanceComponent
  ],

  imports: [AthleticsEventsRoutingModule, ClubsEventsModule]
})
export class AthleticsEventsModule {}
