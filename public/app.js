const API_URL = '/api/books';

const booksList = document.getElementById('booksList');
const searchInput = document.getElementById('searchInput');
const categorySelect = document.getElementById('categorySelect');
const authorSelect = document.getElementById('authorSelect');
const loadingState = document.getElementById('loadingState');
const emptyState = document.getElementById('emptyState');
const booksTable = document.querySelector('.books-table');

const bookModal = document.getElementById('bookModal');
const bookForm = document.getElementById('bookForm');
const addBookBtn = document.getElementById('addBookBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelBtn = document.getElementById('cancelBtn');
const modalTitle = document.getElementById('modalTitle');
const categoryOptions = document.getElementById('categoryOptions');

let isEditing = false;
let editingId = null;
let currentTimeout = null;

document.addEventListener('DOMContentLoaded', () => {
    fetchBooks();
    fetchCategories();
    fetchAuthors();
});

addBookBtn.addEventListener('click', openAddModal);
closeModalBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);
bookForm.addEventListener('submit', handleFormSubmit);

searchInput.addEventListener('input', () => {
    clearTimeout(currentTimeout);
    currentTimeout = setTimeout(() => {
        fetchBooks(searchInput.value, categorySelect.value, authorSelect.value);
    }, 500);
});

const navLinks = document.querySelectorAll('.nav-link');
const booksView = document.getElementById('booksView');
const placeholderView = document.getElementById('placeholderView');
const placeholderTitle = document.getElementById('placeholderTitle');
const headerTitle = document.querySelector('.header-titles h1');
const headerDesc = document.querySelector('.header-titles p');
const headerActions = document.querySelector('.header-actions');

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        const tab = link.getAttribute('data-tab');
        
        if (tab === 'books') {
            booksView.classList.remove('hidden');
            placeholderView.classList.add('hidden');
            headerTitle.textContent = 'Book Management';
            headerDesc.textContent = 'Add, update, search, and categorize library collection.';
            headerActions.classList.remove('hidden');
        } else {
            booksView.classList.add('hidden');
            placeholderView.classList.remove('hidden');
            
            const moduleName = tab.charAt(0).toUpperCase() + tab.slice(1);
            headerTitle.textContent = moduleName + ' Management';
            headerDesc.textContent = 'Manage ' + tab + ' within the LNMIIT Library System.';
            placeholderTitle.textContent = moduleName + ' Module Under Construction';
            headerActions.querySelector('#addBookBtn').classList.add('hidden');
        }
    });
});

categorySelect.addEventListener('change', () => {
    fetchBooks(searchInput.value, categorySelect.value, authorSelect.value);
});

authorSelect.addEventListener('change', () => {
    fetchBooks(searchInput.value, categorySelect.value, authorSelect.value);
});

async function fetchBooks(search = '', category = '', author = '') {
    showLoading(true);
    try {
        let url = API_URL;
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (category) params.append('category', category);
        if (author) params.append('author', author);

        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch books');
        
        const books = await response.json();
        renderBooks(books);
    } catch (error) {
        alert(error.message);
        renderBooks([]);
    } finally {
        showLoading(false);
    }
}

async function fetchCategories() {
    try {
        const response = await fetch(`${API_URL}/categories/all`);
        if (!response.ok) return;
        
        const categories = await response.json();
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            categorySelect.appendChild(option);

            const dlOption = document.createElement('option');
            dlOption.value = cat;
            categoryOptions.appendChild(dlOption);
        });
    } catch (error) {
        console.log('Failed to load categories', error);
    }
}

async function fetchAuthors() {
    try {
        const response = await fetch(`${API_URL}/authors/all`);
        if (!response.ok) return;
        
        const authors = await response.json();
        authors.forEach(auth => {
            const option = document.createElement('option');
            option.value = auth;
            option.textContent = auth;
            authorSelect.appendChild(option);
        });
    } catch (error) {
        console.log('Failed to load authors', error);
    }
}

function renderBooks(books) {
    booksList.innerHTML = '';

    if (books.length === 0) {
        booksTable.parentElement.querySelector('table').classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }

    booksTable.parentElement.querySelector('table').classList.remove('hidden');
    emptyState.classList.add('hidden');

    books.forEach(book => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div class="book-info">
                    <span class="book-title">${book.title}</span>
                    <span class="book-author">by ${book.author}</span>
                </div>
            </td>
            <td><span class="text-muted">${book.isbn}</span></td>
            <td><span class="badge">${book.category}</span></td>
            <td>
                <span class="copies-info" style="background: ${book.copies > 0 ? 'var(--surface-light)' : 'rgba(247, 118, 142, 0.1)'}; color: ${book.copies > 0 ? 'inherit' : 'var(--danger)'}">
                    ${book.copies}
                </span>
            </td>
            <td>
                <div class="actions-cell">
                    <button class="btn-icon" onclick="openEditModal('${book._id}', '${book.title}', '${book.author}', '${book.isbn}', ${book.copies}, '${book.category}')">
                        edit
                    </button>
                    <button class="btn-icon delete" onclick="deleteBook('${book._id}')">
                        delete
                    </button>
                </div>
            </td>
        `;
        booksList.appendChild(tr);
    });
}

async function handleFormSubmit(e) {
    e.preventDefault();

    const bookData = {
        title: document.getElementById('title').value,
        author: document.getElementById('author').value,
        isbn: document.getElementById('isbn').value,
        copies: parseInt(document.getElementById('copies').value),
        category: document.getElementById('category').value
    };

    try {
        const url = isEditing ? `${API_URL}/${editingId}` : API_URL;
        const method = isEditing ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookData)
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Error saving book');
        }

        alert(`Book successfully ${isEditing ? 'updated' : 'added'}!`);
        closeModal();
        fetchBooks(searchInput.value, categorySelect.value, authorSelect.value);
        
        if (!isEditing) {
            categorySelect.innerHTML = '<option value="">All Categories</option>';
            authorSelect.innerHTML = '<option value="">All Authors</option>';
            categoryOptions.innerHTML = '';
            fetchCategories();
            fetchAuthors();
        }
    } catch (error) {
        alert(error.message);
    }
}

async function deleteBook(id) {
    if (!confirm('Are you sure you want to delete this book?')) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete book');

        alert('Book deleted successfully');
        fetchBooks(searchInput.value, categorySelect.value, authorSelect.value);
    } catch (error) {
        alert(error.message);
    }
}

function openAddModal() {
    isEditing = false;
    editingId = null;
    modalTitle.textContent = 'Add New Book';
    document.getElementById('bookId').value = '';
    bookForm.reset();
    bookModal.classList.remove('hidden');
}

function openEditModal(id, title, author, isbn, copies, category) {
    isEditing = true;
    editingId = id;
    modalTitle.textContent = 'Edit Book Details';
    
    document.getElementById('bookId').value = id;
    document.getElementById('title').value = title;
    document.getElementById('author').value = author;
    document.getElementById('isbn').value = isbn;
    document.getElementById('copies').value = copies;
    document.getElementById('category').value = category;
    
    bookModal.classList.remove('hidden');
}

function closeModal() {
    bookModal.classList.add('hidden');
    bookForm.reset();
}

function showLoading(isLoading) {
    if (isLoading) {
        loadingState.classList.remove('hidden');
        booksTable.parentElement.querySelector('table').classList.add('hidden');
        emptyState.classList.add('hidden');
    } else {
        loadingState.classList.add('hidden');
    }
}
