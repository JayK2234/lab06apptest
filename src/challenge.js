import { onAuthReady } from "/src/authentication.js";
import { db } from "./firebaseConfig.js";
import { doc, onSnapshot } from "firebase/firestore";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { getDoc, setDoc, arrayUnion, arrayRemove } from "firebase/firestore";

let currentUser = null;   // who is logged in
let checked = [];      // the hike IDs they've favourited

// Calculate how many days are left
function getDaysLeft(dueDate) {

    let today = new Date();
    let due = new Date(dueDate + "T00:00:00");
    today.setHours(0, 0, 0, 0);
    let difference = due - today;

    // Convert milliseconds into days
    let daysLeft = Math.ceil(
        difference / (1000 * 60 * 60 * 24)
    );

    return daysLeft;
}

// Display date 
function formatDate(date) {

    if (!date) {
        return "Not available";
    }
    let newDate = new Date(date + "T00:00:00");
    return newDate.toLocaleDateString("en-CA");
}


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

        newcard.querySelector(".card-title").textContent =
            challenge.title;

        newcard.querySelector(".description").textContent =
            challenge.description;

        newcard.querySelector(".due-date").textContent =
            "Due date: " + formatDate(challenge.dueDate);

        // newcard.querySelector(".owner-name").textContent =
            // "Owner: " + challenge.ownerName;

        // newcard.querySelector(".term").textContent =
            // "Term: " + challenge.term;

        // newcard.querySelector(".last-updated").textContent =
            // "Last updated: " + formatDate(challenge.last_updated);



        let daysLeft = getDaysLeft(challenge.dueDate);

        let daysLeftElement = newcard.querySelector(".days-left");

        let gauge = newcard.querySelector(".gauge");

         // Display days remaining
        if (daysLeft > 0) {
            daysLeftElement.textContent = daysLeft;
        }
        else if (daysLeft === 0) {
            daysLeftElement.textContent = "Today";
        }
        else {
            daysLeftElement.textContent = "Overdue";
        }


        let progress = (daysLeft / 30) * 100;

        // Prevent percentage from exceeding 100%
        if (progress > 100) {
            progress = 100;
        }

        if (progress < 0) {
            progress = 0;
        }

        let gaugeColor;

        if (daysLeft < 0) {

            gaugeColor = "#7e7e7e";

        }
        else if (daysLeft <= 3) {

            gaugeColor = "#f3372a";

        }
        else if (daysLeft <= 7) {

            gaugeColor = "#f19408";

        }
        else {

            gaugeColor = "#4fbd53";

        }



         // Display gauge
        gauge.style.background = `
            conic-gradient(
                ${gaugeColor} ${progress}%,
                #a7a7a7 ${progress}%
            )
        `;


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


