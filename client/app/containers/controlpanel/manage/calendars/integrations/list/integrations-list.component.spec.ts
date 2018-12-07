import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpParams } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { By } from '@angular/platform-browser';
import { StoreModule } from '@ngrx/store';
import { of } from 'rxjs';

import * as fromRoot from '@app/store';

import { CPSession } from '@app/session';
import { configureTestSuite } from '@shared/tests';
import { SharedModule } from '@shared/shared.module';
import { mockSchool } from '@app/session/mock/school';
import { CPNoContentComponent } from '@shared/components';
import { CPI18nService } from '@shared/services/i18n.service';
import { MockActivatedRoute, mockEventIntegration } from '../tests';
import { ItemsIntegrationsListComponent } from './integrations-list.component';
import { IntegrationStatusPipe, IntegrationTypePipe } from '@libs/integrations/common/pipes';

describe('ItemsIntegrationsListComponent', () => {
  configureTestSuite();

  beforeAll((done) =>
    (async () => {
      TestBed.configureTestingModule({
        imports: [SharedModule, StoreModule.forRoot({})],
        providers: [
          CPSession,
          CPI18nService,
          { provide: ActivatedRoute, useClass: MockActivatedRoute }
        ],
        declarations: [ItemsIntegrationsListComponent, IntegrationStatusPipe, IntegrationTypePipe],
        schemas: [NO_ERRORS_SCHEMA]
      });

      await TestBed.compileComponents();
    })()
      .then(done)
      .catch(done.fail)
  );
  let session: CPSession;
  let dispatchSpy: jasmine.Spy;
  let fixture: ComponentFixture<ItemsIntegrationsListComponent>;
  let component: ItemsIntegrationsListComponent;

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemsIntegrationsListComponent);
    component = fixture.componentInstance;

    session = TestBed.get(CPSession);
    session.g.set('school', mockSchool);

    dispatchSpy = spyOn(component.store, 'dispatch');

    fixture.detectChanges();
  });

  it('should init', () => {
    expect(component).toBeTruthy();
  });

  it('should return a common http params object', () => {
    const result = component.defaultParams.toString();
    const expected = new HttpParams().set('school_id', <any>mockSchool.id);

    expect(result.toString()).toEqual(expected.toString());
  });

  it('should trigger success snackbar on action completed', () => {
    const someKey = 'some action';
    spyOn(component.store, 'select').and.returnValue(of(someKey));

    component.listenForCompletedActions();
    const { payload, type } = dispatchSpy.calls.mostRecent().args[0];

    expect(payload.class).toBe('success');
    expect(payload.body).toContain(someKey);
    expect(type).toBe(fromRoot.baseActions.SNACKBAR_SHOW);
  });

  it('should trigger danger snackbar on error', () => {
    spyOn(component.store, 'select').and.returnValue(of(true));

    component.listenForErrors();
    const { payload, type } = dispatchSpy.calls.mostRecent().args[0];

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
    component.integrations$ = of([mockEventIntegration]);
    fixture.detectChanges();

    noResultsFoundComp = de.query(By.directive(CPNoContentComponent));

    expect(noResultsFoundComp).toBeNull();
  });
});