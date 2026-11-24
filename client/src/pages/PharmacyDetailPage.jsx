import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { pharmacyAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ReservationModal from '../components/common/ReservationModal';
import {
  Building2,
  MapPin,
  Clock,
  Phone,
  Mail,
  ShieldCheck,
  Star,
  Search,
  CheckCircle2,
  AlertCircle,
  CalendarCheck,
  ChevronRight,
  Pill,
} from 'lucide-react';

const PharmacyDetailPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Reservation modal state
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [selectedPharmacyListing, setSelectedPharmacyListing] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPharmacyData = async () => {
    try {
      setLoading(true);
      const res = await pharmacyAPI.getById(id);
      setData(res.data);
    } catch (err) {
      console.error('Error loading pharmacy details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPharmacyData();
  }, [id]);

  const handleOpenReserve = (med) => {
    setSelectedMedicine(med);
    setSelectedPharmacyListing({
      pharmacyId: data.pharmacy._id,
      pharmacyName: data.pharmacy.name,
      city: data.pharmacy.city,
      price: med.price,
      stock: med.stock,
    });
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner text="Loading pharmacy details and live stock inventory..." />
      </div>
    );
  }

  if (!data || !data.pharmacy) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Pharmacy not found</h2>
        <Link to="/pharmacies" className="mt-4 inline-block text-xs font-semibold text-emerald-600">
          Back to Pharmacies
        </Link>
      </div>
    );
  }

  const { pharmacy, medicines = [] } = data;

  const filteredMedicines = medicines.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-emerald-700">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <Link to="/pharmacies" className="hover:text-emerald-700">Pharmacies</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="font-semibold text-slate-800 truncate max-w-xs">{pharmacy.name}</span>
      </nav>

      {/* Pharmacy Header Profile Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
              <Building2 className="w-10 h-10" />
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Verified Pharmacy
                </span>
                <span className="text-xs text-slate-400">
                  License: <strong className="text-slate-600">{pharmacy.licenseNumber}</strong>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {pharmacy.name}
              </h1>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {pharmacy.address}, {pharmacy.city} - {pharmacy.pincode}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {pharmacy.openingHours}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {pharmacy.phone}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <div className="flex items-center justify-center gap-1 text-base font-extrabold text-amber-600">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>{pharmacy.rating} / 5.0</span>
              </div>
              <span className="text-[11px] text-slate-400">Customer Rating</span>
            </div>

            <div className="px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
              <div className="text-base font-extrabold text-emerald-700">
                {medicines.length}
              </div>
              <span className="text-[11px] text-emerald-600">Medicines Listed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Catalog Search & Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              In-Store Medicine Inventory
            </h2>
            <p className="text-xs text-slate-500">
              Live stock and pharmacy counter rates available for pickup
            </p>
          </div>

          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search medicine or composition in this store..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>
        </div>

        {filteredMedicines.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
            <Pill className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-600">No matching medicines found in this pharmacy</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Medicine & Formula</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Dosage Form</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4">Price / MRP</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMedicines.map((med) => (
                    <tr key={med.inventoryId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <Link
                          to={`/medicines/${med.medicineId}`}
                          className="font-bold text-slate-800 hover:text-emerald-700 block"
                        >
                          {med.name}
                        </Link>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          {med.genericName} • {med.manufacturer}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs">
                          {med.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {med.dosage} ({med.form})
                      </td>
                      <td className="py-3.5 px-4">
                        {med.isAvailable ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {med.stock} in stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-500 font-semibold text-xs">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Out of stock
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-extrabold text-slate-900 text-base">
                            ₹{med.price}
                          </span>
                          {med.mrp > med.price && (
                            <span className="text-xs text-slate-600 line-through">
                              ₹{med.mrp}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenReserve(med)}
                          disabled={!med.isAvailable}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs disabled:opacity-40 transition-colors inline-flex items-center gap-1"
                        >
                          <CalendarCheck className="w-3.5 h-3.5" />
                          <span>Reserve</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Reservation Modal */}
      {selectedMedicine && selectedPharmacyListing && (
        <ReservationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          medicine={selectedMedicine}
          pharmacyListing={selectedPharmacyListing}
          onSuccess={fetchPharmacyData}
        />
      )}
    </div>
  );
};

export default PharmacyDetailPage;
