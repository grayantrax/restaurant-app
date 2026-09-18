import React, { useState } from 'react';
import { usePos } from '../../context/PosContext';
import { Reservation, Customer, CustomerAccountTransaction } from '../../types/pos';
import { formatUGX, formatDateTime } from '../../utils/formatters';
import {
  CalendarDays,
  Users,
  Plus,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Star,
  Receipt,
  X,
  Wallet,
  Building,
  History,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign
} from 'lucide-react';

export const ReservationsAndCustomers: React.FC = () => {
  const {
    reservations,
    customers,
    tables,
    addReservation,
    updateReservationStatus,
    addCustomer,
    updateCustomer,
    topUpComplementaryAccount,
  } = usePos();

  const [activeTab, setActiveTab] = useState<'reservations' | 'customers'>('reservations');
  const [customerFilter, setCustomerFilter] = useState<'all' | 'complementary' | 'regular'>('all');
  const [isResModalOpen, setIsResModalOpen] = useState(false);
  const [isCustModalOpen, setIsCustModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // History ledger modal state
  const [selectedHistoryCustomer, setSelectedHistoryCustomer] = useState<Customer | null>(null);

  // Top Up modal state
  const [topUpCustomer, setTopUpCustomer] = useState<Customer | null>(null);
  const [topUpAmount, setTopUpAmount] = useState('50000');
  const [topUpNotes, setTopUpNotes] = useState('Account balance top-up');

  // Reservation form
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('+256 ');
  const [guestCount, setGuestCount] = useState(4);
  const [resDate, setResDate] = useState(new Date().toISOString().split('T')[0]);
  const [resTime, setResTime] = useState('19:30');
  const [selectedTableId, setSelectedTableId] = useState(tables[0]?.id || 't-1');
  const [notes, setNotes] = useState('');

  // Customer form
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('+256 ');
  const [custEmail, setCustEmail] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [isCompAccount, setIsCompAccount] = useState(false);
  const [compBalance, setCompBalance] = useState('100000');
  const [compCreditLimit, setCompCreditLimit] = useState('0');
  const [compAffiliation, setCompAffiliation] = useState('');

  const handleCreateReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) return;

    const tableObj = tables.find((t) => t.id === selectedTableId) || tables[0];

    addReservation({
      customerName: customerName.trim(),
      customerPhone: phone.trim(),
      guestCount,
      dateTime: `${resDate}T${resTime}:00`,
      tableId: tableObj.id,
      tableName: tableObj.name,
      status: 'confirmed',
      notes: notes.trim() || undefined,
    });

    setIsResModalOpen(false);
    setCustomerName('');
    setNotes('');
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim()) return;

    const initialBal = isCompAccount ? parseFloat(compBalance) || 0 : undefined;
    const initialHistory: CustomerAccountTransaction[] = (isCompAccount && initialBal && initialBal > 0)
      ? [
          {
            id: 'tx-' + Date.now(),
            date: new Date().toISOString(),
            type: 'top_up',
            amount: initialBal,
            balanceAfter: initialBal,
            notes: 'Initial account balance upon registration',
            recordedBy: 'Admin',
          },
        ]
      : [];

    addCustomer({
      name: custName.trim(),
      phone: custPhone.trim(),
      email: custEmail.trim() || undefined,
      address: custAddress.trim() || undefined,
      notes: isCompAccount ? 'Complementary House Account' : 'Registered customer profile',
      isComplementaryAccount: isCompAccount,
      accountBalance: initialBal,
      accountCreditLimit: isCompAccount ? parseFloat(compCreditLimit) || 0 : undefined,
      accountStatus: isCompAccount ? 'active' : undefined,
      companyOrAffiliation: isCompAccount ? compAffiliation.trim() || 'House Guest' : undefined,
      accountHistory: initialHistory,
    });

    setIsCustModalOpen(false);
    setCustName('');
    setCustAddress('');
    setIsCompAccount(false);
    setCompAffiliation('');
    setCompBalance('100000');
  };

  const handleTopUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topUpCustomer) return;
    const amt = parseFloat(topUpAmount);
    if (isNaN(amt) || amt <= 0) return;

    topUpComplementaryAccount(topUpCustomer.id, amt, topUpNotes);

    // Refresh history view if viewing this customer
    if (selectedHistoryCustomer && selectedHistoryCustomer.id === topUpCustomer.id) {
      const updated = customers.find((c) => c.id === topUpCustomer.id);
      if (updated) {
        setSelectedHistoryCustomer(updated);
      }
    }

    setTopUpCustomer(null);
    setTopUpAmount('50000');
    setTopUpNotes('Account balance top-up');
  };

  const filteredReservations = reservations.filter(
    (r) =>
      r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customerPhone.includes(searchQuery)
  );

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.companyOrAffiliation && c.companyOrAffiliation.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (customerFilter === 'complementary') return c.isComplementaryAccount;
    if (customerFilter === 'regular') return !c.isComplementaryAccount;
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950 text-slate-100 space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-amber-400" />
            Reservations, Customers & House Accounts
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Table bookings, guest arrival lists, customer contact info, and complementary VIP accounts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'reservations' ? (
            <button
              onClick={() => setIsResModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-amber-500/20 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>New Reservation</span>
            </button>
          ) : (
            <button
              onClick={() => setIsCustModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-amber-500/20 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Customer / House Account</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs w-fit">
          <button
            onClick={() => setActiveTab('reservations')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'reservations' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Reservations ({reservations.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'customers' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Customer Directory ({customers.length})</span>
          </button>
        </div>

        {/* Search */}
        <div className="w-full sm:w-72 relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'reservations' ? "Search reservation by name or phone..." : "Search customer, phone, or company..."}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* TAB 1: Reservations Board */}
      {activeTab === 'reservations' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReservations.map((res) => {
              const isConfirmed = res.status === 'confirmed';
              const isSeated = res.status === 'seated';
              return (
                <div
                  key={res.id}
                  className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-sm text-white">{res.customerName}</h3>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 font-mono">
                          <Phone className="w-3 h-3 text-amber-400" />
                          {res.customerPhone}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isSeated
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : isConfirmed
                            ? 'bg-sky-500/15 text-sky-400'
                            : 'bg-rose-500/15 text-rose-400'
                        }`}
                      >
                        {res.status}
                      </span>
                    </div>

                    <div className="mt-3 p-2.5 bg-slate-850 rounded-xl space-y-1 text-xs text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Date & Time:</span>
                        <span className="font-semibold text-white">{formatDateTime(res.dateTime)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Party Size:</span>
                        <span className="font-bold text-amber-400">{res.guestCount} Guests</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Assigned Table:</span>
                        <span className="font-semibold text-white">{res.tableName}</span>
                      </div>
                    </div>

                    {res.notes && (
                      <p className="text-[11px] italic text-slate-400 mt-2">
                        “{res.notes}”
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-end gap-2">
                    {isConfirmed && (
                      <>
                        <button
                          onClick={() => updateReservationStatus(res.id, 'seated')}
                          className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold transition-colors"
                        >
                          Seat Party
                        </button>
                        <button
                          onClick={() => updateReservationStatus(res.id, 'cancelled')}
                          className="px-2.5 py-1.5 text-slate-400 hover:text-rose-400 text-xs transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Customer CRM & House Accounts */}
      {activeTab === 'customers' && (
        <div className="space-y-4">
          {/* Subfilter Chips */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-semibold">Filter:</span>
            <button
              onClick={() => setCustomerFilter('all')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                customerFilter === 'all'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({customers.length})
            </button>
            <button
              onClick={() => setCustomerFilter('complementary')}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg font-bold transition-all ${
                customerFilter === 'complementary'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Wallet className="w-3 h-3 text-amber-400" />
              <span>Complementary Accounts ({customers.filter((c) => c.isComplementaryAccount).length})</span>
            </button>
            <button
              onClick={() => setCustomerFilter('regular')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                customerFilter === 'regular'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Regular Guests ({customers.filter((c) => !c.isComplementaryAccount).length})
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomers.map((c) => {
              const isComp = c.isComplementaryAccount;
              const bal = c.accountBalance ?? 0;
              const limit = c.accountCreditLimit ?? 0;
              const isLowFunds = isComp && (bal <= limit || c.accountStatus === 'low_funds');

              return (
                <div
                  key={c.id}
                  className={`p-4 bg-slate-900 border rounded-2xl space-y-3 transition-all ${
                    isComp
                      ? isLowFunds
                        ? 'border-rose-500/40 shadow-sm shadow-rose-950/20'
                        : 'border-amber-500/30'
                      : 'border-slate-800'
                  }`}
                >
                  {/* Top Customer Info */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-white">{c.name}</h3>
                        {isComp ? (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                              isLowFunds
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {isLowFunds ? 'Low Funds' : 'House Account'}
                          </span>
                        ) : (
                          <div className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[9px] font-semibold">
                            Guest
                          </div>
                        )}
                      </div>

                      {c.companyOrAffiliation && (
                        <p className="text-xs text-amber-400/90 font-medium flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3 text-amber-400" />
                          {c.companyOrAffiliation}
                        </p>
                      )}

                      <p className="text-xs text-slate-400 font-mono mt-0.5">{c.phone}</p>
                      {c.email && <p className="text-[11px] text-slate-500">{c.email}</p>}
                      {c.address && <p className="text-[11px] text-slate-500">{c.address}</p>}
                    </div>

                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1 font-bold text-xs">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{c.totalVisits > 5 ? 'VIP' : 'Regular'}</span>
                    </div>
                  </div>

                  {/* Complementary Account Financial Card */}
                  {isComp && (
                    <div
                      className={`p-3 rounded-xl border space-y-2 ${
                        isLowFunds
                          ? 'bg-rose-950/20 border-rose-500/40'
                          : 'bg-slate-850 border-slate-750'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Wallet className="w-3.5 h-3.5 text-amber-400" />
                          Account Balance:
                        </span>
                        <span
                          className={`font-mono font-extrabold text-sm ${
                            isLowFunds ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          {formatUGX(bal)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                        <span>Credit Limit Floor: {formatUGX(limit)}</span>
                        <span>
                          {isLowFunds ? (
                            <span className="text-rose-400 font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Orders Blocked
                            </span>
                          ) : (
                            <span className="text-emerald-400 font-semibold">Orders Allowed ✓</span>
                          )}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Stats Grid */}
                  <div className="p-2.5 bg-slate-850 rounded-xl grid grid-cols-2 gap-2 text-xs text-slate-300">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Total Visits</span>
                      <span className="font-bold text-white text-sm">{c.totalVisits} visits</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Total Spent</span>
                      <span className="font-bold font-mono text-amber-400 text-sm">{formatUGX(c.totalSpent)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                    {isComp ? (
                      <>
                        <button
                          onClick={() => setSelectedHistoryCustomer(c)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors"
                        >
                          <History className="w-3.5 h-3.5 text-sky-400" />
                          <span>Ledger ({c.accountHistory?.length || 0})</span>
                        </button>

                        <button
                          onClick={() => {
                            setTopUpCustomer(c);
                            setTopUpAmount('50000');
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-sm shadow-amber-500/20"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Top Up</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          updateCustomer({
                            ...c,
                            isComplementaryAccount: true,
                            accountBalance: 100000,
                            accountCreditLimit: 0,
                            accountStatus: 'active',
                            companyOrAffiliation: 'House VIP',
                            accountHistory: [
                              {
                                id: 'tx-' + Date.now(),
                                date: new Date().toISOString(),
                                type: 'top_up',
                                amount: 100000,
                                balanceAfter: 100000,
                                notes: 'Converted to House Account with initial credit',
                                recordedBy: 'Admin',
                              },
                            ],
                          });
                        }}
                        className="w-full py-1.5 bg-slate-800 hover:bg-slate-750 text-amber-400 hover:text-amber-300 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 border border-amber-500/20"
                      >
                        <Wallet className="w-3.5 h-3.5" />
                        <span>Enable House Account</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reservation Modal */}
      {isResModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm">
          <form
            onSubmit={handleCreateReservation}
            className="w-full max-w-md bg-slate-900 border border-slate-750 rounded-2xl p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Create Table Reservation</h3>
              <button type="button" onClick={() => setIsResModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Customer / Guest Name</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Christine Namugga"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Number of Guests</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={resDate}
                    onChange={(e) => setResDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Time</label>
                  <input
                    type="time"
                    required
                    value={resTime}
                    onChange={(e) => setResTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Assigned Table</label>
                <select
                  value={selectedTableId}
                  onChange={(e) => setSelectedTableId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                >
                  {tables.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} ({t.section}, {t.seats} seats)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Special Occasion / Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Birthday dinner, outdoor quiet table"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsResModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
              >
                Book Table
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Customer & House Account Registration Modal */}
      {isCustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleCreateCustomer}
            className="w-full max-w-md bg-slate-900 border border-slate-750 rounded-2xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Add Customer / House Account</h3>
              <button type="button" onClick={() => setIsCustModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Customer Full Name</label>
                <input
                  type="text"
                  required
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  placeholder="e.g. Hon. Patrick Mugisha"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Phone (MTN/Airtel)</label>
                <input
                  type="tel"
                  required
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    value={custEmail}
                    onChange={(e) => setCustEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Delivery Address</label>
                  <input
                    type="text"
                    value={custAddress}
                    onChange={(e) => setCustAddress(e.target.value)}
                    placeholder="Kololo Plot 14"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              {/* Complementary Account Checkbox Toggle */}
              <div className="pt-2 border-t border-slate-800">
                <label className="flex items-center gap-2 p-3 bg-slate-850 rounded-xl border border-slate-750 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCompAccount}
                    onChange={(e) => setIsCompAccount(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 focus:ring-offset-slate-900"
                  />
                  <div>
                    <span className="font-bold text-xs text-white block">
                      Create as Complementary House Account
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      Enables credit/allowance billing with strict low-balance order blocking
                    </span>
                  </div>
                </label>
              </div>

              {/* Complementary Specific Fields */}
              {isCompAccount && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-3">
                  <div>
                    <label className="block text-xs text-amber-300 mb-1">Company or Affiliation</label>
                    <input
                      type="text"
                      value={compAffiliation}
                      onChange={(e) => setCompAffiliation(e.target.value)}
                      placeholder="e.g. Director's Club, VIP Partner, Embassy"
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-amber-300 mb-1">Initial Balance (UGX)</label>
                      <input
                        type="number"
                        min={0}
                        step={10000}
                        value={compBalance}
                        onChange={(e) => setCompBalance(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-amber-300 mb-1">Credit Floor Limit (UGX)</label>
                      <input
                        type="number"
                        min={0}
                        step={5000}
                        value={compCreditLimit}
                        onChange={(e) => setCompCreditLimit(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsCustModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-amber-500/20"
              >
                Save Profile
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Account History / Ledger Modal */}
      {selectedHistoryCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-750 rounded-2xl p-5 shadow-2xl space-y-4 max-h-[88vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Account Ledger: {selectedHistoryCustomer.name}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {selectedHistoryCustomer.companyOrAffiliation || 'House Account'} • Floor Limit:{' '}
                    {formatUGX(selectedHistoryCustomer.accountCreditLimit ?? 0)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Available</span>
                  <span className="font-mono font-black text-sm text-emerald-400">
                    {formatUGX(selectedHistoryCustomer.accountBalance ?? 0)}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedHistoryCustomer(null)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Deposit Banner */}
            <div className="p-3 bg-slate-850 rounded-xl border border-slate-750 flex items-center justify-between">
              <span className="text-xs text-slate-300">
                Need to add funds to {selectedHistoryCustomer.name}'s house account?
              </span>
              <button
                onClick={() => {
                  setTopUpCustomer(selectedHistoryCustomer);
                  setTopUpAmount('50000');
                }}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-sm shadow-amber-500/20 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Deposit Funds</span>
              </button>
            </div>

            {/* Transaction Table */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {!selectedHistoryCustomer.accountHistory || selectedHistoryCustomer.accountHistory.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  <Receipt className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="font-bold text-slate-400">No account transactions recorded yet.</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Orders paid via House Account or staff deposits will appear here with timestamps.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedHistoryCustomer.accountHistory.map((tx) => {
                    const isTopUp = tx.type === 'top_up';
                    return (
                      <div
                        key={tx.id}
                        className="p-3 bg-slate-850 border border-slate-750 rounded-xl flex items-center justify-between text-xs transition-all hover:bg-slate-800"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              isTopUp
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            {isTopUp ? (
                              <ArrowDownLeft className="w-4 h-4" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">
                                {isTopUp ? 'Account Top-Up / Deposit' : 'Order Charge'}
                              </span>
                              {tx.orderNumber && (
                                <span className="font-mono text-[10px] text-amber-400 bg-amber-500/15 px-1.5 py-0.2 rounded font-semibold">
                                  #{tx.orderNumber}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {formatDateTime(tx.date)} {tx.recordedBy && `• Recorded by ${tx.recordedBy}`}
                            </p>
                            {tx.notes && <p className="text-[10px] text-slate-400 italic mt-0.5">{tx.notes}</p>}
                          </div>
                        </div>

                        <div className="text-right">
                          <div
                            className={`font-mono font-extrabold text-sm ${
                              isTopUp ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {isTopUp ? '+' : '-'} {formatUGX(tx.amount)}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Bal: {formatUGX(tx.balanceAfter)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedHistoryCustomer(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
              >
                Close Ledger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Up Modal */}
      {topUpCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleTopUpSubmit}
            className="w-full max-w-sm bg-slate-900 border border-slate-750 rounded-2xl p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">Top Up House Account</h3>
                <p className="text-[11px] text-slate-400">{topUpCustomer.name}</p>
              </div>
              <button type="button" onClick={() => setTopUpCustomer(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-2.5 bg-slate-850 rounded-xl flex items-center justify-between text-xs">
                <span className="text-slate-400">Current Balance:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {formatUGX(topUpCustomer.accountBalance ?? 0)}
                </span>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Deposit Amount (UGX)</label>
                <input
                  type="number"
                  min={1000}
                  step={5000}
                  required
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm font-mono text-white"
                />
              </div>

              {/* Quick Presets */}
              <div className="grid grid-cols-4 gap-1.5">
                {[20000, 50000, 100000, 200000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTopUpAmount(String(amt))}
                    className="py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 font-mono text-[10px] rounded-lg border border-slate-700"
                  >
                    +{(amt / 1000).toFixed(0)}k
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Reason / Notes</label>
                <input
                  type="text"
                  value={topUpNotes}
                  onChange={(e) => setTopUpNotes(e.target.value)}
                  placeholder="Cash deposit, MTN transfer, VIP reload"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setTopUpCustomer(null)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-emerald-500/20"
              >
                Confirm Deposit
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
