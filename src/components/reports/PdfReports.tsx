import React, { useState, useMemo } from 'react';
import { usePos } from '../../context/PosContext';
import { formatUGX, formatDateTime } from '../../utils/formatters';
import { exportOrdersToCsv, exportStaffPerformanceToCsv } from '../../utils/exportHelpers';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  DollarSign,
  ShoppingBag,
  Percent,
  TrendingUp,
  CreditCard,
  Users,
  Receipt,
  FileText
} from 'lucide-react';

export const PdfReports: React.FC = () => {
  const { orders, expenses, inventory, staffList, settings } = usePos();
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('today');

  // Filter orders by date range
  const filteredOrders = useMemo(() => {
    const now = new Date();
    return orders.filter((order) => {
      const oDate = new Date(order.createdAt);
      if (dateRange === 'today') {
        return oDate.toDateString() === now.toDateString();
      } else if (dateRange === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return oDate >= weekAgo;
      } else if (dateRange === 'month') {
        return (
          oDate.getMonth() === now.getMonth() && oDate.getFullYear() === now.getFullYear()
        );
      }
      return true;
    });
  }, [orders, dateRange]);

  // Aggregate metrics
  const completedOrders = filteredOrders.filter((o) => o.status === 'completed');
  const voidedOrders = filteredOrders.filter((o) => o.status === 'voided');

  const grossSales = completedOrders.reduce((sum, o) => sum + o.subtotal, 0);
  const totalDiscounts = completedOrders.reduce((sum, o) => sum + o.discountAmount, 0);
  const totalVat = completedOrders.reduce((sum, o) => sum + o.vatAmount, 0);
  const totalServiceCharge = completedOrders.reduce((sum, o) => sum + o.serviceChargeAmount, 0);
  const netRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Filter expenses
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const estimatedProfit = netRevenue - totalExpenses;

  // Breakdown by payment methods
  const paymentBreakdown = completedOrders.reduce((acc, o) => {
    const method = (o.payments && o.payments.length > 0 ? o.payments[0].method : 'cash');
    acc[method] = (acc[method] || 0) + o.totalAmount;
    return acc;
  }, {} as Record<string, number>);

  // Breakdown by Item sales
  const itemSalesBreakdown = useMemo(() => {
    const map: Record<string, { name: string; qty: number; total: number }> = {};
    completedOrders.forEach((o) => {
      o.items.forEach((item) => {
        if (!map[item.menuItemId]) {
          map[item.menuItemId] = { name: item.name, qty: 0, total: 0 };
        }
        map[item.menuItemId].qty += item.quantity;
        map[item.menuItemId].total += item.totalPrice;
      });
    });

    return Object.values(map).sort((a, b) => b.qty - a.qty);
  }, [completedOrders]);

  // Waiter & Cashier Performance
  const staffPerformance = useMemo(() => {
    const map: Record<string, { name: string; ordersCount: number; totalSales: number }> = {};
    completedOrders.forEach((o) => {
      if (!map[o.staffId]) {
        map[o.staffId] = { name: o.staffName, ordersCount: 0, totalSales: 0 };
      }
      map[o.staffId].ordersCount += 1;
      map[o.staffId].totalSales += o.totalAmount;
    });
    return Object.values(map).sort((a, b) => b.totalSales - a.totalSales);
  }, [completedOrders]);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950 text-slate-100 space-y-6">
      {/* Top Header & Range Selection */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            Financial & Sales Analytics (PDF / Z-Reports)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Z-Report summaries, URA 18% VAT audit, waiter performance, and expense analytics in UGX.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            {(['today', 'week', 'month', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-all ${
                  dateRange === range
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {range === 'all' ? 'All Time' : range}
              </button>
            ))}
          </div>

          <button
            onClick={() => exportOrdersToCsv(filteredOrders)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Orders CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-amber-500/20 active:scale-95"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Z-Report</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Net Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-black text-white font-mono mt-2">
            {formatUGX(netRevenue)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {completedOrders.length} completed transactions
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">URA 18% VAT</span>
            <Percent className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-black text-sky-400 font-mono mt-2">
            {formatUGX(totalVat)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Service charge: {formatUGX(totalServiceCharge)}
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Expenses & Stock</span>
            <TrendingUp className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-black text-rose-400 font-mono mt-2">
            {formatUGX(totalExpenses)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {expenses.length} operating expense logs
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Estimated Net Profit</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className={`text-xl font-black font-mono mt-2 ${estimatedProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatUGX(estimatedProfit)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Discounts: -{formatUGX(totalDiscounts)}
          </div>
        </div>
      </div>

      {/* Payment Methods & Staff Performance Bento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Payment Methods Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-400" />
              Sales by Tender / Payment Method
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              UGX Total
            </span>
          </div>

          <div className="space-y-3">
            {Object.entries(paymentBreakdown).map(([method, amt]) => {
              const pct = netRevenue > 0 ? Math.round((amt / netRevenue) * 100) : 0;
              return (
                <div key={method} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200 capitalize">
                      {method.replace('_', ' ')}
                    </span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-slate-400 text-[11px]">{pct}%</span>
                      <span className="font-bold text-white">{formatUGX(amt)}</span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Waiter & Cashier Performance */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              Staff & Waiter Performance
            </h3>
            <button
              onClick={() => exportStaffPerformanceToCsv(staffList, orders)}
              className="text-[11px] text-amber-400 hover:underline"
            >
              Export Staff CSV
            </button>
          </div>

          <div className="space-y-2">
            {staffPerformance.map((st, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-850 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-white">{st.name}</div>
                  <div className="text-[10px] text-slate-400">{st.ordersCount} closed orders</div>
                </div>
                <div className="font-mono font-extrabold text-amber-400">
                  {formatUGX(st.totalSales)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Selling Items Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Top Selling Food & Drink Menu Items
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {itemSalesBreakdown.length} items sold
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-850 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3">Rank</th>
                <th className="p-3">Menu Item Name</th>
                <th className="p-3">Units Sold</th>
                <th className="p-3 text-right">Gross Total (UGX)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {itemSalesBreakdown.map((it, idx) => (
                <tr key={idx} className="hover:bg-slate-850/50">
                  <td className="p-3 font-mono font-bold text-slate-500">#{idx + 1}</td>
                  <td className="p-3 font-bold text-white">{it.name}</td>
                  <td className="p-3 font-mono text-slate-200">{it.qty} portions</td>
                  <td className="p-3 font-mono font-extrabold text-amber-400 text-right">
                    {formatUGX(it.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Report View (Visible during window.print()) */}
      <div className="hidden print:block text-black bg-white p-6 font-mono text-xs">
        <div className="text-center pb-4 border-b border-black">
          <h1 className="text-lg font-black uppercase">{settings.name}</h1>
          <p>{settings.address} • {settings.city}, Uganda</p>
          <p>TIN: {settings.tinNumber} | Tel: {settings.phone1}</p>
          <h2 className="text-sm font-bold mt-2">Z-REPORT SALES & TAX AUDIT</h2>
          <p>Period: {dateRange.toUpperCase()} | Printed: {formatDateTime(new Date().toISOString())}</p>
        </div>

        <div className="py-4 space-y-1 border-b border-black">
          <div className="flex justify-between"><span>Completed Orders:</span><span>{completedOrders.length}</span></div>
          <div className="flex justify-between"><span>Gross Sales:</span><span>{formatUGX(grossSales)}</span></div>
          <div className="flex justify-between"><span>Discounts:</span><span>-{formatUGX(totalDiscounts)}</span></div>
          <div className="flex justify-between"><span>Service Charge:</span><span>+{formatUGX(totalServiceCharge)}</span></div>
          <div className="flex justify-between font-bold"><span>Total Net Revenue:</span><span>{formatUGX(netRevenue)}</span></div>
          <div className="flex justify-between"><span>18% VAT Collected:</span><span>{formatUGX(totalVat)}</span></div>
          <div className="flex justify-between"><span>Total Expenses:</span><span>-{formatUGX(totalExpenses)}</span></div>
          <div className="flex justify-between font-bold"><span>Net Profit:</span><span>{formatUGX(estimatedProfit)}</span></div>
        </div>

        <div className="py-3 text-center text-[10px]">
          *** END OF SYSTEM REPORT ***
        </div>
      </div>
    </div>
  );
};
