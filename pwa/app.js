/*
 Copyright 2023-2026 Jonas Mueller (SAC Section Pilatus). All Rights Reserved.
 Updated 2026 with improved cache strategies for iOS, Android, and Windows.
 App v0.3.0 - Full PWA support including Web Push, A2HS, and cross-platform compatibility
 */

let swRegistration = null;

/**
 * Detects if the app is running on iOS
 */
function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

/**
 * Detects if the PWA is installed (standalone mode)
 */
function isPWAInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches || 
         window.navigator.standalone === true ||
         document.referrer.includes('android-app://');
}

/**
 * Initialize the PWA app
 */
window.addEventListener('load', function() {   
  initializeApp();
});

/**
 * Main app initialization function
 */
function initializeApp() {
  console.log('Initializing SAC Pilatus PWA');
  console.log('iOS:', isIOS());
  console.log('PWA Installed:', isPWAInstalled());
  
  // Register Service Worker for supported browsers
  if ('serviceWorker' in navigator) {
    registerServiceWorker();
  } else {
    console.warn('Service Worker is not supported in this browser');
  }
  
  // Handle A2HS (Add to Home Screen) prompt
  handleA2HSPrompt();
  
  // Setup push notifications if supported
  if ('PushManager' in window && 'serviceWorker' in navigator) {
    setupPushNotifications();
  }
  
  // iOS specific setup
  if (isIOS()) {
    setupIOSApp();
  }
}

/**
 * Register and manage Service Worker
 */
function registerServiceWorker() {
  navigator.serviceWorker.register('/service-worker.js', {
    scope: '/'
  })
    .then(registration => {
      console.log('Service Worker registered successfully', registration);
      swRegistration = registration;
      
      // Check for updates every hour
      setInterval(() => {
        console.log('[SW] Checking for updates...');
        swRegistration.update();
      }, 60 * 60 * 1000);
      
      // Listen for updates
      swRegistration.addEventListener('updatefound', () => {
        const newWorker = swRegistration.installing;
        console.log('[SW] Update found, new worker installing');
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker available
            console.log('[SW] New version available');
            notifyUserOfUpdate();
          }
        });
      });
      
      // Listen for controller change and reload
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          console.log('[SW] Controller changed, reloading page');
          window.location.reload();
          refreshing = true;
        }
      });
      
    })
    .catch(error => {
      console.error('Service Worker registration failed:', error);
    });
    
  // Handle SKIP_WAITING message
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.addEventListener('message', event => {
      if (event.data && event.data.type === 'SKIP_WAITING') {
        console.log('[SW] Received SKIP_WAITING message');
        if (swRegistration.waiting) {
          swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      }
    });
  }
}

/**
 * Notify user that a new version is available
 */
function notifyUserOfUpdate() {
  const updateNotification = document.getElementById('update-notification');
  if (updateNotification) {
    updateNotification.style.display = 'block';
    const updateButton = document.getElementById('update-button');
    if (updateButton) {
      updateButton.addEventListener('click', () => {
        if (swRegistration.waiting) {
          swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      });
    }
  }
}

/**
 * Handle A2HS (Add to Home Screen) prompt for Android and Windows
 */
function handleA2HSPrompt() {
  let deferredPrompt;
  const addButton = document.querySelector('.add-button');
  
  if (!addButton) return;
  
  addButton.style.display = 'none';
  
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('[A2HS] Install prompt triggered');
    e.preventDefault();
    deferredPrompt = e;
    addButton.style.display = 'block';
    
    addButton.addEventListener('click', async () => {
      addButton.style.display = 'none';
      deferredPrompt.prompt();
      
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`[A2HS] User response: ${outcome}`);
      
      if (outcome === 'accepted') {
        console.log('[A2HS] App installation accepted');
        deferredPrompt = null;
        addButton.style.display = 'none';
      } else {
        console.log('[A2HS] App installation dismissed');
        addButton.style.display = 'block';
      }
    });
  });
  
  // Hide A2HS button if app is already installed
  window.addEventListener('appinstalled', () => {
    console.log('[A2HS] PWA was installed');
    addButton.style.display = 'none';
    deferredPrompt = null;
  });
}

