import React, { useState } from 'react';
import { usePos } from '../../context/PosContext';
import { InventoryItem, Supplier } from '../../types/pos';
import { formatUGX } from '../../utils/formatters';
import { exportInventoryToCsv } from '../../utils/exportHelpers';
import {
  Package,
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  Trash2,
  Plus,
  Search,
  Download,
  Truck,
  Layers,
  X,
  Check
} from 'lucide-react';

export const InventoryManagement: React.FC = () => {
  const {
    inventory,
    suppliers,
    menuItems,
    adjustInventory,
    addInventoryItem,
    addSupplier
  } = usePos();

  const [activeTab, setActiveTab] = useState<'stock' | 'recipes' | 'suppliers'>('stock');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemForAdjust, setSelectedItemForAdjust] = useState<InventoryItem | null>(null);
  const [adjustType, setAdjustType] = useState<'stock_in' | 'stock_out' | 'wastage'>('stock_in');
  const [adjustQty, setAdjustQty] = useState<string>('5');
  const [adjustReason, setAdjustReason] = useState<string>('Restock from local market');

  // New item modal
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemSku, setNewItemSku] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Produce');
  const [newItemUnit, setNewItemUnit] = useState<InventoryItem['unit']>('kg');
  const [newItemCurrentStock, setNewItemCurrentStock] = useState('20');
  const [newItemMinStock, setNewItemMinStock] = useState('5');
  const [newItemUnitCost, setNewItemUnitCost] = useState('5000');
  const [newItemSupplierId, setNewItemSupplierId] = useState('');

  // New Supplier modal
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [newSupName, setNewSupName] = useState('');
  const [newSupContact, setNewSupContact] = useState('');
  const [newSupPhone, setNewSupPhone] = useState('+256 ');
  const [newSupEmail, setNewSupEmail] = useState('');
  const [newSupAddress, setNewSupAddress] = useState('Kampala');

  const filteredInventory = inventory.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockCount = inventory.filter((i) => i.currentStock <= i.minStockLevel).length;
  const totalStockValuation = inventory.reduce((acc, i) => acc + i.currentStock * i.unitCost, 0);

  const handleApplyAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForAdjust) return;
    const num = parseFloat(adjustQty) || 0;
    if (num <= 0) return;

    adjustInventory(selectedItemForAdjust.id, adjustType, num, adjustReason);
    setSelectedItemForAdjust(null);
  };

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const supplierObj = suppliers.find((s) => s.id === newItemSupplierId);

    addInventoryItem({
      name: newItemName.trim(),
      sku: newItemSku.trim() || `SKU-${Date.now().toString().slice(-4)}`,
      category: newItemCategory,
      unit: newItemUnit,
      currentStock: parseFloat(newItemCurrentStock) || 0,
      minStockLevel: parseFloat(newItemMinStock) || 5,
      unitCost: parseFloat(newItemUnitCost) || 0,
      supplierId: newItemSupplierId || undefined,
      supplierName: supplierObj?.name,
      lastRestocked: new Date().toISOString(),
    });

    setIsAddItemOpen(false);
    setNewItemName('');
  };

  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupName.trim()) return;

    addSupplier({
      name: newSupName.trim(),
      contactPerson: newSupContact.trim(),
      phone: newSupPhone.trim(),
      email: newSupEmail.trim(),
      address: newSupAddress.trim(),
      supplyingItems: [],
    });

    setIsAddSupplierOpen(false);
    setNewSupName('');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950 text-slate-100 space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-400" />
            Inventory & Ingredient Recipe Deduction
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Track stock levels, suppliers, and automatic deduction when meals are sold at the POS.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportInventoryToCsv(inventory)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsAddItemOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-amber-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Stock Item</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold">Total Stock Valuation</div>
            <div className="text-xl font-extrabold text-amber-400 font-mono mt-0.5">
              {formatUGX(totalStockValuation)}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">{inventory.length} tracked ingredients & items</div>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold">Low Stock Warnings</div>
            <div className={`text-xl font-extrabold font-mono mt-0.5 ${lowStockCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {lowStockCount} Items
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Below minimum safety threshold</div>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold">Approved Suppliers</div>
            <div className="text-xl font-extrabold text-white font-mono mt-0.5">
              {suppliers.length} Vendors
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Nakasero, Kalerwe, Ggaba, UBL</div>
          </div>
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400">
            <Truck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs w-fit">
        <button
          onClick={() => setActiveTab('stock')}
          className={`px-4 py-1.5 rounded-lg font-bold transition-all ${
            activeTab === 'stock' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Stock Items & Alerts
        </button>
        <button
          onClick={() => setActiveTab('recipes')}
          className={`px-4 py-1.5 rounded-lg font-bold transition-all ${
            activeTab === 'recipes' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Menu Recipe Links ({menuItems.filter((m) => m.ingredients && m.ingredients.length > 0).length})
        </button>
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-4 py-1.5 rounded-lg font-bold transition-all ${
            activeTab === 'suppliers' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Suppliers Directory ({suppliers.length})
        </button>
      </div>

      {/* TAB 1: Stock Items Table */}
      {activeTab === 'stock' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="w-full max-w-xs relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search stock by name or SKU..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
              />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-850 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">SKU & Item Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Current Stock</th>
                    <th className="p-3">Min Alert Level</th>
                    <th className="p-3">Unit Cost (UGX)</th>
                    <th className="p-3">Total Value</th>
                    <th className="p-3">Supplier</th>
                    <th className="p-3 text-right">Quick Stock Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredInventory.map((item) => {
                    const isLow = item.currentStock <= item.minStockLevel;
                    return (
                      <tr key={item.id} className="hover:bg-slate-850/60 transition-colors">
                        <td className="p-3">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            {item.name}
                            {isLow && (
                              <span className="px-1.5 py-0.2 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded text-[9px] font-bold">
                                LOW
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">{item.sku}</span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px]">
                            {item.category}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`font-mono font-extrabold text-sm ${isLow ? 'text-rose-400' : 'text-white'}`}>
                            {item.currentStock} {item.unit}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400 font-mono">
                          {item.minStockLevel} {item.unit}
                        </td>
                        <td className="p-3 font-mono">
                          {formatUGX(item.unitCost)}
                        </td>
                        <td className="p-3 font-mono font-bold text-amber-400">
                          {formatUGX(item.currentStock * item.unitCost)}
                        </td>
                        <td className="p-3 text-slate-400">
                          {item.supplierName || '—'}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedItemForAdjust(item);
                                setAdjustType('stock_in');
                                setAdjustReason('Supplier Restock');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold transition-colors"
                            >
                              + In
                            </button>
                            <button
                              onClick={() => {
                                setSelectedItemForAdjust(item);
                                setAdjustType('wastage');
                                setAdjustReason('Spoilage / Kitchen Damaged');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[11px] font-bold transition-colors"
                            >
                              Wastage
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Automatic Recipe / Ingredient Deductions */}
      {activeTab === 'recipes' && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-300">
            <span className="font-bold">How Automatic Recipe Deduction Works:</span> Whenever an order is completed at the POS checkout, JOJO FOODIES automatically deducts the required ingredient quantities from your inventory records in real time.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {menuItems
              .filter((m) => m.ingredients && m.ingredients.length > 0)
              .map((item) => (
                <div key={item.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-sm text-white">{item.name}</span>
                    <span className="font-mono text-xs text-amber-400 font-bold">{formatUGX(item.price)}</span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Ingredients Deducted per Sale:</div>
                    {item.ingredients?.map((ing, idx) => {
                      const invItem = inventory.find((i) => i.id === ing.ingredientId);
                      return (
                        <div key={idx} className="flex items-center justify-between text-xs bg-slate-850 p-2 rounded-lg">
                          <span className="font-medium text-slate-200">{invItem?.name || ing.ingredientId}</span>
                          <span className="font-mono font-bold text-amber-300">
                            {ing.quantityNeeded} {invItem?.unit || 'units'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 3: Suppliers Directory */}
      {activeTab === 'suppliers' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setIsAddSupplierOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Supplier</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suppliers.map((sup) => (
              <div key={sup.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-white">{sup.name}</h3>
                    <p className="text-xs text-slate-400">Contact: {sup.contactPerson}</p>
                  </div>
                  <span className="p-2 rounded-xl bg-slate-800 text-sky-400">
                    <Truck className="w-4 h-4" />
                  </span>
                </div>

                <div className="text-xs space-y-1 text-slate-300 pt-1">
                  <div>Phone: <span className="font-mono text-white">{sup.phone}</span></div>
                  <div>Email: <span className="text-slate-400">{sup.email}</span></div>
                  <div>Location: <span className="text-slate-400">{sup.address}</span></div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-1">
                  {sup.supplyingItems?.map((tag, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stock In / Wastage Modal */}
      {selectedItemForAdjust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm">
          <form
            onSubmit={handleApplyAdjustment}
            className="w-full max-w-sm bg-slate-900 border border-slate-750 rounded-2xl p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">
                  {adjustType === 'stock_in' ? 'Stock In / Restock' : 'Log Wastage & Spoilage'}
                </h3>
                <p className="text-xs text-slate-400">{selectedItemForAdjust.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItemForAdjust(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Adjustment Quantity ({selectedItemForAdjust.unit})
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.1"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm font-mono font-bold text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Reason / Note</label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Daily market purchase or Expired item"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedItemForAdjust(null)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-2 font-bold rounded-xl text-xs ${
                  adjustType === 'stock_in'
                    ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                    : 'bg-rose-500 text-white hover:bg-rose-400'
                }`}
              >
                Save Adjustment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Stock Item Modal */}
      {isAddItemOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm">
          <form
            onSubmit={handleCreateItem}
            className="w-full max-w-md bg-slate-900 border border-slate-750 rounded-2xl p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Add New Inventory Item</h3>
              <button type="button" onClick={() => setIsAddItemOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g. Cooking Oil (Mukwano)"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">SKU Code</label>
                  <input
                    type="text"
                    value={newItemSku}
                    onChange={(e) => setNewItemSku(e.target.value)}
                    placeholder="OIL-01"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Unit</label>
                  <select
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  >
                    <option value="kg">kg</option>
                    <option value="liters">liters</option>
                    <option value="bottles">bottles</option>
                    <option value="portions">portions</option>
                    <option value="packs">packs</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Current Stock</label>
                  <input
                    type="number"
                    value={newItemCurrentStock}
                    onChange={(e) => setNewItemCurrentStock(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Min Alert Level</label>
                  <input
                    type="number"
                    value={newItemMinStock}
                    onChange={(e) => setNewItemMinStock(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Cost (UGX)</label>
                  <input
                    type="number"
                    value={newItemUnitCost}
                    onChange={(e) => setNewItemUnitCost(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Supplier</label>
                <select
                  value={newItemSupplierId}
                  onChange={(e) => setNewItemSupplierId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                >
                  <option value="">None / Direct Market</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddItemOpen(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
              >
                Save Stock Item
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Supplier Modal */}
      {isAddSupplierOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm">
          <form
            onSubmit={handleCreateSupplier}
            className="w-full max-w-sm bg-slate-900 border border-slate-750 rounded-2xl p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Add New Supplier</h3>
              <button type="button" onClick={() => setIsAddSupplierOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Company / Vendor Name</label>
                <input
                  type="text"
                  required
                  value={newSupName}
                  onChange={(e) => setNewSupName(e.target.value)}
                  placeholder="e.g. Kasubi Butchery Ltd"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Contact Person</label>
                <input
                  type="text"
                  value={newSupContact}
                  onChange={(e) => setNewSupContact(e.target.value)}
                  placeholder="Mzee Kato"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={newSupPhone}
                  onChange={(e) => setNewSupPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddSupplierOpen(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
              >
                Save Supplier
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
