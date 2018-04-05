import { TestBed, async, ComponentFixture } from '@angular/core/testing';
// import { By } from '@angular/platform-browser';
import { Observable } from 'rxjs/Observable';
// import { DebugElement } from '@angular/core';

import { CPCheckDropdownComponent } from './cp-check-dropdown.component';
import 'rxjs/add/observable/of';

describe('CPCheckDropdownComponent (inline template)', () => {

  let expected;
  let comp: CPCheckDropdownComponent;
  let fixture: ComponentFixture<CPCheckDropdownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CPCheckDropdownComponent],
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CPCheckDropdownComponent);

    comp = fixture.componentInstance;

    comp.items = [
      {
        label: 'mock label 1',
        action: null,
        decsritpion: 'mock description 1'
      },
      {
        label: 'mock label 2',
        action: null,
        decsritpion: 'mock description 2'
      }
    ]

    comp.reset = Observable.of(false);

    expected = {
      label: 'expected label',
      action: null,
      decsritpion: 'expected description'
    }

    fixture.detectChanges();
  });

  it('when selected item not present default to first item in items', () => {
    fixture.detectChanges();

    expect(comp.selectedItem).toBe(comp.items[0]);
  });

  it('when selectedItem present use it for the button text', () => {
    fixture.detectChanges();

    comp.selectedItem = expected

    fixture.detectChanges();

    expect(comp.selectedItem).toBe(expected);
  });

  it('should update selectedItem on click event', () => {
    comp.onClick(expected);

    fixture.detectChanges();

    expect(comp.selectedItem).toBe(expected);
  })
});
