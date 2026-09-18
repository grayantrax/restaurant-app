import React, { useState } from 'react';
import { usePos } from '../../context/PosContext';
import { TableItem } from '../../types/pos';
import {
  LayoutGrid,
  Plus,
  Users,
  CheckCircle,
  AlertCircle,
  Clock,
  Receipt,
  X,
  Edit2,
  Trash2
} from 'lucide-react';

export const TableManagement: React.FC<{ onOpenPosWithTable?: (table: TableItem) => void }> = ({
  onOpenPosWithTable,
}) => {
  const { tables, addTable, updateTable, deleteTable, updateTableStatus } = usePos();
  const [selectedSection, setSelectedSection] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<TableItem | null>(null);

  // Form State
  const [tableName, setTableName] = useState('');
  const [tableSection, setTableSection] = useState<TableItem['section']>('Indoor');
  const [seats, setSeats] = useState(4);

  const sections: (TableItem['section'] | 'All')[] = ['All', 'Indoor', 'Terrace', 'VIP Lounge', 'Garden Bar'];

  const filteredTables = tables.filter(
    (t) => selectedSection === 'All' || t.section === selectedSection
  );

  const handleSaveTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableName.trim()) return;

    if (editingTable) {
      updateTable({
        ...editingTable,
        name: tableName.trim(),
        section: tableSection,
        seats,
      });
      setEditingTable(null);
    } else {
      addTable({
        number: tables.length + 1,
        name: tableName.trim(),
        section: tableSection,
        seats,
        status: 'available',
      });
    }

    setTableName('');
    setSeats(4);
    setIsAddModalOpen(false);
  };

  const startEdit = (tbl: TableItem) => {
    setEditingTable(tbl);
    setTableName(tbl.name);
    setTableSection(tbl.section);
    setSeats(tbl.seats);
    setIsAddModalOpen(true);
  };

  const getStatusColor = (status: TableItem['status']) => {
    switch (status) {
      case 'available':
        return 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400';
      case 'occupied':
        return 'bg-amber-500/10 border-amber-500/40 text-amber-400';
      case 'bill_requested':
        return 'bg-purple-500/15 border-purple-500/50 text-purple-300 animate-pulse';
      case 'reserved':
        return 'bg-sky-500/10 border-sky-500/40 text-sky-400';
      default:
        return 'bg-slate-800 border-slate-700 text-slate-300';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950 text-slate-100 space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-amber-400" />
            Table Layout & Floor Management
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor restaurant occupancy, table turnovers and seating sections.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingTable(null);
            setTableName(`Table ${tables.length + 1}`);
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-amber-500/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add New Table
        </button>
      </div>

      {/* Floor Sections Filter */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {sections.map((sec) => (
          <button
            key={sec}
            onClick={() => setSelectedSection(sec)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedSection === sec
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {sec} ({sec === 'All' ? tables.length : tables.filter((t) => t.section === sec).length})
          </button>
        ))}
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            {tables.filter((t) => t.status === 'available').length}
          </div>
          <div>
            <div className="text-xs font-bold text-white">Available</div>
            <div className="text-[10px] text-slate-400">Ready to seat</div>
          </div>
        </div>

        <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            {tables.filter((t) => t.status === 'occupied').length}
          </div>
          <div>
            <div className="text-xs font-bold text-white">Occupied</div>
            <div className="text-[10px] text-slate-400">Dining guests</div>
          </div>
        </div>

        <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
            {tables.filter((t) => t.status === 'bill_requested').length}
          </div>
          <div>
            <div className="text-xs font-bold text-white">Bill Requested</div>
            <div className="text-[10px] text-slate-400">Ready to pay</div>
          </div>
        </div>

        <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
            {tables.filter((t) => t.status === 'reserved').length}
          </div>
          <div>
            <div className="text-xs font-bold text-white">Reserved</div>
            <div className="text-[10px] text-slate-400">Booked guests</div>
          </div>
        </div>
      </div>

      {/* Tables Visual Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredTables.map((table) => {
          return (
            <div
              key={table.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${getStatusColor(
                table.status
              )}`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-extrabold text-sm text-white">{table.name}</h3>
                    <span className="text-[11px] text-slate-400">{table.section}</span>
                  </div>

                  <div className="flex items-center gap-1 text-slate-400">
                    <button
                      onClick={() => startEdit(table)}
                      className="p-1 hover:text-white transition-colors"
                      title="Edit Table"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteTable(table.id)}
                      className="p-1 hover:text-rose-400 transition-colors"
                      title="Delete Table"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-300 mb-3">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>{table.seats} Seats Capacity</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-current" />
                  <span>{table.status.replace('_', ' ')}</span>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                {table.status === 'available' ? (
                  <button
                    onClick={() => {
                      updateTableStatus(table.id, 'occupied');
                      if (onOpenPosWithTable) onOpenPosWithTable(table);
                    }}
                    className="flex-1 py-1.5 px-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors text-center"
                  >
                    Seat & Take Order
                  </button>
                ) : table.status === 'occupied' ? (
                  <>
                    <button
                      onClick={() => updateTableStatus(table.id, 'bill_requested')}
                      className="flex-1 py-1.5 px-2 bg-purple-600/30 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 rounded-lg text-[11px] font-bold text-center"
                    >
                      Request Bill
                    </button>
                    <button
                      onClick={() => updateTableStatus(table.id, 'available')}
                      className="py-1.5 px-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-[11px]"
                    >
                      Clear
                    </button>
                  </>
                ) : table.status === 'bill_requested' ? (
                  <button
                    onClick={() => updateTableStatus(table.id, 'available')}
                    className="flex-1 py-1.5 px-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs text-center"
                  >
                    Paid & Clear Table
                  </button>
                ) : (
                  <button
                    onClick={() => updateTableStatus(table.id, 'occupied')}
                    className="flex-1 py-1.5 px-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs text-center"
                  >
                    Seat Reserved Guest
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Table Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm">
          <form
            onSubmit={handleSaveTable}
            className="w-full max-w-md bg-slate-900 border border-slate-750 rounded-2xl p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingTable ? 'Edit Table' : 'Add New Floor Table'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Table Label / Number
                </label>
                <input
                  type="text"
                  required
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  placeholder="e.g. Table 05 or Terrace T3"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Floor Section
                </label>
                <select
                  value={tableSection}
                  onChange={(e) => setTableSection(e.target.value as TableItem['section'])}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                >
                  <option value="Indoor">Indoor Dining</option>
                  <option value="Terrace">Terrace Patio</option>
                  <option value="VIP Lounge">VIP Lounge</option>
                  <option value="Garden Bar">Garden Bar</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Seating Capacity (Guests)
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={seats}
                  onChange={(e) => setSeats(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
              >
                Save Table
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
