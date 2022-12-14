import {
  Input,
  OnInit,
  Output,
  Component,
  ElementRef,
  EventEmitter,
  HostListener
} from '@angular/core';

import { HttpParams } from '@angular/common/http';

import IEvent from '../../../event.interface';
import { ICheckIn } from '../check-in.interface';
import { CheckInOut } from '../../../event.status';
import { EventsService } from '../../../events.service';
import { CheckInUtilsService } from '../check-in.utils.service';
import IServiceProvider from '../../../../services/providers.interface';
import { CPSession } from '@campus-cloud/session';
import { CPI18nService } from '@campus-cloud/shared/services';
import { EventUtilService } from '@controlpanel/manage/events/events.utils.service';
import { privacyConfigurationOn } from '@campus-cloud/shared/utils';

@Component({
  selector: 'cp-edit-check-in',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class CheckInEditComponent implements OnInit {
  @Input() checkIn: ICheckIn;
  @Input() orientationId: number;
  @Input() data: IEvent | IServiceProvider;

  @Output() teardown: EventEmitter<null> = new EventEmitter();
  @Output() edited: EventEmitter<{ checkIn: string; checkOut: string }> = new EventEmitter();

  form;
  formErrors;
  buttonData;
  errorMessage;
  checkedIn = CheckInOut.no;
  checkedOut = CheckInOut.no;
  isPrivacyOn: boolean;

  constructor(
    public el: ElementRef,
    public session: CPSession,
    public cpI18n: CPI18nService,
    public service: EventsService,
    public utils: EventUtilService,
    public checkInUtils: CheckInUtilsService
  ) {}

  @HostListener('document:click', ['$event'])
  onClick(event) {
    // out of modal reset form
    if (event.target.contains(this.el.nativeElement)) {
      this.resetModal();
    }
  }

  resetModal() {
    this.form.reset();
    this.teardown.emit();
    $('#editCheckInModal').modal('hide');
  }

  onSubmit() {
    this.formErrors = false;
    this.form.controls['check_out_time_epoch'].setErrors(null);

    if (!this.form.valid) {
      this.formErrors = true;
      this.enableSaveButton();

      return;
    }

    const checkInTime = this.form.controls['check_in_time'].value;
    const checkOutTime = this.form.controls['check_out_time_epoch'].value;

    const checkoutTimeBeforeCheckinTime = this.checkInUtils.checkoutTimeBeforeCheckinTime(
      checkInTime,
      checkOutTime,
      this.data.has_checkout
    );

    if (checkoutTimeBeforeCheckinTime) {
      this.formErrors = true;
      this.enableSaveButton();

      this.form.controls['check_out_time_epoch'].setErrors({ required: true });

      this.errorMessage = this.cpI18n.translate(
        't_events_attendance_add_check_in_error_check_out_time_after_check_in'
      );

      return;
    }

    let search = new HttpParams();

    if (this.orientationId) {
      search = search
        .append('school_id', this.session.g.get('school').id)
        .append('calendar_id', this.orientationId.toString());
    }

    const eventCheckin$ = this.service.updateCheckIn(this.form.value, this.checkIn.id, search);
    const orientationCheckin$ = this.service.updateOrientationCheckIn(
      this.form.value,
      this.checkIn.id,
      search
    );

    const request$ = this.orientationId ? orientationCheckin$ : eventCheckin$;

    request$.subscribe(
      () => {
        this.edited.emit({ checkIn: this.checkedIn, checkOut: this.checkedOut });
        this.resetModal();
      },
      (_) => {
        this.formErrors = true;
        this.enableSaveButton();
        this.errorMessage = this.cpI18n.translate('something_went_wrong');
      }
    );
  }

  enableSaveButton() {
    this.buttonData = {
      ...this.buttonData,
      disabled: false
    };
  }

  onValueChanges() {
    this.form.controls['check_in_time'].valueChanges.subscribe((_) => {
      this.checkedIn = CheckInOut.yes;
    });

    this.form.controls['check_out_time_epoch'].valueChanges.subscribe((_) => {
      this.checkedOut = CheckInOut.yes;
    });
  }

  ngOnInit() {
    this.isPrivacyOn = privacyConfigurationOn(this.session.g);
    this.form = this.checkInUtils.getCheckInForm(this.checkIn, this.data, this.isPrivacyOn);
    this.onValueChanges();

    this.buttonData = {
      class: 'primary',
      text: this.cpI18n.translate('save')
    };
  }
}
