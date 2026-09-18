import React, { useState } from 'react';
import { usePos } from '../../context/PosContext';
import { Expense, PaymentMethod } from '../../types/pos';
import { formatUGX, formatDateTime } from '../../utils/formatters';
import { exportExpensesToCsv } from '../../utils/exportHelpers';
import {
  WalletCards,
  Plus,
  Download,
  Search,
  Filter,
  Trash2,
  Calendar,
  X,
  CreditCard
} from 'lucide-react';

const EXPENSE_CATEGORIES: Expense['category'][] = [
  'Produce & Market',
  'Beverages & Soft Drinks',
  'Meat & Poultry',
  'Cooking Gas & Charcoal',
  'Utilities & Power',
  'Staff Transport & Allowance',
  'Cleaning & Hygiene',
  'Repairs & Maintenance',
  'Other',
];

export const ExpensesManagement: React.FC = () => {
  const { expenses, addExpense, currentUser } = usePos();
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('50000');
  const [category, setCategory] = useState<Expense['category']>('Produce & Market');
  const [paidVia, setPaidVia] = useState<PaymentMethod>('cash');
  const [recipient, setRecipient] = useState('');
  const [receiptRef, setReceiptRef] = useState('');

  const filteredExpenses = expenses.filter((e) => {
    return selectedCat === 'all' || e.category === selectedCat;
  });

  const totalExpenseUGX = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount) || 0;
    if (num <= 0 || !description.trim()) return;

    addExpense({
      description: description.trim(),
      amount: num,
      category,
      paidVia,
      recipient: recipient.trim() || undefined,
      receiptRef: receiptRef.trim() || undefined,
      loggedBy: currentUser?.name || 'Staff',
      date: new Date().toISOString(),
    });

    setIsAddOpen(false);
    setDescription('');
    setRecipient('');
    setReceiptRef('');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950 text-slate-100 space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <WalletCards className="w-5 h-5 text-amber-400" />
            Restaurant Operating Expenses
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Log market purchases, NWSC water, Umeme electricity, charcoal, and wages in UGX.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportExpensesToCsv(filteredExpenses)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-amber-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Card */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
        <div>
          <div className="text-xs text-slate-400 font-semibold">Total Filtered Expenses</div>
          <div className="text-2xl font-black text-rose-400 font-mono mt-1">
            {formatUGX(totalExpenseUGX)}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">{filteredExpenses.length} expense vouchers logged</div>
        </div>
        <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400">
          <WalletCards className="w-6 h-6" />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setSelectedCat('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            selectedCat === 'all'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          All Categories ({expenses.length})
        </button>
        {EXPENSE_CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedCat(c)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCat === c
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Expenses Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-850 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3.5">Date & Time</th>
                <th className="p-3.5">Description</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Paid Via</th>
                <th className="p-3.5">Authorized By</th>
                <th className="p-3.5">Recipient</th>
                <th className="p-3.5 font-mono">Amount (UGX)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-850/50">
                  <td className="p-3.5 font-mono text-slate-400">
                    {formatDateTime(exp.date)}
                  </td>
                  <td className="p-3.5">
                    <span className="font-bold text-white block">{exp.description}</span>
                    {exp.receiptRef && <span className="text-[10px] text-slate-400 italic">Ref: {exp.receiptRef}</span>}
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
                      {exp.category}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="capitalize font-semibold text-slate-300">
                      {exp.paidVia.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-400">
                    {exp.loggedBy}
                  </td>
                  <td className="p-3.5 text-slate-400">
                    {exp.recipient || '-'}
                  </td>
                  <td className="p-3.5 font-mono font-bold text-rose-400">
                    -{formatUGX(exp.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md bg-slate-900 border border-slate-750 rounded-2xl p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Record Operating Expense</h3>
              <button type="button" onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Expense Description</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. 2 Sacks of Charcoal or Market Veggies"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Amount (UGX)</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl font-mono text-base font-bold text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Expense['category'])}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                >
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Payment Method</label>
                <select
                  value={paidVia}
                  onChange={(e) => setPaidVia(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white capitalize"
                >
                  <option value="cash">Cash (from Drawer Float)</option>
                  <option value="mtn_momo">MTN Mobile Money</option>
                  <option value="airtel_money">Airtel Money</option>
                  <option value="card">Card / POS Terminal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Payee / Recipient (Optional)</label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="e.g. Nakasero Market Vendor"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Receipt Note / Voucher #</label>
                <input
                  type="text"
                  value={receiptRef}
                  onChange={(e) => setReceiptRef(e.target.value)}
                  placeholder="e.g. Voucher #104 signed by chef"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
              >
                Save Expense
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
