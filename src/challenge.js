import { onAuthReady } from "/src/authentication.js";
import { db } from "./firebaseConfig.js";
import { doc, onSnapshot } from "firebase/firestore";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { getDoc, setDoc, arrayUnion, arrayRemove } from "firebase/firestore";

let currentUser = null;   // who is logged in
let checked = [];      // the hike IDs they've favourited


async function displayChallengesDynamically() {

    // reference to the challenges collection
    const challengesRef = collection(db, "challenges");

    // get the template from front-end
    let challengeTemplate = document.getElementById("challengeCardTemplate");

    // read the challenges collection
    const querySnapshot = await getDocs(challengesRef);

    // loop through all challenges
    querySnapshot.forEach(doc => {

        // create a copy of the template
        let newcard = challengeTemplate.content.cloneNode(true);

        // read this challenge in the loop
        const challenge = doc.data();

        // populate data in the template
        newcard.querySelector('.card-title').textContent = challenge.title;

        // link to the individual challenge page
        newcard.querySelector(".read-more").href =
            `eachChallenge.html?docID=${doc.id}`;

        setupCheck(newcard, doc.id);

        // attach the template to the front-end
        document.getElementById("challenges-go-here").appendChild(newcard);

    });

}

function setupCheck(card, challengeID) {
    // [FRONT END] Find the check icon inside this card
    const check = card.querySelector(".fav-btn");

    // [FRONT END] Already a favourite? Fill the check icon.
    // (favourites was read from Firestore in Step 2.3)
    if (checked.includes(challengeID)) {
        check.classList.replace("bi-check-circle", "bi-check-circle-fill");
    }

    // Connect it: "check, when you are clicked, toggle this hike"
    check.addEventListener("click", function () {
        toggleChecked(check, challengeID);
    });
}

async function toggleChecked(check, challengeID) {

    // [BACK END] The address of the logged-in user's document in Firestore
    const userRef = doc(db, "users", currentUser.uid);

    // [FRONT END] Is the check filled right now?
    if (check.classList.contains("bi-check-circle-fill")) {

        // Filled → REMOVE from favourites
        // [BACK END] Remove this hike's ID from the user's favourites array
        await setDoc(userRef, { checked: arrayRemove(challengeID) }, { merge: true });
        // [FRONT END] Show the empty check
        check.classList.replace("bi-check-circle-fill", "bi-check-circle");

    } else {

        // Empty → ADD to favourites
        // [BACK END] Add this hike's ID to the user's favourites array
        await setDoc(userRef, { checked: arrayUnion(challengeID) }, { merge: true });
        // [FRONT END] Show the filled check
        check.classList.replace("bi-check-circle", "bi-check-circle-fill");
    }
}

// Runs once Firebase knows if someone is logged in
onAuthReady(async function (user) {
  if (!user) {
    location.href = "index.html";                              // Not logged in → back to start
  } else {
    currentUser = user;                                        // 1. Remember who's logged in
    const userDoc = await getDoc(doc(db, "users", user.uid));  // 2. Get their user doc

    // 3. Load user's favourites, or use an empty array if none exist
    checked = userDoc.data()?.checked || [];   // uses "optional chaining" (?.)

    // Beginner version of the line above:
    // if (userDoc.exists() && userDoc.data().favourites) {
    //   favourites = userDoc.data().favourites;
    // } else {
    //   favourites = [];
    // }

    displayChallengesDynamically();                                 // 4. Draw the cards
  }
});