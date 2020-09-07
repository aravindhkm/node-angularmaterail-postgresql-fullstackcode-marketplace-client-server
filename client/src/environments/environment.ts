// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

// let BASE_PATH = "http://7d8368c2660d.ngrok.io";
// let BASE_IMG="http://7d8368c2660d.ngrok.io";

//Server
// let BASE_PATH = "http://ec2-13-212-83-240.ap-southeast-1.compute.amazonaws.com:5005";
// let BASE_IMG="http://ec2-13-212-83-240.ap-southeast-1.compute.amazonaws.com:5005";
// let SOCKET_PATH="http://ec2-13-212-83-240.ap-southeast-1.compute.amazonaws.com:5006";

let BASE_PATH = "http://32eecff12ef3.ngrok.io";
let BASE_IMG="http://32eecff12ef3.ngrok.io";
let SOCKET_PATH="http://192.168.1.23:3001"

export const environment = {
 production: true,
 // production: false,
 api_url: `${BASE_PATH}`,
 image_url: `${BASE_IMG}`,
 socket_url:`${SOCKET_PATH}`
};


/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
