import React, { useState } from 'react';
import {
  AlertTriangle,
  Lock,
  RotateCcw,
  CheckCircle2,
  X,
  ShieldAlert,
  Trash2,
  Receipt,
  Coins,
  LayoutGrid,
  CalendarDays
} from 'lucide-react';
import { usePos } from '../../context/PosContext';

interface ResetSystemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ResetSystemModal: React.FC<ResetSystemModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { resetSystemToZero, currentUser } = usePos();
  const [adminPin, setAdminPin] = useState('');
  const [resetInventory, setResetInventory] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDone, setIsDone] = useState(false);

  if (!isOpen) return null;

  const handleKeyPress = (num: string) => {
    if (adminPin.length < 4) {
      const next = adminPin + num;
      setAdminPin(next);
      setErrorMsg('');
    }
  };

  const handleBackspace = () => {
    setAdminPin((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleClear = () => {
    setAdminPin('');
    setErrorMsg('');
  };

  const handleReset = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (adminPin.length !== 4) {
      setErrorMsg('Please enter a 4-digit Admin security PIN');
      return;
    }

    const res = resetSystemToZero(adminPin, { resetInventoryStock: resetInventory });
    if (!res.success) {
      setErrorMsg(res.error || 'Invalid Admin PIN. Reset aborted.');
      setAdminPin('');
      return;
    }

    setIsDone(true);
    setTimeout(() => {
      setIsDone(false);
      setAdminPin('');
      onClose();
      if (onSuccess) onSuccess();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-750 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-rose-500/10">
          <div className="flex items-center gap-2.5 text-rose-400">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                Reset System to Zero
              </h2>
              <p className="text-[10px] text-rose-300">
                Admin authorization required
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setAdminPin('');
              setErrorMsg('');
              onClose();
            }}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isDone ? (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">System Reset Complete</h3>
            <p className="text-xs text-slate-300 max-w-xs">
              All sales, orders, cash drawer shift balances, and tables have been reset to 0 UGX successfully.
            </p>
          </div>
        ) : (
          <div className="p-5 space-y-4 overflow-y-auto">
            {/* Warning Box */}
            <div className="p-3.5 bg-rose-950/40 border border-rose-900/60 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center gap-2 text-rose-300 font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>What will be reset to zero:</span>
              </div>
              <ul className="space-y-1.5 text-slate-300 text-[11px] pl-5 list-disc">
                <li>
                  <strong className="text-white">Order History & Sales Ledger:</strong> Cleared to 0 UGX
                </li>
                <li>
                  <strong className="text-white">Cash Drawer Shift:</strong> Opening balance & sales reset to 0 UGX
                </li>
                <li>
                  <strong className="text-white">Expenses & Payouts:</strong> Cleared to 0 UGX
                </li>
                <li>
                  <strong className="text-white">Tables:</strong> All occupied tables returned to available
                </li>
                <li>
                  <strong className="text-white">Active Draft Cart:</strong> Cleared to 0 items
                </li>
              </ul>
              <p className="text-[10px] text-slate-400 pt-1 border-t border-rose-900/40">
                Menu items, recipe catalogs, and staff user logins are safely preserved.
              </p>
            </div>

            {/* Optional Inventory Reset */}
            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 cursor-pointer hover:bg-slate-800 transition-colors">
              <input
                type="checkbox"
                checked={resetInventory}
                onChange={(e) => setResetInventory(e.target.checked)}
                className="w-4 h-4 rounded text-rose-500 bg-slate-900 border-slate-700 focus:ring-rose-500"
              />
              <div className="text-xs">
                <span className="font-semibold text-white">Also reset inventory stock quantities to 0</span>
                <p className="text-[10px] text-slate-400">Sets all ingredient and stock quantities to 0 units</p>
              </div>
            </label>

            {/* PIN Entry Section */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Enter Admin Security PIN:</span>
                </label>
                <span className="text-[10px] text-slate-400">
                  Authorizing: <strong className="text-amber-400">{currentUser?.name}</strong>
                </span>
              </div>

              {/* Masked PIN Indicators */}
              <div className="flex justify-center items-center gap-3 py-2 bg-slate-950/60 border border-slate-800 rounded-2xl">
                {[0, 1, 2, 3].map((idx) => {
                  const filled = adminPin.length > idx;
                  return (
                    <div
                      key={idx}
                      className={`w-4 h-4 rounded-full transition-all duration-150 ${
                        filled
                          ? 'bg-rose-500 shadow-md shadow-rose-500/50 scale-110'
                          : 'bg-slate-800 border border-slate-700'
                      }`}
                    />
                  );
                })}
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-center font-medium">
                  {errorMsg}
                </div>
              )}

              {/* Number Keypad */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handleKeyPress(digit)}
                    className="h-11 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-base font-bold text-white transition-all shadow-sm flex items-center justify-center border border-slate-700/50"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleClear}
                  className="h-11 rounded-xl bg-slate-850 hover:bg-slate-800 text-xs font-semibold text-slate-400 transition-all flex items-center justify-center"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => handleKeyPress('0')}
                  className="h-11 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-base font-bold text-white transition-all shadow-sm flex items-center justify-center border border-slate-700/50"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handleBackspace}
                  className="h-11 rounded-xl bg-slate-850 hover:bg-slate-800 text-xs font-semibold text-slate-400 transition-all flex items-center justify-center"
                >
                  ⌫
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setAdminPin('');
                  setErrorMsg('');
                  onClose();
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={adminPin.length !== 4}
                onClick={() => handleReset()}
                className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg ${
                  adminPin.length === 4
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 cursor-pointer active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Confirm Reset to 0</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
