# Mobile E-commerce App

A modern, mobile-first e-commerce application built with vanilla JavaScript and Tailwind CSS. This app provides a smooth shopping experience with features like user authentication, product browsing, cart management, and more.

## 🌟 Features

### Authentication
- User registration with email and password
- Secure login system
- Session persistence
- Profile management

### Product Management
- Grid view product listing
- Category filtering
- Product search
- Product details view with:
  - Images
  - Description
  - Price
  - Rating
  - Stock status

### Shopping Cart
- Add/remove products
- Quantity adjustment
- Price calculation
- Cart persistence
- Quick add from product grid

### User Interface
- Mobile-first design
- Responsive layout
- Bottom navigation
- Toast notifications
- Smooth transitions
- Touch-friendly interface

## 🚀 Getting Started

### Prerequisites
- Modern web browser
- Local development server (e.g., Live Server)

### Installation
1. Clone the repository:
```bash
git clone [repository-url]
```

2. Navigate to the project directory:
```bash
cd ecommerce-app
```

3. Open index.html in your browser or use a local server:
```bash
# Using VS Code Live Server
# Right-click index.html and select "Open with Live Server"
```

## 📱 App Structure

```
ecommerce-app/
├── js/
│   ├── app.js        # Main application logic
│   └── auth.js       # Authentication handling
├── index.html        # Main HTML structure
└── README.md        # Documentation
```

## 💻 Usage

### User Registration
1. Click "Sign Up" on the login page
2. Fill in your details:
   - Full Name
   - Email
   - Password
   - Confirm Password
3. Click "Create Account"

### Shopping
1. Browse products on the home page
2. Filter by categories
3. Click product for details
4. Add to cart using the "+" button
5. Manage cart items
6. Proceed to checkout

### Account Management
1. View profile from bottom navigation
2. Update profile information
3. View order history
4. Manage addresses

## 🛠️ Technical Details

### State Management
- User authentication state in localStorage
- Cart state persistence
- Product catalog management

### Security
- Password encoding (base64 for demo)
- Protected routes
- Session management

### UI Components
- Toast notifications
- Modal dialogs
- Loading states
- Error handling

## 🔜 Upcoming Features

- [ ] Product filtering and sorting
- [ ] Checkout process
- [ ] Order history
- [ ] Product reviews
- [ ] Payment integration
- [ ] Wishlist
- [ ] User ratings
- [ ] Product image galleries
- [ ] Advanced category management

## 📝 Notes


- Data is stored in localStorage for demo purposes
- Designed primarily for mobile devices
- Uses modern JavaScript features
- Implements responsive design principles

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
