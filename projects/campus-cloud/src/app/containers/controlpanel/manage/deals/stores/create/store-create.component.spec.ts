import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Store, StoreModule as NgrxStore } from '@ngrx/store';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { Actions } from '@ngrx/effects';

import { IStore } from '../store.interface';
import { StoreModule } from '../store.module';
import * as fromDeals from '@campus-cloud/store/manage/deals';
import { mockSchool } from '@campus-cloud/session/mock/school';
import { StoreCreateComponent } from './store-create.component';
import { configureTestSuite, CPTestModule } from '@campus-cloud/shared/tests';
import { ImageService, ImageValidatorService } from '@campus-cloud/shared/services';

describe('DealsStoreCreateComponent', () => {
  configureTestSuite();
  beforeAll((done) => {
    (async () => {
      TestBed.configureTestingModule({
        imports: [
          CPTestModule,
          HttpClientModule,
          StoreModule,
          RouterTestingModule,
          NgrxStore.forRoot({}, { runtimeChecks: {} })
        ],
        providers: [Store, Actions, FormBuilder, ImageService, ImageValidatorService]
      });
      await TestBed.compileComponents();
    })()
      .then(done)
      .catch(done.fail);
  });

  let spy;
  let component: StoreCreateComponent;
  let fixture: ComponentFixture<StoreCreateComponent>;

  const newStore = {
    id: 1,
    name: 'Hello World!',
    description: 'This is description',
    logo_url: 'image.jpeg'
  };

  beforeEach(async(() => {
    fixture = TestBed.createComponent(StoreCreateComponent);
    component = fixture.componentInstance;

    component.session.g.set('school', mockSchool);

    fixture.detectChanges();
  }));

  it('form validation - missing required fields - should fail', () => {
    expect(component.storeForm.valid).toBeFalsy();
  });

  it('form validation - should pass', () => {
    component.storeForm.controls['name'].setValue('hello world');
    component.storeForm.controls['logo_url'].setValue('dummy.png');

    expect(component.storeForm.valid).toBeTruthy();
  });

  it('form validation - max length 120 - should pass', () => {
    const charCount120 = 'a'.repeat(120);

    component.storeForm.controls['name'].setValue(charCount120);
    component.storeForm.controls['logo_url'].setValue('dummy.png');

    expect(component.storeForm.valid).toBeTruthy();
  });

  it('form validation - max length 120 - should fail', () => {
    const charCount121 = 'a'.repeat(121);

    component.storeForm.controls['name'].setValue(charCount121);
    component.storeForm.controls['logo_url'].setValue('dummy.png');

    expect(component.storeForm.valid).toBeFalsy();
  });

  it('save button should be disabled', () => {
    expect(component.buttonData.disabled).toBeTruthy();
  });

  it('save button should be enabled', () => {
    component.storeForm.controls['name'].setValue('hello world');
    component.storeForm.controls['logo_url'].setValue('dummy.png');

    expect(component.buttonData.disabled).toBeFalsy();
  });

  it('should dispatch create action', () => {
    spy = spyOn(component.store, 'dispatch');
    component.onSubmit();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(new fromDeals.CreateStore(component.storeForm.value));
  });

  it('should emit after create', async(() => {
    spyOn(component.created, 'emit');
    spyOn(component, 'resetModal');

    component.store.dispatch(new fromDeals.CreateStoreSuccess(newStore));
    fixture.detectChanges();

    expect(component.created.emit).toHaveBeenCalledTimes(1);
    expect(component.created.emit).toHaveBeenCalledWith(newStore as IStore);
    expect(component.resetModal).toHaveBeenCalledTimes(1);
  }));
});
