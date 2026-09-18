import { Order, RestaurantSettings } from '../types/pos';
import { formatUGX } from './formatters';

// 80mm printers typically have 48 characters per line in standard font A, or 42.
const RECEIPT_LINE_WIDTH = 44;

function padLine(left: string, right: string, width: number = RECEIPT_LINE_WIDTH): string {
  const spaceNeeded = width - left.length - right.length;
  if (spaceNeeded <= 0) {
    return left.slice(0, width - right.length - 1) + ' ' + right;
  }
  return left + ' '.repeat(spaceNeeded) + right;
}

function centerLine(text: string, width: number = RECEIPT_LINE_WIDTH): string {
  if (text.length >= width) return text;
  const leftPad = Math.floor((width - text.length) / 2);
  return ' '.repeat(leftPad) + text;
}

/**
 * Generates an authentic formatted string representation for an 80mm thermal receipt.
 */
export function generate80mmReceiptText(order: Order, settings: RestaurantSettings): string {
  const divider = '='.repeat(RECEIPT_LINE_WIDTH);
  const thinDivider = '-'.repeat(RECEIPT_LINE_WIDTH);
  const lines: string[] = [];

  // Header
  lines.push(centerLine(settings.name.toUpperCase()));
  if (settings.tagline) {
    lines.push(centerLine(settings.tagline));
  }
  lines.push(centerLine(settings.address));
  lines.push(centerLine(settings.city));
  lines.push(centerLine(`Tel: ${settings.phone1}`));
  if (settings.tinNumber) {
    lines.push(centerLine(`URA TIN: ${settings.tinNumber}`));
  }
  lines.push(divider);

  if (order.isReprinted) {
    lines.push(centerLine('*** DUPLICATE / REPRINT ***'));
  }
  lines.push(centerLine(settings.receiptHeaderNotice || 'FISCAL RECEIPT'));
  lines.push(thinDivider);

  // Metadata
  lines.push(padLine(`Order: #${order.orderNumber}`, `Type: ${order.type.toUpperCase()}`));
  if (order.tableName) {
    lines.push(padLine(`Table: ${order.tableName}`, `Server: ${order.staffName}`));
  } else {
    lines.push(padLine('Counter Sale', `Server: ${order.staffName}`));
  }
  lines.push(padLine(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, `Time: ${new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`));
  if (order.customerName) {
    lines.push(padLine(`Customer: ${order.customerName}`, order.customerPhone || ''));
  }
  if (order.deliveryAddress) {
    lines.push(`Deliver To: ${order.deliveryAddress}`);
  }
  lines.push(divider);

  // Column Headers
  lines.push(padLine('QTY  DESCRIPTION', 'AMOUNT (UGX)'));
  lines.push(thinDivider);

  // Items
  order.items.forEach((item) => {
    const qtyText = `${item.quantity}x `.padEnd(4, ' ');
    const itemName = item.name + (item.variantName ? ` (${item.variantName})` : '');
    const priceText = formatUGX(item.totalPrice).replace('UGX ', '');
    lines.push(padLine(`${qtyText}${itemName}`, priceText));

    // Modifiers / Add-ons
    if (item.selectedAddOns && item.selectedAddOns.length > 0) {
      item.selectedAddOns.forEach((addon) => {
        const addonPrice = formatUGX(addon.price * item.quantity).replace('UGX ', '');
        lines.push(padLine(`   + ${addon.name}`, addonPrice));
      });
    }

    // Special Kitchen Notes
    if (item.notes) {
      lines.push(`   * Note: ${item.notes}`);
    }
  });

  lines.push(divider);

  // Subtotal & Calculations
  lines.push(padLine('Subtotal:', formatUGX(order.subtotal)));

  if (order.discountAmount > 0) {
    const discLabel = order.discountType === 'percentage' 
      ? `Discount (${order.discountValue}%):` 
      : 'Discount:';
    lines.push(padLine(discLabel, `-${formatUGX(order.discountAmount)}`));
  }

  if (order.serviceChargeAmount > 0) {
    lines.push(padLine(`Service Charge (${Math.round(order.serviceChargeRate * 100)}%):`, formatUGX(order.serviceChargeAmount)));
  }

  if (order.vatAmount > 0) {
    lines.push(padLine(`VAT (18% Included):`, formatUGX(order.vatAmount)));
  }

  lines.push(divider);
  lines.push(padLine('TOTAL DUE:', formatUGX(order.totalAmount)));
  lines.push(divider);

  // Payment Breakdown
  if (order.payments && order.payments.length > 0) {
    lines.push('PAYMENT DETAILS:');
    order.payments.forEach((p) => {
      let methodLabel = p.method.toUpperCase().replace('_', ' ');
      if (p.method === 'mtn_momo') methodLabel = 'MTN MOMO PAY';
      if (p.method === 'airtel_money') methodLabel = 'AIRTEL MONEY';

      lines.push(padLine(` Paid via ${methodLabel}:`, formatUGX(p.amount)));
      if (p.referenceNumber) {
        lines.push(`   Txn Ref: ${p.referenceNumber}`);
      }
      if (p.tenderedCash && p.changeGiven !== undefined) {
        lines.push(padLine('   Cash Tendered:', formatUGX(p.tenderedCash)));
        lines.push(padLine('   Change Returned:', formatUGX(p.changeGiven)));
      }
    });
    lines.push(thinDivider);
  }

  // Merchant Codes for Customer Convenience
  if (settings.mtnMerchantCode || settings.airtelPayCode) {
    lines.push(centerLine('PAYMENT MERCHANT CODES:'));
    if (settings.mtnMerchantCode) {
      lines.push(centerLine(`MTN MoMo Merchant Code: *165*3*${settings.mtnMerchantCode}#`));
    }
    if (settings.airtelPayCode) {
      lines.push(centerLine(`Airtel Pay Code: *185*9*${settings.airtelPayCode}#`));
    }
    lines.push(thinDivider);
  }

  // Footer
  if (settings.receiptFooterMessage) {
    settings.receiptFooterMessage.split('\n').forEach((msgLine) => {
      lines.push(centerLine(msgLine));
    });
  }

  lines.push(centerLine('Powered by JOJO FOODIES'));
  lines.push('\n\n\n'); // Paper feed for physical tear line

  return lines.join('\n');
}

