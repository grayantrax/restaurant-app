import {
  StaffUser,
  MenuCategory,
  MenuItem,
  TableItem,
  InventoryItem,
  Supplier,
  RestaurantSettings,
  CashDrawerShift,
  Customer,
  Reservation,
  Expense,
  AuditLog
} from '../types/pos';

export const INITIAL_STAFF: StaffUser[] = [
  {
    id: 'staff-1',
    name: 'Sarah Nabirye',
    email: 'sarah.owner@kampalabistro.ug',
    role: 'Admin',
    pin: '1234',
    phone: '+256 772 101 202',
    isActive: true,
  },
  {
    id: 'staff-2',
    name: 'David Mukasa',
    email: 'david.manager@kampalabistro.ug',
    role: 'Manager',
    pin: '2345',
    phone: '+256 701 303 404',
    isActive: true,
  },
  {
    id: 'staff-3',
    name: 'Grace Akello',
    email: 'grace.cashier@kampalabistro.ug',
    role: 'Cashier',
    pin: '3456',
    phone: '+256 754 505 606',
    isActive: true,
  },
  {
    id: 'staff-4',
    name: 'Brian Ssemakula',
    email: 'brian.waiter@kampalabistro.ug',
    role: 'Waiter',
    pin: '4567',
    phone: '+256 788 707 808',
    isActive: true,
  },
  {
    id: 'staff-5',
    name: 'Chef Kato John',
    email: 'kato.kitchen@kampalabistro.ug',
    role: 'Kitchen',
    pin: '5678',
    phone: '+256 702 909 001',
    isActive: true,
  },
];

