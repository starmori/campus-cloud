import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { isEmpty, get as _get } from 'lodash';
import { FormGroup } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';

import { ContactTraceFeatureLevel, CPSession } from '@campus-cloud/session';
import { MODAL_TYPE } from '@campus-cloud/shared/components';
import { CPI18nService } from '@campus-cloud/shared/services';
import { TEAM_ACCESS } from '@controlpanel/settings/team/utils';
import { Destroyable, Mixin } from '@campus-cloud/shared/mixins';
import { CP_PRIVILEGES_MAP } from '@campus-cloud/shared/constants';
import {
  canAccountLevelReadResource,
  canSchoolReadResource,
  privacyConfigurationOn
} from '@campus-cloud/shared/utils';
import {
  clubMenu,
  eventMenu,
  serviceMenu,
  athleticMenu,
  manageAdminMenu,
  TeamUtilsService,
  audienceMenuStatus,
  contactTraceMenu,
  PrivacyConfiguration
} from '@controlpanel/settings/team/team.utils.service';

@Mixin([Destroyable])
@Component({
  selector: 'cp-team-privileges-form',
  templateUrl: './team-privileges-form.component.html',
  styleUrls: ['./team-privileges-form.component.scss']
})
export class TeamPrivilegesFormComponent implements OnInit, OnDestroy {
  @Input() isEdit;
  @Input() isCurrentUser;
  @Input() form: FormGroup;
  @Input() schoolPrivileges;
  @Input() accountPrivileges;
  @Input() isAllAccessEnabled;

  @Output() formSubmitted: EventEmitter<any> = new EventEmitter();

  preventSubmit$ = new BehaviorSubject(true);

  user;
  formData;
  clubsMenu;
  formError;
  eventsMenu;
  audienceMenu;
  contactTraceMenu;
  servicesMenu;
  manageAdmins;
  athleticsMenu;
  privacyOptions;
  schoolId: number;
  clubsCount = null;
  isFormError = false;
  isClubsModal = false;
  servicesCount = null;
  athleticsCount = null;
  canReadClubs: boolean;
  canReadEvents: boolean;
  isServiceModal = false;
  canReadAudience: boolean;
  canReadContactTrace: boolean;
  canEditPrivacyPermission: boolean;
  isContactTraceEnabled = false;
  isAthleticsModal = false;
  canReadServices: boolean;
  canReadAthletics: boolean;
  MODAL_TYPE = MODAL_TYPE.WIDE;
  currentUserCanManage: boolean;
  CP_PRIVILEGES_MAP = CP_PRIVILEGES_MAP;

  resetClubsModal$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  resetServiceModal$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  resetAthleticsModal$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  destroy$ = new Subject<null>();
  emitDestroy() {}

  constructor(
    private session: CPSession,
    public cpI18n: CPI18nService,
    public utils: TeamUtilsService
  ) {}

  servicesDefaultPermission() {
    if (this.servicesCount) {
      return this.servicesCount;
    }
    let selected;
    const school_level_privileges = this.schoolPrivileges;
    const service_privilege = school_level_privileges[CP_PRIVILEGES_MAP.services];

    if (!service_privilege) {
      selected = this.servicesMenu[0];
      Object.keys(this.accountPrivileges).forEach((store) => {
        if (this.accountPrivileges[store][CP_PRIVILEGES_MAP.services]) {
          selected = this.servicesMenu[1];
        }
      });
    } else if (service_privilege.r && service_privilege.w) {
      selected = this.servicesMenu[2];
    } else {
      selected = this.servicesMenu[1];
    }

    return selected;
  }

  clubsDefaultPermission() {
    if (this.clubsCount) {
      return this.clubsCount;
    }

    let selected;
    const school_level_privileges = this.schoolPrivileges;
    const club_privilege = school_level_privileges[CP_PRIVILEGES_MAP.clubs];

    if (!club_privilege) {
      selected = this.clubsMenu[0];
      Object.keys(this.accountPrivileges).forEach((store) => {
        if (this.accountPrivileges[store][CP_PRIVILEGES_MAP.clubs]) {
          selected = this.clubsMenu[1];
        }
      });
    } else if (club_privilege.r && club_privilege.w) {
      selected = this.clubsMenu[2];
    } else {
      selected = this.clubsMenu[1];
    }

    return selected;
  }

