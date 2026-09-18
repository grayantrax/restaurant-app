import React, { useState } from 'react';
import { usePos } from '../../context/PosContext';
import { Order } from '../../types/pos';
import { formatUGX, formatDateTime } from '../../utils/formatters';
import {
  Receipt,
  Search,
  Printer,
  Ban,
  Filter,
  CheckCircle,
  Eye,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';

export const OrderHistory: React.FC = () => {
  const { orders, openReceiptModal, voidOrder, currentUser } = usePos();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'kitchen_pending' | 'voided'>('all');
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<Order | null>(null);

  const filteredOrders = orders.filter((o) => {
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.customerName && o.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.tableName && o.tableName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      o.staffName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleVoid = (order: Order) => {
    const reason = window.prompt(
      `Enter reason for voiding Order #${order.orderNumber}:`,
      'Customer cancelled / wrong entry'
    );
    if (reason) {
      voidOrder(order.id, reason);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950 text-slate-100 space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-amber-400" />
            Order Ledger & 80mm Thermal Receipt Archive
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Search previous orders, reprint 80mm thermal receipts, or manage voids/refunds.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="w-56 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search #order, guest, staff..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
            />
          </div>

          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            {(['all', 'completed', 'kitchen_pending', 'voided'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg font-bold capitalize transition-all ${
                  statusFilter === st ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-850 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3.5">Order #</th>
                <th className="p-3.5">Date & Time</th>
                <th className="p-3.5">Type & Table</th>
                <th className="p-3.5">Items Ordered</th>
                <th className="p-3.5">Server / Cashier</th>
                <th className="p-3.5">Payment Method</th>
                <th className="p-3.5 font-mono">Total (UGX)</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">80mm Print Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredOrders.map((order) => {
                const isCompleted = order.status === 'completed';
                const isVoided = order.status === 'voided';
                return (
                  <tr key={order.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="p-3.5">
                      <span className="font-mono font-bold text-amber-400">
                        #{order.orderNumber}
                      </span>
                      {order.customerName && (
                        <span className="text-[10px] text-slate-400 block truncate max-w-[120px]">
                          {order.customerName}
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 font-mono text-slate-400">
                      {formatDateTime(order.createdAt)}
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-white capitalize">{order.type}</span>
                      {order.tableName && (
                        <span className="text-[10px] text-slate-400 block">{order.tableName}</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span className="text-slate-200">
                        {order.items.map((i) => `${i.quantity}x ${i.name}`).slice(0, 2).join(', ')}
                        {order.items.length > 2 && ` +${order.items.length - 2} more`}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-300 font-medium">
                      {order.staffName}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-semibold text-slate-300 uppercase">
                        {order.payments && order.payments.length > 0
                          ? order.payments[0].method.replace('_', ' ')
                          : 'Pending'}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-white">
                      {formatUGX(order.totalAmount)}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isCompleted
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : isVoided
                            ? 'bg-rose-500/15 text-rose-400'
                            : 'bg-amber-500/15 text-amber-400'
                        }`}
                      >
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openReceiptModal(order, true)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-bold transition-colors"
                          title="Print 80mm Receipt"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Reprint</span>
                        </button>

                        {!isVoided && isCompleted && (
                          <button
                            onClick={() => handleVoid(order)}
                            className="p-1 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                            title="Void Order"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
