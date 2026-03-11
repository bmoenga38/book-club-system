// ============================================================
// BOOK CLUB - SHARED APPLICATION SCRIPT
// Safe globals for public pages + homepage gamification
// ============================================================

(function () {
    const STORAGE_KEYS = {
        CURRENT_USER: 'currentUser',
        ALL_BOOKS: 'allBooks',
        BORROWINGS: 'borrowings'
    };

    const LEVELS = [
        { title: 'Rookie Reader', min: 0 },
        { title: 'Page Explorer', min: 80 },
        { title: 'Story Seeker', min: 180 },
        { title: 'Chapter Champion', min: 320 },
        { title: 'Library Legend', min: 520 }
    ];

    let homeState = {
        allBooks: [],
        selectedBook: null,
        currentUser: null
    };

    function safeParse(value, fallback) {
        try {
            return JSON.parse(value);
        } catch (error) {
            return fallback;
        }
    }

    function getCurrentUser() {
        return safeParse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER), null);
    }

    function checkAuth() {
        const user = getCurrentUser();

        if (!user) {
            const path = window.location.pathname.toLowerCase();
            const isAuthPage = path.includes('login.html') || path.includes('register.html');
            if (!isAuthPage) {
                window.location.href = '/public/login.html';
            }
            return null;
        }

        return user;
    }

    function logout() {
        Swal.fire({
            title: 'Logout?',
            text: 'Are you sure you want to logout?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, Logout'
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
                window.location.href = '/public/login.html';
            }
        });
    }

    function register() {
        Swal.fire({
            title: 'Become a member?',
            text: 'Create your account to borrow books and track points.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#1e40af',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Go to Register'
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = '/public/register.html';
            }
        });
    }

    function ensureSampleUsers() {
        const sampleUsers = [
            {
                userId: 1,
                fullName: 'Tee User',
                email: 'tee@gmail.com',
                phone: '+1 (555) 123-4567',
                department: 'General Member',
                password: '11230315Bom!$',
                isAdmin: false,
                registeredDate: new Date().toISOString()
            },
            {
                userId: 2,
                fullName: 'Admin User',
                email: 'admin@gmail.com',
                phone: '+1 (555) 987-6543',
                department: 'Administration',
                password: '11230315Bom!$',
                isAdmin: true,
                registeredDate: new Date().toISOString()
            }
        ];

        const stored = safeParse(localStorage.getItem('allUsers'), null);
        if (Array.isArray(stored) && stored.length > 0) {
            let updated = false;
            const merged = stored.map((user) => {
                const match = sampleUsers.find(
                    (sample) => String(sample.email).toLowerCase() === String(user.email || '').toLowerCase()
                );

                if (!match) {
                    return user;
                }

                const normalized = {
                    ...user,
                    fullName: match.fullName,
                    phone: match.phone,
                    department: match.department,
                    password: match.password,
                    isAdmin: match.isAdmin
                };

                if (
                    normalized.fullName !== user.fullName ||
                    normalized.phone !== user.phone ||
                    normalized.department !== user.department ||
                    normalized.password !== user.password ||
                    normalized.isAdmin !== user.isAdmin
                ) {
                    updated = true;
                }

                return normalized;
            });

            sampleUsers.forEach((sample) => {
                const exists = merged.some(
                    (user) => String(user.email || '').toLowerCase() === String(sample.email).toLowerCase()
                );
                if (!exists) {
                    merged.push(sample);
                    updated = true;
                }
            });

            if (updated) {
                localStorage.setItem('allUsers', JSON.stringify(merged));
            }

            return merged;
        }

        localStorage.setItem('allUsers', JSON.stringify(sampleUsers));
        return sampleUsers;
    }

    function ensureSampleBooks() {
        const stored = safeParse(localStorage.getItem(STORAGE_KEYS.ALL_BOOKS), null);
        if (Array.isArray(stored) && stored.length > 0) {
            return stored;
        }

        const sampleBooks = [
            {
                bookId: 1,
                title: 'The Great Controversy',
                author: 'Ellen G. White',
                description: 'A comprehensive look at the conflict between Christ and Satan throughout history.',
                imageUrl: 'https://via.placeholder.com/250x350?text=Great+Controversy',
                isbn: '978-0-8163-2900-6',
                publisher: 'Pacific Press',
                publishedYear: 1888,
                totalCopies: 5,
                availableCopies: 5,
                category: 'Theology'
            },
            {
                bookId: 2,
                title: 'Patriarchs and Prophets',
                author: 'Ellen G. White',
                description: 'The history of ancient Israel and their relationship with God.',
                imageUrl: 'https://via.placeholder.com/250x350?text=Patriarchs',
                isbn: '978-0-8163-2949-5',
                publisher: 'Pacific Press',
                publishedYear: 1890,
                totalCopies: 3,
                availableCopies: 2,
                category: 'Theology'
            },
            {
                bookId: 3,
                title: 'The Desire of Ages',
                author: 'Ellen G. White',
                description: 'The life, ministry, teachings, and death of Jesus Christ.',
                imageUrl: 'https://via.placeholder.com/250x350?text=Desire+of+Ages',
                isbn: '978-0-8163-2901-3',
                publisher: 'Pacific Press',
                publishedYear: 1898,
                totalCopies: 4,
                availableCopies: 4,
                category: 'Biography'
            },
            {
                bookId: 4,
                title: 'Power for Living',
                author: 'Various Authors',
                description: 'Daily inspirational thoughts to strengthen your spiritual journey.',
                imageUrl: 'https://via.placeholder.com/250x350?text=Power+for+Living',
                isbn: '978-0-8163-3088-0',
                publisher: 'Pacific Press',
                publishedYear: 2020,
                totalCopies: 2,
                availableCopies: 1,
                category: 'Inspirational'
            },
            {
                bookId: 5,
                title: 'Steps to Christ',
                author: 'Ellen G. White',
                description: 'A guide to Christian living and personal transformation through faith.',
                imageUrl: 'https://via.placeholder.com/250x350?text=Steps+to+Christ',
                isbn: '978-0-8163-0725-6',
                publisher: 'Pacific Press',
                publishedYear: 1892,
                totalCopies: 6,
                availableCopies: 5,
                category: 'Theology'
            },
            {
                bookId: 6,
                title: 'The Story of Redemption',
                author: 'Ellen G. White',
                description: "Chronicles humanity's journey from creation to restoration.",
                imageUrl: 'https://via.placeholder.com/250x350?text=Story+of+Redemption',
                isbn: '978-0-8163-2939-6',
                publisher: 'Pacific Press',
                publishedYear: 1947,
                totalCopies: 3,
                availableCopies: 3,
                category: 'Theology'
            },
            {
                bookId: 7,
                title: 'Thoughts from the Mount of Blessing',
                author: 'Ellen G. White',
                description: 'Expositions on the Beatitudes and Sermon on the Mount.',
                imageUrl: 'https://via.placeholder.com/250x350?text=Mount+of+Blessing',
                isbn: '978-0-8163-2934-1',
                publisher: 'Pacific Press',
                publishedYear: 1896,
                totalCopies: 2,
                availableCopies: 2,
                category: 'Inspirational'
            },
            {
                bookId: 8,
                title: "Christ's Object Lessons",
                author: 'Ellen G. White',
                description: "Detailed explanations of Jesus' parables and their spiritual significance.",
                imageUrl: 'https://via.placeholder.com/250x350?text=Object+Lessons',
                isbn: '978-0-8163-2906-8',
                publisher: 'Pacific Press',
                publishedYear: 1900,
                totalCopies: 4,
                availableCopies: 3,
                category: 'Theology'
            }
        ];

        localStorage.setItem(STORAGE_KEYS.ALL_BOOKS, JSON.stringify(sampleBooks));
        return sampleBooks;
    }

    function updateUserChip() {
        const chip = document.getElementById('currentUser');
        if (!chip) {
            return;
        }

        const user = homeState.currentUser || getCurrentUser();
        if (user && user.fullName) {
            chip.innerHTML = `<i class="fas fa-user-circle"></i> ${user.fullName}`;
        } else {
            chip.innerHTML = '<i class="fas fa-user-circle"></i> Guest';
        }
    }

    function getUserBorrows(userId) {
        if (!userId) {
            return [];
        }
        return safeParse(localStorage.getItem('userBorrows_' + userId), []) || [];
    }

    function getGamificationData(userId) {
        const borrows = getUserBorrows(userId);
        const returned = borrows.filter((b) => b.status === 'Returned').length;
        const active = borrows.filter((b) => b.status === 'Scheduled' || b.status === 'Confirmed').length;
        const pending = borrows.filter((b) => b.status === 'Pending').length;

        const points = (returned * 40) + (active * 25) + (pending * 10);

        let level = LEVELS[0].title;
        for (let i = LEVELS.length - 1; i >= 0; i -= 1) {
            if (points >= LEVELS[i].min) {
                level = LEVELS[i].title;
                break;
            }
        }

        const streak = calculateStreakDays(borrows);

        const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        const weeklyBorrows = borrows.filter((b) => {
            const date = new Date(b.requestDate || b.borrowDate || 0).getTime();
            return date >= weekAgo && b.status !== 'Canceled';
        }).length;

        const weeklyGoal = 3;
        const weeklyProgress = Math.min(weeklyBorrows, weeklyGoal);
        const weeklyPercent = Math.round((weeklyProgress / weeklyGoal) * 100);

        return {
            points,
            level,
            streak,
            weeklyProgress,
            weeklyGoal,
            weeklyPercent
        };
    }

    function calculateStreakDays(borrows) {
        if (!borrows.length) {
            return 0;
        }

        const daySet = new Set();
        borrows.forEach((b) => {
            const d = new Date(b.requestDate || b.borrowDate || b.actualReturnDate || 0);
            if (!Number.isNaN(d.getTime())) {
                daySet.add(d.toISOString().slice(0, 10));
            }
        });

        const days = Array.from(daySet).sort();
        if (!days.length) {
            return 0;
        }

        let streak = 1;
        for (let i = days.length - 1; i > 0; i -= 1) {
            const current = new Date(days[i]);
            const previous = new Date(days[i - 1]);
            const diff = Math.round((current - previous) / (24 * 60 * 60 * 1000));
            if (diff === 1) {
                streak += 1;
            } else {
                break;
            }
        }

        return streak;
    }

    function renderGamification() {
        const pointsEl = document.getElementById('userPoints');
        const levelEl = document.getElementById('userLevel');
        const streakEl = document.getElementById('userStreak');
        const challengeTextEl = document.getElementById('challengeProgressText');
        const challengeBarEl = document.getElementById('challengeProgressBar');

        if (!pointsEl || !levelEl || !streakEl || !challengeTextEl || !challengeBarEl) {
            return;
        }

        const userId = homeState.currentUser ? homeState.currentUser.userId : null;
        const data = getGamificationData(userId);

        pointsEl.textContent = String(data.points);
        levelEl.textContent = data.level;
        streakEl.textContent = String(data.streak);
        challengeTextEl.textContent = `Borrow ${data.weeklyProgress}/${data.weeklyGoal} books this week`;
        challengeBarEl.style.width = `${data.weeklyPercent}%`;

        const progressWrap = challengeBarEl.parentElement;
        if (progressWrap) {
            progressWrap.setAttribute('aria-valuenow', String(data.weeklyPercent));
        }
    }

    function renderBooks(books) {
        const container = document.getElementById('booksContainer');
        if (!container) {
            return;
        }

        if (!books.length) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No Books Found</h3>
                    <p>Try adjusting your search or filter criteria</p>
                </div>
            `;
            return;
        }

        const cards = books.map((book) => {
            const available = Number(book.availableCopies) > 0;
            const badgeClass = available ? 'available-badge' : 'unavailable-badge';
            const badgeText = available ? `${book.availableCopies} Available` : 'Not Available';
            const disabledAttr = available ? '' : 'disabled';
            const ctaText = available ? 'Borrow +10 XP' : 'Not Available';

            return `
                <div class="col-sm-6 col-lg-4 col-xl-3">
                    <div class="book-card">
                        <div class="book-image">
                            <img src="${book.imageUrl}" alt="${book.title}"
                                 onerror="this.src='https://via.placeholder.com/250x350?text=${encodeURIComponent(book.title)}'">
                        </div>
                        <div class="book-details">
                            <h5 class="book-title">${book.title}</h5>
                            <p class="book-author"><i class="fas fa-pen-fancy"></i> ${book.author}</p>
                            <span class="book-category">${book.category}</span>
                            <p class="book-description">${book.description}</p>
                            <div class="book-availability">
                                <span class="${badgeClass}">${badgeText}</span>
                                <small style="color: #64748b;"><i class="fas fa-book"></i> ${book.totalCopies} total</small>
                            </div>
                            <button class="btn-borrow" ${disabledAttr} onclick="openBorrowModal(${book.bookId})">
                                <i class="fas fa-hand-holding-heart"></i> ${ctaText}
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = `<div class="row g-4">${cards}</div>`;
    }

    function loadHomepageBooks() {
        homeState.allBooks = ensureSampleBooks();
        renderBooks(homeState.allBooks);
        renderGamification();
    }

    function filterHomepageBooks() {
        const searchInput = document.getElementById('searchInput');
        const categoryFilter = document.getElementById('categoryFilter');

        if (!searchInput || !categoryFilter) {
            return;
        }

        const searchTerm = searchInput.value.trim().toLowerCase();
        const category = categoryFilter.value;

        const filtered = homeState.allBooks.filter((book) => {
            const title = String(book.title || '').toLowerCase();
            const author = String(book.author || '').toLowerCase();
            const categoryName = String(book.category || '');

            const matchesSearch = !searchTerm || title.includes(searchTerm) || author.includes(searchTerm);
            const matchesCategory = !category || categoryName === category;

            return matchesSearch && matchesCategory;
        });

        renderBooks(filtered);
    }

    function openHomepageBorrowModal(bookId) {
        homeState.currentUser = getCurrentUser();

        if (!homeState.currentUser) {
            Swal.fire({
                icon: 'warning',
                title: 'Login Required',
                text: 'Please login to borrow books and earn XP.',
            confirmButtonText: 'Go to Login',
            confirmButtonColor: '#1e40af'
        }).then(() => {
                window.location.href = '/public/login.html';
            });
            return;
        }

        const selected = homeState.allBooks.find((b) => b.bookId === bookId);
        if (!selected) {
            Swal.fire('Error', 'Book not found', 'error');
            return;
        }

        if (selected.availableCopies <= 0) {
            Swal.fire('Not Available', 'This book is currently not available', 'error');
            return;
        }

        homeState.selectedBook = selected;

        const content = document.getElementById('borrowModalContent');
        if (!content) {
            return;
        }

        content.innerHTML = `
            <div class="text-center mb-4">
                <img src="${selected.imageUrl}" alt="${selected.title}"
                     style="max-width: 150px; height: auto; border-radius: 8px;"
                     onerror="this.src='https://via.placeholder.com/150?text=${encodeURIComponent(selected.title)}'">
            </div>
            <h5>${selected.title}</h5>
            <p class="text-muted"><i class="fas fa-pen-fancy"></i> ${selected.author}</p>

            <div class="alert alert-info">
                <strong>Quest Rewards:</strong>
                <ul style="margin: 10px 0 0 20px; padding: 0;">
                    <li>+10 XP instantly on request</li>
                    <li>+25 XP when issued by admin</li>
                    <li>+40 XP when returned on time</li>
                </ul>
            </div>

            <p><strong>Available Copies:</strong> ${selected.availableCopies}</p>
            <p><strong>Loan Period:</strong> 14 days</p>
        `;

        const modal = new bootstrap.Modal(document.getElementById('borrowModal'));
        modal.show();
    }

    function confirmHomepageBorrow() {
        if (!homeState.selectedBook) {
            Swal.fire('Error', 'No book selected', 'error');
            return;
        }

        homeState.currentUser = getCurrentUser();
        if (!homeState.currentUser) {
            Swal.fire('Error', 'Please login first', 'error');
            return;
        }

        const borrow = {
            borrowId: Date.now(),
            userId: homeState.currentUser.userId,
            bookId: homeState.selectedBook.bookId,
            status: 'Pending',
            requestDate: new Date().toISOString(),
            borrowDate: null,
            returnDate: null,
            verificationCode: null
        };

        const userKey = 'userBorrows_' + homeState.currentUser.userId;
        const borrows = safeParse(localStorage.getItem(userKey), []) || [];
        borrows.push(borrow);
        localStorage.setItem(userKey, JSON.stringify(borrows));

        const idx = homeState.allBooks.findIndex((b) => b.bookId === homeState.selectedBook.bookId);
        if (idx >= 0 && homeState.allBooks[idx].availableCopies > 0) {
            homeState.allBooks[idx].availableCopies -= 1;
        }
        localStorage.setItem(STORAGE_KEYS.ALL_BOOKS, JSON.stringify(homeState.allBooks));

        const modalEl = document.getElementById('borrowModal');
        if (modalEl) {
            const instance = bootstrap.Modal.getInstance(modalEl);
            if (instance) {
                instance.hide();
            }
        }

        Swal.fire({
            icon: 'success',
            title: 'Quest Updated!',
            text: 'Borrow request submitted. You earned +10 XP.',
            confirmButtonColor: '#1e40af',
            confirmButtonText: 'View My Borrows'
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = '/public/my-borrows.html';
                return;
            }

            loadHomepageBooks();
            filterHomepageBooks();
        });
    }

    function initializeHomepage() {
        const booksContainer = document.getElementById('booksContainer');
        if (!booksContainer) {
            return;
        }

        // Initialize default users and books
        ensureSampleUsers();
        ensureSampleBooks();
        
        homeState.currentUser = getCurrentUser();
        updateUserChip();
        loadHomepageBooks();
    }

    document.addEventListener('DOMContentLoaded', function () {
        // Ensure default users exist in localStorage
        ensureSampleUsers();
        initializeHomepage();
    });

    if (!window.checkAuth) {
        window.checkAuth = checkAuth;
    }

    if (!window.logout) {
        window.logout = logout;
    }

    if (!window.register) {
        window.register = register;
    }

    if (!window.filterBooks) {
        window.filterBooks = filterHomepageBooks;
    }

    if (!window.openBorrowModal) {
        window.openBorrowModal = openHomepageBorrowModal;
    }

    if (!window.confirmBorrow) {
        window.confirmBorrow = confirmHomepageBorrow;
    }
})();