export const INITIAL_CATEGORIES: MenuCategory[] = [
  { id: 'cat-1', name: 'Nyama Choma & Grills', iconName: 'Flame', order: 1 },
  { id: 'cat-2', name: 'Ugandan Traditional', iconName: 'Soup', order: 2 },
  { id: 'cat-3', name: 'Rolex & Fast Bites', iconName: 'Sandwich', order: 3 },
  { id: 'cat-4', name: 'Fish & Seafood', iconName: 'Fish', order: 4 },
  { id: 'cat-5', name: 'Drinks & Cold Beers', iconName: 'Beer', order: 5 },
  { id: 'cat-6', name: 'Fresh Juices & Hot Chai', iconName: 'Coffee', order: 6 },
  { id: 'cat-7', name: 'Sides & Extras', iconName: 'Utensils', order: 7 },
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'inv-1',
    name: 'Fresh Matooke Fingers',
    sku: 'MAT-01',
    category: 'Produce',
    unit: 'kg',
    currentStock: 48,
    minStockLevel: 15,
    unitCost: 2000,
    supplierId: 'sup-1',
    supplierName: 'Nakasero Fresh Produce Hub',
    lastRestocked: '2026-09-16T08:00:00Z',
  },
  {
    id: 'inv-2',
    name: 'Prime Beef Cuts (Local)',
    sku: 'BEEF-01',
    category: 'Meat',
    unit: 'kg',
    currentStock: 26,
    minStockLevel: 10,
    unitCost: 15000,
    supplierId: 'sup-2',
    supplierName: 'Kalerwe Quality Abattoir',
    lastRestocked: '2026-09-16T07:30:00Z',
  },
  {
    id: 'inv-3',
    name: 'Fresh Lake Tilapia (Whole)',
    sku: 'FISH-01',
    category: 'Fish',
    unit: 'portions',
    currentStock: 18,
    minStockLevel: 6,
    unitCost: 18000,
    supplierId: 'sup-3',
    supplierName: 'Ggaba Landing Fisheries Ltd',
    lastRestocked: '2026-09-17T06:00:00Z',
  },
  {
    id: 'inv-4',
    name: 'Farm Fresh Eggs (Trays)',
    sku: 'EGG-01',
    category: 'Poultry',
    unit: 'portions',
    currentStock: 120, // number of eggs
    minStockLevel: 30,
    unitCost: 450,
    supplierId: 'sup-1',
    supplierName: 'Nakasero Fresh Produce Hub',
    lastRestocked: '2026-09-15T10:00:00Z',
  },
  {
    id: 'inv-5',
    name: 'Nile Special Beer 500ml',
    sku: 'BEER-NILE',
    category: 'Beverage',
    unit: 'bottles',
    currentStock: 84,
    minStockLevel: 24,
    unitCost: 3200,
    supplierId: 'sup-4',
    supplierName: 'Uganda Breweries Kampala Distributor',
    lastRestocked: '2026-09-14T11:00:00Z',
  },
  {
    id: 'inv-6',
    name: 'Club Pilsener 500ml',
    sku: 'BEER-CLUB',
    category: 'Beverage',
    unit: 'bottles',
    currentStock: 52,
    minStockLevel: 20,
    unitCost: 3200,
    supplierId: 'sup-4',
    supplierName: 'Uganda Breweries Kampala Distributor',
    lastRestocked: '2026-09-14T11:00:00Z',
  },
  {
    id: 'inv-7',
    name: 'Fresh Passion Fruit Pulp',
    sku: 'JUICE-PASS',
    category: 'Produce',
    unit: 'liters',
    currentStock: 9,
    minStockLevel: 5,
    unitCost: 4000,
    supplierId: 'sup-1',
    supplierName: 'Nakasero Fresh Produce Hub',
    lastRestocked: '2026-09-17T07:00:00Z',
  },
  {
    id: 'inv-8',
    name: 'Goat Meat (Nyama Choma cut)',
    sku: 'GOAT-01',
    category: 'Meat',
    unit: 'kg',
    currentStock: 14,
    minStockLevel: 8,
    unitCost: 19000,
    supplierId: 'sup-2',
    supplierName: 'Kalerwe Quality Abattoir',
    lastRestocked: '2026-09-16T08:15:00Z',
  },
  {
    id: 'inv-9',
    name: 'Irish Potatoes (Singodoma)',
    sku: 'POTATO-01',
    category: 'Produce',
    unit: 'kg',
    currentStock: 35,
    minStockLevel: 15,
    unitCost: 2500,
    supplierId: 'sup-1',
    supplierName: 'Nakasero Fresh Produce Hub',
    lastRestocked: '2026-09-15T09:00:00Z',
  }
];

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  {
    id: 'menu-1',
    categoryId: 'cat-1',
    name: 'Grilled Goat Choma (Muchomo)',
    description: 'Tender marinated goat ribs slow-roasted over charcoal. Served with Kachumbari and roasted gonja/cassava.',
    price: 32000,
    costPrice: 16000,
    isAvailable: true,
    variants: [
      { id: 'v-1', name: 'Regular Platter (500g)', price: 32000 },
      { id: 'v-2', name: 'Mega Family Platter (1kg)', price: 58000 }
    ],
    addOns: [
      { id: 'ao-1', name: 'Extra Kachumbari Salad', price: 3500 },
      { id: 'ao-2', name: 'Roasted Sweet Plantain (Gonja)', price: 4000 },
      { id: 'ao-3', name: 'Spicy Chilli Dip (Pili Pili)', price: 1500 }
    ],
    ingredients: [
      { ingredientId: 'inv-8', quantityNeeded: 0.5 }
    ]
  },
  {
    id: 'menu-2',
    categoryId: 'cat-1',
    name: '1/2 Flame-Grilled Local Chicken',
    description: 'Crispy charcoal-smoked country chicken seasoned with traditional spices, garlic & lemon.',
    price: 35000,
    costPrice: 18000,
    isAvailable: true,
    variants: [
      { id: 'v-3', name: 'Half Chicken', price: 35000 },
      { id: 'v-4', name: 'Whole Chicken', price: 62000 }
    ],
    addOns: [
      { id: 'ao-4', name: 'Portion of Handcut Fries', price: 7000 },
      { id: 'ao-5', name: 'Side Gravy Bowl', price: 3000 }
    ],
    ingredients: []
  },
  {
    id: 'menu-3',
    categoryId: 'cat-2',
    name: 'Special Beef Luwombo',
    description: 'Prime beef stewed gently inside steamed banana leaves with aromatic herbs, smoked onions & tomatoes.',
    price: 28000,
    costPrice: 12000,
    isAvailable: true,
    variants: [],
    addOns: [
      { id: 'ao-6', name: 'Fresh Steamed Matooke Portion', price: 5000 },
      { id: 'ao-7', name: 'Groundnut (G-Nut) Sauce', price: 4000 },
      { id: 'ao-8', name: 'Kalo (Millet Bread)', price: 4000 }
    ],
    ingredients: [
      { ingredientId: 'inv-2', quantityNeeded: 0.35 },
      { ingredientId: 'inv-1', quantityNeeded: 0.4 }
    ]
  },
  {
    id: 'menu-4',
    categoryId: 'cat-2',
    name: 'Katogo Deluxe (Matooke & Beef)',
    description: 'Hearty traditional breakfast or lunch bowl: steamed green plantains mashed with tender beef chunks & rich broth.',
    price: 18000,
    costPrice: 7500,
    isAvailable: true,
    variants: [
      { id: 'v-5', name: 'Matooke with Beef', price: 18000 },
      { id: 'v-6', name: 'Matooke with Offals (Byenda)', price: 16000 },
      { id: 'v-7', name: 'Matooke with Fresh Beans', price: 12000 }
    ],
    addOns: [
      { id: 'ao-9', name: 'Avocado Slices', price: 2500 }
    ],
    ingredients: [
      { ingredientId: 'inv-1', quantityNeeded: 0.5 },
      { ingredientId: 'inv-2', quantityNeeded: 0.2 }
    ]
  },
  {
    id: 'menu-5',
    categoryId: 'cat-3',
    name: 'Kampala Rolex Supreme',
    description: 'Iconic Ugandan street feast: fluffy spiced fried eggs rolled inside warm handmade chapatis with diced tomatoes & cabbage.',
    price: 9000,
    costPrice: 3200,
    isAvailable: true,
    variants: [
      { id: 'v-8', name: 'Standard (2 Eggs, 1 Chapati)', price: 7000 },
      { id: 'v-9', name: 'Supreme (3 Eggs, 2 Chapatis)', price: 11000 },
      { id: 'v-10', name: 'Carnivore (Eggs + Minced Beef)', price: 15000 }
    ],
    addOns: [
      { id: 'ao-10', name: 'Extra Cheddar Cheese Melt', price: 3000 },
      { id: 'ao-11', name: 'Extra Egg', price: 1500 },
      { id: 'ao-12', name: 'Hot Chili Flakes', price: 500 }
    ],
    ingredients: [
      { ingredientId: 'inv-4', quantityNeeded: 2 }
    ]
  },
  {
    id: 'menu-6',
    categoryId: 'cat-3',
    name: 'Chips Mayai (Zege)',
    description: 'Golden fries blended into a savoury 3-egg omelette skillet, served with house tomato salsa.',
    price: 13000,
    costPrice: 5000,
    isAvailable: true,
    variants: [],
    addOns: [
      { id: 'ao-13', name: 'Sausage (Beef/Pork)', price: 3500 },
      { id: 'ao-14', name: 'Diced Green Peppers & Onions', price: 1000 }
    ],
    ingredients: [
      { ingredientId: 'inv-4', quantityNeeded: 3 },
      { ingredientId: 'inv-9', quantityNeeded: 0.3 }
    ]
  },
  {
    id: 'menu-7',
    categoryId: 'cat-4',
    name: 'Deep Fried Lake Victoria Tilapia',
    description: 'Whole crispy golden Tilapia fish caught fresh from Lake Victoria. Served with lemon wedges and Kachumbari.',
    price: 36000,
    costPrice: 19000,
    isAvailable: true,
    variants: [
      { id: 'v-11', name: 'Large Whole Fish', price: 36000 },
      { id: 'v-12', name: 'Jumbo Size (Shared)', price: 48000 }
    ],
    addOns: [
      { id: 'ao-15', name: 'Golden Fries', price: 7000 },
      { id: 'ao-16', name: 'Garlic Butter Herb Dip', price: 3000 }
    ],
    ingredients: [
      { ingredientId: 'inv-3', quantityNeeded: 1 }
    ]
  },
  {
    id: 'menu-8',
    categoryId: 'cat-5',
    name: 'Nile Special Lager (500ml)',
    description: 'True from the Source - Uganda’s iconic full-bodied golden lager, served ice-cold.',
    price: 6000,
    costPrice: 3200,
    isAvailable: true,
    variants: [],
    addOns: [],
    ingredients: [
      { ingredientId: 'inv-5', quantityNeeded: 1 }
    ]
  },
  {
    id: 'menu-9',
    categoryId: 'cat-5',
    name: 'Club Pilsener (500ml)',
    description: 'Smooth and refreshing premium Ugandan pilsener.',
    price: 6000,
    costPrice: 3200,
    isAvailable: true,
    variants: [],
    addOns: [],
    ingredients: [
      { ingredientId: 'inv-6', quantityNeeded: 1 }
    ]
  },
  {
    id: 'menu-10',
    categoryId: 'cat-6',
    name: 'Fresh Masaka Passion Juice',
    description: 'Freshly extracted sweet & tangy aromatic passion fruit juice with natural cane sugar.',
    price: 7000,
    costPrice: 2000,
    isAvailable: true,
    variants: [
      { id: 'v-13', name: 'Regular Glass (400ml)', price: 7000 },
      { id: 'v-14', name: 'Table Pitcher (1.2L)', price: 18000 }
    ],
    addOns: [
      { id: 'ao-17', name: 'Ginger Zing Splash', price: 1000 }
    ],
    ingredients: [
      { ingredientId: 'inv-7', quantityNeeded: 0.3 }
    ]
  },
  {
    id: 'menu-11',
    categoryId: 'cat-6',
    name: 'Spiced African Chai (Dawa Tea)',
    description: 'Steaming brewed black tea with crushed ginger, cloves, cinnamon, lemon, and wild bee honey.',
    price: 6500,
    costPrice: 1800,
    isAvailable: true,
    variants: [],
    addOns: [],
    ingredients: []
  },
  {
    id: 'menu-12',
    categoryId: 'cat-7',
    name: 'Golden Hand-Cut Fries',
    description: 'Crisp outside, fluffy inside, sprinkled with seasoned herbal salt.',
    price: 7000,
    costPrice: 2500,
    isAvailable: true,
    variants: [],
    addOns: [
      { id: 'ao-18', name: 'Garlic Mayo Dip', price: 1500 }
    ],
    ingredients: [
      { ingredientId: 'inv-9', quantityNeeded: 0.35 }
    ]
  }
];

