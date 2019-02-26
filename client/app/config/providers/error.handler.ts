/*tslint:disable:max-line-length */
import { ErrorHandler } from '@angular/core';
import { SentryEvent } from '@sentry/types';
import { get as _get } from 'lodash';

import { isStaging } from '@app/config/env';
import { CPLogger } from '@shared/services';
import { environment } from '@client/environments/environment';
import { DEV_SERVER_URL, LOCAL_PROD_URL } from '@shared/constants';

export class CPErrorHandler extends ErrorHandler {
  constructor() {
    super();
    this.init();
  }

  init() {
    CPLogger.init({
      environment: environment.envName,
      blacklistUrls: [DEV_SERVER_URL, LOCAL_PROD_URL],
      dsn: environment.keys.sentryDsn,
      beforeSend(event: SentryEvent) {
        if (isStaging) {
          /**
           * Do not trigger the
           * modal when running E2E tests
           */
          const e2eUserId = 18845;
          const user = _get(event, ['user', 'id'], null);
          if (user === e2eUserId) {
            return;
          }

          CPLogger.showFeedBackForm();
        }
        return event;
      }
    });
  }

  handleError(err: any): void {
    CPLogger.exception(err.originalError || err);
  }
}