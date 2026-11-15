'use client';

import React from 'react';
import { TrainingRecord, TrainingValidityStatus } from '../types';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  MinusCircle, 
  ShieldCheck, 
  ShieldAlert,
  User, 
  FileCheck,
  Calendar,
  AlertOctagon
} from 'lucide-react';
import { formatDate, getDaysUntil } from '@/lib/utils';

interface ComplianceMatrixViewProps {
  trainings: TrainingRecord[];
  selectedSector: string;
  onOpenDossier: (employeeName: string) => void;
  onRenewRecord: (recordId: string) => void;
  tintedGlass?: boolean;
}

// Standards and POPs to cross in the matrix
const NR_COLUMNS = [
  { code: 'NR-10', label: 'NR-10 (Elétrica)', requiredRoles: ['Eletricista', 'Manutenção Mecânica'] },
  { code: 'NR-12', label: 'NR-12 (Máquinas)', requiredRoles: ['Operador de Usinagem', 'Operador de Prensa', 'Manutenção Mecânica'] },
  { code: 'NR-35', label: 'NR-35 (Altura)', requiredRoles: ['Manutenção Mecânica', 'Supervisão de Turno', 'Eletricista'] },
  { code: 'NR-11', label: 'NR-11 (Empilhadeira)', requiredRoles: ['Operador Logístico', 'Operações Industriais'] },
  { code: 'NR-33', label: 'NR-33 (Esp. Confinado)', requiredRoles: ['Manutenção Mecânica', 'Montagem'] }
];

const POP_COLUMNS = [
  { code: 'POP-001', label: 'POP-001 (Setup CNC)', requiredRoles: ['Operador de Usinagem', 'Usinagem CNC'] },
  { code: 'POP-012', label: 'POP-012 (Solda MIG)', requiredRoles: ['Montagem', 'Soldador'] },
  { code: 'POP-025', label: 'POP-025 (Bloqueio LOTO)', requiredRoles: ['Manutenção Mecânica', 'Eletricista', 'Supervisão de Turno'] },
  { code: 'POP-008', label: 'POP-008 (Inspeção Peça)', requiredRoles: ['Qualidade Fabril', 'Supervisão de Turno'] }
];

