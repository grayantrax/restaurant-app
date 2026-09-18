/**
 * Formats amount in Ugandan Shillings (UGX).
 * In Uganda, currency is commonly represented as 'UGX 15,000' or '15,000/='.
 */
export function formatUGX(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return 'UGX 0';
  const rounded = Math.round(amount);
  return `UGX ${rounded.toLocaleString('en-US')}`;
}

export function formatUGXShort(amount: number | undefined | null): string {
  if (!amount) return '0';
  return Math.round(amount).toLocaleString('en-US');
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatTime(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  return `${formatDate(dateString)} ${formatTime(dateString)}`;
}

export function generateOrderNumber(lastSeqNumber: number): string {
  const padded = String(lastSeqNumber).padStart(4, '0');
  return `KLA-${padded}`;
}
