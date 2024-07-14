## Tunnelling
https://www.npmjs.com/package/localtunnel ====> lt --port 8000

ionic cap run android --livereload --external --public-host={{ip}}
## To deploy your app to prod
1. `ng build` // Like you normal angular app
2. `ionic cap sync android` {{or ios}}
3. Change your appId in capacitor.config.ts
4. `ionic cap open android` {{ or ios}}.

For Android
1. Note the packageId used in the AndroidManifest.xml. Change it if necessary to match the one in capacitor.config.ts
2. 
   a. Go to android -> app -> src -> main -> res -> values -> string.xml, 
   b. Change the app_name and title_activity_main value. You can use thesame value
   c. Change package_name and custom_url_scheme to match the appId in capacitor.config.ts
3. Go to the build.gradle file inside at android -> app -> src -> build.gradle
   a. versionName == visible to the outside world
   b. versionCode == Helps play store determine the version of the app
   c. change the applicationId to match appId above

For iOS
1. Go to ios -> App -> App -> Info.plist and configure the key/string pairs

For Splash screen