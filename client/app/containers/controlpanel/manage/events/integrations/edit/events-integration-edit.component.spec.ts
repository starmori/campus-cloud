import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { StoreModule } from '@ngrx/store';

import * as fromStore from '../store';

import { mockEventIntegration } from '../tests';
import { CPSession } from './../../../../../../session';
import { mockSchool } from '../../../../../../session/mock';
import { EventIntegration } from './../model/integration.model';
import { configureTestSuite } from '../../../../../../shared/tests';
import { SharedModule } from './../../../../../../shared/shared.module';
import { EventsIntegrationEditComponent } from './events-integration-edit.component';

describe('EventsIntegrationEditComponent', () => {
  configureTestSuite();

  beforeAll((done) =>
    (async () => {
      TestBed.configureTestingModule({
        imports: [SharedModule, StoreModule.forRoot({})],
        providers: [CPSession],
        declarations: [EventsIntegrationEditComponent],
        schemas: [NO_ERRORS_SCHEMA]
      });

      await TestBed.compileComponents();
    })()
      .then(done)
      .catch(done.fail)
  );

  let session: CPSession;
  let tearDownSpy: jasmine.Spy;
  let formResetSpy: jasmine.Spy;
  let closeButton: HTMLSpanElement;
  let cancelButton: HTMLButtonElement;
  let component: EventsIntegrationEditComponent;
  let fixture: ComponentFixture<EventsIntegrationEditComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EventsIntegrationEditComponent);
    component = fixture.componentInstance;

    session = TestBed.get(CPSession);
    session.g.set('school', mockSchool);

    component.eventIntegration = mockEventIntegration;

    const closeButtonDebugEl = fixture.debugElement.query(By.css('.cpmodal__header__close'));

    const cancelButtonDebugEl = fixture.debugElement.query(By.css('.cpbtn--cancel'));

    closeButton = closeButtonDebugEl.nativeElement;
    cancelButton = cancelButtonDebugEl.nativeElement;

    fixture.detectChanges();

    tearDownSpy = spyOn(component.teardown, 'emit');
    formResetSpy = spyOn(component.integration.form, 'reset');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit teardown event on reset', () => {
    component.resetModal();
    expect(tearDownSpy).toHaveBeenCalled();
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

  it('should create an EventIntegration with the data pass as input', () => {
    expect(component.integration.id).toBe(mockEventIntegration.id);
    expect(component.integration instanceof EventIntegration).toBe(true);
  });

  it('should dispatch EditIntegration action', () => {
    component.ngOnInit();
    spyOn(component, 'resetModal');
    const dispatchSpy = spyOn(component.store, 'dispatch');

    component.doSubmit();

    const expected = new fromStore.EditIntegration(component.integration.form.value);

    expect(component.resetModal).toHaveBeenCalled();
    expect(component.store.dispatch).toHaveBeenCalled();

    const { payload, type } = dispatchSpy.calls.mostRecent().args[0];
    const { body, integrationId } = payload;
    console.log(dispatchSpy.calls.mostRecent().args[0]);

    expect(body).toEqual(expected.payload);
    expect(integrationId).toEqual(component.eventIntegration.id);
    expect(type).toEqual(fromStore.IntegrationActions.EDIT_INTEGRATION);
  });
});