import React, { useState } from 'react';
import { usePos } from '../../context/PosContext';
import { formatUGX } from '../../utils/formatters';
import {
  UtensilsCrossed,
  Lock,
  PauseCircle,
  Wifi,
  WifiOff,
  Maximize2,
  Printer,
  Coins,
  ChevronDown,
  LogOut,
  Layers,
  ChefHat,
  Receipt,
  LayoutGrid,
  ClipboardList,
  Package,
  FileBarChart,
  CalendarDays,
  Settings,
  ShieldAlert,
  WalletCards,
  MoreHorizontal,
  RotateCcw,
  Users
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

export type ActiveTab =
  | 'pos'
  | 'tables'
  | 'kds'
  | 'menu'
  | 'inventory'
  | 'cash'
  | 'reports'
  | 'orders'
  | 'crm'
  | 'expenses'
  | 'settings'
  | 'audit'
  | 'staff';

interface HeaderProps {
  currentTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenHeldOrdersModal: () => void;
  onOpenResetZeroModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenHeldOrdersModal,
  onOpenResetZeroModal,
}) => {
  const {
    currentUser,
    openPinLock,
    logout,
    heldOrders,
    cashShift,
    isOnline,
    settings,
    orders
  } = usePos();

  const [staffMenuOpen, setStaffMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const isAdmin = currentUser?.role === 'Admin';

  const primaryNavItems: { id: ActiveTab; label: string; icon: any; badge?: number }[] = [
    { id: 'pos', label: 'POS Register', icon: UtensilsCrossed },
    { id: 'tables', label: 'Tables', icon: LayoutGrid },
    {
      id: 'kds',
      label: 'Kitchen KDS',
      icon: ChefHat,
      badge: orders.filter((o) => o.status === 'kitchen_pending' || o.status === 'kitchen_preparing').length,
    },
    { id: 'orders', label: 'Orders', icon: Receipt },
  ];

  const secondaryNavItems: { id: ActiveTab; label: string; icon: any }[] = isAdmin
    ? [
        { id: 'staff', label: 'Staff & Passwords', icon: Users },
        { id: 'crm', label: 'Accounts & Guests', icon: CalendarDays },
        { id: 'inventory', label: 'Inventory', icon: Package },
        { id: 'reports', label: 'Reports', icon: FileBarChart },
        { id: 'cash', label: 'Cash Drawer Float', icon: Coins },
        { id: 'menu', label: 'Menu Management', icon: ClipboardList },
        { id: 'expenses', label: 'Expenses & Payouts', icon: WalletCards },
        { id: 'settings', label: 'Settings & 80mm Printer', icon: Settings },
        { id: 'audit', label: 'Audit Security Trail', icon: ShieldAlert },
      ]
    : [];

  const activeSecondary = secondaryNavItems.find(item => item.id === currentTab);

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 shadow-md">
      {/* Top Status & Brand Bar */}
      <div className="px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2 border-b border-slate-800/80">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-extrabold shadow-md shadow-amber-500/20">
            <span className="text-base tracking-tighter">JF</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight leading-tight">
                {settings.name || 'JOJO FOODIES'}
              </h1>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                UGX
              </span>
            </div>
            {settings.tagline ? (
              <p className="text-[10px] text-slate-400 hidden sm:block">{settings.tagline}</p>
            ) : null}
          </div>
        </div>

        {/* Central quick indicators */}
        <div className="flex items-center gap-2">
          {/* Held Orders quick button */}
          <button
            onClick={onOpenHeldOrdersModal}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              heldOrders.length > 0
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 animate-pulse'
                : 'bg-slate-800/70 border-slate-700/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            <PauseCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Held Orders:</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-900 text-amber-400 font-mono text-[11px] font-bold">
              {heldOrders.length}
            </span>
          </button>

          {/* Cash Drawer Float Preview (Admin Only) */}
          {isAdmin && (
            <button
              onClick={() => onSelectTab('cash')}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 text-xs text-slate-300 transition-colors"
              title="Click to view Cash Drawer shift"
            >
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">Drawer:</span>
              <span className="font-mono font-bold text-amber-300">
                {formatUGX(cashShift.expectedCash)}
              </span>
            </button>
          )}

          {/* Online / Offline Status */}
          <div
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border ${
              isOnline
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-400 border-amber-500/40'
            }`}
            title={isOnline ? 'Online - Local offline backup synced' : 'Offline Mode active - POS works seamlessly without internet'}
          >
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            <span className="hidden sm:inline">{isOnline ? 'Online' : 'Offline Mode'}</span>
          </div>

          {/* 80mm Printer Status Chip (Admin Only) */}
          {isAdmin && (
            <button
              onClick={() => onSelectTab('settings')}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800/80 border border-slate-700/80 text-[11px] text-slate-300 hover:border-amber-500/50 transition-colors"
              title="80mm Thermal Printer Settings"
            >
              <Printer className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline font-mono">80mm</span>
            </button>
          )}

          {/* Android PWA Install */}
          <PWAInstallButton />

          {/* Fullscreen for Android touch POS */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white border border-slate-700/70 transition-colors"
            title="Toggle Android Fullscreen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Current User & Lock Screen */}
        <div className="relative">
          <button
            onClick={() => setStaffMenuOpen(!staffMenuOpen)}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700/80 text-xs text-white transition-colors"
          >
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold flex items-center justify-center text-[10px]">
              {currentUser ? currentUser.name.slice(0, 2).toUpperCase() : '??'}
            </div>
            <div className="text-left hidden sm:block">
              <div className="font-semibold leading-none">{currentUser?.name.split(' ')[0] || 'Staff'}</div>
              <div className="text-[9px] text-slate-400">{currentUser?.role || 'Locked'}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {staffMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setStaffMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-2xl shadow-xl py-1.5 z-40 text-xs">
                <div className="px-3 py-2 border-b border-slate-700/80">
                  <p className="font-semibold text-white">{currentUser?.name}</p>
                  <p className="text-[10px] text-amber-400 font-medium">{currentUser?.role} Account</p>
                  <p className="text-[9px] text-slate-400 font-mono mt-0.5">PIN: ••••</p>
                </div>

                <button
                  onClick={() => {
                    setStaffMenuOpen(false);
                    openPinLock();
                  }}
                  className="w-full px-3 py-2 text-left text-slate-200 hover:bg-slate-700/60 flex items-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Switch Staff / Lock PIN</span>
                </button>

                <button
                  onClick={() => {
                    setStaffMenuOpen(false);
                    logout();
                  }}
                  className="w-full px-3 py-2 text-left text-rose-400 hover:bg-slate-700/60 flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout Session</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-t border-slate-800/80 relative">
        <nav className={`flex items-center ${isAdmin ? 'gap-1.5 sm:gap-2' : 'gap-2 sm:gap-3'} overflow-x-auto no-scrollbar py-0.5 min-w-0 flex-1`}>
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-2 ${
                  isAdmin ? 'px-3.5 py-1.5 text-xs' : 'px-4 sm:px-5 py-2 text-xs sm:text-sm'
                } rounded-xl font-bold whitespace-nowrap transition-all shrink-0 ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <Icon className={isAdmin ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                    isActive ? 'bg-slate-950 text-amber-400' : 'bg-rose-500 text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Logout Button directly after Orders button for clear, instant access */}
          <button
            onClick={logout}
            className={`flex items-center gap-2 ${
              isAdmin ? 'px-3.5 py-1.5 text-xs' : 'px-4 sm:px-5 py-2 text-xs sm:text-sm'
            } rounded-xl font-bold whitespace-nowrap transition-all shrink-0 text-rose-300 hover:text-white hover:bg-rose-500/25 bg-rose-500/10 border border-rose-500/30 active:scale-95 cursor-pointer ml-0.5`}
            title="Lock POS & Logout Session"
          >
            <LogOut className={isAdmin ? 'w-3.5 h-3.5 text-rose-400' : 'w-4 h-4 text-rose-400'} />
            <span>Logout</span>
          </button>
        </nav>

        {/* More Menu Dropdown (Admin Only) */}
        {isAdmin && secondaryNavItems.length > 0 && (
          <div className="relative shrink-0 ml-2">
            <button
              onClick={() => setMoreMenuOpen(!moreMenuOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeSecondary
                  ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold'
                  : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800 border border-slate-700/80 bg-slate-850'
              }`}
            >
              {activeSecondary ? (
                <>
                  <activeSecondary.icon className="w-3.5 h-3.5 text-amber-400" />
                  <span>{activeSecondary.label}</span>
                </>
              ) : (
                <>
                  <MoreHorizontal className="w-3.5 h-3.5 text-amber-400" />
                  <span>More</span>
                </>
              )}
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${moreMenuOpen ? 'rotate-180 text-amber-400' : ''}`} />
            </button>

            {moreMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]"
                  onClick={() => setMoreMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-64 max-w-[90vw] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-2 z-50 text-xs overflow-hidden">
                  <div className="px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-amber-400 border-b border-slate-800 flex items-center justify-between">
                    <span>Operations & Management</span>
                    <span className="text-slate-400 text-[9px] font-normal">{secondaryNavItems.length} modules</span>
                  </div>
                  <div className="max-h-[70vh] overflow-y-auto py-1">
                    {secondaryNavItems.map((sec) => {
                      const SecIcon = sec.icon;
                      const isSecActive = currentTab === sec.id;
                      return (
                        <button
                          key={sec.id}
                          onClick={() => {
                            onSelectTab(sec.id);
                            setMoreMenuOpen(false);
                          }}
                          className={`w-full px-3.5 py-2.5 text-left flex items-center gap-3 transition-colors ${
                            isSecActive
                              ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                              : 'text-slate-200 hover:bg-slate-800'
                          }`}
                        >
                          <SecIcon className={`w-4 h-4 shrink-0 ${isSecActive ? 'text-slate-950' : 'text-amber-400'}`} />
                          <span className="truncate text-xs font-semibold">{sec.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {onOpenResetZeroModal && (
                    <div className="p-2 border-t border-slate-800 bg-slate-950/40">
                      <button
                        type="button"
                        onClick={() => {
                          setMoreMenuOpen(false);
                          onOpenResetZeroModal();
                        }}
                        className="w-full px-3 py-2 text-left flex items-center gap-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 transition-all group"
                      >
                        <RotateCcw className="w-4 h-4 text-rose-400 shrink-0 group-hover:-rotate-45 transition-transform duration-200" />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-rose-300">Reset System to Zero</div>
                          <div className="text-[10px] text-rose-400/70">Wipe sales & drawer (Admin PIN)</div>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
