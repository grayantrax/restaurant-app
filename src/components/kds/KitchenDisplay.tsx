import React, { useState, useEffect } from 'react';
import { usePos } from '../../context/PosContext';
import { Order, CartItem } from '../../types/pos';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  AlertCircle,
  Volume2,
  VolumeX,
  Utensils,
  ShoppingBag,
  Bike,
  Filter
} from 'lucide-react';

export const KitchenDisplay: React.FC = () => {
  const { orders, updateKitchenStatus, settings } = usePos();
  const [filterType, setFilterType] = useState<'all' | 'dine-in' | 'takeaway' | 'delivery'>('all');
  const [soundEnabled, setSoundEnabled] = useState(settings.kitchenChimeEnabled);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update timer every 15s to keep elapsed minutes accurate
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 15000);
    return () => clearInterval(timer);
  }, []);

  // Filter orders that are relevant to the kitchen: kitchen_pending, kitchen_preparing, kitchen_ready
  const kitchenOrders = orders.filter((o) => {
    const isKitchenStatus =
      o.status === 'kitchen_pending' ||
      o.status === 'kitchen_preparing' ||
      o.status === 'kitchen_ready';
    const matchesType = filterType === 'all' || o.type === filterType;
    return isKitchenStatus && matchesType;
  });

  const getElapsedMinutes = (dateStr: string) => {
    const diffMs = currentTime - new Date(dateStr).getTime();
    return Math.max(0, Math.floor(diffMs / 60000));
  };

  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      // Audio context might be restricted before gesture
    }
  };

  const cycleItemStatus = (orderId: string, item: CartItem) => {
    const current = item.kitchenStatus || 'pending';
    let next: 'pending' | 'cooking' | 'ready' | 'served' = 'cooking';
    if (current === 'pending') next = 'cooking';
    else if (current === 'cooking') {
      next = 'ready';
      playChime();
    } else if (current === 'ready') next = 'served';
    else next = 'pending';

    updateKitchenStatus(orderId, item.cartItemId, next);
  };

  const markAllReady = (order: Order) => {
    order.items.forEach((item) => {
      updateKitchenStatus(order.id, item.cartItemId, 'ready');
    });
    playChime();
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950 text-slate-100 space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-amber-400" />
            Kitchen Display System (KDS)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time kitchen order tickets, order timers and item status tracker.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Sound alert toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
              soundEnabled
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-slate-800 border-slate-750 text-slate-400'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{soundEnabled ? 'Kitchen Chime ON' : 'Chime Muted'}</span>
          </button>

          {/* Filter Type */}
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            {(['all', 'dine-in', 'takeaway', 'delivery'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 rounded-lg font-bold capitalize transition-all ${
                  filterType === type ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Board */}
      {kitchenOrders.length === 0 ? (
        <div className="h-72 rounded-3xl border border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-500 text-sm">
          <ChefHat className="w-12 h-12 mb-3 opacity-30 text-amber-400" />
          <p className="font-bold text-slate-300">All Kitchen Orders Cleared!</p>
          <p className="text-xs text-slate-500 mt-1">
            New orders sent from the POS register will display here instantly.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {kitchenOrders.map((order) => {
            const elapsed = getElapsedMinutes(order.createdAt);
            const isLate = elapsed >= 20;
            const isWarning = elapsed >= 10 && elapsed < 20;

            return (
              <div
                key={order.id}
                className={`rounded-2xl border flex flex-col justify-between overflow-hidden shadow-xl transition-all ${
                  isLate
                    ? 'bg-slate-900 border-rose-500/70 shadow-rose-500/10'
                    : isWarning
                    ? 'bg-slate-900 border-amber-500/60 shadow-amber-500/10'
                    : 'bg-slate-900 border-slate-750'
                }`}
              >
                {/* Ticket Top Header */}
                <div
                  className={`p-3 border-b flex items-center justify-between text-xs ${
                    isLate
                      ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                      : isWarning
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                      : 'bg-slate-850 border-slate-750 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-sm text-white">
                      #{order.orderNumber}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-950/60 text-[10px] font-bold uppercase">
                      {order.type}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 font-mono font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{elapsed}m ago</span>
                  </div>
                </div>

                {/* Meta info: Table & Server */}
                <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold text-white">
                    {order.tableName ? `Table: ${order.tableName}` : 'Takeaway / Delivery'}
                  </span>
                  <span>Server: {order.staffName}</span>
                </div>

                {/* Items List */}
                <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-72">
                  {order.items.map((item) => {
                    const status = item.kitchenStatus || 'pending';
                    return (
                      <div
                        key={item.cartItemId}
                        onClick={() => cycleItemStatus(order.id, item)}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                          status === 'ready'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                            : status === 'cooking'
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                            : status === 'served'
                            ? 'bg-slate-800/40 border-slate-800 text-slate-500 line-through'
                            : 'bg-slate-800/80 border-slate-700/80 text-white'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-xs font-bold">
                            <span className="text-amber-400 text-sm font-mono mr-1">
                              {item.quantity}x
                            </span>
                            {item.name}
                            {item.variantName && (
                              <span className="text-[10px] text-slate-400"> ({item.variantName})</span>
                            )}
                          </span>

                          <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase shrink-0 bg-slate-950">
                            {status}
                          </span>
                        </div>

                        {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                          <div className="text-[10px] text-slate-400 pl-4 mt-0.5">
                            + {item.selectedAddOns.map((a) => a.name).join(', ')}
                          </div>
                        )}

                        {item.notes && (
                          <div className="text-[10px] italic text-rose-300 font-medium pl-4 mt-0.5">
                            Kitchen Note: {item.notes}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Ticket Footer Actions */}
                <div className="p-3 bg-slate-850 border-t border-slate-750 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-400">Tap item to change status</span>
                  <button
                    onClick={() => markAllReady(order)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition-colors shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>All Ready</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
