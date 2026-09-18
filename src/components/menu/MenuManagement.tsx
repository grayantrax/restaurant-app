import React, { useState } from 'react';
import { usePos } from '../../context/PosContext';
import { MenuItem, MenuCategory } from '../../types/pos';
import { formatUGX } from '../../utils/formatters';
import {
  ClipboardList,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Search,
  X,
  Layers,
  Utensils
} from 'lucide-react';

export const MenuManagement: React.FC = () => {
  const {
    menuItems,
    categories,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleItemAvailability,
  } = usePos();

  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('25000');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cat-1');
  const [isAvailable, setIsAvailable] = useState(true);

  const filteredItems = menuItems.filter((i) => {
    const matchCat = selectedCat === 'all' || i.categoryId === selectedCat;
    const matchQuery =
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  const openNewItem = () => {
    setEditingItem(null);
    setName('');
    setDescription('');
    setPrice('25000');
    setCategoryId(categories[0]?.id || 'cat-1');
    setIsAvailable(true);
    setIsModalOpen(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditingItem(item);
    setName(item.name);
    setDescription(item.description);
    setPrice(String(item.price));
    setCategoryId(item.categoryId);
    setIsAvailable(item.isAvailable);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const numPrice = parseFloat(price) || 0;

    if (editingItem) {
      updateMenuItem({
        ...editingItem,
        name: name.trim(),
        description: description.trim(),
        price: numPrice,
        costPrice: editingItem.costPrice || Math.round(numPrice * 0.4),
        categoryId,
        isAvailable,
        variants: editingItem.variants || [],
        addOns: editingItem.addOns || [],
      });
    } else {
      addMenuItem({
        name: name.trim(),
        description: description.trim(),
        price: numPrice,
        costPrice: Math.round(numPrice * 0.4),
        categoryId,
        isAvailable,
        variants: [],
        addOns: [],
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950 text-slate-100 space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-amber-400" />
            Menu Catalog & Pricing Management
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage food, drink items, UGX pricing, variants, and stock availability toggles.
          </p>
        </div>

        <button
          onClick={openNewItem}
          className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-amber-500/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Menu Item</span>
        </button>
      </div>

      {/* Categories & Search Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedCat('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCat === 'all'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All Items ({menuItems.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCat === cat.id
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="w-56 relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dish or beverage..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
          />
        </div>
      </div>

      {/* Menu Items Table / Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.map((item) => {
          const cat = categories.find((c) => c.id === item.categoryId);
          return (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                item.isAvailable
                  ? 'bg-slate-900 border-slate-800'
                  : 'bg-slate-900/50 border-slate-800/60 opacity-70'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                    {cat?.name || 'Dish'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(item)}
                      className="p-1 text-slate-400 hover:text-white transition-colors"
                      title="Edit Item"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteMenuItem(item.id)}
                      className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Delete Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-sm text-white">{item.name}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-tight">
                  {item.description}
                </p>

                {item.variants && item.variants.length > 0 && (
                  <div className="mt-2 text-[10px] text-slate-400">
                    <span className="font-semibold text-slate-300">Sizes/Variants: </span>
                    {item.variants.map((v) => `${v.name} (${formatUGX(v.price)})`).join(', ')}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Price</div>
                  <div className="font-mono font-extrabold text-sm text-amber-400">
                    {formatUGX(item.price)}
                  </div>
                </div>

                <button
                  onClick={() => toggleItemAvailability(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    item.isAvailable
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  }`}
                  title="Click to toggle In-Stock / Out-of-Stock"
                >
                  {item.isAvailable ? <CheckCircle2 className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{item.isAvailable ? 'In Stock' : 'Out of Stock'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Menu Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md bg-slate-900 border border-slate-750 rounded-2xl p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">
                {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rolex Special (3 Eggs & Chapati)"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Base Price (UGX)</label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl font-mono text-sm text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Short Description / Ingredients</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Fresh Ugandan food description..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="availCheck"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="w-4 h-4 text-amber-500 rounded bg-slate-800 border-slate-700"
                />
                <label htmlFor="availCheck" className="text-xs text-slate-300 font-semibold cursor-pointer">
                  Available in stock for ordering
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
              >
                Save Item
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
