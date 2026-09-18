import React from 'react';
import { usePos } from '../../context/PosContext';
import { formatUGX, formatDateTime } from '../../utils/formatters';
import { X, Play, Trash2, PauseCircle } from 'lucide-react';

interface HeldOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HeldOrdersModal: React.FC<HeldOrdersModalProps> = ({ isOpen, onClose }) => {
  const { heldOrders, resumeOrder, deleteHeldOrder } = usePos();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-5 py-4 bg-slate-850 border-b border-slate-750">
          <div className="flex items-center gap-2">
            <PauseCircle className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Held & Suspended Orders</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {heldOrders.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              <PauseCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="font-semibold text-slate-400">No Orders On Hold</p>
              <p className="mt-1 text-[11px]">Hold an order from the POS register if a guest pauses to add more items.</p>
            </div>
          ) : (
            heldOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 bg-slate-850 border border-slate-800 rounded-xl flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-400 text-sm">
                      #{order.orderNumber}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-950 text-[10px] uppercase font-bold text-slate-300">
                      {order.type} {order.tableName ? `• ${order.tableName}` : ''}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">
                    Held by {order.staffName} at {formatDateTime(order.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono font-bold text-white text-sm mr-2">
                    {formatUGX(order.totalAmount)}
                  </span>
                  <button
                    onClick={() => {
                      resumeOrder(order.id);
                      onClose();
                    }}
                    className="flex items-center gap-1 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Resume</span>
                  </button>
                  <button
                    onClick={() => deleteHeldOrder(order.id)}
                    className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-slate-800 transition-colors"
                    title="Discard Held Order"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-3 bg-slate-850 border-t border-slate-750 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
