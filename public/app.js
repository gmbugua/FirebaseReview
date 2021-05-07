const auth = firebase.auth();
const db = firebase.firestore();

// DB
const createThing = document.getElementById("createThing");
const thingsList = document.getElementById("thingsList");
const dataEntry = document.getElementById("dataEntry");

// Auth
const whenSignedIn = document.getElementById('whenSignedIn');
const whenSignedOut = document.getElementById('whenSignedOut');
const signInBtn = document.getElementById('signInBtn');
const signOutBtn = document.getElementById('signOutBtn');
const userDetails = document.getElementById('userDetails');

// Gain access to Google Auth provider
// Using a popup.
const provider = new firebase.auth.GoogleAuthProvider();

/*
  SignIn and SignOut methods are one way shows
  They return a promise, execute something asynchronously.
  ..then they are done
*/
signInBtn.onclick = () => auth.signInWithPopup(provider);
signOutBtn.onclick = () => auth.signOut();

/*
  User authentication state can change multiple 
  times throughout the lifecycle of the app, and 
  we want our app to react w/ changes to Ui when
  that happens
*/
auth.onAuthStateChanged((user) => {
  if (user) {
    // User is signed in.
    dataEntry.hidden = false;
    whenSignedIn.hidden = false;
    whenSignedOut.hidden = true;
    userDetails.innerHTML = `
      <h3> Hi ${user.displayName}! </h3>
      <p> Your user id is: ${user.uid} </p>
    `
  } else {
    // User is signed out.
    dataEntry.hidden = true;
    whenSignedIn.hidden = true;
    whenSignedOut.hidden = false;
    userDetails.innerHTML = '';
  }
});

let thingsRef;
let unsubscribe;
auth.onAuthStateChanged(user => {
  if (user) {
    // logged in
    thingsRef = db.collection('things');
    createThing.onclick = (e) => {
      e.preventDefault();
      let itemName = document.getElementById("itemName").value;
      let itemWeight = document.getElementById("itemWeight").value;

      if (itemName != '' && itemWeight != '') {
        // ensure date is the same across all client devices
        const { serverTimestamp } = firebase.firestore.FieldValue;
        thingsRef.add({
          uid: user.uid,
          name: itemName,
          weight: itemWeight,
          createdAt: serverTimestamp(),
        });
     }
    }

    unsubscribe = thingsRef
      .where('uid', '==', user.uid)
      .onSnapshot(querySnapshot => {
        const items = querySnapshot.docs.map(doc => {
          return `<li>${doc.data().name}</li>`
        });
        thingsList.innerHTML = items.join('');
      });
  } else {
    unsubscribe && unsubscribe(); //if the unsubscribe function is defined
  }
});