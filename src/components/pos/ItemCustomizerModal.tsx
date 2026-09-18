import React, { useState } from 'react';
import { MenuItem, ItemVariant, AddOnOption } from '../../types/pos';
import { formatUGX } from '../../utils/formatters';
import { X, Plus, Check } from 'lucide-react';

interface ItemCustomizerModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (item: MenuItem, variant?: ItemVariant, addOns?: AddOnOption[], notes?: string) => void;
}

export const ItemCustomizerModal: React.FC<ItemCustomizerModalProps> = ({
  item,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !item) return null;

  const [selectedVariant, setSelectedVariant] = useState<ItemVariant | undefined>(
    item.variants && item.variants.length > 0 ? item.variants[0] : undefined
  );
  const [selectedAddOns, setSelectedAddOns] = useState<AddOnOption[]>([]);
  const [notes, setNotes] = useState('');

  const toggleAddOn = (addon: AddOnOption) => {
    if (selectedAddOns.some((a) => a.id === addon.id)) {
      setSelectedAddOns((prev) => prev.filter((a) => a.id !== addon.id));
    } else {
      setSelectedAddOns((prev) => [...prev, addon]);
    }
  };

  const basePrice = selectedVariant ? selectedVariant.price : item.price;
  const addOnsTotal = selectedAddOns.reduce((sum, a) => sum + a.price, 0);
  const totalPrice = basePrice + addOnsTotal;

  const handleAdd = () => {
    onConfirm(item, selectedVariant, selectedAddOns, notes.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-850 border-b border-slate-750">
          <div>
            <h3 className="text-base font-bold text-white">{item.name}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{item.description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Variants / Portions */}
          {item.variants && item.variants.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                Select Size / Portion (Required)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {item.variants.map((v) => {
                  const isSelected = selectedVariant?.id === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariant(v)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500 text-white font-bold shadow'
                          : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-xs">{v.name}</span>
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {formatUGX(v.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add-ons / Modifiers */}
          {item.addOns && item.addOns.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                Optional Extras & Add-ons
              </label>
              <div className="space-y-2">
                {item.addOns.map((addon) => {
                  const isSelected = selectedAddOns.some((a) => a.id === addon.id);
                  return (
                    <button
                      key={addon.id}
                      type="button"
                      onClick={() => toggleAddOn(addon)}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500 text-white font-semibold'
                          : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-xs border ${
                            isSelected
                              ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold'
                              : 'border-slate-600 bg-slate-900'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span className="text-xs">{addon.name}</span>
                      </div>
                      <span className="text-xs font-mono text-amber-400">
                        +{formatUGX(addon.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Kitchen Preparation Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Special Kitchen Note (e.g. Mild chili, no onions, extra crispy)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Serve hot, pepper on the side..."
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-850 border-t border-slate-750 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Item Price</div>
            <div className="text-lg font-extrabold text-amber-400 font-mono">
              {formatUGX(totalPrice)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 text-xs transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Add to Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
