import { breadcrumb } from "./breadcrumb.js";
import { Utils } from "./utils.js";

class Table {
    constructor() {

    }

    async fetchTableItems(table) {
        try {
            const response = await fetch(`/admin/get_table_items?table=${table}`);
            const data = await response.json();
            return data;
        } catch (err) {
            console.error(err);
        }
    }

    async renderTable(table) {
        const items = await this.fetchTableItems(table);
        const tableItem = document.querySelector(".main_container .table");
        tableItem.innerHTML = "";

        const headerRow = document.createElement("tr");
        const headers = Object.keys(items[0]);
        headers.forEach(headerText => {
            const header = document.createElement("th");
            header.textContent = headerText;
            headerRow.appendChild(header);
        });
        const header = document.createElement("th");
        header.textContent = "Operation";
        headerRow.appendChild(header);
        tableItem.appendChild(headerRow);

        items.forEach(item => {
            const row = document.createElement("tr");
            Object.values(item).forEach(value => {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });
            row.appendChild(this.addOperationCell(table, item));
            tableItem.appendChild(row);
        });
    }

    addOperationCell(tableName, item) {
        const cell = document.createElement("td");

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.addEventListener("click", () => {
            this.showEditModal(tableName, item);
        });
        cell.appendChild(editButton);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", async () => {
            const primaryKey = { [Object.keys(item)[0]]: item[Object.keys(item)[0]] };

            await this.deleteItem(tableName, primaryKey);
            this.renderTable(tableName);
        });
        cell.appendChild(deleteButton);

        return cell;
    }

    async deleteItem(tableName, id) {
        const options = {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Csrf-Token': Utils.getCsrfToken()
            },
            body: JSON.stringify(id)
        };

        await fetch(`/admin/delete_item?table=${tableName}`, options);
    }

    showEditModal(tableName, item) {
        const editModal = document.getElementById("item_modal");
        editModal.style.display = "block";

        const modalContent = document.querySelector(".modal_content");
        modalContent.innerHTML = "";

        const title = document.createElement("h2");
        title.textContent = `Edit ${tableName}`;
        modalContent.appendChild(title);

        const form = document.createElement("form");
        form.id = "edit_form";
        form.method = "POST";
        form.action = `/admin/update_table?table=${tableName}`;
        if (tableName === "products") {
            form.enctype = "multipart/form-data";
        }

        Object.entries(item).forEach(([key, value], index) => {
            this.createFormField(form, key, value, index);
        });

        const submitButton = document.createElement("button");
        submitButton.type = "submit";
        submitButton.textContent = "Save";
        form.appendChild(submitButton);

        modalContent.appendChild(form);

        form.addEventListener("submit", async (event) => {
            event.preventDefault();
            const formData = new FormData(form);

            const options = {
                method: "POST",
                headers: {
                    'Csrf-Token': Utils.getCsrfToken()
                },
                body: tableName === "products" ? formData : JSON.stringify(Object.fromEntries(formData.entries()))
            }

            if (tableName !== "products") {
                options.headers["Content-Type"] = "application/json";
            }

            await fetch(`/admin/update_table?table=${tableName}`, options);

            editModal.style.display = "none";
            this.renderTable(tableName);
        });
    }

    showAddModal(tableName, keys) {
        const addModal = document.getElementById("item_modal");
        addModal.style.display = "block";

        const modalContent = document.querySelector(".modal_content");
        modalContent.innerHTML = "";

        const title = document.createElement("h2");
        title.textContent = `Add ${tableName}`;
        modalContent.appendChild(title);

        const form = document.createElement("form");
        form.id = "add_form";
        form.method = "POST";
        form.action = `/admin/add_item?table=${tableName}`;

        if (tableName == "products") {
            form.enctype = "multipart/form-data";
        }

        keys.forEach((key, index) => {
            if (index === 0) {
                return;
            }
            this.createFormField(form, key, "", index);
        });

        const submitButton = document.createElement("button");
        submitButton.type = "submit";
        submitButton.textContent = "Add";
        form.appendChild(submitButton);

        modalContent.appendChild(form);

        form.addEventListener("submit", async (event) => {
            event.preventDefault();
            const formData = new FormData(form);

            const options = {
                method: "POST",
                headers: {
                    'Csrf-Token': Utils.getCsrfToken()
                },
                body: tableName == "products" ? formData : JSON.stringify(Object.fromEntries(formData.entries()))
            }

            if (tableName !== "products") {
                options.headers["Content-Type"] = "application/json";
            }

            await fetch(`/admin/add_item?table=${tableName}`, options);

            addModal.style.display = "none";
            this.renderTable(tableName);
        });
    }

    createFormField(form, key, value, index) {
        const label = document.createElement("label");
        label.textContent = key;
        form.appendChild(label);

        const input = document.createElement("input");

        if (index === 0) {
            input.type = "text";
            input.name = key;
            input.value = value;
            input.readOnly = true;
            form.appendChild(input);
            return;
        }

        if (key === "image") {
            this.createImageField(form, key, value);
            return;
        }

        input.type = "text";
        input.name = key;
        input.value = value;
        form.appendChild(input);
    }

    createImageField(form, key, value) {
        const input = document.createElement("input");
        input.type = "file";
        input.name = key;
        input.accept = "image/*";

        const imgPreview = document.createElement("img");
        imgPreview.src = value ? `/images/${value}` : "";
        imgPreview.alt = "Image preview";
        imgPreview.style.width = "100px";
        imgPreview.style.height = "100px";
        form.appendChild(imgPreview);

        input.addEventListener("change", (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    imgPreview.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
        form.appendChild(input);
    }

}

export const table = new Table();