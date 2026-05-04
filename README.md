# SAC Pilatus PWA App

A Progressive Web App (PWA) for SAC (Schweizer Alpen-Club) Pilatus section. Optimized for **iOS**, **Android**, and **Windows** without any additional frameworks.

**Version:** 0.3.0 (Updated 2024)

## Features

✅ **Cross-Platform Support** - iOS, Android, Windows  
✅ **Offline Functionality** - Works without internet connection  
✅ **App Installation** - Add to home screen on all platforms  
✅ **Push Notifications** - Subscribe to notifications (Android & Windows)  
✅ **Smart Caching** - Multiple cache strategies for optimal performance  
✅ **Automatic Updates** - Service worker keeps app fresh  
✅ **iOS Optimized** - Full support including web app mode  

## Latest PWA Standards

This PWA implements the latest W3C standards and best practices (2026):

- **Web App Manifest** (latest features/specification, including maskable icons and display override)
- **Latest Service Worker Features** with advanced cache strategies
- **Web App Install Banners** for Android and Windows
- **iOS Web App Support** with native integration
- **Responsive Display Modes** (standalone, minimal-ui, browser)
- **App Shortcuts** for quick access
- **Push Notifications API**
- **Periodic Background Sync** (experimental, only in some browsers—mainly Chromium-based; not supported on iOS/Safari)

## Installation

### Step 1: Copy PWA Files to Your Web Root

Copy these files to your web server root (`/` directory):

```
/service-worker.js   (in root folder)
/app.js              (in root folder)
/manifest.json       (in root folder)
```

### Step 2: Add Manifest Link to HTML Head

Add this to your HTML `<head>` section:

```html
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#eb1e26" />
```

### Step 3: Add Meta Tags for All Platforms

Add these meta tags to your HTML `<head>` for full cross-platform support:

```html
<!-- General Meta Tags -->
<meta name="theme-color" content="#eb1e26" />
<meta name="description" content="App der Sektion Pilatus des Schweizer Alpen-Club" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no" />

<!-- iOS Web App Meta Tags -->
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="SAC Pilatus" />

<!-- iOS Icons (Required for home screen) -->
<link rel="apple-touch-icon" href="/files/favicon/app-icon-180x180.png" />
<link rel="apple-touch-icon" href="/files/favicon/app-icon-152x152.png" sizes="152x152" />
<link rel="apple-touch-icon" href="/files/favicon/app-icon-167x167.png" sizes="167x167" />
<link rel="apple-touch-icon" href="/files/favicon/app-icon-120x120.png" sizes="120x120" />

<!-- iOS Startup Splash Screens (Optional but recommended) -->
<link rel="apple-touch-startup-image" href="/files/favicon/app-splash-iphone6.png" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" />
<link rel="apple-touch-startup-image" href="/files/favicon/app-splash-iphonex.png" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" />
<link rel="apple-touch-startup-image" href="/files/favicon/app-splash-ipad.png" media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)" />

<!-- Android Web App Meta Tags -->
<meta name="mobile-web-app-capable" content="yes" />

<!-- Windows/Desktop Meta Tags -->
<meta name="application-name" content="SAC Pilatus" />
<meta name="msapplication-TileColor" content="#eb1e26" />
<meta name="msapplication-TileImage" content="/files/favicon/app-icon-512x512.png" />
```

### Step 4: Add Service Worker Script to HTML

Add this script to your HTML `<body>` (near the top):

```html
<script src="/app.js" defer></script>
```

### Step 5: Add Installation Button (Optional)

Add this button to allow users to install the app:

```html
<button class="add-button" style="color: #ffffff; font-weight: bold; background-color: #026ca0; position: fixed; left: 10px; bottom: 30px; z-index: 1000;">
  <img src="/files/favicon/app-icon-16x16.png" alt="Icon" style="margin-right: 8px;"> 
  SAC Pilatus App installieren ▼
</button>
```

### Step 6: Add Update Notification (Optional)

Add this div to show when app updates are available:

```html
<div id="update-notification" style="display: none; position: fixed; bottom: 0; left: 0; right: 0; background: #eb1e26; color: white; padding: 16px; text-align: center; z-index: 1001;">
  Eine neue Version ist verfügbar.
  <button id="update-button" style="background: white; color: #eb1e26; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-left: 10px;">
    Aktualisieren
  </button>
</div>
```

## Required Icon Sizes

You need to provide icons in these sizes (place in `/files/favicon/`):

### Core Icons (Required)
- `app-icon-192x192.png` - For Android home screen
- `app-icon-512x512.png` - For Android splash screen and app stores
- `app-icon-192x192-maskable.png` - Maskable icon (Android 13+)
- `app-icon-512x512-maskable.png` - Maskable icon (Android 13+)

### iOS Icons (Recommended)
- `app-icon-180x180.png` - iPhone home screen
- `app-icon-152x152.png` - iPad home screen
- `app-icon-167x167.png` - iPad Pro home screen
- `app-icon-120x120.png` - iPhone Spotlight search

### Additional Icons (Optional but recommended)
- `app-icon-144x144.png` - Android devices
- `app-icon-96x96.png` - Small Android devices
- `app-icon-72x72.png` - Tablet
- `app-icon-48x48.png` - Favicon
- `app-icon-32x32.png` - Favicon
- `app-icon-16x16.png` - Favicon

