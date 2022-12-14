import {
  tap,
  map,
  take,
  mapTo,
  share,
  repeat,
  filter,
  mergeMap,
  switchMap,
  takeUntil,
  startWith,
  skipUntil,
  catchError,
  debounceTime,
  withLatestFrom,
  distinctUntilChanged
} from 'rxjs/operators';
import { Subject, Observable, BehaviorSubject, merge, combineLatest, of } from 'rxjs';
import { OnInit, Output, Component, EventEmitter, Input } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { isEqual, get as _get } from 'lodash';
import { FormBuilder } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import * as numeral from 'numeral';

import * as fromStore from '../../../store';
import { CPSession } from '@campus-cloud/session';
import { CPDate } from '@campus-cloud/shared/utils';
import { FeedsUtilsService, GroupType } from '../../../feeds.utils.service';
import { CP_TRACK_TO } from '@campus-cloud/shared/directives';
import { amplitudeEvents } from '@campus-cloud/shared/constants';
import { FeedsService } from '@controlpanel/manage/feeds/feeds.service';
import { FeedsAmplitudeService } from '../../../feeds.amplitude.service';
import { UserService, CPI18nService, CPTrackingService } from '@campus-cloud/shared/services';
import { now, last7Days, lastYear, last90Days, last30Days } from '@campus-cloud/shared/components';
import {
  ISocialGroup,
  IDataExportWallsPost,
  IDataExportGroupThread,
  IDataExportWallsComment,
  IDataExportGroupThreadComment
} from '@controlpanel/manage/feeds/model';
@Component({
  selector: 'cp-feed-search',
  templateUrl: './feed-search.component.html',
  styleUrls: ['./feed-search.component.scss']
})
export class FeedSearchComponent implements OnInit {
  @Input() groupId: number;
  @Input() groupType: GroupType;
  @Input() hideIntegrations: boolean;

  @Output()
  feedSearch: EventEmitter<string> = new EventEmitter();

  maxDate = new Date();
  form = this.fb.group({
    query: ['']
  });

  destroy$ = new Subject();
  downloadThread = new Subject();
  generateZipFile$ = this.downloadThread.pipe(
    mergeMap(() => this.feedsService.generateReport(this.getExportDataStream())),
    catchError(() => of(false))
  );

  downloading$ = merge(
    this.downloadThread.asObservable().pipe(mapTo(true)),
    this.generateZipFile$.pipe(mapTo(false))
  ).pipe(startWith(false));

  eventData = {
    type: CP_TRACK_TO.AMPLITUDE,
    eventName: amplitudeEvents.MANAGE_VIEWED_FEED_INTEGRATION,
    eventProperties: { sub_menu_name: amplitudeEvents.WALL }
  };
  query: BehaviorSubject<string> = new BehaviorSubject('');

  input = new Subject();
  input$ = this.input.asObservable().pipe(
    takeUntil(this.destroy$),
    debounceTime(1000),
    tap((value: string) => this.query.next(value)),
    tap((value) => {
      if (value.length >= 3 || value.length === 0) {
        this.feedSearch.emit(value);
      }
    })
  );

  view$: Observable<{
    dateMenu: any;
    statusMenu: any;
    primaryMenu: any;
    studentsMenu: any;
    channelsMenu: any;
    postCount: number;
    counting: boolean;
    searchTitle: string;
    commentCount: number;
    hasFiltersActive: boolean;
  }>;

  closeMenu = new Subject();
  channelTerm = new Subject();
  primaryMenuOpened = new Subject();

  dateMenu$: Observable<any>;
  statusMenu$: Observable<any>;
  primaryMenu$: Observable<any>;
  channelsMenu$: Observable<any>;
  studentsMenu$: Observable<any>;

  hasFiltersActive$: Observable<boolean>;
  presetDates: { [key: string]: number[] };
  viewFilters$: BehaviorSubject<any> = new BehaviorSubject({});
  locale = CPI18nService.getLocale().startsWith('fr') ? 'fr' : 'en';

  students: any[] = [];
  studentsSearchTermStream = new Subject();
  studentsPageStream = new Subject<number>();
  studentsSearchTerm: string;
  studentsPageCounter = 1;
  studentsPaginationCountPerPage = 15;
  studentsHasMorePages = false;

  constructor(
    private fb: FormBuilder,
    private session: CPSession,
    private userService: UserService,
    private feedsService: FeedsService,
    private cpTracking: CPTrackingService,
    private store: Store<fromStore.IWallsState>,
    private feedsAmplitudeService: FeedsAmplitudeService
  ) {}

