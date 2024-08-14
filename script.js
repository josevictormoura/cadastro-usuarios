const btnCloseModal = document.querySelector('#btn-close-modal');
const btnShowModal = document.querySelector('.btn-new-user');
const modalUsuario = document.querySelector('.modal-create-user');
const nome = document.querySelector('#nome');
const email = document.querySelector('#email');
const telefone = document.querySelector('#telefone');
const data = document.querySelector('#data');
const cidade = document.querySelector('#cidade');
const inputSearch = document.querySelector('#search');

const setLocalStorage = (users) => localStorage.setItem('users', JSON.stringify(users));
const getLocalStorage = () => JSON.parse(localStorage.getItem('users')) ?? [];

function createUser(user) {
    const dbUser = getLocalStorage();
    dbUser.push(user);
    setLocalStorage(dbUser);
    console.log('User created:', user);
}

function deleteUser(index) {
    const dbUser = getLocalStorage();
    dbUser.splice(index, 1);
    setLocalStorage(dbUser);
    console.log('User deleted at index:', index);
}

function updateUser(user, index) {
    const dbUser = getLocalStorage();
    dbUser[index] = user;
    setLocalStorage(dbUser);
    console.log('User updated at index:', index, user);
}

function createRowTableUser(user, index) {
    const tbody = document.querySelector('.table tbody');
    const tr = document.createElement('tr');
    tr.classList.add('tbody-tr');
    tr.innerHTML = `
        <td>
            <div>
                <span>${index + 1}</span>
            </div>
        </td>
        <td>
            <div>
                <ion-icon name="person-outline"></ion-icon> 
                <span id="name">${user.nome}</span>
            </div>
        </td>
        <td>
            <div>
                <ion-icon name="mail-outline"></ion-icon>
                <span>${user.email}</span>
            </div>
        </td>
        <td>
            <div>
                <ion-icon name="call-outline"></ion-icon>
                <span>${user.telefone}</span>
            </div>
        </td>
        <td>
            <ion-icon name="calendar-outline"></ion-icon> 
            <span>${user.data}</span>
        </td>
        <td>
            <div>
                <ion-icon name="location-outline"></ion-icon>
                <span>${user.cidade}</span>
            </div>
        </td>
        <td class="tr-icons">
            <ion-icon class="icon" name="create-outline" id="edit-${index}"></ion-icon>
            <ion-icon class="icon" name="trash-outline" id="delete-${index}"></ion-icon>
        </td>
    `;
    tbody.appendChild(tr);
}

document.querySelector('#form').addEventListener('submit', (e) => {
    e.preventDefault();
    saveUserData();
});

function checkFormFieldsValid() {
    const form = document.querySelector('#form');
    return form.reportValidity();
}

function formatDate(input) {
    if (input) {
        const date = new Date(input);
        const day = String(date.getDate() + 1).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }
    return '';
}

function saveUserData() {
    const formattedDate = formatDate(data.value);
    if (checkFormFieldsValid()) {
        const user = {
            nome: nome.value,
            email: email.value,
            telefone: telefone.value,
            data: formattedDate,
            cidade: cidade.value
        };

        const index = document.querySelector('#nome').dataset.index;

        if (index === 'new' || index === undefined) {
            createUser(user);
            clearFormFields();
            closeModal();
            updateUserTable();
        } else {
            updateUser(user, index);
            updateUserTable();
            closeModal();
        }

        console.log('User saved:', user);
    }
}

function clearFormFields() {
    document.querySelectorAll('input').forEach(input => input.value = '');
    document.querySelector('#nome').dataset.index = 'new';
}

function updateUserTable() {
    document.querySelector('.table tbody').innerHTML = "";
    const dbUser = getLocalStorage();
    dbUser.forEach(createRowTableUser);
    console.log('Screen updated with users:', dbUser);
    checkTableThisAmpty(); // Chama a função após atualizar a tabela
}

document.addEventListener('DOMContentLoaded', () => {
    updateUserTable();
    checkTableThisAmpty(); // Verifica se a tabela está vazia ao carregar a página
});

function fillFormFields(user) {
    nome.value = user.nome;
    email.value = user.email;
    telefone.value = user.telefone;
    data.value = convertDateToISO(user.data);
    cidade.value = user.cidade;
    nome.dataset.index = user.index;
}

function convertDateToISO(dateString) {
    const [day, month, year] = dateString.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function editUser(index) {
    const users = getLocalStorage()[index];
    users.index = index;
    fillFormFields(users);
    showModal();
}

function handleDeleteClick(event, index) {
    const user = getLocalStorage()[index];
    if (user) {
        showModalDeleteUser();
        document.querySelector('.delete-name').innerHTML = user.nome;

        document.getElementById('delete').addEventListener('click', () => {
            deleteUser(index);
            updateUserTable(); // Atualiza a tabela e verifica se está vazia
            closeModalDeleteUser();
        }, { once: true });

        document.getElementById('cancel').addEventListener('click', () => {
            closeModalDeleteUser();
        }, { once: true });
    } else {
        console.error('Erro: Índice fora do alcance ou item não encontrado no localStorage.');
    }
}

function handleRowAction(e) {
    const clickedIcon = e.target.classList.contains('icon');
    if (clickedIcon) {
        const [action, index] = e.target.id.split('-');
        if (action === 'edit') {
            editUser(index);
        } else if (action === 'delete') {
            handleDeleteClick(e, index);
        }
    }
}

const showModal = () => modalUsuario.classList.add('active');
const closeModal = () => modalUsuario.classList.remove('active');

btnCloseModal.addEventListener('click', closeModal);
const showModalDeleteUser = () => document.querySelector('.modal-confirm-delele').classList.add('active');
const closeModalDeleteUser = () => document.querySelector('.modal-confirm-delele').classList.remove('active');

btnShowModal.addEventListener('click', () => {
    showModal();
    clearFormFields();
});

modalUsuario.addEventListener('click', (e) => {
    if (e.target === modalUsuario) {
        closeModal();
    }
});

function searchUser() {
    const inputSearch = document.querySelector('#search');
    const filterText = inputSearch.value.trim().toLowerCase();
    const trs = document.querySelectorAll('.table tbody tr');

    trs.forEach(tr => {
        const nameElement = tr.querySelector('#name');
        const name = nameElement ? nameElement.textContent.trim().toLowerCase() : '';

        if (!name.includes(filterText)) {
            tr.style.display = 'none';
        } else {
            tr.style.display = 'table-row';
        }
    });
}

function checkTableThisAmpty() {
    const dbUser = getLocalStorage();
    const wrapper = document.querySelector('.wrapper');
    const existingMessage = document.querySelector('.div-list-empty');

    if (existingMessage) {
        existingMessage.remove();
    }

    if (dbUser.length === 0) {
        const div = document.createElement('div');
        div.classList.add('div-list-empty');
        div.innerHTML = 'Nenhum usuário cadastrado!';
        wrapper.appendChild(div);
        console.log('No users found. Displaying message.');
    } else {
        console.log('Users found:', dbUser);
    }
}

inputSearch.addEventListener('focus', () => {
    document.querySelector('.header-search span').classList.add('span-activate');
});
inputSearch.addEventListener('focusout', () => {
    if (inputSearch.value === '') {
        document.querySelector('.header-search span').classList.remove('span-activate');
    }
});

inputSearch.addEventListener('keyup', searchUser);
document.querySelector('.table tbody').addEventListener('click', handleRowAction);