import { Component, OnInit, Output, EventEmitter, OnDestroy, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';

import * as fromStore from '../store';
import { IItem } from '@campus-cloud/shared/components';
import { CPI18nService } from '@campus-cloud/shared/services';
import { LocationsUtilsService } from '@campus-cloud/libs/locations/common/utils';
import {
  ICategory,
  categoryTypes,
  CategoryModel
} from '@campus-cloud/libs/locations/common/categories/model';

@Component({
  selector: 'cp-categories-edit',
  templateUrl: './categories-edit.component.html',
  styleUrls: ['./categories-edit.component.scss']
})
export class CategoriesEditComponent implements OnInit, OnDestroy {
  @Input() category: ICategory;

  @Output() teardown: EventEmitter<null> = new EventEmitter();

  formError;
  form: FormGroup;
  selectedCategory;
  categoryTypes: IItem[];
  categoryIcons = CategoryModel.categoryIcons();

  private destroy$ = new Subject();

  constructor(
    public cpI18n: CPI18nService,
    private locationUtils: LocationsUtilsService,
    public store: Store<fromStore.ICategoriesState>
  ) {}

  resetModal() {
    this.form.reset();
    this.teardown.emit();
  }

  doSubmit() {
    this.formError = false;

    if (!this.form.valid) {
      this.formError = true;

      return;
    }

    const body = this.form.value;

    const payload = {
      body,
      categoryId: this.category.id
    };

    this.store.dispatch(new fromStore.EditCategory(payload));

    this.resetModal();
  }

  loadCategoryTypes() {
    this.categoryTypes = this.locationUtils
      .getLocationTypes()
      .filter((l: IItem) => l.action !== categoryTypes.dining);

    this.selectedCategory = this.categoryTypes.find(
      (c) => c.action === this.category.category_type_id
    );
  }

  ngOnInit(): void {
    this.loadCategoryTypes();
    this.form = CategoryModel.form(this.category);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
