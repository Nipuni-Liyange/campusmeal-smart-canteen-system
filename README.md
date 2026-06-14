# CampusMeal - Smart University Canteen Dinner Pre-Order System

CampusMeal is a MERN stack web application developed for the DesignHer 2.0 competition. The system helps university students view the daily dinner menu and pre-order dinner online instead of using SMS or phone calls. It also helps canteen staff manage menu items, track student orders, update order status, and analyze daily food demand.

## Problem Statement

In many university canteens, students order dinner using SMS messages or phone calls. This manual process can cause missed orders, unclear menu information, difficulty in counting total orders, and food wastage. Students may not know the available dinner menu early, and canteen staff must manually manage order details.

## Solution Overview

CampusMeal provides a web-based system where students can view the daily dinner menu, place dinner orders, check order status, and receive an order token. Canteen administrators can add menu items, view all orders, update order status, and check daily demand analytics.

## Key Features

### Student Features

* Student registration and login
* View today’s dinner menu
* Place dinner orders
* View order token
* Track order status
* Cancel pending orders

### Admin Features

* Admin login
* Add daily menu items
* View menu items
* Delete menu items
* View all student orders
* Update order status
* View daily demand analytics

### Analytics Features

* Total orders today
* Total revenue today
* Pending orders count
* Collected orders count
* Most ordered food item
* Food demand summary

## Technologies Used

### Frontend

* React
* Vite
* React Router DOM
* Axios
* CSS

### Backend

* Node.js
* Express.js
* MongoDB Atlas
* Mongoose
* JWT Authentication
* bcryptjs
* dotenv
* CORS

## System Architecture

Student/Admin
→ React Frontend
→ Node.js + Express Backend API
→ MongoDB Atlas Database

## Database Collections

### Users Collection

Stores student and admin account details.

### Menu Items Collection

Stores daily dinner menu items added by the canteen admin.

### Orders Collection

Stores student orders, order tokens, quantity, total amount, and order status.

## Order Status Flow

Pending → Accepted → Preparing → Ready → Collected

Additional statuses:

* Cancelled: cancelled by student
* Rejected: rejected by admin/canteen staff

## How to Run the Project Locally

### 1. Clone the repository

```bash
git clone https://github.com/Nipuni-Liyange/campusmeal-smart-canteen-system.git
```

### 2. Install frontend dependencies

```bash
cd client
npm install
npm run dev
```

### 3. Install backend dependencies

```bash
cd server
npm install
npm run dev
```

### 4. Create environment file

Create a `.env` file inside the `server` folder and add:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string_here
JWT_SECRET=your_jwt_secret_here
```

## Test Accounts

### Student Account

Email: [teststudent@gmail.com](mailto:teststudent@gmail.com)
Password: 123456

### Admin Account

Email: [admin@campusmeal.com](mailto:admin@campusmeal.com)
Password: admin123

## Deployment URL

To be added after deployment.

## GitHub Repository

To be added after final repository update.

## Future Improvements

* QR code for order pickup
* Payment integration
* Order deadline management
* Email or SMS notifications
* Better analytics charts
* Mobile app version

## Project Impact

CampusMeal improves the university canteen dinner ordering process by reducing manual work, helping students view menu details clearly, allowing canteen staff to manage orders efficiently, and supporting food waste reduction through demand analytics.
