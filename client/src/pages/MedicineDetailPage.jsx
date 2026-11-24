import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { medicineAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ReservationModal from '../components/common/ReservationModal';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Star,
  Clock,
  Phone,
  Tag,
  MapPin,
  CalendarCheck,
  Pill,
  Info,
  Sparkles,
  ChevronRight,
  TrendingDown,
} from 'lucide-react';

const MedicineDetailPage = () => {
  const { id } = useParams();
  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Reservation modal state
  const [selectedPharmacyListing, setSelectedPharmacyListing] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchMedicineDetails = async () => {
    try {
      setLoading(true);
      const res = await medicineAPI.getById(id);
      setMedicine(res.data);
    } catch (err) {
      console.error('Failed to load medicine details:', err);
      setError('Medicine not found or an error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicineDetails();
  }, [id]);

  const handleOpenReserve = (pharmacyListing) => {
    setSelectedPharmacyListing(pharmacyListing);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner text="Fetching medicine details and comparing nearby pharmacy stocks..." />
      </div>
    );
  }

  if (error || !medicine) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">{error || 'Medicine Not Found'}</h2>
        <Link
          to="/medicines"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Medicines</span>
        </Link>
      </div>
    );
  }

  const {
    name,
    genericName,
    category,
    manufacturer,
    dosage,
    form,
    mrp,
    description,
    prescriptionRequired,
    usageInstructions,
    sideEffects,
    image,
    pharmacies = [],
    lowestPrice,
    maxDiscount,
    totalPharmaciesAvailable,
  } = medicine;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-sky-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <Link to="/medicines" className="hover:text-sky-600">Medicines</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
        <span className="font-semibold text-slate-800 truncate max-w-xs">{name}</span>
      </nav>

      {/* Top Drug Overview Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden p-6 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Image */}
          <div className="lg:col-span-4 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 aspect-video lg:aspect-square relative shadow-xs">
            <img
              src={image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80'}
              alt={name}
              className="w-full h-full object-cover"
            />
            {prescriptionRequired ? (
              <span className="absolute top-3 left-3 bg-rose-600/90 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                Prescription Required (Rx)
              </span>
            ) : (
              <span className="absolute top-3 left-3 bg-teal-600/90 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Over The Counter (OTC)
              </span>
            )}
          </div>

          {/* Core Info */}
          <div className="lg:col-span-8 space-y-5">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-sky-100 text-sky-800">
                  {category}
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                  {form}
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                  Strength: {dosage}
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {name}
              </h1>
              <p className="text-sm sm:text-base font-medium text-slate-600">
                Salt Composition: <span className="text-slate-900 font-bold">{genericName}</span>
              </p>
              <p className="text-xs text-slate-400">
                Marketed by <span className="font-semibold text-slate-700">{manufacturer}</span>
              </p>
            </div>

            {/* Price Overview Highlight Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-sky-50 via-teal-50 to-blue-50 border border-sky-200/80 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-800">
                  Best Local Pharmacy Counter Price
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl font-black text-slate-900">
                    ₹{lowestPrice || mrp}
                  </span>
                  {mrp > lowestPrice && (
                    <span className="text-base text-slate-400 line-through">
                      MRP ₹{mrp}
                    </span>
                  )}
                  {maxDiscount > 0 && (
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-600 text-white">
                      Save up to {maxDiscount}%
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="p-2.5 rounded-xl bg-white/90 border border-sky-200 shadow-xs">
                  <span className="text-slate-500 block">Available in:</span>
                  <span className="text-sm font-bold text-sky-700">
                    {totalPharmaciesAvailable} {totalPharmaciesAvailable === 1 ? 'Store' : 'Stores'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/90 border border-sky-200 shadow-xs">
                  <span className="text-slate-500 block">Standard MRP:</span>
                  <span className="text-sm font-bold text-slate-800">₹{mrp}</span>
                </div>
              </div>
            </div>

            {/* Description & Clinical details */}
            <div className="space-y-3 pt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <p>{description}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="font-bold text-slate-800 block mb-1 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-sky-600" /> Usage Guidelines
                  </span>
                  <p className="text-xs text-slate-600 leading-normal">{usageInstructions}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="font-bold text-slate-800 block mb-1 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-500" /> Precautions
                  </span>
                  <p className="text-xs text-slate-600 leading-normal">{sideEffects}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Pharmacy Comparison Table */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 uppercase tracking-wider">
              <TrendingDown className="w-4 h-4" />
              <span>Side-by-Side Stock & Rate Comparison</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
              Available at {pharmacies.length} Partner Pharmacies
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Sorted automatically by lowest price first
          </p>
        </div>

        {pharmacies.length === 0 ? (
          <div className="p-8 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
            <h3 className="text-base font-bold text-amber-900">
              Currently not stocked in registered pharmacies
            </h3>
            <p className="text-xs text-amber-700 max-w-md mx-auto">
              No registered partner pharmacy currently has this medicine in stock. Please check back later or search for an alternate generic salt.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pharmacies.map((item, index) => {
              const isBestPrice = index === 0 && item.isAvailable;
              return (
                <div
                  key={item.inventoryId}
                  className={`bg-white rounded-2xl border transition-all duration-200 p-5 sm:p-6 ${
                    isBestPrice
                      ? 'border-sky-400 shadow-md shadow-sky-500/10 ring-2 ring-sky-400/20'
                      : 'border-slate-200/90 shadow-xs hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    {/* Pharmacy Info */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {isBestPrice && (
                          <span className="px-2.5 py-0.5 rounded-full bg-teal-600 text-white text-[11px] font-black flex items-center gap-1 shadow-xs">
                            <Sparkles className="w-3 h-3" />
                            Best Deal
                          </span>
                        )}
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-sky-600 shrink-0" />
                          <span>{item.pharmacyName}</span>
                        </h3>
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span>{item.rating}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {item.address}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {item.openingHours}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {item.phone}
                        </span>
                      </div>
                    </div>

                    {/* Stock Status */}
                    <div className="flex items-center gap-4 lg:border-l lg:border-r border-slate-100 lg:px-6">
                      <div>
                        <div className="text-[11px] text-slate-400 font-bold uppercase">
                          Stock Status
                        </div>
                        {item.isAvailable ? (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-teal-700 mt-0.5">
                            <CheckCircle2 className="w-4 h-4 text-teal-600" />
                            <span>In Stock ({item.stock} left)</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 mt-0.5">
                            <AlertCircle className="w-4 h-4 text-rose-500" />
                            <span>Out of Stock</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Pricing & Reservation Button */}
                    <div className="flex items-center justify-between lg:justify-end gap-6">
                      <div className="text-left lg:text-right">
                        <div className="text-[11px] text-slate-400 font-bold uppercase">
                          Pharmacy Price
                        </div>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className="text-2xl font-black text-slate-900">
                            ₹{item.price}
                          </span>
                          {item.mrp > item.price && (
                            <span className="text-xs text-slate-400 line-through">
                              ₹{item.mrp}
                            </span>
                          )}
                        </div>
                        {item.discountPercent > 0 && (
                          <span className="text-[11px] font-bold text-teal-700">
                            Save {item.discountPercent}% off MRP
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleOpenReserve(item)}
                        disabled={!item.isAvailable}
                        className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition-all duration-200 ${
                          item.isAvailable
                            ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/20 hover:shadow-md'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <CalendarCheck className="w-4 h-4" />
                        <span>Reserve for Pickup</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Reservation Modal */}
      {selectedPharmacyListing && (
        <ReservationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          medicine={medicine}
          pharmacyListing={selectedPharmacyListing}
          onSuccess={fetchMedicineDetails}
        />
      )}
    </div>
  );
};

export default MedicineDetailPage;
