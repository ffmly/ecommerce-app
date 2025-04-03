// State management
let currentPage = 'home';
let cart = [];
let searchHistory = [];
let selectedProduct = null;
let selectedColor = null;
let selectedSize = null;
let deliveryOption = 'standard';
let searchTerm = '';
let profileStats = {
    totalOrders: 0,
    pendingOrders: 0
};

// Real-time update interval (in milliseconds)
const UPDATE_INTERVAL = 5000;

// DOM Elements
const app = document.getElementById('app');
const splashScreen = document.getElementById('splash-screen');

// Initialize app with splash screen and auth check
async function initializeApp() {
    try {
        // Initialize data
        initializeCategories();
        initializeProducts();
        initializeNotifications();
        
        // Initialize cart from localStorage
        window.cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // Show splash screen
        if (splashScreen) {
            splashScreen.style.display = 'flex';
        }
        if (app) {
            app.style.display = 'none';
        }

        // Load saved state
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));

        // Simulate loading time (2 seconds)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Hide splash screen and show app
        if (splashScreen) {
            splashScreen.classList.add('fade-out');
            setTimeout(() => {
                splashScreen.style.display = 'none';
                if (app) {
                    app.style.display = 'block';
                    app.style.opacity = '1';
                    
                    document.querySelectorAll('.page').forEach(page => {
                        page.style.display = 'none';
                    });
                    
                    const initialPage = currentUser ? 'home' : 'login';
                    const pageElement = document.getElementById(`${initialPage}-page`);
                    if (pageElement) {
                        pageElement.style.display = 'block';
                        switch (initialPage) {
                            case 'login':
                                renderLogin();
                                break;
                            case 'home':
                                renderHome();
                                break;
                        }
                    }
                }
            }, 500);
        }
    } catch (error) {
        console.error('Error initializing app:', error);
        if (app) {
            app.style.display = 'block';
            const loginPage = document.getElementById('login-page');
            if (loginPage) {
                loginPage.style.display = 'block';
                renderLogin();
            }
        }
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

// Router
function navigate(page, data = null) {
    // Update current page
    currentPage = page;
    
    // Check authentication for protected routes
    const protectedRoutes = ['profile', 'cart', 'orders'];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (protectedRoutes.includes(page) && !currentUser) {
        page = 'login';
    }

    // Hide all pages first
    document.querySelectorAll('.page').forEach(p => {
        p.style.display = 'none';
    });
    
    // Show selected page
    const pageElement = document.getElementById(`${page}-page`);
    if (pageElement) {
        pageElement.style.display = 'block';
        
        // Update stats if navigating to profile
        if (page === 'profile') {
            updateProfileStats();
        }
    }

    // Update active state in bottom nav
    document.querySelectorAll('.bottom-nav a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === page) {
            link.classList.add('active');
        }
    });

    // Handle page-specific logic
    switch (page) {
        case 'home':
            renderHome();
            break;
        case 'search':
            renderSearch();
            break;
        case 'cart':
            renderCart();
            break;
        case 'profile':
            renderProfile();
            break;
        case 'product':
            renderProductDetail(data);
            break;
        case 'delivery':
            renderDelivery();
            break;
        case 'login':
            renderLogin();
            break;
        case 'signup':
            renderSignup();
            break;
    }

    // Scroll to top
    window.scrollTo(0, 0);
}

// Render Functions
function renderApp() {
    switch (currentPage) {
        case 'home':
            renderHome();
            break;
        case 'search':
            renderSearch();
            break;
        case 'cart':
            renderCart();
            break;
        case 'profile':
            if (!authState.isAuthenticated) {
                navigate('login');
                return;
            }
            renderProfile();
            break;
        case 'notifications':
            renderNotifications();
            break;
        case 'login':
            app.innerHTML = renderLogin();
            break;
        case 'signup':
            app.innerHTML = renderSignup();
            break;
        case 'product':
            renderProductDetail();
            break;
        default:
            renderHome();
    }
    renderBottomNav();
}

function formatTimestamp(timestamp) {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) {
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
        return `${diffInHours} hours ago`;
    } else {
        return date.toLocaleDateString();
    }
}

function renderNotifications() {
    const notificationsPage = document.getElementById('notifications-page');
    if (!notificationsPage) return;

    const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    const unreadCount = notifications.filter(n => !n.isRead).length;

    notificationsPage.innerHTML = `
        <div class="min-h-screen bg-gray-50">
            <!-- Header -->
            <div class="bg-white sticky top-0 z-10 shadow-sm">
                <div class="flex items-center p-4">
                    <button onclick="navigate('home')" class="mr-4">
                        <i class="fas fa-arrow-left text-gray-600"></i>
                    </button>
                    <h1 class="text-xl font-bold">Notifications</h1>
                </div>
            </div>

            <!-- Notification List -->
            <div class="divide-y divide-gray-200">
                ${notifications.length > 0 ? notifications.map(notification => `
                    <div class="p-4 bg-white">
                        <div class="flex items-start">
                            <div class="flex-shrink-0">
                                <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                    <i class="fas ${notification.icon || 'fa-bell'} text-green-500"></i>
                                </div>
                            </div>
                            <div class="ml-4 flex-1">
                                <p class="text-sm text-gray-600">${notification.message}</p>
                                <span class="text-xs text-gray-500">${formatTimestamp(notification.timestamp)}</span>
                            </div>
                        </div>
                    </div>
                `).join('') : `
                    <div class="flex flex-col items-center justify-center p-8">
                        <i class="fas fa-bell-slash text-gray-300 text-5xl mb-4"></i>
                        <p class="text-gray-500">No notifications yet</p>
                    </div>
                `}
            </div>
        </div>
        ${renderBottomNav()}
    `;
}

