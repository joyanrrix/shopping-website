import { Utils } from "./utils.js";
// const Utils = require("./utils.js");
class User {
    constructor() {
        this.userId = "";
    }

    async checkLogin() {
        const response = await fetch('/check_login');
        const data = await response.json();
        this.userId = data.userid;
        if (this.userId == 1) {
            window.location.href = "/admin";
        }
        this.renderUserPanel();
    }

    async logout() {
        const response = await fetch('/logout');
        const data = await response.json();
        if (data.success) {
            window.location.reload();
        }
    }

    renderUserPanel() {
        const userPanel = document.querySelector(".user_panel");
        const userName = document.querySelector(".user_name");
        userPanel.innerHTML = "";
        const welcomeMessage = document.createElement('p');
        const changePasswordButton = document.createElement('button');
        const loginButton = document.createElement('button');
        if (this.userId == "") {
            userName.textContent = "Guest";
            welcomeMessage.textContent = `Welcome, Guest!`;
            loginButton.textContent = 'Login';
            loginButton.addEventListener('click', () => {
                this.renderLoginForm();
            });
        } else {
            userName.textContent = this.userId;
            welcomeMessage.textContent = `Welcome, ${this.userId}!`;
            changePasswordButton.textContent = 'Change Password';
            changePasswordButton.addEventListener('click', () => {
                this.renderChangePasswordForm();
            });
            loginButton.textContent = 'Logout';
            loginButton.addEventListener('click', () => {
                this.logout();
            });
        }
        userPanel.appendChild(welcomeMessage);
        if (this.userId != "") {
            userPanel.appendChild(changePasswordButton);
        }
        userPanel.appendChild(loginButton);
    }

    renderLoginForm() {
        document.querySelector(".modal").style.display = "block";
        const loginForm = document.querySelector(".modal_content");
        loginForm.innerHTML = "";

        const emailLabel = document.createElement("label");
        emailLabel.textContent = "Email";
        loginForm.appendChild(emailLabel);
        const emailInput = document.createElement('input');
        emailInput.type = 'email';
        emailInput.className = '';
        emailInput.value = '1155226868@link.cuhk.edu.hk';
        loginForm.appendChild(emailInput);

        const passwordLabel = document.createElement("label");
        passwordLabel.textContent = "Password";
        loginForm.appendChild(passwordLabel);
        const passwordInput = document.createElement('input');
        passwordInput.type = 'password';
        passwordInput.className = '';
        passwordInput.value = 'Zhang@1205';
        loginForm.appendChild(passwordInput);

        const loginButton = document.createElement('button');
        loginButton.textContent = 'Login';
        loginButton.className = 'login_button';
        loginForm.appendChild(loginButton);

        loginButton.addEventListener('click', async () => {
            const email = emailInput.value;
            const password = passwordInput.value;
            const csrfToken = document.querySelector('input[id="csrfToken"]').value;
            await this.login(email, password, csrfToken);
        });
    }

    renderChangePasswordForm() {
        document.querySelector(".modal").style.display = "block";
        const loginForm = document.querySelector(".modal_content");
        loginForm.innerHTML = "";

        const emailLabel = document.createElement("label");
        emailLabel.textContent = "Email";
        loginForm.appendChild(emailLabel);
        const emailInput = document.createElement('input');
        emailInput.type = 'email';
        emailInput.value = "1155226868@link.cuhk.edu.hk"
        loginForm.appendChild(emailInput);

        const oldPasswordLabel = document.createElement("label");
        oldPasswordLabel.textContent = "Old Password";
        loginForm.appendChild(oldPasswordLabel);
        const oldPasswordInput = document.createElement('input');
        oldPasswordInput.type = 'password';
        oldPasswordInput.value = "Zhang@1205";
        loginForm.appendChild(oldPasswordInput);

        const newPasswordLabel = document.createElement("label");
        newPasswordLabel.textContent = "New Password";
        loginForm.appendChild(newPasswordLabel);
        const newPasswordInput = document.createElement('input');
        newPasswordInput.type = 'password';
        newPasswordInput.value = "Zhang@1205";
        loginForm.appendChild(newPasswordInput);

        const confirmPasswordLabel = document.createElement("label");
        confirmPasswordLabel.textContent = "Confirm Password";
        loginForm.appendChild(confirmPasswordLabel);
        const confirmPasswordInput = document.createElement('input');
        confirmPasswordInput.type = 'password';
        confirmPasswordInput.value = "Zhang@1206";
        loginForm.appendChild(confirmPasswordInput);

        const changePasswordButton = document.createElement('button');
        changePasswordButton.textContent = 'Change Password';
        loginForm.appendChild(changePasswordButton);

        changePasswordButton.addEventListener('click', async () => {
            const email = emailInput.value;
            const oldPassword = oldPasswordInput.value;
            const newPassword = newPasswordInput.value;
            const confirmPassword = confirmPasswordInput.value;
            if (newPassword != confirmPassword) {
                alert('New password and confirm password do not match');
                return;
            }
            const csrfToken = document.querySelector('input[id="csrfToken"]').value;
            await this.changePassword(email, oldPassword, newPassword, csrfToken);
        });
    }

    async login(email, password, csrfToken) {
        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'CSRF-Token': csrfToken
                },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (data.success) {
                window.location.reload();
            } else {
                alert('Either email or password is incorrect');
            }
        } catch (err) {
            console.error(err);
        }
    }

    async changePassword(email, oldPassword, newPassword, csrfToken) {
        try {
            const response = await fetch('/change_password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'CSRF-Token': csrfToken
                },
                body: JSON.stringify({ email, oldPassword, newPassword })
            });
            const data = await response.json();
            if (data.success) {
                alert('Password successfully changed');
                window.location.reload();
            } else {
                alert('Either email or old password is incorrect');
            }
        } catch (err) {
            console.error(err);
        }
    }
}

export const user = new User();