import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { medicineAPI } from '../services/api';
import { MASTER_MEDICINES_LIST } from '../data/masterMedicines';
import MedicineCard from '../components/common/MedicineCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  Search,
  Filter,
  X,
  Pill,
  RotateCcw,
  Plus,
  Sparkles,
  Building2,
  CheckCircle2,
} from 'lucide-react';

const MedicinesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Filters state
  const searchTerm = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || 'All';
  const prescriptionFilter = searchParams.get('prescription') || 'All';
  const selectedForm = searchParams.get('form') || 'All';
  const sortOption = searchParams.get('sort') || 'name';

  // Add Medicine Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newMed, setNewMed] = useState({
    name: '',
    genericName: '',
    category: 'Pain Relief & Fever',
    manufacturer: 'Standard Pharmaceuticals',
    dosage: '500mg',
    form: 'Tablet',
    mrp: '',
    prescriptionRequired: false,
    description: '',
    usageInstructions: '',
    sideEffects: '',
    image: '',
  });

  const loadCategories = async () => {
    try {
      const res = await medicineAPI.getCategories();
      if (res.data && res.data.length > 0) {
        setCategories(res.data);
      } else {
        setCategories([
          { name: 'Pain Relief & Fever', count: 7 },
          { name: 'Antibiotics', count: 5 },
          { name: 'Diabetes Care', count: 4 },
          { name: 'Cardiovascular & BP', count: 6 },
          { name: 'Gastrointestinal & Antacid', count: 6 },
          { name: 'Respiratory & Allergy', count: 6 },
          { name: 'Vitamins & Supplements', count: 6 },
          { name: 'Dermatology & Skin', count: 3 },
          { name: 'Other', count: 2 },
        ]);
      }
    } catch (err) {
      setCategories([
        { name: 'Pain Relief & Fever', count: 7 },
        { name: 'Antibiotics', count: 5 },
        { name: 'Diabetes Care', count: 4 },
        { name: 'Cardiovascular & BP', count: 6 },
        { name: 'Gastrointestinal & Antacid', count: 6 },
        { name: 'Respiratory & Allergy', count: 6 },
        { name: 'Vitamins & Supplements', count: 6 },
        { name: 'Dermatology & Skin', count: 3 },
        { name: 'Other', count: 2 },
      ]);
    }
  };

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const params = {
        search: searchTerm,
        category: selectedCategory,
        prescriptionRequired:
          prescriptionFilter === 'All'
            ? 'All'
            : prescriptionFilter === 'prescription'
            ? 'true'
            : 'false',
        form: selectedForm,
        sort: sortOption,
        limit: 100,
      };
      const res = await medicineAPI.getAll(params);

      if (res.data?.medicines && res.data.medicines.length > 0) {
        setMedicines(res.data.medicines);
        setTotal(res.data.total);
      } else {
        // Fallback to local Master Catalog List so the user is NEVER blocked!
        let list = MASTER_MEDICINES_LIST.map((m, idx) => ({
          ...m,
          _id: `master_${idx}`,
          availablePharmaciesCount: 4,
          lowestPrice: Math.max(5, Math.round(m.mrp * 0.88)),
          inStock: true,
        }));

        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          list = list.filter(
            (m) =>
              m.name.toLowerCase().includes(q) ||
              m.genericName.toLowerCase().includes(q) ||
              m.manufacturer?.toLowerCase().includes(q)
          );
        }
        if (selectedCategory !== 'All') {
          list = list.filter((m) => m.category === selectedCategory);
        }
        if (prescriptionFilter !== 'All') {
          const req = prescriptionFilter === 'prescription';
          list = list.filter((m) => m.prescriptionRequired === req);
        }
        if (selectedForm !== 'All') {
          list = list.filter((m) => m.form === selectedForm);
        }

        setMedicines(list);
        setTotal(list.length);
      }
    } catch (err) {
      console.warn('Backend unavailable, rendering full Master Catalog List:', err.message);
      // Fallback to MASTER_MEDICINES_LIST
      let list = MASTER_MEDICINES_LIST.map((m, idx) => ({
        ...m,
        _id: `master_${idx}`,
        availablePharmaciesCount: 4,
        lowestPrice: Math.max(5, Math.round(m.mrp * 0.88)),
        inStock: true,
      }));
      setMedicines(list);
      setTotal(list.length);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    fetchMedicines();
  }, [searchTerm, selectedCategory, prescriptionFilter, selectedForm, sortOption]);

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === 'All' || value === '' || !value) {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  // Quick Pre-Fill from Master Catalog template
  const handleTemplateSelect = (templateName) => {
    const found = MASTER_MEDICINES_LIST.find((m) => m.name === templateName);
    if (found) {
      setNewMed({
        name: found.name,
        genericName: found.genericName,
        category: found.category,
        manufacturer: found.manufacturer || 'Standard Pharma',
        dosage: found.dosage || '500mg',
        form: found.form || 'Tablet',
        mrp: found.mrp.toString(),
        prescriptionRequired: found.prescriptionRequired || false,
        description: `Prescribed ${found.category} medication containing ${found.genericName}.`,
        usageInstructions: 'Take as directed by your physician.',
        sideEffects: 'Consult doctor if symptoms persist.',
        image: found.image || '',
      });
    }
  };

  const handleCreateMedicine = async (e) => {
    e.preventDefault();
    if (!newMed.name.trim() || !newMed.genericName.trim() || !newMed.mrp) {
      toast.error('Please fill in medicine name, generic salt, and MRP');
      return;
    }

    setSubmitting(true);
    try {
      await medicineAPI.create({
        ...newMed,
        mrp: Number(newMed.mrp),
      });
      toast.success(`${newMed.name} added and listed across partner pharmacies!`);
      setIsAddModalOpen(false);
      setNewMed({
        name: '',
        genericName: '',
        category: 'Pain Relief & Fever',
        manufacturer: 'Standard Pharmaceuticals',
        dosage: '500mg',
        form: 'Tablet',
        mrp: '',
        prescriptionRequired: false,
        description: '',
        usageInstructions: '',
        sideEffects: '',
        image: '',
      });
      fetchMedicines();
      loadCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Medicine added locally');
      // If offline, still add to state
      setMedicines((prev) => [
        {
          _id: `custom_${Date.now()}`,
          ...newMed,
          mrp: Number(newMed.mrp),
          lowestPrice: Math.round(Number(newMed.mrp) * 0.9),
          availablePharmaciesCount: 3,
          inStock: true,
        },
        ...prev,
      ]);
      setTotal((t) => t + 1);
      setIsAddModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const formsList = ['All', 'Tablet', 'Capsule', 'Syrup', 'Ointment', 'Drops', 'Injection'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header with Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-600 uppercase tracking-wider">
            <Pill className="w-4 h-4" />
            <span>Master Medicine Catalog ({total} Total Available)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Explore Medicines & Compare Pharmacy Prices
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Check live stock counts, standard MRPs, and discounted counter rates across registered partner pharmacies.
          </p>
        </div>

        {/* Add Medicine Trigger Button */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-sky-600/20 transition-all hover:shadow-lg hover:-translate-y-0.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Medicine to Catalog</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        {/* Top search & Sort bar */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by brand name (Dolo, Pan 40) or chemical composition (Paracetamol)..."
              value={searchTerm}
              onChange={(e) => updateParam('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => updateParam('search', '')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs text-slate-500 font-medium shrink-0">Sort:</span>
              <select
                value={sortOption}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="w-full md:w-auto px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="name">Name (A-Z)</option>
                <option value="mrp-low">Price (Low to High)</option>
                <option value="mrp-high">Price (High to Low)</option>
                <option value="newest">Recently Added</option>
              </select>
            </div>

            <button
              onClick={handleResetFilters}
              title="Reset all filters"
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-200 transition-colors shrink-0 flex items-center gap-1 text-xs font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-slate-600 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-sky-600" /> Category:
          </span>
          <button
            onClick={() => updateParam('category', 'All')}
            className={`px-3 py-1 rounded-full font-semibold transition-all ${
              selectedCategory === 'All'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => updateParam('category', cat.name)}
              className={`px-3 py-1 rounded-full font-semibold transition-all ${
                selectedCategory === cat.name
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.name} {cat.count > 0 && `(${cat.count})`}
            </button>
          ))}
        </div>

        {/* Second row: Prescription & Form filters */}
        <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-600">Prescription:</span>
            {['All', 'otc', 'prescription'].map((p) => (
              <button
                key={p}
                onClick={() => updateParam('prescription', p)}
                className={`px-2.5 py-1 rounded-lg font-semibold capitalize ${
                  prescriptionFilter === p
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {p === 'All' ? 'All' : p === 'otc' ? 'OTC (No Rx)' : 'Rx Required'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-600">Dosage Form:</span>
            {formsList.map((f) => (
              <button
                key={f}
                onClick={() => updateParam('form', f)}
                className={`px-2.5 py-1 rounded-lg font-semibold ${
                  selectedForm === f
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <div>
          Showing <span className="font-bold text-slate-800">{medicines.length}</span> of{' '}
          <span className="font-bold text-slate-800">{total}</span> medicines
        </div>
        {searchTerm && (
          <div>
            Search keyword: <span className="font-bold text-sky-700">"{searchTerm}"</span>
          </div>
        )}
      </div>

      {/* Medicines Grid */}
      {loading ? (
        <LoadingSpinner text="Searching medicine stocks across pharmacies..." />
      ) : medicines.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {medicines.map((medicine) => (
            <MedicineCard key={medicine._id} medicine={medicine} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300 p-8 space-y-4">
          <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Pill className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">No matching medicines</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your search keywords, clearing filters, or adding a new medicine to the catalog.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* MODAL: ADD NEW MEDICINE TO CATALOG */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-sky-600 to-teal-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Add Medicine to Master Catalog</h3>
                  <p className="text-xs text-sky-100">Automatically lists with price comparison across pharmacies</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Pick from Master Catalog Helper */}
            <div className="px-6 pt-4 pb-1">
              <div className="p-3 rounded-2xl bg-sky-50 border border-sky-100 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-sky-800">
                  <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                  <span>Quick Pick from 45+ Popular Medicines:</span>
                </div>
                <select
                  onChange={(e) => {
                    if (e.target.value) handleTemplateSelect(e.target.value);
                  }}
                  className="w-full mt-1 px-3 py-1.5 rounded-xl border border-sky-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="">-- Click to autofill with a standard medicine (or type below) --</option>
                  {MASTER_MEDICINES_LIST.map((m) => (
                    <option key={m.name} value={m.name}>
                      {m.name} ({m.dosage}) - MRP ₹{m.mrp} [{m.category}]
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateMedicine} className="p-6 pt-3 space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Medicine Brand Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Thyronorm 50mcg"
                    value={newMed.name}
                    onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Generic Salt Composition <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Thyroxine Sodium"
                    value={newMed.genericName}
                    onChange={(e) => setNewMed({ ...newMed, genericName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newMed.category}
                    onChange={(e) => setNewMed({ ...newMed, category: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="Pain Relief & Fever">Pain Relief & Fever</option>
                    <option value="Antibiotics">Antibiotics</option>
                    <option value="Diabetes Care">Diabetes Care</option>
                    <option value="Cardiovascular & BP">Cardiovascular & BP</option>
                    <option value="Gastrointestinal & Antacid">Gastrointestinal & Antacid</option>
                    <option value="Respiratory & Allergy">Respiratory & Allergy</option>
                    <option value="Vitamins & Supplements">Vitamins & Supplements</option>
                    <option value="Dermatology & Skin">Dermatology & Skin</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dosage Strength</label>
                  <input
                    type="text"
                    placeholder="e.g. 50mcg, 500mg"
                    value={newMed.dosage}
                    onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Form</label>
                  <select
                    value={newMed.form}
                    onChange={(e) => setNewMed({ ...newMed, form: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Ointment">Ointment</option>
                    <option value="Drops">Drops</option>
                    <option value="Injection">Injection</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Standard MRP (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 145"
                    value={newMed.mrp}
                    onChange={(e) => setNewMed({ ...newMed, mrp: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Manufacturer</label>
                  <input
                    type="text"
                    placeholder="e.g. Abbott Healthcare"
                    value={newMed.manufacturer}
                    onChange={(e) => setNewMed({ ...newMed, manufacturer: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Short Description</label>
                <input
                  type="text"
                  placeholder="e.g. Synthetic thyroid hormone supplement for hypothyroidism"
                  value={newMed.description}
                  onChange={(e) => setNewMed({ ...newMed, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="rxCheckbox"
                  checked={newMed.prescriptionRequired}
                  onChange={(e) => setNewMed({ ...newMed, prescriptionRequired: e.target.checked })}
                  className="w-4 h-4 text-sky-600 rounded border-slate-300"
                />
                <label htmlFor="rxCheckbox" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Prescription (Rx) Required to purchase this medicine
                </label>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-bold shadow-md shadow-sky-600/20 disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : 'Add Medicine to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicinesPage;
