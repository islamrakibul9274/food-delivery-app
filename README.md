
-----

# 🍔 FOOOD - Modern Full-Stack Food Delivery App

A high-performance, responsive **MERN stack** application designed for seamless food ordering. This project features a polished user interface, secure authentication, and a robust administrative dashboard for real-time menu and order management.

## 🚀 Live Links

  * **Frontend (Vercel):** [https://food-delivery-app-smoky-sigma.vercel.app](https://food-delivery-app-smoky-sigma.vercel.app)
  * **Backend API (Render):** [https://fast-food-backend-v1.onrender.com](https://fast-food-backend-v1.onrender.com)

-----

## ✨ Key Features

### 👤 User Features

  * **Responsive Landing Page:** Modern UI with smooth transitions and optimized for mobile/desktop.
  * **Dynamic Menu:** Filterable menu categories (Burgers, Pizza, Pasta, etc.) fetched directly from MongoDB.
  * **Secure Authentication:** User signup and login functionality powered by **JWT (JSON Web Tokens)** and **BcryptJS** for password hashing.
  * **Shopping Cart:** Persistent cart management using React Context API.
  * **Order History:** Users can track their previous orders in a dedicated profile section.

### 🛠 Admin Features

  * **Admin Dashboard:** Centralized hub for managing the entire platform.
  * **Inventory Management:** Full CRUD (Create, Read, Update, Delete) capabilities for food items.
  * **Order Tracking:** Real-time monitoring and status updates (Pending to Delivered) for customer orders.
  * **Protected Routes:** Higher-order components ensure only authorized admins can access management tools.

-----

## 💻 Tech Stack

**Frontend:**

  * React.js (Vite)
  * Tailwind CSS (Styling)
  * Lucide React (Icons)
  * Axios (API Requests)

**Backend:**

  * Node.js & Express.js
  * MongoDB Atlas (Database)
  * Mongoose (ODM)
  * JWT & BcryptJS (Security)

-----

## 🛠 Local Setup Instructions

### 1\. Prerequisites

  * Node.js (v18 or higher)
  * MongoDB Atlas account

### 2\. Clone the Repository

```bash
git clone https://github.com/islamrakibul9274/food-delivery-app.git
cd food-delivery-app
```

### 3\. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server` folder:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_random_secret_key
```

Start the server: `npm start`

### 4\. Frontend Setup

```bash
cd client
npm install
```

Start the development server: `npm run dev`

-----

## ⚙️ Environment Configuration (Production)

The application is configured to automatically switch between local development and production environments using Vite's environment modes:

```javascript
const baseURL = import.meta.env.MODE === 'production' 
    ? 'https://fast-food-backend-v1.onrender.com/api' 
    : 'http://localhost:5000/api';
```

-----

## 👤 Author

**Rakibul Islam Rumel**

  * GitHub: [@islamrakibul9274](https://www.google.com/search?q=https://github.com/islamrakibul9274)

-----
