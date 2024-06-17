// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,

  baseApiUrl: 'http://192.168.170.198:2330/api/v1',
  SOCKET_BASE: 'http://192.168.170.198:2330',

  SECRET_KEY: 'NjIwMjA0NTcxfQ.27VYXVdIMvIbQFJFZ',
  IV_KEY: '5Bl83ks5O9XN80Kj',
  GOOGLE_MAPS_API_KEY: "AIzaSyCZcDAXPsGXXR_7i5Cv3NMPZwjY1JKar40",
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
