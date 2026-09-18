import React, { useState } from 'react';
import { usePos } from '../../context/PosContext';
import { formatDateTime } from '../../utils/formatters';
import {
  ShieldAlert,
  Search,
  Filter,
  User,
  Clock,
  FileText
} from 'lucide-react';

export const AuditTrail: React.FC = () => {
  const { auditLogs } = usePos();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = auditLogs.filter(
    (log) =>
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.performedBy.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950 text-slate-100 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            Security Audit Trail & Activity Logs
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable log of bill voids, cash movements, discount grants, and manager approvals.
          </p>
        </div>

        <div className="w-64 relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search action or staff..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
          />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-850 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Action Code</th>
                <th className="p-3.5">Staff Operator</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Details & Audit Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-850/50">
                  <td className="p-3.5 font-mono text-slate-400 whitespace-nowrap">
                    {formatDateTime(log.timestamp)}
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] font-bold text-amber-300 uppercase">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3.5 font-semibold text-white">
                    {log.performedBy}
                  </td>
                  <td className="p-3.5 text-slate-400">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] uppercase font-bold text-slate-300">
                      {log.role}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-300">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