function getNotificationColor(color) {
    const colors = {
        green: '#4CAF50',
        orange: '#FF9800',
        blue: '#2196F3',
        purple: '#9C27B0',
        red: '#F44336'
    };
    return colors[color] || colors.blue;
}

function markAllAsRead() {
    notifications.forEach(notification => {
        notification.isRead = true;
    });
    renderNotifications();
    showToast('All notifications marked as read');
}

// Add category filter function
function filterByCategory(category) {
    localStorage.setItem('selectedCategory', category);
    const homePage = document.getElementById('home-page');
    if (homePage) {
        renderHome();
    }
}

// Update bottom navigation
function renderBottomNav() {
    return `
        <nav class="bottom-nav fixed bottom-0 left-0 right-0 bg-white border-t flex items-center justify-around px-2 pt-1 pb-[calc(0.25rem+env(safe-area-inset-bottom))] z-30">
            <a href="#" onclick="navigate('home')" class="flex flex-col items-center py-2 px-4 ${currentPage === 'home' ? 'text-green-500' : 'text-gray-600'}">
                <i class="fas fa-home text-xl mb-1"></i>
                <span class="text-xs">Home</span>
            </a>
            <a href="#" onclick="navigate('search')" class="flex flex-col items-center py-2 px-4 ${currentPage === 'search' ? 'text-green-500' : 'text-gray-600'}">
                <i class="fas fa-search text-xl mb-1"></i>
                <span class="text-xs">Search</span>
            </a>
            <a href="#" onclick="navigate('cart')" class="flex flex-col items-center py-2 px-4 ${currentPage === 'cart' ? 'text-green-500' : 'text-gray-600'}">
                <div class="relative">
                    <i class="fas fa-shopping-cart text-xl mb-1"></i>
                    ${cart.length > 0 ? `
                        <span class="absolute -top-1 -right-2 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                            ${cart.length}
                        </span>
                    ` : ''}
                </div>
                <span class="text-xs">Cart</span>
            </a>
            <a href="#" onclick="navigate('profile')" class="flex flex-col items-center py-2 px-4 ${currentPage === 'profile' ? 'text-green-500' : 'text-gray-600'}">
                <i class="fas fa-user text-xl mb-1"></i>
                <span class="text-xs">Profile</span>
            </a>
        </nav>
    `;
}

// Update renderHome function to include notifications
function renderHome() {
    const homePage = document.getElementById('home-page');
    if (!homePage) return;
    
    homePage.innerHTML = `
        <div class="min-h-screen bg-gray-100 pb-16">
            <!-- Header -->
            <div class="bg-white sticky top-0 z-20 shadow-sm">
                <div class="safe-area-top"></div>
                <div class="flex items-center justify-between p-4">
                    <h1 class="text-xl font-bold">Store</h1>
                    <div class="flex items-center gap-3">
                        <button onclick="navigate('notifications')" class="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100">
                            <i class="fas fa-bell text-lg text-gray-600"></i>
                        </button>
                        <button onclick="navigate('cart')" class="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100">
                            <i class="fas fa-shopping-cart text-lg text-gray-600"></i>
                            ${cart.length > 0 ? `
                                <span class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                    ${cart.length}
                                </span>
                            ` : ''}
                        </button>
                    </div>
                </div>

                <!-- Search Bar -->
                <div class="px-4 pb-3">
                    <div class="relative" onclick="navigate('search')">
                        <input type="text" 
                               placeholder="Search products..." 
                               class="w-full p-2.5 pl-10 rounded-full bg-gray-100 focus:outline-none text-sm"
                               readonly>
                        <span class="absolute left-3 top-1/2 transform -translate-y-1/2">
                            <i class="fas fa-search text-gray-400"></i>
                        </span>
                    </div>
                </div>
            </div>

            <!-- Categories -->
            <div class="bg-white shadow-sm sticky top-[116px] z-10">
                <div class="px-2 py-3 overflow-x-auto scroll-smooth categories-scroll">
                    <div class="flex space-x-2">
                        ${renderCategories()}
                    </div>
                </div>
            </div>

            <!-- Products Grid -->
            <div class="p-3">
                <div class="grid grid-cols-2 gap-2">
                    ${renderProducts()}
                </div>
            </div>
        </div>
        ${renderBottomNav()}
    `;
}

function renderCategories() {
    const categories = JSON.parse(localStorage.getItem('categories')) || [];
    const selectedCategory = localStorage.getItem('selectedCategory') || 'All';

    return categories.map(category => `
        <button onclick="filterByCategory('${category.name}')"
                class="flex flex-col items-center justify-center min-w-[72px] p-2 rounded-lg ${
                    category.name === selectedCategory
                        ? 'text-green-500 bg-green-50'
                        : 'text-gray-600'
                }">
            <div class="w-10 h-10 rounded-full flex items-center justify-center ${
                category.name === selectedCategory
                    ? 'bg-green-100'
                    : 'bg-gray-100'
            }">
                <i class="${category.icon} text-lg"></i>
            </div>
            <span class="text-xs mt-1 font-medium truncate w-full text-center">${category.name}</span>
        </button>
    `).join('');
}

