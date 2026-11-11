import { db } from "./firebaseConfig.js";
import { doc, getDoc } from "firebase/firestore";
import { updateDoc, increment } from "firebase/firestore";
import { onAuthReady } from "./authentication.js";
import { collection, addDoc, getDocs, serverTimestamp, query, where, orderBy, limit } from "firebase/firestore";


// Get the document ID from the URL
const params = new URLSearchParams(window.location.search);
const docID = params.get("docID");

async function displayChallenge() {

    // reference to this challenge
    const challengeRef = doc(db, "challenges", docID);

    // read the challenge document
    const docSnap = await getDoc(challengeRef);

    if (docSnap.exists()) {

        // read this challenge
        const challenge = docSnap.data();

        // populate the challenge information
        document.getElementById("challenge-title").textContent =
            challenge.title;

        document.getElementById("startDate").textContent =
            challenge.startDate;

        document.getElementById("endDate").textContent =
            challenge.endDate;

        document.getElementById("subtask-title").textContent =
            challenge.subtask_title;

        document.getElementById("subtask-description").textContent =
            challenge.subtask_description;

        document.getElementById("subtask-dueDate").textContent =
            challenge.subtask_dueDate;

        document.getElementById("ownerName").textContent =
            challenge.ownerName;

        document.getElementById("last-updated").textContent =
            challenge.last_updated?.toDate().toLocaleString() || "";

    } else {
        console.log("No such challenge!");
    }

}

// Runs once Firebase knows if someone is logged in
onAuthReady(async function (user) {

    if (!user) {
        location.href = "index.html";
    } else {
        

        displayChallenge();
    }

});