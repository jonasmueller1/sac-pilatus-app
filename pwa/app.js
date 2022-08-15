// Registering Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/files/app/service-worker.js');  // Note: Has to be in root folder!
}

// Handle install prompt
let deferredPrompt;
const addBtn = document.querySelector('.add-button');
if (!!addBtn) {
  addBtn.style.display = 'none';

  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    // Update UI to notify the user they can add to home screen
    addBtn.style.display = 'block';

    addBtn.addEventListener('click', () => {
      // hide our user interface that shows our A2HS button
      addBtn.style.display = 'none';
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

  // Requesting permission for Notifications after clicking on the button
  // const button = document.getElementById('notifications');
  // button.addEventListener('click', () => {
  //   Notification.requestPermission().then((result) => {
  //     if (result === 'granted') {
  //       randomNotification();
  //     }
  //   });
  // });

}

// Setting up random Notification
// function randomNotification() {
//   const randomItem = Math.floor(Math.random() * games.length);
//   const notifTitle = games[randomItem].name;
//   const notifBody = `Created by ${games[randomItem].author}.`;
//   const notifImg = `data/img/${games[randomItem].slug}.jpg`;
//   const options = {
//     body: notifBody,
//     icon: notifImg,
//   };
//   new Notification(notifTitle, options);
//   setTimeout(randomNotification, 30000);
// }