function renderProducts() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const selectedCategory = localStorage.getItem('selectedCategory') || 'All';

    const filteredProducts = selectedCategory === 'All' 
        ? products 
        : products.filter(product => product.category === selectedCategory);

    return filteredProducts.map(product => `
        <div class="bg-white rounded-xl shadow-sm overflow-hidden active:scale-95 transition-transform" 
             onclick="navigate('product', ${JSON.stringify(product)})">
            <div class="relative pt-[100%] bg-gray-50">
                <img src="${product.image}" 
                     alt="${product.name}" 
                     class="absolute top-0 left-0 w-full h-full object-contain p-2">
                ${product.discount ? `
                    <span class="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        -${product.discount}%
                    </span>
                ` : ''}
            </div>
            <div class="p-2">
                <h3 class="text-sm font-medium line-clamp-2 min-h-[2.5rem] mb-1">${product.name}</h3>
                <div class="flex items-center gap-1 mb-2">
                    <div class="flex items-center text-yellow-400 text-xs">
                        <i class="fas fa-star"></i>
                        <span class="ml-1 text-gray-600">${product.rating}</span>
                    </div>
                    <span class="text-xs text-gray-400">•</span>
                    <span class="text-xs text-gray-600">${product.sold || 0} sold</span>
                </div>
                <div class="flex items-center justify-between">
                    <div>
                        <div class="text-green-600 font-bold text-sm">${product.price} DZD</div>
                        ${product.oldPrice ? `
                            <div class="text-xs text-gray-400 line-through">${product.oldPrice} DZD</div>
                        ` : ''}
                    </div>
                    <button onclick="event.stopPropagation(); addToCart(${product.id})" 
                            class="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center shadow-sm active:scale-95 transition-transform">
                        <i class="fas fa-plus text-sm"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function renderProductDetail() {
    if (!selectedProduct) return navigate('home');

    app.innerHTML = `
        <div class="pb-16">
            <!-- Header -->
            <div class="bg-white sticky top-0 z-10">
                <div class="flex items-center p-4">
                    <button onclick="navigate('home')" class="mr-4">
                        <i class="fas fa-arrow-left text-xl"></i>
                    </button>
                    <h1 class="text-xl font-bold">${selectedProduct.name}</h1>
                    <button onclick="shareProduct(${
                        selectedProduct.id
                    })" class="ml-4">
                        <i class="fas fa-share-alt text-xl"></i>
                    </button>
                </div>
            </div>

            <!-- Product Images -->
            <div class="bg-white mb-4">
                <div class="relative">
                    <img src="${selectedProduct.image}" 
                         alt="${selectedProduct.name}" 
                         class="w-full h-72 object-contain p-4">
                </div>
            </div>

            <!-- Product Info -->
            <div class="bg-white p-4 mb-4">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h2 class="text-2xl font-bold mb-2">${
                            selectedProduct.name
                        }</h2>
                        <div class="flex items-center">
                            <div class="flex items-center mr-4">
                                <span class="text-xl font-bold mr-2">${
                                    selectedProduct.rating
                                }</span>
                                <i class="fas fa-star text-yellow-400"></i>
                            </div>
                            <span class="text-gray-500">${
                                selectedProduct.reviews.length
                            } reviews</span>
                        </div>
                    </div>
                    <div class="text-3xl font-bold text-green-500">${selectedProduct.price} DZD</div>
                </div>

                <!-- Color Selection -->
                <div class="mb-6">
                    <h3 class="text-lg font-semibold mb-3">Select Color</h3>
                    <div class="flex space-x-3">
                        ${selectedProduct.colors
                            .map(
                                color => `
                            <button onclick="selectColor('${color}')" 
                                    class="w-12 h-12 rounded-full border-2 flex items-center justify-center ${
                                        selectedColor === color
                                            ? 'border-green-500'
                                            : 'border-gray-200'
                                    }">
                                <div class="w-8 h-8 rounded-full" 
                                     style="background-color: ${color.toLowerCase()}"></div>
                            </button>
                        `
                            )
                            .join('')}
                    </div>
                </div>

                <!-- Size Selection (if applicable) -->
                ${
                    selectedProduct.sizes
                        ? `
                    <div class="mb-6">
                        <h3 class="text-lg font-semibold mb-3">Select Size</h3>
                        <div class="flex flex-wrap gap-3">
                            ${selectedProduct.sizes
                                .map(
                                    size => `
                                <button onclick="selectSize('${size}')"
                                        class="w-14 h-14 rounded-lg border-2 flex items-center justify-center ${
                                            selectedSize === size
                                                ? 'border-green-500 bg-green-50'
                                                : 'border-gray-200'
                                        }">
                                    ${size}
                                </button>
                            `
                                )
                                .join('')}
                        </div>
                    </div>
                `
                        : ''
                }

                <!-- Quantity Picker -->
                <div class="mb-6">
                    <h3 class="text-lg font-semibold mb-3">Quantity</h3>
                    <div class="flex items-center space-x-4">
                        <button onclick="updateQuantity(selectedProduct.id, Math.max(1, (selectedProduct.quantity || 1) - 1))"
                                class="w-10 h-10 rounded-lg border-2 border-gray-200 flex items-center justify-center">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="text-xl font-semibold">${
                            selectedProduct.quantity || 1
                        }</span>
                        <button onclick="updateQuantity(selectedProduct.id, (selectedProduct.quantity || 1) + 1)"
                                class="w-10 h-10 rounded-lg border-2 border-gray-200 flex items-center justify-center">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>

                <!-- Product Description -->
                <div class="mb-6">
                    <h3 class="text-lg font-semibold mb-3">Description</h3>
                    <p class="text-gray-600">${selectedProduct.description}</p>
                </div>

                <!-- Specifications -->
                <div class="mb-6">
                    <h3 class="text-lg font-semibold mb-3">Specifications</h3>
                    <ul class="space-y-2">
                        ${selectedProduct.specs
                            .map(
                                spec => `
                            <li class="flex items-center">
                                <i class="fas fa-check text-green-500 mr-2"></i>
                                ${spec}
                            </li>
                        `
                            )
                            .join('')}
                    </ul>
                </div>

                <!-- Action Buttons -->
                <div class="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg flex space-x-4">
                    <button onclick="addToCart(selectedProduct.id)" 
                            class="flex-1 bg-green-500 text-white py-3 rounded-lg font-semibold flex items-center justify-center">
                        <i class="fas fa-cart-plus mr-2"></i>
                        Add to Cart
                    </button>
                    <button onclick="buyNow(selectedProduct.id)"
                            class="flex-1 bg-black text-white py-3 rounded-lg font-semibold">
                        Buy Now
                    </button>
                </div>
            </div>
        </div>
    `;
}

function quickView(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const quickViewHtml = `
        <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div class="p-4">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-bold">${product.name}</h3>
                        <button onclick="closeQuickView()" class="text-gray-500">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    <img src="${product.image}" alt="${
                        product.name
                    }" class="w-full h-64 object-contain mb-4">
                    <div class="flex justify-between items-center mb-4">
                        <div class="text-2xl font-bold">${product.price} DZD</div>
                        <div class="flex items-center">
                            <span class="mr-1">${product.rating}</span>
                            <i class="fas fa-star text-yellow-400"></i>
                        </div>
                    </div>
                    <p class="text-gray-600 mb-4">${product.description}</p>
                    <div class="flex space-x-4">
                        <button onclick="addToCart(${
                            product.id
                        }); closeQuickView()" 
                                class="flex-1 bg-green-500 text-white py-3 rounded-lg font-semibold flex items-center justify-center">
                            <i class="fas fa-cart-plus mr-2"></i>
                            Add to Cart
                        </button>
                        <button onclick="navigate('product', ${JSON.stringify(
                            product
                        )}); closeQuickView()" 
                                class="flex-1 bg-black text-white py-3 rounded-lg font-semibold">
                            View Details
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    const quickViewElement = document.createElement('div');
    quickViewElement.id = 'quickView';
    quickViewElement.innerHTML = quickViewHtml;
    document.body.appendChild(quickViewElement);
}

