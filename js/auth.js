// Auth state management
const authState = {
    isAuthenticated: false,
    currentUser: null
};

function saveAuthState() {
    localStorage.setItem('authState', JSON.stringify(authState));
}

function loadAuthState() {
    const savedState = localStorage.getItem('authState');
    if (savedState) {
        const parsedState = JSON.parse(savedState);
        // Only restore if the state is valid
        if (parsedState && parsedState.isAuthenticated && parsedState.currentUser) {
            Object.assign(authState, parsedState);
        }
    }
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 p-4 rounded-lg text-white ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } transition-all duration-300 transform translate-y-[-100%] opacity-0`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
    }, 100);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.transform = 'translateY(-100%)';
        toast.style.opacity = '0';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

function handleLogin() {
    const email = document.getElementById('login-email')?.value;
    const password = document.getElementById('login-password')?.value;

    if (!email || !password) {
        showToast('Please fill in all fields');
        return;
    }

    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Find user and check password (using base64 encoding for demo)
    const user = users.find(u => u.email === email && (u.password === password || u.password === btoa(password)));

    if (!user) {
        showToast('Invalid email or password');
        return;
    }

    if (user.status === 'suspended') {
        showToast('Your account has been suspended. Please contact support.');
        return;
    }

    // Update last login
    user.lastLogin = new Date().toISOString();
    localStorage.setItem('users', JSON.stringify(users));

    // Set auth state
    authState.isAuthenticated = true;
    authState.currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));

    // Add notification for admin
    const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    notifications.unshift({
        message: `User logged in: ${user.name}`,
        icon: 'fa-sign-in-alt',
        timestamp: new Date().toISOString(),
        type: 'user'
    });
    localStorage.setItem('notifications', JSON.stringify(notifications));

    // Show success message
    showToast('Login successful!');

    // Navigate to home page after a short delay
    setTimeout(() => {
        navigate('home');
    }, 1000);
}

function handleSignup() {
    const name = document.getElementById('signup-name')?.value;
    const email = document.getElementById('signup-email')?.value;
    const password = document.getElementById('signup-password')?.value;
    const confirmPassword = document.getElementById('signup-confirm-password')?.value;

    if (!name || !email || !password || !confirmPassword) {
        showToast('Please fill in all fields');
        return;
    }

    if (password !== confirmPassword) {
        showToast('Passwords do not match');
        return;
    }

    // Get existing users
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Check if user already exists
    if (users.some(user => user.email === email)) {
        showToast('Email already registered');
        return;
    }

    // Create new user
    const newUser = {
        id: Date.now(),
        name,
        email,
        password: btoa(password), // Basic encoding for demo
        addresses: [],
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
    };

    // Add user to users array
    users.push(newUser);
    
    // Save to localStorage
    localStorage.setItem('users', JSON.stringify(users));
    
    // Set current user and auth state
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    authState.isAuthenticated = true;
    authState.currentUser = newUser;

    // Show success message
    showToast('Account created successfully!');

    // Navigate to home page after a short delay
    setTimeout(() => {
        navigate('home');
    }, 1000);
}

function logout() {
    // Clear auth state
    authState.isAuthenticated = false;
    authState.currentUser = null;
    
    // Clear user data from localStorage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('cart');
    window.cart = [];
    
    // Show success message
    showToast('Logged out successfully');
    
    // Navigate to login page
    setTimeout(() => {
        navigate('login');
    }, 500);
}

// Address Management
function addNewAddress() {
    if (!authState.isAuthenticated) {
        showToast('Please login to add an address');
        navigate('login');
        return;
    }
    
    // Show address form modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 class="text-lg font-semibold mb-4">Add New Address</h3>
            <form id="address-form" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700">Address Type</label>
                    <input type="text" id="address-type" required placeholder="Home, Work, etc."
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Street Address</label>
                    <input type="text" id="address-street" required
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500">
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">City</label>
                        <input type="text" id="address-city" required
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">State</label>
                        <input type="text" id="address-state" required
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500">
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Postal Code</label>
                    <input type="text" id="address-postal" required
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500">
                </div>
                <div class="flex justify-end space-x-4 mt-6">
                    <button type="button" onclick="this.closest('.fixed').remove()"
                        class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500">
                        Cancel
                    </button>
                    <button type="submit"
                        class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">
                        Save Address
                    </button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Handle form submission
    document.getElementById('address-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newAddress = {
            type: document.getElementById('address-type').value,
            street: document.getElementById('address-street').value,
            city: document.getElementById('address-city').value,
            state: document.getElementById('address-state').value,
            postalCode: document.getElementById('address-postal').value
        };
        
        // Update user's addresses
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.id === authState.currentUser.id);
        
        if (userIndex !== -1) {
            users[userIndex].addresses = users[userIndex].addresses || [];
            users[userIndex].addresses.push(newAddress);
            localStorage.setItem('users', JSON.stringify(users));
            
            // Update auth state
            authState.currentUser.addresses = users[userIndex].addresses;
            saveAuthState();
            
            showToast('Address added successfully');
            modal.remove();
            renderProfile();
        }
    });
}

function editAddress(index) {
    const address = authState.currentUser.addresses[index];
    if (!address) return;
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 class="text-lg font-semibold mb-4">Edit Address</h3>
            <form id="edit-address-form" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700">Address Type</label>
                    <input type="text" id="edit-address-type" required value="${address.type}"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Street Address</label>
                    <input type="text" id="edit-address-street" required value="${address.street}"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500">
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">City</label>
                        <input type="text" id="edit-address-city" required value="${address.city}"
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700">State</label>
                        <input type="text" id="edit-address-state" required value="${address.state}"
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500">
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Postal Code</label>
                    <input type="text" id="edit-address-postal" required value="${address.postalCode}"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500">
                </div>
                <div class="flex justify-end space-x-4 mt-6">
                    <button type="button" onclick="this.closest('.fixed').remove()"
                        class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500">
                        Cancel
                    </button>
                    <button type="submit"
                        class="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Handle form submission
    document.getElementById('edit-address-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const updatedAddress = {
            type: document.getElementById('edit-address-type').value,
            street: document.getElementById('edit-address-street').value,
            city: document.getElementById('edit-address-city').value,
            state: document.getElementById('edit-address-state').value,
            postalCode: document.getElementById('edit-address-postal').value
        };
        
        // Update user's addresses
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.id === authState.currentUser.id);
        
        if (userIndex !== -1) {
            users[userIndex].addresses[index] = updatedAddress;
            localStorage.setItem('users', JSON.stringify(users));
            
            // Update auth state
            authState.currentUser.addresses = users[userIndex].addresses;
            saveAuthState();
            
            showToast('Address updated successfully');
            modal.remove();
            renderProfile();
        }
    });
}

function deleteAddress(index) {
    if (!confirm('Are you sure you want to delete this address?')) return;
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.id === authState.currentUser.id);
    
    if (userIndex !== -1) {
        users[userIndex].addresses.splice(index, 1);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Update auth state
        authState.currentUser.addresses = users[userIndex].addresses;
        saveAuthState();
        
        showToast('Address deleted successfully');
        renderProfile();
    }
}

// Initialize auth state on page load
document.addEventListener('DOMContentLoaded', loadAuthState);

// Render auth screens
function renderLogin() {
    const loginPage = document.getElementById('login-page');
    if (!loginPage) return;

    loginPage.innerHTML = `
        <div class="min-h-screen bg-gray-50 flex flex-col">
            <!-- Header -->
            <div class="bg-white shadow-sm">
                <div class="p-4">
                    <h1 class="text-2xl font-bold text-center">Welcome Back</h1>
                    <p class="text-gray-600 text-center mt-1">Sign in to continue shopping</p>
                </div>
            </div>

            <!-- Login Form -->
            <div class="flex-1 flex flex-col justify-center p-4">
                <div class="bg-white rounded-2xl shadow-sm p-6 space-y-6">
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <div class="relative">
                                <input type="email" id="login-email" required
                                    class="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                                    placeholder="Enter your email">
                                <i class="fas fa-envelope absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div class="relative">
                                <input type="password" id="login-password" required
                                    class="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                                    placeholder="Enter your password">
                                <i class="fas fa-lock absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                            </div>
                        </div>
                    </div>

                    <button onclick="handleLogin()"
                            class="w-full bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors flex items-center justify-center">
                        <i class="fas fa-sign-in-alt mr-2"></i>
                        Sign In
                    </button>

                    <div class="text-center">
                        <p class="text-gray-600">
                            Don't have an account? 
                            <button onclick="navigate('signup')" class="text-green-600 font-medium hover:text-green-700">
                                Sign Up
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderSignup() {
    const signupPage = document.getElementById('signup-page');
    if (!signupPage) return;

    signupPage.innerHTML = `
        <div class="min-h-screen bg-gray-50 flex flex-col">
            <!-- Header -->
            <div class="bg-white shadow-sm">
                <div class="p-4">
                    <h1 class="text-2xl font-bold text-center">Create Account</h1>
                    <p class="text-gray-600 text-center mt-1">Sign up to start shopping</p>
                </div>
            </div>

            <!-- Signup Form -->
            <div class="flex-1 flex flex-col justify-center p-4">
                <div class="bg-white rounded-2xl shadow-sm p-6 space-y-6">
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <div class="relative">
                                <input type="text" id="signup-name" required
                                    class="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                                    placeholder="Enter your full name">
                                <i class="fas fa-user absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <div class="relative">
                                <input type="email" id="signup-email" required
                                    class="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                                    placeholder="Enter your email">
                                <i class="fas fa-envelope absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div class="relative">
                                <input type="password" id="signup-password" required
                                    class="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                                    placeholder="Create a password">
                                <i class="fas fa-lock absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                            <div class="relative">
                                <input type="password" id="signup-confirm-password" required
                                    class="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                                    placeholder="Confirm your password">
                                <i class="fas fa-lock absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                            </div>
                        </div>
                    </div>

                    <button onclick="handleSignup()"
                            class="w-full bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors flex items-center justify-center">
                        <i class="fas fa-user-plus mr-2"></i>
                        Create Account
                    </button>

                    <div class="text-center">
                        <p class="text-gray-600">
                            Already have an account? 
                            <button onclick="navigate('login')" class="text-green-600 font-medium hover:text-green-700">
                                Sign In
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Toggle password visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.parentElement.querySelector('.password-toggle i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Auth handlers
async function handleSignup(event) {
    event.preventDefault();
    
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    
    // Validate password match
    if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }
    
    // Get existing users
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Check if email already exists
    if (users.some(u => u.email === email)) {
        showToast('Email already registered', 'error');
        return;
    }
    
    // Create new user
    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password: btoa(password), // Basic encoding for demo
        addresses: [],
        createdAt: new Date().toISOString()
    };
    
    // Add user to storage
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Update auth state
    authState.isAuthenticated = true;
    authState.currentUser = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        avatar: 'https://via.placeholder.com/50',
        addresses: []
    };
    saveAuthState();
    
    // Add signup notification for admin
    const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    notifications.unshift({
        message: `New user registered: ${name}`,
        icon: 'fa-user-plus',
        timestamp: new Date().toISOString(),
        type: 'auth'
    });
    localStorage.setItem('notifications', JSON.stringify(notifications));
    
    showToast('Signup successful!');
    navigate('home');
}

function updateProfile(event) {
    event.preventDefault();
    
    const name = document.getElementById('profile-name').value;
    const email = document.getElementById('profile-email').value;
    const phone = document.getElementById('profile-phone').value;
    const address = document.getElementById('profile-address').value;
    
    // Update users list
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.id === authState.currentUser.id);
    
    if (userIndex === -1) {
        showToast('Error updating profile');
        return;
    }
    
    // Check if email is taken by another user
    if (email !== authState.currentUser.email && 
        users.some(u => u.email === email && u.id !== authState.currentUser.id)) {
        showToast('Email already taken');
        return;
    }
    
    // Update user data
    const updatedUser = {
        ...users[userIndex],
        name,
        email,
        phone,
        address,
        updatedAt: new Date().toISOString()
    };
    
    users[userIndex] = updatedUser;
    localStorage.setItem('users', JSON.stringify(users));
    
    // Update current user
    authState.currentUser = updatedUser;
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    // Add notification for admin
    const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    notifications.unshift({
        message: `User profile updated: ${name}`,
        icon: 'fa-user-edit',
        timestamp: new Date().toISOString(),
        type: 'user'
    });
    localStorage.setItem('notifications', JSON.stringify(notifications));
    
    showToast('Profile updated successfully!');
    renderProfile();
}

function addNewAddress() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg max-w-md w-full">
            <form id="address-form" class="p-6">
                <h3 class="text-lg font-semibold mb-4">Add New Address</h3>
                <div class="space-y-4">
                    <div class="form-group">
                        <label class="block text-sm font-medium text-gray-700">Address Type</label>
                        <select id="address-type" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                            <option value="home">Home</option>
                            <option value="work">Work</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="block text-sm font-medium text-gray-700">Street Address</label>
                        <textarea id="address-street" required rows="2" 
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"></textarea>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="form-group">
                            <label class="block text-sm font-medium text-gray-700">City</label>
                            <input type="text" id="address-city" required 
                                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                        </div>
                        <div class="form-group">
                            <label class="block text-sm font-medium text-gray-700">State</label>
                            <input type="text" id="address-state" required 
                                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="block text-sm font-medium text-gray-700">Postal Code</label>
                        <input type="text" id="address-postal" required 
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                    </div>
                </div>
                <div class="mt-6 flex justify-end space-x-3">
                    <button type="button" onclick="this.closest('.fixed').remove()" 
                        class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500">
                        Cancel
                    </button>
                    <button type="submit" 
                        class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                        Save Address
                    </button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('address-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newAddress = {
            type: document.getElementById('address-type').value,
            street: document.getElementById('address-street').value,
            city: document.getElementById('address-city').value,
            state: document.getElementById('address-state').value,
            postalCode: document.getElementById('address-postal').value
        };
        
        // Update user's addresses
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.id === authState.currentUser.id);
        
        if (!users[userIndex].addresses) {
            users[userIndex].addresses = [];
        }
        
        users[userIndex].addresses.push(newAddress);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Update current user
        authState.currentUser = users[userIndex];
        localStorage.setItem('currentUser', JSON.stringify(users[userIndex]));
        
        modal.remove();
        showToast('Address added successfully!');
        renderProfile();
    });
}

function logout() {
    authState.isAuthenticated = false;
    authState.currentUser = null;
    localStorage.removeItem('currentUser');
    showToast('Logged out successfully');
    navigate('home');
}

// Update the navigate function
function navigate(page, data = null) {
    // Update current page
    currentPage = page;
    
    // Check authentication for protected routes
    const protectedRoutes = ['profile', 'cart', 'wishlist', 'orders'];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (protectedRoutes.includes(page) && !currentUser) {
        page = 'login';
    }

    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    
    // Show selected page
    const pageElement = document.getElementById(`${page}-page`);
    if (pageElement) {
        pageElement.style.display = 'block';
        
        // Render the page content
        switch (page) {
            case 'login':
                renderLogin();
                break;
            case 'signup':
                renderSignup();
                break;
            case 'home':
                renderHome();
                break;
            case 'profile':
                renderProfile();
                break;
            case 'cart':
                renderCart();
                break;
            case 'wishlist':
                renderWishlist();
                break;
            case 'product':
                renderProductDetail(data);
                break;
        }
    }

    // Update active state in bottom nav
    document.querySelectorAll('.bottom-nav a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === page) {
            link.classList.add('active');
        }
    });

    // Scroll to top
    window.scrollTo(0, 0);
}
