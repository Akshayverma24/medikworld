import React, { useState } from 'react';
import {
  GraduationCap,
  Code2,
  Database,
  Layers,
  KeyRound,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Server,
  Monitor,
  CheckCircle2,
} from 'lucide-react';

const VivaGuidePage = () => {
  const [openFaq, setOpenFaq] = useState(0);

  const vivaQuestions = [
    {
      q: '1. What problem does MedFinder solve, and who are its primary users?',
      a: 'MedFinder solves medicine unavailability and price opacity in local retail pharmacies. Often patients suffering acute illnesses visit 3 to 4 local pharmacies before finding a required drug. MedFinder bridges patients with neighborhood licensed pharmacies, allowing them to verify stock, compare counter selling rates vs MRP, and reserve the drug for in-store pickup.',
    },
    {
      q: '2. Why did you choose MongoDB Atlas over a relational database like MySQL or PostgreSQL?',
      a: 'MongoDB Atlas is a cloud-hosted NoSQL document database ideal for modern web applications. Its JSON-like BSON documents naturally map to JavaScript objects in Node.js. It easily accommodates flexible pharmaceutical data (e.g. varied dosage forms, optional side-effects, dynamic pharmacy locations) and scales horizontally through sharding.',
    },
    {
      q: '3. Explain the architecture and relationship between Medicine, Pharmacy, and Inventory models.',
      a: 'This follows a many-to-many relationship using an associative collection named `Inventory`. A single Medicine can be stocked by multiple Pharmacies, and a single Pharmacy stocks multiple Medicines. The `Inventory` model records the specific selling price, batch number, expiry date, and real-time stock units for that exact pharmacy-medicine pair.',
    },
    {
      q: '4. How is user authentication implemented and secured?',
      a: 'Authentication uses JSON Web Tokens (JWT) and bcryptjs. Upon login, the user password is verified against the salted bcrypt hash stored in MongoDB. The server signs a JWT containing the user ID with a secure secret key. The client attaches this token in the `Authorization: Bearer <token>` header, verified on protected routes by Express middleware.',
    },
    {
      q: '5. How does MedFinder calculate the lowest price and discount percentage across pharmacies?',
      a: 'In `medicineController.js`, when retrieving a medicine or the medicine catalog, Mongoose queries the `Inventory` collection filtering `isAvailable: true` and `stock > 0`. It computes `lowestPrice = Math.min(...availablePrices)` and calculates savings percentage using `Math.round(((mrp - lowestPrice) / mrp) * 100)`.',
    },
    {
      q: '6. What happens to stock when a reservation is placed or cancelled?',
      a: 'When a customer places a reservation via `POST /api/reservations`, the server verifies `inventory.stock >= quantity`, deducts the quantity from `inventory.stock`, and marks `isAvailable = false` if stock hits zero. If the reservation is cancelled, the inventory controller restores the deducted stock back to the pharmacy inventory.',
    },
    {
      q: '7. Why use Context API instead of Redux Toolkit for this project?',
      a: 'For a college-level application, React Context API provides clean, native global state management without external boilerplate. It manages authentication state (`user`, `token`, `isPharmacy`) across the component tree without excessive dependencies, keeping code readable and easy to explain in a viva.',
    },
    {
      q: '8. How does Zod validation improve the security and reliability of the application?',
      a: 'Zod provides strict runtime schema validation. On the backend, incoming request payloads for registration, login, and inventory updates are validated against strict Zod schemas, rejecting malformed or injected data with structured HTTP 400 errors. On the frontend, Zod provides instant inline form validation before network dispatch.',
    },
    {
      q: '9. How is search indexing implemented for medicine queries?',
      a: 'In the Mongoose `Medicine` schema, a compound text index is defined: `medicineSchema.index({ name: "text", genericName: "text", manufacturer: "text" });`. Queries can search both the commercial brand name (e.g., "Dolo 650") or the generic salt composition (e.g., "Paracetamol") efficiently.',
    },
    {
      q: '10. What are potential future enhancements for MedFinder?',
      a: 'Future scope includes geolocation distance sorting using MongoDB 2dsphere geo-indexing, digital prescription OCR upload, push notifications via WebSockets when out-of-stock medicines are replenished, and payment gateway integration (UPI / Razorpay).',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold">
          <GraduationCap className="w-4 h-4" />
          <span>Academic Evaluation & Defense Documentation</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          MedFinder – College Viva Presentation Guide
        </h1>
        <p className="max-w-2xl mx-auto text-sm text-slate-500 leading-relaxed">
          Comprehensive project technical documentation, architecture overview, database entity relationships, and top viva questions prepared for your project defense.
        </p>
      </div>

      {/* Architecture Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Monitor className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Frontend Layer</h3>
          <ul className="text-xs text-slate-600 space-y-1.5">
            <li>• <strong>React.js (Vite):</strong> Fast component-based SPA</li>
            <li>• <strong>Tailwind CSS:</strong> Industry healthcare design system</li>
            <li>• <strong>React Router DOM:</strong> Declarative client routing</li>
            <li>• <strong>Context API:</strong> Global auth and session state</li>
            <li>• <strong>Axios:</strong> Interceptors for JWT token dispatch</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
            <Server className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Backend API Layer</h3>
          <ul className="text-xs text-slate-600 space-y-1.5">
            <li>• <strong>Node.js & Express:</strong> Scalable RESTful API</li>
            <li>• <strong>JWT & bcryptjs:</strong> Encrypted password hashing & tokens</li>
            <li>• <strong>Zod Validation:</strong> Strict schema type checking</li>
            <li>• <strong>Role-Based Access:</strong> User vs Pharmacy middleware</li>
            <li>• <strong>CORS:</strong> Cross-origin resource sharing</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Database Layer</h3>
          <ul className="text-xs text-slate-600 space-y-1.5">
            <li>• <strong>MongoDB Atlas:</strong> Cloud document database</li>
            <li>• <strong>Mongoose ORM:</strong> Schema modeling & validation</li>
            <li>• <strong>Inventory Junction:</strong> Many-to-many store mapping</li>
            <li>• <strong>Text Indexing:</strong> Rapid search on medicine salts</li>
            <li>• <strong>Timestamps:</strong> Audit tracking on bookings</li>
          </ul>
        </div>
      </div>

      {/* Schema / ER Breakdown */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
            Database Design
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-0.5">
            Mongoose Schema & Collections Overview
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-1">1. User Collection</h4>
            <p className="text-slate-500">
              Stores patient and pharmacy owner credentials: <code>name</code>, <code>email</code>, <code>password</code> (hashed), <code>role</code> ('user' | 'pharmacy' | 'admin'), <code>phone</code>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-1">2. Pharmacy Collection</h4>
            <p className="text-slate-500">
              Licensed retail pharmacies: <code>owner</code> (ref User), <code>licenseNumber</code>, <code>address</code>, <code>city</code>, <code>openingHours</code>, <code>rating</code>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-1">3. Medicine Collection</h4>
            <p className="text-slate-500">
              Master drug catalog: <code>name</code>, <code>genericName</code>, <code>category</code>, <code>dosage</code>, <code>form</code>, <code>mrp</code>, <code>prescriptionRequired</code>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-1">4. Inventory Collection</h4>
            <p className="text-slate-500">
              Live stock bridge: <code>pharmacy</code> (ref), <code>medicine</code> (ref), <code>price</code> (counter price), <code>stock</code>, <code>isAvailable</code>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-1">5. Reservation Collection</h4>
            <p className="text-slate-500">
              Customer counter bookings: <code>user</code>, <code>pharmacy</code>, <code>medicine</code>, <code>quantity</code>, <code>totalPrice</code>, <code>status</code> ('Pending'|'Ready'|'Completed').
            </p>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200">
            <h4 className="font-bold text-indigo-900 mb-1">Indexing & Optimization</h4>
            <p className="text-indigo-700">
              Compound index <code>(pharmacy, medicine)</code> enforces unique stock listings. Text indexing on medicine names enables sub-millisecond query responses.
            </p>
          </div>
        </div>
      </div>

      {/* Top Viva Questions Accordion */}
      <div className="space-y-4">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
            Oral Examination Prep
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-0.5">
            Top 10 Viva Questions & Expert Answers
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Click on any question to review the concise explanation to present during your evaluation.
          </p>
        </div>

        <div className="space-y-3">
          {vivaQuestions.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                className="w-full p-5 text-left font-bold text-sm text-slate-800 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <span>{item.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3 bg-slate-50/50">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VivaGuidePage;
