import { get as _get, sortBy, isEmpty, isEqual } from 'lodash';
import { Injectable } from '@angular/core';

import { ExtraDataType } from '../../models';
import { CPI18nService } from '@campus-cloud/shared/services';
import { CampusLink } from '@controlpanel/customise/personas/tiles/tile';
import { TilesUtilsService } from '@controlpanel/customise/personas/tiles/tiles.utils.service';

export interface IStudioContentResource {
  id: string;
  login_required?: boolean;
  link_type?: number;
  label: string;
  meta?: {
    link_params: any;
    link_url?: string;
    open_in_browser?: number;
    extra_data_type?: ExtraDataType;
  };
}

@Injectable()
export class ContentUtilsProviders {
  constructor(private cpI18n: CPI18nService) {}

  static readonly html5ExtraDataTypes = [
    ExtraDataType.HOLDS_WEB,
    ExtraDataType.BURSAR_WEB,
    ExtraDataType.FINANCIAL_AID_WEB,
    ExtraDataType.ENROLLMENT_WEB,
    ExtraDataType.TODO_WEB,
    ExtraDataType.COURSE_CATALOG_WEB,
    ExtraDataType.CLASS_SEARCH_WEB,
    ExtraDataType.ASI_VOTING_WEB,
    ExtraDataType.TUITION_CALCULATOR_WEB,
    ExtraDataType.EXAM_SCHEDULED_WEB,
    ExtraDataType.SURVEY_WEB
  ];

  static readonly contentTypes = {
    web: 'webLink',
    list: 'resource',
    single: 'singleItem',
    thirdParty: 'thirdPartyApp',
    resourceList: 'resourceList'
  };

  static isWebAppContent(resource: IStudioContentResource) {
    const linkUrl = _get(resource, ['meta', 'link_url'], false);

    if (!linkUrl) {
      return false;
    }

    return TilesUtilsService.webAppSupportedLinkUrls.includes(linkUrl);
  }

  static isOpenInAppBrowser(resource: IStudioContentResource) {
    const openInBrowser = _get(resource, ['meta', 'open_in_browser'], 0);
    const linkType = _get(resource, ['link_type'], 0);

    return openInBrowser !== 0 && linkType === 0;
  }

  static isPublicContent(resource: IStudioContentResource) {
    const linkUrl = _get(resource, ['meta', 'link_url'], false);

    if (!linkUrl) {
      return true;
    }

    return !TilesUtilsService.loginRequiredTiles.includes(linkUrl);
  }

  static getContentTypeByCampusLink(campusLink) {
    let resource;
    const { link_url } = campusLink;
    const resources = ContentUtilsProviders.resourceTypes();

    if (TilesUtilsService.isIntegrationLink(link_url)) {
      return ContentUtilsProviders.contentTypes.list;
    }

    /**
     * loop through keys filter by the ones with linkUrl values
     * and return the one matching the linkUrl from `campusLink`
     */
    resource = Object.keys(resources).find((resourceKey) =>
      resources[resourceKey]
        .filter(
          (resourcesByResourceType: IStudioContentResource) => resourcesByResourceType.meta.link_url
        )
        .some(
          (resourcesWithMetaURL: IStudioContentResource) =>
            resourcesWithMetaURL.meta.link_url === campusLink.link_url
        )
    );
    if (!resource) {
      /**
       * if not found above its either Web or Custom list, since those get filter out
       */
      return link_url === CampusLink.campusLinkList
        ? ContentUtilsProviders.contentTypes.resourceList
        : ContentUtilsProviders.contentTypes.web;
    }
    return resource;
  }

  static getWebLinkContentType({ link_type, open_in_browser }): IStudioContentResource | undefined {
    return ContentUtilsProviders.resourceTypes()[ContentUtilsProviders.contentTypes.web].find(
      (l) => {
        const regularWebLinkType = link_type === 0;
        return regularWebLinkType
          ? l.meta.open_in_browser === +open_in_browser
          : l.link_type === link_type;
      }
    );
  }

