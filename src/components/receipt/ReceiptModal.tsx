import React from 'react';
import { usePos } from '../../context/PosContext';
import { formatUGX } from '../../utils/formatters';
import { generate80mmReceiptText } from '../../utils/thermalPrinter';
import {
  Printer,
  X
} from 'lucide-react';

export const ReceiptModal: React.FC = () => {
  const { selectedReceiptOrder, isReceiptModalOpen, closeReceiptModal, settings } = usePos();

  if (!isReceiptModalOpen || !selectedReceiptOrder) return null;

  const order = selectedReceiptOrder;
  const receiptRawText = generate80mmReceiptText(order, settings);

  // Standard 80mm Browser / Thermal System Print
  const handleBrowserPrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      {/* Offscreen / Hidden Printable Element for System Print Dialog */}
      <div id="printable-area" className="hidden print:block font-mono-receipt text-black bg-white text-xs leading-tight">
        <pre className="whitespace-pre-wrap font-mono-receipt font-semibold">{receiptRawText}</pre>
      </div>

      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-800 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                80mm Thermal Receipt
                {order.isReprinted && (
                  <span className="px-2 py-0.5 text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                    Reprint
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">Order #{order.orderNumber} • UGX {order.totalAmount.toLocaleString()}</p>
            </div>
          </div>

          <button
            onClick={closeReceiptModal}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Authentic 80mm Physical Thermal Roll Paper Display */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center bg-slate-950/70">
          <div className="w-[340px] max-w-full bg-white text-slate-950 shadow-2xl rounded-sm p-5 font-mono-receipt text-xs leading-relaxed border-t-4 border-slate-300 select-text">
            {/* Receipt Header */}
            <div className="text-center border-b border-dashed border-slate-400 pb-3 mb-3">
              <div className="text-base font-extrabold tracking-wide uppercase">{settings.name}</div>
              {settings.tagline && <div className="text-[11px] text-slate-600 mt-0.5">{settings.tagline}</div>}
              <div className="text-[11px] text-slate-600">{settings.address}</div>
              <div className="text-[11px] text-slate-600">{settings.city} • Tel: {settings.phone1}</div>
              {settings.tinNumber && (
                <div className="text-[10px] text-slate-700 font-mono mt-0.5">URA TIN: {settings.tinNumber}</div>
              )}
            </div>

            {/* Meta Details */}
            <div className="border-b border-dashed border-slate-400 pb-2 mb-2 text-[11px] space-y-0.5">
              <div className="flex justify-between">
                <span>Receipt #:</span>
                <span className="font-bold">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{new Date(order.createdAt).toLocaleString('en-GB')}</span>
              </div>
              <div className="flex justify-between">
                <span>Order Type:</span>
                <span className="uppercase font-semibold">{order.type}</span>
              </div>
              {order.tableName && (
                <div className="flex justify-between">
                  <span>Table:</span>
                  <span className="font-bold">{order.tableName}</span>
                </div>
              )}
              {order.customerName && (
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span>{order.customerName}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Server / Cashier:</span>
                <span>{order.staffName}</span>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="border-b border-dashed border-slate-400 pb-2 mb-2">
              <div className="flex justify-between font-bold border-b border-slate-300 pb-1 mb-1 text-[11px]">
                <span className="w-1/2">Item</span>
                <span className="w-1/6 text-center">Qty</span>
                <span className="w-1/3 text-right">Price</span>
              </div>
              <div className="space-y-1 text-[11px]">
                {order.items.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between">
                      <span className="w-1/2 font-semibold truncate">{item.name}</span>
                      <span className="w-1/6 text-center font-bold">x{item.quantity}</span>
                      <span className="w-1/3 text-right font-mono">{formatUGX(item.totalPrice)}</span>
                    </div>
                    {item.variantName && (
                      <div className="text-[10px] text-slate-500 pl-2">({item.variantName})</div>
                    )}
                    {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                      <div className="text-[10px] text-slate-500 pl-2">
                        + {item.selectedAddOns.map((a) => a.name).join(', ')}
                      </div>
                    )}
                    {item.notes && (
                      <div className="text-[10px] text-slate-500 italic pl-2">Note: {item.notes}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Calculations */}
            <div className="border-b border-dashed border-slate-400 pb-2 mb-2 text-[11px] space-y-1">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-mono">{formatUGX(order.subtotal)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-rose-700">
                  <span>Discount ({order.discountType === 'percentage' ? `${order.discountValue}%` : 'Fixed'}):</span>
                  <span className="font-mono">-{formatUGX(order.discountAmount)}</span>
                </div>
              )}
              {settings.isVatEnabled && order.vatAmount > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>VAT ({settings.vatRate * 100}%):</span>
                  <span className="font-mono">{formatUGX(order.vatAmount)}</span>
                </div>
              )}
              {settings.isServiceChargeEnabled && order.serviceChargeAmount > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Service ({settings.serviceChargeRate * 100}%):</span>
                  <span className="font-mono">{formatUGX(order.serviceChargeAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-extrabold text-sm border-t border-slate-300 pt-1 text-black">
                <span>TOTAL:</span>
                <span className="font-mono">{formatUGX(order.totalAmount)}</span>
              </div>
            </div>

            {/* Payment Record */}
            <div className="border-b border-dashed border-slate-400 pb-2 mb-3 text-[11px] space-y-0.5">
              <div className="font-bold uppercase text-[10px] text-slate-600 mb-0.5">Payment Details:</div>
              {order.payments && order.payments.length > 0 ? (
                order.payments.map((p, i) => (
                  <div key={i} className="space-y-0.5">
                    <div className="flex justify-between">
                      <span className="capitalize">{p.method.replace('_', ' ')}:</span>
                      <span className="font-mono font-semibold">{formatUGX(p.amount)}</span>
                    </div>
                    {p.tenderedCash !== undefined && (
                      <div className="flex justify-between text-slate-600 text-[10px]">
                        <span>Tendered:</span>
                        <span className="font-mono">{formatUGX(p.tenderedCash)}</span>
                      </div>
                    )}
                    {p.changeGiven !== undefined && p.changeGiven > 0 && (
                      <div className="flex justify-between font-bold text-slate-900 text-[10px]">
                        <span>Change Given:</span>
                        <span className="font-mono">{formatUGX(p.changeGiven)}</span>
                      </div>
                    )}
                    {p.referenceNumber && (
                      <div className="text-[10px] font-mono text-slate-600">
                        Ref: {p.referenceNumber}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="uppercase font-bold text-amber-700">{order.paymentStatus}</span>
                </div>
              )}
            </div>

            {/* MoMo Merchant Codes */}
            {(settings.mtnMerchantCode || settings.airtelPayCode) && (
              <div className="p-2 bg-slate-100 rounded border border-slate-300 mb-3 text-center text-[10px] font-mono">
                <div className="font-bold text-slate-800 mb-0.5">Pay via Mobile Money:</div>
                {settings.mtnMerchantCode && <div>MTN MoMo: *165*3*{settings.mtnMerchantCode}#</div>}
                {settings.airtelPayCode && <div>Airtel Pay: *185*9*{settings.airtelPayCode}#</div>}
              </div>
            )}

            {/* Receipt Notice & Footer */}
            {settings.receiptHeaderNotice && (
              <div className="text-center italic text-[10px] text-slate-700 mb-2">
                "{settings.receiptHeaderNotice}"
              </div>
            )}

            <div className="text-center text-[10px] text-slate-600 space-y-1 pt-1">
              {settings.receiptFooterMessage ? (
                settings.receiptFooterMessage.split('\n').map((line, i) => (
                  <div key={i} className="font-medium text-slate-800">{line}</div>
                ))
              ) : (
                <div>Webale Nnyo! Thank you for dining with us.</div>
              )}
              <div className="text-[9px] text-slate-400 pt-2 font-mono">=== Powered by JOJO FOODIES ===</div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-slate-850 border-t border-slate-700 flex items-center justify-between gap-3">
          <button
            onClick={handleBrowserPrint}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-amber-500/20 text-sm active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>

          <button
            onClick={closeReceiptModal}
            className="px-5 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
