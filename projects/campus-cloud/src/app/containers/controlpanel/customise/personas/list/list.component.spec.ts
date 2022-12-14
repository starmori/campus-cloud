import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { MockPersonasService } from './../tests';
import { BaseComponent } from '@campus-cloud/base';
import { PersonasModule } from './../personas.module';
import { PersonasService } from './../personas.service';
import { PersonasListComponent } from './list.component';
import { CPTestModule } from '@campus-cloud/shared/tests';

describe('PersonasListComponent', () => {
  let storeSpy;
  let comp: PersonasListComponent;
  let fixture: ComponentFixture<PersonasListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CPTestModule, PersonasModule, RouterTestingModule],
      providers: [provideMockStore(), { provide: PersonasService, useClass: MockPersonasService }]
    });

    fixture = TestBed.createComponent(PersonasListComponent);
    comp = fixture.componentInstance;
    comp.session.g.set('school', { id: 157 });
    storeSpy = spyOn(comp.store, 'dispatch');

    fixture.detectChanges();
  }));

  it('should init', () => {
    expect(comp).toBeTruthy();
    expect(storeSpy).toHaveBeenCalled();
    expect(storeSpy).toHaveBeenCalledTimes(1);

    fixture.detectChanges();

    expect(comp.state.personas.length).toBe(2);
  });

  it('onRankDown', fakeAsync(() => {
    expect(comp.state.personas[0].localized_name_map.en).toBe('Students Tile');

    comp.onRankDown(comp.state.personas[0], 0);

    tick();

    expect(comp.state.personas[0].localized_name_map.en).toBe('Web Persona');
  }));

  it('onRankUp', fakeAsync(() => {
    expect(comp.state.personas[0].localized_name_map.en).toBe('Students Tile');

    comp.onRankUp(comp.state.personas[1], 1);

    tick();

    expect(comp.state.personas[0].localized_name_map.en).toBe('Web Persona');
  }));

  it('movePersonaToIndex', () => {
    const expected = comp.movePersonaToIndex(comp.state.personas[0], 0, 1);

    expect(comp.state.personas[0].localized_name_map.en).toBe('Students Tile');

    expect(expected[0].localized_name_map.en).toBe('Web Persona');
    expect(expected[1].localized_name_map.en).toBe('Students Tile');
  });

  it('handleUpdateError', () => {
    comp.handleUpdateError();

    expect(comp.state.updating).toBeFalsy();
    expect(storeSpy).toHaveBeenCalled();
  });

  it('onSearch', () => {
    const fetch = spyOn(comp, 'fetch');
    const resetPagination = spyOn(comp, 'resetPagination');

    const expected = 'something';
    comp.onSearch(expected);

    expect(comp.state.search_str).toBe(expected);
    expect(fetch).toHaveBeenCalled();
    expect(resetPagination).toHaveBeenCalled();
  });

  it('onPaginationPrevious', () => {
    const fetch = spyOn(comp, 'fetch');
    spyOn(BaseComponent.prototype, 'goToPrevious');

    comp.onPaginationPrevious();

    expect(fetch).toHaveBeenCalled();
    expect(BaseComponent.prototype.goToPrevious).toHaveBeenCalled();
  });

  it('onPaginationNext', () => {
    const fetch = spyOn(comp, 'fetch');
    spyOn(BaseComponent.prototype, 'goToNext');

    comp.onPaginationNext();

    expect(fetch).toHaveBeenCalled();
    expect(BaseComponent.prototype.goToNext).toHaveBeenCalled();
  });

  it('onFilterByPersonaType', () => {
    const platform = 1;
    const fetch = spyOn(comp, 'fetch');
    const resetPagination = spyOn(comp, 'resetPagination');

    comp.onFilterByPersonaType(platform);

    expect(fetch).toHaveBeenCalled();
    expect(comp.state.platform).toBe(platform);
    expect(resetPagination).toHaveBeenCalled();
  });

  it('fetch', fakeAsync(() => {
    comp.fetch();

    tick();

    expect(comp.state.personas.length).toBe(2);

    comp.state.search_str = 'web';

    comp.fetch();

    tick();

    expect(comp.state.personas.length).toBe(1);
  }));
});
