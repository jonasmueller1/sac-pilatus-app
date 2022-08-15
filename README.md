# SAC Pilatus App

# Framework PWA (Progressive Web App)

## Documentation and Support

- https://web.dev/progressive-web-apps/
- https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps
- https://developer.chrome.com/blog/getting-started-pwa/

## Manifest

Integrate this file in the root folder of app/website:
- [manifest.json](pwa/manifest.json)

Include manifest in header (e.g. in template page 'fe_page_sac_pilatus.html5`:

```
<link rel="manifest" href="manifest.json">
```

## Service Worker

Integrate files in root folder (`service-worker.js` must be in root folder `/`):
- [service-worker.js](pwa/service-worker.js)
- [app.js](pwa/app.js)

Include script in header or body:

```
<script src="app.js" defer></script>
```

Add input botton `A2HS` (add to home screen) on your installation page (or on every page):

```
<button class="add-button" style="color: #ffffff; font-weight: bold; background-color: #026ca0; position: fixed; left: 10px; bottom: 30px; transform: translate(10px, -50%); margin: 0 auto;">
  <img src="/files/favicon/favicon-16x16.png"> SAC Pilatus App installieren ▼
</button>
```

## More Examples:
- https://github.com/mdn/pwa-examples/tree/master/js13kpwa/data
- https://github.com/GoogleChrome/samples/tree/gh-pages/service-worker
