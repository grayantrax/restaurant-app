import React, { useState } from 'react';
import { usePos } from '../../context/PosContext';
import { PaymentMethod, Customer } from '../../types/pos';
import { formatUGX } from '../../utils/formatters';
import {
  X,
  Coins,
  Smartphone,
  CreditCard,
  Layers,
  Printer,
  CheckCircle2,
  AlertCircle,
  Wallet,
  Plus,
  Building,
  AlertTriangle
} from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose }) => {
  const {
    activeOrder,
    completeOrderPayment,
    settings,
    customers,
    setOrderCustomer,
    topUpComplementaryAccount
  } = usePos();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('cash');
  const [tenderedAmount, setTenderedAmount] = useState<string>('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [splitCashPart, setSplitCashPart] = useState<number>(0);
  const [splitMoMoPart, setSplitMoMoPart] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTopUpForm, setShowTopUpForm] = useState(false);
  const [quickTopUpAmount, setQuickTopUpAmount] = useState('50000');

  if (!isOpen) return null;

  const totalDue = activeOrder.totalAmount;
  const numTendered = parseFloat(tenderedAmount) || 0;
  const changeDue = Math.max(0, numTendered - totalDue);

  // Link customer
  const linkedCustomer = customers.find(
    (c) =>
      (activeOrder.customerId && c.id === activeOrder.customerId) ||
      (activeOrder.customerPhone && c.phone === activeOrder.customerPhone) ||
      (activeOrder.customerName && c.name.toLowerCase() === activeOrder.customerName.toLowerCase())
  );

  const complementaryCustomers = customers.filter((c) => c.isComplementaryAccount);
  const isComplementarySelected = selectedMethod === 'complementary_account';
  const curBalance = linkedCustomer?.accountBalance ?? 0;
  const creditLimit = linkedCustomer?.accountCreditLimit ?? 0;
  const hasInsufficientFunds =
    !linkedCustomer ||
    (curBalance - totalDue < creditLimit) ||
    linkedCustomer.accountStatus === 'low_funds';

  const handleQuickTopUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkedCustomer) return;
    const amt = parseFloat(quickTopUpAmount);
    if (isNaN(amt) || amt <= 0) return;
    topUpComplementaryAccount(linkedCustomer.id, amt, 'Quick Top-Up at checkout');
    setShowTopUpForm(false);
  };

  // Common Ugandan bank notes buttons for fast checkout
  const fastCashAmounts = [
    totalDue, // exact
    Math.ceil(totalDue / 10000) * 10000, // round to nearest 10k
    Math.ceil(totalDue / 20000) * 20000, // round to nearest 20k
    Math.ceil(totalDue / 50000) * 50000, // round to nearest 50k
    100000,
  ].filter((amt, idx, arr) => amt >= totalDue && arr.indexOf(amt) === idx);

  const handleComplete = () => {
    setIsProcessing(true);

    if (selectedMethod === 'split') {
      const remaining = totalDue - splitCashPart;
      completeOrderPayment('split', {
        splitItems: [
          { method: 'cash', amount: splitCashPart },
          { method: 'mtn_momo', amount: remaining, ref: referenceNumber },
        ],
      });
    } else {
      completeOrderPayment(selectedMethod, {
        tendered: selectedMethod === 'cash' ? (numTendered || totalDue) : undefined,
        referenceNumber: referenceNumber || undefined,
      });
    }

    setIsProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-750 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-850 border-b border-slate-750">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Payment & 80mm Checkout
              </h3>
              <p className="text-xs text-slate-400">
                Order #{activeOrder.orderNumber} • {activeOrder.items.length} Items • {activeOrder.type.toUpperCase()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bill Summary Strip */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-[11px] text-slate-400 uppercase font-semibold">Total Amount Due</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono tracking-tight">
              {formatUGX(totalDue)}
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <div>
              <span>Subtotal: </span>
              <span className="font-semibold text-slate-200 font-mono">{formatUGX(activeOrder.subtotal)}</span>
            </div>
            {activeOrder.vatAmount > 0 && (
              <div>
                <span>VAT (18%): </span>
                <span className="font-semibold text-slate-200 font-mono">{formatUGX(activeOrder.vatAmount)}</span>
              </div>
            )}
            {activeOrder.discountAmount > 0 && (
              <div className="text-rose-400">
                <span>Discount: </span>
                <span className="font-semibold font-mono">-{formatUGX(activeOrder.discountAmount)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Payment Methods Selector Tabs */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Select Payment Method
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              {/* Cash */}
              <button
                type="button"
                onClick={() => { setSelectedMethod('cash'); setTenderedAmount(String(totalDue)); }}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  selectedMethod === 'cash'
                    ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-lg'
                    : 'bg-slate-800/80 border-slate-700/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Coins className={`w-5 h-5 ${selectedMethod === 'cash' ? 'text-emerald-400' : ''}`} />
                <span className="text-xs font-bold">Cash (UGX)</span>
              </button>

              {/* MTN MoMo */}
              <button
                type="button"
                onClick={() => setSelectedMethod('mtn_momo')}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  selectedMethod === 'mtn_momo'
                    ? 'bg-amber-500/20 border-amber-500 text-white shadow-lg'
                    : 'bg-slate-800/80 border-slate-700/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Smartphone className={`w-5 h-5 ${selectedMethod === 'mtn_momo' ? 'text-amber-400' : ''}`} />
                <span className="text-xs font-bold">MTN MoMo</span>
              </button>

              {/* Airtel Money */}
              <button
                type="button"
                onClick={() => setSelectedMethod('airtel_money')}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  selectedMethod === 'airtel_money'
                    ? 'bg-rose-500/20 border-rose-500 text-white shadow-lg'
                    : 'bg-slate-800/80 border-slate-700/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Smartphone className={`w-5 h-5 ${selectedMethod === 'airtel_money' ? 'text-rose-400' : ''}`} />
                <span className="text-xs font-bold">Airtel Money</span>
              </button>

              {/* Card / POS */}
              <button
                type="button"
                onClick={() => setSelectedMethod('card')}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  selectedMethod === 'card'
                    ? 'bg-sky-500/20 border-sky-500 text-white shadow-lg'
                    : 'bg-slate-800/80 border-slate-700/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <CreditCard className={`w-5 h-5 ${selectedMethod === 'card' ? 'text-sky-400' : ''}`} />
                <span className="text-xs font-bold">Debit Card</span>
              </button>

              {/* Complementary Account */}
              <button
                type="button"
                onClick={() => setSelectedMethod('complementary_account')}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  selectedMethod === 'complementary_account'
                    ? 'bg-amber-500/25 border-amber-400 text-white shadow-lg ring-1 ring-amber-400'
                    : 'bg-slate-800/80 border-slate-700/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Wallet className={`w-5 h-5 ${selectedMethod === 'complementary_account' ? 'text-amber-400' : ''}`} />
                <span className="text-xs font-bold">House Account</span>
              </button>

              {/* Split Payment */}
              <button
                type="button"
                onClick={() => {
                  setSelectedMethod('split');
                  setSplitCashPart(Math.floor(totalDue / 2));
                  setSplitMoMoPart(totalDue - Math.floor(totalDue / 2));
                }}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  selectedMethod === 'split'
                    ? 'bg-purple-500/20 border-purple-500 text-white shadow-lg'
                    : 'bg-slate-800/80 border-slate-700/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Layers className={`w-5 h-5 ${selectedMethod === 'split' ? 'text-purple-400' : ''}`} />
                <span className="text-xs font-bold">Split Bill</span>
              </button>
            </div>
          </div>

          {/* Conditional Method Panels */}

          {/* 1. Cash Tendered & Change Calculation */}
          {selectedMethod === 'cash' && (
            <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Amount Tendered by Customer (UGX)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-mono text-sm text-slate-400 font-bold">UGX</span>
                  <input
                    type="number"
                    value={tenderedAmount}
                    onChange={(e) => setTenderedAmount(e.target.value)}
                    placeholder="Enter cash given"
                    className="w-full pl-14 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl font-mono text-lg font-bold text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Quick Cash Suggestions */}
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block mb-1.5">
                  Fast Denomination Buttons:
                </span>
                <div className="flex flex-wrap gap-2">
                  {fastCashAmounts.map((amt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setTenderedAmount(String(amt))}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all ${
                        numTendered === amt
                          ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow'
                          : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-750'
                      }`}
                    >
                      {amt === totalDue ? `Exact (${formatUGX(amt)})` : formatUGX(amt)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Change Returned Result */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400">Change Due to Customer:</div>
                  <div className={`text-xl font-extrabold font-mono ${changeDue > 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
                    {formatUGX(changeDue)}
                  </div>
                </div>
                {numTendered > 0 && numTendered < totalDue && (
                  <div className="text-xs text-rose-400 flex items-center gap-1 font-semibold">
                    <AlertCircle className="w-4 h-4" />
                    <span>Underpaid by {formatUGX(totalDue - numTendered)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. MTN Mobile Money */}
          {selectedMethod === 'mtn_momo' && (
            <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/30 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0">
                  MTN
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">MTN MoMo Pay Instructions</h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Ask customer to dial: <span className="font-mono font-bold text-amber-300">*165*3*{settings.mtnMerchantCode || '984521'}#</span>
                  </p>
                  <p className="text-xs text-slate-400">Amount: <span className="font-mono font-bold text-white">{formatUGX(totalDue)}</span></p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  MTN Transaction ID / Reference (Optional)
                </label>
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="e.g. 194857283 or MM-091"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          {/* 3. Airtel Money */}
          {selectedMethod === 'airtel_money' && (
            <div className="p-4 bg-rose-500/10 rounded-2xl border border-rose-500/30 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-600 text-white font-black flex items-center justify-center shrink-0">
                  AIR
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Airtel Pay Instructions</h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Ask customer to dial: <span className="font-mono font-bold text-rose-300">*185*9*{settings.airtelPayCode || '102938'}#</span>
                  </p>
                  <p className="text-xs text-slate-400">Amount: <span className="font-mono font-bold text-white">{formatUGX(totalDue)}</span></p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Airtel Money Transaction ID / Reference
                </label>
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="e.g. AM-8472910"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          )}

          {/* 4. Debit / Credit Card */}
          {selectedMethod === 'card' && (
            <div className="p-4 bg-sky-500/10 rounded-2xl border border-sky-500/30 space-y-3">
              <div className="text-xs text-slate-300">
                Insert or tap Visa / Mastercard onto the card POS terminal for <span className="font-bold text-white">{formatUGX(totalDue)}</span>.
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Card Terminal Approval / Auth Code
                </label>
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="e.g. AUTH-482910"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          )}

          {/* 5. Complementary / House Account Panel */}
          {selectedMethod === 'complementary_account' && (
            <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/30 space-y-4">
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">House / Complementary Account</h4>
                    <p className="text-[11px] text-slate-300">
                      Charge bill directly to the client's pre-approved house balance.
                    </p>
                  </div>
                </div>

                {linkedCustomer && (
                  <button
                    type="button"
                    onClick={() => setShowTopUpForm(!showTopUpForm)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Top-Up Funds</span>
                  </button>
                )}
              </div>

              {/* Quick Top-Up Drawer */}
              {showTopUpForm && linkedCustomer && (
                <form
                  onSubmit={handleQuickTopUp}
                  className="p-3 bg-slate-900/90 rounded-xl border border-amber-500/40 space-y-2.5"
                >
                  <div className="text-xs font-bold text-amber-300 flex items-center justify-between">
                    <span>Deposit / Top Up Account: {linkedCustomer.name}</span>
                    <button
                      type="button"
                      onClick={() => setShowTopUpForm(false)}
                      className="text-slate-400 hover:text-white text-xs"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={1000}
                      step={5000}
                      value={quickTopUpAmount}
                      onChange={(e) => setQuickTopUpAmount(e.target.value)}
                      placeholder="Amount in UGX"
                      className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono text-white"
                    />
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-colors"
                    >
                      Deposit Now
                    </button>
                  </div>
                </form>
              )}

              {/* Customer Selector if not linked */}
              {!linkedCustomer ? (
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">
                    Assign a Customer to this Order:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {complementaryCustomers.map((cust) => {
                      const isLow = (cust.accountBalance ?? 0) <= (cust.accountCreditLimit ?? 0);
                      return (
                        <button
                          key={cust.id}
                          type="button"
                          onClick={() => setOrderCustomer(cust)}
                          className="p-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-750 hover:border-amber-500/50 rounded-xl text-left transition-all"
                        >
                          <div className="font-bold text-xs text-white">{cust.name}</div>
                          {cust.companyOrAffiliation && (
                            <div className="text-[10px] text-slate-400">{cust.companyOrAffiliation}</div>
                          )}
                          <div className="mt-1 flex items-center justify-between text-[10px]">
                            <span className="font-mono text-amber-400 font-bold">
                              {formatUGX(cust.accountBalance ?? 0)}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                                isLow ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                              }`}
                            >
                              {isLow ? 'Low Funds' : 'Active'}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Customer Account Details Card */
                <div className="space-y-3">
                  <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{linkedCustomer.name}</span>
                        {linkedCustomer.isComplementaryAccount && (
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase">
                            Complementary VIP
                          </span>
                        )}
                      </div>
                      {linkedCustomer.companyOrAffiliation && (
                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3 text-slate-500" />
                          <span>{linkedCustomer.companyOrAffiliation}</span>
                        </div>
                      )}
                      <div className="text-[11px] text-slate-400 mt-1">
                        Credit / Safety Floor: <span className="font-mono">{formatUGX(creditLimit)}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Available Balance</div>
                      <div className="text-lg font-extrabold font-mono text-amber-400">
                        {formatUGX(curBalance)}
                      </div>
                    </div>
                  </div>

                  {/* LOW FUNDS BLOCKING WARNING */}
                  {hasInsufficientFunds ? (
                    <div className="p-3.5 bg-rose-500/15 border border-rose-500/50 rounded-xl space-y-1.5">
                      <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>ORDER BLOCKED: Insufficient Account Money</span>
                      </div>
                      <p className="text-xs text-rose-200/90 leading-relaxed">
                        This complementary customer currently has an available balance of{' '}
                        <span className="font-bold font-mono">{formatUGX(curBalance)}</span>, which is below
                        the required bill total of{' '}
                        <span className="font-bold font-mono">{formatUGX(totalDue)}</span> (or at/below the limit of{' '}
                        <span className="font-bold font-mono">{formatUGX(creditLimit)}</span>).
                      </p>
                      <p className="text-[11px] text-rose-300 font-semibold">
                        As configured, complementary customers with low funds cannot take or complete orders.
                        Please use the "Top-Up Funds" button above to replenish their balance, or choose Cash/Mobile Money.
                      </p>
                    </div>
                  ) : (
                    /* Balance Sufficient Preview */
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Account Approved for Charge</span>
                        </div>
                        <div className="text-slate-300 text-[11px] mt-0.5">
                          Balance remaining after deduction:
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-extrabold text-sm text-emerald-300">
                          {formatUGX(curBalance - totalDue)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 6. Split Bill Payment */}
          {selectedMethod === 'split' && (
            <div className="p-4 bg-purple-500/10 rounded-2xl border border-purple-500/30 space-y-4">
              <div className="text-xs font-semibold text-purple-300">
                Split payment between Cash and Mobile Money / Card:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Part 1: Cash Amount (UGX)</label>
                  <input
                    type="number"
                    value={splitCashPart}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setSplitCashPart(v);
                      setSplitMoMoPart(Math.max(0, totalDue - v));
                    }}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl font-mono text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Part 2: MoMo/Card Amount (UGX)</label>
                  <input
                    type="number"
                    value={splitMoMoPart}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setSplitMoMoPart(v);
                      setSplitCashPart(Math.max(0, totalDue - v));
                    }}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl font-mono text-sm text-white"
                  />
                </div>
              </div>

              <div className="text-[11px] text-slate-400 flex justify-between">
                <span>Total Split: {formatUGX(splitCashPart + splitMoMoPart)}</span>
                <span className={splitCashPart + splitMoMoPart === totalDue ? 'text-emerald-400' : 'text-rose-400'}>
                  {splitCashPart + splitMoMoPart === totalDue ? 'Balanced ✓' : `Difference: ${formatUGX(totalDue - (splitCashPart + splitMoMoPart))}`}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Action Button */}
        <div className="p-5 bg-slate-850 border-t border-slate-750 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Printer className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Will automatically open 80mm thermal receipt</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleComplete}
              disabled={
                (selectedMethod === 'cash' && numTendered > 0 && numTendered < totalDue) ||
                (isComplementarySelected && hasInsufficientFunds)
              }
              className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 text-slate-950 font-extrabold rounded-2xl shadow-lg shadow-emerald-500/20 transition-all text-sm active:scale-95 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>
                {isComplementarySelected && hasInsufficientFunds
                  ? 'Blocked: Insufficient Account Funds'
                  : 'Complete Sale & Print 80mm'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
