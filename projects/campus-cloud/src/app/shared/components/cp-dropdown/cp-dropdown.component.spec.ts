import { BehaviorSubject } from 'rxjs';
import { CPDropdownComponent } from './cp-dropdown.component';

const fakeItems = [
  {
    action: '1',
    label: 'item 1'
  },
  {
    action: '2',
    label: 'item 2'
  }
];

describe('CPDropdownComponent', () => {
  let comp: CPDropdownComponent;
  const _reset = new BehaviorSubject(false);

  beforeEach(() => {
    comp = new CPDropdownComponent();
    comp.items = fakeItems;
    comp.reset = _reset.asObservable();
  });

  it('onClick ', () => {
    comp.onClick(fakeItems[1]);
    expect(comp.selectedItem).toBe(fakeItems[1]);

    comp.onClick({
      action: '3',
      label: 'item 3',
      heading: true
    });

    expect(comp.selectedItem).toBe(fakeItems[1]);
  });

  it('resetDropdown', () => {
    comp.onClick(fakeItems[1]);

    comp.resetDropdown();

    expect(comp.selectedItem).toBe(fakeItems[0]);
  });

  it('ngOnInit', () => {
    comp.ngOnInit();

    const spy = spyOn(comp, 'resetDropdown');

    comp.reset.subscribe((reset) => {
      if (reset) {
        expect(spy).toHaveBeenCalled();
      }
    });

    _reset.next(true);
  });
});
