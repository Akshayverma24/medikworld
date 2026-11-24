import React from 'react';
import { Link } from 'react-router-dom';
import { Pill, Heart, ShieldCheck, MapPin, Phone, Mail, Clock, CheckCircle2 } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
                <Pill className="w-5 h-5 rotate-45" />
              </div>
              <span className="font-extrabold text-2xl text-white tracking-tight">MedFinder</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              India's smart medicine discovery and verified neighborhood pharmacy comparison platform. Check live availability, compare counter prices, and reserve medicines for instant pickup.
            </p>
            <div className="flex items-center gap-2 text-xs text-sky-400 font-semibold">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>100% Genuine Licensed Pharmacies</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4">
              Explore Platform
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/medicines" className="hover:text-sky-400 transition-colors">
                  Search All Medicines
                </Link>
              </li>
              <li>
                <Link to="/pharmacies" className="hover:text-sky-400 transition-colors">
                  Registered Pharmacies
                </Link>
              </li>
              <li>
                <Link to="/medicines?category=Pain%20Relief%20%26%20Fever" className="hover:text-sky-400 transition-colors">
                  Everyday Essentials
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-sky-400 transition-colors">
                  Pharmacy Partner Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Categories */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4">
              Top Health Needs
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/medicines?category=Pain%20Relief%20%26%20Fever" className="hover:text-sky-400 transition-colors">
                  Pain Relief & Fever
                </Link>
              </li>
              <li>
                <Link to="/medicines?category=Diabetes%20Care" className="hover:text-sky-400 transition-colors">
                  Diabetes Care & Insulin
                </Link>
              </li>
              <li>
                <Link to="/medicines?category=Cardiovascular%20%26%20BP" className="hover:text-sky-400 transition-colors">
                  Heart Care & Blood Pressure
                </Link>
              </li>
              <li>
                <Link to="/medicines?category=Gastrointestinal%20%26%20Antacid" className="hover:text-sky-400 transition-colors">
                  Digestive & Antacids
                </Link>
              </li>
              <li>
                <Link to="/medicines?category=Vitamins%20%26%20Supplements" className="hover:text-sky-400 transition-colors">
                  Vitamins & Supplements
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support & Assistance */}
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-4">
              Patient Support
            </h4>
            <div className="space-y-3 text-xs text-slate-400">
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Helpline: +91 (800) 234-5678</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <span>support@medfinder.org</span>
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Support Hours: 8:00 AM - 10:00 PM</span>
              </p>
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-teal-400 text-[11px] font-semibold border border-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Zero Advance Booking Charges
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Medical Advisory Banner */}
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 mb-8 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-400 leading-relaxed">
            <strong className="text-slate-300 font-semibold">Medical Advisory:</strong> MedFinder facilitates price transparency and in-store reservation at verified local retail pharmacies. Medicine information provided is for educational reference. Please consult a qualified doctor or pharmacist before starting any medication, and bring a valid prescription for Rx medicines.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 MedFinder Platform. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 inline fill-rose-500" /> for accessible, affordable healthcare
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