/**
 * Builds raw ESC/POS binary byte stream command sequence for 80mm thermal printers.
 * Supports ESC @ (init), ESC a (align), ESC ! (font scale), GS V (paper cut), etc.
 */
export function generateEscPosBytes(order: Order, settings: RestaurantSettings): Uint8Array {
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];

  // ESC @: Initialize printer
  chunks.push(new Uint8Array([0x1B, 0x40]));

  // ESC t 0: Standard ASCII / PC437
  chunks.push(new Uint8Array([0x1B, 0x74, 0x00]));

  // Center alignment for Header: ESC a 1
  chunks.push(new Uint8Array([0x1B, 0x61, 0x01]));

  // Double height & double width for restaurant name: GS ! 0x11
  chunks.push(new Uint8Array([0x1D, 0x21, 0x11]));
  chunks.push(encoder.encode(settings.name + '\n'));

  // Normal font: GS ! 0x00
  chunks.push(new Uint8Array([0x1D, 0x21, 0x00]));
  if (settings.tagline) chunks.push(encoder.encode(settings.tagline + '\n'));
  chunks.push(encoder.encode(`${settings.address}, ${settings.city}\n`));
  chunks.push(encoder.encode(`Tel: ${settings.phone1}\n`));
  if (settings.tinNumber) chunks.push(encoder.encode(`URA TIN: ${settings.tinNumber}\n`));
  chunks.push(encoder.encode('================================================\n'));

  if (order.isReprinted) {
    chunks.push(encoder.encode('*** DUPLICATE REPRINT ***\n'));
  }
  chunks.push(encoder.encode(`${settings.receiptHeaderNotice || 'FISCAL RECEIPT'}\n`));
  chunks.push(encoder.encode('------------------------------------------------\n'));

  // Left alignment: ESC a 0
  chunks.push(new Uint8Array([0x1B, 0x61, 0x00]));

  // Body text formatted
  const bodyText = generate80mmReceiptText(order, settings);
  // We already prepared formatted text; encode full content cleanly:
  chunks.push(encoder.encode(bodyText + '\n\n'));

  // Feed 4 lines and Cut paper: GS V 66 0
  chunks.push(new Uint8Array([0x1D, 0x56, 0x42, 0x00]));

  // Optional: open cash drawer via pulse on pin 2: ESC p 0 25 250
  // chunks.push(new Uint8Array([0x1B, 0x70, 0x00, 0x19, 0xFA]));

  // Flatten chunks into a single Uint8Array
  const totalLength = chunks.reduce((acc, c) => acc + c.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}

/**
 * Handles Web Bluetooth printing to standard 80mm ESC/POS Bluetooth printers.
 */
