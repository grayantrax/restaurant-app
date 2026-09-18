import React, { useState, useMemo } from 'react';
import { usePos } from '../../context/PosContext';
import { MenuItem, OrderType, TableItem, Customer } from '../../types/pos';
import { formatUGX } from '../../utils/formatters';
import { ItemCustomizerModal } from './ItemCustomizerModal';
import { PaymentModal } from './PaymentModal';
import { DiscountModal, SplitEqualModal } from './BillActionModals';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  PauseCircle,
  ChefHat,
  CreditCard,
  Percent,
  Split,
  Utensils,
  ShoppingBag,
  Bike,
  X,
  User,
  Phone,
  MapPin,
  Flame,
  Soup,
  Sandwich,
  Fish,
  Beer,
  Coffee,
  CheckCircle,
  Layers,
  ArrowRight,
  Wallet,
  AlertTriangle,
  Building,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

const CATEGORY_ICONS: Record<string, any> = {
  Flame,
  Soup,
  Sandwich,
  Fish,
  Beer,
  Coffee,
  Utensils,
};

export const PosRegister: React.FC = () => {
  const {
    categories,
    menuItems,
    tables,
    activeOrder,
    setOrderType,
    assignTable,
    setCustomerInfo,
    addItemToCart,
    updateCartItemQty,
    removeCartItem,
    clearActiveCart,
    holdOrder,
    sendToKitchen,
    customers,
    setOrderCustomer,
    topUpComplementaryAccount
  } = usePos();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isDiscountOpen, setIsDiscountOpen] = useState(false);
  const [isSplitOpen, setIsSplitOpen] = useState(false);
  const [isTablePickerOpen, setIsTablePickerOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  // Complementary account handling state
  const [customerModalTab, setCustomerModalTab] = useState<'complementary' | 'custom'>('complementary');
  const [blockedNotice, setBlockedNotice] = useState<string | null>(null);
  const [isRegisterTopUpOpen, setIsRegisterTopUpOpen] = useState(false);
  const [registerTopUpAmount, setRegisterTopUpAmount] = useState('50000');
  const [compSearchQuery, setCompSearchQuery] = useState('');

  // Find linked customer
  const linkedCustomer = useMemo(() => {
    return (
      customers.find((c) => c.id === activeOrder.customerId) ||
      customers.find(
        (c) => activeOrder.customerPhone && c.phone && c.phone.trim() === activeOrder.customerPhone.trim()
      ) ||
      customers.find(
        (c) =>
          activeOrder.customerName &&
          c.name.toLowerCase().trim() === activeOrder.customerName.toLowerCase().trim()
      )
    );
  }, [customers, activeOrder.customerId, activeOrder.customerPhone, activeOrder.customerName]);

  const isComplementaryOrder = Boolean(activeOrder.isComplementaryOrder || linkedCustomer?.isComplementaryAccount);
  const customerAccountBalance = linkedCustomer?.accountBalance ?? (activeOrder.remainingAccountBalance ?? 0);
  const customerCreditLimit = linkedCustomer?.accountCreditLimit ?? 0;
  
  // Rule: if complementary customer's account money runs low, they can no longer take orders
  const isAccountMoneyLow = isComplementaryOrder && (
    customerAccountBalance < activeOrder.totalAmount ||
    customerAccountBalance <= customerCreditLimit ||
    linkedCustomer?.accountStatus === 'low_funds' ||
    linkedCustomer?.accountStatus === 'suspended'
  );

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchCat = selectedCategory === 'all' || item.categoryId === selectedCategory;
      const matchQuery =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  // Click on menu item
  const handleItemClick = (item: MenuItem) => {
    if (!item.isAvailable) return;
    // If item has variants or add-ons, open customizer modal
    if ((item.variants && item.variants.length > 0) || (item.addOns && item.addOns.length > 0)) {
      setCustomizingItem(item);
    } else {
      addItemToCart(item);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-950 text-slate-100">
      {/* LEFT COLUMN: Menu, Categories & Search */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden border-r border-slate-800">
        {/* Top Control Bar: Order Type Selector & Search */}
        <div className="p-3 sm:p-4 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {/* Order Type Toggle */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setOrderType('dine-in')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeOrder.type === 'dine-in'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Dine-In</span>
            </button>

            <button
              onClick={() => setOrderType('takeaway')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeOrder.type === 'takeaway'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Takeaway</span>
            </button>

            <button
              onClick={() => setOrderType('delivery')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeOrder.type === 'delivery'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bike className="w-3.5 h-3.5" />
              <span>Delivery</span>
            </button>
          </div>

          {/* Table / Customer Details Indicator */}
          <div className="flex items-center gap-2">
            {activeOrder.type === 'dine-in' && (
              <button
                onClick={() => setIsTablePickerOpen(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                  activeOrder.tableName
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-bold'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                }`}
              >
                <span>{activeOrder.tableName ? `Table: ${activeOrder.tableName}` : 'Select Table'}</span>
              </button>
            )}

            <button
              onClick={() => setIsCustomerModalOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                activeOrder.customerName
                  ? 'bg-sky-500/15 border-sky-500/40 text-sky-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>{activeOrder.customerName || 'Customer Info'}</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="w-full sm:w-64 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items (e.g. Rolex, Nile...)"
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Horizontal Scroll Pills */}
        <div className="px-3 sm:px-4 py-2 bg-slate-900/60 border-b border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            All Items ({menuItems.length})
          </button>
          {categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.iconName] || Utensils;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Menu Items Touch Grid */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          {filteredItems.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-xs">
              <Utensils className="w-8 h-8 mb-2 opacity-40" />
              <p>No menu items match your search or filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredItems.map((item) => {
                const hasCustoms =
                  (item.variants && item.variants.length > 0) ||
                  (item.addOns && item.addOns.length > 0);

                return (
                  <button
                    key={item.id}
                    disabled={!item.isAvailable}
                    onClick={() => handleItemClick(item)}
                    className={`relative p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all group active:scale-95 ${
                      !item.isAvailable
                        ? 'bg-slate-900/40 border-slate-800/60 opacity-60 cursor-not-allowed'
                        : 'bg-slate-850 hover:bg-slate-800 border-slate-750 hover:border-amber-500/50 shadow-md hover:shadow-amber-500/5'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span className="font-bold text-xs sm:text-sm text-white group-hover:text-amber-300 transition-colors line-clamp-2">
                          {item.name}
                        </span>
                        {hasCustoms && (
                          <span className="shrink-0 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[9px] text-amber-400 font-mono">
                            Opt+
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="font-mono font-extrabold text-xs sm:text-sm text-amber-400">
                        {formatUGX(item.price)}
                      </span>
                      <div className="w-6 h-6 rounded-lg bg-amber-500/15 group-hover:bg-amber-500 text-amber-400 group-hover:text-slate-950 flex items-center justify-center transition-all">
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    </div>

                    {!item.isAvailable && (
                      <div className="absolute inset-0 bg-slate-950/80 rounded-2xl flex items-center justify-center backdrop-blur-[1px]">
                        <span className="px-2.5 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Active Order / Bill Register Panel */}
      <div className="w-full lg:w-96 xl:w-[420px] bg-slate-900 flex flex-col shrink-0 border-t lg:border-t-0 border-slate-800 shadow-2xl">
        {/* Order Header */}
        <div className="p-3.5 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">Order #{activeOrder.orderNumber}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {activeOrder.type}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {activeOrder.tableName ? `Table: ${activeOrder.tableName}` : 'Counter'} • Server: {activeOrder.staffName}
            </p>
          </div>

          <div className="flex items-center gap-1">
            {activeOrder.items.length > 0 && (
              <button
                onClick={clearActiveCart}
                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                title="Clear Cart"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Customer / Complementary Account Info Banner */}
        {isComplementaryOrder && linkedCustomer ? (
          <div
            className={`p-3 border-b text-xs transition-all ${
              isAccountMoneyLow
                ? 'bg-rose-500/15 border-rose-500/40'
                : 'bg-amber-500/10 border-amber-500/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className={`w-4 h-4 ${isAccountMoneyLow ? 'text-rose-400' : 'text-amber-400'}`} />
                <span className="font-bold text-white truncate max-w-[150px]">{linkedCustomer.name}</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  House VIP
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 mr-1">Bal:</span>
                <span className={`font-mono font-bold ${isAccountMoneyLow ? 'text-rose-400' : 'text-amber-400'}`}>
                  {formatUGX(customerAccountBalance)}
                </span>
              </div>
            </div>

            {isAccountMoneyLow ? (
              <div className="mt-2 pt-2 border-t border-rose-500/30 flex items-center justify-between">
                <span className="text-[10px] text-rose-300 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                  <span>Account low: Cannot take orders!</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsRegisterTopUpOpen(!isRegisterTopUpOpen)}
                  className="px-2 py-0.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 text-[10px] font-bold rounded-lg transition-colors"
                >
                  {isRegisterTopUpOpen ? 'Close' : 'Top Up'}
                </button>
              </div>
            ) : (
              <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                <span>Post-order remainder:</span>
                <span className="font-mono text-emerald-400 font-semibold">
                  {formatUGX(customerAccountBalance - activeOrder.totalAmount)}
                </span>
              </div>
            )}

            {/* Quick Register Top Up Drawer */}
            {isRegisterTopUpOpen && (
              <div className="mt-2.5 p-2 bg-slate-900 rounded-xl border border-rose-500/40 flex items-center gap-2">
                <input
                  type="number"
                  min={1000}
                  step={5000}
                  value={registerTopUpAmount}
                  onChange={(e) => setRegisterTopUpAmount(e.target.value)}
                  placeholder="UGX"
                  className="flex-1 px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono text-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    const amt = parseFloat(registerTopUpAmount);
                    if (amt > 0 && linkedCustomer) {
                      topUpComplementaryAccount(linkedCustomer.id, amt, 'Register counter reload');
                      setIsRegisterTopUpOpen(false);
                    }
                  }}
                  className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs"
                >
                  Deposit
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Standard Guest Info Chip if present */
          (activeOrder.customerName || activeOrder.deliveryAddress) && (
            <div className="px-3.5 py-1.5 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <div className="truncate">
                <span className="text-slate-400">Guest: </span>
                <span className="font-semibold text-white">{activeOrder.customerName}</span>
                {activeOrder.customerPhone && <span className="text-slate-400"> ({activeOrder.customerPhone})</span>}
              </div>
              <button
                onClick={() => setIsCustomerModalOpen(true)}
                className="text-[10px] text-amber-400 hover:underline shrink-0"
              >
                Edit
              </button>
            </div>
          )
        )}

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {activeOrder.items.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-slate-500 text-xs text-center p-4">
              <Utensils className="w-10 h-10 mb-2 opacity-30" />
              <p className="font-semibold text-slate-400">Order is empty</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Tap items on the left to add food & drinks.
              </p>
            </div>
          ) : (
            activeOrder.items.map((item) => (
              <div
                key={item.cartItemId}
                className="p-3 bg-slate-850 border border-slate-800 rounded-xl space-y-1.5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white block">
                      {item.name}
                      {item.variantName && (
                        <span className="text-amber-400 text-[10px] font-medium"> ({item.variantName})</span>
                      )}
                    </span>
                    {item.selectedAddOns?.map((a) => (
                      <div key={a.id} className="text-[10px] text-slate-400 pl-2">
                        + {a.name} ({formatUGX(a.price)})
                      </div>
                    ))}
                    {item.notes && (
                      <div className="text-[10px] italic text-amber-400/80 pl-2">
                        Note: {item.notes}
                      </div>
                    )}
                  </div>
                  <span className="font-mono font-bold text-xs text-amber-400 shrink-0">
                    {formatUGX(item.totalPrice)}
                  </span>
                </div>

                {/* Qty & Remove Controls */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-xs">
                  <div className="text-[10px] text-slate-400 font-mono">
                    {formatUGX(item.unitPrice)} each
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateCartItemQty(item.cartItemId, -1)}
                      className="w-6 h-6 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-mono font-bold text-xs text-white w-5 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartItemQty(item.cartItemId, 1)}
                      className="w-6 h-6 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => removeCartItem(item.cartItemId)}
                      className="ml-1 text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bill Calculations & Action Buttons */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-3">
          {/* Subtotals & Taxes */}
          <div className="space-y-1 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-mono text-slate-200">{formatUGX(activeOrder.subtotal)}</span>
            </div>

            {activeOrder.discountAmount > 0 && (
              <div className="flex justify-between text-rose-400 font-semibold">
                <span>Discount ({activeOrder.discountType === 'percentage' ? `${activeOrder.discountValue}%` : 'Fixed'}):</span>
                <span className="font-mono">-{formatUGX(activeOrder.discountAmount)}</span>
              </div>
            )}

            {activeOrder.serviceChargeAmount > 0 && (
              <div className="flex justify-between">
                <span>Service Charge (5%):</span>
                <span className="font-mono text-slate-200">{formatUGX(activeOrder.serviceChargeAmount)}</span>
              </div>
            )}

            {activeOrder.vatAmount > 0 && (
              <div className="flex justify-between">
                <span>18% URA VAT (Included):</span>
                <span className="font-mono text-slate-200">{formatUGX(activeOrder.vatAmount)}</span>
              </div>
            )}

            <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-slate-800">
              <span>Total Payable:</span>
              <span className="text-amber-400 font-mono text-lg">{formatUGX(activeOrder.totalAmount)}</span>
            </div>
          </div>

          {/* Secondary POS Action Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setIsDiscountOpen(true)}
              disabled={activeOrder.items.length === 0}
              className="py-2 rounded-xl bg-slate-800 hover:bg-slate-750 disabled:opacity-40 text-slate-300 hover:text-white border border-slate-700/80 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
            >
              <Percent className="w-3 h-3 text-amber-400" />
              <span>Discount</span>
            </button>

            <button
              onClick={() => setIsSplitOpen(true)}
              disabled={activeOrder.items.length === 0}
              className="py-2 rounded-xl bg-slate-800 hover:bg-slate-750 disabled:opacity-40 text-slate-300 hover:text-white border border-slate-700/80 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
            >
              <Split className="w-3 h-3 text-purple-400" />
              <span>Split Bill</span>
            </button>

            <button
              onClick={holdOrder}
              disabled={activeOrder.items.length === 0}
              className="py-2 rounded-xl bg-slate-800 hover:bg-slate-750 disabled:opacity-40 text-slate-300 hover:text-white border border-slate-700/80 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
            >
              <PauseCircle className="w-3 h-3 text-sky-400" />
              <span>Hold Order</span>
            </button>
          </div>

          {/* Primary Action Buttons: Kitchen KDS & Pay */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                if (isAccountMoneyLow) {
                  setBlockedNotice(
                    `Cannot send order to kitchen: Complementary customer (${linkedCustomer?.name || 'Customer'}) has low account funds (${formatUGX(customerAccountBalance)}). Per restaurant policy, they can no longer take orders until their account is topped up.`
                  );
                  return;
                }
                sendToKitchen();
              }}
              disabled={activeOrder.items.length === 0 || isAccountMoneyLow}
              className={`py-3 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-40 ${
                isAccountMoneyLow
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 cursor-not-allowed'
                  : 'bg-sky-600/20 hover:bg-sky-600/30 disabled:bg-slate-900 border border-sky-500/40 text-sky-300'
              }`}
            >
              <ChefHat className="w-4 h-4" />
              <span>{isAccountMoneyLow ? 'KDS Blocked' : 'Send to KDS'}</span>
            </button>

            <button
              onClick={() => {
                if (isAccountMoneyLow) {
                  setBlockedNotice(
                    `Cannot process or finalize this order: Complementary customer (${linkedCustomer?.name || 'Customer'}) has low account funds (${formatUGX(customerAccountBalance)}). As required, they cannot take orders until the account is topped up.`
                  );
                  return;
                }
                setIsPaymentOpen(true);
              }}
              disabled={activeOrder.items.length === 0 || isAccountMoneyLow}
              className={`py-3 font-black rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-50 ${
                isAccountMoneyLow
                  ? 'bg-rose-600/30 text-rose-300 border border-rose-500/50 shadow-rose-900/20 cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 text-slate-950 shadow-amber-500/20'
              }`}
            >
              <CreditCard className="w-4 h-4 stroke-[2.5]" />
              <span>
                {isAccountMoneyLow
                  ? 'Blocked: Low Funds'
                  : `Pay ${formatUGX(activeOrder.totalAmount).replace('UGX ', '')}`}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Blocked Order Warning Modal */}
      {blockedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-rose-500/50 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">Order Blocked: Low Account Money</h3>
                <p className="text-[11px] text-rose-300">Complementary policy restriction enforced</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
              {blockedNotice}
            </p>

            <div className="flex items-center justify-end gap-2 pt-1">
              {linkedCustomer && (
                <button
                  type="button"
                  onClick={() => {
                    setBlockedNotice(null);
                    setIsCustomerModalOpen(true);
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md shadow-amber-500/20"
                >
                  Top Up Account Now
                </button>
              )}
              <button
                type="button"
                onClick={() => setBlockedNotice(null)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item Customizer Modal */}
      <ItemCustomizerModal
        item={customizingItem}
        isOpen={!!customizingItem}
        onClose={() => setCustomizingItem(null)}
        onConfirm={(item, variant, addOns, notes) => addItemToCart(item, variant, addOns, notes)}
      />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
      />

      {/* Discount Modal */}
      <DiscountModal
        isOpen={isDiscountOpen}
        onClose={() => setIsDiscountOpen(false)}
      />

      {/* Split Bill Calculator */}
      <SplitEqualModal
        isOpen={isSplitOpen}
        onClose={() => setIsSplitOpen(false)}
      />

      {/* Table Picker Modal for Dine-In */}
      {isTablePickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Select Dine-In Table</h3>
              <button onClick={() => setIsTablePickerOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {tables.map((table) => {
                const isSelected = activeOrder.tableId === table.id;
                return (
                  <button
                    key={table.id}
                    onClick={() => {
                      assignTable(table);
                      setIsTablePickerOpen(false);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-white shadow'
                        : table.status === 'occupied'
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                        : table.status === 'reserved'
                        ? 'bg-sky-500/10 border-sky-500/30 text-sky-300'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-bold text-xs">{table.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {table.section} • {table.seats} seats
                    </div>
                    <div className="text-[10px] font-semibold mt-1 capitalize">
                      {table.status.replace('_', ' ')}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                assignTable(null);
                setIsTablePickerOpen(false);
              }}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
            >
              Clear Table Assignment
            </button>
          </div>
        </div>
      )}

      {/* Customer Info & House Accounts Modal */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-750 rounded-2xl p-5 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Customer & House Accounts</h3>
                  <p className="text-[11px] text-slate-400">Attach complementary VIP accounts or enter guest info</p>
                </div>
              </div>
              <button onClick={() => setIsCustomerModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-800 gap-2">
              <button
                type="button"
                onClick={() => setCustomerModalTab('complementary')}
                className={`pb-2 px-2 text-xs font-bold transition-colors flex items-center gap-1.5 border-b-2 ${
                  customerModalTab === 'complementary'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Complementary Accounts ({customers.filter(c => c.isComplementaryAccount).length})</span>
              </button>

              <button
                type="button"
                onClick={() => setCustomerModalTab('custom')}
                className={`pb-2 px-2 text-xs font-bold transition-colors flex items-center gap-1.5 border-b-2 ${
                  customerModalTab === 'custom'
                    ? 'border-amber-400 text-amber-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Standard Guest Details</span>
              </button>
            </div>

            {/* Tab 1: Complementary Accounts */}
            {customerModalTab === 'complementary' && (
              <div className="flex-1 overflow-y-auto space-y-3">
                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={compSearchQuery}
                    onChange={(e) => setCompSearchQuery(e.target.value)}
                    placeholder="Search accounts or companies..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500"
                  />
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {customers
                    .filter((c) => c.isComplementaryAccount)
                    .filter((c) => {
                      if (!compSearchQuery.trim()) return true;
                      const q = compSearchQuery.toLowerCase();
                      return (
                        c.name.toLowerCase().includes(q) ||
                        (c.companyOrAffiliation && c.companyOrAffiliation.toLowerCase().includes(q))
                      );
                    })
                    .map((cust) => {
                      const isSelected = activeOrder.customerId === cust.id;
                      const bal = cust.accountBalance ?? 0;
                      const limit = cust.accountCreditLimit ?? 0;
                      const isLow = bal <= limit || cust.accountStatus === 'low_funds';

                      return (
                        <div
                          key={cust.id}
                          className={`p-3 rounded-xl border transition-all ${
                            isSelected
                              ? 'bg-amber-500/20 border-amber-400 ring-1 ring-amber-400'
                              : 'bg-slate-850 hover:bg-slate-800 border-slate-750'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-white">{cust.name}</span>
                                <span
                                  className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                                    isLow ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                                  }`}
                                >
                                  {isLow ? 'Low Funds' : 'Active Account'}
                                </span>
                              </div>
                              {cust.companyOrAffiliation && (
                                <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                  <Building className="w-3 h-3 text-slate-500" />
                                  <span>{cust.companyOrAffiliation}</span>
                                </div>
                              )}
                              <div className="text-[10px] text-slate-400 mt-1">
                                Floor Limit: <span className="font-mono">{formatUGX(limit)}</span>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-[10px] text-slate-400 uppercase font-semibold">Balance</div>
                              <div
                                className={`font-mono font-extrabold text-sm ${
                                  isLow ? 'text-rose-400' : 'text-amber-400'
                                }`}
                              >
                                {formatUGX(bal)}
                              </div>

                              <div className="mt-2 flex gap-1.5 justify-end">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOrderCustomer(cust);
                                    setIsCustomerModalOpen(false);
                                  }}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                                    isSelected
                                      ? 'bg-amber-500 text-slate-950 shadow'
                                      : 'bg-slate-750 hover:bg-slate-700 text-slate-200'
                                  }`}
                                >
                                  {isSelected ? 'Attached ✓' : 'Select'}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Inline Quick Top Up if funds are low */}
                          {isLow && (
                            <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                              <span className="text-rose-300 flex items-center gap-1 font-semibold">
                                <AlertTriangle className="w-3 h-3 text-rose-400" />
                                Cannot take orders until funded
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  topUpComplementaryAccount(cust.id, 50000, 'Staff fast reload');
                                }}
                                className="px-2 py-0.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded text-[10px] font-bold"
                              >
                                +50,000 UGX
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Tab 2: Standard Guest Details */}
            {customerModalTab === 'custom' && (
              <div className="space-y-3 flex-1 overflow-y-auto">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Customer / Guest Name</label>
                  <input
                    type="text"
                    value={activeOrder.customerName || ''}
                    onChange={(e) => setCustomerInfo(e.target.value, activeOrder.customerPhone, activeOrder.deliveryAddress)}
                    placeholder="e.g. Dr. Ronald Kasule"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Phone Number (MTN/Airtel)</label>
                  <input
                    type="tel"
                    value={activeOrder.customerPhone || ''}
                    onChange={(e) => setCustomerInfo(activeOrder.customerName || '', e.target.value, activeOrder.deliveryAddress)}
                    placeholder="+256 772 123 456"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Delivery Address (if applicable)</label>
                  <textarea
                    rows={2}
                    value={activeOrder.deliveryAddress || ''}
                    onChange={(e) => setCustomerInfo(activeOrder.customerName || '', activeOrder.customerPhone, e.target.value)}
                    placeholder="Plot / Street / Neighborhood in Kampala"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white resize-none"
                  />
                </div>
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              {(activeOrder.customerId || activeOrder.customerName) ? (
                <button
                  type="button"
                  onClick={() => {
                    setOrderCustomer(null);
                    setCustomerInfo('', '', '');
                    setIsCustomerModalOpen(false);
                  }}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-750 text-rose-300 text-xs font-semibold rounded-xl"
                >
                  Detach Customer
                </button>
              ) : <div />}

              <button
                type="button"
                onClick={() => setIsCustomerModalOpen(false)}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-amber-500/20"
              >
                Close & Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