export const INITIAL_TABLES: TableItem[] = [
  { id: 'tbl-1', number: 1, name: 'Table 01', section: 'Indoor', seats: 2, status: 'available' },
  { id: 'tbl-2', number: 2, name: 'Table 02', section: 'Indoor', seats: 4, status: 'occupied' },
  { id: 'tbl-3', number: 3, name: 'Table 03', section: 'Indoor', seats: 4, status: 'available' },
  { id: 'tbl-4', number: 4, name: 'Table 04', section: 'Indoor', seats: 6, status: 'bill_requested' },
  { id: 'tbl-5', number: 5, name: 'Terrace T1', section: 'Terrace', seats: 4, status: 'available' },
  { id: 'tbl-6', number: 6, name: 'Terrace T2', section: 'Terrace', seats: 4, status: 'reserved' },
  { id: 'tbl-7', number: 7, name: 'Terrace T3', section: 'Terrace', seats: 6, status: 'available' },
  { id: 'tbl-8', number: 8, name: 'VIP Suite 1', section: 'VIP Lounge', seats: 8, status: 'occupied' },
  { id: 'tbl-9', number: 9, name: 'VIP Suite 2', section: 'VIP Lounge', seats: 10, status: 'available' },
  { id: 'tbl-10', number: 10, name: 'Bar High-Top 1', section: 'Garden Bar', seats: 3, status: 'available' },
  { id: 'tbl-11', number: 11, name: 'Bar High-Top 2', section: 'Garden Bar', seats: 3, status: 'available' },
  { id: 'tbl-12', number: 12, name: 'Garden Pergola', section: 'Garden Bar', seats: 6, status: 'available' },
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    name: 'Nakasero Fresh Produce Hub',
    contactPerson: 'Mzee John Byaruhanga',
    phone: '+256 772 456 789',
    email: 'nakasero.produce@market.ug',
    address: 'Stall 44, Nakasero Market, Central Kampala',
    supplyingItems: ['Fresh Matooke', 'Irish Potatoes', 'Eggs', 'Passion Fruit', 'Tomatoes']
  },
  {
    id: 'sup-2',
    name: 'Kalerwe Quality Abattoir',
    contactPerson: 'Hassan Ssebuwufu',
    phone: '+256 701 890 123',
    email: 'kalerwemeat@abattoir.ug',
    address: 'Kalerwe Meat Terminal, Gayaza Road',
    supplyingItems: ['Prime Beef Cuts', 'Goat Meat', 'Chicken']
  },
  {
    id: 'sup-3',
    name: 'Ggaba Landing Fisheries Ltd',
    contactPerson: 'Florence Namutebi',
    phone: '+256 755 334 455',
    email: 'info@ggabafish.co.ug',
    address: 'Ggaba Pier, Lake Victoria Shore, Kampala',
    supplyingItems: ['Lake Tilapia', 'Nile Perch']
  },
  {
    id: 'sup-4',
    name: 'Uganda Breweries Kampala Distributor',
    contactPerson: 'Patrick Ochieng',
    phone: '+256 782 112 233',
    email: 'orders@ubldistributors.ug',
    address: 'Plot 5, 7th Street Industrial Area, Kampala',
    supplyingItems: ['Nile Special', 'Club Pilsener', 'Bell Lager', 'Soft Drinks']
  }
];

