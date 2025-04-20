export class Utils {
    static isAdmin() {
        return document.body.classList.contains('admin');
    }

    static getCsrfToken() {
        return document.querySelector('input[id="csrfToken"]').value;
    }
}