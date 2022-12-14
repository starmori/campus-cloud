import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { IDeal } from '../../deals.interface';
import { IStore } from '../../stores/store.interface';
import { CPI18nService } from '@campus-cloud/shared/services';
import { Destroyable, Mixin } from '@campus-cloud/shared/mixins';
import { DealsAmplitudeService } from '@controlpanel/manage/deals/deals.amplitude.service';

@Mixin([Destroyable])
@Component({
  selector: 'cp-store-card',
  templateUrl: './store-card.component.html',
  styleUrls: ['./store-card.component.scss']
})
export class StoreCardComponent implements OnInit, OnDestroy {
  @Input() form: FormGroup;
  @Input() storeForm: FormGroup;

  @Output() isNewStore: EventEmitter<boolean> = new EventEmitter();
  @Output()
  formData: EventEmitter<{
    deal: IDeal;
    dealFormValid: boolean;
    store: IStore;
    storeFormValid: boolean;
  }> = new EventEmitter();

  newStoreTitle;
  existingStoreTitle;

  destroy$ = new Subject<null>();
  emitDestroy() {}

  constructor(public cpI18n: CPI18nService, private amplitude: DealsAmplitudeService) {}

  onTabClick({ id }) {
    if (id === 'existing') {
      this.setRequiredField(false);
      this.isStoreRequired(true);
      this.isNewStore.emit(false);
    }

    if (id === 'new') {
      this.setRequiredField(true);
      this.isStoreRequired(false);
      this.isNewStore.emit(true);

      this.amplitude.amplitudeStoreClickedItem();
    }
  }

  isStoreRequired(value) {
    const store_id = this.form.controls['store_id'].value;
    this.form.setControl('store_id', new FormControl(store_id, value ? Validators.required : null));
  }

  setRequiredField(value) {
    const name = this.storeForm.controls['name'].value;
    const logo = this.storeForm.controls['logo_url'].value;
    this.storeForm.setControl(
      'name',
      new FormControl(name, value ? [Validators.required, Validators.maxLength(120)] : null)
    );

    this.storeForm.setControl(
      'logo_url',
      new FormControl(logo, value ? Validators.required : null)
    );
  }

  ngOnInit() {
    this.newStoreTitle = this.cpI18n.translate('t_deals_form_tab_new_store');
    this.existingStoreTitle = this.cpI18n.translate('t_deals_form_tab_existing_store');

    this.storeForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.formData.emit({
        deal: this.form.value,
        dealFormValid: this.form.valid,
        store: this.storeForm.value,
        storeFormValid: this.storeForm.valid
      });
    });
  }

  ngOnDestroy() {
    this.emitDestroy();
  }
}