  athleticsDefaultPermission() {
    if (this.athleticsCount) {
      return this.athleticsCount;
    }

    let selected;
    const school_level_privileges = this.schoolPrivileges;
    const athletics_privilege = school_level_privileges[CP_PRIVILEGES_MAP.athletics];

    if (!athletics_privilege) {
      selected = this.athleticsMenu[0];
      Object.keys(this.accountPrivileges).forEach((store) => {
        if (this.accountPrivileges[store][CP_PRIVILEGES_MAP.athletics]) {
          selected = this.athleticsMenu[1];
        }
      });
    } else if (athletics_privilege.r && athletics_privilege.w) {
      selected = this.athleticsMenu[2];
    } else {
      selected = this.athleticsMenu[1];
    }

    return selected;
  }

  updateAthleticDropdownLabel() {
    const numberOfAthletics = this.utils.getNumberOf(
      CP_PRIVILEGES_MAP.athletics,
      this.accountPrivileges
    );

    if (this.schoolPrivileges[CP_PRIVILEGES_MAP.athletics]) {
      this.athleticsCount = { label: this.cpI18n.translate('admin_all_athletics') };
    } else if (numberOfAthletics) {
      this.athleticsCount = {
        label: `${numberOfAthletics} ${this.cpI18n.translate('admin_form_label_athletics')}`
      };
    } else {
      this.athleticsCount = { label: this.cpI18n.translate('admin_no_access') };
    }
  }

  onAthleticsModalSelected(athletics) {
    this.doAthleticsCleanUp();

    this.accountPrivileges = { ...this.accountPrivileges, ...athletics };

    this.updateAthleticDropdownLabel();
  }

  audienceDefaultPermission() {
    const allAccess = _get(this.schoolPrivileges, CP_PRIVILEGES_MAP.audience, false);

    return allAccess
      ? this.audienceMenu.filter((item) => item.action === audienceMenuStatus.allAccess)[0]
      : this.audienceMenu.filter((item) => item.action === audienceMenuStatus.noAccess)[0];
  }

  privacyPermission() {
    const privacyOff = _get(this.schoolPrivileges, CP_PRIVILEGES_MAP.contact_trace_pii, false);
    return privacyOff
      ? this.privacyOptions.filter((item) => item.action === PrivacyConfiguration.off)[0]
      : this.privacyOptions.filter((item) => item.action === PrivacyConfiguration.on)[0];
  }

  eventsDefaultPermission() {
    const school_level_privileges = this.schoolPrivileges;

    const eventPrivilege = school_level_privileges[CP_PRIVILEGES_MAP.events] || {
      r: false,
      w: false
    };

    const eventAssessmentPrivilege = school_level_privileges[
      CP_PRIVILEGES_MAP.event_attendance
    ] || { r: false, w: false };

    if (eventPrivilege.w && eventAssessmentPrivilege.w) {
      return this.eventsMenu.filter((item) => item.action === 3)[0];
    } else if (eventPrivilege.w) {
      return this.eventsMenu.filter((item) => item.action === 2)[0];
    }

    return this.eventsMenu.filter((item) => item.action === null)[0];
  }

  hasStorePrivileges() {
    const hasStorePrivileges = this.utils.hasStorePrivileges(
      this.schoolPrivileges,
      this.accountPrivileges
    );

    return hasStorePrivileges;
  }

