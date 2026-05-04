/*
 Copyright 2023-2026 Jonas Mueller (SAC Section Pilatus). All Rights Reserved.
 Updated 2026 with improved cache strategies for iOS, Android, and Windows.
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
 */
function setupPushNotifications() {
  const notifyButton = document.getElementById('notifications');
  
  if (!notifyButton) return;
  
  notifyButton.addEventListener('click', async () => {
    try {
      const permission = await Notification.requestPermission();
      console.log('[Notifications] Permission:', permission);
      
      if (permission === 'granted' && swRegistration) {
        console.log('[Notifications] Permission granted');
        // Additional notification setup can be done here
      }
    } catch (error) {
      console.error('[Notifications] Error requesting permission:', error);
    }
  });
  
  // Show notification button only if notifications are supported
  if ('Notification' in window) {
    notifyButton.style.display = 'block';
  }
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

