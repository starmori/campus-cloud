import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';

import * as fromStore from '../store';
import { CPSession } from '@campus-cloud/session';
import { mockSchool } from '@campus-cloud/session/mock/school';
import { configureTestSuite } from '@campus-cloud/shared/tests';
import { SharedModule } from '@campus-cloud/shared/shared.module';
import { CPI18nService, MODAL_DATA } from '@campus-cloud/shared/services';
import { LocationsUtilsService } from '@campus-cloud/libs/locations/common/utils';
import { LocationsTimeLabelPipe } from '@campus-cloud/libs/locations/common/pipes';
import { DiningCategoriesEditComponent } from './dining-categories-edit.component';
import { categoryTypes } from '@campus-cloud/libs/locations/common/categories/model';
import {
  filledForm,
  mockCategories,
  MockModalData
} from '@campus-cloud/libs/locations/common/categories/tests';

describe('DiningCategoriesEditComponent', () => {
  configureTestSuite();

  beforeAll((done) =>
    (async () => {
      TestBed.configureTestingModule({
        imports: [SharedModule],
        providers: [
          CPSession,
          CPI18nService,
          provideMockStore(),
          LocationsUtilsService,
          LocationsTimeLabelPipe,
          { provide: MODAL_DATA, useClass: MockModalData }
        ],
        declarations: [DiningCategoriesEditComponent],
        schemas: [NO_ERRORS_SCHEMA]
      });

      await TestBed.compileComponents();
    })()
      .then(done)
      .catch(done.fail)
  );

  let closeButton: HTMLSpanElement;
  let cancelButton: HTMLButtonElement;
  let component: DiningCategoriesEditComponent;
  let fixture: ComponentFixture<DiningCategoriesEditComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DiningCategoriesEditComponent);
    component = fixture.componentInstance;
    component.session.g.set('school', mockSchool);
    component.modal.data = mockCategories[0];
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

  it('should create form with values', () => {
    const _filledForm = {
      ...filledForm,
      category_type_id: categoryTypes.dining
    };
    const result = component.form.value;
    expect(result).toEqual(_filledForm);
  });

  it('should show form errors true', () => {
    component.form.get('name').setValue(null);

    component.doSubmit();

    expect(component.formError).toBe(true);
    expect(component.form.valid).toBe(false);
  });

  it('should dispatch EditCategory action', () => {
    spyOn(component, 'resetModal');
    const dispatchSpy = spyOn(component.store, 'dispatch');

    component.doSubmit();

    const expected = new fromStore.EditCategory(component.form.value);

    expect(component.resetModal).toHaveBeenCalled();
    expect(component.store.dispatch).toHaveBeenCalled();

    const { payload, type } = dispatchSpy.calls.mostRecent().args[0] as any;
    const { body, categoryId } = payload;

    expect(body).toEqual(expected.payload);
    expect(categoryId).toEqual(component.category.id);
    expect(type).toEqual(fromStore.CategoriesActions.EDIT_CATEGORY);
  });
});
