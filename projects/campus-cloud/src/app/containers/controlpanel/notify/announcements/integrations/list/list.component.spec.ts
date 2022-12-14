import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Store, StoreModule } from '@ngrx/store';
import { By } from '@angular/platform-browser';
import { EffectsModule } from '@ngrx/effects';
import { DebugElement } from '@angular/core';
import { of } from 'rxjs';

import { mockIntegration } from '../tests';
import * as fromRoot from '@campus-cloud/store';
import { CPSession } from '@campus-cloud/session';
import { mockSchool } from '@campus-cloud/session/mock';
import { CPNoContentComponent } from '@campus-cloud/shared/components';
import { AnnouncementsIntegrationListComponent } from './list.component';
import { configureTestSuite, CPTestModule } from '@campus-cloud/shared/tests';
import { AnnouncementIntegrationsModule } from '../announcements.integrations.module';
import { IntegrationsActionBoxComponent } from '@campus-cloud/libs/integrations/common/components';

describe('AnnouncementsIntegrationListComponent', () => {
  configureTestSuite();
  beforeAll((done) => {
    (async () => {
      TestBed.configureTestingModule({
        imports: [
          CPTestModule,
          RouterTestingModule,
          HttpClientTestingModule,
          AnnouncementIntegrationsModule,
          EffectsModule.forRoot([]),
          StoreModule.forRoot(fromRoot.baseReducers, { runtimeChecks: {} })
        ]
      });
      await TestBed.compileComponents();
    })()
      .then(done)
      .catch(done.fail);
  });

  let de: DebugElement;
  let session: CPSession;
  let store: Store<fromRoot.IHeader>;
  let component: AnnouncementsIntegrationListComponent;
  let fixture: ComponentFixture<AnnouncementsIntegrationListComponent>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AnnouncementsIntegrationListComponent);
    component = fixture.componentInstance;
    de = fixture.debugElement;

    store = TestBed.get(Store);
    session = TestBed.get(CPSession);

    session.g.set('school', mockSchool);

    fixture.detectChanges();
  }));

  it('should trigger onLaunchCreateModal on launchCreateModal', () => {
    const onLaunchCreateModal = spyOn(component, 'onLaunchCreateModal');
    const actionBox: IntegrationsActionBoxComponent = de.query(
      By.directive(IntegrationsActionBoxComponent)
    ).componentInstance;
    actionBox.launchCreateModal.emit();

    expect(onLaunchCreateModal).toHaveBeenCalled();
  });

  it('should call updateHeader onInit', () => {
    spyOn(component, 'updateHeader');

    component.ngOnInit();

    expect(component.updateHeader).toHaveBeenCalled();
  });

  it('should update cp-header with right values', () => {
    const spy: jasmine.Spy = spyOn(store, 'dispatch');

    component.updateHeader();

    const { payload } = spy.calls.mostRecent().args[0];
    const {
      heading,
      crumbs: { url }
    } = payload;
    const expectedUrl = 'sent';
    const expectedHeading = 't_shared_feature_integrations';

    expect(url).toEqual(expectedUrl);
    expect(heading).toEqual(expectedHeading);
  });

  it('should show no content box when zero integrations found', () => {
    let noContent: DebugElement;

    component.loading$ = of(false);
    component.integrations$ = of([]);
    fixture.detectChanges();

    noContent = de.query(By.directive(CPNoContentComponent));

    expect(noContent).not.toBeNull();

    component.integrations$ = of([mockIntegration]);
    fixture.detectChanges();

    noContent = de.query(By.directive(CPNoContentComponent));

    expect(noContent).toBeNull();
  });
});
