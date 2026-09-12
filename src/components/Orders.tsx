'use client';

import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Package, Search, Plus, Trash2, Edit3, X, Filter } from 'lucide-react';
import { Order, PriorityLevel } from '../types';

export default function Orders() {
  const orders = useStore((state) => state.orders);
  const addOrder = useStore((state) => state.addOrder);
  const deleteOrder = useStore((state) => state.deleteOrder);
  const vehicles = useStore((state) => state.vehicles);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Form State
  const [showCreate, setShowCreate] = useState(false);
  const [customer, setCustomer] = useState('');
  const [pickup, setPickup] = useState('Police Bazar');
  const [destination, setDestination] = useState('NEHU');
  const [priority, setPriority] = useState<PriorityLevel>('Normal');
  const [weight, setWeight] = useState(150);
  const [timeWindow, setTimeWindow] = useState('09:00 - 13:00');
  const [requirements, setRequirements] = useState<string[]>([]);

  const landmarksList = [
    'Police Bazar', 'Laitumkhrah', 'Mawlai', 'Nongthymmai', 
    'Upper Shillong', 'NEHU', 'Shillong Peak', 'Polo', 
    'Malki', 'Laban', 'Rynjah', 'Umpling', 'Bara Bazar / Iewduh', 
    'Civil Hospital Shillong', 'Ward\'s Lake', 'Golf Links', 'Mawpat'
  ];

  const accessibilityOptions = [
    'Wheelchair Accessible', 'Avoid Stairs', 'Avoid Very Steep Sections', 
    'Accessible Destination Required', 'Avoid Poor Surface', 'Avoid Narrow Route', 
    'Low-Floor Vehicle Required'
  ];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.trim()) {
      alert('Please enter a customer name.');
      return;
    }

    const getLandmarkCoords = (name: string) => {
      const mappings: Record<string, { lat: number; lng: number }> = {
        'Police Bazar': { lat: 25.5732, lng: 91.8821 },
        'Laitumkhrah': { lat: 25.5684, lng: 91.8988 },
        'Mawlai': { lat: 25.5991, lng: 91.8762 },
        'Nongthymmai': { lat: 25.5587, lng: 91.9080 },
        'Upper Shillong': { lat: 25.5392, lng: 91.8493 },
        'NEHU': { lat: 25.6125, lng: 91.8996 },
        'Shillong Peak': { lat: 25.5316, lng: 91.8654 },
        'Polo': { lat: 25.5831, lng: 91.8879 },
        'Malki': { lat: 25.5612, lng: 91.8875 },
        'Laban': { lat: 25.5583, lng: 91.8741 },
        'Rynjah': { lat: 25.5709, lng: 91.9213 },
        'Umpling': { lat: 25.5802, lng: 91.9234 },
        'Bara Bazar / Iewduh': { lat: 25.5721, lng: 91.8752 },
        'Civil Hospital Shillong': { lat: 25.5653, lng: 91.8795 },
        'Ward\'s Lake': { lat: 25.5714, lng: 91.8856 },
        'Golf Links': { lat: 25.5888, lng: 91.8967 },
        'Mawpat': { lat: 25.6022, lng: 91.9189 }
      };
      return mappings[name] || { lat: 25.5788, lng: 91.8833 };
    };

    addOrder({
      customer,
      pickup,
      pickupCoords: getLandmarkCoords(pickup),
      destination,
      destinationCoords: getLandmarkCoords(destination),
      priority,
      weight,
      timeWindow,
      accessibilityRequirements: requirements
    });

    // Reset Form
    setCustomer('');
    setRequirements([]);
    setShowCreate(false);
    alert('Order created successfully and added to pending dispatch queue.');
  };

  const handleReqsToggle = (opt: string) => {
    setRequirements((prev) => 
      prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]
    );
  };

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch = 
      o.id.toLowerCase().includes(search.toLowerCase()) || 
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.pickup.toLowerCase().includes(search.toLowerCase()) ||
      o.destination.toLowerCase().includes(search.toLowerCase());
    
    const matchesPriority = priorityFilter === 'All' || o.priority === priorityFilter;
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6 p-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Order Management</h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Create, manage, and audit logistics deliveries within the Shillong regional network
          </p>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-600/15 transition duration-150"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>New Delivery Order</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders by ID, client, or site..." 
            className="w-full pl-9 pr-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 bg-slate-50"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <Filter className="h-4 w-4" />
            <span>Filters:</span>
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs font-semibold rounded-lg border-slate-300 py-1.5 px-3 bg-slate-50"
          >
            <option value="All">All Priorities</option>
            <option value="Normal">Normal</option>
            <option value="High">High</option>
            <option value="Emergency">Emergency</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold rounded-lg border-slate-300 py-1.5 px-3 bg-slate-50"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Assigned">Assigned</option>
            <option value="En Route">En Route</option>
            <option value="Delayed">Delayed</option>
            <option value="Rerouting">Rerouting</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>
      </div>

      {/* Orders Grid/List */}
      <div className="bg-white border border-slate-200/80 shadow-sm rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Pickup / Destination</th>
                <th className="p-4">Weight & Priority</th>
                <th className="p-4">Accessibility Profile</th>
                <th className="p-4">Vehicle & ETA</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 font-bold">
                    No orders matching search filters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const assignedVehicle = vehicles.find((v) => v.id === ord.assignedVehicleId);

                  let priorityColor = 'bg-slate-100 text-slate-700';
                  if (ord.priority === 'High') priorityColor = 'bg-amber-100 text-amber-800';
                  else if (ord.priority === 'Emergency') priorityColor = 'bg-rose-100 text-rose-800';

                  let statusColor = 'bg-slate-100 text-slate-700';
                  if (ord.status === 'Assigned') statusColor = 'bg-blue-100 text-blue-800';
                  else if (ord.status === 'En Route') statusColor = 'bg-indigo-100 text-indigo-800';
                  else if (ord.status === 'Delayed') statusColor = 'bg-red-100 text-red-800';
                  else if (ord.status === 'Rerouting') statusColor = 'bg-purple-100 text-purple-800';
                  else if (ord.status === 'Delivered') statusColor = 'bg-emerald-100 text-emerald-800';

                  return (
                    <tr key={ord.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-extrabold text-slate-900">{ord.id}</td>
                      <td className="p-4">{ord.customer}</td>
                      <td className="p-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-slate-500 font-bold">P: {ord.pickup}</span>
                          <span className="text-slate-950">D: {ord.destination}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span>{ord.weight} kg</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${priorityColor}`}>
                            {ord.priority}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1 max-w-44">
                          {ord.accessibilityRequirements.map((r, i) => (
                            <span key={i} className="text-[9px] bg-slate-100 text-slate-600 border rounded px-1.5 py-0.5 font-bold">
                              {r}
                            </span>
                          ))}
                          {ord.accessibilityRequirements.length === 0 && (
                            <span className="text-slate-400">None</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        {assignedVehicle ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-slate-900 font-bold">{assignedVehicle.name}</span>
                            <span className="text-slate-400 text-[10px] font-medium">ETA: {ord.eta} mins</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-medium">Unassigned</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] font-bold border px-2 py-0.5 rounded-full ${statusColor}`}>
                          {ord.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-1.5">
                          <button
                            onClick={() => {
                              useStore.setState({ selectedOrder: ord, activeTab: 'routing' });
                            }}
                            className="p-1 hover:bg-indigo-50 rounded text-indigo-600 transition"
                            title="Optimize Route"
                          >
                            <Plus className="h-4.5 w-4.5" />
                          </button>
                          <button
                            onClick={() => deleteOrder(ord.id)}
                            className="p-1 hover:bg-rose-50 rounded text-rose-600 transition"
                            title="Delete Order"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Order Drawer/Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateSubmit} className="bg-white rounded-xl border max-w-lg w-full p-5 shadow-2xl relative flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-extrabold text-sm text-slate-950 flex items-center gap-2">
                <Package className="h-4.5 w-4.5 text-indigo-500" />
                <span>Create New Delivery Request</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setShowCreate(false)}
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Customer / Consignee</label>
                <input 
                  type="text"
                  required
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  placeholder="e.g. Shillong General Hospital" 
                  className="w-full text-xs font-semibold rounded border-slate-300 py-1.5 px-2 bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Pickup Landmark</label>
                  <select 
                    value={pickup} 
                    onChange={(e) => setPickup(e.target.value)}
                    className="w-full text-xs font-semibold rounded border-slate-300 py-1.5 px-2 bg-slate-50"
                  >
                    {landmarksList.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Destination Landmark</label>
                  <select 
                    value={destination} 
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full text-xs font-semibold rounded border-slate-300 py-1.5 px-2 bg-slate-50"
                  >
                    {landmarksList.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Priority</label>
                  <select 
                    value={priority} 
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full text-xs font-semibold rounded border-slate-300 py-1.5 px-2 bg-slate-50"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Weight (kg)</label>
                  <input 
                    type="number" 
                    min="1"
                    value={weight}
                    onChange={(e) => setWeight(parseInt(e.target.value) || 0)}
                    className="w-full text-xs font-semibold rounded border-slate-300 py-1.5 px-2 bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Delivery Time Window</label>
                <input 
                  type="text"
                  value={timeWindow}
                  onChange={(e) => setTimeWindow(e.target.value)}
                  placeholder="e.g. 09:00 - 13:00" 
                  className="w-full text-xs font-semibold rounded border-slate-300 py-1.5 px-2 bg-slate-50"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Accessibility Profile Constraints</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  {accessibilityOptions.map((opt) => (
                    <label key={opt} className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={requirements.includes(opt)}
                        onChange={() => handleReqsToggle(opt)}
                        className="accent-indigo-600 rounded border-slate-300"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t pt-3 flex justify-end gap-2 text-xs font-bold">
              <button 
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-3.5 py-1.5 border hover:bg-slate-50 text-slate-500 rounded-lg"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow"
              >
                Create Request
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
