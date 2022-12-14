import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpParams } from '@angular/common/http';
import { OverlayRef } from '@angular/cdk/overlay';
import { BehaviorSubject, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import {
  Input,
  OnInit,
  Output,
  Component,
  OnDestroy,
  ElementRef,
  EventEmitter,
  HostListener
} from '@angular/core';

import {
  StoreService,
  CPI18nService,
  ZendeskService,
  CPTrackingService,
  CPAmplitudeService
} from '@campus-cloud/shared/services';
import { CPSession } from '@campus-cloud/session';
import { Destroyable, Mixin } from '@campus-cloud/shared/mixins';
import { CustomValidators } from '@campus-cloud/shared/validators';
import { canSchoolWriteResource } from '@campus-cloud/shared/utils';
import { TemplatesAmplitudeService } from './../templates.amplitude.service';
import { AnnouncementsService } from './../../announcements/announcements.service';
import { CP_PRIVILEGES_MAP, STATUS, amplitudeEvents } from '@campus-cloud/shared/constants';

interface IState {
  isUrgent: boolean;
  isToUsers: boolean;
  isToLists: boolean;
  isEmergency: boolean;
  isCampusWide: boolean;
}

const state: IState = {
  isUrgent: false,
  isToUsers: true,
  isToLists: false,
  isEmergency: false,
  isCampusWide: false
};

const THROTTLED_STATUS = 1;

@Mixin([Destroyable])
@Component({
  selector: 'cp-templates-compose',
  templateUrl: './templates-compose.component.html',
  styleUrls: ['./templates-compose.component.scss']
})
export class TemplatesComposeComponent implements OnInit, OnDestroy {
  @Input() data: any;

  @Output() created: EventEmitter<any> = new EventEmitter();
  @Output() teardown: EventEmitter<null> = new EventEmitter();

  types;
  stores$;
  isError;
  chips = [];
  sendAsName;
  selectedHost;
  errorMessage;
  selectedType;
  typeAheadOpts;
  hostType = null;
  form: FormGroup;
  modal: OverlayRef;
  isFormValid = false;
  resetChips$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  resetCustomFields$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  tooltipLink = `${ZendeskService.zdRoot()}/articles/115004330554-Create-a-List-of-Students`;

  URGENT_TYPE = 1;
  EMERGENCY_TYPE = 0;
  REGULAR_TYPE = 2;

  USERS_TYPE = 1;
  LISTS_TYPE = 2;

  suggestions = [];

  state: IState = state;

  subject_prefix = {
    label: null,
    type: null
  };

  destroy$ = new Subject<null>();
  emitDestroy() {}

  constructor(
    public el: ElementRef,
    public fb: FormBuilder,
    public session: CPSession,
    public cpI18n: CPI18nService,
    public storeService: StoreService,
    public cpTracking: CPTrackingService,
    public service: AnnouncementsService
  ) {
    const school = this.session.g.get('school');
    const search: HttpParams = new HttpParams().append('school_id', school.id.toString());

    this.stores$ = this.storeService.getStores(search);
  }

  @HostListener('document:click', ['$event'])
  onClick(event) {
    // out of modal reset form
    if (event.target.contains(this.el.nativeElement)) {
      this.resetModal();
    }
  }

  onTypeChanged(type) {
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

  doUserSearch(query) {
    const search = new HttpParams()
      .append('search_str', query)
      .append('school_id', this.session.g.get('school').id.toString());

    this.service
      .getUsers(search)
      .pipe(
        map((users: Array<any>) => {
          const _users = [];

          users.forEach((user) => {
            _users.push({
              label: `${user.firstname} ${user.lastname}`,
              id: user.id
            });
          });

          if (!_users.length) {
            _users.push({ label: this.cpI18n.translate('no_results') });
          }

          return _users;
        })
      )
      .subscribe((suggestions) => {
        this.typeAheadOpts = Object.assign({}, this.typeAheadOpts, {
          suggestions
        });
      });
  }

  getSubjectLength() {
    let length = '';

    if (this.subject_prefix.label) {
      length += this.subject_prefix.label;
    }

    if (this.form.controls['subject'].value) {
      length += this.form.controls['subject'].value;
    }

    return length;
  }

  onSearch(query) {
    if (this.state.isToUsers) {
      this.doUserSearch(query);

      return;
    }

    this.doListsSearch(query);
  }

  doListsSearch(query) {
    const search = new HttpParams()
      .append('search_str', query)
      .append('school_id', this.session.g.get('school').id.toString());

    this.service
      .getLists(search, 1, 400)
      .pipe(
        map((lists: Array<any>) => {
          const _lists = [];

          lists.forEach((list) => {
            _lists.push({
              label: `${list.name}`,
              id: list.id
            });
          });

          if (!_lists.length) {
            _lists.push({ label: this.cpI18n.translate('no_results') });
          }

          return _lists;
        })
      )
      .subscribe((suggestions) => {
        this.typeAheadOpts = Object.assign({}, this.typeAheadOpts, {
          suggestions
        });
      });
  }

  getTypeFromArray(id) {
    return this.types.filter((type) => type.id === id)[0];
  }

  resetModal() {
    this.form.reset();
    this.isError = false;
    this.state.isCampusWide = false;
    this.resetCustomFields$.next(true);

    this.subject_prefix = {
      label: null,
      type: null
    };

    $('#composeModal').modal('hide');

    this.resetChips();

    this.teardown.emit();
  }

  onHandleToggle(status) {
    this.typeAheadOpts = Object.assign({}, this.typeAheadOpts, {
      isUsers: true,
      defaultValues: []
    });

    this.state = Object.assign({}, this.state, {
      isToLists: false,
      isToUsers: status ? false : true,
      isCampusWide: !this.state.isCampusWide
    });

    this.form.controls['user_ids'].setValue([]);
    this.form.controls['list_ids'].setValue([]);
    this.form.controls['is_school_wide'].setValue(status);

    if (canSchoolWriteResource(this.session.g, CP_PRIVILEGES_MAP.emergency_announcement)) {
      this.toggleEmergencyType();

      if (!status && this.form.controls['priority'].value === this.EMERGENCY_TYPE) {
        this.form.controls['priority'].setValue(this.REGULAR_TYPE);

        this.selectedType = this.types.filter((type) => type.action === this.REGULAR_TYPE)[0];

        this.state = { ...this.state, isEmergency: false };

        this.subject_prefix = {
          label: null,
          type: null
        };
      }
    }
  }

  toggleEmergencyType() {
    this.types = this.types.map((type) => {
      if (type.action === this.EMERGENCY_TYPE) {
        type = { ...type, disabled: !type.disabled };
      }

      return type;
    });
  }

  onSelectedStore(store) {
    this.sendAsName = store.label;
    this.form.controls['store_id'].setValue(store.value);

    if (store.hostType) {
      this.hostType = store.hostType;
    }
  }

  doChipsSelected() {
    this.typeAheadOpts = Object.assign({}, this.typeAheadOpts, {
      isUsers: this.state.isToUsers
    });

    if (this.chips.length) {
      this.typeAheadOpts = Object.assign({}, this.typeAheadOpts, {
        defaultValues: this.chips.map((data) => {
          return {
            id: data.id,
            label: data.label
          };
        })
      });
    }
  }

  doSubmit() {
    this.isError = false;
    const search = new HttpParams().append('school_id', this.session.g.get('school').id.toString());

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

    this.service.postAnnouncements(search, data).subscribe(
      (res: any) => {
        if (res.status === THROTTLED_STATUS) {
          this.isError = true;
          this.errorMessage = `Message not sent, \n
          please wait ${(res.timeout / 60).toFixed()} minutes before trying again`;

          return;
        }

        const host_type = this.hostType
          ? this.hostType
          : CPAmplitudeService.storeCategoryIdToAmplitudeName(this.data['store_category_id']);
        const { sub_menu_name } = this.cpTracking.getAmplitudeMenuProperties();
        const properties = {
          ...TemplatesAmplitudeService.getAmplitudeProperties(data as any, this.data.id),
          host_type,
          sub_menu_name
        };

        this.cpTracking.amplitudeEmitEvent(
          amplitudeEvents.NOTIFY_UPDATED_COMMUNICATION,
          properties
        );
        this.form.reset();
        this.created.emit(this.form.value);
        this.resetModal();
      },
      (_) => {
        this.isError = true;
        this.errorMessage = STATUS.SOMETHING_WENT_WRONG;
      }
    );
  }

  getObjectFromTypesArray(id) {
    return this.types.filter((type) => type.action === id)[0];
  }

  onSwitchSearchType(type) {
    switch (type) {
      case this.USERS_TYPE:
        this.state = Object.assign({}, this.state, {
          isToUsers: true,
          isToLists: false
        });
        break;
      case this.LISTS_TYPE:
        this.state = Object.assign({}, this.state, {
          isToUsers: false,
          isToLists: true
        });
        break;
    }

    this.form.controls['user_ids'].setValue([]);
    this.form.controls['list_ids'].setValue([]);
  }

  resetChips() {
    this.resetChips$.next(true);
  }

  onTypeAheadChange(type) {
    this.chips = type.chips;
    if (this.state.isToUsers) {
      this.form.controls['user_ids'].setValue(type.ids);
      this.form.controls['list_ids'].setValue([]);
    }
    if (this.state.isToLists) {
      this.form.controls['list_ids'].setValue(type.ids);
      this.form.controls['user_ids'].setValue([]);
    }
  }

  ngOnDestroy() {
    this.resetModal();
    this.emitDestroy();
  }

  updateStateFromInputData() {
    this.state = Object.assign({}, this.state, {
      isToLists: 'list_details' in this.data,
      isToUsers: 'user_details' in this.data,
      isCampusWide: this.data.is_school_wide,
      isUrgent: this.data.priority === this.URGENT_TYPE,
      isEmergency: this.data.priority === this.EMERGENCY_TYPE
    });
  }

  updateLabel() {
    switch (this.data.priority) {
      case this.EMERGENCY_TYPE:
        this.subject_prefix = {
          label: this.cpI18n.translate('emergency'),
          type: 'danger'
        };
        break;
      case this.URGENT_TYPE:
        this.subject_prefix = {
          label: this.cpI18n.translate('urgent'),
          type: 'warning'
        };
        break;
      default:
        this.subject_prefix = {
          label: null,
          type: null
        };
        break;
    }

    this.selectedType = this.getObjectFromTypesArray(this.data.priority);
  }

  updateFormWithTemplateData() {
    this.form.controls['subject'].setValue(this.data.subject);
    this.form.controls['priority'].setValue(this.data.priority);
    this.form.controls['message'].setValue(this.data.message);
    this.form.controls['store_id'].setValue(this.data.store_id);
    this.form.controls['is_school_wide'].setValue(this.data.is_school_wide);

    if ('list_details' in this.data) {
      const list_ids = this.data.list_details.map((list) => list.id);
      this.form.controls['list_ids'].setValue(list_ids);
    }

    if ('user_details' in this.data) {
      const user_ids = this.data.user_details.map((user) => user.id);
      this.form.controls['user_ids'].setValue(user_ids);
    }
  }

  updateTypeAheadDefaultValues() {
    this.typeAheadOpts.isUsers = 'user_details' in this.data;

    if ('list_details' in this.data) {
      this.typeAheadOpts = Object.assign({}, this.typeAheadOpts, {
        defaultValues: this.data.list_details.map((list) => {
          return {
            id: list.id,
            label: list.name
          };
        })
      });
    }

    if ('user_details' in this.data) {
      this.typeAheadOpts = Object.assign({}, this.typeAheadOpts, {
        defaultValues: this.data.user_details.map((user) => {
          return {
            id: user.id,
            label: user.email
          };
        })
      });
    }
  }

  ngOnInit() {
    let canDoEmergency;

    this.typeAheadOpts = {
      withSwitcher: canSchoolWriteResource(this.session.g, CP_PRIVILEGES_MAP.audience),
      suggestions: this.suggestions,
      reset: this.resetChips$,
      unsetOverflow: true
    };
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

    this.toggleEmergencyType();

    this.form = this.fb.group({
      store_id: [null, Validators.required],
      user_ids: [[]],
      list_ids: [[]],
      is_school_wide: false,
      subject: [null, [CustomValidators.requiredNonEmpty, Validators.maxLength(255)]],
      message: [null, [CustomValidators.requiredNonEmpty, Validators.maxLength(2048)]],
      priority: [this.types[0].action, Validators.required]
    });

    this.form.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      let isValid = true;

      isValid = this.form.valid;

      if (this.state.isToLists) {
        if (this.form.controls['list_ids'].value) {
          isValid = this.form.controls['list_ids'].value.length >= 1 && this.form.valid;
        }
      }

      if (this.state.isToUsers) {
        if (this.form.controls['user_ids'].value) {
          isValid = this.form.controls['user_ids'].value.length >= 1 && this.form.valid;
        }
      }

      this.isFormValid = isValid;
    });

    this.updateLabel();
    this.updateStateFromInputData();
    this.updateFormWithTemplateData();
    this.updateTypeAheadDefaultValues();

    this.sendAsName = this.data.store_name;

    this.selectedHost = {
      label: this.data.store_name,
      value: this.data.store_id
    };
  }
}
