import { TestBed, ComponentFixture, async } from '@angular/core/testing';
import { StoreModule, Store } from '@ngrx/store';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { of } from 'rxjs';

import * as fromStore from '../../../store';

import { FeedsModule } from './../../../feeds.module';
import { FeedItemComponent } from './feed-item.component';
import { mockFeed } from '@controlpanel/manage/feeds/tests';
import { configureTestSuite, CPTestModule } from '@campus-cloud/shared/tests';
import { FeedDropdownComponent } from './../feed-dropdown/feed-dropdown.component';

describe('FeedItemComponent', () => {
  configureTestSuite();
  beforeAll((done) => {
    (async () => {
      TestBed.configureTestingModule({
        imports: [
          CPTestModule,
          FeedsModule,
          StoreModule.forFeature('WALLS_STATE', {
            feeds: fromStore.feedsReducer,
            bannedEmails: fromStore.bannedEmailsReducer
          })
        ],
        providers: []
      });
      await TestBed.compileComponents();
    })()
      .then(done)
      .catch(done.fail);
  });

  let de: DebugElement;
  let store: Store<fromStore.IWallsState>;
  let fixture: ComponentFixture<FeedItemComponent>;
  let component: FeedItemComponent;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(FeedItemComponent);
    component = fixture.componentInstance;

    store = TestBed.inject(Store);

    de = fixture.debugElement;
    component.feed = mockFeed;
    component.isCampusWallView = of(true);

    fixture.detectChanges();
  }));

  describe('onMoved', () => {
    it('should emit with passed param', () => {
      const expected = 'expected';
      spyOn(component.moved, 'emit');

      component.onMoved(expected);

      expect(component.moved.emit).toHaveBeenCalledWith(expected);
    });
  });

  describe('dropdown element', () => {
    it('should be visibile for non deleted threads', () => {
      component.feed = {
        ...mockFeed,
        flag: 0
      };
      fixture.detectChanges();
      const dropdown = de.query(By.directive(FeedDropdownComponent));

      expect(dropdown).not.toBeNull();
    });

    it('should be hidden for deleted threads', () => {
      component.feed = {
        ...mockFeed,
        flag: -3
      };
      fixture.detectChanges();
      const dropdown = de.query(By.directive(FeedDropdownComponent));

      expect(dropdown).toBeNull();
    });
  });

  describe('onSelected', () => {
    it('should launch approval modal', () => {
      component.onSelected(1);
      expect(component.isApproveModal).toBe(true);
    });

    it('should launch move modal', () => {
      component.onSelected(2);
      expect(component.isMoveModal).toBe(true);
    });

    it('should launch delete modal', () => {
      component.onSelected(3);
      expect(component.isDeleteModal).toBe(true);
    });
  });

  describe('onDeletedComment', () => {
    it('should not let you set a negative comment count', () => {
      const spy: jasmine.Spy = spyOn(store, 'dispatch');
      component.feed = {
        ...component.feed,
        comment_count: 0
      };
      fixture.detectChanges();

      component.onDeletedComment();

      const { thread } = spy.calls.mostRecent().args[0];
      const { comment_count } = thread;

      expect(comment_count).toBe(0);
      expect(store.dispatch).toHaveBeenCalled();
    });

    it('should dispatch updateThread with updated thread', () => {
      const spy: jasmine.Spy = spyOn(store, 'dispatch');
      component.feed = {
        ...component.feed,
        comment_count: 4
      };
      fixture.detectChanges();

      component.onDeletedComment();

      const { thread } = spy.calls.mostRecent().args[0];
      const { comment_count } = thread;

      expect(comment_count).toBe(3);
      expect(store.dispatch).toHaveBeenCalled();
    });
  });

  describe('onExpandComments', () => {
    it('should dispatch expandComments with thread id', () => {
      const spy: jasmine.Spy = spyOn(store, 'dispatch');

      component.onExpandComments();

      const { threadId } = spy.calls.mostRecent().args[0];

      expect(threadId).toBe(component.feed.id);
      expect(store.dispatch).toHaveBeenCalled();
    });
  });

  describe('onReplied', () => {
    it('should dispatch updateThread with udpated comment count', () => {
      const spy: jasmine.Spy = spyOn(store, 'dispatch');

      component.onReplied();

      const { thread } = spy.calls.mostRecent().args[0];
      const { comment_count } = thread;

      expect(comment_count).toBe(mockFeed.comment_count + 1);
      expect(store.dispatch).toHaveBeenCalled();
    });
  });
});
