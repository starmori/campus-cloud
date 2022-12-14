import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CPSession } from '@campus-cloud/session';
import { mockSchool } from '@campus-cloud/session/mock';
import { ListPastComponent } from './list-past.component';
import { CP_PRIVILEGES_MAP } from '@campus-cloud/shared/constants';
import { configureTestSuite, CPTestModule, MOCK_IMAGE } from '@campus-cloud/shared/tests';
import { IntegrationSourceToIconPipe } from '@campus-cloud/libs/integrations/common/pipes/source-to-icon';
import { CPI18nPipe } from '@campus-cloud/shared/pipes';

const initialState = {
  start: null,
  end: null,
  store_id: null,
  search_str: null,
  attendance_only: 0,
  sort_field: 'start',
  sort_direction: 'asc',
  exclude_current: null,
  events: []
};

const mockUser = {
  school_level_privileges: {
    157: { [CP_PRIVILEGES_MAP.event_attendance]: { r: false, w: false } }
  }
};

describe('ListPastComponent', () => {
  configureTestSuite();

  beforeAll((done) =>
    (async () => {
      TestBed.configureTestingModule({
        imports: [CPTestModule],
        declarations: [ListPastComponent, IntegrationSourceToIconPipe],
        providers: [CPI18nPipe]
      });

      await TestBed.compileComponents();
    })()
      .then(done)
      .catch(done.fail)
  );

  let de: DebugElement;
  let session: CPSession;
  let component: ListPastComponent;
  let fixture: ComponentFixture<ListPastComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ListPastComponent);
    component = fixture.componentInstance;
    de = fixture.debugElement;

    session = TestBed.get(CPSession);
    session.g.set('user', mockUser);
    session.g.set('school', mockSchool);

    component.events = [];
    component.state = initialState;

    fixture.detectChanges();
  });

  it('should not view event assessment if no event attendance privileges', () => {
    expect(component.canViewAttendance).toBe(false);
  });

  it('should render events in the page', () => {
    component.events = [
      { id: 1, is_external: true, poster_thumb_url: MOCK_IMAGE },
      { id: 2, is_external: false, poster_thumb_url: MOCK_IMAGE }
    ];
    fixture.detectChanges();

    const listElements = de.queryAll(By.css('tbody tr[ui-table-row]'));
    expect(listElements.length).toBe(2);
  });

  it('should display icon if event is integrated', () => {
    component.events = [
      { id: 1, is_external: true, poster_thumb_url: MOCK_IMAGE },
      { id: 2, is_external: false, poster_thumb_url: MOCK_IMAGE }
    ];
    fixture.detectChanges();

    const listElements = de.queryAll(By.css('tbody tr[ui-table-row]'));
    const [integratedEventEl, notIntegratedEventEl] = listElements;

    const integratedEventIcon = integratedEventEl.query(By.css('.js_event_external'));
    const notIntegratedEventIcon = notIntegratedEventEl.query(By.css('.js_event_external'));

    expect(integratedEventIcon).toBeDefined();
    expect(notIntegratedEventIcon).toBeNull();
  });
});
