import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';
import { URLSearchParams } from '@angular/http';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { CPSession } from '../../../../../session';
import { AnnouncementsService } from '../announcements.service';
import { SNACKBAR_SHOW } from './../../../../../reducers/snackbar.reducer';
import { CP_PRIVILEGES_MAP, STATUS } from '../../../../../shared/constants';
import { StoreService, CPI18nService } from '../../../../../shared/services';
import { AUDIENCE_IMPORTED } from './../../../../../reducers/audience.reducer';
import { HEADER_UPDATE, IHeader } from './../../../../../reducers/header.reducer';
import { IToolTipContent } from '../../../../../shared/components/cp-tooltip/cp-tooltip.interface';

interface IState {
  isUrgent: boolean;
  isToLists: boolean;
  isToUsers: boolean;
  isToFilters: boolean;
  isEmergency: boolean;
  isCampusWide: boolean;
}

const state: IState = {
  isUrgent: false,
  isToLists: false,
  isToUsers: false,
  isToFilters: false,
  isEmergency: false,
  isCampusWide: true
};

const THROTTLED_STATUS = 1;

@Component({
  selector: 'cp-announcements-compose',
  templateUrl: './announcements-compose.component.html',
  styleUrls: ['./announcements-compose.component.scss']
})
export class AnnouncementsComposeComponent implements OnInit {
  @Input() toolTipContent: IToolTipContent;

  stores$;
  isError;
  sendAsName;
  buttonData;
  errorMessage;
  selectedType;
  form: FormGroup;
  isAudienceImport = false;

  URGENT_TYPE = 1;
  EMERGENCY_TYPE = 0;

  USERS_TYPE = 1;
  LISTS_TYPE = 2;

  state: IState = state;
  shouldConfirm = false;

  subject_prefix = {
    label: null,
    type: null
  };

  types;

  constructor(
    public router: Router,
    public fb: FormBuilder,
    public session: CPSession,
    public cpI18n: CPI18nService,
    public store: Store<IHeader>,
    public storeService: StoreService,
    public service: AnnouncementsService
  ) {
    const school = this.session.g.get('school');
    const search: URLSearchParams = new URLSearchParams();
    search.append('school_id', school.id.toString());

    this.stores$ = this.storeService.getStores(search);
  }

  onImportError() {
    this.store.dispatch({
      type: SNACKBAR_SHOW,
      payload: {
        sticky: true,
        class: 'danger',
        body: this.cpI18n.translate('something_went_wrong')
      }
    });
  }

  onImportSuccess({ id }) {
    this.store.dispatch({
      type: AUDIENCE_IMPORTED,
      payload: {
        audience_id: id,
        new_audience_active: false,
        saved_audience_active: true
      }
    });
  }

  onAudienceChange(audienceId) {
    if (audienceId) {
      this.state = {
        ...this.state,
        isToUsers: false,
        isToLists: true,
        isCampusWide: false
      };
      this.form.controls['list_ids'].setValue([audienceId]);
      this.form.controls['is_school_wide'].setValue(false);
    } else {
      this.state = {
        ...this.state,
        isToUsers: false,
        isToLists: false,
        isCampusWide: true,
        isToFilters: false
      };
      this.form.controls['list_ids'].setValue([]);
      this.form.controls['is_school_wide'].setValue(true);
    }
  }

  onSelectedUsers(users) {
    this.state = {
      ...this.state,
      isToUsers: true,
      isToLists: false,
      isCampusWide: false,
      isToFilters: false
    };
    this.form.controls['list_ids'].setValue([]);
    this.form.controls['user_ids'].setValue(users);
    this.form.controls['is_school_wide'].setValue(false);
  }

  getSubjectLength(): number {
    let length = 0;

    if (this.subject_prefix.label) {
      length += this.subject_prefix.label.length;
    }

    if (this.form.controls['subject'].value) {
      length += this.form.controls['subject'].value.length;
    }

    return length;
  }

  onSelectedStore(store) {
    this.sendAsName = store.label;
    this.form.controls['store_id'].setValue(store.value);
  }

  doValidate() {
    this.shouldConfirm = this.state.isEmergency || this.state.isCampusWide;

    if (!this.shouldConfirm) {
      this.doSubmit();
    } else {
      setTimeout(
        () => {
          $('#announcementConfirmModal').modal();
        },

        1
      );
    }
  }