export async function printViaWebBluetooth(bytes: Uint8Array): Promise<{ success: boolean; message: string }> {
  // Check if Web Bluetooth API is supported
  const nav = navigator as any;
  if (!nav.bluetooth) {
    return {
      success: false,
      message: 'Web Bluetooth is not supported in this browser. Please use Chrome on Android or system print dialog.'
    };
  }

  try {
    const device = await nav.bluetooth.requestDevice({
      filters: [
        { services: ['000018f0-0000-1000-8000-00805f9b34fb'] }, // Standard ESC/POS service
        { services: ['e7810a71-73ae-499d-8c15-faa9aef0c3f2'] },
        { namePrefix: 'POS' },
        { namePrefix: 'MTP' },
        { namePrefix: 'RP' },
        { namePrefix: 'Thermal' }
      ],
      optionalServices: [
        '000018f0-0000-1000-8000-00805f9b34fb',
        'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
        '0000ff00-0000-1000-8000-00805f9b34fb'
      ]
    });

    const server = await device.gatt.connect();
    // Search primary services
    const services = await server.getPrimaryServices();
    if (services.length === 0) {
      throw new Error('No compatible thermal printer service found on Bluetooth device.');
    }

    const service = services[0];
    const characteristics = await service.getCharacteristics();
    const writeChar = characteristics.find((c: any) => c.properties.write || c.properties.writeWithoutResponse);

    if (!writeChar) {
      throw new Error('No writable ESC/POS characteristic found.');
    }

    // Send in chunks of 100 bytes to avoid BLE MTU buffer overflows
    const chunkSize = 100;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const slice = bytes.slice(i, i + chunkSize);
      await writeChar.writeValue(slice);
    }

    return {
      success: true,
      message: `Successfully printed to Bluetooth printer ${device.name || 'Device'}!`
    };
  } catch (err: any) {
    if (err.name === 'NotFoundError') {
      return { success: false, message: 'Printer selection cancelled.' };
    }
    return { success: false, message: `Bluetooth Print Error: ${err.message || err}` };
  }
}

/**
 * Handles WebUSB direct printing to 80mm ESC/POS USB receipt printers.
 */
export async function printViaWebUsb(bytes: Uint8Array): Promise<{ success: boolean; message: string }> {
  const nav = navigator as any;
  if (!nav.usb) {
    return {
      success: false,
      message: 'WebUSB is not supported in this browser. Use Chrome on Android or OTG USB cable.'
    };
  }

  try {
    const device = await nav.usb.requestDevice({
      filters: [{ classCode: 7 }] // USB Printer Class
    });

    await device.open();
    await device.selectConfiguration(1);
    await device.claimInterface(0);

    // Find endpoint
    const endpoint = device.configuration.interfaces[0].alternate.endpoints.find(
      (e: any) => e.direction === 'out'
    );

    if (!endpoint) {
      throw new Error('USB Out endpoint not found on receipt printer.');
    }

    await device.transferOut(endpoint.endpointNumber, bytes);
    return {
      success: true,
      message: `Printed successfully to USB printer (${device.productName || 'USB Printer'})!`
    };
  } catch (err: any) {
    if (err.name === 'NotFoundError') {
      return { success: false, message: 'USB Printer pairing cancelled.' };
    }
    return { success: false, message: `USB Print Error: ${err.message || err}` };
  }
}

/**
 * Executes an 80mm print job using configured hardware (Bluetooth, USB, or browser thermal dialog)
 */
export async function execute80mmPrint(order: Order, settings: RestaurantSettings): Promise<{ success: boolean; method: string; error?: string }> {
  try {
    const escBytes = generateEscPosBytes(order, settings);

    if (settings.printerType === 'bluetooth') {
      const res = await printViaWebBluetooth(escBytes);
      if (res.success) return { success: true, method: 'Bluetooth 80mm ESC/POS' };
      // Fallback to browser print if Bluetooth pairing fails/unsupported
    } else if (settings.printerType === 'usb') {
      const res = await printViaWebUsb(escBytes);
      if (res.success) return { success: true, method: 'USB OTG ESC/POS' };
    }

    // Default or Fallback: Browser Print dialog optimized for 80mm roll width
    window.print();
    return { success: true, method: 'Browser Print (80mm Thermal Mode)' };
  } catch (err: any) {
    return { success: false, method: 'none', error: err.message || 'Print error' };
  }
}

/**
 * Tests 80mm thermal receipt printing with dummy restaurant order
 */
export async function testThermalPrintWeb(settings: RestaurantSettings): Promise<{ success: boolean; method: string; error?: string }> {
  const dummyOrder: Order = {
    id: 'test-print-receipt',
    orderNumber: 'TEST-80MM',
    type: 'dine-in',
    tableName: 'Table 1',
    customerName: 'Test Customer',
    items: [
      {
        cartItemId: 'test-item-1',
        menuItemId: 'm1',
        name: 'Matooke & Beef Luwombo',
        unitPrice: 28000,
        quantity: 1,
        selectedAddOns: [],
        totalPrice: 28000,
        costPrice: 12000,
      },
      {
        cartItemId: 'test-item-2',
        menuItemId: 'm2',
        name: 'Nile Special Lager 500ml',
        unitPrice: 7000,
        quantity: 2,
        selectedAddOns: [],
        totalPrice: 14000,
        costPrice: 4500,
      },
    ],
    subtotal: 42000,
    discountAmount: 0,
    vatRate: 0.18,
    vatAmount: 7560,
    serviceChargeRate: 0.05,
    serviceChargeAmount: 2100,
    totalAmount: 51660,
    status: 'completed',
    paymentStatus: 'paid',
    payments: [
      {
        id: 'pay-test-1',
        method: 'mtn_momo',
        amount: 51660,
        referenceNumber: 'UG-MOMO-892110',
        timestamp: new Date().toISOString(),
      },
    ],
    staffId: 'staff-1',
    staffName: 'Admin Owner',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return execute80mmPrint(dummyOrder, settings);
}