  onManageAdminSelected(data) {
    if (data.action === manageAdminMenu.disabled) {
      if (CP_PRIVILEGES_MAP.manage_admin in this.schoolPrivileges) {
        delete this.schoolPrivileges[CP_PRIVILEGES_MAP.manage_admin];
      }

      Object.keys(this.accountPrivileges).forEach((storeId) => {
        if (!Object.keys(this.accountPrivileges[storeId]).length) {
          delete this.accountPrivileges[storeId];
        }
      });

      return;
    }

    if (data.action === manageAdminMenu.enabled) {
      this.schoolPrivileges = {
        ...this.schoolPrivileges,
        [CP_PRIVILEGES_MAP.manage_admin]: {
          r: true,
          w: true
        }
      };
    }
  }

  onServicesModalSelected(services) {
    this.doServicesCleanUp();

    this.accountPrivileges = { ...this.accountPrivileges, ...services };

    this.updateServiceDropdownLabel();
  }

  updateServiceDropdownLabel() {
    const numberOfServices = this.utils.getNumberOf(
      CP_PRIVILEGES_MAP.services,
      this.accountPrivileges
    );

    if (this.schoolPrivileges[CP_PRIVILEGES_MAP.services]) {
      this.servicesCount = { label: this.cpI18n.translate('admin_all_services') };
    } else if (numberOfServices) {
      this.servicesCount = {
        label: `${numberOfServices} ${this.cpI18n.translate('admin_form_label_services')}`
      };
    } else {
      this.servicesCount = { label: this.cpI18n.translate('admin_no_access') };
    }
  }

  onServicesSelected(service) {
    if (service.action === serviceMenu.selectServices) {
      this.isServiceModal = true;
      setTimeout(
        () => {
          $('#selectServicesModal').modal({ keyboard: true, focus: true });
        },

        1
      );

      return;
    }

    this.doServicesCleanUp();
    this.resetServiceModal$.next(true);

    if (service.action === serviceMenu.noAccess) {
      if (this.schoolPrivileges) {
        if (CP_PRIVILEGES_MAP.services in this.schoolPrivileges) {
          delete this.schoolPrivileges[CP_PRIVILEGES_MAP.services];
        }
      }

      return;
    }

    this.schoolPrivileges = {
      ...this.schoolPrivileges,
      [CP_PRIVILEGES_MAP.services]: {
        r: true,
        w: true
      }
    };
  }

  doServicesCleanUp() {
    for (const storeId in this.accountPrivileges) {
      if (this.utils.isService(this.accountPrivileges[storeId])) {
        delete this.accountPrivileges[storeId];
      }
    }

    if (CP_PRIVILEGES_MAP.services in this.schoolPrivileges) {
      delete this.schoolPrivileges[CP_PRIVILEGES_MAP.services];
    }
  }

  // clubs
  onClubsSelected(club) {
    if (club.action === clubMenu.selectClubs) {
      this.isClubsModal = true;
      setTimeout(
        () => {
          $('#selectClubsModal').modal({ keyboard: true, focus: true });
        },

        1
      );

      return;
    }

    if (club.action === clubMenu.noAccess) {
      this.doClubsCleanUp();
      this.resetClubsModal$.next(true);

      return;
    }

    if (club.action === clubMenu.allClubs) {
      this.doClubsCleanUp();
      this.resetClubsModal$.next(true);

      this.schoolPrivileges = {
        ...this.schoolPrivileges,
        [CP_PRIVILEGES_MAP.clubs]: {
          r: true,
          w: true
        }
      };
    }
  }

  doClubsCleanUp() {
    for (const storeId in this.accountPrivileges) {
      if (this.utils.isClub(this.accountPrivileges[storeId])) {
        delete this.accountPrivileges[storeId];
      }
    }

    if (CP_PRIVILEGES_MAP.clubs in this.schoolPrivileges) {
      delete this.schoolPrivileges[CP_PRIVILEGES_MAP.clubs];
    }
  }

