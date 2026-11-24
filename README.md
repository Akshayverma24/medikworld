# MedFinder – Medicine Availability and Pharmacy Comparison Platform

A full-stack, industry-inspired, beginner-friendly web application built with **React.js, Node.js, Express.js, and MongoDB Atlas**.

MedFinder helps users find medicines available at nearby registered pharmacies, compare their listed counter prices against standard MRPs, and reserve medicines for in-store pickup without advance deposits.

---

## 1. Technology Stack

- **Frontend:**
  - React.js (Vite)
  - JavaScript & JSX
  - Tailwind CSS
  - React Router DOM (v6)
  - Axios (HTTP client with JWT interceptors)
  - Context API (Global authentication & session state)
  - Lucide React (Icons)
  - React Hot Toast (Notifications)
  - Zod (Client-side form validation)

- **Backend:**
  - Node.js
  - Express.js (REST API architecture)
  - JSON Web Tokens (`jsonwebtoken`) for stateless authentication
  - Password hashing via `bcryptjs`
  - Runtime request validation with `zod`
  - CORS for cross-origin security

- **Database:**
  - MongoDB Atlas (Cloud NoSQL database)
  - Mongoose (Object Data Modeling)

---

## 2. Key Features

### For Patients / Customers:
1. **Medicine Search & Discovery:** Search by brand name (e.g. *Dolo 650*, *Augmentin 625*) or chemical/generic salt (*Paracetamol*, *Amoxicillin*).
2. **Category & Form Filtering:** Filter by health category (Pain Relief, Antibiotics, Diabetes, BP, etc.), dosage form (Tablet, Syrup, Capsule), and prescription requirement (OTC vs Rx Required).
3. **Real-Time Pharmacy Price Comparison:**
   - Side-by-side comparison table listing all local pharmacies stocking the medicine.
   - Highlights the **Best Price** with discount percentage off MRP.
   - Shows live stock status (e.g. *In Stock - 35 units left* vs *Out of stock*).
   - Displays pharmacy rating, opening hours, contact phone, and exact address.
4. **Zero-Advance In-Store Reservation:**
   - Reserve medicines for counter pickup.
   - Deducts real-time stock units to prevent overselling.
   - Customer provides contact number and optional pickup notes.
5. **My Reservations Portal:** View booking status (*Pending*, *Confirmed*, *Ready for Pickup*, *Completed*, *Cancelled*) with pharmacy details and counter amount to pay.

### For Pharmacy Partners:
1. **Pharmacy Registration & Profile:** Register pharmacy with drug license number, operating hours, address, and phone number.
2. **Inventory Management:**
   - Add medicines from master catalog to their store.
   - Set competitive counter selling prices (lower than or equal to MRP).
   - Update stock quantities and toggle active visibility.
   - Low stock warnings for items with fewer than 10 units remaining.
3. **Reservation Order Management:**
   - Real-time list of customer pickup reservations.
   - Update order status: *Pending* → *Confirmed* → *Ready for Pickup* → *Completed*.
   - Add notes to customer (e.g. "Kept aside at counter #2").
   - Restores stock automatically if a reservation is cancelled.

### For College Viva / Project Presentation:
- **Dedicated Viva Guide (`/viva-guide`):** Built-in interactive page presenting project architecture, ER diagram breakdown, REST API endpoints, and 10 high-yield viva questions with prepared answers.
- **Demo Quick-Fill Buttons:** On the Login page, click **"Customer Demo"** or **"Pharmacy Owner"** to auto-fill credentials for seamless viva defense.

---

## 3. Project Folder Structure

```
medfinder/
├── client/                     # React Frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   └── common/         # Navbar, Footer, MedicineCard, ReservationModal, etc.
│   │   ├── context/            # AuthContext.jsx (Context API)
│   │   ├── pages/              # Home, Medicines, MedicineDetail, Pharmacies, etc.
│   │   ├── services/           # api.js (Axios instance & endpoint handlers)
│   │   ├── App.jsx             # Main routing and layout
│   │   ├── index.css           # Tailwind CSS directives
│   │   └── main.jsx            # Entry point
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── server/                     # Node.js + Express Backend
│   ├── src/
│   │   ├── config/             # db.js (MongoDB Atlas connection)
│   │   ├── controllers/        # auth, medicine, pharmacy, inventory, reservation
│   │   ├── middleware/         # authMiddleware.js, validateMiddleware.js
│   │   ├── models/             # User, Pharmacy, Medicine, Inventory, Reservation
│   │   ├── routes/             # REST API routes
│   │   ├── seed.js             # Comprehensive sample dataset for 18+ medicines & 4 pharmacies
│   │   └── server.js           # Server bootstrap
│   ├── .env.example
│   ├── .env                    # Environment variables (PORT, MONGO_URI, JWT_SECRET)
│   └── package.json
│
├── package.json                # Workspace helper scripts
└── README.md
```

