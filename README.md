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
<link rel="manifest" href="manifest.json">
```

Add the following lines for the splash screens on iOS there as well:

```
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<link rel="apple-touch-startup-image" href="/files/favicon/app-icon-1024x1024.png">
<link rel="apple-touch-startup-image" href="/files/favicon/app-icon-1024x1024.png" media="(device-width: 512px) and (device-height: 512px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">
<link rel="apple-touch-startup-image" href="/files/favicon/app-icon-1024x1024.png" media="(min-device-width: 512px) and (max-device-width: 512px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait)">
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
- https://livebook.manning.com/book/progressive-web-apps/chapter-1/

Caching:
- https://livebook.manning.com/book/progressive-web-apps/chapter-3/
