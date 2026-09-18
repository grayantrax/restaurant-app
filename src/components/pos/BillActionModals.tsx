import React, { useState } from 'react';
import { usePos } from '../../context/PosContext';
import { formatUGX } from '../../utils/formatters';
import { X, Percent, DollarSign, Split, Check } from 'lucide-react';

interface DiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DiscountModal: React.FC<DiscountModalProps> = ({ isOpen, onClose }) => {
  const { activeOrder, applyDiscount } = usePos();
  const [discType, setDiscType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState<string>('10');

  if (!isOpen) return null;

  const handleApply = () => {
    const num = parseFloat(value) || 0;
    applyDiscount(discType, num);
    onClose();
  };

  const handleRemove = () => {
    applyDiscount('percentage', 0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Percent className="w-4 h-4 text-amber-400" />
            Apply Bill Discount
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setDiscType('percentage')}
            className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
              discType === 'percentage' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
            }`}
          >
            Percentage (%)
          </button>
          <button
            type="button"
            onClick={() => setDiscType('fixed')}
            className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
              discType === 'fixed' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
            }`}
          >
            Fixed Amount (UGX)
          </button>
        </div>

        {/* Quick Percent Buttons */}
        {discType === 'percentage' && (
          <div className="flex gap-2">
            {[5, 10, 15, 20, 25].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => setValue(String(pct))}
                className={`flex-1 py-1.5 rounded-lg border text-xs font-bold ${
                  value === String(pct)
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>
        )}

        <div>
          <label className="block text-xs text-slate-400 mb-1">
            {discType === 'percentage' ? 'Discount Percentage (%)' : 'Discount Amount (UGX)'}
          </label>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm font-mono font-bold text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex gap-2 pt-2">
          {activeOrder.discountAmount > 0 && (
            <button
              onClick={handleRemove}
              className="flex-1 py-2 text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl"
            >
              Remove
            </button>
          )}
          <button
            onClick={handleApply}
            className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all"
          >
            Apply Discount
          </button>
        </div>
      </div>
    </div>
  );
};

interface SplitEqualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SplitEqualModal: React.FC<SplitEqualModalProps> = ({ isOpen, onClose }) => {
  const { activeOrder } = usePos();
  const [splitWays, setSplitWays] = useState(2);

  if (!isOpen) return null;

  const total = activeOrder.totalAmount;
  const share = Math.round(total / splitWays);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-750 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Split className="w-4 h-4 text-purple-400" />
            Split Bill Calculator
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="text-center py-2 bg-slate-950 rounded-xl border border-slate-800">
          <div className="text-[11px] text-slate-400">Total Bill Amount</div>
          <div className="text-xl font-extrabold text-amber-400 font-mono">{formatUGX(total)}</div>
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1.5 font-semibold">Number of Ways / Guests</label>
          <div className="grid grid-cols-4 gap-2">
            {[2, 3, 4, 5].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setSplitWays(num)}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  splitWays === num
                    ? 'bg-purple-500 text-white border-purple-400 shadow'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                {num} People
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl text-center">
          <div className="text-xs text-purple-300 font-medium">Each Guest Pays:</div>
          <div className="text-2xl font-black text-white font-mono mt-1">{formatUGX(share)}</div>
          <div className="text-[10px] text-slate-400 mt-1">({splitWays} equal shares of {formatUGX(share)})</div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs"
        >
          Close Calculator
        </button>
      </div>
    </div>
  );
};
