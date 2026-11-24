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


## 3. Database Entity Relationship (ER) Summary

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

