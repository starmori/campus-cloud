import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { NgModule } from '@angular/core';

import { FeedsListComponent } from './list';
import * as fromWalls from './store/reducers';
import { FeedsService } from './feeds.service';
import { CPI18nPipe } from '@campus-cloud/shared/pipes';
import { FeedsUtilsService } from './feeds.utils.service';
import { UserService } from '@campus-cloud/shared/services';
import { FeedsRoutingModule } from './feeds.routing.module';
import { FeedsComponent } from './list/base/feeds.component';
import { SharedModule } from '../../../../shared/shared.module';
import { FeedsAmplitudeService } from './feeds.amplitude.service';
import { LayoutsModule } from '@campus-cloud/layouts/layouts.module';
import { FeedsInfoComponent } from '@controlpanel/manage/feeds/info';
import { ImageModule } from '@campus-cloud/shared/services/image/image.module';
import { ProfileNameEmailPipe } from '@controlpanel/manage/feeds/list/pipes';
import {
  FeedBodyComponent,
  FeedItemComponent,
  FeedMoveComponent,
  FeedTagsComponent,
  FeedEditComponent,
  FeedHeaderComponent,
  FeedSearchComponent,
  FeedSettingsComponent,
  FeedDropdownComponent,
  FeedInputBoxComponent,
  FeedSortingComponent,
  FeedDeletedByComponent,
  FeedDeleteModalComponent,
  FeedInteractionsComponent,
  FeedHostSelectorComponent,
  FeedApproveModalComponent,
  FeedDeleteCommentModalComponent,
  FeedApproveCommentModalComponent,
  FeedCommentsComponent,
  FeedCommentComponent
} from './list/components';

@NgModule({
  declarations: [
    FeedsComponent,
    FeedMoveComponent,
    FeedItemComponent,
    FeedBodyComponent,
    FeedTagsComponent,
    FeedsListComponent,
    FeedEditComponent,
    FeedsInfoComponent,
    FeedHeaderComponent,
    FeedSearchComponent,
    FeedDropdownComponent,
    FeedInputBoxComponent,
    FeedSettingsComponent,
    FeedSortingComponent,
    FeedDeletedByComponent,
    FeedDeleteModalComponent,
    FeedApproveModalComponent,
    FeedHostSelectorComponent,
    FeedInteractionsComponent,
    FeedDeleteCommentModalComponent,
    FeedApproveCommentModalComponent,
    FeedCommentsComponent,
    FeedCommentComponent,
    ProfileNameEmailPipe
  ],

  imports: [
    CommonModule,
    SharedModule,
    RouterModule,
    LayoutsModule,
    FeedsRoutingModule,
    ReactiveFormsModule,
    ImageModule.forRoot(),
    StoreModule.forFeature('WALLS_STATE', {
      feeds: fromWalls.feedsReducer,
      bannedEmails: fromWalls.bannedEmailsReducer
    })
  ],

  providers: [FeedsService, FeedsUtilsService, CPI18nPipe, UserService, FeedsAmplitudeService],

  exports: [
    FeedsComponent,
    FeedMoveComponent,
    FeedItemComponent,
    FeedBodyComponent,
    FeedEditComponent,
    FeedTagsComponent,
    FeedsListComponent,
    FeedHeaderComponent,
    FeedSearchComponent,
    FeedDropdownComponent,
    FeedInputBoxComponent,
    FeedSettingsComponent,
    FeedSortingComponent,
    FeedDeletedByComponent,
    FeedDeleteModalComponent,
    FeedHostSelectorComponent,
    FeedApproveModalComponent,
    FeedDeleteCommentModalComponent,
    FeedApproveCommentModalComponent,
    FeedCommentsComponent,
    FeedCommentComponent
  ]
})
export class FeedsModule {}
