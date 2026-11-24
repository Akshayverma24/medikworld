import React, { useState, useEffect } from 'react';
import { inventoryAPI, reservationAPI, medicineAPI, pharmacyAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MASTER_MEDICINES_LIST } from '../data/masterMedicines';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  LayoutDashboard,
  Boxes,
  CalendarCheck,
  Building2,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Phone,
  Save,
  X,
  Pill,
  Sparkles,
} from 'lucide-react';

const PharmacyDashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'reservations' | 'profile'

  // Data states
  const [inventoryData, setInventoryData] = useState({ pharmacy: null, items: [] });
  const [reservations, setReservations] = useState([]);
  const [allMedicines, setAllMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  // Inventory search & add modal
  const [inventorySearch, setInventorySearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addMode, setAddMode] = useState('catalog'); // 'catalog' | 'custom'

  // Selected or typed medicine state
  const [selectedMedId, setSelectedMedId] = useState('');
  const [selectedMedObj, setSelectedMedObj] = useState(null);
  const [newPrice, setNewPrice] = useState('');
  const [newStock, setNewStock] = useState('25');
  const [isAdding, setIsAdding] = useState(false);

  // Custom medicine fields if adding custom
  const [customMed, setCustomMed] = useState({
    name: '',
    genericName: '',
    category: 'Pain Relief & Fever',
    dosage: '500mg',
    form: 'Tablet',
    manufacturer: 'Standard Pharma',
    mrp: '',
  });

  // Edit item modal
  const [editingItem, setEditingItem] = useState(null);

  // Profile edit form
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    openingHours: '',
    address: '',
    city: '',
    pincode: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invRes, resRes, medsRes] = await Promise.all([
        inventoryAPI.getMy(),
        reservationAPI.getPharmacyReservations(),
        medicineAPI.getAll({ limit: 100 }),
      ]);

      setInventoryData(invRes.data);
      setReservations(resRes.data || []);
      setAllMedicines(medsRes.data.medicines || []);

      if (invRes.data.pharmacy) {
        setProfileForm({
          name: invRes.data.pharmacy.name || '',
          phone: invRes.data.pharmacy.phone || '',
          openingHours: invRes.data.pharmacy.openingHours || '',
          address: invRes.data.pharmacy.address || '',
          city: invRes.data.pharmacy.city || '',
          pincode: invRes.data.pharmacy.pincode || '',
        });
      }
    } catch (err) {
      console.error('Failed to load pharmacy dashboard data:', err);
      toast.error('Could not load pharmacy data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Merge database medicines with master template list so dropdown is NEVER empty!
  const combinedMasterList = React.useMemo(() => {
    const list = [...allMedicines];
    const existingNames = new Set(allMedicines.map((m) => m.name.toLowerCase()));

    MASTER_MEDICINES_LIST.forEach((template, index) => {
      if (!existingNames.has(template.name.toLowerCase())) {
        list.push({
          _id: `template_${index}`,
          ...template,
          isTemplate: true,
        });
      }
    });

    return list;
  }, [allMedicines]);

  // Handle Add Item to Inventory
  const handleAddItem = async (e) => {
    e.preventDefault();

    let payload = {};

    if (addMode === 'catalog') {
      if (!selectedMedObj) {
        toast.error('Please select a medicine from the Master Catalog');
        return;
      }
      if (!newPrice || Number(newPrice) <= 0) {
        toast.error('Please enter a valid selling price');
        return;
      }

      payload = {
        medicineId: selectedMedObj.isTemplate ? undefined : selectedMedObj._id,
        name: selectedMedObj.name,
        genericName: selectedMedObj.genericName,
        category: selectedMedObj.category,
        dosage: selectedMedObj.dosage,
        form: selectedMedObj.form,
        manufacturer: selectedMedObj.manufacturer,
        mrp: selectedMedObj.mrp,
        image: selectedMedObj.image,
        price: Number(newPrice),
        stock: Number(newStock) || 20,
        isAvailable: Number(newStock) > 0,
      };
    } else {
      // Custom mode
      if (!customMed.name.trim() || !customMed.mrp) {
        toast.error('Please enter Medicine Name and MRP');
        return;
      }

      payload = {
        name: customMed.name.trim(),
        genericName: customMed.genericName.trim() || 'Standard Composition',
        category: customMed.category,
        dosage: customMed.dosage || '500mg',
        form: customMed.form || 'Tablet',
        manufacturer: customMed.manufacturer || 'Standard Pharma',
        mrp: Number(customMed.mrp),
        price: Number(newPrice) || Number(customMed.mrp),
        stock: Number(newStock) || 20,
        isAvailable: Number(newStock) > 0,
      };
    }

    setIsAdding(true);
    try {
      await inventoryAPI.upsert(payload);
      toast.success(`${payload.name} added to your inventory!`);
      setIsAddModalOpen(false);
      setSelectedMedId('');
      setSelectedMedObj(null);
      setNewPrice('');
      setNewStock('25');
      setCustomMed({
        name: '',
        genericName: '',
        category: 'Pain Relief & Fever',
        dosage: '500mg',
        form: 'Tablet',
        manufacturer: 'Standard Pharma',
        mrp: '',
      });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add medicine');
    } finally {
      setIsAdding(false);
    }
  };

  // Handle Update Item inline
  const handleSaveEditItem = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      await inventoryAPI.update(editingItem._id, {
        price: Number(editingItem.price),
        stock: Number(editingItem.stock),
        isAvailable: editingItem.isAvailable,
      });
      toast.success('Inventory item updated');
      setEditingItem(null);
      fetchData();
    } catch (err) {
      toast.error('Failed to update item');
    }
  };

  // Handle Delete Item
  const handleDeleteItem = async (id) => {
    if (!window.confirm('Remove this medicine from your listed store inventory?')) return;

    try {
      await inventoryAPI.delete(id);
      toast.success('Medicine removed from inventory');
      fetchData();
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  // Handle Update Reservation Status
  const handleStatusChange = async (reservationId, newStatus) => {
    try {
      await reservationAPI.updateStatus(reservationId, { status: newStatus });
      toast.success(`Reservation status updated to: ${newStatus}`);
      fetchData();
    } catch (err) {
      toast.error('Failed to update reservation status');
    }
  };

  // Handle Update Pharmacy Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!inventoryData.pharmacy) return;

    try {
      await pharmacyAPI.update(inventoryData.pharmacy._id, profileForm);
      toast.success('Pharmacy profile details updated!');
      fetchData();
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner text="Loading pharmacy manager portal..." />
      </div>
    );
  }

  const { pharmacy, items = [] } = inventoryData;

  const lowStockCount = items.filter((i) => i.stock < 10).length;
  const pendingReservationsCount = reservations.filter((r) => r.status === 'Pending').length;

  const filteredItems = items.filter((i) =>
    i.medicine?.name?.toLowerCase().includes(inventorySearch.toLowerCase()) ||
    i.medicine?.genericName?.toLowerCase().includes(inventorySearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Pharmacy Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-300 bg-teal-950/60 px-2.5 py-0.5 rounded-full border border-teal-800/60">
                Partner Store Dashboard
              </span>
              <span className="text-xs text-slate-400">License: {pharmacy?.licenseNumber}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mt-1">{pharmacy?.name}</h1>
            <p className="text-xs text-slate-300 mt-0.5">
              {pharmacy?.address}, {pharmacy?.city} • {pharmacy?.phone}
            </p>
          </div>
        </div>

        {/* Dashboard Stat Counters */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex-1 md:flex-none px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-center">
            <div className="text-2xl font-black text-white">{items.length}</div>
            <div className="text-[11px] text-slate-300 font-medium">In-Store Medicines</div>
          </div>
          <div className="flex-1 md:flex-none px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-center">
            <div className="text-2xl font-black text-amber-400">{lowStockCount}</div>
            <div className="text-[11px] text-slate-300 font-medium">Low Stock (&lt;10)</div>
          </div>
          <div className="flex-1 md:flex-none px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-center">
            <div className="text-2xl font-black text-teal-400">{pendingReservationsCount}</div>
            <div className="text-[11px] text-slate-300 font-medium">New Pickups</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'inventory'
              ? 'border-sky-600 text-sky-700 bg-sky-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Manage Medicine Inventory ({items.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reservations')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all relative ${
            activeTab === 'reservations'
              ? 'border-sky-600 text-sky-700 bg-sky-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Customer Pickup Orders ({reservations.length})</span>
          {pendingReservationsCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'profile'
              ? 'border-sky-600 text-sky-700 bg-sky-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Store Settings</span>
        </button>
      </div>

      {/* TAB 1: INVENTORY MANAGEMENT */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Filter your listed inventory..."
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
              />
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-sky-600/20 transition-all hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Add Medicine to Store</span>
            </button>
          </div>

          {filteredItems.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300 p-8 space-y-3">
              <Boxes className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No medicines in inventory</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Click the "Add Medicine to Store" button above to choose from 45+ master catalog medicines or enter a custom medicine.
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-bold shadow-xs hover:bg-sky-700"
              >
                + Add First Medicine
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3.5 px-4">Medicine Name</th>
                      <th className="py-3.5 px-4">Dosage / Category</th>
                      <th className="py-3.5 px-4">Your Price</th>
                      <th className="py-3.5 px-4">MRP</th>
                      <th className="py-3.5 px-4">Stock Units</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredItems.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-slate-900 block">{item.medicine?.name}</span>
                          <span className="text-[11px] text-slate-400 block">{item.medicine?.genericName}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {item.medicine?.dosage} ({item.medicine?.form})
                          <span className="block text-[11px] text-slate-400">{item.medicine?.category}</span>
                        </td>
                        <td className="py-3.5 px-4 font-black text-sky-700 text-sm">
                          ₹{item.price}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 text-xs line-through">
                          ₹{item.medicine?.mrp}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`font-bold px-2 py-0.5 rounded-md text-xs ${
                              item.stock < 10
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {item.stock} units
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {item.isAvailable && item.stock > 0 ? (
                            <span className="text-teal-700 text-xs font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> In Stock
                            </span>
                          ) : (
                            <span className="text-rose-500 text-xs font-semibold flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" /> Out of stock
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            onClick={() => setEditingItem(item)}
                            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                            title="Edit Price & Stock"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item._id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Remove from store"
                          >
                            <Trash2 className="w-4 h-4" />
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
      )}

      {/* TAB 2: RESERVATIONS / PICKUP ORDERS */}
      {activeTab === 'reservations' && (
        <div className="space-y-4">
          {reservations.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300 p-8">
              <CalendarCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-600">No customer reservations yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Reservations placed by customers for your store will appear here in real-time.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reservations.map((res) => (
                <div
                  key={res._id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-xs text-slate-400">Order ID: #{res._id.slice(-6).toUpperCase()}</span>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5">
                        {res.medicine?.name} ({res.quantity} unit{res.quantity > 1 ? 's' : ''})
                      </h3>
                      <span className="text-xs text-slate-500">
                        Counter Amount to Collect: <strong className="text-sky-700 text-sm">₹{res.totalPrice}</strong>
                      </span>
                    </div>

                    {/* Status updater dropdown */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500">Order Status:</span>
                      <select
                        value={res.status}
                        onChange={(e) => handleStatusChange(res._id, e.target.value)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border focus:outline-none ${
                          res.status === 'Ready for Pickup'
                            ? 'bg-teal-50 border-teal-300 text-teal-800'
                            : res.status === 'Pending'
                            ? 'bg-amber-50 border-amber-300 text-amber-800'
                            : res.status === 'Confirmed'
                            ? 'bg-blue-50 border-blue-300 text-blue-800'
                            : res.status === 'Completed'
                            ? 'bg-slate-100 border-slate-300 text-slate-700'
                            : 'bg-rose-50 border-rose-300 text-rose-800'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Ready for Pickup">Ready for Pickup</option>
                        <option value="Completed">Completed / Picked Up</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                    <div>
                      <span className="font-bold text-slate-700 block">Customer Contact</span>
                      <p>{res.user?.name} ({res.user?.email})</p>
                      <p className="flex items-center gap-1 mt-0.5 text-slate-700 font-semibold">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {res.customerPhone || res.user?.phone || 'Not provided'}
                      </p>
                    </div>

                    <div>
                      <span className="font-bold text-slate-700 block">Customer Pickup Note</span>
                      <p className="italic text-slate-600">{res.pickupNotes || 'None specified'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PHARMACY PROFILE SETTINGS */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 max-w-2xl">
          <h2 className="text-lg font-bold text-slate-900 mb-1">Update Pharmacy Profile</h2>
          <p className="text-xs text-slate-500 mb-6">
            Keep your operating hours and contact details updated for customer walk-ins.
          </p>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Pharmacy Public Name</label>
              <input
                type="text"
                required
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Opening Hours</label>
                <input
                  type="text"
                  required
                  value={profileForm.openingHours}
                  onChange={(e) => setProfileForm({ ...profileForm, openingHours: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Street Address</label>
              <input
                type="text"
                required
                value={profileForm.address}
                onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  required
                  value={profileForm.city}
                  onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pincode</label>
                <input
                  type="text"
                  required
                  value={profileForm.pincode}
                  onChange={(e) => setProfileForm({ ...profileForm, pincode: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-4 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </form>
        </div>
      )}

      {/* COMPREHENSIVE MODAL: ADD MEDICINE TO INVENTORY */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Add Medicine to Store</h3>
                  <p className="text-[11px] text-slate-400">Choose from Master Catalog or enter custom details</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Selector Tabs */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setAddMode('catalog')}
                className={`py-2 rounded-lg transition-all ${
                  addMode === 'catalog'
                    ? 'bg-white text-sky-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Choose Master Catalog ({combinedMasterList.length})
              </button>
              <button
                type="button"
                onClick={() => setAddMode('custom')}
                className={`py-2 rounded-lg transition-all ${
                  addMode === 'custom'
                    ? 'bg-white text-sky-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Enter Custom Medicine
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4 text-xs sm:text-sm">
              {addMode === 'catalog' ? (
                <>
                  {/* Master Catalog Dropdown */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Select from Master Catalog List ({combinedMasterList.length} items available)
                    </label>
                    <select
                      required
                      value={selectedMedId}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedMedId(val);
                        const selected = combinedMasterList.find((m) => (m._id || m.name) === val);
                        if (selected) {
                          setSelectedMedObj(selected);
                          // Default selling price is ~10% off MRP
                          const discounted = Math.max(5, Math.round(selected.mrp * 0.9));
                          setNewPrice(discounted.toString());
                        }
                      }}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                    >
                      <option value="">-- Choose from Master Catalog ({combinedMasterList.length} Medicines) --</option>
                      {combinedMasterList.map((m) => (
                        <option key={m._id || m.name} value={m._id || m.name}>
                          {m.name} ({m.dosage}) - MRP ₹{m.mrp} [{m.category}]
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Summary of Selected Medicine */}
                  {selectedMedObj && (
                    <div className="p-3.5 rounded-2xl bg-sky-50/80 border border-sky-100 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">{selectedMedObj.name}</span>
                        <span className="text-xs font-extrabold text-slate-700">MRP: ₹{selectedMedObj.mrp}</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Salt: {selectedMedObj.genericName} • {selectedMedObj.dosage} ({selectedMedObj.form})
                      </p>
                      <p className="text-[11px] text-slate-400">Category: {selectedMedObj.category}</p>
                    </div>
                  )}
                </>
              ) : (
                /* Custom Medicine Entry Mode */
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Brand Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Thyronorm 50mcg"
                        value={customMed.name}
                        onChange={(e) => setCustomMed({ ...customMed, name: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Generic Salt</label>
                      <input
                        type="text"
                        placeholder="e.g. Thyroxine Sodium"
                        value={customMed.genericName}
                        onChange={(e) => setCustomMed({ ...customMed, genericName: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Category</label>
                      <select
                        value={customMed.category}
                        onChange={(e) => setCustomMed({ ...customMed, category: e.target.value })}
                        className="w-full px-2 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                      >
                        <option value="Pain Relief & Fever">Pain Relief</option>
                        <option value="Antibiotics">Antibiotics</option>
                        <option value="Diabetes Care">Diabetes</option>
                        <option value="Cardiovascular & BP">Cardiac/BP</option>
                        <option value="Gastrointestinal & Antacid">Acidity/Digestion</option>
                        <option value="Respiratory & Allergy">Respiratory</option>
                        <option value="Vitamins & Supplements">Vitamins</option>
                        <option value="Dermatology & Skin">Skin Care</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Dosage</label>
                      <input
                        type="text"
                        placeholder="e.g. 50mcg"
                        value={customMed.dosage}
                        onChange={(e) => setCustomMed({ ...customMed, dosage: e.target.value })}
                        className="w-full px-2 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Standard MRP (₹)</label>
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="e.g. 150"
                        value={customMed.mrp}
                        onChange={(e) => {
                          setCustomMed({ ...customMed, mrp: e.target.value });
                          if (!newPrice) setNewPrice(e.target.value);
                        }}
                        className="w-full px-2 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Price and Stock Inputs */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Your Counter Price (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 30"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-bold text-sky-800"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Price patients pay at counter</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Available Stock (Units)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-bold"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Units available for reservation</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-bold shadow-md shadow-sky-600/20 disabled:opacity-50"
                >
                  {isAdding ? 'Adding to Store...' : 'Add to Inventory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT INVENTORY ITEM */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Edit {editingItem.medicine?.name}
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditItem} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Selling Price (₹)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={editingItem.price}
                  onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-bold text-sky-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Stock Count (Units)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={editingItem.stock}
                  onChange={(e) => setEditingItem({ ...editingItem, stock: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 font-bold"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="availCheck"
                  checked={editingItem.isAvailable}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, isAvailable: e.target.checked })
                  }
                  className="w-4 h-4 text-sky-600 rounded border-slate-300"
                />
                <label htmlFor="availCheck" className="text-xs font-semibold text-slate-700">
                  Visible & Available for customer reservation
                </label>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacyDashboardPage;