  get state$() {
    return this.viewFilters$.value;
  }

  ngOnInit() {
    this.input$.subscribe();
    const viewFilters$ = this.store.pipe(select(fromStore.getViewFilters)).pipe(
      tap((filters) => this.viewFilters$.next(filters)),
      share()
    );

    const studentsSearchSource = this.studentsSearchTermStream.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      map((searchTerm: string) => {
        this.studentsSearchTerm = searchTerm;
        this.studentsPageCounter = 1;
        return { searchTerm: searchTerm, page: this.studentsPageCounter };
      })
    );

    const studentsPageSource = this.studentsPageStream.pipe(
      map((pageNumber) => {
        this.studentsPageCounter = pageNumber;
        return { searchTerm: this.studentsSearchTerm, page: pageNumber };
      })
    );

    const studentsSearchCombinedSource: Observable<any[]> = merge(
      studentsPageSource,
      studentsSearchSource
    ).pipe(
      startWith({ searchTerm: this.studentsSearchTerm, page: this.studentsPageCounter }),
      switchMap((params: { searchTerm: string; page: number }) => {
        return this.fetchStudents(params.page);
      }),
      share()
    );

    studentsSearchCombinedSource.subscribe((data) => this.handleStudentsDataLoad(data));

    this.studentsMenu$ = combineLatest([
      viewFilters$,
      this.studentsSearchTermStream.asObservable().pipe(startWith(''))
    ]).pipe(
      map(([filters, searchTerm]) => {
        const { users } = filters;
        const selectedUserids = users.map((u) => u.id);
        return {
          selectedUserids,
          selectedUsers: users,
          canSelect: users.length < 5,
          isSearching: searchTerm !== ''
        };
      })
    );
    this.dateMenu$ = this.getDateMenu();

    this.statusMenu$ = combineLatest([viewFilters$]).pipe(
      map(([filters]) => {
        const { flaggedByModerators, flaggedByUser } = filters;
        return {
          flaggedByUser,
          flaggedByModerators
        };
      })
    );

    this.presetDates = {
      lastWeek: [last7Days(this.session.tz, new Date()), now(this.session.tz)],
      last30Days: [last30Days(this.session.tz, new Date()), now(this.session.tz)],
      last90Days: [last90Days(this.session.tz, new Date()), now(this.session.tz)],
      lastYear: [lastYear(this.session.tz, new Date()), now(this.session.tz)]
    };

    const channels$ = this.store.pipe(select(fromStore.getSocialPostCategories));
    const selectedChannel$ = viewFilters$.pipe(
      map(({ postType }) => (postType ? postType.id : null))
    );
    const selectedHostWall$ = viewFilters$.pipe(map(({ group }) => (group ? group.id : null)));
    const integrtedChannels$ = channels$.pipe(
      map((channels) => channels.filter((c) => c.is_integrated))
    );
    const nonIntegrtedChannels$ = channels$.pipe(
      map((channels) => channels.filter((c) => !c.is_integrated))
    );

    this.channelsMenu$ = combineLatest([
      this.fetchSocialGroups(),
      integrtedChannels$,
      nonIntegrtedChannels$,
      selectedChannel$,
      selectedHostWall$,
      this.channelTerm.asObservable().pipe(startWith(''))
    ]).pipe(
      map(
        ([
          socialGroups,
          integratedChannels,
          nonIntegratedChannels,
          selectedChannel,
          selectedHostWall,
          query
        ]) => {
          const searchByName = (item) => {
            const name = _get(item, 'name', '');
            return name.toLowerCase().startsWith((query as string).toLowerCase().trim());
          };
          return {
            selectedChannel,
            selectedHostWall,
            isSearching: query !== '',
            socialGroups: socialGroups.filter(searchByName),
            integratedChannels: integratedChannels.filter(searchByName),
            allCampusWallChannels: !selectedChannel && !selectedHostWall,
            nonIntegratedChannels: nonIntegratedChannels.filter(searchByName)
          };
        }
      )
    );

    const usersSelected$ = viewFilters$.pipe(map(({ users }) => Boolean(users.length)));
    const datesSelected$ = viewFilters$.pipe(
      map(({ start, end }) => Boolean(start) && Boolean(end))
    );

    const channelsSelected$ = viewFilters$.pipe(
      map(({ group, postType }) => (this.groupId ? false : Boolean(group) || Boolean(postType)))
    );
    const statusSelected$ = viewFilters$.pipe(
      map(({ flaggedByUser, flaggedByModerators }) => flaggedByUser || flaggedByModerators)
    );