  updateClubDropdownLabel() {
    const numberOfClubs = this.utils.getNumberOf(CP_PRIVILEGES_MAP.clubs, this.accountPrivileges);

    if (this.schoolPrivileges[CP_PRIVILEGES_MAP.clubs]) {
      this.clubsCount = { label: this.cpI18n.translate('admin_all_clubs') };
    } else if (numberOfClubs) {
      this.clubsCount = {
        label: `${numberOfClubs} ${this.cpI18n.translate('admin_form_label_clubs')}`
      };
    } else {
      this.clubsCount = { label: this.cpI18n.translate('admin_no_access') };
    }
  }

  onClubsModalSelected(clubs) {
    this.doClubsCleanUp();

    this.accountPrivileges = { ...this.accountPrivileges, ...clubs };

    this.updateClubDropdownLabel();
  }

  onAudienceSelected(audience) {
    if (audience.action === audienceMenuStatus.noAccess) {
      if (CP_PRIVILEGES_MAP.audience in this.schoolPrivileges) {
        delete this.schoolPrivileges[CP_PRIVILEGES_MAP.audience];
      }

      return;
    }

    if (audience.action === audienceMenuStatus.allAccess) {
      this.schoolPrivileges = {
        ...this.schoolPrivileges,
        [CP_PRIVILEGES_MAP.audience]: {
          r: true,
          w: true
        }
      };
    }
  }

  onContactTraceSelection(selectedActions) {
    if (selectedActions.indexOf(contactTraceMenu.manageQR) > -1) {
      this.schoolPrivileges = {
        ...this.schoolPrivileges,
        [CP_PRIVILEGES_MAP.contact_trace_qr]: {
          r: true,
          w: true
        }
      };
    } else {
      delete this.schoolPrivileges[CP_PRIVILEGES_MAP.contact_trace_qr];
    }

    if (selectedActions.indexOf(contactTraceMenu.manageForms) > -1) {
      this.schoolPrivileges = {
        ...this.schoolPrivileges,
        [CP_PRIVILEGES_MAP.contact_trace_forms]: {
          r: true,
          w: true
        }
      };
    } else {
      delete this.schoolPrivileges[CP_PRIVILEGES_MAP.contact_trace_forms];
    }

    if (selectedActions.indexOf(contactTraceMenu.manageCases) > -1) {
      this.schoolPrivileges = {
        ...this.schoolPrivileges,
        [CP_PRIVILEGES_MAP.contact_trace_cases]: {
          r: true,
          w: true
        }
      };
    } else {
      delete this.schoolPrivileges[CP_PRIVILEGES_MAP.contact_trace_cases];
    }

    if (selectedActions.indexOf(contactTraceMenu.manageNotifications) > -1) {
      this.schoolPrivileges = {
        ...this.schoolPrivileges,
        [CP_PRIVILEGES_MAP.contact_trace_exposure_notification]: {
          r: true,
          w: true
        }
      };
    } else {
      delete this.schoolPrivileges[CP_PRIVILEGES_MAP.contact_trace_exposure_notification];
    }

    if (selectedActions.indexOf(contactTraceMenu.manageDashboard) > -1) {
      this.schoolPrivileges = {
        ...this.schoolPrivileges,
        [CP_PRIVILEGES_MAP.contact_trace_health_dashboard]: {
          r: true,
          w: false
        }
      };
    } else {
      delete this.schoolPrivileges[CP_PRIVILEGES_MAP.contact_trace_health_dashboard];
    }

    return;
  }

  onPrivacyToggle(privacyOption) {
    if (privacyConfigurationOn(this.session.g)) {
      return;
    }
    if (privacyOption.action === PrivacyConfiguration.off) {
      this.schoolPrivileges = {
        ...this.schoolPrivileges,
        [CP_PRIVILEGES_MAP.contact_trace_pii]: {
          r: true,
          w: true
        }
      };
    } else if (privacyOption.action === PrivacyConfiguration.on) {
      delete this.schoolPrivileges[CP_PRIVILEGES_MAP.contact_trace_pii];
    }
  }

