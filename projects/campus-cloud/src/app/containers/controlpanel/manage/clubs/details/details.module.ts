import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { ClubsInfoComponent } from '../info';
import { ClubsWallComponent } from '../wall';
import { ClubsDetailsComponent } from './details.component';
import { ClubNoteToTextPipe } from './../info/note-to-text.pipe';

import { SharedModule } from '../../../../../shared/shared.module';
import { ClubsDetailsRoutingModule } from './details.routing.module';

/**
 * External Modules
 */
import { FeedsModule } from '../../feeds/feeds.module';
import { EventsModule } from '../../events/events.module';

import { ClubsService } from '../clubs.service';

@NgModule({
  declarations: [ClubsWallComponent, ClubsInfoComponent, ClubsDetailsComponent, ClubNoteToTextPipe],

  imports: [
    CommonModule,
    SharedModule,
    RouterModule,
    ReactiveFormsModule,
    ClubsDetailsRoutingModule,
    FeedsModule,
    EventsModule
  ],

  exports: [ClubsWallComponent, ClubsInfoComponent, ClubsDetailsComponent],

  providers: [ClubsService]
})
export class ClubsDetailsModule {}
