import { AnnouncementsConfirmComponent } from './../confirm/announcements-confirm.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { OverlayRef } from '@angular/cdk/overlay';
import { FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';

import { CPSession } from '@campus-cloud/session';
import { FORMAT } from '@campus-cloud/shared/pipes';
import { AnnouncementRecipientPipe } from './../pipes';
import { Announcement, IAnnouncement } from './../model';
import { LayoutWidth } from '@campus-cloud/layouts/interfaces';
import { AnnouncementsService } from './../announcements.service';
import { notifyAtEpochNow, AnnouncementPriority } from './../model/announcement.interface';
import { AnnouncementUtilsService } from './../announcement.utils.service';
import { CPI18nService, ModalService } from '@campus-cloud/shared/services';
import { AnnouncementCreateErrorComponent } from './../create-error/create-error.component';
import { ISnackbar, baseActionClass, IHeader, baseActions } from '@campus-cloud/store/base';

@Component({
  selector: 'cp-scheduled-edit',
  templateUrl: './scheduled-edit.component.html',
  styleUrls: ['./scheduled-edit.component.scss']
})
export class ScheduledEditComponent implements OnInit {
  form: FormGroup;
  modal: OverlayRef;
  listName: string;
  width = LayoutWidth.third;
  dateTimeFormat = FORMAT.DATETIME;

  state = {
    loading: false
  };

  constructor(
    private router: Router,
    private session: CPSession,
    private route: ActivatedRoute,
    private cpI18n: CPI18nService,
    private modalService: ModalService,
    private service: AnnouncementsService,
    private store: Store<ISnackbar | IHeader>,
    private recipientNamePipe: AnnouncementRecipientPipe
  ) {}

  ngOnInit() {
    this.fetch();
    this.buildHeader();
  }

  onSchedule(scheduledAt: number) {
    this.form.get('notify_at_epoch').setValue(scheduledAt);
  }

  onCancel() {
    this.router.navigate(['/notify/scheduled']);
  }

  onSendNow() {
    this.form.get('notify_at_epoch').setValue(notifyAtEpochNow);
    this.onSubmit();
  }

  onValidationTearDown() {
    this.modalService.close(this.modal);
    this.modal = null;
  }

  onTeardownConfirm() {
    this.modalService.close(this.modal);
    this.modal = null;
  }

  onConfirmed() {
    this.modalService.close(this.modal);
    this.modal = null;
    this.onSubmit(true);
  }

  onSubmit(hasConfirmed = false) {
    const isScheduled = AnnouncementUtilsService.isScheduledAnnouncement(this.form.value);
    const isNotifyAtTimestampInThePast =
      isScheduled &&
      AnnouncementUtilsService.isNotifyAtTimestampInThePast(this.form.value.notify_at_epoch);
    const isWithinFiveMinutes =
      isScheduled && AnnouncementUtilsService.withinFiveMinute(this.form.value);

    if (isNotifyAtTimestampInThePast && !isWithinFiveMinutes) {
      this.modal = this.modalService.open(
        AnnouncementCreateErrorComponent,
        {},
        {
          onAction: this.onSendNow.bind(this),
          onClose: this.onValidationTearDown.bind(this)
        }
      );
      return;
    }

    const priority = this.form.get('priority').value;
    const isCampusWide = this.form.get('is_school_wide').value;
    const shouldConfirm =
      priority === AnnouncementPriority.emergency ||
      priority === AnnouncementPriority.urgent ||
      isCampusWide;
    if (shouldConfirm && !hasConfirmed) {
      this.modal = this.modalService.open(
        AnnouncementsConfirmComponent,
        {},
        {
          data: this.state,
          onAction: this.onConfirmed.bind(this),
          onClose: this.onTeardownConfirm.bind(this)
        }
      );
      return;
    }

    const { id } = this.session.school;
    const { announcementId } = this.route.snapshot.params;
    const search = new HttpParams().set('school_id', id.toString());

    const { store_id, subject, message, notify_at_epoch } = this.form.value;

    const notifyAtEpoch = isWithinFiveMinutes ? notifyAtEpochNow : notify_at_epoch;

    const editableFields = {
      subject,
      message,
      store_id,
      priority,
      notify_at_epoch: notifyAtEpoch
    };

    this.service.updateAnnouncement(search, announcementId, editableFields).subscribe(
      () => {
        this.store.dispatch(
          new baseActionClass.SnackbarSuccess({
            body: this.cpI18n.translate('t_shared_successful')
          })
        );
        this.router.navigate(['/notify/scheduled']);
      },
      () => this.erroHandler()
    );
  }

  buildHeader() {
    this.store.dispatch({
      type: baseActions.HEADER_UPDATE,
      payload: {
        heading: 't_notify_edit_announcement',
        subheading: null,
        em: null,
        crumbs: {
          url: null,
          label: null
        },
        children: []
      }
    });
  }

  fetch() {
    this.state = {
      ...this.state,
      loading: true
    };
    const { id } = this.session.school;
    const { announcementId } = this.route.snapshot.params;
    const search = new HttpParams().set('school_id', id.toString());

    this.service.getAnnouncementById(search, announcementId).subscribe(
      (r: IAnnouncement) => this.handleSucess(r),
      () => {
        this.store.dispatch(
          new baseActionClass.SnackbarError({ body: this.cpI18n.translate('something_went_wrong') })
        );
        this.router.navigate(['/notify/scheduled']);
      }
    );
  }

  handleSucess(data: IAnnouncement) {
    this.form = Announcement.form(data);
    this.listName = this.recipientNamePipe.transform(data);

    this.state = {
      ...this.state,
      loading: false
    };
  }

  erroHandler() {
    this.state = {
      ...this.state,
      loading: false
    };
    this.store.dispatch(
      new baseActionClass.SnackbarError({
        body: this.cpI18n.translate('something_went_wrong')
      })
    );
  }
}