  onAthleticsSelected(athletic) {
    if (athletic.action === athleticMenu.selectAthletic) {
      this.isAthleticsModal = true;
      setTimeout(
        () => {
          $('#selectAthleticsModal').modal({ keyboard: true, focus: true });
        },

        1
      );

      return;
    }

    if (athletic.action === athleticMenu.noAccess) {
      this.doAthleticsCleanUp();
      this.resetAthleticsModal$.next(true);

      return;
    }

    if (athletic.action === athleticMenu.allAthletics) {
      this.doAthleticsCleanUp();
      this.resetAthleticsModal$.next(true);

      this.schoolPrivileges = {
        ...this.schoolPrivileges,
        [CP_PRIVILEGES_MAP.athletics]: {
          r: true,
          w: true
        }
      };
    }
  }

  doAthleticsCleanUp() {
    for (const storeId in this.accountPrivileges) {
      if (this.utils.isAthletic(this.accountPrivileges[storeId])) {
        delete this.accountPrivileges[storeId];
      }
    }

    if (CP_PRIVILEGES_MAP.athletics in this.schoolPrivileges) {
      delete this.schoolPrivileges[CP_PRIVILEGES_MAP.athletics];
    }
  }

  onEventsSelected(event) {
    if (event.action === eventMenu.noAccess) {
      if (CP_PRIVILEGES_MAP.events in this.schoolPrivileges) {
        delete this.schoolPrivileges[CP_PRIVILEGES_MAP.events];
      }
      if (CP_PRIVILEGES_MAP.event_attendance in this.schoolPrivileges) {
        delete this.schoolPrivileges[CP_PRIVILEGES_MAP.event_attendance];
      }

      return;
    }

    if (event.action === eventMenu.manageEvents) {
      if (CP_PRIVILEGES_MAP.event_attendance in this.schoolPrivileges) {
        delete this.schoolPrivileges[CP_PRIVILEGES_MAP.event_attendance];
      }

      this.schoolPrivileges = {
        ...this.schoolPrivileges,
        [CP_PRIVILEGES_MAP.events]: {
          r: true,
          w: true
        }
      };
    }

    if (event.action === eventMenu.manageEventsAndAssess) {
      this.schoolPrivileges = {
        ...this.schoolPrivileges,
        [CP_PRIVILEGES_MAP.events]: {
          r: true,
          w: true
        },

        [CP_PRIVILEGES_MAP.event_attendance]: {
          r: true,
          w: true
        }
      };
    }
  }

  checkControl(isChecked, privilegeNo, privilegeExtraData): void {
    if (!isChecked) {
      Object.keys(this.accountPrivileges).forEach((storeId) => {
        if (!Object.keys(this.accountPrivileges[storeId]).length) {
          delete this.accountPrivileges[storeId];
        }
      });
    }

    if (!isChecked && privilegeExtraData.disables) {
      this.disableDependencies(privilegeExtraData.disables);
    }

    if (this.schoolPrivileges && this.schoolPrivileges[privilegeNo]) {
      delete this.schoolPrivileges[privilegeNo];
      this.handleDependencies(privilegeNo, privilegeExtraData.deps);

      return;
    }
    const privilege = this.user.school_level_privileges[this.schoolId][privilegeNo];

    this.schoolPrivileges = {
      ...this.schoolPrivileges,
      [privilegeNo]: {
        r: privilege.r,
        w: privilege.w
      }
    };

    this.handleDependencies(privilegeNo, privilegeExtraData.deps);
  }

  disableDependencies(deps: Array<number>) {
    deps.forEach((dep) => {
      if (this.schoolPrivileges && this.schoolPrivileges[dep]) {
        this.checkControl(undefined, dep, { deps: [] });
      }
    });
  }

  handleDependencies(privilegeNo, dependencies: Array<number>) {
    if (!dependencies.length) {
      return;
    }

    dependencies.forEach((dep) => {
      if (this.schoolPrivileges[dep]) {
        return;
      }

      if (this.schoolPrivileges[privilegeNo]) {
        this.checkControl(undefined, dep, { deps: [] });
      }
    });
  }

