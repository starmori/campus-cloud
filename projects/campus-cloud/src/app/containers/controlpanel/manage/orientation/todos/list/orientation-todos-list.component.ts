import { Component, OnInit } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

import { ITodo } from '../todos.interface';
import { TodosService } from '../todos.service';
import { CPSession } from '@campus-cloud/session';
import { BaseComponent } from '@campus-cloud/base';
import { FORMAT } from '@campus-cloud/shared/pipes';
import { CP_TRACK_TO } from '@campus-cloud/shared/directives';
import { amplitudeEvents } from '@campus-cloud/shared/constants';
import { CPI18nService, CPTrackingService } from '@campus-cloud/shared/services';

@Component({
  selector: 'cp-orientation-todos-list',
  templateUrl: './orientation-todos-list.component.html',
  styleUrls: ['./orientation-todos-list.component.scss']
})
export class OrientationTodosListComponent extends BaseComponent implements OnInit {
  loading;
  eventData;
  sortingLabels;
  selectedTodo = null;
  orientationId: number;
  launchEditModal = false;
  launchDeleteModal = false;
  launchCreateModal = false;
  dateFormat = FORMAT.DATETIME;

  state = {
    todos: [],
    search_str: null,
    sort_field: 'title',
    sort_direction: 'asc'
  };

  constructor(
    public session: CPSession,
    public cpI18n: CPI18nService,
    public service: TodosService,
    public route: ActivatedRoute,
    public cpTracking: CPTrackingService
  ) {
    super();
    super.isLoading().subscribe((loading) => (this.loading = loading));
    this.orientationId = this.route.snapshot.parent.parent.params['orientationId'];
  }

  onPaginationNext() {
    super.goToNext();

    this.fetch();
  }

  onPaginationPrevious() {
    super.goToPrevious();

    this.fetch();
  }

  onSearch(search_str) {
    this.state = Object.assign({}, this.state, { search_str });

    this.resetPagination();

    this.fetch();
  }

  public fetch() {
    const search = new HttpParams()
      .append('search_str', this.state.search_str)
      .append('sort_field', this.state.sort_field)
      .append('sort_direction', this.state.sort_direction)
      .append('calendar_id', this.orientationId.toString())
      .append('school_id', this.session.g.get('school').id.toString());

    super
      .fetchData(this.service.getTodos(this.startRange, this.endRange, search))
      .then((res) => (this.state = { ...this.state, todos: res.data }));
  }

  doSort(sort_field) {
    this.state = {
      ...this.state,
      sort_field: sort_field,
      sort_direction: this.state.sort_direction === 'asc' ? 'desc' : 'asc'
    };

    this.fetch();
  }

  onLaunchCreateModal() {
    this.launchCreateModal = true;

    setTimeout(
      () => {
        $('#todoCreate').modal({ keyboard: true, focus: true });
      },

      1
    );
  }

  onCreated(newTodo: ITodo): void {
    this.launchCreateModal = false;
    this.state.todos = [newTodo, ...this.state.todos];
  }

  onEditedLink(editTodo: ITodo) {
    this.launchEditModal = false;
    this.selectedTodo = null;

    this.state = Object.assign({}, this.state, {
      todos: this.state.todos.map((todo) => (todo.id === editTodo.id ? editTodo : todo))
    });
  }

  onDeleted(todoId: number) {
    this.selectedTodo = null;
    this.launchDeleteModal = false;

    this.state = Object.assign({}, this.state, {
      todos: this.state.todos.filter((todo) => todo.id !== todoId)
    });

    if (this.state.todos.length === 0 && this.pageNumber > 1) {
      this.resetPagination();
      this.fetch();
    }
  }

  ngOnInit() {
    this.fetch();

    this.sortingLabels = {
      name: this.cpI18n.translate('name'),
      due_date: this.cpI18n.translate('due_date')
    };

    this.eventData = {
      type: CP_TRACK_TO.AMPLITUDE,
      eventName: amplitudeEvents.VIEWED_ITEM,
      eventProperties: this.cpTracking.getAmplitudeMenuProperties()
    };
  }
}