### Screenshots (Optional)
- `app-screenshot-narrow.png` (540x720) - Mobile screenshots for app stores
- `app-screenshot-wide.png` (1280x720) - Tablet screenshots for app stores

## File Structure

```
/service-worker.js     - Handles caching and offline support
/app.js               - Manages PWA installation and updates
/manifest.json        - App metadata and configuration
/files/favicon/       - Icon and image files
```

## Cache Strategies

The service worker implements intelligent caching based on request type:

### Network-First (HTML Pages)
- Try to fetch from network first
- Fall back to cache if network fails
- Updates cache automatically

### Cache-First (Images & Fonts)
- Serve from cache first for instant loading
- Fetch from network in background

### Network-First with Timeout (API Calls)
- Try network with 5-second timeout
- Fall back to cache if timeout or error occurs

### Stale-While-Revalidate (Other Assets)
- Return cached version immediately
- Fetch fresh version in background

## Platform-Specific Notes

### iOS Requirements

1. **Web App Mode**: Users add via "Share" → "Add to Home Screen"
2. **Standalone Mode**: App runs without Safari UI
3. **Status Bar**: Can be styled with meta tags
4. **Limitations**: 
   - ❌ No push notifications (Apple limitation)
   - ⚠️ Limited background sync
   - 📦 Storage limited to 50MB per domain

### Android Requirements

1. **A2HS Prompt**: Automatic install banner
2. **Manifest**: Required for installation
3. **Icons**: Need both "any" and "maskable" purposes
4. **Features**: Full support for push notifications and background sync

### Windows Requirements

1. **Progressive Enhancement**: Works in all modern browsers
2. **App Windows**: Can be launched from browser
3. **App Shortcuts**: Quick access to key features
4. **Notifications**: Full support

## Development & Testing

### Test Service Worker Registration
```javascript
// Open browser console
navigator.serviceWorker.controller
```

### Check Cache Storage
```javascript
// Open browser console
caches.keys().then(names => console.log(names))
```

### Clear All Caches
```javascript
// Open browser console
caches.keys().then(names => Promise.all(names.map(name => caches.delete(name))))
```

### Force Update
```javascript
// Open browser console
navigator.serviceWorker.controller.postMessage({type: 'SKIP_WAITING'})
```

## Performance Tips

1. **Icon Optimization**: Use tools like ImageOptim or TinyPNG to compress icons
2. **Cache Version**: Increment `CACHE_VERSION` in service-worker.js to force app update
3. **Maskable Icons**: Design icons with 40px safe area in center
4. **Screenshots**: Optimize screenshot size (<100KB each)
5. **Startup Performance**: Minimize JavaScript in `app.js`

## Debugging

### Enable Debug Logging
The app logs to browser console with `[SW]` and `[A2HS]` prefixes.

### Common Issues

**App not installing on Android:**
- Check manifest.json is valid (use [PWA Builder](https://www.pwabuilder.com/))
- Ensure icons are 192x192 and 512x512
- Verify HTTPS is enabled

**App not working on iOS:**
- Check iOS meta tags are present
- Verify apple-touch-icon paths are correct
- Note: iOS doesn't support A2HS prompt (manual "Add to Home Screen")

**Service worker not updating:**
- Clear cache (see Development section)
- Increment `CACHE_VERSION` in service-worker.js
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

## Documentation & Resources

### Official Documentation
- [W3C Web App Manifest](https://www.w3.org/TR/appmanifest/)
- [Service Worker Specification](https://www.w3.org/TR/service-workers/)
- [Web Developer - Progressive Web Apps](https://web.dev/progressive-web-apps/)
- [MDN - Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)

### Platform-Specific Guides
- [Apple - Configuring Web Apps](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html)
- [Google - PWA on Android](https://developer.chrome.com/docs/android/)
- [Microsoft - PWA on Windows](https://docs.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/)

### Tools
- [PWA Builder](https://www.pwabuilder.com/) - Generate manifests and packages
- [WebAIM](https://webaim.org/) - Accessibility testing
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - PWA auditing
- [Squoosh](https://squoosh.app/) - Image optimization
- [Apple App Icon Generator](https://appicons.co/) - Generate iOS icons

### Example PWAs
- [MDN PWA Examples](https://github.com/mdn/pwa-examples)
- [Google PWA Samples](https://github.com/GoogleChrome/samples/tree/gh-pages/service-worker)
- [PWA Starter Kit](https://github.com/Polymer/pwa-starter-kit)

## Changelog

### Version 0.3.0 (2026)
- ✨ Full iOS support with optimized meta tags
- ✨ Improved cache strategies (network-first, cache-first, stale-while-revalidate)
- ✨ Better service worker lifecycle management
- ✨ Enhanced error handling and offline support
- ✨ Added maskable icon support for Android 13+
- ✨ Improved A2HS prompt handling
- 🐛 Fixed manifest JSON syntax errors
- 📱 Optimized for latest iOS versions
- 🔄 Better automatic update mechanism
- 📊 Added periodic background sync support

### Version 0.2.2 (2024)
- Initial PWA setup
- Basic service worker implementation
- A2HS prompt for Android

## License

Copyright © 2023-2026 Jonas Mueller (SAC Section Pilatus). All Rights Reserved.

## Support

For issues or questions about this PWA, please contact Jonas Mueller or the SAC Pilatus section.

