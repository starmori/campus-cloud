// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
import { IEnvironment } from './environment.interface';

export const environment: IEnvironment = {
  root: '/',
  production: false,
  flags: {
    '*': true
  },
  keys: {
    readyApiKey: 'IUm65kXecFWch54mzJjpy63spWZX3AVp',
    beamerApiKey: 'b_Fi9BaLL/1kzue1MjGOiATUB5Kk8vkDKeO7nSqKSlFxo=',
    sentryDsn: 'https://0b6c76a5691d4b7399394aa79753acef@sentry.io/207033'
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
