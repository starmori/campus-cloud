import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';

import * as fromRoot from '@campus-cloud/store';

import { mockIntegration } from '../tests';
import { CPSession } from '@campus-cloud/session';
import { configureTestSuite } from '@campus-cloud/shared/tests';
import { SharedModule } from '@campus-cloud/shared/shared.module';
import { CPNoContentComponent } from '@campus-cloud/shared/components';
import { CPI18nService } from '@campus-cloud/shared/services/i18n.service';
import { EventsIntegrationsListComponent } from './integrations-list.component';
import { IntegrationStatusPipe } from '@campus-cloud/libs/integrations/common/pipes/status.pipe';
import { IntegrationTypePipe } from '@campus-cloud/libs/integrations/common/pipes';

describe('EventsIntegrationsListComponent', () => {
  configureTestSuite();

  beforeAll((done) =>
    (async () => {
      TestBed.configureTestingModule({
        imports: [SharedModule],
        providers: [CPI18nService, provideMockStore()],
        declarations: [EventsIntegrationsListComponent, IntegrationStatusPipe, IntegrationTypePipe],
        schemas: [NO_ERRORS_SCHEMA]
      });

      await TestBed.compileComponents();
    })()
      .then(done)
      .catch(done.fail)
  );
  let session: CPSession;
  let dispatchSpy: jasmine.Spy;
  let fixture: ComponentFixture<EventsIntegrationsListComponent>;
  let component: EventsIntegrationsListComponent;

  beforeEach(() => {
    fixture = TestBed.createComponent(EventsIntegrationsListComponent);
    component = fixture.componentInstance;

    dispatchSpy = spyOn(component.store, 'dispatch');

    fixture.detectChanges();
  });

  it('should trigger success snackbar on action completed', () => {
    const someKey = 'some action';
    spyOn(component.store, 'select').and.returnValue(of(someKey));

    component.listenForCompletedActions();
    const { payload, type } = dispatchSpy.calls.mostRecent().args[0] as any;

    expect(payload.class).toBe('success');
    expect(payload.body).toContain(someKey);
    expect(type).toBe(fromRoot.baseActions.SNACKBAR_SHOW);
  });

  it('should trigger danger snackbar on error', () => {
    spyOn(component.store, 'select').and.returnValue(of(true));

    component.listenForErrors();
    const { payload, type } = dispatchSpy.calls.mostRecent().args[0] as any;

    expect(payload.class).toBe('danger');
    expect(type).toBe(fromRoot.baseActions.SNACKBAR_SHOW);
  });

  it('should show no results found message', () => {
    const de = fixture.debugElement;
    let noResultsFoundComp;

    component.loading$ = of(false);
    component.integrations$ = of([]);
    fixture.detectChanges();

    noResultsFoundComp = de.query(By.directive(CPNoContentComponent));

    expect(noResultsFoundComp).not.toBeNull();

    component.loading$ = of(false);
    component.integrations$ = of([mockIntegration]);
    fixture.detectChanges();

    noResultsFoundComp = de.query(By.directive(CPNoContentComponent));

    expect(noResultsFoundComp).toBeNull();
  });
});
