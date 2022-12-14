import { Component, OnInit, Inject } from '@angular/core';

import { ClubsService } from '../clubs.service';
import { amplitudeEvents } from '@campus-cloud/shared/constants';
import { isClubAthletic, clubAthleticLabels } from '../clubs.athletics.labels';
import {
  CPTrackingService,
  CPI18nService,
  MODAL_DATA,
  IModal
} from '@campus-cloud/shared/services';

@Component({
  selector: 'cp-clubs-delete',
  templateUrl: './clubs-delete.component.html',
  styleUrls: ['./clubs-delete.component.scss']
})
export class ClubsDeleteComponent implements OnInit {
  isAthletic: isClubAthletic;

  labels;
  club: any;
  deleteWarnings = [
    this.cpI18n.translate('t_shared_delete_resource_warning_wall_posts'),
    this.cpI18n.translate('t_shared_delete_resource_warning_assessment_data'),
    this.cpI18n.translate('t_shared_delete_resource_warning_events')
  ];

  constructor(
    @Inject(MODAL_DATA) private modal: IModal,
    private service: ClubsService,
    private cpI18n: CPI18nService,
    private cpTracking: CPTrackingService
  ) {}

  onClose() {
    this.modal.onClose();
  }

  onDelete() {
    this.service.deleteClubById(this.club.id).subscribe((_) => {
      this.trackEvent();
      this.modal.onClose(this.club.id);
    });
  }

  trackEvent() {
    const eventProperties = {
      ...this.cpTracking.getAmplitudeMenuProperties()
    };

    this.cpTracking.amplitudeEmitEvent(amplitudeEvents.DELETED_ITEM, eventProperties);
  }

  ngOnInit() {
    const { club, isAthletic } = this.modal.data;
    this.club = club;

    this.labels = clubAthleticLabels(isAthletic);
  }
}
