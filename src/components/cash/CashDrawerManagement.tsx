import React, { useState } from 'react';
import { usePos } from '../../context/PosContext';
import { formatUGX, formatDateTime } from '../../utils/formatters';
import {
  Coins,
  ArrowUpCircle,
  ArrowDownCircle,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  Plus,
  Minus,
  RefreshCw,
  FileText
} from 'lucide-react';

export const CashDrawerManagement: React.FC = () => {
  const {
    cashShift,
    addCashTx,
    openNewShift,
    closeShift,
    currentUser,
  } = usePos();

  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [moveType, setMoveType] = useState<'cash_in' | 'cash_out'>('cash_in');
  const [moveAmount, setMoveAmount] = useState<string>('20000');
  const [moveReason, setMoveReason] = useState<string>('Float top-up');

  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [actualCountedCash, setActualCountedCash] = useState<string>(
    String(cashShift.expectedCash)
  );
  const [closingNotes, setClosingNotes] = useState('');

  const [isOpenShiftModalOpen, setIsOpenShiftModalOpen] = useState(false);
  const [newShiftFloat, setNewShiftFloat] = useState<string>('200000');

  const handleMoveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(moveAmount) || 0;
    if (amt <= 0) return;

    addCashTx(moveType, amt, moveReason);
    setIsMoveModalOpen(false);
  };

  const handleCloseShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const counted = parseFloat(actualCountedCash) || 0;
    closeShift(counted, closingNotes);
    setIsCloseModalOpen(false);
  };

  const handleOpenNewShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const flt = parseFloat(newShiftFloat) || 0;
    openNewShift(flt);
    setIsOpenShiftModalOpen(false);
  };

  const countedDiff = (parseFloat(actualCountedCash) || 0) - cashShift.expectedCash;

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950 text-slate-100 space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-400" />
            Cash Drawer & Daily Shift Reconciliation
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Opening cash float, pay-ins, petty expenses, and end-of-day cash counting in UGX.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {cashShift.status === 'open' ? (
            <>
              <button
                onClick={() => {
                  setMoveType('cash_in');
                  setMoveReason('Drawer float addition');
                  setIsMoveModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-xl text-xs font-semibold"
              >
                <ArrowUpCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Cash In (Pay-In)</span>
              </button>

              <button
                onClick={() => {
                  setMoveType('cash_out');
                  setMoveReason('Petty cash expense');
                  setIsMoveModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-xl text-xs font-semibold"
              >
                <ArrowDownCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>Cash Out (Expense)</span>
              </button>

              <button
                onClick={() => {
                  setActualCountedCash(String(cashShift.expectedCash));
                  setIsCloseModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-amber-500/20 active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>End Shift & Reconcile</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsOpenShiftModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-500/20 active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Start New Cash Shift</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Shift Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="text-xs text-slate-400 font-semibold">Opening Cash Float</div>
          <div className="text-2xl font-black text-white font-mono mt-1">
            {formatUGX(cashShift.openingCash)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Started: {formatDateTime(cashShift.openedAt)}
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="text-xs text-slate-400 font-semibold">Cash Sales Received</div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
            +{formatUGX(cashShift.cashSalesTotal)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Cash POS transactions this shift
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="text-xs text-slate-400 font-semibold">Pay-Ins / Pay-Outs</div>
          <div className="text-xl font-extrabold text-slate-200 font-mono mt-1">
            +{formatUGX(cashShift.cashInTotal)} / -{formatUGX(cashShift.cashOutTotal)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Manual drawer movements</div>
        </div>

        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
          <div className="text-xs text-amber-300 font-bold uppercase tracking-wider">
            Expected Cash in Drawer
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono mt-1">
            {formatUGX(cashShift.expectedCash)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Shift #{cashShift.shiftNumber} • {cashShift.openedBy}
          </div>
        </div>
      </div>

      {/* Cash Movements Ledger */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            Active Shift Cash Log & Transactions
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {cashShift.transactions.length} logged events
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-850 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3">Time</th>
                <th className="p-3">Type</th>
                <th className="p-3">Reason / Description</th>
                <th className="p-3">Staff</th>
                <th className="p-3 text-right">Amount (UGX)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {cashShift.transactions.map((tx) => {
                const isPositive = tx.type === 'cash_in';
                return (
                  <tr key={tx.id} className="hover:bg-slate-850/50">
                    <td className="p-3 text-slate-400 font-mono">
                      {formatDateTime(tx.timestamp)}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isPositive
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-rose-500/15 text-rose-400'
                        }`}
                      >
                        {tx.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-white">{tx.reason}</td>
                    <td className="p-3 text-slate-400">{tx.staffName}</td>
                    <td
                      className={`p-3 font-mono font-bold text-right ${
                        isPositive ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isPositive ? '+' : '-'}
                      {formatUGX(tx.amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cash In / Out Modal */}
      {isMoveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm">
          <form
            onSubmit={handleMoveSubmit}
            className="w-full max-w-sm bg-slate-900 border border-slate-750 rounded-2xl p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">
                {moveType === 'cash_in' ? 'Drawer Pay-In' : 'Drawer Pay-Out / Expense'}
              </h3>
              <button type="button" onClick={() => setIsMoveModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Amount (UGX)</label>
                <input
                  type="number"
                  required
                  value={moveAmount}
                  onChange={(e) => setMoveAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-base font-mono font-bold text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Reason / Description</label>
                <input
                  type="text"
                  required
                  value={moveReason}
                  onChange={(e) => setMoveReason(e.target.value)}
                  placeholder="e.g. Purchased charcoal / Petty grocery"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsMoveModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-2 font-bold rounded-xl text-xs ${
                  moveType === 'cash_in'
                    ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                    : 'bg-rose-500 text-white hover:bg-rose-400'
                }`}
              >
                Confirm Drawer Movement
              </button>
            </div>
          </form>
        </div>
      )}

      {/* End Shift Reconciliation Modal */}
      {isCloseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm">
          <form
            onSubmit={handleCloseShiftSubmit}
            className="w-full max-w-md bg-slate-900 border border-slate-750 rounded-2xl p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Daily Cash Shift Reconciliation</h3>
              <button type="button" onClick={() => setIsCloseModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Opening Float:</span>
                <span className="font-mono text-white">{formatUGX(cashShift.openingCash)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Cash Sales:</span>
                <span className="font-mono text-emerald-400">+{formatUGX(cashShift.cashSalesTotal)}</span>
              </div>
              <div className="flex justify-between font-bold text-white pt-1 border-t border-slate-800">
                <span>System Expected Cash:</span>
                <span className="font-mono text-amber-400">{formatUGX(cashShift.expectedCash)}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Actual Physical Cash Counted (UGX)
              </label>
              <input
                type="number"
                required
                value={actualCountedCash}
                onChange={(e) => setActualCountedCash(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl font-mono text-lg font-bold text-white"
              />
            </div>

            <div className="p-3 rounded-xl border border-slate-800 bg-slate-850 flex items-center justify-between text-xs font-semibold">
              <span>Discrepancy / Variance:</span>
              <span className={`font-mono font-bold ${countedDiff === 0 ? 'text-emerald-400' : countedDiff > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {countedDiff === 0 ? 'Exact Match (UGX 0)' : countedDiff > 0 ? `+${formatUGX(countedDiff)} (Overage)` : `-${formatUGX(Math.abs(countedDiff))} (Shortage)`}
              </span>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Closing Notes / Observations</label>
              <textarea
                rows={2}
                value={closingNotes}
                onChange={(e) => setClosingNotes(e.target.value)}
                placeholder="e.g. Clean handover to evening shift supervisor"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCloseModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
              >
                Close & Lock Shift
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Start New Shift Modal */}
      {isOpenShiftModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm">
          <form
            onSubmit={handleOpenNewShiftSubmit}
            className="w-full max-w-sm bg-slate-900 border border-slate-750 rounded-2xl p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Open New Cash Shift</h3>
              <button type="button" onClick={() => setIsOpenShiftModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Opening Cash Float (UGX)</label>
              <input
                type="number"
                required
                value={newShiftFloat}
                onChange={(e) => setNewShiftFloat(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-base font-mono font-bold text-white"
              />
              <p className="text-[10px] text-slate-500 mt-1">Starting bills in drawer for giving change.</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsOpenShiftModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs"
              >
                Open Shift
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
