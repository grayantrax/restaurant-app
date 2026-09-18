import React, { useState, useEffect } from 'react';
import { PosProvider, usePos } from './context/PosContext';
import { Header, ActiveTab } from './components/common/Header';
import { PosRegister } from './components/pos/PosRegister';
import { TableManagement } from './components/tables/TableManagement';
import { KitchenDisplay } from './components/kds/KitchenDisplay';
import { MenuManagement } from './components/menu/MenuManagement';
import { InventoryManagement } from './components/inventory/InventoryManagement';
import { CashDrawerManagement } from './components/cash/CashDrawerManagement';
import { PdfReports } from './components/reports/PdfReports';
import { OrderHistory } from './components/orders/OrderHistory';
import { ReservationsAndCustomers } from './components/crm/ReservationsAndCustomers';
import { ExpensesManagement } from './components/expenses/ExpensesManagement';
import { RestaurantSettings } from './components/settings/RestaurantSettings';
import { AuditTrail } from './components/audit/AuditTrail';
import { StaffManagement } from './components/staff/StaffManagement';
import { ResetSystemModal } from './components/admin/ResetSystemModal';
import { PinAuthModal } from './components/auth/PinAuthModal';
import { ReceiptModal } from './components/receipt/ReceiptModal';
import { HeldOrdersModal } from './components/pos/HeldOrdersModal';

function MainPosApp() {
  const [currentTab, setCurrentTab] = useState<ActiveTab>('pos');
  const [isHeldModalOpen, setIsHeldModalOpen] = useState(false);
  const [isResetZeroModalOpen, setIsResetZeroModalOpen] = useState(false);
  const { assignTable, setOrderType, currentUser } = usePos();

  const isAdmin = currentUser?.role === 'Admin';
  const nonAdminAllowedTabs: ActiveTab[] = ['pos', 'tables', 'kds', 'orders'];

  // Automatically reset to POS if non-admin user is on an unauthorized tab
  useEffect(() => {
    if (!isAdmin && !nonAdminAllowedTabs.includes(currentTab)) {
      setCurrentTab('pos');
    }
  }, [isAdmin, currentTab]);

  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Header with Navigation & Quick Actions */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (!isAdmin && !nonAdminAllowedTabs.includes(tab)) {
            setCurrentTab('pos');
          } else {
            setCurrentTab(tab);
          }
        }}
        onOpenHeldOrdersModal={() => setIsHeldModalOpen(true)}
        onOpenResetZeroModal={() => setIsResetZeroModalOpen(true)}
      />

      {/* Main Dynamic Viewport */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {currentTab === 'pos' && <PosRegister />}
        {currentTab === 'tables' && (
          <TableManagement
            onOpenPosWithTable={(table) => {
              setOrderType('dine-in');
              assignTable(table);
              setCurrentTab('pos');
            }}
          />
        )}
        {currentTab === 'kds' && <KitchenDisplay />}
        {currentTab === 'orders' && <OrderHistory />}

        {/* Admin-only views */}
        {isAdmin && (
          <>
            {currentTab === 'staff' && <StaffManagement />}
            {currentTab === 'menu' && <MenuManagement />}
            {currentTab === 'inventory' && <InventoryManagement />}
            {currentTab === 'cash' && <CashDrawerManagement />}
            {currentTab === 'reports' && <PdfReports />}
            {currentTab === 'crm' && <ReservationsAndCustomers />}
            {currentTab === 'expenses' && <ExpensesManagement />}
            {currentTab === 'settings' && <RestaurantSettings />}
            {currentTab === 'audit' && <AuditTrail />}
          </>
        )}
      </main>

      {/* Modal Dialogs */}
      <PinAuthModal />
      <ReceiptModal />
      <HeldOrdersModal
        isOpen={isHeldModalOpen}
        onClose={() => setIsHeldModalOpen(false)}
      />
      <ResetSystemModal
        isOpen={isResetZeroModalOpen}
        onClose={() => setIsResetZeroModalOpen(false)}
        onSuccess={() => setCurrentTab('pos')}
      />
    </div>
  );
}

export default function App() {
  return (
    <PosProvider>
      <MainPosApp />
    </PosProvider>
  );
}
