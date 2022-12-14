import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { CPSession } from '@campus-cloud/session';
import { ClubStatus } from '../../../club.status';
import { CP_TRACK_TO } from '@campus-cloud/shared/directives';
import { canSchoolWriteResource } from '@campus-cloud/shared/utils/privileges';
import { CPI18nService, CPTrackingService } from '@campus-cloud/shared/services';
import { CP_PRIVILEGES_MAP, amplitudeEvents } from '@campus-cloud/shared/constants';
import { clubAthleticLabels, isClubAthletic } from '../../../clubs.athletics.labels';

interface IState {
  query: string;
  type: string;
}

const state: IState = {
  query: null,
  type: null
};

@Component({
  selector: 'cp-clubs-list-action-box',
  templateUrl: './clubs-list-action-box.component.html',
  styleUrls: ['./clubs-list-action-box.component.scss']
})
export class ClubsListActionBoxComponent implements OnInit {
  @Input() isAthletic = isClubAthletic.club;

  @Output() filter: EventEmitter<IState> = new EventEmitter();
  @Output() search: EventEmitter<IState> = new EventEmitter();

  labels;
  eventData;
  clubFilter;
  canCreate;
  selectedItem = null;
  state: IState = state;
  isClubAthleticPrivilege;

  constructor(
    private session: CPSession,
    public route: ActivatedRoute,
    private cpI18n: CPI18nService,
    private cpTracking: CPTrackingService
  ) {}

  onUpdateState(data, key: string): void {
    this.state = Object.assign({}, this.state, { [key]: data });

    key === 'type' ? this.filter.emit(this.state) : this.search.emit(this.state);
  }

  updateStateFromUrl() {
    const type = this.route.snapshot.queryParams['type'];

    this.state = {
      ...this.state,
      type
    };

    this.selectedItem = this.clubFilter.filter((c) => c.action === +type)[0];

    this.filter.emit(this.state);
  }

  ngOnInit() {
    this.eventData = {
      type: CP_TRACK_TO.AMPLITUDE,
      eventName: amplitudeEvents.CLICKED_CREATE_ITEM,
      eventProperties: this.cpTracking.getAmplitudeMenuProperties()
    };

    this.isClubAthleticPrivilege =
      this.isAthletic === isClubAthletic.club
        ? CP_PRIVILEGES_MAP.clubs
        : CP_PRIVILEGES_MAP.athletics;
    this.canCreate = canSchoolWriteResource(this.session.g, this.isClubAthleticPrivilege);

    this.labels = clubAthleticLabels(this.isAthletic);

    this.clubFilter = [
      {
        label: this.cpI18n.translate(this.labels.all),
        action: null
      },
      {
        label: this.cpI18n.translate('active'),
        action: ClubStatus.active
      },
      {
        label: this.cpI18n.translate('clubs_inactive'),
        action: ClubStatus.inactive
      },
      {
        label: this.cpI18n.translate('pending'),
        action: ClubStatus.pending
      }
    ];

    const hasTypeParam = this.route.snapshot.queryParamMap.get('type');

    if (hasTypeParam) {
      this.updateStateFromUrl();
    }
  }
}