---

## 4. Setup and Installation

### Prerequisites:
- **Node.js** (v18 or higher recommended)
- **MongoDB Atlas** account (or local MongoDB running)

### Step 1: Configure Backend Environment
1. Navigate to the `server/` directory:
   ```bash
   cd server
   ```
2. Open `server/.env` and update `MONGO_URI` with your MongoDB Atlas connection string:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/medfinder?retryWrites=true&w=majority
   JWT_SECRET=medfinder_super_secret_jwt_key_2026
   CLIENT_URL=http://localhost:5173
   ```
   *(If you are running MongoDB locally, default `mongodb://127.0.0.1:27017/medfinder` works out of the box).*

### Step 2: Seed the Database with Realistic Demo Data
Populate 18+ high-demand medicines, 4 registered partner pharmacies, and sample reservations:
```bash
cd server
npm run seed
```

### Step 3: Start the Backend Server
```bash
cd server
npm start
```
The backend API starts on **http://localhost:5000**.
Check health endpoint: `http://localhost:5000/api/health`.

### Step 4: Start the Frontend Client
Open a separate terminal window:
```bash
cd client
npm run dev
```
Open **http://localhost:5173** in your browser.

---

## 5. Pre-Seeded Demo Credentials

| Role | Email | Password | Access Details |
|------|-------|----------|----------------|
| **Customer / Patient** | `rahul@medfinder.com` | `password123` | Searches medicines, compares prices, books reservations |
| **Pharmacy Partner 1** | `apollo@medfinder.com` | `password123` | Apollo Pharmacy (Indiranagar) - Manages stock & orders |
| **Pharmacy Partner 2** | `medplus@medfinder.com` | `password123` | MedPlus Mart (Koramangala) - Manages stock & orders |
| **Pharmacy Partner 3** | `wellness@medfinder.com` | `password123` | Wellness Forever (HSR Layout) - Manages stock & orders |
| **System Admin** | `admin@medfinder.com` | `admin123` | Platform-wide administrative capabilities |

*(You can also use the **Examiner Quick Fill** buttons on the Login page).*

---

## 6. REST API Endpoints Overview

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create user or pharmacy partner account (Zod validated)
- `POST /api/auth/login` - Authenticate and receive JWT token
- `GET /api/auth/me` - Fetch authenticated user profile & pharmacy details

### Medicines (`/api/medicines`)
- `GET /api/medicines` - Search medicines with category, dosage form, and price sorting
- `GET /api/medicines/categories` - Category counts aggregation
- `GET /api/medicines/:id` - Full drug info + sorted pharmacy comparison list
- `POST /api/medicines` - Add medicine (Protected)

### Pharmacies (`/api/pharmacies`)
- `GET /api/pharmacies` - List all registered pharmacies with city/keyword filter
- `GET /api/pharmacies/:id` - Pharmacy profile and in-store stock catalog
- `PUT /api/pharmacies/:id` - Update pharmacy details (Protected: Owner)

### Inventory (`/api/inventory`)
- `GET /api/inventory/my` - Fetch logged-in pharmacy's stock items & low stock count
- `POST /api/inventory` - Add or update medicine in store inventory
- `PUT /api/inventory/:id` - Update price and stock count
- `DELETE /api/inventory/:id` - Remove medicine from store inventory

### Reservations (`/api/reservations`)
- `POST /api/reservations` - Book medicine for pickup (deducts stock)
- `GET /api/reservations/user` - View customer's reservations
- `GET /api/reservations/pharmacy` - View pharmacy's incoming customer reservations
- `PUT /api/reservations/:id/status` - Update reservation status (restores stock if cancelled)
- `GET /api/reservations/stats` - Platform dashboard summary numbers

---

## 7. Database Entity Relationship (ER) Summary

```
   [User] (1) <────── (1) [Pharmacy]
      │                      │
      │                      │ (1)
      │ (1)                  │
      │                      ▼
      │ (M)           [Inventory] (M) ◄───── (1) [Medicine]
      ▼                      ▲
 [Reservation] ──────────────┘
```

1. **User:** Holds credentials and role (`user`, `pharmacy`, `admin`).
2. **Pharmacy:** Linked to owner User via `owner` reference.
3. **Medicine:** Independent catalog of master medicines, generic formulas, and MRPs.
4. **Inventory (Associative Junction):** Maps `Pharmacy` and `Medicine` with counter selling price, real-time stock units, and active status.
5. **Reservation:** Records pickup booking made by `User` at a `Pharmacy` for a `Medicine`.

---

## 8. College Viva Defense Questions

For a full set of 10 high-yield oral exam questions with detailed answers, navigate to the **Viva Guide (`/viva-guide`)** tab directly in the running application!