    this.hasFiltersActive$ = combineLatest([
      usersSelected$,
      datesSelected$,
      channelsSelected$,
      statusSelected$
    ]).pipe(
      map(
        ([usersSelected, datesSelected, channelsSelected, statusSelected]) =>
          usersSelected || datesSelected || channelsSelected || statusSelected
      )
    );

    this.primaryMenu$ = combineLatest([
      usersSelected$,
      channelsSelected$,
      statusSelected$,
      datesSelected$,
      this.hasFiltersActive$
    ]).pipe(
      map(([usersSelected, channelsSelected, statusSelected, datesSelected, hasFiltersActive]) => {
        return {
          usersSelected,
          channelsSelected,
          statusSelected,
          datesSelected,
          hasFiltersActive
        };
      })
    );

    const userSearch$ = this.feedSearch;
    const primaryMenuClosed$ = this.closeMenu.asObservable();
    const primaryMenuOpened$ = this.primaryMenuOpened.asObservable();
    const filterChanges$ = this.store.pipe(select(fromStore.getViewFilters));

    const menuOpensFiltersChangeAndMenuCloses$ = filterChanges$.pipe(
      skipUntil(primaryMenuOpened$),
      switchMap(() => primaryMenuClosed$),
      take(1),
      repeat()
    );

    const amplitude$ = merge(
      menuOpensFiltersChangeAndMenuCloses$.pipe(mapTo(false)),
      userSearch$.pipe(mapTo(true))
    ).pipe(
      takeUntil(this.destroy$),
      withLatestFrom(this.dateMenu$)
    );

    amplitude$.subscribe(([isSearch, { presetDateSelected }]) => {
      this.feedsAmplitudeService.setFilterLabel(presetDateSelected, this.state$);
      this.wallSearchFilterAmplitude(isSearch);
    });

    // share to avoid making multiple requests
    const count$ = this.getCount().pipe(share());

    const filtersChanged$ = this.viewFilters$.pipe(
      distinctUntilChanged((prevState, currentState) => isEqual(prevState, currentState)),
      mapTo(true)
    );
    const countisDone$ = count$.pipe(mapTo(false));
    const searchTerm$ = viewFilters$.pipe(
      map(({ searchTerm }) => searchTerm),
      startWith(''),
      tap((searchTerm) => this.form.get('query').setValue(searchTerm))
    );

    const searchTitle$ = combineLatest([viewFilters$, this.hasFiltersActive$]).pipe(
      map(([{ postType, group, searchTerm }, hasFilters]) => {
        if ((hasFilters && !postType && !group) || (searchTerm !== '' && (postType || group))) {
          return 't_feeds_search_results';
        } else if (postType) {
          return `[NOTRANSLATE]${postType.name}[NOTRANSLATE]`;
        } else if (group) {
          return `[NOTRANSLATE]${group.name}[NOTRANSLATE]`;
        } else if (searchTerm !== '') {
          return 't_feeds_results_for';
        } else {
          return 't_walls_all_channels';
        }
      }),
      startWith('t_walls_all_channels')
    );

    const calculatingCount$ = merge(filtersChanged$, countisDone$).pipe(distinctUntilChanged());

