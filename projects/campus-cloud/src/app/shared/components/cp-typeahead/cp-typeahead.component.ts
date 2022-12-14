import {
  Input,
  OnInit,
  Output,
  OnDestroy,
  Component,
  ViewChild,
  ElementRef,
  EventEmitter,
  HostListener,
  AfterViewInit
} from '@angular/core';
import { get as _get } from 'lodash';
import { fromEvent, Observable, of as observableOf, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, takeUntil } from 'rxjs/operators';

import { CPI18nService } from '@campus-cloud/shared/services';
import { Destroyable, Mixin } from '@campus-cloud/shared/mixins';

interface IState {
  isLists: boolean;
  isUsers: boolean;
  ids: Array<number>;
  canSearch: boolean;
  chips: Array<{ label: string; id: number }>;
}

interface IProps {
  isUsers: boolean;
  withSwitcher: boolean;
  unsetOverflow: boolean;
  suggestions: Array<any>;
  reset: Observable<boolean>;
  defaultValues: Array<{ label: string; id: number }>;
}

@Mixin([Destroyable])
@Component({
  selector: 'cp-typeahead',
  templateUrl: './cp-typeahead.component.html',
  styleUrls: ['./cp-typeahead.component.scss']
})
export class CPTypeAheadComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('input') input: ElementRef;

  @Input() props: IProps;

  @Output() query: EventEmitter<string> = new EventEmitter();
  @Output() typeChange: EventEmitter<number> = new EventEmitter();
  @Output()
  selection: EventEmitter<{
    ids: Array<number>;
    chips: Array<{ label: string; id: number }>;
  }> = new EventEmitter();

  el;
  chipOptions;
  switcherMenu;
  state: IState = {
    ids: [],
    chips: [],
    isLists: false,
    isUsers: false,
    canSearch: true
  };

  destroy$ = new Subject<null>();
  emitDestroy() {}

  constructor(public cpI18n: CPI18nService) {}

  @HostListener('document:click', ['$event'])
  onClick() {
    setTimeout(
      () => {
        this.props.suggestions = [];
      },

      100
    );
  }

  listenForKeyChanges() {
    this.el = this.input.nativeElement;

    const keyup$ = fromEvent(this.el, 'keyup');

    keyup$
      .pipe(
        takeUntil(this.destroy$),
        map((res: any) => {
          return res.target.value;
        }),
        debounceTime(400),
        distinctUntilChanged()
      )
      .subscribe(
        (res) => {
          const query = res.split(',')[res.split(',').length - 1].trim();

          if (!query) {
            this.resetList();

            return;
          }

          this.query.emit(query);
        },
        (err) => {
          throw new Error(err);
        }
      );
  }

  ngAfterViewInit() {
    if (this.state.canSearch) {
      this.listenForKeyChanges();
    }
  }

  onHandleClick(suggestion) {
    if (!suggestion.id) {
      return;
    }

    // hide suggestions
    this.resetList();

    // clear input
    this.el.value = null;

    // check for dupes
    if (this.state.ids.indexOf(suggestion.id) !== -1) {
      return;
    }

    this.state.ids.push(suggestion.id);
    this.state.chips.push(suggestion);
    this.selection.emit({ ids: this.state.ids, chips: this.state.chips });
  }

  resetList() {
    this.props.suggestions = [];
  }

  onHandleRemove(id) {
    this.state = Object.assign({}, this.state, {
      ids: this.state.ids.filter((_id) => _id !== id),
      chips: this.state.chips.filter((chip) => chip.id !== id)
    });
    this.selection.emit({ ids: this.state.ids, chips: this.state.chips });
  }

  shouldFocusInput() {
    if (this.state.canSearch) {
      this.el.focus();
    }
  }

  teardown() {
    this.state = Object.assign({}, this.state, {
      ids: [],
      chips: []
    });
  }

  ngOnDestroy() {
    this.teardown();
    this.emitDestroy();
  }

  onSwitchChange(selection) {
    this.teardown();

    switch (selection.id) {
      case 1:
        this.state = Object.assign({}, this.state, {
          isUsers: true,
          isLists: false
        });
        this.chipOptions = Object.assign({}, this.chipOptions, {
          icon: 'account_box'
        });
        break;
      case 2:
        this.state = Object.assign({}, this.state, {
          isUsers: false,
          isLists: true
        });
        this.chipOptions = Object.assign({}, this.chipOptions, {
          icon: 'list'
        });
        break;
    }

    this.typeChange.emit(selection.id);
  }

  ngOnInit() {
    const isUsers = _get(this.props, 'isUsers', null);

    if (!isUsers) {
      this.props.isUsers = true;
    }

    this.chipOptions = {
      withClose: true,
      withAvatar: true,
      icon: this.props.isUsers ? 'account_box' : 'list'
    };

    if (this.props.withSwitcher) {
      this.state = Object.assign({}, this.state, {
        isUsers: this.props.isUsers
      });
    }

    if (!this.props.reset) {
      this.props.reset = observableOf(false);
    }

    this.switcherMenu = [
      {
        label: this.cpI18n.translate('users'),
        id: 1
      },
      {
        label: this.cpI18n.translate('lists'),
        id: 2
      }
    ];

    if (this.props.defaultValues) {
      this.teardown();
      this.props.defaultValues.map((value) => {
        this.state.ids.push(value.id);
        this.state.chips.push(value);
      });
    }

    this.props.reset.pipe(takeUntil(this.destroy$)).subscribe((reset) => {
      if (reset) {
        this.teardown();
      }
    });
  }
}