export const ComplianceMatrixView: React.FC<ComplianceMatrixViewProps> = ({
  trainings,
  selectedSector,
  onOpenDossier,
  onRenewRecord,
  tintedGlass = false
}) => {
  // Extract unique employees
  const sectorTrainings = selectedSector === 'all'
    ? trainings
    : trainings.filter(t => t.department.toLowerCase().includes(selectedSector.toLowerCase()) || selectedSector.toLowerCase().includes(t.department.toLowerCase()));

  const employeesMap = new Map<string, { name: string; role: string; department: string }>();
  sectorTrainings.forEach(t => {
    if (!employeesMap.has(t.employeeName)) {
      employeesMap.set(t.employeeName, {
        name: t.employeeName,
        role: t.employeeRole || 'Operador Especialista',
        department: t.department
      });
    }
  });

  const employees = Array.from(employeesMap.values());

  const getRecordForEmployeeAndCode = (employeeName: string, code: string): TrainingRecord | undefined => {
    return trainings.find(t => t.employeeName === employeeName && (t.code === code || t.courseName.includes(code)));
  };

  const getStatus = (record?: TrainingRecord): TrainingValidityStatus => {
    if (!record) return 'missing';
    const days = getDaysUntil(record.expiryDate);
    if (days < 0) return 'expired';
    if (days <= 60) return 'expiring';
    return 'valid';
  };

  const renderCellBadge = (record?: TrainingRecord) => {
    const status = getStatus(record);

    switch (status) {
      case 'valid':
        return (
          <div 
            onClick={() => record && onRenewRecord(record.id)}
            className={`flex items-center justify-center gap-1 py-1 px-2 border rounded-md text-[10px] font-bold cursor-pointer transition-colors ${
              tintedGlass
                ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/30'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
            }`}
            title={`Válido até ${formatDate(record!.expiryDate)}. Clique para renovar.`}
          >
            <CheckCircle2 className={`w-3 h-3 shrink-0 ${tintedGlass ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <span>Válido</span>
          </div>
        );
      case 'expiring':
        return (
          <div 
            onClick={() => record && onRenewRecord(record.id)}
            className={`flex items-center justify-center gap-1 py-1 px-2 border rounded-md text-[10px] font-bold cursor-pointer transition-colors ${
              tintedGlass
                ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/30'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
            }`}
            title={`Vence em breve: ${formatDate(record!.expiryDate)}. Clique para renovar.`}
          >
            <AlertTriangle className={`w-3 h-3 shrink-0 ${tintedGlass ? 'text-amber-400' : 'text-amber-600'}`} />
            <span>Reciclar</span>
          </div>
        );
      case 'expired':
        return (
          <div 
            onClick={() => record && onRenewRecord(record.id)}
            className={`flex items-center justify-center gap-1 py-1 px-2 border rounded-md text-[10px] font-bold cursor-pointer transition-colors animate-pulse ${
              tintedGlass
                ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/35'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
            }`}
            title={`VENCIDO em ${formatDate(record!.expiryDate)}! Clique para renovar.`}
          >
            <XCircle className={`w-3 h-3 shrink-0 ${tintedGlass ? 'text-rose-400' : 'text-rose-600'}`} />
            <span>Vencido</span>
          </div>
        );
      case 'missing':
        return (
          <div 
            className={`flex items-center justify-center py-1 px-2 border rounded-md text-[10px] ${
              tintedGlass
                ? 'bg-white/[0.03] text-slate-500 border-white/10'
                : 'bg-slate-50 text-slate-400 border-slate-200'
            }`}
            title="Não cadastrado para este colaborador"
          >
            <MinusCircle className={`w-3 h-3 ${tintedGlass ? 'text-slate-600' : 'text-slate-300'}`} />
          </div>
        );
    }
  };

  // Determine overall aptitude for an employee
  const getEmployeeAptitude = (empName: string) => {
    const empRecords = trainings.filter(t => t.employeeName === empName);
    const hasExpired = empRecords.some(r => getStatus(r) === 'expired');
    const hasExpiring = empRecords.some(r => getStatus(r) === 'expiring');

    if (hasExpired) {
      return {
        label: 'BLOQUEADO',
        desc: 'Possui NR/POP vencido',
        badge: tintedGlass
          ? 'bg-rose-500/20 text-rose-300 border-rose-500/35'
          : 'bg-rose-100 text-rose-800 border-rose-200',
        icon: ShieldAlert
      };
    }
    if (hasExpiring) {
      return {
        label: 'APTO (REVISAR)',
        desc: 'Reciclagem em <60d',
        badge: tintedGlass
          ? 'bg-amber-500/20 text-amber-300 border-amber-500/35'
          : 'bg-amber-100 text-amber-800 border-amber-200',
        icon: AlertTriangle
      };
    }
    return {
      label: '100% APTO',
      desc: 'Conforme MTE & POPs',
      badge: tintedGlass
        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/35'
        : 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: ShieldCheck
    };
  };

  return (
    <div className="space-y-4">
      {/* Top Warning and Legend */}
      <div
        className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-3 transition-all ${
          tintedGlass
            ? 'aptis-glass-dark text-white border-white/10'
            : 'aptis-glass-light text-slate-900'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold border ${
              tintedGlass
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                : 'bg-indigo-50 text-indigo-700 border-indigo-200'
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`text-sm font-bold ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
              Matriz Cruzada de Aptidão Legal & Operacional (Cargo × NRs/POPs)
            </h3>
            <p className={`text-xs ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
              Controle preventivo contra acidentes e interdições fiscais do Ministério do Trabalho (MTE).
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs flex-wrap">
          <span className={`flex items-center gap-1 font-medium ${tintedGlass ? 'text-emerald-400' : 'text-emerald-700'}`}>
            <CheckCircle2 className="w-3.5 h-3.5" /> Válido / Apto
          </span>
          <span className={`flex items-center gap-1 font-medium ${tintedGlass ? 'text-amber-400' : 'text-amber-700'}`}>
            <AlertTriangle className="w-3.5 h-3.5" /> Reciclagem Próxima
          </span>
          <span className={`flex items-center gap-1 font-medium ${tintedGlass ? 'text-rose-400' : 'text-rose-700'}`}>
            <XCircle className="w-3.5 h-3.5" /> Vencido / Bloqueado
          </span>
          <span className="flex items-center gap-1 font-medium text-slate-400">
            <MinusCircle className="w-3.5 h-3.5" /> Pendente
          </span>
        </div>
      </div>

      {/* 2D Table Matrix */}
      <div
        className={`rounded-3xl border overflow-hidden transition-all duration-500 ${
          tintedGlass
            ? 'aptis-glass-dark border-white/10 text-white'
            : 'aptis-glass-light text-slate-900'
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr
                className={
                  tintedGlass
                    ? 'bg-slate-950/80 border-b border-white/10 text-slate-300'
                    : 'bg-slate-100/80 border-b border-slate-200 text-slate-700'
                }
              >
                <th
                  className={`py-3.5 px-4 font-bold sticky left-0 z-10 min-w-[200px] border-r ${
                    tintedGlass
                      ? 'bg-slate-950/95 border-white/10 text-white'
                      : 'bg-slate-100 border-slate-200 text-slate-900'
                  }`}
                >
                  Colaborador / Cargo
                </th>
                <th
                  className={`py-3.5 px-3 font-bold text-center border-l border-r min-w-[140px] ${
                    tintedGlass
                      ? 'bg-blue-950/40 border-white/10 text-cyan-300'
                      : 'bg-blue-50/70 border-blue-200 text-slate-800'
                  }`}
                >
                  Aptidão Geral
                </th>
                {/* NRs Columns */}
                {NR_COLUMNS.map(col => (
                  <th key={col.code} className="py-3.5 px-2.5 font-bold text-center min-w-[110px]">
                    <div className={tintedGlass ? 'text-white' : 'text-slate-900'}>{col.code}</div>
                    <div className={`text-[10px] font-normal ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
                      {col.label.split(' ')[1]}
                    </div>
                  </th>
                ))}
                {/* POPs Columns */}
                {POP_COLUMNS.map(col => (
                  <th
                    key={col.code}
                    className={`py-3.5 px-2.5 font-bold text-center min-w-[115px] ${
                      tintedGlass ? 'bg-amber-500/10' : 'bg-amber-50/50'
                    }`}
                  >
                    <div className={tintedGlass ? 'text-amber-300' : 'text-amber-900'}>{col.code}</div>
                    <div className={`text-[10px] font-normal ${tintedGlass ? 'text-amber-400/80' : 'text-amber-700'}`}>
                      {col.label.split(' ')[1]}
                    </div>
                  </th>
                ))}
                <th className="py-3.5 px-3 font-bold text-right min-w-[100px]">
                  Dossiê
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${tintedGlass ? 'divide-white/[0.06]' : 'divide-slate-200'}`}>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={2 + NR_COLUMNS.length + POP_COLUMNS.length + 1} className="py-12 text-center text-slate-400 italic">
                    Nenhum colaborador registrado neste setor.
                  </td>
                </tr>
              ) : (
                employees.map(emp => {
                  const aptitude = getEmployeeAptitude(emp.name);
                  const AptIcon = aptitude.icon;

                  return (
                    <tr
                      key={emp.name}
                      className={`transition-colors group ${
                        tintedGlass ? 'hover:bg-white/[0.04]' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      {/* Colaborador */}
                      <td
                        className={`py-3 px-4 font-medium sticky left-0 z-10 border-r transition-colors ${
                          tintedGlass
                            ? 'bg-slate-900/95 group-hover:bg-slate-800/95 border-white/10'
                            : 'bg-white group-hover:bg-slate-50 border-slate-100'
                        }`}
                      >
                        <div className={`font-bold leading-snug ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
                          {emp.name}
                        </div>
                        <div className={`text-[11px] ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
                          {emp.role} • <span className="text-slate-400">{emp.department}</span>
                        </div>
                      </td>

                      {/* Aptidão Geral */}
                      <td
                        className={`py-2.5 px-3 text-center border-r ${
                          tintedGlass
                            ? 'border-white/10 bg-white/[0.02]'
                            : 'border-slate-200 bg-slate-50/40'
                        }`}
                      >
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold border ${aptitude.badge}`}>
                          <AptIcon className="w-3 h-3 shrink-0" />
                          <span>{aptitude.label}</span>
                        </div>
                        <div className="text-[9px] text-slate-400 mt-0.5">{aptitude.desc}</div>
                      </td>

                      {/* NRs Células */}
                      {NR_COLUMNS.map(col => {
                        const rec = getRecordForEmployeeAndCode(emp.name, col.code);
                        return (
                          <td key={col.code} className="py-2.5 px-2 text-center">
                            {renderCellBadge(rec)}
                          </td>
                        );
                      })}

                      {/* POPs Células */}
                      {POP_COLUMNS.map(col => {
                        const rec = getRecordForEmployeeAndCode(emp.name, col.code);
                        return (
                          <td
                            key={col.code}
                            className={`py-2.5 px-2 text-center ${
                              tintedGlass ? 'bg-amber-500/[0.04]' : 'bg-amber-50/20'
                            }`}
                          >
                            {renderCellBadge(rec)}
                          </td>
                        );
                      })}

                      {/* Botão Dossiê */}
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => onOpenDossier(emp.name)}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                            tintedGlass
                              ? 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30'
                              : 'text-blue-700 bg-blue-50 hover:bg-blue-100'
                          }`}
                        >
                          Ver Ficha
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
