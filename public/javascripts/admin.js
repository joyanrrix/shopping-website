import { category } from "./category.js";
import { breadcrumb } from "./breadcrumb.js";
import { table } from "./table.js";

document.addEventListener("DOMContentLoaded", () => {
    const itemModal = document.getElementById("item_modal");

    document.querySelector(".add_item_button").addEventListener("click", function () {
        const tableName = breadcrumb.curPath[0];
        table.fetchTableItems(tableName).then(items => {
            const keys = Object.keys(items[0]);
            table.showAddModal(tableName, keys);
        });
    });


    document.querySelector(".logout_button").addEventListener("click", async () => {
        const response = await fetch('/logout');
        const data = await response.json();
        if (data.success) {
            window.location.href = "/";
        }
    });

    document.querySelector(".close_modal").addEventListener("click", function () {
        itemModal.style.display = "none";
    });

    category.fetchTables().then(tables => {
        const defaultTable = tables[0].Tables_in_shop;
        breadcrumb.initBreadcrumb(defaultTable);
        table.renderTable(defaultTable);
        category.renderSidebar(tables);
    });
});