import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { combineLatest, Observable, of } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { map, startWith } from 'rxjs/operators';

import { CPSession } from '@campus-cloud/session';
import { StudentsService } from './../../../students.service';
import { CPI18nService } from '@campus-cloud/shared/services';
import { StudentListFilter } from './../../../students.status';
import { CP_PRIVILEGES_MAP } from '@campus-cloud/shared/constants';
import { PersonaType } from '@controlpanel/audience/audience.status';
import { canSchoolReadResource } from '@campus-cloud/shared/utils/privileges';

interface IFilterBy {
  id: number;
  label: string;
  queryParam: string;
}

interface IState {
  muted: boolean;
  search_str: string;
  filterBy: IFilterBy;
}

@Component({
  selector: 'cp-students-top-bar',
  templateUrl: './students-top-bar.component.html',
  styleUrls: ['./students-top-bar.component.scss']
})
export class StudentsTopBarComponent implements OnInit {
  @Input() listIdFromUrl: number;
  @Output() filter: EventEmitter<IState> = new EventEmitter();

  selectedItem;
  canAudience = false;
  dropdownItems$: Observable<any>;

  state: IState = {
    search_str: null,
    filterBy: null,
    muted: false
  };

  constructor(
    public session: CPSession,
    public cpI18n: CPI18nService,
    public route: ActivatedRoute,
    public service: StudentsService
  ) {}

  onListSelected(filterBy) {
    this.state = { ...this.state, filterBy };

    this.filter.emit(this.state);
  }

  onMuted(muted: boolean) {
    this.state = {
      ...this.state,
      muted
    };

    this.filter.emit(this.state);
  }

  onSearch(search_str) {
    this.state = { ...this.state, search_str };

    this.filter.emit(this.state);
  }

  ngOnInit() {
    const params = this.route.snapshot.queryParams;

    this.canAudience = canSchoolReadResource(this.session.g, CP_PRIVILEGES_MAP.audience);

    const search = new HttpParams().append('school_id', this.session.g.get('school').id.toString());

    const experienceSearch = search.append('platform', PersonaType.app.toString());

    const audiences$ = this.service.getLists(search, 1, 1000);
    const experiences$ = this.session.hasGuideCustomization
      ? this.service.getExperiences(experienceSearch, 1, 1000)
      : of([]);

    const stream$ = combineLatest([audiences$, experiences$]);

    this.dropdownItems$ = stream$.pipe(
      startWith([{ label: '---', id: null }]),
      map((response: any) => {
        if (response.length === 1) {
          return [{ label: '---', id: null }];
        }

        const [audiences, experiences] = response;

        const res = [
          {
            id: null,
            heading: false,
            label: this.cpI18n.translate('t_shared_all_experiences_and_audiences')
          }
        ];

        if (experiences.length) {
          res.push(
            {
              id: null,
              heading: true,
              label: this.cpI18n.translate('t_notify_announcement_audiences_my_experiences')
            },
            ...experiences.map((e) => {
              return {
                ...e,
                queryParam: StudentListFilter.experienceId
              };
            })
          );
        }

        if (audiences.length) {
          res.push(
            {
              id: null,
              heading: true,
              label: this.cpI18n.translate('t_students_profile_students')
            },
            ...audiences.map((a) => {
              return {
                id: a.id,
                label: a.name,
                queryParam: StudentListFilter.audienceId
              };
            })
          );
        }

        this.selectedItem = params
          ? res.filter((r) => r.id === Number(Object.values(params)[0]))[0]
          : null;

        if (this.selectedItem) {
          this.onListSelected(this.selectedItem);
        }

        return res;
      })
    );
  }
}
