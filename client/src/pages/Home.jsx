import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { medicineAPI, reservationAPI } from '../services/api';
import MedicineCard from '../components/common/MedicineCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  Search,
  Building2,
  CheckCircle2,
  ShieldCheck,
  TrendingDown,
  ArrowRight,
  Pill,
  Sparkles,
  MapPin,
  Clock,
  Store,
  HeartHandshake,
  BadgePercent,
  Compass,
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [featuredMedicines, setFeaturedMedicines] = useState([]);
  const [stats, setStats] = useState({ totalMedicines: 42, totalPharmacies: 4, totalReservations: 25 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [medsRes, statsRes] = await Promise.all([
          medicineAPI.getAll({ limit: 8 }),
          reservationAPI.getStats().catch(() => ({ data: { totalMedicines: 42, totalPharmacies: 4, totalReservations: 25 } })),
        ]);
        setFeaturedMedicines(medsRes.data.medicines || []);
        if (statsRes.data) {
          setStats(statsRes.data);
        }
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/medicines?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/medicines');
    }
  };

  const quickSearches = [
    'Dolo 650',
    'Augmentin',
    'Pan 40',
    'Metformin',
    'Montair LC',
    'Shelcal',
    'Allegra',
    'Gelusil',
    'Volini',
  ];

  const categories = [
    {
      name: 'Pain Relief & Fever',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80',
      badge: 'Everyday Essential',
    },
    {
      name: 'Antibiotics',
      image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&auto=format&fit=crop&q=80',
      badge: 'Rx Prescriptions',
    },
    {
      name: 'Diabetes Care',
      image: 'https://images.unsplash.com/photo-1576073719676-aa955fc6b889?w=500&auto=format&fit=crop&q=80',
      badge: 'Chronic Care',
    },
    {
      name: 'Cardiovascular & BP',
      image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=500&auto=format&fit=crop&q=80',
      badge: 'Heart Health',
    },
    {
      name: 'Gastrointestinal & Antacid',
      image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=500&auto=format&fit=crop&q=80',
      badge: 'Fast Acting',
    },
    {
      name: 'Vitamins & Supplements',
      image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=500&auto=format&fit=crop&q=80',
      badge: 'Daily Wellness',
    },
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* Premium Hero Section with Modern Image & Card */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Soft Background Accents */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative">
          {/* Left Column: Headlines & Search */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold text-sky-300">
              <Sparkles className="w-3.5 h-3.5 text-teal-300 animate-pulse" />
              <span>Real-Time Medicine Stock & Price Finder</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">
              Find Medicines in Nearby Pharmacies & <br />
              <span className="bg-gradient-to-r from-sky-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
                Compare Listed Prices
              </span>
            </h1>

            <p className="max-w-xl text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              Skip calling around or visiting multiple stores. Check real-time stock at verified neighborhood pharmacies and reserve for instant counter pickup.
            </p>

            {/* Smart Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="bg-white p-2 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col sm:flex-row items-center gap-2 max-w-2xl border border-slate-100"
            >
              <div className="flex-1 flex items-center gap-3 px-4 w-full text-slate-800">
                <Search className="w-5 h-5 text-sky-600 shrink-0" />
                <input
                  type="text"
                  placeholder="Search medicine brand or generic composition..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full py-3 text-sm sm:text-base focus:outline-none placeholder:text-slate-400 font-medium"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-bold text-sm sm:text-base rounded-xl sm:rounded-2xl shadow-md shadow-sky-700/30 transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-2 shrink-0"
              >
                <span>Compare Prices</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Popular Searches */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-slate-400 font-semibold">Popular:</span>
              {quickSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => navigate(`/medicines?search=${encodeURIComponent(term)}`)}
                  className="bg-white/10 hover:bg-white/20 text-slate-200 px-3 py-1 rounded-xl backdrop-blur-sm transition-all border border-white/10 font-medium hover:border-sky-400"
                >
                  {term}
                </button>
              ))}
            </div>

            {/* Stats row */}
            <div className="pt-4 grid grid-cols-3 gap-4 border-t border-white/10 max-w-lg">
              <div>
                <div className="text-2xl font-black text-white">{stats.totalMedicines || 22}+</div>
                <div className="text-xs text-slate-400">Listed Medicines</div>
              </div>
              <div>
                <div className="text-2xl font-black text-white">{stats.totalPharmacies || 4}+</div>
                <div className="text-xs text-slate-400">Partner Stores</div>
              </div>
              <div>
                <div className="text-2xl font-black text-teal-400">Up to 25%</div>
                <div className="text-xs text-slate-400">Average Savings</div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Showcase */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-md">
              {/* Main Visual Image Card */}
              <div className="rounded-3xl overflow-hidden border-2 border-white/15 shadow-2xl bg-slate-800 aspect-4/3 relative group">
                <img
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80"
                  alt="Modern Pharmacy & Healthcare"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>

                <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-2xl bg-white/95 backdrop-blur-md text-slate-900 flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-700 flex items-center justify-center font-bold">
                      <ShieldCheck className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Verified Drug Licenses</div>
                      <div className="text-[11px] text-slate-500">100% Genuine Pharmacy Network</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-teal-100 text-teal-800">
                    Active
                  </span>
                </div>
              </div>

              {/* Floating Pill Card 1: Fast Pickup */}
              <div className="absolute -top-4 -left-4 bg-white text-slate-900 p-3 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 animate-float hidden sm:flex">
                <div className="w-9 h-9 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600 font-bold">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold">Instant Counter Hold</div>
                  <div className="text-[10px] text-slate-500">Zero wait pickup</div>
                </div>
              </div>

              {/* Floating Pill Card 2: Price Savings */}
              <div className="absolute -bottom-4 -right-4 bg-white text-slate-900 p-3 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 hidden sm:flex">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                  <BadgePercent className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold">Best Counter Price</div>
                  <div className="text-[10px] text-emerald-700 font-semibold">Compare 4+ stores</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories with Imagery */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">
              Browse Categories
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Popular Medicine Categories
            </h2>
          </div>
          <Link
            to="/medicines"
            className="text-xs sm:text-sm font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 group"
          >
            <span>View All Medicines</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => navigate(`/medicines?category=${encodeURIComponent(cat.name)}`)}
              className="group rounded-2xl bg-white border border-slate-200/90 hover:border-sky-400 overflow-hidden text-left flex flex-col justify-between shadow-xs hover:shadow-lg transition-all duration-300"
            >
              <div className="relative h-28 w-full overflow-hidden bg-slate-100">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                <span className="absolute bottom-2 left-2 text-[10px] font-bold text-white bg-slate-900/70 backdrop-blur-xs px-2 py-0.5 rounded">
                  {cat.badge}
                </span>
              </div>
              <div className="p-3">
                <h3 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-sky-700 line-clamp-1">
                  {cat.name}
                </h3>
                <span className="text-[11px] text-sky-600 font-semibold flex items-center gap-1 mt-1">
                  Explore Stock <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Medicines with Live Price Comparison */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 uppercase tracking-wider">
              <TrendingDown className="w-4 h-4" />
              <span>Real-Time Availability</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Compare Prices Across Local Pharmacies
            </h2>
          </div>
          <Link
            to="/medicines"
            className="text-xs sm:text-sm font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 group"
          >
            <span>Full Catalog ({stats.totalMedicines || 22})</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Fetching pharmacy stocks and prices..." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredMedicines.map((med) => (
              <MedicineCard key={med._id} medicine={med} />
            ))}
          </div>
        )}
      </section>

      {/* Visual Promotional Banner (How in-store pickup works) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-sky-600 via-sky-700 to-teal-700 text-white overflow-hidden shadow-xl p-8 sm:p-12 relative">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-7 space-y-4">
              <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold tracking-wide uppercase">
                Zero Convenience Fee
              </span>
              <h2 className="text-2xl sm:text-4xl font-black leading-tight">
                Never Stand in Lines or Get Disappointed by Out-of-Stock Signs
              </h2>
              <p className="text-sm sm:text-base text-sky-100 leading-relaxed">
                Reserve your medicine online with zero upfront deposit. Your neighborhood pharmacist packs it and keeps it ready at the counter for easy pickup.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  to="/medicines"
                  className="px-6 py-3 rounded-xl bg-white text-sky-700 hover:bg-sky-50 font-bold text-sm shadow-md transition-all hover:shadow-lg"
                >
                  Find Medicine Now
                </Link>
                <Link
                  to="/pharmacies"
                  className="px-6 py-3 rounded-xl bg-sky-800/60 hover:bg-sky-800 text-white font-bold text-sm border border-white/20 transition-all"
                >
                  View Partner Pharmacies
                </Link>
              </div>
            </div>

            <div className="md:col-span-5 flex justify-center">
              <div className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 aspect-4/3">
                <img
                  src="https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=600&auto=format&fit=crop&q=80"
                  alt="Pharmacy store"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Step Process Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">
            Simple & Transparent
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            How MedFinder Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Finding genuine medicines at the best local price in 3 straightforward steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center font-black text-lg">
              1
            </div>
            <h3 className="text-base font-bold text-slate-900">Search by Brand or Salt</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Enter any commercial drug name (e.g. Dolo, Pan 40) or chemical composition. Our database instantly retrieves verified strengths and dosage forms.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center font-black text-lg">
              2
            </div>
            <h3 className="text-base font-bold text-slate-900">Compare Prices & Stocks</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              View side-by-side rates from local licensed chemists. Compare distance, savings against standard MRP, and store operating hours.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-lg">
              3
            </div>
            <h3 className="text-base font-bold text-slate-900">Reserve & Counter Pickup</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Lock your units with 1 click. Walk in at your convenience, present your prescription if required, pay directly at the counter, and collect your medicine.
            </p>
          </div>
        </div>
      </section>

      {/* Partner with Us Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-400">
              <Store className="w-4 h-4" />
              <span>For Retail Pharmacy Owners</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold">
              Own a licensed pharmacy? List your store on MedFinder
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Gain local footfall, reduce dead stock, and receive advance pickup bookings from patients right in your neighborhood.
            </p>
          </div>
          <Link
            to="/register"
            className="px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-md transition-all shrink-0"
          >
            Register Pharmacy Free
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
