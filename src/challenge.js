import { onAuthReady } from "/src/authentication.js";
import { db } from "./firebaseConfig.js";
import { doc, onSnapshot } from "firebase/firestore";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { getDoc, setDoc, arrayUnion, arrayRemove } from "firebase/firestore";


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

        // attach the template to the front-end
        document.getElementById("challenges-go-here").appendChild(newcard);

    });

}

// Runs once Firebase knows if someone is logged in
onAuthReady(async function (user) {

    if (!user) {
        location.href = "index.html";
    } else {
        

        displayChallengesDynamically();
    }

});