export const INITIAL_SETTINGS: RestaurantSettings = {
  name: 'JOJO FOODIES',
  tagline: 'Quality Food & Dining Experience',
  legalName: 'JOJO FOODIES Ltd',
  tinNumber: '1008472910', // URA TIN (Uganda Revenue Authority)
  address: 'Plot 14, Acacia Avenue, Kololo',
  city: 'Kampala, Uganda',
  phone1: '+256 772 889 900',
  phone2: '+256 701 556 677',
  email: 'orders@jojofoodies.com',
  website: 'https://jojofoodies.com',
  currencyCode: 'UGX',
  vatRate: 0.18, // 18% URA VAT
  isVatEnabled: true,
  serviceChargeRate: 0.05, // 5% service charge
  isServiceChargeEnabled: false,
  mtnMerchantCode: '984521', // MTN MoMo Pay Merchant code
  airtelPayCode: '102938', // Airtel Money Merchant ID
  bankAccountDetails: 'Stanbic Bank Uganda - Ac: 9030012345678',
  receiptHeaderNotice: '*** OFFICIAL FISCAL RECEIPT ***',
  receiptFooterMessage: 'Webale Nnyo! Thank you for dining with us.\nFollow us on Instagram: @JojoFoodies',
  autoPrintReceiptOnPayment: true,
  paperWidth: '80mm',
  printerType: 'browser_dialog',
  networkPrinterIp: '192.168.1.200',
  networkPrinterPort: 9100,
  bluetoothDeviceName: 'POS-80-Thermal-BT',
  kitchenChimeEnabled: true,
};

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'Dr. Ronald Kasule',
    phone: '+256 772 123 456',
    email: 'r.kasule@medcenter.ug',
    address: 'Hill View Apts, Kololo, Kampala',
    totalVisits: 14,
    totalSpent: 845000,
    notes: 'VIP House Account. Allowed to charge meals to medical foundation account.',
    createdAt: '2026-06-12T11:00:00Z',
    isComplementaryAccount: true,
    accountBalance: 180000,
    accountCreditLimit: 0,
    accountStatus: 'active',
    companyOrAffiliation: 'Kasule Medical & Health VIP',
    accountHistory: [
      {
        id: 'tx-101',
        date: '2026-09-10T12:00:00Z',
        type: 'top_up',
        amount: 250000,
        balanceAfter: 250000,
        notes: 'Monthly Executive Hospitality Allowance top-up',
        recordedBy: 'Sarah Nabirye (Admin)'
      },
      {
        id: 'tx-102',
        date: '2026-09-14T19:45:00Z',
        type: 'order_charge',
        amount: 70000,
        balanceAfter: 180000,
        orderNumber: 'ORD-1012',
        notes: 'Dinner: Whole Tilapia & Drinks',
        recordedBy: 'David Mukasa (Manager)'
      }
    ]
  },
  {
    id: 'cust-2',
    name: 'Brenda Namagembe',
    phone: '+256 701 654 321',
    email: 'b.namagembe@innovate.co.ug',
    address: 'Plot 8, Naguru Hill Drive',
    totalVisits: 8,
    totalSpent: 420000,
    notes: 'Staff meal stipend account. Money is currently running low!',
    createdAt: '2026-07-04T15:30:00Z',
    isComplementaryAccount: true,
    accountBalance: 12000, // Low balance! Less than a standard dish like Goat Choma (32k)
    accountCreditLimit: 5000,
    accountStatus: 'low_funds',
    companyOrAffiliation: 'Innovate Digital Staff Tab',
    accountHistory: [
      {
        id: 'tx-201',
        date: '2026-09-01T08:00:00Z',
        type: 'top_up',
        amount: 100000,
        balanceAfter: 100000,
        notes: 'Staff monthly meal budget',
        recordedBy: 'Sarah Nabirye (Admin)'
      },
      {
        id: 'tx-202',
        date: '2026-09-16T13:30:00Z',
        type: 'order_charge',
        amount: 88000,
        balanceAfter: 12000,
        orderNumber: 'ORD-1035',
        notes: 'Team Lunch',
        recordedBy: 'Grace Akello (Cashier)'
      }
    ]
  },
  {
    id: 'cust-3',
    name: 'Hon. Martin Okello',
    phone: '+256 772 900 800',
    email: 'm.okello@protocol.gov.ug',
    address: 'Nakasero Diplomatic Enclave, Kampala',
    totalVisits: 19,
    totalSpent: 2150000,
    notes: 'State protocol VIP host. Unlimited approved house hospitality credit.',
    createdAt: '2026-04-10T10:00:00Z',
    isComplementaryAccount: true,
    accountBalance: 500000,
    accountCreditLimit: 0,
    accountStatus: 'active',
    companyOrAffiliation: 'Parliamentary Hospitality Account',
    accountHistory: [
      {
        id: 'tx-301',
        date: '2026-09-05T14:00:00Z',
        type: 'top_up',
        amount: 500000,
        balanceAfter: 500000,
        notes: 'Government protocol voucher advance',
        recordedBy: 'Sarah Nabirye (Admin)'
      }
    ]
  },
  {
    id: 'cust-4',
    name: 'Eng. Isaac Tumusiime',
    phone: '+256 754 998 877',
    email: 'isaac.t@infra.ug',
    address: 'Bugolobi Village Mall residency',
    totalVisits: 22,
    totalSpent: 1650000,
    notes: 'Regular VIP customer. Pays direct via MTN MoMo and Card.',
    createdAt: '2026-05-18T19:00:00Z',
    isComplementaryAccount: false,
  }
];

