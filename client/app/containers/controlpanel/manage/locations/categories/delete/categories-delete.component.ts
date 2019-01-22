import { Input, EventEmitter, Output } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';

import { ICategory } from '../model';
import * as fromStore from '../store';
import { CPSession } from '@app/session';

@Component({
  selector: 'cp-categories-delete',
  templateUrl: './categories-delete.component.html',
  styleUrls: ['./categories-delete.component.scss']
})
export class CategoriesDeleteComponent implements OnInit {
  @Input() category: ICategory;

  @Output() teardown: EventEmitter<null> = new EventEmitter();

  buttonData;

  constructor(
    public session: CPSession,
    public store: Store<fromStore.ICategoriesState>
    ) {}

  onDelete() {
    const categoryId = this.category.id;
    const school_id =  this.session.g.get('school').id;
    const params = new HttpParams().set('school_id', school_id);

    const payload = {
      params,
      categoryId
    };

    this.store.dispatch(new fromStore.DeleteCategories(payload));
    this.resetModal();
  }

  resetModal() {
    this.teardown.emit();
    $('#categoryDelete').modal('hide');
  }

  ngOnInit(): void {}
}
