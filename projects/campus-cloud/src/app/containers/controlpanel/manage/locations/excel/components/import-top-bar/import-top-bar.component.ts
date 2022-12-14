import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { ISnackbar, baseActionClass } from '@campus-cloud/store/base';
import { CPI18nService } from '@campus-cloud/shared/services';

@Component({
  selector: 'cp-locations-import-top-bar',
  templateUrl: './import-top-bar.component.html',
  styleUrls: ['./import-top-bar.component.scss']
})
export class LocationsImportTopBarComponent implements OnInit {
  @Input() isChecked: boolean;
  @Input() categories: Observable<any>;
  @Input() categoryDropDownStatus: boolean;

  @Output() checkAll: EventEmitter<boolean> = new EventEmitter();
  @Output() deleteLocations: EventEmitter<any> = new EventEmitter();
  @Output() categoryChange: EventEmitter<number> = new EventEmitter();

  constructor(public cpI18n: CPI18nService, public store: Store<ISnackbar>) {}

  errorHandler(body = this.cpI18n.translate('something_went_wrong')) {
    this.store.dispatch(
      new baseActionClass.SnackbarError({
        body: body
      })
    );
  }

  ngOnInit() {}
}
