import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pharmacyAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  Building2,
  Search,
  MapPin,
  Clock,
  Phone,
  Star,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

const PharmaciesPage = () => {
  const [pharmacies, setPharmacies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPharmacies = async () => {
      setLoading(true);
      try {
        const res = await pharmacyAPI.getAll({ search: searchTerm });
        setPharmacies(res.data || []);
      } catch (err) {
        console.error('Error fetching pharmacies:', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchPharmacies();
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-sky-600 uppercase tracking-wider">
          <Building2 className="w-4 h-4" />
          <span>Neighborhood Network</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
          Registered Partner Pharmacies
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Find verified licensed pharmacies in your area, view operating hours, and explore their live in-stock medicine catalogs.
        </p>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs max-w-xl">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by pharmacy name, street, or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
          />
        </div>
      </div>

      {/* Pharmacies Grid */}
      {loading ? (
        <LoadingSpinner text="Locating registered partner pharmacies..." />
      ) : pharmacies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pharmacies.map((pharmacy) => (
            <div
              key={pharmacy._id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-sky-300 transition-all duration-300 flex flex-col overflow-hidden group"
            >
              {/* Image banner */}
              <div className="relative h-44 bg-slate-100 overflow-hidden">
                <img
                  src={pharmacy.image || 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=600&auto=format&fit=crop&q=80'}
                  alt={pharmacy.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>

                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-sky-900 text-xs font-bold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  <span>Verified License</span>
                </div>

                <div className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
                  <Star className="w-3 h-3 fill-white" />
                  <span>{pharmacy.rating}</span>
                </div>

                <span className="absolute bottom-2.5 left-3 text-xs font-semibold text-sky-200 bg-slate-950/70 backdrop-blur-xs px-2.5 py-0.5 rounded-md">
                  {pharmacy.city}
                </span>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-slate-800 group-hover:text-sky-700 transition-colors">
                    {pharmacy.name}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-start gap-1.5 leading-relaxed">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{pharmacy.address}, {pharmacy.city} - {pharmacy.pincode}</span>
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{pharmacy.openingHours}</span>
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{pharmacy.phone}</span>
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs font-medium text-slate-500">
                    <span className="font-extrabold text-sky-700 text-sm">
                      {pharmacy.totalMedicinesInStock || 0}
                    </span>{' '}
                    medicines in stock
                  </div>

                  <Link
                    to={`/pharmacies/${pharmacy._id}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-600 hover:text-white font-bold text-xs transition-colors group/btn shadow-xs"
                  >
                    <span>View Catalog</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300 p-8">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No pharmacies found</h3>
          <p className="text-xs text-slate-500 mt-1">Try another search term or city name.</p>
        </div>
      )}
    </div>
  );
};

export default PharmaciesPage;