  updateServicesDropdownLabel() {
    const numberOfServices = this.utils.getNumberOf(
      CP_PRIVILEGES_MAP.services,
      this.accountPrivileges
    );

    this.servicesCount = numberOfServices ? { label: `${numberOfServices} Service(s)` } : null;
  }

  updateClubsDropdownLabel() {
    const numberOfClubs = this.utils.getNumberOf(CP_PRIVILEGES_MAP.clubs, this.accountPrivileges);

    this.clubsCount = numberOfClubs ? { label: `${numberOfClubs} Club(s)` } : null;
  }

  updateAthleticsDropdownLabel() {
    const numberOfAthletics = this.utils.getNumberOf(
      CP_PRIVILEGES_MAP.athletics,
      this.accountPrivileges
    );

    this.athleticsCount = numberOfAthletics ? { label: `${numberOfAthletics} Athletic(s)` } : null;
  }

  onSubmit() {
    this.formError = null;
    this.isFormError = false;

    if (this.form.invalid) {
      this.preventSubmit$.next(false);

      this.isFormError = true;
      this.formError = this.cpI18n.translate('all_fields_are_required');

      return;
    }

    let _data: any = {
      school_level_privileges: {
        [this.schoolId]: {
          ...this.schoolPrivileges
        }
      },
      account_level_privileges: {
        ...this.accountPrivileges
      }
    };

    const emptyAccountPrivileges = isEmpty(_data.account_level_privileges);
    const emptySchoolPrivileges = isEmpty(_data.school_level_privileges[this.schoolId]);

    if (emptyAccountPrivileges && emptySchoolPrivileges) {
      this.isFormError = true;
      this.formError = this.cpI18n.translate('admins_error_no_access_granted');

      this.preventSubmit$.next(false);

      return;
    }

    if (!this.isEdit) {
      _data = {
        ..._data,
        ...this.form.value
      };
    }

    if (this.isCurrentUser) {
      const { firstname, lastname } = this.form.value;

      _data = { firstname, lastname };
    }

    this.formSubmitted.emit(_data);
  }

