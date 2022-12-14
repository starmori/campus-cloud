import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { Destroyable, Mixin } from '@campus-cloud/shared/mixins';
import { CPI18nService, MODAL_DATA, IModal } from '@campus-cloud/shared/services';

@Mixin([Destroyable])
@Component({
  selector: 'cp-audience-save-modal',
  templateUrl: './audience-save-modal.component.html',
  styleUrls: ['./audience-save-modal.component.scss']
})
export class AudienceSaveModalComponent implements OnInit, OnDestroy {
  buttonData;
  form: FormGroup;

  destroy$ = new Subject<null>();
  emitDestroy() {}

  constructor(
    public fb: FormBuilder,
    public cpI18n: CPI18nService,
    @Inject(MODAL_DATA) private modal: IModal
  ) {}

  resetModal() {
    this.form.reset();
    this.modal.onClose();
  }

  doSubmit() {
    this.modal.onAction(this.form.value);
    this.form.reset();
  }

  ngOnInit(): void {
    this.buttonData = {
      class: 'primary',
      disabled: true,
      text: this.cpI18n.translate('t_audience_save_modal_button_submit')
    };

    this.form = this.fb.group({
      name: [null, Validators.required]
    });

    this.form.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.buttonData = { ...this.buttonData, disabled: !this.form.valid };
    });
  }

  ngOnDestroy() {
    this.emitDestroy();
  }
}
