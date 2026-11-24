import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Pill,
  Search,
  Building2,
  CalendarCheck,
  LayoutDashboard,
  LogOut,
  User,
  Menu,
  X,
  PhoneCall,
  ShieldCheck,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isPharmacy, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-xl transition-all ${
      isActive
        ? 'text-sky-600 bg-sky-50 shadow-sm'
        : 'text-slate-600 hover:text-sky-600 hover:bg-slate-50'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-sky-500/25 group-hover:scale-105 transition-transform">
              <Pill className="w-6 h-6 rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-sky-700 via-sky-600 to-teal-600 bg-clip-text text-transparent">
                  MedFinder
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200/60 px-2 py-0.5 rounded-full">
                  Live Stock
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium -mt-1 hidden sm:block">
                Medicine Availability & Pharmacy Comparison
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5">
            <NavLink to="/medicines" className={navLinkClass}>
              <Search className="w-4 h-4 text-sky-600" />
              <span>Find Medicines</span>
            </NavLink>

            <NavLink to="/pharmacies" className={navLinkClass}>
              <Building2 className="w-4 h-4 text-teal-600" />
              <span>Partner Pharmacies</span>
            </NavLink>

            {isAuthenticated && !isPharmacy && (
              <NavLink to="/my-reservations" className={navLinkClass}>
                <CalendarCheck className="w-4 h-4 text-sky-600" />
                <span>My Reservations</span>
              </NavLink>
            )}

            {isPharmacy && (
              <NavLink to="/pharmacy-dashboard" className={navLinkClass}>
                <LayoutDashboard className="w-4 h-4 text-teal-600" />
                <span>Pharmacy Dashboard</span>
              </NavLink>
            )}
          </nav>

          {/* User Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-800 leading-tight">
                    {user?.name}
                  </div>
                  <div className="text-xs text-slate-500 capitalize">
                    {user?.role === 'pharmacy' ? 'Pharmacy Partner' : 'Customer Account'}
                  </div>
                </div>

                <div className="w-10 h-10 rounded-2xl bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-700 font-bold text-sm shadow-xs">
                  {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                </div>

                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-bold text-slate-700 hover:text-sky-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 rounded-xl shadow-md shadow-sky-600/20 transition-all hover:shadow-lg hover:-translate-y-0.5"
                >
                  Sign Up Free
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 text-slate-600 hover:text-sky-600 rounded-xl border border-slate-200"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-2">
          <NavLink
            to="/medicines"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-slate-700 rounded-xl hover:bg-slate-50"
          >
            <Search className="w-4 h-4 text-sky-600" />
            <span>Find Medicines</span>
          </NavLink>
          <NavLink
            to="/pharmacies"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-slate-700 rounded-xl hover:bg-slate-50"
          >
            <Building2 className="w-4 h-4 text-teal-600" />
            <span>Partner Pharmacies</span>
          </NavLink>
          {isAuthenticated && !isPharmacy && (
            <NavLink
              to="/my-reservations"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-slate-700 rounded-xl hover:bg-slate-50"
            >
              <CalendarCheck className="w-4 h-4 text-sky-600" />
              <span>My Reservations</span>
            </NavLink>
          )}
          {isPharmacy && (
            <NavLink
              to="/pharmacy-dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-slate-700 rounded-xl hover:bg-slate-50"
            >
              <LayoutDashboard className="w-4 h-4 text-teal-600" />
              <span>Pharmacy Dashboard</span>
            </NavLink>
          )}

          <div className="pt-3 border-t border-slate-100">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="text-xs text-slate-500 px-3">
                  Signed in as <span className="font-bold text-slate-800">{user?.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-rose-600 rounded-xl hover:bg-rose-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log out</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-bold text-slate-700 border border-slate-300 rounded-xl"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-bold text-white bg-sky-600 rounded-xl shadow-sm"
                >
                  Sign Up Free
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
