import {
  Input,
  OnInit,
  Output,
  Component,
  HostBinding,
  EventEmitter,
  ViewEncapsulation
} from '@angular/core';
import { mergeMap, map, tap, withLatestFrom } from 'rxjs/operators';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Observable, Subject, of, merge } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { Store, select } from '@ngrx/store';

import * as fromStore from '../../../store';
import { CPSession } from '@campus-cloud/session';
import { FeedsService } from './../../../feeds.service';
import { amplitudeEvents } from '@campus-cloud/shared/constants';
import { CPTrackingService } from '@campus-cloud/shared/services';
import { FeedsUtilsService } from '@controlpanel/manage/feeds/feeds.utils.service';
import { FeedsAmplitudeService } from '@controlpanel/manage/feeds/feeds.amplitude.service';

declare var $: any;

@Component({
  selector: 'cp-feed-comment',
  templateUrl: './feed-comment.component.html',
  styleUrls: ['./feed-comment.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FeedCommentComponent implements OnInit {
  @Input()
  set showParentThread(showParentThread: boolean | string) {
    this._showParentThread = coerceBooleanProperty(showParentThread);
  }

  @Input()
  set comment(comment: any) {
    this._comment = FeedsUtilsService.parseComment(comment);
  }

  @Input() last: boolean;
  @Input() replyView: number;
  @Input() wallCategory: string;
  @Input() readOnlyMode = false;

  @Input() isCampusWallView: Observable<number>;
  @Output() edited: EventEmitter<any> = new EventEmitter();
  @Output() deleted: EventEmitter<number> = new EventEmitter();
  @Output() approved: EventEmitter<number> = new EventEmitter();

  _comment;
  isDeleteModal;
  isApproveModal;
  editMode = false;
  isComment = true;
  threadIsExpanded = false;
  _showParentThread = false;
  loading$: Observable<boolean>;
  embbededPost$: Observable<any>;
  loadEmbeddedPost$: Observable<void>;
  parentThreadUpdated = new Subject();
  loadEmbeddedPost = new Subject<void>();
  parentThreadHasCommentsExpanded$: Observable<boolean>;

  constructor(
    private service: FeedsService,
    private session: CPSession,
    private cpTracking: CPTrackingService,
    private store: Store<fromStore.IWallsState>,
    private feedsAmplitudeService: FeedsAmplitudeService
  ) {}

  @HostBinding('class.nested-item')
  get isNestedItem() {
    return this._showParentThread;
  }

  @HostBinding('class.cp-feed-comment')
  ngOnInit() {
    this.parentThreadHasCommentsExpanded$ = this.store
      .pipe(select(fromStore.getExpandedThreadIds))
      .pipe(
        map((expandedThreads) =>
          this._showParentThread
            ? expandedThreads.includes(this._comment[this.getParentThreadKey()])
            : false
        )
      );

    this.loadEmbeddedPost$ = this.loadEmbeddedPost.asObservable();

    const search = new HttpParams().set('school_id', this.session.school.id.toString());
    const reload$ = merge(this.loadEmbeddedPost$, this.parentThreadUpdated.asObservable());

    this.embbededPost$ = reload$.pipe(
      withLatestFrom(this.parentThreadHasCommentsExpanded$),
      tap(([_, expandedThreads]) => {
        this.threadIsExpanded = !this.threadIsExpanded;
        /**
         * in order to display the matched
         * results after closing the parent thread
         */
        if (!this.threadIsExpanded && expandedThreads) {
          this.store.dispatch(
            fromStore.expandComments({ threadId: this._comment[this.getParentThreadKey()] })
          );
        }
      }),
      mergeMap(() => {
        const campusThread$ = this.service.getCampusThreadById(
          this._comment.campus_thread_id,
          search
        );
        const groupThread$ = this.service.getGroupThreadById(
          this._comment.group_thread_id,
          new HttpParams().set('group_id', this._comment.group_id)
        );
        const stream$ = this.isGroupThread() ? groupThread$ : campusThread$;
        return this.threadIsExpanded ? stream$ : of(null);
      }),
      tap((res) => {
        if (this.threadIsExpanded) {
          this.trackShowPost(res);
        }
      })
    );
  }

  onDeleteNestedThread() {
    this.store.dispatch(
      fromStore.removeResult({
        payload: { resultId: this._comment[this.getParentThreadKey()], type: 'THREAD' }
      })
    );
  }

  onSelected(action) {
    switch (action) {
      case 1:
        this.isApproveModal = true;
        setTimeout(
          () => {
            $('#approveCommentModal').modal({ keyboard: true, focus: true });
          },

          1
        );
        break;
      case 3:
        this.isDeleteModal = true;
        setTimeout(
          () => {
            $('#deleteFeedCommentModal').modal({ keyboard: true, focus: true });
          },

          1
        );
        break;
    }
  }

  trackShowPost(feed) {
    this.cpTracking.amplitudeEmitEvent(
      amplitudeEvents.WALL_VIEWED_POST,
      this.feedsAmplitudeService.getWallCommonAmplitudeProperties(feed)
    );
  }

  private isGroupThread() {
    return 'group_thread_id' in this._comment;
  }

  private getParentThreadKey() {
    return this.isGroupThread() ? 'group_thread_id' : 'campus_thread_id';
  }
}