export const INITIAL_RESERVATIONS: Reservation[] = [
  {
    id: 'res-1',
    customerName: 'Patricia Kyomugisha',
    customerPhone: '+256 782 555 123',
    guestCount: 4,
    tableId: 'tbl-6',
    tableName: 'Terrace T2',
    dateTime: '2026-09-17T19:30:00',
    notes: 'Anniversary celebration, requested candlelight & fresh flower center.',
    status: 'confirmed',
    createdAt: '2026-09-16T14:00:00Z'
  },
  {
    id: 'res-2',
    customerName: 'Hon. Martin Okello',
    customerPhone: '+256 772 900 800',
    guestCount: 8,
    tableId: 'tbl-8',
    tableName: 'VIP Suite 1',
    dateTime: '2026-09-17T20:00:00',
    notes: 'Diplomatic delegation dinner.',
    status: 'seated',
    createdAt: '2026-09-15T09:30:00Z'
  }
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    category: 'Cooking Gas & Charcoal',
    amount: 140000,
    description: 'Refill 2x 38kg Oryx LPG Gas Cylinders for main kitchen range',
    paidVia: 'mtn_momo',
    recipient: 'Oryx Energy Kololo',
    receiptRef: 'ORYX-99812',
    loggedBy: 'David Mukasa',
    date: '2026-09-17T09:15:00'
  },
  {
    id: 'exp-2',
    category: 'Produce & Market',
    amount: 95000,
    description: 'Fresh vegetables, garlic, ginger, coriander & lemon from Nakasero market',
    paidVia: 'cash',
    recipient: 'Mzee Byaruhanga',
    loggedBy: 'David Mukasa',
    date: '2026-09-17T08:30:00'
  },
  {
    id: 'exp-3',
    category: 'Utilities & Power',
    amount: 250000,
    description: 'Umeme Yaka Electricity commercial token purchase for restaurant',
    paidVia: 'airtel_money',
    recipient: 'Umeme Uganda Ltd',
    receiptRef: 'YAKA-84729103',
    loggedBy: 'Sarah Nabirye',
    date: '2026-09-16T11:00:00'
  }
];

