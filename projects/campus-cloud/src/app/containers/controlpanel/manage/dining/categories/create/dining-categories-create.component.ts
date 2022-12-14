import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';

import * as fromStore from '../store';
import { IItem } from '@campus-cloud/shared/components';
import { Destroyable, Mixin } from '@campus-cloud/shared/mixins';
import { LocationsUtilsService } from '@campus-cloud/libs/locations/common/utils';
import { CPI18nService, IModal, MODAL_DATA } from '@campus-cloud/shared/services';
import { categoryTypes, CategoryModel } from '@campus-cloud/libs/locations/common/categories/model';

@Component({
  selector: 'cp-dining-categories-create',
  templateUrl: './dining-categories-create.component.html',
  styleUrls: ['./dining-categories-create.component.scss']
})
@Mixin([Destroyable])
export class DiningCategoriesCreateComponent implements OnInit, OnDestroy {
  formError;
  form: FormGroup = CategoryModel.form();
  categoryIcons = CategoryModel.diningCategoryIcons();
  categoryTypes: IItem[] = this.locationUtils
    .getLocationTypes()
    .filter((l: IItem) => l.action === categoryTypes.dining);

  destroy$ = new Subject<null>();
  emitDestroy() {}

  constructor(
    @Inject(MODAL_DATA) private modal: IModal,
    public cpI18n: CPI18nService,
    private locationUtils: LocationsUtilsService,
    public store: Store<fromStore.ICategoriesState>
  ) {}

  resetModal() {
    this.modal.onClose();
  }

  doSubmit() {
    this.formError = false;

    if (this.form.invalid) {
      this.formError = true;

      return;
    }

    const body = this.form.value;

    const payload = {
      body
    };

    this.store.dispatch(new fromStore.PostCategory(payload));

    this.resetModal();
  }

  ngOnInit(): void {
    this.form.get('category_type_id').setValue(categoryTypes.dining);
  }

  ngOnDestroy() {
    this.emitDestroy();
  }
}