function closeQuickView() {
    const quickView = document.getElementById('quickView');
    if (quickView) {
        quickView.remove();
    }
}

function renderSavedAddresses() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const addresses = currentUser?.addresses || [];

    return `
        <div class="bg-white rounded-lg shadow-lg p-6 mt-6">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold">Saved Addresses</h3>
                <button onclick="addNewAddress()" class="text-green-600 hover:text-green-700">
                    <i class="fas fa-plus mr-1"></i> Add New
                </button>
            </div>
            ${addresses.length > 0 ? `
                <div class="space-y-4">
                    ${addresses.map((address, index) => `
                        <div class="border rounded-lg p-4">
                            <div class="flex justify-between items-start">
                                <div>
                                    <h4 class="font-medium">${address.type || 'Address'} ${index + 1}</h4>
                                    <p class="text-sm text-gray-600 mt-1">${address.street}</p>
                                    <p class="text-sm text-gray-600">${address.city}, ${address.state} ${address.postalCode}</p>
                                </div>
                                <div class="flex space-x-2">
                                    <button onclick="editAddress(${index})" class="text-blue-600 hover:text-blue-700">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button onclick="deleteAddress(${index})" class="text-red-600 hover:text-red-700">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-map-marker-alt text-4xl mb-2"></i>
                    <p>No saved addresses</p>
                </div>
            `}
        </div>
    `;
}

function renderProfile() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        navigate('login');
        return;
    }

    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const userOrders = orders.filter(order => order.userId === currentUser.id);

    const profilePage = document.getElementById('profile-page');
    if (!profilePage) return;

    profilePage.innerHTML = `
        <div class="min-h-screen bg-gray-50 pb-20">
            <!-- Header -->
            <div class="bg-white sticky top-0 z-10 shadow-sm">
                <div class="flex items-center p-4">
                    <h1 class="text-xl font-bold flex-1">My Profile</h1>
                    <button onclick="logout()" class="text-gray-600">
                        <i class="fas fa-sign-out-alt"></i>
                    </button>
                </div>
            </div>

            <div class="container mx-auto px-4 py-6">
                ${renderUserInfo(userOrders)}
                ${renderRecentOrders(userOrders)}
                ${renderSavedAddresses()}
            </div>
        </div>
        ${renderBottomNav()}
    `;

    // Update profile stats after rendering
    updateProfileStats();
}

function updateProfileStats() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;

    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    
    // Filter orders for current user
    const userOrders = orders.filter(order => order.userId === currentUser.id);
    const pendingOrders = userOrders.filter(order => order.status === 'pending');
    
    // Safely update DOM elements if they exist
    const totalOrdersEl = document.getElementById('total-orders');
    const pendingOrdersEl = document.getElementById('pending-orders');
    
    if (totalOrdersEl) totalOrdersEl.textContent = userOrders.length;
    if (pendingOrdersEl) pendingOrdersEl.textContent = pendingOrders.length;
}

// Add storage event listener for updates
window.addEventListener('storage', (e) => {
    if (e.key === 'orders') {
        updateProfileStats();
    }
});

function renderUserInfo(userOrders) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return '';

    return `
        <div class="bg-white rounded-lg shadow-lg overflow-hidden">
            <!-- Cover Photo -->
            <div class="h-32 bg-gradient-to-r from-green-400 to-blue-500"></div>
            
            <!-- Profile Info -->
            <div class="relative px-6 pb-6">
                <div class="flex flex-col items-center -mt-16">
                    <div class="w-32 h-32 rounded-full bg-gray-200 border-4 border-white shadow-lg mb-4 flex items-center justify-center">
                        <i class="fas fa-user text-4xl text-gray-400"></i>
                    </div>
                    <h2 class="text-2xl font-bold">${currentUser.name || 'User'}</h2>
                    <p class="text-gray-600 mb-4">${currentUser.email || ''}</p>
                </div>

                <!-- Stats Cards -->
                <div class="grid grid-cols-3 gap-4 mb-6">
                    <div class="bg-white p-4 rounded-lg shadow text-center">
                        <div class="text-xl font-bold" id="total-orders">0</div>
                        <div class="text-gray-600">Total Orders</div>
                    </div>
                    <div class="bg-white p-4 rounded-lg shadow text-center">
                        <div class="text-xl font-bold" id="pending-orders">0</div>
                        <div class="text-gray-600">Pending Orders</div>
                    </div>
                </div>

                <!-- Profile Form -->
                <form id="profile-form" class="space-y-4 mt-6">
                    <div class="grid grid-cols-1 gap-4">
                        <div class="form-group">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input type="text" id="profile-name" value="${currentUser.name || ''}" 
                                class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent">
                        </div>
                        <div class="form-group">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input type="email" id="profile-email" value="${currentUser.email || ''}" 
                                class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent">
                        </div>
                        <div class="form-group">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input type="tel" id="profile-phone" value="${currentUser.phone || ''}"
                                class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent">
                        </div>
                    </div>
                </form>
            </div>
        </div>
    `;
}

function renderRecentOrders(userOrders) {
    return `
        <div class="bg-white rounded-lg shadow-lg p-6">
            <h3 class="text-lg font-semibold mb-4">Recent Orders</h3>
            ${userOrders.length > 0 ? `
                <div class="space-y-4">
                    ${userOrders.slice(0, 5).map(order => `
                        <div class="border rounded-lg p-4">
                            <div class="flex justify-between items-center mb-2">
                                <span class="font-medium">${order.orderId}</span>
                                <span class="badge bg-${getOrderStatusColor(order.status)} text-white px-2 py-1 rounded-full text-sm">
                                    ${order.status.toUpperCase()}
                                </span>
                            </div>
                            <div class="text-sm text-gray-600">
                                <p>Date: ${new Date(order.orderDate).toLocaleDateString()}</p>
                                <p>Items: ${order.items.length}</p>
                                <p>Total: ${order.payment.total.toFixed(2)} DZD</p>
                            </div>
                            <button onclick="viewOrderDetails('${order.orderId}')" 
                                class="mt-2 text-green-600 hover:text-green-700 text-sm font-medium">
                                View Details
                            </button>
                        </div>
                    `).join('')}
                </div>
                <button onclick="viewAllOrders()" class="mt-4 text-green-600 hover:text-green-700 font-medium">
                    View All Orders
                </button>
            ` : `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-shopping-bag text-4xl mb-2"></i>
                    <p>No orders yet</p>
                    <button onclick="navigate('home')" class="mt-2 text-green-600 hover:text-green-700 font-medium">
                        Start Shopping
                    </button>
                </div>
            `}
        </div>
    `;
}

function getOrderStatusColor(status) {
    switch (status.toLowerCase()) {
        case 'pending':
            return 'yellow-500';
        case 'processing':
            return 'blue-500';
        case 'shipped':
            return 'purple-500';
        case 'delivered':
            return 'green-500';
        case 'cancelled':
            return 'red-500';
        default:
            return 'gray-500';
    }
}

function renderDelivery() {
    const total = calculateSubtotal();
    const deliveryFee = deliveryOption === 'express' ? 50 : 0;
    const finalTotal = total + deliveryFee;

    const deliveryPage = document.getElementById('delivery-page');
    if (!deliveryPage) return;

    deliveryPage.innerHTML = `
        <div class="min-h-screen pb-20">
            <!-- Header -->
            <div class="bg-white sticky top-0 z-10">
                <div class="flex items-center p-4">
                    <button onclick="navigate('cart')" class="mr-4">
                        <i class="fas fa-arrow-left text-xl"></i>
                    </button>
                    <h1 class="text-xl font-bold">Delivery Details</h1>
                </div>
                <!-- Progress Steps -->
                <div class="flex justify-between px-8 py-4 border-t">
                    <div class="flex flex-col items-center">
                        <div class="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center mb-1">
                            <i class="fas fa-shopping-cart"></i>
                        </div>
                        <span class="text-xs text-green-500">Cart</span>
                    </div>
                    <div class="flex-1 flex items-center justify-center">
                        <div class="h-1 w-full bg-green-500"></div>
                    </div>
                    <div class="flex flex-col items-center">
                        <div class="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center mb-1">
                            <i class="fas fa-map-marker-alt"></i>
                        </div>
                        <span class="text-xs text-green-500">Delivery</span>
                    </div>
                    <div class="flex-1 flex items-center justify-center">
                        <div class="h-1 w-full bg-gray-300"></div>
                    </div>
                    <div class="flex flex-col items-center">
                        <div class="w-8 h-8 rounded-full bg-gray-300 text-white flex items-center justify-center mb-1">
                            <i class="fas fa-check"></i>
                        </div>
                        <span class="text-xs text-gray-500">Complete</span>
                    </div>
                </div>
            </div>

            <!-- Delivery Form -->
            <form id="deliveryForm" class="p-4 space-y-6">
                <!-- Contact Information -->
                <div class="bg-white p-4 rounded-lg shadow-sm">
                    <h2 class="text-lg font-semibold mb-4">Contact Information</h2>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-gray-700 text-sm font-medium mb-2">Full Name</label>
                            <input type="text" id="fullName" required
                                   class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-green-500"
                                   placeholder="Enter your full name">
                        </div>
                        <div>
                            <label class="block text-gray-700 text-sm font-medium mb-2">Phone Number</label>
                            <input type="tel" id="phone" required
                                   class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-green-500"
                                   placeholder="Enter your phone number">
                        </div>
                        <div>
                            <label class="block text-gray-700 text-sm font-medium mb-2">Email</label>
                            <input type="email" id="email" required
                                   class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-green-500"
                                   placeholder="Enter your email">
                        </div>
                    </div>
                </div>

                <!-- Delivery Address -->
                <div class="bg-white p-4 rounded-lg shadow-sm">
                    <h2 class="text-lg font-semibold mb-4">Delivery Address</h2>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-gray-700 text-sm font-medium mb-2">Street Address</label>
                            <input type="text" id="address" required
                                   class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-green-500"
                                   placeholder="Enter street address">
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-gray-700 text-sm font-medium mb-2">City</label>
                                <input type="text" id="city" required
                                       class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-green-500"
                                       placeholder="Enter city">
                            </div>
                            <div>
                                <label class="block text-gray-700 text-sm font-medium mb-2">Postal Code</label>
                                <input type="text" id="postalCode" required
                                       class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-green-500"
                                       placeholder="Enter postal code">
                            </div>
                        </div>
                        <div>
                            <label class="block text-gray-700 text-sm font-medium mb-2">State</label>
                            <input type="text" id="state" required
                                   class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-green-500"
                                   placeholder="Enter state">
                        </div>
                    </div>
                </div>

                <!-- Delivery Options -->
                <div class="bg-white p-4 rounded-lg shadow-sm">
                    <h2 class="text-lg font-semibold mb-4">Delivery Options</h2>
                    <div class="space-y-3">
                        <label class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                            <input type="radio" name="deliveryOption" value="standard" 
                                   ${deliveryOption === 'standard' ? 'checked' : ''}
                                   onchange="updateDeliveryOption('standard')"
                                   class="w-4 h-4 text-green-500">
                            <div class="ml-3 flex-1">
                                <div class="font-medium">Standard Delivery</div>
                                <div class="text-sm text-gray-500">3-5 business days</div>
                            </div>
                            <div class="font-medium text-green-500">Free</div>
                        </label>
                        <label class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                            <input type="radio" name="deliveryOption" value="express"
                                   ${deliveryOption === 'express' ? 'checked' : ''}
                                   onchange="updateDeliveryOption('express')"
                                   class="w-4 h-4 text-green-500">
                            <div class="ml-3 flex-1">
                                <div class="font-medium">Express Delivery</div>
                                <div class="text-sm text-gray-500">1-2 business days</div>
                            </div>
                            <div class="font-medium text-green-500">50 DZD</div>
                        </label>
                    </div>
                </div>

                <!-- Order Summary -->
                <div class="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
                    <div class="flex justify-between items-center mb-4">
                        <div class="text-gray-600">Total Amount</div>
                        <div class="text-xl font-bold">${finalTotal} DZD</div>
                    </div>
                    <button type="button"
                            onclick="handlePlaceOrder()"
                            class="w-full bg-green-500 text-white py-3 rounded-lg font-semibold flex items-center justify-center">
                        <i class="fas fa-lock mr-2"></i>
                        Place Order
                    </button>
                </div>
            </form>
        </div>
    `;
}

function handlePlaceOrder() {
    const form = document.getElementById('deliveryForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // Collect form data
    const formData = {
        orderId: `ORD-${Date.now()}`,
        userId: authState.currentUser?.id,
        userName: authState.currentUser?.name,
        orderDate: new Date().toISOString(),
        status: 'pending',
        items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            subtotal: item.price * item.quantity
        })),
        shipping: {
            fullName: document.getElementById('fullName').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            state: document.getElementById('state').value,
            postalCode: document.getElementById('postalCode').value,
            deliveryOption: deliveryOption
        },
        payment: {
            subtotal: calculateSubtotal(),
            shipping: deliveryOption === 'express' ? 50 : 0,
            total: calculateSubtotal() + (deliveryOption === 'express' ? 50 : 0)
        }
    };

    // Save order to localStorage
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.unshift(formData);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Add notification for admin
    const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    notifications.unshift({
        message: `New order received: ${formData.orderId}`,
        icon: 'fa-shopping-cart',
        timestamp: new Date().toISOString(),
        type: 'order'
    });
    localStorage.setItem('notifications', JSON.stringify(notifications));

    // Clear cart
    resetCart();

    // Show success modal
    const successModal = document.getElementById('successModal');
    if (successModal) {
        successModal.classList.add('show');
    }

    // Auto-close modal and navigate after 3 seconds
    setTimeout(() => {
        if (successModal) {
            successModal.classList.remove('show');
        }
        navigate('home');
        renderHome();
    }, 3000);
}

function updateDeliveryOption(option) {
    deliveryOption = option;
    renderDelivery();
}

function checkout() {
    if (cart.length === 0) {
        showToast('Your cart is empty');
        return;
    }
    navigate('delivery');
}

function renderSearch() {
    const searchPage = document.getElementById('search-page');
    if (!searchPage) return;

    searchPage.innerHTML = `
        <div class="min-h-screen bg-gray-50">
            <!-- Header -->
            <div class="bg-white sticky top-0 z-10 shadow-sm">
                <div class="flex items-center p-4">
                    <button onclick="navigate('home')" class="mr-4">
                        <i class="fas fa-arrow-left text-gray-600"></i>
                    </button>
                    <div class="flex-1 relative">
                        <input type="text" 
                               placeholder="Search products..." 
                               class="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-green-500"
                               oninput="handleSearch(this.value)"
                               value="${searchTerm || ''}">
                        <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    </div>
                </div>
            </div>

            <!-- Search Results -->
            <div id="search-results" class="p-4">
                ${renderSearchResults()}
            </div>
        </div>
        ${renderBottomNav()}
    `;
}

function handleSearch(value) {
    searchTerm = value;
    const resultsContainer = document.getElementById('search-results');
    if (resultsContainer) {
        resultsContainer.innerHTML = renderSearchResults();
    }
}

function renderSearchResults() {
    if (!searchTerm) return '';
    
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filteredProducts.length > 0 ? `
        <div class="grid grid-cols-2 gap-4">
            ${filteredProducts.map(product => `
                <div class="bg-white rounded-lg shadow overflow-hidden" onclick="navigate('product', ${JSON.stringify(product)})">
                    <img src="${product.image}" alt="${product.name}" class="w-full h-40 object-cover">
                    <div class="p-3">
                        <h3 class="font-semibold text-gray-800 truncate">${product.name}</h3>
                        <p class="text-green-600 font-bold mt-1">${product.price} DZD</p>
                    </div>
                </div>
            `).join('')}
        </div>
    ` : `
        <div class="flex flex-col items-center justify-center p-8">
            <i class="fas fa-search text-gray-300 text-5xl mb-4"></i>
            <p class="text-gray-500">No products found</p>
        </div>
    `;
}

function renderCart() {
    const total = cart.reduce((sum, item) => {
        const product = products.find(p => p.id === item.id);
        return sum + (product ? product.price * item.quantity : 0);
    }, 0);

    const cartPage = document.getElementById('cart-page');
    if (!cartPage) return;

    cartPage.innerHTML = `
        <div class="min-h-screen bg-gray-50">
            <!-- Header -->
            <div class="bg-white sticky top-0 z-10 shadow-sm">
                <div class="flex items-center p-4">
                    <button onclick="navigate('home')" class="mr-4 text-gray-600 hover:text-gray-800">
                        <i class="fas fa-arrow-left text-xl"></i>
                    </button>
                    <h1 class="text-xl font-bold">Cart</h1>
                    ${cart.length > 0 ? `
                        <span class="ml-2 px-2 py-1 bg-green-100 text-green-600 text-sm font-medium rounded-full">
                            ${cart.length} items
                        </span>
                    ` : ''}
                </div>
            </div>

            ${cart.length === 0 ? `
                <div class="flex flex-col items-center justify-center p-8">
                    <div class="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <i class="fas fa-shopping-cart text-4xl text-gray-400"></i>
                    </div>
                    <p class="text-gray-600 text-lg mb-4">Your cart is empty</p>
                    <button onclick="navigate('home')" 
                            class="px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors">
                        Start Shopping
                    </button>
                </div>
            ` : `
                <div class="p-4 space-y-3">
                    ${cart.map(item => {
                        const product = products.find(p => p.id === item.id);
                        if (!product) return '';
                        return `
                            <div class="bg-white rounded-xl shadow-sm p-3">
                                <div class="flex items-start space-x-3">
                                    <div class="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                                        <img src="${product.image}" 
                                             alt="${product.name}" 
                                             class="w-full h-full object-contain p-2">
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <h3 class="font-medium text-sm mb-1 line-clamp-1">${product.name}</h3>
                                        <div class="text-xs text-gray-500 mb-2">
                                            ${item.color ? `Color: ${item.color}` : ''}
                                            ${item.size ? ` • Size: ${item.size}` : ''}
                                        </div>
                                        <div class="flex items-center justify-between">
                                            <div class="text-green-600 font-bold">${product.price} DZD</div>
                                            <div class="flex items-center space-x-3">
                                                <button onclick="updateQuantity(${product.id}, ${item.quantity - 1})"
                                                        class="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                                                    <i class="fas ${item.quantity === 1 ? 'fa-trash text-red-500' : 'fa-minus text-gray-600'} text-sm"></i>
                                                </button>
                                                <span class="font-medium text-sm w-4 text-center">${item.quantity}</span>
                                                <button onclick="updateQuantity(${product.id}, ${item.quantity + 1})"
                                                        class="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                                                    <i class="fas fa-plus text-gray-600 text-sm"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>

                <!-- Order Summary -->
                <div class="fixed bottom-0 left-0 right-0 bg-white shadow-lg">
                    <div class="p-4 space-y-4">
                        <div class="flex items-center justify-between text-sm">
                            <span class="text-gray-600">Subtotal</span>
                            <span class="font-medium">${total} DZD</span>
                        </div>
                        <div class="flex items-center justify-between text-sm">
                            <span class="text-gray-600">Delivery Fee</span>
                            <span class="font-medium text-green-600">Free</span>
                        </div>
                        <div class="border-t pt-4 flex items-center justify-between">
                            <div>
                                <div class="text-gray-600 text-sm">Total</div>
                                <div class="text-xl font-bold">${total} DZD</div>
                            </div>
                            <button onclick="checkout()" 
                                    class="px-8 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors flex items-center">
                                <i class="fas fa-lock mr-2"></i>
                                Checkout
                            </button>
                        </div>
                    </div>
                </div>
            `}
        </div>
    `;
}

// Initialize categories if not exists
function initializeCategories() {
    if (!localStorage.getItem('categories')) {
        const defaultCategories = [
            { id: 1, name: 'All', description: 'All products', icon: 'fas fa-border-all' },
            { id: 2, name: 'Electronics', description: 'Electronic devices and accessories', icon: 'fas fa-laptop' },
            { id: 3, name: 'Fashion', description: 'Clothing and accessories', icon: 'fas fa-tshirt' },
            { id: 4, name: 'Home', description: 'Home and furniture', icon: 'fas fa-home' },
            { id: 5, name: 'Sports', description: 'Sports and fitness', icon: 'fas fa-running' }
        ];
        localStorage.setItem('categories', JSON.stringify(defaultCategories));
    }
}

// Initialize products if not exists
function initializeProducts() {
    if (!localStorage.getItem('products')) {
        const defaultProducts = [
            {
                id: 1,
                name: "Smartphone X",
                price: 49999,
                image: "https://via.placeholder.com/200",
                category: "Electronics",
                rating: 4.5,
                sold: 120,
                description: "Latest smartphone with amazing features",
                specs: ["6.5 inch display", "128GB storage", "48MP camera"],
                colors: ["Black", "Blue", "Silver"],
                sizes: [],
                discount: 10,
                oldPrice: 54999
            },
            // Add more default products as needed
        ];
        localStorage.setItem('products', JSON.stringify(defaultProducts));
    }
}

// Initialize notifications if not exists
function initializeNotifications() {
    if (!localStorage.getItem('notifications')) {
        const defaultNotifications = [
            {
                id: 1,
                message: "Welcome to our store!",
                icon: "fa-bell",
                timestamp: new Date().toISOString(),
                isRead: false
            }
        ];
        localStorage.setItem('notifications', JSON.stringify(defaultNotifications));
    }
}

// Add address management functions
function addNewAddress() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;

    // Create modal for adding new address
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg w-full max-w-md p-6">
            <h3 class="text-lg font-semibold mb-4">Add New Address</h3>
            <form id="addressForm" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Address Type</label>
                    <input type="text" id="addressType" placeholder="Home, Work, etc." 
                           class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                    <input type="text" id="street" required 
                           class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500">
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input type="text" id="city" required 
                               class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">State</label>
                        <input type="text" id="state" required 
                               class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500">
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                    <input type="text" id="postalCode" required 
                           class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500">
                </div>
                <div class="flex justify-end space-x-3 mt-6">
                    <button type="button" onclick="this.closest('.fixed').remove()" 
                            class="px-4 py-2 text-gray-600 hover:text-gray-700">
                        Cancel
                    </button>
                    <button type="submit" 
                            class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                        Save Address
                    </button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    // Handle form submission
    document.getElementById('addressForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const newAddress = {
            type: document.getElementById('addressType').value || 'Home',
            street: document.getElementById('street').value,
            city: document.getElementById('city').value,
            state: document.getElementById('state').value,
            postalCode: document.getElementById('postalCode').value
        };

        // Add address to user's addresses
        currentUser.addresses = currentUser.addresses || [];
        currentUser.addresses.push(newAddress);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        // Close modal and refresh profile
        modal.remove();
        renderProfile();
        showToast('Address added successfully');
    });
}

