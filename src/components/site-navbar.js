import { logoutUser , onAuthReady} from '/src/authentication.js';


class SiteNavbar extends HTMLElement {
    constructor() {
        super();
        this.renderNavbar();
        this.renderAuthControls(); 
    }

    renderNavbar() {
        this.innerHTML = `
            <!-- Navbar: single source of truth -->
            <nav class="navbar navbar-expand-lg navbar-light bg-info">
                <div class="container-fluid">
                    <a class="navbar-brand" href="/">
                        <img alt="Image" src="https://dummyimage.com/40x40">
                        ChallengeAssistance
                    </a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent"
                        aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul class="navbar-nav me-auto" style="list-style: none; padding: 0; margin: 0;">
                            <li class="nav-item">
                                
                                
                                <li style="display: inline-block; margin-right: 15px;">Challenge</li>
                                <li style="display: inline-block; margin-right: 15px;">Schedule</li>
                                <li style="display: inline-block; margin-right: 15px;">Profile</li>
                            </li>
                        </ul>
                        <div class="d-flex align-items-center gap-2 ms-lg-2" id="rightControls">
                            
                            <div id="authControls" class="auth-controls d-flex align-items-center gap-2 my-2 my-lg-0">
                                <!-- populated by JS -->
                            </div>
                        </div>

                    </div>
                </div>
            </nav>
        `;
    }
    renderAuthControls() {
        const authControls = this.querySelector('#authControls'); // Find #authControls inside this navbar

        // Invisible placeholder prevents layout shifting while Firebase checks login status
        authControls.innerHTML = `<div class="btn btn-outline-light" style="visibility: hidden; min-width: 80px;">Log out</div>`;

        // Pass a callback that runs when Firebase reports the login status
        onAuthReady(function(user) { // Receives the user object (or null)

            if (user) { // User is logged in
                authControls.innerHTML = `<button class="btn btn-outline-light" id="signOutBtn" type="button" style="min-width: 80px;">Log out</button>`;

                const signOutBtn = authControls.querySelector('#signOutBtn');
                signOutBtn.addEventListener('click', logoutUser); // Callback: runs when Log out is clicked

            } else { // User is NOT logged in, and gets redirected to login page if user clicks the login button
                authControls.innerHTML = `<a class="btn btn-outline-light" id="loginBtn" href="/login.html" style="min-width: 80px;">Log in</a>`;
            }
        });
    }

}

customElements.define('site-navbar', SiteNavbar);