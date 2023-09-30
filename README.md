# SAC Pilatus App

# Framework PWA (Progressive Web App)

## Documentation and Support

- https://web.dev/progressive-web-apps/
- https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps
- https://developer.chrome.com/blog/getting-started-pwa/

## Manifest

Integrate this file in the `public` folder of app/website (`manifest.json` must be in root folder `/`):
- [manifest.json](pwa/manifest.json)

Include manifest in header (e.g. in edit page page under `themes` --> `edit page layout` --> `expert settings`):

```
<link rel="manifest" href="manifest.json" />
```

Add the following lines for the app icon and splash screens on iOS there as well:

```
<meta name="theme-color" content="#eb1e26" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-title" content="SAC Pilatus App" />
<meta name="apple-mobile-web-app-status-bar-style" content="black" />
<meta name="apple-touch-startup-image" content="/files/favicon/app-icon-1024x1024.png">
<link rel="apple-touch-icon" href="/files/favicon/app-icon-180x180.png" />
<link rel="apple-touch-startup-image" href="/files/favicon/app-splash-iphone6.png" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" />
<link rel="apple-touch-startup-image" href="/files/favicon/app-splash-iphoneplus.png" media="(device-width: 621px) and (device-height: 1104px) and (-webkit-device-pixel-ratio: 3)" />
<link rel="apple-touch-startup-image" href="/files/favicon/app-splash-iphonex.png" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" />
<link rel="apple-touch-startup-image" href="/files/favicon/app-splash-iphonexr.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)" />
<link rel="apple-touch-startup-image" href="/files/favicon/app-splash-iphonexsmax.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)" />
<link rel="apple-touch-startup-image" href="/files/favicon/app-splash-ipad.png" media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)" />
<link rel="apple-touch-startup-image" href="/files/favicon/app-splash-ipadpro1.png" media="(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2)" />
<link rel="apple-touch-startup-image" href="/files/favicon/app-splash-ipadpro3.png" media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)" />
<link rel="apple-touch-startup-image" href="/files/favicon/app-splash-ipadpro2.png" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)" />
```

## Service Worker

Integrate files in the `public` folder (`service-worker.js` must be in root folder `/`):
- [service-worker.js](pwa/service-worker.js)
- [app.js](pwa/app.js)

Include script in header or body:

```
<script src="app.js" defer></script>
```

Add input botton `A2HS` (add to home screen) on your installation page (or on every page):

```
<button class="add-button" style="color: #ffffff; font-weight: bold; background-color: #026ca0; position: fixed; left: 10px; bottom: 30px; transform: translate(10px, -50%); margin: 0 auto;">
  <img src="/files/favicon/app-icon-16x16.png"> SAC Pilatus App installieren ▼
</button>
```

Add notification button on a page:
```
<button id="notifications">Notifikationen erlauben und starten</button>
```

## More Examples:
- https://github.com/mdn/pwa-examples/tree/master/js13kpwa
- https://github.com/GoogleChrome/samples/tree/gh-pages/service-worker
- https://docs.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/demo-pwas

## Further documentation:

PWA:
- https://docs.pwabuilder.com/#/builder/manifest
- https://developer.mozilla.org/en-US/docs/Web/Manifest
- https://livebook.manning.com/book/progressive-web-apps/chapter-1/

Caching:
- https://livebook.manning.com/book/progressive-web-apps/chapter-3/

Image generators:
- https://www.pwabuilder.com/
- https://appsco.pe/developer/splash-screens

PWA in app stores:
- https://docs.pwabuilder.com/#/builder/quick-start
