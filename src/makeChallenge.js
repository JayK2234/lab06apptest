import { db } from './firebaseConfig.js';
import { onAuthReady } from "./authentication.js";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

let currentUser = null;
onAuthReady(function (user) {
    if (!user) {
        location.href = "index.html";   // Not logged in → go away
        return;
    }
    currentUser = user;                 // Logged in → remember them
});


// ---- (1) What to do when the form is submitted ----
async function saveChallenge(event) {
    event.preventDefault();   // Stop the browser from reloading the page

    // 1. Collect the form values into ONE object (this becomes the Firestore document)
    const newChallenge = {
        title: document.getElementById("challengeTitle").value,
        subtask_title: document.getElementById("subtaskTitle").value,
        subtask_description: document.getElementById("subtaskDescription").value,
        subtask_dueDate: document.getElementById("subtaskDate").value,
        startDate: document.getElementById("startDate").value,
        endDate: document.getElementById("endDate").value,
        owner: currentUser.uid,                                      // WHO added it
        ownerName: currentUser.displayName || currentUser.email,
        last_updated: serverTimestamp()                              // WHEN it was added
    };

    // 2. Save it to the "challenges" collection
    try {
        await addDoc(collection(db, "challenges"), newChallenge);
        location.href = "challenge.html";    // 3. Go back to main page
    } catch (error) {
        alert(`Error saving challenge:\n${error.code || ""}\n${error.message || error}`);
    }
}

// ---- (2) Listen for form submission ----
document.getElementById("challengeForm").addEventListener("submit", saveChallenge);



async function displaySubtasksDynamically() {
    const subtasksRef = collection(db, "subtasks");

    let subtaskTemplate = document.getElementById("subtaskCardTemplate");
    const querySnapshot = await getDocs(subtasksRef);

    // loop
    querySnapshot.forEach(doc => {

        // create a copy of the template
        let newcard = subtaskTemplate.content.cloneNode(true);

        
        const subtask = doc.data();

        newcard.querySelector('.card-title').textContent = subtask.subtask_title;

        newcard.querySelector('.card-text').textContent = subtask.subtask_description;

        newcard.querySelector('.card-startDate').textContent = subtask.startDate;

        newcard.querySelector('.card-endDate').textContent = subtask.endDate;

        newcard.querySelector('.card-dueDate').textContent = subtask.subtask_dueDate;

        newcard.querySelector('.card-owner').textContent = subtask.ownerName;

        newcard.querySelector('.card-updated').textContent =
            subtask.last_updated?.toDate().toLocaleString() || "Not updated";

        newcard.querySelector(".edit-subtask").href =
            `editSubtask.html?docID=${doc.id}`;

        document.getElementById("subtasks-go-here").appendChild(newcard);

    });

}