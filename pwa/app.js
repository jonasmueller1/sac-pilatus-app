let swRegistration = null;

window.addEventListener('load', function() {   
  initializeApp();
});

function initializeApp() {
  // Registering Service Worker
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    console.log('Service Worker and Push is supported');
      navigator.serviceWorker.register('/files/app/service-worker.js') // Note: Service worker has to be located in root folder of app!
        .then(registration => {
          console.log('Service Worker is registered', registration);
          swRegistration = registration;

          setInterval(() => registration.update(), 60 * 60 * 1000);

          if (swRegistration.waiting) {
            invokeServiceWorkerUpdateFlow(swRegistration)
          }

          // Detect Service Worker update available and install it
          swRegistration.addEventListener('updatefound', () => {
            console.log('Service Worker update found', swRegistration);
            if (swRegistration.installing) {
              // Wait until the new Service worker is actually installed (ready to take over)
              swRegistration.installing.addEventListener('statechange', () => {
                  if (swRegistration.waiting) {
                    // Check if an existing controller (previous Service Worker)
                    if (navigator.serviceWorker.controller) {
                      invokeServiceWorkerUpdateFlow(swRegistration)
                    } else {
                      console.log('Service Worker initialized for the first time')
                      // Nothing to do
                    }
                  }
                })
            }
          })

          // Detect controller change and refresh the page
          let refreshing = false;
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('Service Worker refresh');
            if (!refreshing) {
              window.location.reload()
              refreshing = true
            }
          })
        })
        .catch(error => {
          console.error('Service Worker error', error);
        })
  } else {
    console.warn('Push messaging is not supported');
    notificationButton.textContent = 'Push is not supported';
  }
}

// Handle install prompt
let deferredPrompt;
const addButton = document.querySelector('.add-button');
if (!!addButton) {
  addButton.style.display = 'none';

  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    // Update UI to notify the user they can add to home screen
    addButton.style.display = 'block';

    addButton.addEventListener('click', () => {
      // hide our user interface that shows our A2HS button
      addButton.style.display = 'none';
      // Show the prompt
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the A2HS prompt');
        } else {
          console.log('User dismissed the A2HS prompt');
        }
        deferredPrompt = null;
      });
    });
  });
}

// Handle waiting service worker
function invokeServiceWorkerUpdateFlow(registration) {
  console.log('Service Worker update flow', registration);
  if (registration.waiting) {
    // let waiting Service Worker know it should became active
    registration.waiting.postMessage('SKIP_WAITING')
  }
}

// Requesting permission for Notifications after clicking on the button
const notifyButton = document.getElementById('notifications');
if (!!notifyButton) {
  notifyButton.addEventListener('click', () => {
    Notification.requestPermission().then((result) => {
      if (result === 'granted') {
        randomNotification();
      }
    });
  });
}

// Setting up random Notification
function randomNotification() {
  const notifDate = new Date().toDateString();
  const notifTime = new Date().getHours() + ':' + new Date().getMinutes();
  const notifTitle = 'Neue Nachricht am ' + notifDate + ' ' + notifTime + '';
  const notifBody = `Erstellt von Jonas Müller`;
  const notifImg = `/files/favicon/favicon-96x96.png`;
  const options = {
    body: notifBody,
    icon: notifImg,
    data: {
      url: '/files/app/service/nachrichten.html',
    },
  };
  // new Notification(notifTitle, options);
  swRegistration.showNotification(notifTitle, options);
  setTimeout(randomNotification, 60000);
}
