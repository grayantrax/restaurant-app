import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  StaffUser,
  MenuItem,
  MenuCategory,
  TableItem,
  InventoryItem,
  Supplier,
  Order,
  CartItem,
  OrderType,
  PaymentMethod,
  CashDrawerShift,
  Customer,
  CustomerAccountTransaction,
  Reservation,
  Expense,
  AuditLog,
  RestaurantSettings,
  ItemVariant,
  AddOnOption
} from '../types/pos';
import {
  INITIAL_STAFF,
  INITIAL_CATEGORIES,
  INITIAL_MENU_ITEMS,
  INITIAL_TABLES,
  INITIAL_INVENTORY,
  INITIAL_SUPPLIERS,
  INITIAL_SETTINGS,
  INITIAL_CUSTOMERS,
  INITIAL_RESERVATIONS,
  INITIAL_EXPENSES,
  INITIAL_CASH_SHIFT,
  INITIAL_AUDIT_LOGS
} from '../data/initialData';
import { generateOrderNumber } from '../utils/formatters';

interface PosContextType {
  currentUser: StaffUser | null;
  staffList: StaffUser[];
  categories: MenuCategory[];
  menuItems: MenuItem[];
  tables: TableItem[];
  inventory: InventoryItem[];
  suppliers: Supplier[];
  orders: Order[];
  customers: Customer[];
  reservations: Reservation[];
  expenses: Expense[];
  auditLogs: AuditLog[];
  settings: RestaurantSettings;
  activeOrder: Order;
  heldOrders: Order[];
  cashShift: CashDrawerShift;
  isOnline: boolean;
  selectedReceiptOrder: Order | null;
  isReceiptModalOpen: boolean;
  isPinLockOpen: boolean;

  // Actions
  loginWithPin: (pin: string) => boolean;
  loginWithCredentials: (email: string, pin: string) => boolean;
  adminEmergencyLogin: (data: { emailOrPhone: string; securityKey: string; newPin?: string }) => { success: boolean; message: string };
  registerOwner: (data: { name: string; email: string; phone: string; pin: string; restaurantName: string }) => boolean;
  logout: () => void;
  openPinLock: () => void;
  closePinLock: () => void;
  addStaff: (staff: Omit<StaffUser, 'id'>) => void;
  updateStaff: (staff: StaffUser) => void;
  deleteStaff: (id: string) => void;
  resetStaffPin: (staffId: string, newPin: string) => boolean;
  resetSystemToZero: (adminPin: string, options?: { resetInventoryStock?: boolean }) => { success: boolean; error?: string };

  // POS Cart Actions
  setOrderType: (type: OrderType) => void;
  assignTable: (table: TableItem | null) => void;
  setCustomerInfo: (name: string, phone?: string, deliveryAddress?: string) => void;
  addItemToCart: (item: MenuItem, variant?: ItemVariant, addOns?: AddOnOption[], notes?: string) => void;
  updateCartItemQty: (cartItemId: string, delta: number) => void;
  removeCartItem: (cartItemId: string) => void;
  setCartItemNote: (cartItemId: string, notes: string) => void;
  clearActiveCart: () => void;
  applyDiscount: (type: 'percentage' | 'fixed', value: number) => void;
  holdOrder: () => void;
  resumeOrder: (orderId: string) => void;
  deleteHeldOrder: (orderId: string) => void;
  sendToKitchen: () => void;
  completeOrderPayment: (method: PaymentMethod, paymentDetails: {
    tendered?: number;
    referenceNumber?: string;
    splitItems?: { method: PaymentMethod; amount: number; ref?: string }[];
  }) => Order;
  voidOrder: (orderId: string, reason: string) => void;
  updateKitchenStatus: (orderId: string, cartItemId: string, status: 'pending' | 'cooking' | 'ready' | 'served') => void;

  // Receipts & Printing
  openReceiptModal: (order: Order, isReprint?: boolean) => void;
  closeReceiptModal: () => void;

  // Cash Drawer
  openNewShift: (openingCash: number) => void;
  addCashTx: (type: 'cash_in' | 'cash_out', amount: number, reason: string) => void;
  closeShift: (actualCash: number, closingNotes?: string) => void;

  // Menu Management
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (id: string) => void;
  toggleItemAvailability: (id: string) => void;
  addCategory: (cat: Omit<MenuCategory, 'id'>) => void;

  // Table Management
  addTable: (table: Omit<TableItem, 'id'>) => void;
  updateTable: (table: TableItem) => void;
  deleteTable: (id: string) => void;
  updateTableStatus: (tableId: string, status: TableItem['status']) => void;

  // Inventory Management
  adjustInventory: (itemId: string, type: 'stock_in' | 'stock_out' | 'wastage', qty: number, reason: string) => void;
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateInventoryItem: (item: InventoryItem) => void;
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;

  // Reservations & Customers
  addReservation: (res: Omit<Reservation, 'id' | 'createdAt'>) => void;
  updateReservationStatus: (id: string, status: Reservation['status']) => void;
  addCustomer: (cust: Omit<Customer, 'id' | 'createdAt' | 'totalVisits' | 'totalSpent'>) => void;
  updateCustomer: (customer: Customer) => void;
  topUpComplementaryAccount: (customerId: string, amount: number, notes?: string) => void;
  setOrderCustomer: (customer: Customer | null) => void;

  // Expenses & Settings
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateSettings: (newSettings: Partial<RestaurantSettings>) => void;
  logAudit: (action: string, details: string, severity?: 'info' | 'warning' | 'critical') => void;
}

const PosContext = createContext<PosContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_PREFIX = 'jojofoodies_';