    this.view$ = combineLatest([
      this.hasFiltersActive$,
      this.dateMenu$.pipe(startWith(false)),
      this.statusMenu$.pipe(startWith(false)),
      this.primaryMenu$.pipe(startWith(false)),
      this.studentsMenu$.pipe(startWith(false)),
      this.channelsMenu$.pipe(startWith(false)),
      count$.pipe(startWith(false)),
      calculatingCount$.pipe(startWith(true)),
      searchTitle$,
      searchTerm$
    ]).pipe(
      map(
        ([
          hasFiltersActive,
          dateMenu,
          statusMenu,
          primaryMenu,
          studentsMenu,
          channelsMenu,
          count,
          counting,
          searchTitle,
          searchTerm
        ]) => ({
          hasFiltersActive,
          dateMenu,
          statusMenu,
          primaryMenu,
          studentsMenu,
          channelsMenu,
          ...count,
          counting,
          searchTitle,
          searchTerm
        })
      )
    );
  }

  private handleStudentsDataLoad(data: any[]) {
    if (this.studentsPageCounter === 1) {
      this.students = data;
    } else {
      this.students = this.students.concat(data);
    }
  }

  getCount() {
    const defaultValue = {
      postCount: 0,
      commentCount: 0
    };
    const uniqueChanges = (prevState, currentState) => isEqual(prevState, currentState);

    const filterChanges$ = this.viewFilters$.pipe(
      distinctUntilChanged(uniqueChanges),
      filter(({ end, start }) => (start || end ? start && end : true))
    );

    const threadChanges$ = this.store
      .pipe(select(fromStore.getThreads))
      .pipe(distinctUntilChanged(uniqueChanges));

    const commentChanges$ = this.store
      .pipe(select(fromStore.getComments))
      .pipe(distinctUntilChanged(uniqueChanges));

    const shouldReCount$ = merge(threadChanges$, commentChanges$).pipe(
      withLatestFrom(filterChanges$),
      map(([, filters]) => filters)
    );
    const stream$ = merge(shouldReCount$, filterChanges$).pipe(
      filter((filters) => Boolean(Object.keys(filters).length))
    );

    return stream$.pipe(
      filter(({ end, start }) => (start || end ? start && end : true)),
      switchMap((filterState) => {
        const { group } = filterState;
        const params = this.getExportDataQueryParams(filterState).set('count_only', '1');

        if (group) {
          return combineLatest([
            this.feedsService.getGroupThreadExportData(params) as Observable<{ count: number }>,
            this.feedsService.getGroupCommentExportData(params) as Observable<{
              count: number;
            }>
          ]);
        }

        return combineLatest([
          this.feedsService.getCampusWallsPostsExportData(params) as Observable<{
            count: number;
          }>,
          this.feedsService.getCampusWallsCommentExportData(params) as Observable<{
            count: number;
          }>
        ]);
      }),
      map(([posts, comments]) => ({
        postCount:
          posts.count.toString().length >= 4 ? numeral(posts.count).format('0.0a') : posts.count,
        commentCount:
          comments.count.toString().length >= 4
            ? numeral(comments.count).format('0.0a')
            : comments.count
      })),
      catchError(() => of(defaultValue))
    );
  }

  getExportDataStream(): Observable<
    | [IDataExportGroupThread[], IDataExportGroupThreadComment[]]
    | [IDataExportWallsPost[], IDataExportWallsComment[]]
  > {
    return this.viewFilters$.pipe(
      take(1),
      switchMap((filterState) => {
        const { group } = filterState;
        const params = this.getExportDataQueryParams(filterState);

        if (group) {
          return combineLatest([
            this.feedsService.getGroupThreadExportData(params) as Observable<
              IDataExportGroupThread[]
            >,
            this.feedsService.getGroupCommentExportData(params) as Observable<
              IDataExportGroupThreadComment[]
            >
          ]);
        }

        return combineLatest([
          this.feedsService.getCampusWallsPostsExportData(params) as Observable<
            IDataExportWallsPost[]
          >,
          this.feedsService.getCampusWallsCommentExportData(params) as Observable<
            IDataExportWallsComment[]
          >
        ]);
      })
    );
  }

  getDateMenu(): Observable<any> {
    const viewFilters$ = this.store.pipe(select(fromStore.getViewFilters));

    const defaultDate$ = viewFilters$.pipe(
      map(({ start, end }) => {
        if (start && end) {
          return [start, end];
        }

        return undefined;
      })
    );

    const presetDateSelected$ = defaultDate$.pipe(
      map((selectedData) => {
        if (!selectedData) {
          return '';
        }

        return Object.keys(this.presetDates).find((key) =>
          isEqual(this.presetDates[key], selectedData)
        );
      })
    );

    return combineLatest([defaultDate$, presetDateSelected$]).pipe(
      map(([defaultDate, presetDateSelected]) => {
        return {
          presetDateSelected,
          defaultDate: defaultDate ? defaultDate.map((d) => new Date(d * 1000)) : undefined
        };
      })
    );
  }

  fetchSocialGroups() {
    let search = new HttpParams().append('school_id', this.session.g.get('school').id.toString());
    search = FeedsUtilsService.addGroupTypesParam(search, this.session.g);
    return this.feedsService.getSocialGroups(search) as Observable<ISocialGroup[]>;
  }

  fetchStudents(page): Observable<any[]> {
    let startRecordCount = this.studentsPaginationCountPerPage * (page - 1) + 1;
    // Get an extra record so that we know if there are more records left to fetch
    let endRecordCount = this.studentsPaginationCountPerPage * page + 1;

    let params = new HttpParams()
      .set('sort_direction', 'asc')
      .set('sort_field', 'username')
      .set('school_id', this.session.school.id.toString())
      .set('is_sandbox', String(this.session.school.is_sandbox))
      .set('client_id', this.session.school.client_id.toString())
      .set(
        'search_str',
        Boolean(this.studentsSearchTerm && this.studentsSearchTerm.trim().length)
          ? this.studentsSearchTerm.trim()
          : null
      );

    return this.userService.getAll(params, startRecordCount, endRecordCount).pipe(
      map((results: any[]) => {
        if (results && results.length > this.studentsPaginationCountPerPage) {
          this.studentsHasMorePages = true;
          // Remove the extra record that we fetched to check if we have more records to fetch.
          results = results.splice(0, this.studentsPaginationCountPerPage);
        } else {
          this.studentsHasMorePages = false;
        }
        return results;
      }),
      catchError(() => of([]))
    ) as Observable<any[]>;
  }

  studentsLoadMoreClickHandler(): void {
    this.studentsPageCounter++;
    this.studentsPageStream.next(this.studentsPageCounter);
  }

  emitValue() {
    this.feedSearch.emit(this.query.value);
  }

  getExportDataQueryParams(filterState) {
    const {
      end,
      start,
      users,
      group,
      postType,
      searchTerm,
      flaggedByUser,
      flaggedByModerators
    } = filterState;

    return new HttpParams()
      .set('end', start && end ? end : null)
      .set('group_id', group ? group.id : null)
      .set('start', start && end ? start : null)
      .set('post_types', postType ? postType.id : null)
      .set('school_id', this.session.school.id.toString())
      .set('flagged_by_users_only', flaggedByUser ? '1' : null)
      .set('search_str', searchTerm !== '' ? searchTerm : null)
      .set('removed_by_moderators_or_users', flaggedByModerators ? '1' : null)
      .set('user_ids', users.length ? users.map(({ id }) => id).join(',') : null);
  }

  handleChannel(channel) {
    const { postType } = this.state$;
    this.store.dispatch(fromStore.setGroup({ group: null }));

    if (channel === -1 || (postType && postType.id === channel.id)) {
      channel = null;
    }

    this.store.dispatch(fromStore.setPostType({ postType: channel }));
  }

  handleGroup(selectedGroup) {
    const { group } = this.state$;
    if (group && group.id === selectedGroup.id) {
      selectedGroup = null;
    }
    this.store.dispatch(fromStore.setGroup({ group: selectedGroup }));
    this.store.dispatch(fromStore.setPostType({ postType: null }));
  }

  handleStatus(status: string) {
    const { flaggedByModerators, flaggedByUser } = this.state$;
    if (status === 'archived') {
      this.store.dispatch(fromStore.setFlaggedByUser({ flagged: false }));
      this.store.dispatch(fromStore.setFlaggedByModerator({ flagged: !flaggedByModerators }));
    } else {
      this.store.dispatch(fromStore.setFlaggedByUser({ flagged: !flaggedByUser }));
      this.store.dispatch(fromStore.setFlaggedByModerator({ flagged: false }));
    }
  }

  handleStudent(user: any) {
    this.store.dispatch(fromStore.setFilterUsers({ user }));
  }

  handleClearFilters() {
    this.clearGroup();
    this.store.dispatch(fromStore.clearFilterUsers());
    this.store.dispatch(fromStore.setEndFilter({ end: null }));
    this.store.dispatch(fromStore.setStartFilter({ start: null }));
    this.store.dispatch(fromStore.setPostType({ postType: null }));
    this.store.dispatch(fromStore.setFlaggedByUser({ flagged: false }));
    this.store.dispatch(fromStore.setFlaggedByModerator({ flagged: false }));
  }

  clearGroup() {
    if (!this.groupId) {
      this.store.dispatch(fromStore.setGroup({ group: null }));
    }
  }

  handleDate(date: number[]) {
    const [startDate, endDate] = date;
    const { start, end } = this.state$;

    if (endDate === end && startDate === start) {
      this.store.dispatch(fromStore.setEndFilter({ end: null }));
      this.store.dispatch(fromStore.setStartFilter({ start: null }));
    } else {
      this.store.dispatch(fromStore.setEndFilter({ end: endDate }));
      this.store.dispatch(fromStore.setStartFilter({ start: startDate }));
    }
  }

  parseCalendarDate(date: Date[]) {
    const dates = date.map((d) => CPDate.toEpoch(d, this.session.tz));
    this.handleDate(dates);
  }

  handleClearSelectedStudents() {
    this.store.dispatch(fromStore.clearFilterUsers());
  }

  wallSearchFilterAmplitude(isSearch) {
    const eventName = !isSearch
      ? amplitudeEvents.WALL_APPLIED_FILTERS
      : amplitudeEvents.WALL_SEARCHED_INFORMATION;

    this.cpTracking.amplitudeEmitEvent(
      eventName,
      this.feedsAmplitudeService.getWallFiltersAmplitude()
    );
  }
}
