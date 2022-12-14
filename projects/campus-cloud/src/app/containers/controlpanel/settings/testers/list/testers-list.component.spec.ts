import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';

import { reducerMap } from '../store';
import { mockTesters } from '../tests';
import * as actions from '../store/testers.actions';
import { RootStoreModule } from '@campus-cloud/store';
import { ModalService } from '@campus-cloud/shared/services';
import { TestersListComponent } from './testers-list.component';
import { CampusTestersService } from '../campus-testers.service';
import { SharedModule } from '@campus-cloud/shared/shared.module';
import { configureTestSuite, CPTestModule } from '@campus-cloud/shared/tests';
import { SETTINGS_TESTERS, SortDirection } from '@campus-cloud/shared/constants';
import { TestUsersComponent } from './components/test-users/test-users.component';
import { NoTestersComponent } from './components/no-testers/no-testers.component';
import { TestersActionBoxComponent } from './components/testers-action-box/testers-action-box.component';

describe('TestersListComponent', () => {
  configureTestSuite();
  beforeAll((done) => {
    (async () => {
      await TestBed.configureTestingModule({
        imports: [
          CPTestModule,
          SharedModule,
          RootStoreModule,
          HttpClientModule,
          RouterTestingModule,
          StoreModule.forFeature(SETTINGS_TESTERS, reducerMap)
        ],
        providers: [ModalService, CampusTestersService],
        declarations: [
          TestersListComponent,
          TestersActionBoxComponent,
          TestUsersComponent,
          NoTestersComponent
        ]
      }).compileComponents();
    })()
      .then(done)
      .catch(done.fail);
  });

  let component: TestersListComponent;
  let fixture: ComponentFixture<TestersListComponent>;
  let spyFetch;
  let spyDispatch;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(TestersListComponent);
    component = fixture.componentInstance;

    spyFetch = spyOn(component, 'fetch').and.callThrough();
    spyDispatch = spyOn(component.store, 'dispatch').and.callThrough();

    fixture.detectChanges();
  }));

  it('should create and fetch w/ dispatch', () => {
    expect(spyFetch).toHaveBeenCalled();
    expect(spyDispatch).toHaveBeenCalledWith(new actions.LoadTesters());
  });

  it('should search and fetch', () => {
    spyFetch.calls.reset();
    const search = 'test';
    component.doSearch(search);
    expect(spyDispatch).toHaveBeenCalledWith(new actions.SetTestersSearch(search));
    expect(spyFetch).toHaveBeenCalled();
  });

  it('should toggle sort and fetch', () => {
    spyFetch.calls.reset();
    component.doSort(SortDirection.ASC);
    expect(spyDispatch).toHaveBeenCalledWith(new actions.SetTestersSort(SortDirection.DESC));
    expect(spyFetch).toHaveBeenCalled();
  });

  it('should set isEmpty true', () => {
    component.doSearch('');
    component.store.dispatch(new actions.LoadTestersOK([]));
    expect(component.isEmpty).toBe(true);
  });

  it('should set isEmpty false if testers exist', () => {
    component.store.dispatch(new actions.LoadTestersOK(mockTesters));
    expect(component.isEmpty).toBe(false);
  });

  it('should set isEmpty false if user searched', () => {
    component.doSearch('test');
    expect(component.isEmpty).toBe(false);
  });
});