function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + key) || localStorage.getItem('matookepos_' + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.error(`Error loading localStorage key: ${key}`, err);
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing localStorage key: ${key}`, err);
  }
}

export const PosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Staff & Auth
  const [staffList, setStaffList] = useState<StaffUser[]>(() => getStored('staff', INITIAL_STAFF));
  const [currentUser, setCurrentUser] = useState<StaffUser | null>(() => getStored('current_user', INITIAL_STAFF[0]));
  const [isPinLockOpen, setIsPinLockOpen] = useState(false);

  // Settings
  const [settings, setSettings] = useState<RestaurantSettings>(() => {
    const loaded = getStored('settings', INITIAL_SETTINGS);
    if (!loaded.name || loaded.name === 'KLA Kampala Bistro & Grill' || loaded.name === 'MatookePOS') {
      return { ...loaded, name: 'JOJO FOODIES', legalName: 'JOJO FOODIES Ltd' };
    }
    return loaded;
  });

  // Menu & Categories
  const [categories, setCategories] = useState<MenuCategory[]>(() => getStored('categories', INITIAL_CATEGORIES));
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => getStored('menu_items', INITIAL_MENU_ITEMS));

  // Tables
  const [tables, setTables] = useState<TableItem[]>(() => getStored('tables', INITIAL_TABLES));

  // Inventory & Suppliers
  const [inventory, setInventory] = useState<InventoryItem[]>(() => getStored('inventory', INITIAL_INVENTORY));
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => getStored('suppliers', INITIAL_SUPPLIERS));

  // Orders
  const [orders, setOrders] = useState<Order[]>(() => getStored('orders', []));
  const [heldOrders, setHeldOrders] = useState<Order[]>(() => getStored('held_orders', []));

  // Cash Drawer Shift
  const [cashShift, setCashShift] = useState<CashDrawerShift>(() => getStored('cash_shift', INITIAL_CASH_SHIFT));

  // Customers, Reservations, Expenses, Audit Logs
  const [customers, setCustomers] = useState<Customer[]>(() => getStored('customers', INITIAL_CUSTOMERS));
  const [reservations, setReservations] = useState<Reservation[]>(() => getStored('reservations', INITIAL_RESERVATIONS));
  const [expenses, setExpenses] = useState<Expense[]>(() => getStored('expenses', INITIAL_EXPENSES));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => getStored('audit_logs', INITIAL_AUDIT_LOGS));

  // Online / Offline Status
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Receipt Modal State
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Active Draft POS Order
  const createFreshOrder = useCallback((type: OrderType = 'dine-in'): Order => {
    return {
      id: 'ord-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      orderNumber: generateOrderNumber(orders.length + 101),
      type,
      items: [],
      subtotal: 0,
      discountAmount: 0,
      vatRate: settings.isVatEnabled ? settings.vatRate : 0,
      vatAmount: 0,
      serviceChargeRate: settings.isServiceChargeEnabled ? settings.serviceChargeRate : 0,
      serviceChargeAmount: 0,
      totalAmount: 0,
      status: 'draft',
      paymentStatus: 'unpaid',
      payments: [],
      staffId: currentUser?.id || 'staff-1',
      staffName: currentUser?.name || 'Staff',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }, [orders.length, settings, currentUser]);

  const [activeOrder, setActiveOrder] = useState<Order>(() => createFreshOrder('dine-in'));

  // Network offline listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save to localStorage whenever key slices update
  useEffect(() => setStored('staff', staffList), [staffList]);
  useEffect(() => setStored('current_user', currentUser), [currentUser]);
  useEffect(() => setStored('settings', settings), [settings]);
  useEffect(() => setStored('categories', categories), [categories]);
  useEffect(() => setStored('menu_items', menuItems), [menuItems]);
  useEffect(() => setStored('tables', tables), [tables]);
  useEffect(() => setStored('inventory', inventory), [inventory]);
  useEffect(() => setStored('suppliers', suppliers), [suppliers]);
  useEffect(() => setStored('orders', orders), [orders]);
  useEffect(() => setStored('held_orders', heldOrders), [heldOrders]);
  useEffect(() => setStored('cash_shift', cashShift), [cashShift]);
  useEffect(() => setStored('customers', customers), [customers]);
  useEffect(() => setStored('reservations', reservations), [reservations]);
  useEffect(() => setStored('expenses', expenses), [expenses]);
  useEffect(() => setStored('audit_logs', auditLogs), [auditLogs]);

  // Recalculate totals for activeOrder whenever items or discount changes
  const recalculateOrderTotals = (order: Order): Order => {
    const subtotal = order.items.reduce((sum, item) => sum + item.totalPrice, 0);

    let discountAmount = 0;
    if (order.discountType === 'percentage' && order.discountValue) {
      discountAmount = Math.round(subtotal * (order.discountValue / 100));
    } else if (order.discountType === 'fixed' && order.discountValue) {
      discountAmount = Math.min(order.discountValue, subtotal);
    }

    const discountedSubtotal = Math.max(0, subtotal - discountAmount);

    let vatAmount = 0;
    if (settings.isVatEnabled && settings.vatRate > 0) {
      // In Uganda VAT is included or calculated on taxable value
      vatAmount = Math.round(discountedSubtotal * settings.vatRate);
    }

    let serviceChargeAmount = 0;
    if (settings.isServiceChargeEnabled && settings.serviceChargeRate > 0) {
      serviceChargeAmount = Math.round(discountedSubtotal * settings.serviceChargeRate);
    }

    const totalAmount = discountedSubtotal + vatAmount + serviceChargeAmount;

    return {
      ...order,
      subtotal,
      discountAmount,
      vatRate: settings.isVatEnabled ? settings.vatRate : 0,
      vatAmount,
      serviceChargeRate: settings.isServiceChargeEnabled ? settings.serviceChargeRate : 0,
      serviceChargeAmount,
      totalAmount,
      updatedAt: new Date().toISOString(),
    };
  };

  // Audit Logger
  const logAudit = useCallback((action: string, details: string, severity: 'info' | 'warning' | 'critical' = 'info') => {
    const newEntry: AuditLog = {
      id: 'aud-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      action,
      details,
      performedBy: currentUser?.name || 'System',
      role: currentUser?.role || 'Admin',
      timestamp: new Date().toISOString(),
      severity,
    };
    setAuditLogs((prev) => [newEntry, ...prev.slice(0, 199)]);
  }, [currentUser]);

  // Auth Functions
  const loginWithPin = useCallback((pin: string): boolean => {
    const staff = staffList.find((s) => s.pin === pin && s.isActive);
    if (staff) {
      setCurrentUser(staff);
      setIsPinLockOpen(false);
      logAudit('PIN Login', `Staff ${staff.name} (${staff.role}) unlocked POS`);
      return true;
    }
    return false;
  }, [staffList, logAudit]);

  const loginWithCredentials = useCallback((email: string, pin: string): boolean => {
    const staff = staffList.find((s) => s.email.toLowerCase() === email.toLowerCase() && s.pin === pin && s.isActive);
    if (staff) {
      setCurrentUser(staff);
      setIsPinLockOpen(false);
      logAudit('Email Login', `User ${staff.name} logged into POS`);
      return true;
    }
    return false;
  }, [staffList, logAudit]);

  const adminEmergencyLogin = useCallback(
    (data: { emailOrPhone: string; securityKey: string; newPin?: string }): { success: boolean; message: string } => {
      const inputId = data.emailOrPhone.trim().toLowerCase();
      const inputKey = data.securityKey.trim();

      if (!inputId) {
        return { success: false, message: 'Please enter your administrator email, username, or phone number.' };
      }
      if (!inputKey) {
        return { success: false, message: 'Please provide the registered phone or master recovery key.' };
      }

      // Find active Admin account(s)
      const admins = staffList.filter((s) => s.role === 'Admin' && s.isActive);
      if (admins.length === 0) {
        return { success: false, message: 'No active Administrator account found in the system.' };
      }

      // Match admin by email, name, or phone number
      const matchedAdmin = admins.find((admin) => {
        const emailMatch = admin.email && admin.email.toLowerCase() === inputId;
        const nameMatch = admin.name.toLowerCase() === inputId;
        const cleanAdminPhone = (admin.phone || '').replace(/[^\d+]/g, '');
        const cleanInputId = inputId.replace(/[^\d+]/g, '');
        const phoneMatch = cleanAdminPhone.length >= 4 && cleanInputId.length >= 4 && (cleanAdminPhone === cleanInputId || cleanAdminPhone.endsWith(cleanInputId));
        return emailMatch || nameMatch || phoneMatch;
      });

      if (!matchedAdmin) {
        return { success: false, message: 'No administrator account found matching that email, name, or phone.' };
      }

      // Validate security key:
      // 1. Matches admin's registered phone digits (exact or last 4-9 digits)
      // 2. OR matches restaurant URA TIN number
      // 3. OR matches official master emergency phrase ("JOJO2026", "JOJOPOS", "ADMIN2026")
      const cleanAdminPhone = (matchedAdmin.phone || '').replace(/[^\d]/g, '');
      const cleanInputKey = inputKey.replace(/[^\d]/g, '');
      const isPhoneKeyMatch = cleanAdminPhone.length >= 4 && cleanInputKey.length >= 4 && (cleanAdminPhone === cleanInputKey || cleanAdminPhone.endsWith(cleanInputKey));
      const cleanTin = (settings.tinNumber || '').replace(/[^\d]/g, '');
      const isTinMatch = cleanTin.length >= 4 && cleanInputKey.length >= 4 && cleanTin === cleanInputKey;
      const isPhraseMatch = ['jojo2026', 'jojopos', 'jojofoodies', 'admin2026', 'recovery'].includes(inputKey.toLowerCase());

      if (!isPhoneKeyMatch && !isTinMatch && !isPhraseMatch) {
        return { success: false, message: 'Security verification key or phone mismatch. Please check and try again.' };
      }

      // If new PIN provided, validate 4 numeric digits and update
      let updatedAdmin = matchedAdmin;
      if (data.newPin) {
        if (!/^\d{4}$/.test(data.newPin)) {
          return { success: false, message: 'New master PIN must be exactly 4 numeric digits.' };
        }
        setStaffList((prev) =>
          prev.map((s) => (s.id === matchedAdmin.id ? { ...s, pin: data.newPin! } : s))
        );
        updatedAdmin = { ...matchedAdmin, pin: data.newPin };
      }

      setCurrentUser(updatedAdmin);
      setIsPinLockOpen(false);
      logAudit(
        'Admin Emergency Recovery',
        `Admin ${matchedAdmin.name} logged in via alternative recovery verification${data.newPin ? ' and reset their master PIN' : ''}`
      );

      return {
        success: true,
        message: data.newPin
          ? `Welcome back, ${matchedAdmin.name}! Your new master PIN is now active.`
          : `Welcome back, ${matchedAdmin.name}! Alternative login verified successfully.`,
      };
    },
    [staffList, settings.tinNumber, logAudit]
  );

  const registerOwner = useCallback((data: { name: string; email: string; phone: string; pin: string; restaurantName: string }): boolean => {
    const newOwner: StaffUser = {
      id: 'staff-owner-' + Date.now(),
      name: data.name,
      email: data.email,
      phone: data.phone,
      pin: data.pin,
      role: 'Admin',
      isActive: true,
    };
    setStaffList((prev) => [newOwner, ...prev]);
    setCurrentUser(newOwner);
    if (data.restaurantName) {
      setSettings((prev) => ({ ...prev, name: data.restaurantName }));
    }
    logAudit('Owner Registered', `New restaurant owner registered: ${data.name}`);
    return true;
  }, [logAudit]);

  const logout = useCallback(() => {
    logAudit('Staff Logout', `${currentUser?.name} logged out`);
    setCurrentUser(null);
    setIsPinLockOpen(true);
  }, [currentUser, logAudit]);

  const openPinLock = useCallback(() => setIsPinLockOpen(true), []);
  const closePinLock = useCallback(() => setIsPinLockOpen(false), []);

  const addStaff = useCallback((staff: Omit<StaffUser, 'id'>) => {
    const newStaff: StaffUser = {
      ...staff,
      id: 'staff-' + Date.now(),
    };
    setStaffList((prev) => [...prev, newStaff]);
    logAudit('Staff Created', `Added ${staff.name} with role ${staff.role}`);
  }, [logAudit]);

  const updateStaff = useCallback((staff: StaffUser) => {
    setStaffList((prev) => prev.map((s) => (s.id === staff.id ? staff : s)));
    logAudit('Staff Updated', `Updated profile of ${staff.name}`);
  }, [logAudit]);

  const deleteStaff = useCallback((id: string) => {
    setStaffList((prev) => prev.filter((s) => s.id !== id));
    logAudit('Staff Removed', `Removed staff member #${id}`);
  }, [logAudit]);

  const resetStaffPin = useCallback((staffId: string, newPin: string) => {
    if (!/^\d{4}$/.test(newPin)) {
      return false;
    }
    setStaffList((prev) =>
      prev.map((s) => (s.id === staffId ? { ...s, pin: newPin } : s))
    );
    // If resetting currently logged in user's PIN, update currentUser
    setCurrentUser((prev) => (prev && prev.id === staffId ? { ...prev, pin: newPin } : prev));
    logAudit('PIN Reset', `Password/PIN reset for staff member #${staffId}`);
    return true;
  }, [logAudit]);

  const resetSystemToZero = useCallback((adminPin: string, options?: { resetInventoryStock?: boolean }): { success: boolean; error?: string } => {
    const admin = staffList.find((s) => s.role === 'Admin' && s.pin === adminPin && s.isActive);
    if (!admin) {
      return { success: false, error: 'Incorrect Admin PIN. System reset aborted.' };
    }

    // 1. Reset all orders and held orders
    setOrders([]);
    setHeldOrders([]);

    // 2. Reset expenses
    setExpenses([]);

    // 3. Reset cash drawer shift & balances
    const cleanShift: CashDrawerShift = {
      id: 'shift-' + Date.now(),
      shiftNumber: 1,
      status: 'open',
      openedAt: new Date().toISOString(),
      openedBy: admin.name,
      openingCash: 0,
      cashSalesTotal: 0,
      cashInTotal: 0,
      cashOutTotal: 0,
      expectedCash: 0,
      transactions: [],
    };
    setCashShift(cleanShift);

    // 4. Reset table statuses to available
    setTables((prev) =>
      prev.map((t) => ({
        ...t,
        status: 'available' as const,
        occupiedSince: undefined,
        activeOrderId: undefined,
        currentGuests: 0,
      }))
    );

    // 5. Reset reservations
    setReservations([]);

    // 6. Reset active cart
    setActiveOrder(createFreshOrder('dine-in'));

    // 7. Optional reset inventory stock
    if (options?.resetInventoryStock) {
      setInventory((prev) => prev.map((item) => ({ ...item, currentStock: 0 })));
    }

    // 8. Log audit trail
    logAudit(
      'System Reset to Zero',
      `Complete system reset to zero authorized by ${admin.name} (${admin.role}). All sales, orders, and cash float reset to 0 UGX.`
    );

    return { success: true };
  }, [staffList, createFreshOrder, logAudit]);

  // POS Cart Actions
  const setOrderType = useCallback((type: OrderType) => {
    setActiveOrder((prev) => recalculateOrderTotals({ ...prev, type }));
  }, []);

  const assignTable = useCallback((table: TableItem | null) => {
    setActiveOrder((prev) => ({
      ...prev,
      tableId: table?.id,
      tableName: table?.name,
    }));
    if (table) {
      setTables((prev) =>
        prev.map((t) => (t.id === table.id ? { ...t, status: 'occupied' } : t))
      );
    }
  }, []);

  const setOrderCustomer = useCallback((customer: Customer | null) => {
    setActiveOrder((prev) => ({
      ...prev,
      customerId: customer?.id,
      customerName: customer?.name || '',
      customerPhone: customer?.phone || '',
      deliveryAddress: customer?.address || prev.deliveryAddress,
      isComplementaryOrder: customer?.isComplementaryAccount || false,
      remainingAccountBalance: customer?.accountBalance,
    }));
  }, []);

  const setCustomerInfo = useCallback((name: string, phone?: string, deliveryAddress?: string) => {
    const matched = customers.find(c => 
      (phone && c.phone && c.phone.trim() === phone.trim()) || 
      (name && c.name.toLowerCase().trim() === name.toLowerCase().trim())
    );

    setActiveOrder((prev) => ({
      ...prev,
      customerId: matched?.id || (name ? prev.customerId : undefined),
      customerName: name,
      customerPhone: phone,
      deliveryAddress,
      isComplementaryOrder: matched ? !!matched.isComplementaryAccount : prev.isComplementaryOrder,
      remainingAccountBalance: matched ? matched.accountBalance : prev.remainingAccountBalance,
    }));
  }, [customers]);

  const addItemToCart = useCallback((item: MenuItem, variant?: ItemVariant, addOns: AddOnOption[] = [], notes?: string) => {
    setActiveOrder((prev) => {
      const unitPrice = variant ? variant.price : item.price;
      const addOnsTotal = addOns.reduce((sum, a) => sum + a.price, 0);
      const singleItemTotal = unitPrice + addOnsTotal;

      // Check if identical item (same menuItemId, variantId, and addOns) already exists
      const existingIndex = prev.items.findIndex(
        (i) =>
          i.menuItemId === item.id &&
          i.variantId === (variant?.id || undefined) &&
          JSON.stringify(i.selectedAddOns.map((a) => a.id).sort()) ===
            JSON.stringify(addOns.map((a) => a.id).sort())
      );

      let updatedItems: CartItem[];
      if (existingIndex > -1) {
        updatedItems = prev.items.map((cartItem, idx) => {
          if (idx === existingIndex) {
            const newQty = cartItem.quantity + 1;
            return {
              ...cartItem,
              quantity: newQty,
              totalPrice: singleItemTotal * newQty,
              notes: notes || cartItem.notes,
            };
          }
          return cartItem;
        });
      } else {
        const newCartItem: CartItem = {
          cartItemId: 'ci-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
          menuItemId: item.id,
          name: item.name,
          variantId: variant?.id,
          variantName: variant?.name,
          unitPrice,
          quantity: 1,
          selectedAddOns: addOns,
          notes,
          totalPrice: singleItemTotal,
          costPrice: item.costPrice,
          kitchenStatus: 'pending',
        };
        updatedItems = [...prev.items, newCartItem];
      }

      return recalculateOrderTotals({ ...prev, items: updatedItems });
    });
  }, []);

  const updateCartItemQty = useCallback((cartItemId: string, delta: number) => {
    setActiveOrder((prev) => {
      const updatedItems = prev.items
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            const singleUnitPrice = item.unitPrice + item.selectedAddOns.reduce((s, a) => s + a.price, 0);
            return {
              ...item,
              quantity: newQty,
              totalPrice: singleUnitPrice * newQty,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];

      return recalculateOrderTotals({ ...prev, items: updatedItems });
    });
  }, []);

  const removeCartItem = useCallback((cartItemId: string) => {
    setActiveOrder((prev) => {
      const updatedItems = prev.items.filter((i) => i.cartItemId !== cartItemId);
      return recalculateOrderTotals({ ...prev, items: updatedItems });
    });
  }, []);

  const setCartItemNote = useCallback((cartItemId: string, notes: string) => {
    setActiveOrder((prev) => {
      const updatedItems = prev.items.map((i) =>
        i.cartItemId === cartItemId ? { ...i, notes } : i
      );
      return { ...prev, items: updatedItems };
    });
  }, []);

  const clearActiveCart = useCallback(() => {
    setActiveOrder(createFreshOrder('dine-in'));
  }, [createFreshOrder]);

  const applyDiscount = useCallback((type: 'percentage' | 'fixed', value: number) => {
    setActiveOrder((prev) =>
      recalculateOrderTotals({
        ...prev,
        discountType: type,
        discountValue: value,
      })
    );
  }, []);

  const holdOrder = useCallback(() => {
    if (activeOrder.items.length === 0) return;
    const held: Order = {
      ...activeOrder,
      status: 'held',
      updatedAt: new Date().toISOString(),
    };
    setHeldOrders((prev) => [held, ...prev]);
    logAudit('Order Held', `Order #${held.orderNumber} put on hold with ${held.items.length} items`);
    setActiveOrder(createFreshOrder('dine-in'));
  }, [activeOrder, createFreshOrder, logAudit]);

  const resumeOrder = useCallback((orderId: string) => {
    const target = heldOrders.find((o) => o.id === orderId);
    if (!target) return;
    setHeldOrders((prev) => prev.filter((o) => o.id !== orderId));
    setActiveOrder(target);
    logAudit('Order Resumed', `Resumed held order #${target.orderNumber}`);
  }, [heldOrders, logAudit]);

  const deleteHeldOrder = useCallback((orderId: string) => {
    setHeldOrders((prev) => prev.filter((o) => o.id !== orderId));
    logAudit('Held Order Removed', `Cancelled held order #${orderId}`);
  }, [logAudit]);

  const sendToKitchen = useCallback(() => {
    if (activeOrder.items.length === 0) return;

    // Check if complementary customer has low funds
    if (activeOrder.customerId) {
      const cust = customers.find(c => c.id === activeOrder.customerId);
      if (cust && cust.isComplementaryAccount) {
        const balance = cust.accountBalance ?? 0;
        const minLimit = cust.accountCreditLimit ?? 0;
        if (balance - activeOrder.totalAmount < minLimit) {
          alert(`Order Blocked: ${cust.name} has low complementary account funds! Available: UGX ${balance.toLocaleString()}, Required: UGX ${activeOrder.totalAmount.toLocaleString()}. Please top up this account before placing kitchen orders.`);
          return;
        }
      }
    }

    const kitchenOrder: Order = {
      ...activeOrder,
      status: 'kitchen_pending',
      staffId: currentUser?.id || 'staff-1',
      staffName: currentUser?.name || 'Staff',
      updatedAt: new Date().toISOString(),
    };

    // Add to orders list
    setOrders((prev) => [kitchenOrder, ...prev.filter((o) => o.id !== kitchenOrder.id)]);
    logAudit('Sent to KDS', `Order #${kitchenOrder.orderNumber} dispatched to Kitchen Display`);

    // Reset active order but keep table if dine-in
    setActiveOrder(createFreshOrder('dine-in'));
  }, [activeOrder, currentUser, createFreshOrder, logAudit, customers]);

  // Complete Payment and Deduct Inventory Recipes
  const completeOrderPayment = useCallback((method: PaymentMethod, paymentDetails: {
    tendered?: number;
    referenceNumber?: string;
    splitItems?: { method: PaymentMethod; amount: number; ref?: string }[];
  }): Order => {
    // If complementary account payment, verify balance first
    const isComplementary = method === 'complementary_account' || !!paymentDetails.splitItems?.some(s => s.method === 'complementary_account');
    const complementaryCharge = method === 'complementary_account' 
      ? activeOrder.totalAmount 
      : (paymentDetails.splitItems?.filter(s => s.method === 'complementary_account').reduce((sum, s) => sum + s.amount, 0) || 0);

    let targetCust = customers.find(c => c.id === activeOrder.customerId) ||
      customers.find(c => activeOrder.customerPhone && c.phone === activeOrder.customerPhone) ||
      customers.find(c => activeOrder.customerName && c.name.toLowerCase() === activeOrder.customerName.toLowerCase());

    let finalBalAfter: number | undefined = undefined;

    if (isComplementary && targetCust && targetCust.isComplementaryAccount) {
      const curBal = targetCust.accountBalance ?? 0;
      const minLimit = targetCust.accountCreditLimit ?? 0;
      if (curBal - complementaryCharge < minLimit) {
        throw new Error(`Insufficient complementary account funds! Available: UGX ${curBal.toLocaleString()}, Required: UGX ${complementaryCharge.toLocaleString()}`);
      }
      finalBalAfter = curBal - complementaryCharge;
    }

    const finalOrder: Order = {
      ...activeOrder,
      customerId: targetCust?.id || activeOrder.customerId,
      isComplementaryOrder: isComplementary,
      remainingAccountBalance: finalBalAfter !== undefined ? finalBalAfter : activeOrder.remainingAccountBalance,
      status: 'completed',
      paymentStatus: 'paid',
      payments: paymentDetails.splitItems
        ? paymentDetails.splitItems.map((s, idx) => ({
            id: 'pay-' + Date.now() + '-' + idx,
            method: s.method,
            amount: s.amount,
            referenceNumber: s.ref,
            timestamp: new Date().toISOString(),
          }))
        : [
            {
              id: 'pay-' + Date.now(),
              method,
              amount: activeOrder.totalAmount,
              referenceNumber: paymentDetails.referenceNumber,
              tenderedCash: paymentDetails.tendered,
              changeGiven: paymentDetails.tendered ? Math.max(0, paymentDetails.tendered - activeOrder.totalAmount) : 0,
              timestamp: new Date().toISOString(),
            },
          ],
      staffId: currentUser?.id || activeOrder.staffId,
      staffName: currentUser?.name || activeOrder.staffName,
      updatedAt: new Date().toISOString(),
    };

    // Save finalized order to list
    setOrders((prev) => [finalOrder, ...prev.filter((o) => o.id !== finalOrder.id)]);

    // Release table if occupied
    if (finalOrder.tableId) {
      setTables((prev) =>
        prev.map((t) => (t.id === finalOrder.tableId ? { ...t, status: 'available' } : t))
      );
    }

    // Cash drawer shift cash sales addition
    if (method === 'cash') {
      setCashShift((prev) => ({
        ...prev,
        cashSalesTotal: prev.cashSalesTotal + finalOrder.totalAmount,
        expectedCash: prev.expectedCash + finalOrder.totalAmount,
      }));
    } else if (paymentDetails.splitItems) {
      const cashPortion = paymentDetails.splitItems
        .filter((s) => s.method === 'cash')
        .reduce((sum, s) => sum + s.amount, 0);
      if (cashPortion > 0) {
        setCashShift((prev) => ({
          ...prev,
          cashSalesTotal: prev.cashSalesTotal + cashPortion,
          expectedCash: prev.expectedCash + cashPortion,
        }));
      }
    }

    // AUTOMATIC RECIPE / INGREDIENT DEDUCTION FROM INVENTORY!
    setInventory((prevInv) => {
      const updatedInv = [...prevInv];
      finalOrder.items.forEach((cartItem) => {
        const menuItem = menuItems.find((m) => m.id === cartItem.menuItemId);
        if (menuItem?.ingredients && menuItem.ingredients.length > 0) {
          menuItem.ingredients.forEach((ing) => {
            const targetInvIndex = updatedInv.findIndex((i) => i.id === ing.ingredientId);
            if (targetInvIndex > -1) {
              const deduction = ing.quantityNeeded * cartItem.quantity;
              const currentStock = updatedInv[targetInvIndex].currentStock;
              const newStock = Math.max(0, currentStock - deduction);
              updatedInv[targetInvIndex] = {
                ...updatedInv[targetInvIndex],
                currentStock: Math.round(newStock * 100) / 100,
              };
            }
          });
        }
      });
      return updatedInv;
    });

    // Update customer stats & complementary account balance
    if (targetCust || finalOrder.customerPhone || finalOrder.customerName) {
      setCustomers((prev) => {
        const existing = prev.find(
          (c) => (targetCust && c.id === targetCust.id) ||
                 (finalOrder.customerPhone && c.phone === finalOrder.customerPhone) ||
                 (finalOrder.customerName && c.name.toLowerCase() === finalOrder.customerName.toLowerCase())
        );
        if (existing) {
          const isComp = isComplementary && existing.isComplementaryAccount;
          const newBal = isComp && finalBalAfter !== undefined ? finalBalAfter : existing.accountBalance;
          const isLow = isComp && newBal !== undefined ? newBal <= (existing.accountCreditLimit ?? 0) : false;
          
          let updatedHistory = existing.accountHistory || [];
          if (isComp && complementaryCharge > 0) {
            const tx: CustomerAccountTransaction = {
              id: 'tx-' + Date.now(),
              date: new Date().toISOString(),
              type: 'order_charge',
              amount: complementaryCharge,
              balanceAfter: newBal ?? 0,
              orderNumber: finalOrder.orderNumber,
              notes: `Order #${finalOrder.orderNumber} (${finalOrder.items.length} items)`,
              recordedBy: currentUser?.name || 'Staff'
            };
            updatedHistory = [tx, ...updatedHistory];
          }

          return prev.map((c) =>
            c.id === existing.id
              ? {
                  ...c,
                  totalVisits: c.totalVisits + 1,
                  totalSpent: c.totalSpent + finalOrder.totalAmount,
                  accountBalance: newBal,
                  accountStatus: isComp ? (isLow ? 'low_funds' : 'active') : c.accountStatus,
                  accountHistory: updatedHistory,
                }
              : c
          );
        } else if (finalOrder.customerName) {
          const newCust: Customer = {
            id: 'cust-' + Date.now(),
            name: finalOrder.customerName,
            phone: finalOrder.customerPhone || '',
            address: finalOrder.deliveryAddress,
            totalVisits: 1,
            totalSpent: finalOrder.totalAmount,
            createdAt: new Date().toISOString(),
          };
          return [newCust, ...prev];
        }
        return prev;
      });
    }

    logAudit('Order Paid', `Order #${finalOrder.orderNumber} completed via ${method.toUpperCase()} for UGX ${finalOrder.totalAmount.toLocaleString()}`);

    // Auto open 80mm thermal receipt
    setSelectedReceiptOrder(finalOrder);
    setIsReceiptModalOpen(true);

    // Reset active draft cart
    setActiveOrder(createFreshOrder('dine-in'));

    return finalOrder;
  }, [activeOrder, currentUser, menuItems, createFreshOrder, logAudit]);

  const voidOrder = useCallback((orderId: string, reason: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'voided', voidReason: reason, updatedAt: new Date().toISOString() } : o))
    );
    logAudit('Order Voided', `Order #${orderId} was voided. Reason: ${reason}`, 'warning');
  }, [logAudit]);

  const updateKitchenStatus = useCallback((orderId: string, cartItemId: string, status: 'pending' | 'cooking' | 'ready' | 'served') => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        const updatedItems = order.items.map((item) =>
          item.cartItemId === cartItemId ? { ...item, kitchenStatus: status } : item
        );
        const allReady = updatedItems.every((i) => i.kitchenStatus === 'ready' || i.kitchenStatus === 'served');
        return {
          ...order,
          items: updatedItems,
          status: allReady ? 'kitchen_ready' : 'kitchen_preparing',
          updatedAt: new Date().toISOString(),
        };
      })
    );
  }, []);

  // Receipts
  const openReceiptModal = useCallback((order: Order, isReprint = false) => {
    setSelectedReceiptOrder({ ...order, isReprinted: isReprint });
    setIsReceiptModalOpen(true);
  }, []);

  const closeReceiptModal = useCallback(() => {
    setIsReceiptModalOpen(false);
    setSelectedReceiptOrder(null);
  }, []);

  // Cash Drawer Management
  const openNewShift = useCallback((openingCash: number) => {
    const newShift: CashDrawerShift = {
      id: 'shift-' + Date.now(),
      shiftNumber: (cashShift?.shiftNumber || 100) + 1,
      status: 'open',
      openedAt: new Date().toISOString(),
      openedBy: currentUser?.name || 'Staff',
      openingCash,
      cashSalesTotal: 0,
      cashInTotal: 0,
      cashOutTotal: 0,
      expectedCash: openingCash,
      transactions: [],
    };
    setCashShift(newShift);
    logAudit('Cash Shift Opened', `Shift #${newShift.shiftNumber} opened with opening float of UGX ${openingCash.toLocaleString()}`);
  }, [cashShift, currentUser, logAudit]);

  const addCashTx = useCallback((type: 'cash_in' | 'cash_out', amount: number, reason: string) => {
    const tx = {
      id: 'ctx-' + Date.now(),
      type,
      amount,
      reason,
      staffId: currentUser?.id || 'staff-1',
      staffName: currentUser?.name || 'Staff',
      timestamp: new Date().toISOString(),
    };

    setCashShift((prev) => {
      const cashIn = type === 'cash_in' ? prev.cashInTotal + amount : prev.cashInTotal;
      const cashOut = type === 'cash_out' ? prev.cashOutTotal + amount : prev.cashOutTotal;
      const expected = prev.openingCash + prev.cashSalesTotal + cashIn - cashOut;

      return {
        ...prev,
        cashInTotal: cashIn,
        cashOutTotal: cashOut,
        expectedCash: expected,
        transactions: [tx, ...prev.transactions],
      };
    });

    logAudit(`Cash ${type === 'cash_in' ? 'Added' : 'Removed'}`, `UGX ${amount.toLocaleString()} - Reason: ${reason}`, 'warning');
  }, [currentUser, logAudit]);

  const closeShift = useCallback((actualCash: number, closingNotes?: string) => {
    setCashShift((prev) => {
      const difference = actualCash - prev.expectedCash;
      const closed: CashDrawerShift = {
        ...prev,
        status: 'closed',
        closedAt: new Date().toISOString(),
        closedBy: currentUser?.name || 'Staff',
        actualCash,
        difference,
        closingNotes,
      };
      return closed;
    });
    logAudit('Cash Shift Closed', `Shift reconciled. Counted: UGX ${actualCash.toLocaleString()}`, 'critical');
  }, [currentUser, logAudit]);

  // Menu Items & Categories
  const addMenuItem = useCallback((item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = { ...item, id: 'menu-' + Date.now() };
    setMenuItems((prev) => [...prev, newItem]);
    logAudit('Menu Item Added', `Added ${newItem.name} (UGX ${newItem.price})`);
  }, [logAudit]);

  const updateMenuItem = useCallback((item: MenuItem) => {
    setMenuItems((prev) => prev.map((m) => (m.id === item.id ? item : m)));
    logAudit('Menu Item Updated', `Updated ${item.name}`);
  }, [logAudit]);

  const deleteMenuItem = useCallback((id: string) => {
    setMenuItems((prev) => prev.filter((m) => m.id !== id));
    logAudit('Menu Item Deleted', `Deleted menu item #${id}`);
  }, [logAudit]);

  const toggleItemAvailability = useCallback((id: string) => {
    setMenuItems((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isAvailable: !m.isAvailable } : m))
    );
  }, []);

  const addCategory = useCallback((cat: Omit<MenuCategory, 'id'>) => {
    const newCat: MenuCategory = { ...cat, id: 'cat-' + Date.now() };
    setCategories((prev) => [...prev, newCat]);
    logAudit('Category Added', `Added menu category ${cat.name}`);
  }, [logAudit]);

  // Tables
  const addTable = useCallback((table: Omit<TableItem, 'id'>) => {
    const newTbl: TableItem = { ...table, id: 'tbl-' + Date.now() };
    setTables((prev) => [...prev, newTbl]);
  }, []);

  const updateTable = useCallback((table: TableItem) => {
    setTables((prev) => prev.map((t) => (t.id === table.id ? table : t)));
  }, []);

  const deleteTable = useCallback((id: string) => {
    setTables((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updateTableStatus = useCallback((tableId: string, status: TableItem['status']) => {
    setTables((prev) => prev.map((t) => (t.id === tableId ? { ...t, status } : t)));
  }, []);

  // Inventory
  const adjustInventory = useCallback((itemId: string, type: 'stock_in' | 'stock_out' | 'wastage', qty: number, reason: string) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        let newStock = item.currentStock;
        if (type === 'stock_in') newStock += qty;
        else newStock = Math.max(0, newStock - qty);
        return {
          ...item,
          currentStock: Math.round(newStock * 100) / 100,
          lastRestocked: type === 'stock_in' ? new Date().toISOString() : item.lastRestocked,
        };
      })
    );
    logAudit('Inventory Adjusted', `${type.toUpperCase()} of ${qty} for item #${itemId}. Reason: ${reason}`, type === 'wastage' ? 'warning' : 'info');
  }, [logAudit]);

  const addInventoryItem = useCallback((item: Omit<InventoryItem, 'id'>) => {
    const newItem: InventoryItem = { ...item, id: 'inv-' + Date.now() };
    setInventory((prev) => [...prev, newItem]);
    logAudit('Stock Item Added', `Added inventory SKU ${item.sku} - ${item.name}`);
  }, [logAudit]);

  const updateInventoryItem = useCallback((item: InventoryItem) => {
    setInventory((prev) => prev.map((i) => (i.id === item.id ? item : i)));
  }, []);

  const addSupplier = useCallback((supplier: Omit<Supplier, 'id'>) => {
    const newSup: Supplier = { ...supplier, id: 'sup-' + Date.now() };
    setSuppliers((prev) => [...prev, newSup]);
  }, []);

  // Reservations & Customers
  const addReservation = useCallback((res: Omit<Reservation, 'id' | 'createdAt'>) => {
    const newRes: Reservation = {
      ...res,
      id: 'res-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setReservations((prev) => [newRes, ...prev]);
    logAudit('Reservation Booked', `Table reservation for ${res.customerName} (${res.guestCount} guests)`);
  }, [logAudit]);

  const updateReservationStatus = useCallback((id: string, status: Reservation['status']) => {
    setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  }, []);

  const addCustomer = useCallback((cust: Omit<Customer, 'id' | 'createdAt' | 'totalVisits' | 'totalSpent'>) => {
    const newCust: Customer = {
      ...cust,
      id: 'cust-' + Date.now(),
      totalVisits: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString(),
    };
    setCustomers((prev) => [newCust, ...prev]);
  }, []);

  const updateCustomer = useCallback((customer: Customer) => {
    setCustomers((prev) => prev.map((c) => (c.id === customer.id ? customer : c)));
    logAudit('Customer Updated', `Updated profile for customer: ${customer.name}`);
  }, [logAudit]);

  const topUpComplementaryAccount = useCallback((customerId: string, amount: number, notes?: string) => {
    setCustomers((prev) => prev.map((c) => {
      if (c.id === customerId) {
        const curBal = c.accountBalance ?? 0;
        const newBal = curBal + amount;
        const tx: CustomerAccountTransaction = {
          id: 'tx-' + Date.now(),
          date: new Date().toISOString(),
          type: 'top_up',
          amount,
          balanceAfter: newBal,
          notes: notes || 'Account top-up / credit deposit',
          recordedBy: currentUser?.name || 'Staff'
        };
        const isLow = newBal <= (c.accountCreditLimit ?? 0);
        return {
          ...c,
          accountBalance: newBal,
          accountStatus: isLow ? 'low_funds' : 'active',
          accountHistory: [tx, ...(c.accountHistory || [])]
        };
      }
      return c;
    }));
    logAudit('Account Top-Up', `Deposited UGX ${amount.toLocaleString()} to complementary customer account #${customerId}`);
  }, [currentUser, logAudit]);

  // Expenses & Settings
  const addExpense = useCallback((expense: Omit<Expense, 'id'>) => {
    const newExp: Expense = {
      ...expense,
      id: 'exp-' + Date.now(),
    };
    setExpenses((prev) => [newExp, ...prev]);

    // If paid via cash, also track cash drawer payout
    if (expense.paidVia === 'cash') {
      addCashTx('cash_out', expense.amount, `Expense: ${expense.category} - ${expense.description}`);
    }

    logAudit('Expense Recorded', `UGX ${expense.amount.toLocaleString()} - ${expense.category}: ${expense.description}`);
  }, [addCashTx, logAudit]);

  const updateSettings = useCallback((newSettings: Partial<RestaurantSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    logAudit('Settings Updated', 'Restaurant profile and billing settings updated');
  }, [logAudit]);

  return (
    <PosContext.Provider
      value={{
        currentUser,
        staffList,
        categories,
        menuItems,
        tables,
        inventory,
        suppliers,
        orders,
        customers,
        reservations,
        expenses,
        auditLogs,
        settings,
        activeOrder,
        heldOrders,
        cashShift,
        isOnline,
        selectedReceiptOrder,
        isReceiptModalOpen,
        isPinLockOpen,

        loginWithPin,
        loginWithCredentials,
        adminEmergencyLogin,
        registerOwner,
        logout,
        openPinLock,
        closePinLock,
        addStaff,
        updateStaff,
        deleteStaff,
        resetStaffPin,
        resetSystemToZero,

        setOrderType,
        assignTable,
        setCustomerInfo,
        setOrderCustomer,
        addItemToCart,
        updateCartItemQty,
        removeCartItem,
        setCartItemNote,
        clearActiveCart,
        applyDiscount,
        holdOrder,
        resumeOrder,
        deleteHeldOrder,
        sendToKitchen,
        completeOrderPayment,
        voidOrder,
        updateKitchenStatus,

        openReceiptModal,
        closeReceiptModal,

        openNewShift,
        addCashTx,
        closeShift,

        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        toggleItemAvailability,
        addCategory,

        addTable,
        updateTable,
        deleteTable,
        updateTableStatus,

        adjustInventory,
        addInventoryItem,
        updateInventoryItem,
        addSupplier,

        addReservation,
        updateReservationStatus,
        addCustomer,
        updateCustomer,
        topUpComplementaryAccount,

        addExpense,
        updateSettings,
        logAudit,
      }}
    >
      {children}
    </PosContext.Provider>
  );
};

export function usePos(): PosContextType {
  const context = useContext(PosContext);
  if (!context) {
    throw new Error('usePos must be used within a PosProvider');
  }
  return context;
}