  doSubmit() {
    this.isError = false;
    $('#announcementConfirmModal').modal('hide');

    const search = new URLSearchParams();
    search.append('school_id', this.session.g.get('school').id.toString());

    const prefix = this.subject_prefix.label ? this.subject_prefix.label.toUpperCase() : '';

    let data = {
      store_id: this.form.value.store_id,
      is_school_wide: this.form.value.is_school_wide,
      subject: `${prefix} ${this.form.value.subject}`,
      message: `${this.form.value.message} \n ${this.sendAsName}`,
      priority: this.form.value.priority
    };

    if (this.state.isToUsers && !this.state.isCampusWide) {
      data = Object.assign({}, data, { user_ids: this.form.value.user_ids });
    }

    if (this.state.isToLists && !this.state.isCampusWide) {
      data = Object.assign({}, data, { list_ids: this.form.value.list_ids });
    }

    if (this.state.isToFilters && !this.state.isCampusWide) {
      data = Object.assign({}, data, { filters: this.form.value.filters });
    }

    this.service.postAnnouncements(search, data).subscribe(
      (res) => {
        if (res.status === THROTTLED_STATUS) {
          this.shouldConfirm = false;

          this.isError = true;
          this.errorMessage = `Message not sent, \n
          please wait ${(res.timeout / 60).toFixed()} minutes before trying again`;

          return;
        }
        this.router.navigate(['/notify/announcements']);
      },
      (_) => {
        this.isError = true;
        this.shouldConfirm = false;
        this.errorMessage = STATUS.SOMETHING_WENT_WRONG;
      }
    );
  }

  onConfirmed() {
    this.doSubmit();
  }

  onTypeChanged(type): void {
    this.subject_prefix = {
      label: null,
      type: null
    };
    this.state.isUrgent = type.action === this.URGENT_TYPE;
    this.state.isEmergency = type.action === this.EMERGENCY_TYPE;

    if (this.state.isEmergency) {
      this.subject_prefix = {
        label: this.cpI18n.translate('emergency'),
        type: 'danger'
      };
    }

    if (this.state.isUrgent) {
      this.subject_prefix = {
        label: this.cpI18n.translate('urgent'),
        type: 'warning'
      };
    }

    this.form.controls['priority'].setValue(type.action);
    this.selectedType = this.getObjectFromTypesArray(type.action);
  }

  getObjectFromTypesArray(id) {
    let result;

    this.types.forEach((type) => {
      if (type.action === id) {
        result = type;
      }
    });

    return result;
  }

  onSelectedFilters(filters) {
    this.state = {
      ...this.state,
      isToUsers: false,
      isToLists: false,
      isCampusWide: false,
      isToFilters: true
    };

    this.form.controls['filters'].setValue(filters);
  }

  buildHeader() {
    this.store.dispatch({
      type: HEADER_UPDATE,
      payload: {
        heading: 'announcements_heading_create',
        subheading: null,
        em: null,
        children: []
      }
    });
  }

  onImportClick() {
    this.isAudienceImport = true;

    setTimeout(
      () => {
        $('#audienceImport').modal();
      },

      1
    );
  }

  ngOnInit() {
    this.buildHeader();

    this.buttonData = {
      text: 'send',
      class: 'primary',
      disabled: true
    };
    const defaultHost = this.session.defaultHost ? this.session.defaultHost.value : null;

    this.sendAsName = this.session.defaultHost ? this.session.defaultHost.label : undefined;

    this.toolTipContent = Object.assign({}, this.toolTipContent, {
      content: this.cpI18n.translate('notify_announcement_template_to_tooltip'),
      link: {
        text: this.cpI18n.translate('lists_button_create'),
        url:
          'https://oohlalamobile.zendesk.com/hc/en-us/articles/' +
          '115004330554-Create-a-List-of-Students'
      }
    });

    let canDoEmergency;

    const schoolPrivileges = this.session.g.get('user').school_level_privileges[
      this.session.g.get('school').id
    ];

    try {
      canDoEmergency = schoolPrivileges[CP_PRIVILEGES_MAP.emergency_announcement].w;
    } catch (error) {
      canDoEmergency = false;
    }

    this.types = require('./announcement-types').types;

    if (!canDoEmergency) {
      this.types = this.types.filter((type) => type.action !== this.EMERGENCY_TYPE);
    }

    this.form = this.fb.group({
      store_id: [defaultHost, Validators.required],
      user_ids: [[]],
      list_ids: [[]],
      filters: [[]],
      is_school_wide: true,
      subject: [null, [Validators.required, Validators.maxLength(128)]],
      message: [null, [Validators.required, Validators.maxLength(400)]],
      priority: [this.types[0].action, Validators.required]
    });

    this.form.valueChanges.subscribe((_) => {
      let isValid = true;

      isValid = this.form.valid;

      if (this.state.isToLists) {
        if (this.form.controls['list_ids'].value) {
          isValid = this.form.controls['list_ids'].value.length >= 1 && this.form.valid;
        }
      }

      this.buttonData = { ...this.buttonData, disabled: !isValid };
    });
  }
}
