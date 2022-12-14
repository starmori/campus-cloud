import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';

import * as fromStore from '../store';
import { MODAL_DATA } from '@campus-cloud/shared/services';
import { fillForm } from '@campus-cloud/shared/utils/tests';
import { CPI18nService } from '@campus-cloud/shared/services';
import { configureTestSuite } from '@campus-cloud/shared/tests';
import { SharedModule } from '@campus-cloud/shared/shared.module';
import { LocationsUtilsService } from '@campus-cloud/libs/locations/common/utils';
import { LocationsTimeLabelPipe } from '@campus-cloud/libs/locations/common/pipes';
import { categoryTypes } from '@campus-cloud/libs/locations/common/categories/model';
import { DiningCategoriesCreateComponent } from './dining-categories-create.component';
import {
  emptyForm,
  filledForm,
  MockModalData
} from '@campus-cloud/libs/locations/common/categories/tests';

describe('DiningCategoriesCreateComponent', () => {
  configureTestSuite();

  beforeAll((done) =>
    (async () => {
      TestBed.configureTestingModule({
        imports: [SharedModule],
        providers: [
          CPI18nService,
          provideMockStore(),
          LocationsUtilsService,
          LocationsTimeLabelPipe,
          { provide: MODAL_DATA, useClass: MockModalData }
        ],
        declarations: [DiningCategoriesCreateComponent],
        schemas: [NO_ERRORS_SCHEMA]
      });

      await TestBed.compileComponents();
    })()
      .then(done)
      .catch(done.fail)
  );

  let closeButton: HTMLSpanElement;
  let cancelButton: HTMLButtonElement;
  let component: DiningCategoriesCreateComponent;
  let fixture: ComponentFixture<DiningCategoriesCreateComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DiningCategoriesCreateComponent);
    component = fixture.componentInstance;

    const closeButtonDebugEl = fixture.debugElement.query(By.css('.cpmodal__header__close'));

    const cancelButtonDebugEl = fixture.debugElement.query(By.css('.cpbtn--cancel'));

    closeButton = closeButtonDebugEl.nativeElement;
    cancelButton = cancelButtonDebugEl.nativeElement;

    fixture.detectChanges();
  });

  it('should call resetModal on close button click', () => {
    spyOn(component, 'resetModal');

    closeButton.click();

    expect(component.resetModal).toHaveBeenCalled();
    expect(component.resetModal).toHaveBeenCalledTimes(1);
  });

  it('should call resetModal on cancel button click', () => {
    spyOn(component, 'resetModal');

    cancelButton.click();

    expect(component.resetModal).toHaveBeenCalled();
    expect(component.resetModal).toHaveBeenCalledTimes(1);
  });

  it('should create an empty form', () => {
    const _emptyForm = {
      ...emptyForm,
      category_type_id: categoryTypes.dining
    };
    const result = component.form.value;
    expect(result).toEqual(_emptyForm);
  });

  it('should show form errors true', () => {
    component.doSubmit();

    expect(component.formError).toBe(true);
    expect(component.form.valid).toBe(false);
  });

  it('should dispatch PostCategory action', () => {
    spyOn(component, 'resetModal');
    const dispatchSpy = spyOn(component.store, 'dispatch');

    fillForm(component.form, filledForm);

    component.doSubmit();

    const expected = new fromStore.PostCategory(component.form.value);

    expect(component.resetModal).toHaveBeenCalled();
    expect(component.store.dispatch).toHaveBeenCalled();

    const { payload, type } = dispatchSpy.calls.mostRecent().args[0] as any;
    const { body } = payload;

    expect(body).toEqual(expected.payload);
    expect(type).toEqual(fromStore.CategoriesActions.POST_CATEGORY);
  });
});
