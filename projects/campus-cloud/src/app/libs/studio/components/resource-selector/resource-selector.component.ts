import {
  Input,
  Output,
  Component,
  QueryList,
  EventEmitter,
  ContentChildren,
  AfterContentInit,
  ChangeDetectionStrategy
} from '@angular/core';
import { Mixin, Destroyable } from '@campus-cloud/shared/mixins';
import { Subject } from 'rxjs';

import { ContentUtilsProviders } from '../../providers';
import { ResourceSelectorItemComponent } from '../resource-selector-item';
import { environment } from '@projects/campus-cloud/src/environments/environment';

@Component({
  exportAs: 'resourceSelector',
  selector: 'cp-resource-selector',
  template: `
    <div class="resource_selector">
      <div class="row">
        <div class="col-12">
          <ul class="resource_selector__nav">
            <li
              *ngFor="let tab of _items"
              (click)="selectTab(tab)"
              [class.active]="tab.active"
              class="resource_selector__nav_item hover"
            >
              <cp-resource-selector-button
                [active]="tab.active"
                [iconSrc]="resourceIdToImageMap[tab.resourceId]"
              >
                {{ tab.title }}
              </cp-resource-selector-button>
            </li>
          </ul>
        </div>
      </div>
      <div class="tabs__content">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styleUrls: ['./resource-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
@Mixin([Destroyable])
export class ResourceSelectorComponent implements AfterContentInit {
  public activeTab: string = null;

  @Input() filterByWebApp = false;
  @Input() filterByLoginStatus = false;

  @Output() itemClicked: EventEmitter<string> = new EventEmitter();

  @ContentChildren(ResourceSelectorItemComponent) items: QueryList<ResourceSelectorItemComponent>;

  _items: ResourceSelectorItemComponent[] = [];

  resourceIdToImageMap = {
    [ContentUtilsProviders.contentTypes
      .single]: `${environment.root}assets/svg/studio/ic-studio-item.svg`,
    [ContentUtilsProviders.contentTypes
      .list]: `${environment.root}assets/svg/studio/ic-studio-resource.svg`,
    [ContentUtilsProviders.contentTypes
      .web]: `${environment.root}assets/svg/studio/ic-studio-link.svg`,
    [ContentUtilsProviders.contentTypes
      .thirdParty]: `${environment.root}assets/svg/studio/ic-studio-app.svg`,
    [ContentUtilsProviders.contentTypes
      .resourceList]: `${environment.root}assets/svg/studio/ic-studio-list.svg`
  };

  destroy$ = new Subject<null>();
  emitDestroy() {}

  constructor() {}

  updateContentTypeByPersona() {
    const filters = [
      this.filterByWebApp ? ContentUtilsProviders.isWebAppContent : null,
      this.filterByLoginStatus ? ContentUtilsProviders.isPublicContent : null
    ].filter((f) => f);

    const resourceItemComponents = [...this.items.map((r: ResourceSelectorItemComponent) => r)];
    const resourceItemComponentsWithContent = resourceItemComponents.filter(
      (r: ResourceSelectorItemComponent) => {
        /**
         * Resource List is available to every persona but has no Content
         * Web Content Type has no link_url param
         */
        const overrides = [
          ContentUtilsProviders.contentTypes.web,
          ContentUtilsProviders.contentTypes.resourceList
        ];

        if (overrides.includes(r.resourceId)) {
          return true;
        }

        const contentForType = ContentUtilsProviders.getResourcesForType(r.resourceId, filters);
        return contentForType.length > 0;
      }
    );

    this._items = [...resourceItemComponentsWithContent];

    const anyActiveTypeAfterFiltering = this._items.find((i) => i.active);

    if (!anyActiveTypeAfterFiltering) {
      Promise.resolve().then(() => this.selectTab(this._items[0]));
    } else {
      Promise.resolve().then(() => (this.activeTab = anyActiveTypeAfterFiltering.resourceId));
    }
  }

  ngAfterContentInit() {
    this.updateContentTypeByPersona();
  }

  selectTab(resource: ResourceSelectorItemComponent) {
    this.activeTab = resource.resourceId;
    this.items.forEach((r: ResourceSelectorItemComponent) => (r.active = false));
    resource.active = true;
    this.itemClicked.emit(resource.resourceId);
  }
}
