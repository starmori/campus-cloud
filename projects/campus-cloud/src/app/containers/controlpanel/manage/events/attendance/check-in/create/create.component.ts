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
import { EventsService } from '../../../events.service';
import { CheckInUtilsService } from '../check-in.utils.service';
import { EventUtilService } from '../../../events.utils.service';
import { CPI18nService } from '@campus-cloud/shared/services';
import IServiceProvider from '../../../../services/providers.interface';
import { CPSession } from '@campus-cloud/session';
import { privacyConfigurationOn } from '@campus-cloud/shared/utils';

@Component({
  selector: 'cp-create-check-in',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CheckInCreateComponent implements OnInit {
  @Input() orientationId: number;
  @Input() data: IEvent | IServiceProvider;

  @Output() teardown: EventEmitter<null> = new EventEmitter();
  @Output() created: EventEmitter<ICheckIn> = new EventEmitter();

  form;
  formErrors;
  buttonData;
  errorMessage;
  private isPrivacyOn: boolean;

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
    $('#addCheckInModal').modal('hide');
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

    const eventCheckin$ = this.service.addCheckIn(this.form.value, search);
    const orientationCheckin$ = this.service.addOrientationCheckIn(this.form.value, search);

    const request$ = this.orientationId ? orientationCheckin$ : eventCheckin$;

    request$.subscribe(
      (res: any) => {
        const duplicateUser = !res.attendance_id;

        if (duplicateUser) {
          this.formErrors = true;
          this.enableSaveButton();
          this.errorMessage = this.cpI18n.translate('t_event_check_in_attendee_already_exist');

          return;
        }

        this.created.emit(this.form.value);
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

  ngOnInit() {
    this.isPrivacyOn = privacyConfigurationOn(this.session.g);
    this.form = this.checkInUtils.getCheckInForm(null, this.data, this.isPrivacyOn);

    this.buttonData = {
      class: 'primary',
      text: this.cpI18n.translate('save')
    };
  }
}
