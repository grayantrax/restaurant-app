import React, { useState } from 'react';
import { usePos } from '../../context/PosContext';
import { StaffUser, UserRole, RestaurantSettings as ISettings } from '../../types/pos';
import { testThermalPrintWeb } from '../../utils/thermalPrinter';
import { StaffManagement } from '../staff/StaffManagement';
import {
  Settings,
  Printer,
  Users,
  Building,
  Key,
  Smartphone,
  Save,
  Plus,
  Trash2,
  CheckCircle,
  Bluetooth,
  Usb,
  Wifi,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';

export const RestaurantSettings: React.FC = () => {
  const {
    settings,
    updateSettings,
    staffList,
    addStaff,
    updateStaff,
    deleteStaff,
    currentUser,
  } = usePos();

  const [activeTab, setActiveTab] = useState<'restaurant' | 'printer' | 'staff' | 'taxes'>('printer');
  const [formData, setFormData] = useState<ISettings>(settings);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [printerStatusMessage, setPrinterStatusMessage] = useState<string | null>(null);
  const [revealedPins, setRevealedPins] = useState<Record<string, boolean>>({});

  // New staff form state
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [staffRole, setStaffRole] = useState<UserRole>('Waiter');
  const [staffPin, setStaffPin] = useState('');
  const [staffPhone, setStaffPhone] = useState('+256 ');
  const [staffEmail, setStaffEmail] = useState('');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleTest80mmPrint = async () => {
    setPrinterStatusMessage('Sending ESC/POS 80mm test print...');
    const res = await testThermalPrintWeb(formData);
    if (res.success) {
      setPrinterStatusMessage(`✓ Test 80mm receipt dispatched via ${res.method}!`);
    } else {
      setPrinterStatusMessage(`Notice: ${res.error || 'Print completed or dialog displayed'}`);
    }
    setTimeout(() => setPrinterStatusMessage(null), 5000);
  };

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName.trim() || staffPin.length !== 4) return;

    addStaff({
      name: staffName.trim(),
      role: staffRole,
      pin: staffPin,
      email: staffEmail.trim() || `${staffName.toLowerCase().replace(/\s+/g, '')}@matooke.ug`,
      phone: staffPhone.trim(),
      isActive: true,
    });

    setIsAddStaffOpen(false);
    setStaffName('');
    setStaffPin('');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950 text-slate-100 space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-400" />
            Restaurant Settings & 80mm Hardware
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure restaurant identity, 80mm Bluetooth/USB thermal printer, staff PINs, and URA VAT.
          </p>
        </div>

        {saveSuccess && (
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 animate-pulse">
            <CheckCircle className="w-4 h-4" />
            <span>Settings Saved Successfully!</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs w-fit">
        <button
          onClick={() => setActiveTab('printer')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-bold transition-all ${
            activeTab === 'printer' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Printer className="w-3.5 h-3.5" />
          <span>80mm Thermal Printer</span>
        </button>
        <button
          onClick={() => setActiveTab('restaurant')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-bold transition-all ${
            activeTab === 'restaurant' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>Restaurant Info & MoMo</span>
        </button>
        <button
          onClick={() => setActiveTab('staff')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-bold transition-all ${
            activeTab === 'staff' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Staff Accounts & PINs ({staffList.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('taxes')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-bold transition-all ${
            activeTab === 'taxes' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>Taxes & Service Charges</span>
        </button>
      </div>

      {/* TAB 1: 80mm Thermal Printer Hardware & Settings */}
      {activeTab === 'printer' && (
        <div className="space-y-6 max-w-3xl">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Printer className="w-4 h-4 text-amber-400" />
                  Thermal Printer Interface & Format
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Standard 80mm paper width (48 columns, ESC/POS commands)
                </p>
              </div>

              <button
                type="button"
                onClick={handleTest80mmPrint}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-amber-500/20 active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>Test 80mm Print</span>
              </button>
            </div>

            {printerStatusMessage && (
              <div className="p-3 rounded-xl bg-slate-850 border border-amber-500/40 text-xs font-mono text-amber-300">
                {printerStatusMessage}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Connection Hardware Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['bluetooth', 'usb', 'network'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, printerType: type })}
                      className={`py-2 px-1 rounded-xl text-xs font-bold capitalize border flex flex-col items-center gap-1 transition-all ${
                        formData.printerType === type
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      {type === 'bluetooth' && <Bluetooth className="w-4 h-4" />}
                      {type === 'usb' && <Usb className="w-4 h-4" />}
                      {type === 'network' && <Wifi className="w-4 h-4" />}
                      <span>{type}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Paper Roll Size
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['80mm', '58mm'] as const).map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setFormData({ ...formData, paperWidth: sz })}
                      className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        formData.paperWidth === sz
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {sz} Thermal
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-3 bg-slate-850 rounded-xl">
                <div>
                  <div className="text-xs font-bold text-white">Auto-Print Receipts on Checkout</div>
                  <div className="text-[10px] text-slate-400">
                    Immediately send ESC/POS byte stream to printer when sale is confirmed
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.autoPrintReceiptOnPayment}
                  onChange={(e) => setFormData({ ...formData, autoPrintReceiptOnPayment: e.target.checked })}
                  className="w-5 h-5 text-amber-500 rounded bg-slate-800 border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Receipt Header Notice</label>
                <input
                  type="text"
                  value={formData.receiptHeaderNotice}
                  onChange={(e) => setFormData({ ...formData, receiptHeaderNotice: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Receipt Footer Note</label>
                <input
                  type="text"
                  value={formData.receiptFooterMessage}
                  onChange={(e) => setFormData({ ...formData, receiptFooterMessage: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveSettings}
            className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save Printer Settings</span>
          </button>
        </div>
      )}

      {/* TAB 2: Restaurant Identity & Mobile Money Codes */}
      {activeTab === 'restaurant' && (
        <form onSubmit={handleSaveSettings} className="space-y-4 max-w-2xl bg-slate-900 p-5 rounded-2xl border border-slate-800">
          <h3 className="text-sm font-bold text-white mb-3">Restaurant Identity & Merchant Numbers</h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Restaurant Trade Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Tagline / Slogan</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Street Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">City / Town</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Official Telephone (Phone 1)</label>
                <input
                  type="text"
                  value={formData.phone1}
                  onChange={(e) => setFormData({ ...formData, phone1: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">URA TIN (Tax Identification Number)</label>
                <input
                  type="text"
                  value={formData.tinNumber}
                  onChange={(e) => setFormData({ ...formData, tinNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>
            </div>

            {/* Mobile Money Codes */}
            <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-amber-400 font-bold mb-1">MTN MoMo Merchant Code</label>
                <input
                  type="text"
                  value={formData.mtnMerchantCode}
                  onChange={(e) => setFormData({ ...formData, mtnMerchantCode: e.target.value })}
                  placeholder="e.g. 984521"
                  className="w-full px-3 py-2 bg-slate-800 border border-amber-500/40 rounded-xl text-white font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-rose-400 font-bold mb-1">Airtel Money Merchant Code</label>
                <input
                  type="text"
                  value={formData.airtelPayCode}
                  onChange={(e) => setFormData({ ...formData, airtelPayCode: e.target.value })}
                  placeholder="e.g. 102938"
                  className="w-full px-3 py-2 bg-slate-800 border border-rose-500/40 rounded-xl text-white font-mono font-bold"
                />
              </div>
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Save Restaurant Info</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: Staff Accounts & PIN Codes */}
      {activeTab === 'staff' && (
        <div className="w-full">
          <StaffManagement />
        </div>
      )}

      {/* TAB 4: Taxes & Service Charge */}
      {activeTab === 'taxes' && (
        <form onSubmit={handleSaveSettings} className="space-y-4 max-w-xl bg-slate-900 p-5 rounded-2xl border border-slate-800 text-xs">
          <h3 className="text-sm font-bold text-white mb-2">URA VAT (18%) & Service Charge Settings</h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-850 rounded-xl">
              <div>
                <div className="font-bold text-white">Enable 18% URA VAT</div>
                <div className="text-[10px] text-slate-400">Apply standard Ugandan Value Added Tax</div>
              </div>
              <input
                type="checkbox"
                checked={formData.isVatEnabled}
                onChange={(e) => setFormData({ ...formData, isVatEnabled: e.target.checked })}
                className="w-5 h-5 text-amber-500 rounded bg-slate-800 border-slate-700"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">VAT Rate (0.18 for 18%)</label>
              <input
                type="number"
                step="0.01"
                value={formData.vatRate}
                onChange={(e) => setFormData({ ...formData, vatRate: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-850 rounded-xl mt-4">
              <div>
                <div className="font-bold text-white">Enable Restaurant Service Charge</div>
                <div className="text-[10px] text-slate-400">Mandatory dine-in hospitality tip</div>
              </div>
              <input
                type="checkbox"
                checked={formData.isServiceChargeEnabled}
                onChange={(e) => setFormData({ ...formData, isServiceChargeEnabled: e.target.checked })}
                className="w-5 h-5 text-amber-500 rounded bg-slate-800 border-slate-700"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Service Charge Rate (0.05 for 5%)</label>
              <input
                type="number"
                step="0.01"
                value={formData.serviceChargeRate}
                onChange={(e) => setFormData({ ...formData, serviceChargeRate: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
              />
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Save Tax Configuration</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