  static resourceTypes(): { [key: string]: Array<IStudioContentResource> } {
    return {
      [ContentUtilsProviders.contentTypes.single]: [
        {
          id: 'forms',
          label: 't_personas_tile_create_resource_type_form',
          meta: {
            link_params: {},
            link_url: CampusLink.form
          }
        },
        {
          id: 'subscribable_calendar',
          label: 't_personas_tile_create_resource_type_subscribable_calendar',
          meta: {
            link_params: {},
            link_url: CampusLink.subscribableCalendar
          }
        },
        {
          id: 'campus_service',
          label: 't_personas_tile_create_resource_type_campus_service',
          meta: {
            link_params: {},
            link_url: CampusLink.campusService
          }
        },
        {
          id: 'store',
          label: 't_personas_tile_create_resource_type_store',
          meta: {
            link_params: {},
            link_url: CampusLink.store
          }
        }
      ],
      [ContentUtilsProviders.contentTypes.list]: [
        {
          id: 'health_pass',
          label: 't_personas_tile_create_resource_type_health_pass',
          meta: {
            link_params: {},
            link_url: CampusLink.healthPass
          }
        },
        {
          id: 'academic_calendar',
          label: 't_personas_tile_create_resource_type_academic_calendar',
          meta: {
            link_params: {},
            link_url: CampusLink.academicCalendarList
          }
        },
        {
          id: 'groups_and_clubs',
          label: 't_personas_tile_create_store_list_groups_and_clubs',
          meta: {
            link_params: {
              category_ids: [-1]
            },
            link_url: CampusLink.storeList
          }
        },
        {
          id: 'athletics_club',
          label: 't_personas_tile_create_resource_type_athletics_club',
          meta: {
            link_params: {
              category_ids: [16]
            },
            link_url: CampusLink.storeList
          }
        },
        {
          id: 'courses',
          label: 't_personas_tile_create_resource_type_courses',
          meta: {
            link_params: {},
            link_url: CampusLink.courseSearch
          }
        },
        {
          id: 'deal_store_list',
          label: 't_personas_tile_create_resource_type_deal_store_list',
          meta: {
            link_params: {},
            link_url: CampusLink.dealStoreList
          }
        },
        {
          id: 'timetable',
          label: 't_personas_tile_create_resource_type_timetable',
          meta: {
            link_params: {},
            link_url: CampusLink.timetable
          }
        },
        {
          id: 'dining',
          label: 'dining',
          meta: {
            link_params: {},
            link_url: CampusLink.dining
          }
        },
        {
          id: 'directory',
          label: 't_personas_tile_create_resource_type_directory',
          meta: {
            link_params: {},
            link_url: CampusLink.directory,
            extra_data_type: ExtraDataType.DIRECTORY
          }
        },
        {
          id: 'follett',
          label: '[NOTRANSLATE]Follett[NOTRANSLATE]',
          meta: {
            link_params: {},
            link_url: CampusLink.follett,
            extra_data_type: ExtraDataType.FOLLETT
          }
        },
        {
          id: 'survey_web',
          label: '[NOTRANSLATE]survey_web[NOTRANSLATE]',
          meta: {
            link_params: {},
            link_url: CampusLink.integration,
            extra_data_type: ExtraDataType.SURVEY_WEB
          }
        },
        {
          id: 'exam_scheduled_web',
          label: '[NOTRANSLATE]exam_scheduled_web[NOTRANSLATE]',
          meta: {
            link_params: {},
            link_url: CampusLink.integration,
            extra_data_type: ExtraDataType.EXAM_SCHEDULED_WEB
          }
        },
        {
          id: 'tuition_calculator_web',
          label: '[NOTRANSLATE]tuition_calculator_web[NOTRANSLATE]',
          meta: {
            link_params: {},
            link_url: CampusLink.integration,
            extra_data_type: ExtraDataType.TUITION_CALCULATOR_WEB
          }
        },
        {
          id: 'asi_voting_web',
          label: '[NOTRANSLATE]asi_voting_web[NOTRANSLATE]',
          meta: {
            link_params: {},
            link_url: CampusLink.integration,
            extra_data_type: ExtraDataType.ASI_VOTING_WEB
          }
        },
        {
          id: 'class_search_web',
          label: '[NOTRANSLATE]class_search_web[NOTRANSLATE]',
          meta: {
            link_params: {},
            link_url: CampusLink.integration,
            extra_data_type: ExtraDataType.CLASS_SEARCH_WEB
          }
        },
        {
          id: 'course_catalog_web',
          label: '[NOTRANSLATE]course_catalog_web[NOTRANSLATE]',
          meta: {
            link_params: {},
            link_url: CampusLink.integration,
            extra_data_type: ExtraDataType.COURSE_CATALOG_WEB
          }
        },
        {
          id: 'todo_web',
          label: '[NOTRANSLATE]todo_web[NOTRANSLATE]',
          meta: {
            link_params: {},
            link_url: CampusLink.integration,
            extra_data_type: ExtraDataType.TODO_WEB
          }
        },
        {
          id: 'enrollment_web',
          label: '[NOTRANSLATE]enrollment_web[NOTRANSLATE]',
          meta: {
            link_params: {},
            link_url: CampusLink.integration,
            extra_data_type: ExtraDataType.ENROLLMENT_WEB
          }
        },
        {
          id: 'financial_aid_web',
          label: '[NOTRANSLATE]financial_aid_web[NOTRANSLATE]',
          meta: {
            link_params: {},
            link_url: CampusLink.integration,
            extra_data_type: ExtraDataType.FINANCIAL_AID_WEB
          }
        },
        {
          id: 'bursar_web',
          label: '[NOTRANSLATE]bursar_web[NOTRANSLATE]',
          meta: {
            link_params: {},
            link_url: CampusLink.integration,
            extra_data_type: ExtraDataType.BURSAR_WEB
          }
        },
        {
          id: 'holds_web',
          label: '[NOTRANSLATE]holds_web[NOTRANSLATE]',
          meta: {
            link_params: {},
            link_url: CampusLink.integration,
            extra_data_type: ExtraDataType.HOLDS_WEB
          }
        },
        {
          id: 'enrollment',
          label: 't_personas_tile_create_resource_type_enrollment',
          meta: {
            link_params: {},
            link_url: CampusLink.enrollment,
            extra_data_type: ExtraDataType.ENROLLMENT
          }
        },
        {
          id: 'event_list',
          label: 't_personas_tile_create_resource_type_event_list',
          meta: {
            link_params: {},
            link_url: CampusLink.eventList
          }
        },
        {
          id: 'job_list',
          label: 't_personas_tile_create_resource_type_job_list',
          meta: {
            link_params: {},
            link_url: CampusLink.jobList
          }
        },
        {
          id: 'campus_poi_list',
          label: 't_personas_tile_create_resource_type_campus_poi_list',
          meta: {
            link_params: {},
            link_url: CampusLink.campusPoiList
          }
        },
        {
          id: 'user_orientation_calendar_list',
          label: 't_personas_tile_create_resource_type_user_orientation_calendar_list',
          meta: {
            link_params: {},
            link_url: CampusLink.userOrientationCalendarList
          }
        },
        {
          id: 'orientation_calendar_list',
          label: 't_personas_tile_create_resource_type_orientation_calendar_list',
          meta: {
            link_params: {},
            link_url: CampusLink.orientationCalendarList
          }
        },
        {
          id: 'service_by_category_id',
          label: 't_personas_tile_create_resource_type_service_by_category_id',
          meta: {
            link_params: {},
            link_url: CampusLink.campusServiceList
          }
        }
      ],
      [ContentUtilsProviders.contentTypes.web]: [
        {
          id: 'web_link',
          link_type: 0,
          label: 't_personas_tile_create_type_resource_web_link',
          meta: {
            link_params: {},
            open_in_browser: 0
          }
        },
        {
          id: 'external_link',
          link_type: 0,
          label: 't_personas_tile_create_type_resource_external_link',
          meta: {
            link_params: {},
            open_in_browser: 1
          }
        },
        {
          id: 'external_web_app',
          link_type: 5,
          label: 't_personas_tile_create_resource_type_external_web_app',
          meta: {
            link_params: {},
            open_in_browser: 0
          }
        }
      ],
      [ContentUtilsProviders.contentTypes.thirdParty]: [
        {
          id: 'external_app_open',
          link_type: 4,
          label: 't_personas_resource_third_party_app',
          meta: {
            link_params: {},
            link_url: CampusLink.appOpen
          }
        }
      ],
      [ContentUtilsProviders.contentTypes.resourceList]: []
    };
  }

