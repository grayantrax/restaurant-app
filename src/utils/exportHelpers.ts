import { Order, InventoryItem, Expense, StaffUser } from '../types/pos';
import { formatUGX } from './formatters';

export function downloadCsv(filename: string, rows: string[][]) {
  const processRow = (row: string[]) => {
    return row
      .map((val) => {
        const clean = (val ?? '').toString().replace(/"/g, '""');
        return `"${clean}"`;
      })
      .join(',');
  };

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map(processRow).join('\r\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportOrdersToCsv(orders: Order[]) {
  const headers = [
    'Order Number',
    'Date Time',
    'Type',
    'Table',
    'Customer',
    'Staff',
    'Status',
    'Payment Status',
    'Subtotal (UGX)',
    'Discount (UGX)',
    'VAT (UGX)',
    'Total (UGX)',
    'Items Summary'
  ];

  const rows = orders.map((o) => [
    o.orderNumber,
    new Date(o.createdAt).toLocaleString(),
    o.type,
    o.tableName || 'Counter',
    o.customerName || 'Walk-in',
    o.staffName,
    o.status,
    o.paymentStatus,
    o.subtotal.toString(),
    o.discountAmount.toString(),
    o.vatAmount.toString(),
    o.totalAmount.toString(),
    o.items.map((i) => `${i.quantity}x ${i.name}`).join('; ')
  ]);

  downloadCsv(`kampala_orders_${new Date().toISOString().slice(0, 10)}.csv`, [headers, ...rows]);
}

export function exportInventoryToCsv(items: InventoryItem[]) {
  const headers = [
    'SKU',
    'Item Name',
    'Category',
    'Current Stock',
    'Unit',
    'Min Stock Alert Level',
    'Unit Cost (UGX)',
    'Total Value (UGX)',
    'Supplier',
    'Status'
  ];

  const rows = items.map((item) => {
    const isLow = item.currentStock <= item.minStockLevel;
    return [
      item.sku,
      item.name,
      item.category,
      item.currentStock.toString(),
      item.unit,
      item.minStockLevel.toString(),
      item.unitCost.toString(),
      (item.currentStock * item.unitCost).toString(),
      item.supplierName || 'N/A',
      isLow ? 'LOW STOCK ALERT' : 'Adequate'
    ];
  });

  downloadCsv(`kampala_inventory_${new Date().toISOString().slice(0, 10)}.csv`, [headers, ...rows]);
}

export function exportExpensesToCsv(expenses: Expense[]) {
  const headers = [
    'Date',
    'Category',
    'Description',
    'Amount (UGX)',
    'Payment Method',
    'Recipient',
    'Receipt Ref',
    'Logged By'
  ];

  const rows = expenses.map((e) => [
    new Date(e.date).toLocaleDateString(),
    e.category,
    e.description,
    e.amount.toString(),
    e.paidVia.toUpperCase(),
    e.recipient || '',
    e.receiptRef || '',
    e.loggedBy
  ]);

  downloadCsv(`kampala_expenses_${new Date().toISOString().slice(0, 10)}.csv`, [headers, ...rows]);
}

export function exportStaffPerformanceToCsv(staff: StaffUser[], orders: Order[]) {
  const headers = [
    'Staff Name',
    'Role',
    'Total Orders Handled',
    'Completed Orders',
    'Total Sales Generated (UGX)',
    'Average Order Value (UGX)'
  ];

  const rows = staff.map((s) => {
    const staffOrders = orders.filter((o) => o.staffId === s.id);
    const completed = staffOrders.filter((o) => o.status === 'completed' && o.paymentStatus === 'paid');
    const totalSales = completed.reduce((sum, o) => sum + o.totalAmount, 0);
    const avgValue = completed.length > 0 ? Math.round(totalSales / completed.length) : 0;

    return [
      s.name,
      s.role,
      staffOrders.length.toString(),
      completed.length.toString(),
      totalSales.toString(),
      avgValue.toString()
    ];
  });

  downloadCsv(`kampala_staff_performance_${new Date().toISOString().slice(0, 10)}.csv`, [headers, ...rows]);
}
