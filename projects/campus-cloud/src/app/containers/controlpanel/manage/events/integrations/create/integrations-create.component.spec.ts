import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';

import * as fromStore from '../store';

import { CPSession } from '@campus-cloud/session';
import { emptyForm, fillForm, resetForm } from '../tests';
import { mockSchool } from '@campus-cloud/session/mock/school';
import { configureTestSuite } from '@campus-cloud/shared/tests';
import { SharedModule } from '@campus-cloud/shared/shared.module';
import { READY_MODAL_DATA } from '@projects/ready-ui/src/public-api';
import { EventsIntegrationsCreateComponent } from './integrations-create.component';
import { CommonIntegrationUtilsService } from '@campus-cloud/libs/integrations/common/providers/integrations.utils.service';

describe('EventsIntegrationsCreateComponent', () => {
  configureTestSuite();

  beforeAll((done) =>
    (async () => {
      TestBed.configureTestingModule({
        imports: [SharedModule],
        providers: [
          CPSession,
          provideMockStore(),
          CommonIntegrationUtilsService,
          {
            provide: READY_MODAL_DATA,
            useValue: {
              onClose: () => {}
            }
          }
        ],
        declarations: [EventsIntegrationsCreateComponent],
        schemas: [NO_ERRORS_SCHEMA]
      });

      await TestBed.compileComponents();
    })()
      .then(done)
      .catch(done.fail)
  );

  let session: CPSession;
  let modalCloseSpy: jasmine.Spy;
  let formResetSpy: jasmine.Spy;
  let closeButton: HTMLSpanElement;
  let cancelButton: HTMLButtonElement;
  let component: EventsIntegrationsCreateComponent;

  let fixture: ComponentFixture<EventsIntegrationsCreateComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EventsIntegrationsCreateComponent);
    component = fixture.componentInstance;

    session = TestBed.inject(CPSession);

    session.g.set('school', mockSchool);

    const cancelButtonDebugEl = fixture.debugElement.query(By.css('.js_cancel_button'));
    const closeButtonDebugEl = fixture.debugElement.query(By.css('.cpmodal__header__close'));

    closeButton = closeButtonDebugEl.nativeElement;
    cancelButton = cancelButtonDebugEl.nativeElement;

    fixture.detectChanges();

    formResetSpy = spyOn(component.form, 'reset');
    modalCloseSpy = spyOn(component.modal, 'onClose');
  });

  it('should emit teardown event on reset', () => {
    component.resetModal();
    expect(modalCloseSpy).toHaveBeenCalled();
    expect(formResetSpy).toHaveBeenCalled();
  });

  it('should call resetModal on close button click', () => {
    spyOn(component, 'resetModal');

    closeButton.click();

    expect(component.resetModal).toHaveBeenCalled();
  });

  it('should call resetModal on cancel button click', () => {
    spyOn(component, 'resetModal');

    cancelButton.click();

    expect(component.resetModal).toHaveBeenCalled();
  });

  it('should create an empty form', () => {
    component.ngOnInit();

    const result = component.form.value;
    expect(result).toEqual(emptyForm);
  });

  it('should dispatch CreateAndSync action', () => {
    component.ngOnInit();
    spyOn(component, 'resetModal');
    const dispatchSpy = spyOn(component.store, 'dispatch');

    fillForm(component.form);

    component.doSubmit();

    const expected = new fromStore.CreateAndSync(component.form.value);

    expect(component.resetModal).toHaveBeenCalled();
    expect(component.store.dispatch).toHaveBeenCalled();

    const { payload, type } = dispatchSpy.calls.mostRecent().args[0] as any;
    const { body } = payload;

    expect(body).toEqual(expected.payload);
    expect(type).toEqual(fromStore.IntegrationActions.CREATE_AND_SYNC);
  });

  it('submit button should be disabled unless form is valid and preview exists', () => {
    const de = fixture.debugElement;
    const submitBtn = de.query(By.css('.js_submit_button')).nativeElement;

    resetForm(component.form);

    expect(submitBtn.disabled).toBe(true);

    component.form.get('school_id').setValue(1);
    fixture.detectChanges();
    expect(submitBtn.disabled).toBe(true);

    component.form.get('feed_obj_id').setValue(1);
    fixture.detectChanges();
    expect(submitBtn.disabled).toBe(true);

    component.form.get('feed_url').setValue('mock');
    fixture.detectChanges();
    expect(submitBtn.disabled).toBe(true);

    component.form.get('feed_type').setValue(1);
    fixture.detectChanges();
    expect(submitBtn.disabled).toBe(true);
  });
});