  static getResourceItemByLinkType(
    items: IStudioContentResource[],
    linkType: number
  ): boolean | undefined {
    return items.map((i) => i.link_type).includes(linkType);
  }

  static getResourceItemByLinkUrl(
    items: IStudioContentResource[],
    linkUrl: string
  ): boolean | undefined {
    return items.map((i) => i.meta.link_url).includes(linkUrl);
  }

  static getResourcesForType(
    resourceType: string,
    filters: Function[] = []
  ): Array<IStudioContentResource> {
    const resources: Array<IStudioContentResource> = ContentUtilsProviders.resourceTypes()[
      resourceType
    ];

    if (!filters.length) {
      return resources;
    }

    return resources.filter((resource) => filters.every((filterByFn) => filterByFn(resource)));
  }

  static getResourceType(
    { link_url, link_params },
    resource: IStudioContentResource[]
  ): IStudioContentResource {
    /**
     * check all available resources, if link_params is
     * not empty, then ensure both link_url and link_params match
     * (Athletics and Clubs have the same link_url but different link_params)
     * else just check the link url matches
     */
    return resource
      .filter((item: IStudioContentResource) => item.meta)
      .find((item: IStudioContentResource) =>
        isEmpty(item.meta.link_params)
          ? item.meta.link_url === link_url
          : item.meta.link_url === link_url && isEqual(item.meta.link_params, link_params)
      );
  }

  resourcesToIItem(resources: IStudioContentResource[]): Array<IStudioContentResource> {
    if (!resources) {
      return [{ label: '---', id: null, meta: null }];
    }

    return [
      ...sortBy(
        resources.map((r: IStudioContentResource) => {
          return {
            ...r,
            label: this.cpI18n.translate(r.label)
          };
        }),
        (r: any) => r.label
      )
    ];
  }
}