/**
 * Setup push notifications
 * Supported on: Android (Chrome), Windows (Edge), macOS Safari
 * Not supported on: iOS PWA (Apple limitation)
 */
function setupPushNotifications() {
  const notifyButton = document.getElementById('notifications');
  
  if (!notifyButton) return;
  
  // Hide on iOS since Web Push is not supported in PWA mode
  if (isIOS()) {
    console.log('[Notifications] iOS detected - Web Push not supported in PWA mode');
    notifyButton.style.display = 'none';
    return;
  }
  
  notifyButton.addEventListener('click', async () => {
    try {
      const permission = await Notification.requestPermission();
      console.log('[Notifications] Permission:', permission);
      
      if (permission === 'granted' && swRegistration) {
        console.log('[Notifications] Permission granted');
        // Subscribe to push notifications
        subscribeToPush();
      }
    } catch (error) {
      console.error('[Notifications] Error requesting permission:', error);
    }
  });
  
  // Show notification button only if notifications are supported
  if ('Notification' in window && !isIOS()) {
    notifyButton.style.display = 'block';
  }
}

/**
 * Subscribe to push notifications
 */
function subscribeToPush() {
  if (!swRegistration || !('pushManager' in swRegistration)) {
    console.warn('[Push] PushManager not available');
    return;
  }
  
  swRegistration.pushManager.getSubscription()
    .then(subscription => {
      if (subscription) {
        console.log('[Push] Already subscribed:', subscription.endpoint);
        return subscription;
      }
      
      // Subscribe to push (VAPID key would be needed for production)
      return swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        application_server_key: undefined // Add VAPID public key in production
      });
    })
    .then(subscription => {
      console.log('[Push] Subscription successful:', subscription.endpoint);
    })
    .catch(error => {
      console.error('[Push] Subscription failed:', error);
    });
}

/**
 * iOS-specific setup and workarounds
 */
function setupIOSApp() {
  console.log('[iOS] Setting up iOS-specific features');
  
  // iOS doesn't support beforeinstallprompt, so hide the A2HS button
  const addButton = document.querySelector('.add-button');
  if (addButton) {
    addButton.style.display = 'none';
  }
  
  // Add iOS-specific viewport meta tag fixes if needed
  const viewportMeta = document.querySelector('meta[name="viewport"]');
  if (viewportMeta) {
    // iOS requires specific viewport settings for web apps
    viewportMeta.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no';
  }
  
  // Prevent bounce scroll on iOS
  document.body.addEventListener('touchmove', (e) => {
    if (e.target.closest('.scrollable')) {
      return;
    }
    e.preventDefault();
  }, { passive: false });
  
  // Log iOS web app status
  if (window.navigator.standalone === true) {
    console.log('[iOS] Running in standalone mode (installed as PWA)');
  } else if (window.navigator.standalone === false) {
    console.log('[iOS] Running in browser mode');
  }
}

/**
 * Handle page visibility for smart updates
 */
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && swRegistration) {
    console.log('[SW] Page became visible, checking for updates');
    swRegistration.update();
  }
});

/**
 * Log PWA diagnostics on startup
 */
window.addEventListener('load', () => {
  // Delay diagnostics to ensure all checks complete
  setTimeout(() => {
    console.group('PWA Diagnostics (2026)');
    console.log('Service Worker Supported:', 'serviceWorker' in navigator ? '✅' : '❌');
    console.log('Service Worker Active:', swRegistration ? '✅' : '❌');
    console.log('Web Push Supported:', 'PushManager' in window ? '✅' : '❌');
    console.log('Notifications Supported:', 'Notification' in window ? '✅' : '❌');
    console.log('iOS Device:', isIOS() ? '✅' : '❌');
    console.log('PWA Installed:', isPWAInstalled() ? '✅' : '❌');
    console.groupEnd();
  }, 1000);
}, { once: true });