  ngOnInit() {
    if (this.isEdit) {
      this.preventSubmit$.next(false);
    }
    const session = this.session.g;
    this.user = this.session.g.get('user');
    this.schoolId = this.session.g.get('school').id;
    const { contact_trace_feature_level } = this.session.g.get('school');
    this.isContactTraceEnabled = contact_trace_feature_level !== ContactTraceFeatureLevel.Disabled;

    const schoolPrivileges = this.user.school_level_privileges[this.schoolId] || {};

    this.currentUserCanManage =
      CP_PRIVILEGES_MAP.manage_admin in schoolPrivileges
        ? schoolPrivileges[CP_PRIVILEGES_MAP.manage_admin].w
        : false;

    this.canReadClubs =
      canSchoolReadResource(session, CP_PRIVILEGES_MAP.clubs) ||
      canAccountLevelReadResource(session, CP_PRIVILEGES_MAP.clubs);

    this.canReadAthletics =
      canSchoolReadResource(session, CP_PRIVILEGES_MAP.athletics) ||
      canAccountLevelReadResource(session, CP_PRIVILEGES_MAP.athletics);

    this.canReadServices =
      canSchoolReadResource(session, CP_PRIVILEGES_MAP.services) ||
      canAccountLevelReadResource(session, CP_PRIVILEGES_MAP.services);

    this.canReadEvents = schoolPrivileges[CP_PRIVILEGES_MAP.events] || false;

    this.canReadAudience = schoolPrivileges[CP_PRIVILEGES_MAP.audience] || false;

    this.canReadContactTrace =
      schoolPrivileges[CP_PRIVILEGES_MAP.contact_trace_qr] ||
      schoolPrivileges[CP_PRIVILEGES_MAP.contact_trace_forms] ||
      schoolPrivileges[CP_PRIVILEGES_MAP.contact_trace_cases] ||
      schoolPrivileges[CP_PRIVILEGES_MAP.contact_trace_exposure_notification] ||
      schoolPrivileges[CP_PRIVILEGES_MAP.contact_trace_health_dashboard] ||
      false;
    this.canEditPrivacyPermission = !!schoolPrivileges[CP_PRIVILEGES_MAP.contact_trace_pii];
    this.formData = TEAM_ACCESS.getMenu(this.user.school_level_privileges[this.schoolId]);

    const clubsPrivilegeSchool = schoolPrivileges[CP_PRIVILEGES_MAP.clubs];

    const clubsPrivilegeAccount = canAccountLevelReadResource(session, CP_PRIVILEGES_MAP.clubs);

    const athleticsPrivilegeSchool = schoolPrivileges[CP_PRIVILEGES_MAP.athletics];

    const athleticsPrivilegeAccount = canAccountLevelReadResource(
      session,
      CP_PRIVILEGES_MAP.athletics
    );

    const eventsPrivilege = schoolPrivileges[CP_PRIVILEGES_MAP.events];

    const servicesPrivilegeSchool = schoolPrivileges[CP_PRIVILEGES_MAP.services];

    const servicesPrivilegeAccount = canAccountLevelReadResource(
      session,
      CP_PRIVILEGES_MAP.services
    );

    const manageAdminPrivilege = schoolPrivileges[CP_PRIVILEGES_MAP.manage_admin];
    const eventsAssessmentPrivilege = schoolPrivileges[CP_PRIVILEGES_MAP.event_attendance];

    this.audienceMenu = this.utils.audienceDropdown(schoolPrivileges[CP_PRIVILEGES_MAP.audience]);
    this.contactTraceMenu = this.utils.contactTraceDropdown(
      schoolPrivileges[CP_PRIVILEGES_MAP.contact_trace_qr],
      schoolPrivileges[CP_PRIVILEGES_MAP.contact_trace_forms],
      schoolPrivileges[CP_PRIVILEGES_MAP.contact_trace_cases],
      schoolPrivileges[CP_PRIVILEGES_MAP.contact_trace_exposure_notification],
      schoolPrivileges[CP_PRIVILEGES_MAP.contact_trace_health_dashboard],
      this.schoolPrivileges[CP_PRIVILEGES_MAP.contact_trace_qr],
      this.schoolPrivileges[CP_PRIVILEGES_MAP.contact_trace_forms],
      this.schoolPrivileges[CP_PRIVILEGES_MAP.contact_trace_cases],
      this.schoolPrivileges[CP_PRIVILEGES_MAP.contact_trace_exposure_notification],
      this.schoolPrivileges[CP_PRIVILEGES_MAP.contact_trace_health_dashboard]
    );

    this.manageAdmins = this.utils.manageAdminDropdown(manageAdminPrivilege);
    this.clubsMenu = this.utils.clubsDropdown(clubsPrivilegeSchool, clubsPrivilegeAccount);
    this.athleticsMenu = this.utils.athleticsDropdown(
      athleticsPrivilegeSchool,
      athleticsPrivilegeAccount
    );
    this.eventsMenu = this.utils.eventsDropdown(eventsPrivilege, eventsAssessmentPrivilege);
    this.servicesMenu = this.utils.servicesDropdown(
      servicesPrivilegeSchool,
      servicesPrivilegeAccount
    );
    this.privacyOptions = this.utils.privacyDropdown();

    if (!this.schoolPrivileges[CP_PRIVILEGES_MAP.services]) {
      this.updateServicesDropdownLabel();
    }

    if (!this.schoolPrivileges[CP_PRIVILEGES_MAP.clubs]) {
      this.updateClubsDropdownLabel();
    }

    if (!this.schoolPrivileges[CP_PRIVILEGES_MAP.athletics]) {
      this.updateAthleticsDropdownLabel();
    }

    this.form.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.preventSubmit$.next(!this.form.valid);
    });
  }

  ngOnDestroy() {
    this.emitDestroy();
  }
}
