import { Component, ElementRef, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { CP_PRIVILEGES_MAP } from './../../constants';
import { canAccountLevelReadResource, canSchoolReadResource } from './../../utils/privileges';
import { CPSession, ISchool, IUser } from '../../../session';
import { amplitudeEvents } from '../../constants/analytics';
import { CPTrackingService } from '../../services';

@Component({
  selector: 'cp-topbar',
  templateUrl: './cp-topbar.component.html',
  styleUrls: ['./cp-topbar.component.scss']
})
export class CPTopBarComponent implements OnInit {
  user: IUser;
  amplitudeEvents;
  school: ISchool;
  canNotify = false;
  canManage = false;
  canAssess = false;
  canAudience = false;
  canCustomise = false;
  manageHomePage: string;

  isManageActiveRoute;
  logo = require('public/svg/logo.svg');
  defaultImage = require('public/default/user.png');

  constructor(
    public el: ElementRef,
    public session: CPSession,
    public router: Router,
    public cpTracking: CPTrackingService
  ) {}

  getManageHomePage() {
    if (canSchoolReadResource(this.session.g, CP_PRIVILEGES_MAP.events)) {
      return 'events';
    } else if (canSchoolReadResource(this.session.g, CP_PRIVILEGES_MAP.moderation)) {
      return 'feeds';
    } else if (
      canAccountLevelReadResource(this.session.g, CP_PRIVILEGES_MAP.clubs) ||
      canSchoolReadResource(this.session.g, CP_PRIVILEGES_MAP.clubs)
    ) {
      return 'clubs';
    } else if (
      canAccountLevelReadResource(this.session.g, CP_PRIVILEGES_MAP.athletics) ||
      canSchoolReadResource(this.session.g, CP_PRIVILEGES_MAP.athletics)
    ) {
      return 'athletics';
    } else if (
      canAccountLevelReadResource(this.session.g, CP_PRIVILEGES_MAP.services) ||
      canSchoolReadResource(this.session.g, CP_PRIVILEGES_MAP.services)
    ) {
      return 'services';
    } else if (canSchoolReadResource(this.session.g, CP_PRIVILEGES_MAP.calendar)) {
      return 'calendars';
    } else if (canSchoolReadResource(this.session.g, CP_PRIVILEGES_MAP.campus_maps)) {
      return 'locations';
    } else if (canSchoolReadResource(this.session.g, CP_PRIVILEGES_MAP.links)) {
      return 'links';
    } else if (canSchoolReadResource(this.session.g, CP_PRIVILEGES_MAP.app_customization)) {
      return 'customization';
    } else if (canSchoolReadResource(this.session.g, CP_PRIVILEGES_MAP.orientation)) {
      return 'orientation';
    } else if (canSchoolReadResource(this.session.g, CP_PRIVILEGES_MAP.jobs)) {
      return 'jobs';
    } else if (canSchoolReadResource(this.session.g, CP_PRIVILEGES_MAP.deals)) {
      return 'deals';
    }

    return null;
  }

  isManage(url) {
    return url.split('/').includes('manage');
  }

  trackMenu(menu_name) {
    const eventName = amplitudeEvents.CLICKED_MENU;
    const eventProperties = { menu_name };

    this.cpTracking.amplitudeEmitEvent(eventName, eventProperties);
  }

  ngOnInit() {
    this.user = this.session.g.get('user');
    this.school = this.session.g.get('school');

    this.manageHomePage = this.getManageHomePage();

    this.canNotify = canSchoolReadResource(this.session.g, CP_PRIVILEGES_MAP.campus_announcements);
    this.canAudience = canSchoolReadResource(this.session.g, CP_PRIVILEGES_MAP.audience);
    this.canAssess = canSchoolReadResource(this.session.g, CP_PRIVILEGES_MAP.assessment);
    this.canCustomise = canSchoolReadResource(this.session.g, CP_PRIVILEGES_MAP.app_customization);

    this.isManageActiveRoute = this.isManage(this.router.url);

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isManageActiveRoute = this.isManage(event.url) ? true : false;
      }
    });

    this.amplitudeEvents = {
      menu_manage: amplitudeEvents.MENU_MANAGE,
      menu_notify: amplitudeEvents.MENU_NOTIFY,
      menu_assess: amplitudeEvents.MENU_ASSESS,
      menu_customize: amplitudeEvents.MENU_CUSTOMIZE,
      menu_audience: amplitudeEvents.MENU_AUDIENCE
    };
  }
}
