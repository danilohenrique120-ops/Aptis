'use client';

import React, { useState } from 'react';
import { usePlantSectors } from '@/hooks/use-plant-sectors';
import { PlantSector } from '@/types/sectors';
import { 
  X, 
  Plus, 
  Building2, 
  Trash2, 
  Edit2, 
  Check, 
  AlertTriangle, 
  Cloud, 
  ShieldCheck,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface PlantSectorsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantName?: string;
  tintedGlass?: boolean;
}

const COLOR_OPTIONS = [
  { label: 'Azul Industrial', value: 'from-blue-600 to-indigo-600', dot: 'bg-blue-600' },
  { label: 'Verde Esmeralda', value: 'from-emerald-600 to-teal-600', dot: 'bg-emerald-600' },
  { label: 'Âmbar / Laranja', value: 'from-amber-600 to-orange-600', dot: 'bg-amber-600' },
  { label: 'Ciano Técnico', value: 'from-cyan-600 to-blue-600', dot: 'bg-cyan-600' },
  { label: 'Roxo Corporativo', value: 'from-purple-600 to-indigo-600', dot: 'bg-purple-600' },
  { label: 'Grafite Sólido', value: 'from-slate-600 to-slate-800', dot: 'bg-slate-700' }
];

export function PlantSectorsManagerModal({
  isOpen,
  onClose,
  tenantName = 'Planta Principal',
  tintedGlass: tintedGlassProp
}: PlantSectorsManagerModalProps) {
  const { sectors, addSector, updateSector, deleteSector, isSynced } = usePlantSectors();
  const [internalTintedGlass, setInternalTintedGlass] = useState(true);

  React.useEffect(() => {
    const saved = localStorage.getItem('aptis_tinted_glass_mode');
    if (saved !== null) {
      setInternalTintedGlass(saved === 'true');
    }
    const handleModeChange = (e: Event) => {
      const customEvent = e as CustomEvent<boolean>;
      setInternalTintedGlass(customEvent.detail);
    };
    window.addEventListener('aptis-glass-mode-change', handleModeChange);
    return () => window.removeEventListener('aptis-glass-mode-change', handleModeChange);
  }, []);

  const tintedGlass = tintedGlassProp !== undefined ? tintedGlassProp : internalTintedGlass;

  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');
  const [editingSectorId, setEditingSectorId] = useState<string | null>(null);
  const [sectorToDelete, setSectorToDelete] = useState<PlantSector | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [managerName, setManagerName] = useState('');
  const [managerRole, setManagerRole] = useState('Supervisor de Operações');
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0].value);
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleStartEdit = (sector: PlantSector) => {
    setEditingSectorId(sector.id);
    setName(sector.name);
    setCode(sector.code);
    setDescription(sector.description || '');
    setManagerName(sector.managerName || '');
    setManagerRole(sector.managerRole || 'Supervisor de Operações');
    setSelectedColor(sector.color || COLOR_OPTIONS[0].value);
    setActiveTab('add');
  };

  const handleCancelForm = () => {
    setEditingSectorId(null);
    setName('');
    setCode('');
    setDescription('');
    setManagerName('');
    setActiveTab('list');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    if (editingSectorId) {
      updateSector(editingSectorId, {
        name: name.trim(),
        code: code.toUpperCase().trim(),
        description: description.trim(),
        managerName: managerName.trim() || 'Supervisor Responsável',
        managerRole: managerRole.trim(),
        color: selectedColor
      });
      setSuccessMessage(`Setor "${name}" atualizado com sucesso!`);
    } else {
      addSector({
        name: name.trim(),
        code: code.toUpperCase().trim(),
        description: description.trim() || `Área operacional de ${name}.`,
        managerName: managerName.trim() || 'Supervisor Responsável',
        managerRole: managerRole.trim(),
        color: selectedColor
      });
      setSuccessMessage(`Novo setor "${name}" cadastrado com sucesso!`);
    }

    handleCancelForm();
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleConfirmDelete = () => {
    if (!sectorToDelete) return;
    deleteSector(sectorToDelete.id);
    setSuccessMessage(`Setor "${sectorToDelete.name}" excluído de todas as ferramentas.`);
    setSectorToDelete(null);
    setDeleteConfirmationText('');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className={`rounded-3xl shadow-2xl max-w-2xl w-full relative animate-in fade-in zoom-in-95 duration-200 overflow-hidden my-8 ${
        tintedGlass
          ? 'aptis-glass-modal text-white'
          : 'bg-white text-slate-900 border border-slate-200'
      }`}>
        
        {/* Header Modal */}
        <div className={`p-6 relative border-b ${
          tintedGlass
            ? 'bg-gradient-to-r from-slate-900/90 via-indigo-950/60 to-slate-900/90 border-white/10 text-white'
            : 'bg-slate-50/90 border-slate-200 text-slate-900'
        }`}>
          <button
            onClick={onClose}
            className={`absolute right-5 top-5 p-2 rounded-xl transition-colors cursor-pointer ${
              tintedGlass
                ? 'text-slate-400 hover:text-white hover:bg-white/10'
                : 'text-slate-400 hover:text-slate-800 hover:bg-slate-200/70'
            }`}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  tintedGlass
                    ? 'text-cyan-300 bg-cyan-500/15 border-cyan-500/30'
                    : 'text-blue-700 bg-blue-50 border-blue-200'
                }`}>
                  Estrutura Organizacional da Planta
                </span>
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                  tintedGlass ? 'text-emerald-400' : 'text-emerald-600'
                }`}>
                  <Cloud className="w-3 h-3" />
                  Sincronizado
                </span>
              </div>
              <h2 className={`text-xl font-bold mt-1 ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
                Central de Áreas & Setores Fabris
              </h2>
              <p className={`text-xs ${tintedGlass ? 'text-slate-300' : 'text-slate-500'}`}>
                Planta: <strong className={tintedGlass ? 'text-white' : 'text-slate-900'}>{tenantName}</strong> • Alterações refletem automaticamente em todas as ferramentas.
              </p>
            </div>
          </div>

          {/* Abas Superiores */}
          <div className="flex items-center gap-2 mt-5">
            <button
              onClick={() => { setActiveTab('list'); setEditingSectorId(null); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'list'
                  ? tintedGlass
                    ? 'bg-white text-slate-900 shadow-md'
                    : 'bg-slate-900 text-white shadow-sm'
                  : tintedGlass
                    ? 'bg-white/10 text-slate-300 hover:bg-white/20'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Setores Cadastrados ({sectors.length})
            </button>
            <button
              onClick={() => { setActiveTab('add'); setEditingSectorId(null); setName(''); setCode(''); setDescription(''); setManagerName(''); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'add' && !editingSectorId
                  ? 'bg-blue-600 text-white shadow-md'
                  : tintedGlass
                    ? 'bg-white/10 text-slate-300 hover:bg-white/20'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              Cadastrar Novo Setor
            </button>
          </div>
        </div>

        {/* Mensagem de Sucesso */}
        {successMessage && (
          <div className={`mx-6 mt-4 p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 animate-in fade-in ${
            tintedGlass
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}>
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Conteúdo Principal */}
        <div className="p-6">
          {activeTab === 'list' ? (
            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {sectors.length === 0 ? (
                <div className={`text-center py-10 border-2 border-dashed rounded-2xl ${
                  tintedGlass ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-500'
                }`}>
                  <p className="text-sm font-semibold">Nenhum setor cadastrado.</p>
                </div>
              ) : (
                sectors.map(sec => (
                  <div
                    key={sec.id}
                    className={`p-4 rounded-2xl border transition flex items-center justify-between gap-4 group ${
                      tintedGlass
                        ? 'aptis-glass-subcard hover:border-white/20'
                        : 'border-slate-200 bg-slate-50/70 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${sec.color || 'from-blue-600 to-indigo-600'} text-white font-mono font-black text-xs flex items-center justify-center shrink-0 shadow-md`}>
                        {sec.code}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className={`text-sm font-bold truncate ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
                            {sec.name}
                          </h4>
                          <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                            tintedGlass ? 'bg-white/10 text-slate-300' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {sec.code}
                          </span>
                        </div>
                        <p className={`text-xs truncate mt-0.5 ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
                          {sec.description || 'Área de operações fabris'}
                        </p>
                        <div className={`text-[11px] mt-1 flex items-center gap-2 ${tintedGlass ? 'text-slate-400' : 'text-slate-600'}`}>
                          <span>👤 Líder: <strong className={tintedGlass ? 'text-slate-200' : 'text-slate-800'}>{sec.managerName || 'Não atribuído'}</strong></span>
                          <span>•</span>
                          <span>{sec.managerRole || 'Supervisor'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleStartEdit(sec)}
                        className={`p-2 rounded-xl transition-colors cursor-pointer ${
                          tintedGlass
                            ? 'text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/15'
                            : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'
                        }`}
                        title="Editar Informações do Setor"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setSectorToDelete(sec)}
                        disabled={sectors.length <= 1}
                        className={`p-2 rounded-xl transition-colors ${
                          sectors.length <= 1
                            ? 'text-slate-500/40 cursor-not-allowed'
                            : tintedGlass
                              ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 cursor-pointer'
                              : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer'
                        }`}
                        title={sectors.length <= 1 ? "A planta deve possuir pelo menos 1 setor cadastrado" : "Excluir Setor"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* Formulário de Adicionar / Editar */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className={`block text-xs font-bold mb-1 ${tintedGlass ? 'text-slate-300' : 'text-slate-700'}`}>
                    Nome Oficial do Setor / Linha *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Envase Asséptico Linha 02"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className={`w-full text-xs rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                      tintedGlass
                        ? 'aptis-glass-input text-white placeholder:text-slate-500'
                        : 'bg-slate-50 border border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-1 ${tintedGlass ? 'text-slate-300' : 'text-slate-700'}`}>
                    Sigla / Código *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Ex: ENV"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    className={`w-full text-xs font-mono font-bold uppercase rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                      tintedGlass
                        ? 'aptis-glass-input text-white placeholder:text-slate-500'
                        : 'bg-slate-50 border border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1 ${tintedGlass ? 'text-slate-300' : 'text-slate-700'}`}>
                  Descrição / Processos Fabris da Área
                </label>
                <input
                  type="text"
                  placeholder="Ex: Pasteurização, envase rotativo e rotulagem de frascos."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className={`w-full text-xs rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                    tintedGlass
                      ? 'aptis-glass-input text-white placeholder:text-slate-500'
                      : 'bg-slate-50 border border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-bold mb-1 ${tintedGlass ? 'text-slate-300' : 'text-slate-700'}`}>
                    Supervisor / Líder do Setor
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Carlos Eduardo Silveira"
                    value={managerName}
                    onChange={e => setManagerName(e.target.value)}
                    className={`w-full text-xs rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                      tintedGlass
                        ? 'aptis-glass-input text-white placeholder:text-slate-500'
                        : 'bg-slate-50 border border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-bold mb-1 ${tintedGlass ? 'text-slate-300' : 'text-slate-700'}`}>
                    Cargo do Líder
                  </label>
                  <input
                    type="text"
                    value={managerRole}
                    onChange={e => setManagerRole(e.target.value)}
                    className={`w-full text-xs rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                      tintedGlass
                        ? 'aptis-glass-input text-white placeholder:text-slate-500'
                        : 'bg-slate-50 border border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold mb-1.5 ${tintedGlass ? 'text-slate-300' : 'text-slate-700'}`}>
                  Identidade Visual / Cor do Setor
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setSelectedColor(c.value)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 border transition cursor-pointer ${
                        selectedColor === c.value
                          ? tintedGlass
                            ? 'border-cyan-400 ring-2 ring-cyan-400/20 bg-cyan-500/20 text-cyan-200'
                            : 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50 text-blue-700'
                          : tintedGlass
                            ? 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full bg-gradient-to-r ${c.value}`} />
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                tintedGlass
                  ? 'bg-blue-500/10 border-blue-500/25 text-blue-200'
                  : 'bg-blue-50 border-blue-200 text-blue-900'
              }`}>
                <ShieldCheck className={`w-4 h-4 shrink-0 mt-0.5 ${tintedGlass ? 'text-cyan-400' : 'text-blue-600'}`} />
                <span>
                  <strong>Propagação Automática:</strong> Ao salvar, este setor ficará disponível imediatamente para filtros, dashboards e cadastros em todas as ferramentas da plataforma.
                </span>
              </div>

              <div className={`flex items-center justify-end gap-2.5 pt-3 border-t ${
                tintedGlass ? 'border-white/10' : 'border-slate-100'
              }`}>
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
                    tintedGlass ? 'text-slate-300 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  {editingSectorId ? 'Salvar Alterações' : 'Criar Setor & Sincronizar'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal de Confirmação de Exclusão de Setor */}
        {sectorToDelete && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className={`rounded-2xl max-w-md w-full p-6 border shadow-2xl animate-in fade-in zoom-in-95 ${
              tintedGlass
                ? 'aptis-glass-modal border-rose-500/30 text-white'
                : 'bg-white border-rose-200 text-slate-900'
            }`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
                tintedGlass ? 'bg-rose-500/20 text-rose-400' : 'bg-rose-100 text-rose-600'
              }`}>
                <AlertTriangle className="w-6 h-6" />
              </div>

              <h3 className={`text-base font-bold ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
                Excluir o setor &quot;{sectorToDelete.name}&quot;?
              </h3>

              <p className={`text-xs mt-2 leading-relaxed ${tintedGlass ? 'text-slate-300' : 'text-slate-600'}`}>
                Ao excluir este setor, ele será removido das opções de seleção em <strong>todas as ferramentas</strong> (Matriz de Habilidades, Kaizen, HERCA, Treinamentos e Rotina).
              </p>

              <div className={`mt-4 p-3 border rounded-xl text-xs ${
                tintedGlass
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-200'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}>
                ⚠️ Registros já existentes (como tarefas passadas ou investigações arquivadas) permanecerão no histórico, mas novos registros não poderão usar esta área.
              </div>

              <div className="flex items-center justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setSectorToDelete(null)}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
                    tintedGlass ? 'text-slate-300 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-md shadow-rose-600/20 cursor-pointer"
                >
                  Sim, Excluir Setor
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
