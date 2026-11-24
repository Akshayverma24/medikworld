import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { reservationAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  X,
  Building2,
  CalendarCheck,
  CheckCircle2,
  AlertTriangle,
  Pill,
  Clock,
  Phone,
} from 'lucide-react';

const ReservationModal = ({ isOpen, onClose, medicine, pharmacyListing, onSuccess }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [quantity, setQuantity] = useState(1);
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [pickupNotes, setPickupNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !medicine || !pharmacyListing) return null;

  const maxStock = pharmacyListing.stock || 1;
  const unitPrice = pharmacyListing.price;
  const totalPrice = unitPrice * quantity;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please log in to reserve medicine for pickup');
      navigate('/login');
      return;
    }

    if (!customerPhone.trim()) {
      toast.error('Please provide a contact phone number for pickup confirmation');
      return;
    }

    setSubmitting(true);
    try {
      await reservationAPI.create({
        pharmacyId: pharmacyListing.pharmacyId,
        medicineId: medicine._id,
        quantity,
        customerPhone,
        pickupNotes,
      });

      toast.success('Reservation placed successfully! Pharmacy will prepare your order.');
      if (onSuccess) onSuccess();
      onClose();
      navigate('/my-reservations');
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to place reservation.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-sky-600 to-teal-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Reserve for In-Store Pickup</h3>
              <p className="text-xs text-sky-100">Zero advance payment required</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Item & Pharmacy Summary */}
          <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700">
                  Medicine
                </span>
                <h4 className="text-base font-bold text-slate-800">{medicine.name}</h4>
                <p className="text-xs text-slate-500">{medicine.dosage} • {medicine.form}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Unit Price</span>
                <div className="text-lg font-black text-sky-700">₹{unitPrice}</div>
              </div>
            </div>

            <div className="pt-2 border-t border-sky-200/60 flex items-center justify-between text-xs text-slate-700">
              <div className="flex items-center gap-1.5 font-medium">
                <Building2 className="w-3.5 h-3.5 text-sky-600" />
                <span>{pharmacyListing.pharmacyName}</span>
              </div>
              <div className="text-slate-500">{pharmacyListing.city}</div>
            </div>
          </div>

          {/* Quantity Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Quantity (Max Available: {maxStock})
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold flex items-center justify-center transition-colors"
              >
                -
              </button>
              <div className="flex-1 text-center font-black text-lg text-slate-900 border border-slate-200 py-1.5 rounded-xl bg-white">
                {quantity}
              </div>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
                className="w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold flex items-center justify-center transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Contact Phone Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              The pharmacy will contact you via SMS or Call when your medicine is ready.
            </p>
          </div>

          {/* Pickup Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Pickup Instructions (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Will arrive around 5 PM, please keep generic equivalent if preferred..."
              value={pickupNotes}
              onChange={(e) => setPickupNotes(e.target.value)}
              className="w-full px-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
            />
          </div>

          {/* Price Calculation Box */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500">Pay at Pharmacy Counter</span>
              <div className="text-xs font-semibold text-teal-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> No advance booking charges
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Total Amount</span>
              <div className="text-2xl font-black text-slate-900">₹{totalPrice}</div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold shadow-md shadow-sky-600/20 disabled:opacity-50 transition-all"
            >
              {submitting ? 'Confirming...' : 'Confirm Reservation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReservationModal;