function deleteAddress(index) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || !currentUser.addresses) return;

    currentUser.addresses.splice(index, 1);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    renderProfile();
    showToast('Address deleted successfully');
}

function editAddress(index) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || !currentUser.addresses || !currentUser.addresses[index]) return;

    const address = currentUser.addresses[index];
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg w-full max-w-md p-6">
            <h3 class="text-lg font-semibold mb-4">Edit Address</h3>
            <form id="editAddressForm" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Address Type</label>
                    <input type="text" id="editAddressType" value="${address.type || ''}" 
                           class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                    <input type="text" id="editStreet" value="${address.street || ''}" required 
                           class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500">
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input type="text" id="editCity" value="${address.city || ''}" required 
                               class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">State</label>
                        <input type="text" id="editState" value="${address.state || ''}" required 
                               class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500">
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                    <input type="text" id="editPostalCode" value="${address.postalCode || ''}" required 
                           class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500">
                </div>
                <div class="flex justify-end space-x-3 mt-6">
                    <button type="button" onclick="this.closest('.fixed').remove()" 
                            class="px-4 py-2 text-gray-600 hover:text-gray-700">
                        Cancel
                    </button>
                    <button type="submit" 
                            class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    // Handle form submission
    document.getElementById('editAddressForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const updatedAddress = {
            type: document.getElementById('editAddressType').value || 'Home',
            street: document.getElementById('editStreet').value,
            city: document.getElementById('editCity').value,
            state: document.getElementById('editState').value,
            postalCode: document.getElementById('editPostalCode').value
        };

        currentUser.addresses[index] = updatedAddress;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        modal.remove();
        renderProfile();
        showToast('Address updated successfully');
    });
}

