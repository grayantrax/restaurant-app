export type UserRole = 'Admin' | 'Manager' | 'Cashier' | 'Waiter' | 'Kitchen';

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  pin: string; // 4-digit PIN for quick POS unlocking
  phone: string;
  isActive: boolean;
  avatar?: string;
}

export type OrderType = 'dine-in' | 'takeaway' | 'delivery';

export type OrderStatus = 
  | 'draft' 
  | 'held' 
  | 'kitchen_pending' 
  | 'kitchen_preparing' 
  | 'kitchen_ready' 
  | 'served' 
  | 'completed' 
  | 'voided';

export type PaymentStatus = 'unpaid' | 'partially_paid' | 'paid' | 'refunded';

export type PaymentMethod = 
  | 'cash' 
  | 'mtn_momo' 
  | 'airtel_money' 
  | 'card' 
  | 'split' 
  | 'complementary_account';

export interface AddOnOption {
  id: string;
  name: string;
  price: number; // UGX
}

export interface ItemVariant {
  id: string;
  name: string;
  price: number; // UGX
}

export interface RecipeIngredient {
  ingredientId: string;
  quantityNeeded: number; // in ingredient's base unit
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number; // UGX
  costPrice: number; // UGX cost to calculate profit
  image?: string;
  isAvailable: boolean;
  variants: ItemVariant[];
  addOns: AddOnOption[];
  ingredients?: RecipeIngredient[];
}

export interface MenuCategory {
  id: string;
  name: string;
  iconName: string;
  order: number;
}

export interface CartItem {
  cartItemId: string;
  menuItemId: string;
  name: string;
  variantId?: string;
  variantName?: string;
  unitPrice: number; // Base or variant price
  quantity: number;
  selectedAddOns: AddOnOption[];
  notes?: string;
  totalPrice: number; // (unitPrice + addOns) * quantity
  costPrice: number;
  kitchenStatus?: 'pending' | 'cooking' | 'ready' | 'served';
}

export interface TableItem {
  id: string;
  number: number;
  name: string;
  section: 'Indoor' | 'Terrace' | 'VIP Lounge' | 'Garden Bar';
  seats: number;
  status: 'available' | 'occupied' | 'reserved' | 'bill_requested';
  activeOrderId?: string;
}

export interface PaymentRecord {
  id: string;
  method: PaymentMethod;
  amount: number;
  referenceNumber?: string; // MTN MoMo ID, Airtel Pay ref, or Card Auth
  tenderedCash?: number;
  changeGiven?: number;
  timestamp: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. ORD-1042
  type: OrderType;
  tableId?: string;
  tableName?: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  isComplementaryOrder?: boolean;
  remainingAccountBalance?: number;
  items: CartItem[];
  subtotal: number; // UGX
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  discountAmount: number; // UGX
  vatRate: number; // e.g. 0.18
  vatAmount: number; // UGX
  serviceChargeRate: number; // e.g. 0.05
  serviceChargeAmount: number; // UGX
  totalAmount: number; // UGX
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  payments: PaymentRecord[];
  staffId: string;
  staffName: string;
  createdAt: string;
  updatedAt: string;
  kitchenNote?: string;
  isReprinted?: boolean;
  voidReason?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: 'kg' | 'g' | 'liters' | 'bottles' | 'packs' | 'portions';
  currentStock: number;
  minStockLevel: number;
  unitCost: number; // UGX
  supplierId?: string;
  supplierName?: string;
  lastRestocked?: string;
}

export interface StockMovement {
  id: string;
  inventoryItemId: string;
  itemName: string;
  type: 'stock_in' | 'stock_out' | 'wastage' | 'pos_deduction';
  quantity: number;
  unit: string;
  reason: string;
  performedBy: string;
  timestamp: string;
  cost?: number;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  supplyingItems: string[];
}

export interface CashDrawerTransaction {
  id: string;
  type: 'cash_in' | 'cash_out';
  amount: number; // UGX
  reason: string;
  staffId: string;
  staffName: string;
  timestamp: string;
}

export interface CashDrawerShift {
  id: string;
  shiftNumber: number;
  status: 'open' | 'closed';
  openedAt: string;
  closedAt?: string;
  openedBy: string;
  closedBy?: string;
  openingCash: number; // Opening float UGX
  cashSalesTotal: number;
  cashInTotal: number;
  cashOutTotal: number;
  expectedCash: number;
  actualCash?: number;
  difference?: number;
  closingNotes?: string;
  transactions: CashDrawerTransaction[];
}

export interface CustomerAccountTransaction {
  id: string;
  date: string;
  type: 'top_up' | 'order_charge' | 'adjustment';
  amount: number; // UGX
  balanceAfter: number; // UGX
  orderNumber?: string;
  notes?: string;
  recordedBy?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalVisits: number;
  totalSpent: number; // UGX
  notes?: string;
  createdAt: string;
  // Complementary House Account fields
  isComplementaryAccount?: boolean;
  accountBalance?: number; // Current credit/allowance balance in UGX
  accountCreditLimit?: number; // Minimum threshold before blocking (default 0)
  accountStatus?: 'active' | 'low_funds' | 'suspended';
  companyOrAffiliation?: string; // e.g. "Director Tab", "VIP Partner", "Staff Meal Plan"
  accountHistory?: CustomerAccountTransaction[];
}

export interface Reservation {
  id: string;
  customerName: string;
  customerPhone: string;
  guestCount: number;
  tableId: string;
  tableName: string;
  dateTime: string;
  notes?: string;
  status: 'confirmed' | 'seated' | 'cancelled';
  createdAt: string;
}

export interface Expense {
  id: string;
  category: 'Produce & Market' | 'Beverages & Soft Drinks' | 'Meat & Poultry' | 'Cooking Gas & Charcoal' | 'Utilities & Power' | 'Staff Transport & Allowance' | 'Cleaning & Hygiene' | 'Repairs & Maintenance' | 'Other';
  amount: number; // UGX
  description: string;
  paidVia: PaymentMethod;
  recipient?: string;
  receiptRef?: string;
  loggedBy: string;
  date: string;
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  performedBy: string;
  role: UserRole;
  timestamp: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface RestaurantSettings {
  name: string;
  tagline: string;
  legalName: string;
  tinNumber: string; // Uganda Revenue Authority TIN (10 digits)
  address: string;
  city: string;
  phone1: string;
  phone2: string;
  email: string;
  website: string;
  currencyCode: 'UGX';
  vatRate: number; // 0.18 for 18% URA VAT
  isVatEnabled: boolean;
  serviceChargeRate: number; // 0.05 for 5%
  isServiceChargeEnabled: boolean;
  mtnMerchantCode: string;
  airtelPayCode: string;
  bankAccountDetails: string;
  receiptHeaderNotice: string;
  receiptFooterMessage: string;
  autoPrintReceiptOnPayment: boolean;
  paperWidth: '80mm' | '58mm';
  printerType: 'browser_dialog' | 'bluetooth' | 'usb' | 'network';
  networkPrinterIp: string;
  networkPrinterPort: number;
  bluetoothDeviceName?: string;
  kitchenChimeEnabled: boolean;
}
