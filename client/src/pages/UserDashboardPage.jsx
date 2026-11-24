import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reservationAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  CalendarCheck,
  Building2,
  Clock,
  MapPin,
  Phone,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Pill,
  ArrowRight,
} from 'lucide-react';

const UserDashboardPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const res = await reservationAPI.getUserReservations();
      setReservations(res.data || []);
    } catch (err) {
      console.error('Error fetching reservations:', err);
      toast.error('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleCancelReservation = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this medicine reservation?')) {
      return;
    }

    try {
      await reservationAPI.updateStatus(id, { status: 'Cancelled' });
      toast.success('Reservation cancelled successfully');
      fetchReservations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel reservation');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Pending Confirmation
          </span>
        );
      case 'Confirmed':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Confirmed by Pharmacy
          </span>
        );
      case 'Ready for Pickup':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 animate-pulse">
            <CheckCircle2 className="w-3 h-3" /> Ready for Counter Pickup
          </span>
        );
      case 'Completed':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Collected / Completed
          </span>
        );
      case 'Cancelled':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
            {status}
          </span>
        );
    }
  };

  const filteredReservations = reservations.filter((r) =>
    filterStatus === 'All' ? true : r.status === filterStatus
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider">
            <CalendarCheck className="w-4 h-4" />
            <span>Customer Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            My Medicine Reservations
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track status of your in-store medicine pickup orders and view pharmacy contact info.
          </p>
        </div>

        <Link
          to="/medicines"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
        >
          <span>Find More Medicines</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
        {['All', 'Pending', 'Confirmed', 'Ready for Pickup', 'Completed', 'Cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterStatus === status
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Reservations List */}
      {loading ? (
        <LoadingSpinner text="Fetching your reservations..." />
      ) : filteredReservations.length > 0 ? (
        <div className="space-y-4">
          {filteredReservations.map((res) => (
            <div
              key={res._id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-4 hover:border-slate-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <Pill className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {res.medicine?.name || 'Medicine'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {res.medicine?.dosage} • {res.medicine?.form}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(res.status)}
                </div>
              </div>

              {/* Pharmacy & Order Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
                {/* Pharmacy Column */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Pickup Pharmacy
                  </span>
                  <div className="font-bold text-slate-800 text-sm flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{res.pharmacy?.name}</span>
                  </div>
                  <p className="text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{res.pharmacy?.address}, {res.pharmacy?.city}</span>
                  </p>
                  <p className="text-slate-500 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{res.pharmacy?.phone}</span>
                  </p>
                </div>

                {/* Instructions Column */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Pickup Notes & Timestamps
                  </span>
                  <p className="text-slate-500">
                    Reserved on: <span className="font-medium text-slate-700">{new Date(res.createdAt).toLocaleDateString()}</span>
                  </p>
                  {res.pickupNotes && (
                    <p className="text-slate-500">
                      Your note: <span className="italic text-slate-700">"{res.pickupNotes}"</span>
                    </p>
                  )}
                  {res.pharmacyNotes && (
                    <p className="text-emerald-700 font-medium">
                      Pharmacist note: "{res.pharmacyNotes}"
                    </p>
                  )}
                </div>

                {/* Price & Action Column */}
                <div className="flex flex-col justify-between items-start md:items-end">
                  <div className="text-left md:text-right">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      Reserved Quantity & Price
                    </span>
                    <div className="text-slate-500">
                      {res.quantity} unit(s) × ₹{res.unitPrice}
                    </div>
                    <div className="text-xl font-black text-slate-900 mt-0.5">
                      Total: ₹{res.totalPrice}
                    </div>
                    <span className="text-[10px] text-emerald-600 font-semibold block">
                      Pay at pharmacy counter
                    </span>
                  </div>

                  {res.status === 'Pending' && (
                    <button
                      onClick={() => handleCancelReservation(res._id)}
                      className="mt-3 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline"
                    >
                      Cancel Reservation
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300 p-8 space-y-4">
          <CalendarCheck className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No reservations found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You don't have any reservations with this status. Search for a medicine and reserve it for easy in-store pickup.
          </p>
          <Link
            to="/medicines"
            className="inline-block px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
          >
            Explore Medicines
          </Link>
        </div>
      )}
    </div>
  );
};

export default UserDashboardPage;