export const INITIAL_CASH_SHIFT: CashDrawerShift = {
  id: 'shift-101',
  shiftNumber: 101,
  status: 'open',
  openedAt: '2026-09-17T07:30:00Z',
  openedBy: 'Grace Akello (Cashier)',
  openingCash: 300000, // 300,000 UGX float for making change
  cashSalesTotal: 185000,
  cashInTotal: 50000, // additional change replenished
  cashOutTotal: 95000, // market vegetables purchase
  expectedCash: 440000,
  transactions: [
    {
      id: 'ctx-1',
      type: 'cash_in',
      amount: 50000,
      reason: 'Extra change float added from main safe (1000 & 2000 notes)',
      staffId: 'staff-2',
      staffName: 'David Mukasa (Manager)',
      timestamp: '2026-09-17T09:00:00Z'
    },
    {
      id: 'ctx-2',
      type: 'cash_out',
      amount: 95000,
      reason: 'Nakasero morning fresh vegetable procurement',
      staffId: 'staff-2',
      staffName: 'David Mukasa (Manager)',
      timestamp: '2026-09-17T09:20:00Z'
    }
  ]
};

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-1',
    action: 'Cash Drawer Opened',
    details: 'Shift #101 started with opening float of UGX 300,000',
    performedBy: 'Grace Akello',
    role: 'Cashier',
    timestamp: '2026-09-17T07:30:15Z',
    severity: 'info'
  },
  {
    id: 'aud-2',
    action: 'System Login',
    details: 'Admin Sarah Nabirye unlocked POS terminal',
    performedBy: 'Sarah Nabirye',
    role: 'Admin',
    timestamp: '2026-09-17T08:10:00Z',
    severity: 'info'
  },
  {
    id: 'aud-3',
    action: 'Cash Payout Executed',
    details: 'Petty cash out UGX 95,000 for Market Procurement',
    performedBy: 'David Mukasa',
    role: 'Manager',
    timestamp: '2026-09-17T09:20:05Z',
    severity: 'warning'
  }
];
