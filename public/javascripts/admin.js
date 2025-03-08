document.addEventListener("DOMContentLoaded", function () {
    const sidebar = document.querySelector(".sidebar");
    const menuButton = document.querySelector(".menu_button");
    const mainContainer = document.querySelector(".main_container");
    const breadcrumb = document.querySelector(".breadcrumb");


    fetchTables();


    menuButton.addEventListener("click", function () {
        sidebar.classList.toggle("active");
        mainContainer.classList.toggle("dimmed");
    });


    document.addEventListener("click", function (e) {
        if (!sidebar.contains(e.target) && !menuButton.contains(e.target)) {
            sidebar.classList.remove("active");
            mainContainer.classList.remove("dimmed");
        }
    });


    document.querySelectorAll(".close_modal").forEach(button => {
        button.addEventListener("click", function () {
            button.closest(".modal").style.display = "none";
        });
    });

    
    // Open add modal
    document.querySelector(".add_item_button").addEventListener("click", function () {
        showAddModal();
    });


    function fetchTables() {
        fetch('/admin/tables')
            .then(response => response.json())
            .then(tables => {
                const tableList = document.querySelector(".sidebar .tables");
                tableList.innerHTML = "";
                tables.forEach(table => {
                    const tableItem = document.createElement("li");
                    tableItem.className = "item";
                    tableItem.textContent = table.Tables_in_shop;
                    tableItem.addEventListener("click", function () {
                        const tableName = this.textContent;
                        breadcrumb.innerHTML = tableName

                        sidebar.classList.remove("active");
                        mainContainer.classList.remove("dimmed");
                        fetchItems(tableName);
                    });
                    tableList.appendChild(tableItem);
                });
            })
            .finally(() => {
                const tableList = document.querySelector(".sidebar .tables");
                tableList.children[0].click();
            });
    }

    function fetchItems(tableName) {
        fetch('/admin/' + tableName)
            .then(response => response.json())
            .then(items => {
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
                    row.appendChild(addOperationCell(tableName, item));
                    tableItem.appendChild(row);
                });
            });
    };


    function addOperationCell(tableName, item) {
        const cell = document.createElement("td");

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.addEventListener("click", function () {
            showEditModal(tableName, item);
        });
        cell.appendChild(editButton);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", function () {
            if (tableName === "categories") {
                deleteItem(tableName, item.catid);
            } else {
                deleteItem(tableName, item.pid);
            }
        });
        cell.appendChild(deleteButton);

        return cell;
    }


    function showEditModal(tableName, item) {
        const editModal = document.getElementById("item_modal");
        editModal.style.display = "block";

        const modalContent = document.querySelector(".modal_content");
        modalContent.innerHTML = "";
        if (tableName === "products") {
            const categoryLabel = document.createElement("label");
            categoryLabel.textContent = "Category";
            modalContent.appendChild(categoryLabel);
            const categorySelect = document.createElement("select");
            categorySelect.id = "edit_category";
            modalContent.appendChild(categorySelect);

            fetch('/admin/categories')
                .then(response => response.json())
                .then(categories => {
                    categories.forEach(category => {
                        const option = document.createElement("option");
                        option.value = category.catid;
                        option.textContent = category.name;
                        if (category.catid === item.catid) {
                            option.selected = true;
                        }
                        categorySelect.appendChild(option);
                    });
                });

            const nameLabel = document.createElement("label");
            nameLabel.textContent = "Name";
            modalContent.appendChild(nameLabel);
            const nameInput = document.createElement("input");
            nameInput.id = "edit_name";
            nameInput.value = item.name;
            modalContent.appendChild(nameInput);

            const priceLabel = document.createElement("label");
            priceLabel.textContent = "Price";
            modalContent.appendChild(priceLabel);
            const priceInput = document.createElement("input");
            priceInput.id = "edit_price";
            priceInput.value = item.price;
            modalContent.appendChild(priceInput);

            const descriptionLabel = document.createElement("label");
            descriptionLabel.textContent = "Description";
            modalContent.appendChild(descriptionLabel);
            const descriptionInput = document.createElement("input");
            descriptionInput.id = "edit_description";
            descriptionInput.value = item.description;
            modalContent.appendChild(descriptionInput);

            const imageLabel = document.createElement("label");
            imageLabel.textContent = "Image";
            modalContent.appendChild(imageLabel);
            const imagePreview = document.createElement("img");
            imagePreview.style.maxWidth = "25%";
            modalContent.appendChild(imagePreview);

            const imagePath = "/images/" + item.image;
            fetch(imagePath, { method: 'HEAD' })
                .then(response => {
                    console.log(response);
                    if (response.ok) {
                        imagePreview.src = imagePath;
                    }
                });
            
            const imageInput = document.createElement("input");
            imageInput.type = "file";
            imageInput.accept = "image/*";
            imageInput.id = "edit_image";
            modalContent.appendChild(imageInput);

            imageInput.addEventListener("change", function (event) {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        imagePreview.src = e.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });

            const saveButton = document.createElement("button");
            saveButton.textContent = "Save";
            saveButton.id = "save_item";
            modalContent.appendChild(saveButton);
        } else {
            const nameLabel = document.createElement("label");
            nameLabel.textContent = "Name";
            modalContent.appendChild(nameLabel);
            const nameInput = document.createElement("input");
            nameInput.id = "edit_name";
            nameInput.value = item.name;
            modalContent.appendChild(nameInput);

            const saveButton = document.createElement("button");
            saveButton.textContent = "Save";
            saveButton.id = "save_item";
            modalContent.appendChild(saveButton);
        }

        document.getElementById("save_item").onclick = function () {
            if (tableName === "products") {
                const formData = new FormData();
                formData.append("pid", item.pid);
                formData.append("catid", document.getElementById("edit_category").value);
                formData.append("name", document.getElementById("edit_name").value);
                formData.append("price", document.getElementById("edit_price").value);
                formData.append("description", document.getElementById("edit_description").value);
                const imageFile = document.getElementById("edit_image").files[0];
                if (imageFile) {
                    formData.append("image", imageFile);
                }
                updateItem(tableName, formData);
            } else {
                const updatedItem = {
                    catid: item.catid,
                    name: document.getElementById("edit_name").value,
                };
                updateItem(tableName, updatedItem);
            }
            editModal.style.display = "none";
        };
    }


    function showAddModal() {
        const tableName = breadcrumb.innerHTML;
        const itemModal = document.getElementById("item_modal");
        itemModal.style.display = "block";

        const modalContent = document.querySelector(".modal_content");
        modalContent.innerHTML = "";
        if (tableName === "products") {
            const categoryLabel = document.createElement("label");
            categoryLabel.textContent = "Category";
            modalContent.appendChild(categoryLabel);
            const categorySelect = document.createElement("select");
            categorySelect.id = "edit_category";
            modalContent.appendChild(categorySelect);

            fetch('/admin/categories')
                .then(response => response.json())
                .then(categories => {
                    categories.forEach(category => {
                        const option = document.createElement("option");
                        option.value = category.catid;
                        option.textContent = category.name;
                        categorySelect.appendChild(option);
                    });
                });

            const nameLabel = document.createElement("label");
            nameLabel.textContent = "Name";
            modalContent.appendChild(nameLabel);
            const nameInput = document.createElement("input");
            nameInput.id = "edit_name";
            modalContent.appendChild(nameInput);

            const priceLabel = document.createElement("label");
            priceLabel.textContent = "Price";
            modalContent.appendChild(priceLabel);
            const priceInput = document.createElement("input");
            priceInput.id = "edit_price";
            modalContent.appendChild(priceInput);

            const descriptionLabel = document.createElement("label");
            descriptionLabel.textContent = "Description";
            modalContent.appendChild(descriptionLabel);
            const descriptionInput = document.createElement("input");
            descriptionInput.id = "edit_description";
            modalContent.appendChild(descriptionInput);

            const imageLabel = document.createElement("label");
            imageLabel.textContent = "Image";
            modalContent.appendChild(imageLabel);
            const imageInput = document.createElement("input");
            imageInput.type = "file";
            imageInput.accept = "image/*";
            imageInput.id = "edit_image";
            modalContent.appendChild(imageInput);

            const saveButton = document.createElement("button");
            saveButton.textContent = "Save";
            saveButton.id = "save_item";
            modalContent.appendChild(saveButton);
        } else {
            const nameLabel = document.createElement("label");
            nameLabel.textContent = "Name";
            modalContent.appendChild(nameLabel);
            const nameInput = document.createElement("input");
            nameInput.id = "edit_name";
            modalContent.appendChild(nameInput);

            const saveButton = document.createElement("button");
            saveButton.textContent = "Save";
            saveButton.id = "save_item";
            modalContent.appendChild(saveButton);
        }

        document.getElementById("save_item").onclick = function () {
            if (tableName === "products") {
                const formData = new FormData();
                formData.append("catid", document.getElementById("edit_category").value);
                formData.append("name", document.getElementById("edit_name").value);
                formData.append("price", document.getElementById("edit_price").value);
                formData.append("description", document.getElementById("edit_description").value);
                const imageFile = document.getElementById("edit_image").files[0];
                console.log(imageFile);
                if (imageFile) {
                    formData.append("image", imageFile);
                }
                addItem(tableName, formData);
            } else {
                const updatedItem = {
                    name: document.getElementById("edit_name").value,
                };
                addItem(tableName, updatedItem);
            }
            itemModal.style.display = "none";
        };
    }


    function updateItem(tableName, item) {
        if (tableName === "products") {
            fetch('/admin/' + tableName, {
                method: 'PUT',
                body: item
            })
                .then(response => response.json())
                .then(() => {
                    fetchItems(breadcrumb.innerHTML);
                });
        } else {
            fetch('/admin/' + tableName, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(item)
            })
                .then(response => response.json())
                .then(() => {
                    fetchItems(breadcrumb.innerHTML);
                });
        }
    }

    function deleteItem(tableName, pid) {
        fetch('/admin/' + tableName + '/' + pid, {
            method: 'DELETE',
        })
            .then(response => response.json())
            .then(() => {
                fetchItems(breadcrumb.innerHTML);
            });
    }


    // Add new item
    function addItem(tableName, item) {
        if (tableName === "products") {
            fetch('/admin/' + tableName, {
                method: 'POST',
                body: item
            })
                .then(response => response.json())
                .then(() => {
                    fetchItems(breadcrumb.innerHTML);
                });
        } else {
            fetch('/admin/' + tableName, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(item)
            })
                .then(response => response.json())
                .then(() => {
                    fetchItems(breadcrumb.innerHTML);
                });
        }
    }
});