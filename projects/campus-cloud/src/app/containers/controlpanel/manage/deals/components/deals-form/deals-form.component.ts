import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { IDeal } from '../../deals.interface';
import { DateStatus } from '../../deals.service';
import { CPSession } from '@campus-cloud/session';
import { CPDate } from '@campus-cloud/shared/utils';
import { IStore } from '../../stores/store.interface';
import { CPI18nService } from '@campus-cloud/shared/services';
import { Destroyable, Mixin } from '@campus-cloud/shared/mixins';

const COMMON_DATE_PICKER_OPTIONS = {
  enableTime: true
};

@Mixin([Destroyable])
@Component({
  selector: 'cp-deals-form',
  templateUrl: './deals-form.component.html',
  styleUrls: ['./deals-form.component.scss']
})
export class DealsFormComponent implements OnInit, OnDestroy {
  @Input() form: FormGroup;
  @Input() storeForm: FormGroup;

  @Output()
  formData: EventEmitter<{
    deal: IDeal;
    dealFormValid: boolean;
    store: IStore;
    storeFormValid: boolean;
  }> = new EventEmitter();

  @Output() addedImage: EventEmitter<null> = new EventEmitter();

  postingStartDatePickerOptions;
  postingEndDatePickerOptions;
  expiration: number;

  destroy$ = new Subject<null>();
  emitDestroy() {}

  constructor(public session: CPSession, public cpI18n: CPI18nService) {}

  onUploadedImage(image) {
    this.addedImage.emit();
    this.form.controls['image_url'].setValue(image);
    this.form.controls['image_thumb_url'].setValue(image);
  }

  toggleOngoing(): void {
    this.form.controls['ongoing'].setValue(!this.form.controls['ongoing'].value);
    if (this.form.controls['ongoing'].value) {
      this.expiration = this.form.controls['expiration'].value;
      this.form.controls['expiration'].setValue(DateStatus.forever);
    } else {
      this.form.controls['expiration'].setValue(this.expiration);
      this.postingEndDatePickerOptions.defaultDate =
        this.expiration > 0
          ? CPDate.fromEpochLocal(this.expiration, this.session.tz).format()
          : null;
    }
  }

  setPostingStart(date) {
    this.form.controls['start'].setValue(CPDate.toEpoch(date, this.session.tz));
  }

  setPostingEnd(date) {
    this.form.controls['expiration'].setValue(CPDate.toEpoch(date, this.session.tz));
  }

  ngOnInit() {
    this.form.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.formData.emit({
        deal: this.form.value,
        dealFormValid: this.form.valid,
        store: this.storeForm.value,
        storeFormValid: this.storeForm.valid
      });
    });

    const _self = this;
    const posting_start = this.form.controls['start'].value;
    const posting_end = this.form.controls['expiration'].value;

    this.postingStartDatePickerOptions = {
      ...COMMON_DATE_PICKER_OPTIONS,
      defaultDate: posting_start
        ? CPDate.fromEpochLocal(posting_start, _self.session.tz).format()
        : null
    };

    this.postingEndDatePickerOptions = {
      ...COMMON_DATE_PICKER_OPTIONS,
      defaultDate: posting_end
        ? CPDate.fromEpochLocal(posting_end, _self.session.tz).format()
        : null
    };
  }

  ngOnDestroy() {
    this.emitDestroy();
  }
}
