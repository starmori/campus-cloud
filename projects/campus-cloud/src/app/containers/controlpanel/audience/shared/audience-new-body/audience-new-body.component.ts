import { HttpParams } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CPSession } from './../../../../../session';
import { CPI18nService } from './../../../../../shared/services/i18n.service';
import { AudienceType } from './../../audience.status';
import { AudienceSharedService } from '../audience.shared.service';

@Component({
  selector: 'cp-audience-new-body',
  templateUrl: './audience-new-body.component.html',
  styleUrls: ['./audience-new-body.component.scss']
})
export class AudienceNewBodyComponent implements OnInit {
  @Input() audience;
  @Input() importButton = true;
  @Input() showSaveButton = false;
  @Input() withChips: Array<any> = [];
  @Input() disableTypeSelection = false;
  @Input() defaultView = AudienceType.dynamic;

  @Output() filters: EventEmitter<any> = new EventEmitter();
  @Output() count: EventEmitter<number> = new EventEmitter();
  @Output() importClick: EventEmitter<null> = new EventEmitter();
  @Output() saveAudience: EventEmitter<null> = new EventEmitter();
  @Output() users: EventEmitter<Array<number>> = new EventEmitter();
  @Output() audienceType: EventEmitter<{ custom: boolean; dynamic: boolean }> = new EventEmitter();

  message;
  audienceTypes;
  selectedType = null;
  state = {
    custom: true,
    dynamic: false,
    couting: false,
    canSave: false
  };

  constructor(
    public session: CPSession,
    public cpI18n: CPI18nService,
    public service: AudienceSharedService
  ) {}

  onTypeSelected({ action }) {
    this.state = {
      ...this.state,
      canSave: false,
      custom: action === AudienceType.custom,
      dynamic: action === AudienceType.dynamic
    };

    this.message = null;

    this.audienceType.emit(this.state);
  }

  getUserCount(filters) {
    this.count.emit(0);

    const noHttpCall = filters.filter((i) => i.attr_id === null).length;

    if (noHttpCall !== 0) {
      return;
    }

    this.state = { ...this.state, couting: true };

    const search = new HttpParams()
      .set('school_id', this.session.g.get('school').id)
      .set('count_only', '1');

    const data = {
      filters: [...filters]
    };

    this.service.getUserCount(data, search).subscribe(
      ({ count }) => {
        this.count.emit(count);
        this.state = {
          ...this.state,
          couting: false,
          canSave: count > 0
        };
        this.message = `${count} ${this.cpI18n.translate('users_found')}`;
      },

      () => {
        this.message = null;
        this.state = { ...this.state, couting: false };
      }
    );
  }

  onUsers(users) {
    this.state = { ...this.state, canSave: users.length > 0 };

    this.users.emit(users);
    this.message = `${users.length} ${this.cpI18n.translate('audience_counter_users')}`;
  }

  onFilters(filters) {
    this.getUserCount(filters);

    this.filters.emit(filters);
  }

  ngOnInit(): void {
    this.state = {
      ...this.state,
      custom: this.defaultView === AudienceType.custom,
      dynamic: this.defaultView === AudienceType.dynamic
    };

    this.audienceTypes = [
      {
        action: AudienceType.custom,
        label: this.cpI18n.translate('audience_type_custom')
      },
      {
        action: AudienceType.dynamic,
        label: this.cpI18n.translate('audience_type_dynamic')
      }
    ];

    this.selectedType = this.audienceTypes.filter(
      (audience) => audience.action === this.defaultView
    )[0];

    if (this.audience) {
      this.message = `${this.audience.count} ${this.cpI18n.translate('audience_counter_users')}`;
    }

    this.audienceType.emit(this.state);
  }
}