// Add to cart function
function addToCart(productId) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        showToast('Product not found');
        return;
    }

    // Initialize cart if not exists
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Check if product is already in cart
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        // Update quantity if already in cart
        existingItem.quantity += 1;
    } else {
        // Add new item to cart
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }

    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Show success message
    showToast('Added to cart');
    
    // Update cart count in UI
    const cartCount = document.querySelector('.bottom-nav .fa-shopping-cart + span');
    if (cartCount) {
        cartCount.textContent = cart.length;
    }

    // Update the global cart variable
    window.cart = cart;
}

// Update quantity function
function updateQuantity(productId, newQuantity) {
    if (newQuantity < 1) {
        // Remove item from cart if quantity is 0
        cart = cart.filter(item => item.id !== productId);
    } else {
        // Update quantity
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity = newQuantity;
        }
    }

    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart display
    renderCart();
}

// Reset cart function
function resetCart() {
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
}

// Calculate subtotal function
function calculateSubtotal() {
    return cart.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);
}

function closeSuccessModal() {
    const successModal = document.getElementById('successModal');
    if (successModal) {
        successModal.classList.remove('show');
    }
    // Navigate to home page
    currentPage = 'home';
    const homePage = document.getElementById('home-page');
    if (homePage) {
        homePage.style.display = 'block';
        renderHome();
    }
}