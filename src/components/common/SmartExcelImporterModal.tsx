'use client';

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  ArrowRight, 
  Table, 
  HelpCircle,
  Sparkles,
  RefreshCw
} from 'lucide-react';

export interface ColumnDefinition {
  key: string;
  label: string;
  required?: boolean;
  example: string | number;
  description: string;
  synonyms?: string[]; // Sinônimos aceitos no cabeçalho (ex: ['nome', 'colaborador', 'funcionario'])
}

interface SmartExcelImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  toolTitle: string;
  subtitle?: string;
  templateFilename: string;
  columns: ColumnDefinition[];
  sampleRows: Record<string, any>[];
  onImport: (importedRows: Record<string, any>[]) => Promise<{ successCount: number; message?: string } | void> | { successCount: number; message?: string } | void;
  colorTheme?: {
    primaryBg?: string;
    primaryText?: string;
    badgeBg?: string;
    border?: string;
  };
}

export function SmartExcelImporterModal({
  isOpen,
  onClose,
  toolTitle,
  subtitle,
  templateFilename,
  columns,
  sampleRows,
  onImport,
  colorTheme = {
    primaryBg: 'bg-emerald-600 hover:bg-emerald-700',
    primaryText: 'text-emerald-600',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    border: 'border-emerald-500'
  }
}: SmartExcelImporterModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<Record<string, any>[]>([]);
  const [unrecognizedColumns, setUnrecognizedColumns] = useState<string[]>([]);
  const [missingRequiredColumns, setMissingRequiredColumns] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{ count: number; message?: string } | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Função para normalizar texto (remover acentos, trim, lowercase)
  const normalize = (text: string) => {
    return (text || '')
      .toString()
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');
  };

  // Gerar e baixar arquivo Excel .xlsx modelo com dados de exemplo
  const handleDownloadTemplate = () => {
    try {
      // 1. Cria cabeçalhos baseados nas definições
      const headers = columns.map(c => c.label);
      
      // 2. Prepara linhas de exemplo mapeando para as labels visíveis
      const sheetData = sampleRows.map(row => {
        const rowData: Record<string, any> = {};
        columns.forEach(col => {
          rowData[col.label] = row[col.key] !== undefined ? row[col.key] : col.example;
        });
        return rowData;
      });

      // Cria a planilha com SheetJS
      const worksheet = XLSX.utils.json_to_sheet(sheetData, { header: headers });
      
      // Ajusta largura estimada das colunas
      worksheet['!cols'] = columns.map(col => ({
        wch: Math.max(col.label.length, 18)
      }));

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Modelo Aptis');

      // Dispara o download
      XLSX.writeFile(workbook, templateFilename.endsWith('.xlsx') ? templateFilename : `${templateFilename}.xlsx`);
    } catch (err) {
      console.error('Erro ao gerar template Excel:', err);
      setErrorMsg('Não foi possível gerar a planilha modelo. Tente novamente.');
    }
  };

  // Processar arquivo carregado pelo usuário
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
    let uploadedFile: File | null = null;

    if ('dataTransfer' in e) {
      e.preventDefault();
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        uploadedFile = e.dataTransfer.files[0];
      }
    } else if (e.target.files && e.target.files.length > 0) {
      uploadedFile = e.target.files[0];
    }

    if (!uploadedFile) return;

    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const hasValidExt = validExtensions.some(ext => uploadedFile!.name.toLowerCase().endsWith(ext));
    if (!hasValidExt) {
      setErrorMsg('Formato inválido. Por favor envie um arquivo .xlsx, .xls ou .csv');
      return;
    }

    setFile(uploadedFile);
    setErrorMsg(null);
    setSuccessResult(null);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
        
        // Pega a primeira aba
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Converte em array de objetos brutos
        const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

        if (rawRows.length === 0) {
          setErrorMsg('A planilha enviada está vazia ou não possui linhas de dados.');
          setIsProcessing(false);
          return;
        }

        // Mapeamento inteligente de colunas
        const rawHeaders = Object.keys(rawRows[0] || {});
        const headerMapping: Record<string, string> = {}; // rawHeader -> standard key

        // Mapeia colunas da planilha para as chaves oficiais
        columns.forEach(targetCol => {
          const normTargetLabel = normalize(targetCol.label);
          const normTargetKey = normalize(targetCol.key);
          const allSynonyms = [
            normTargetLabel, 
            normTargetKey, 
            ...(targetCol.synonyms || []).map(normalize)
          ];

          rawHeaders.forEach(rawHeader => {
            const normRaw = normalize(rawHeader);
            if (allSynonyms.includes(normRaw)) {
              headerMapping[rawHeader] = targetCol.key;
            }
          });
        });

        // Verifica colunas obrigatórias faltantes
        const mappedKeys = Object.values(headerMapping);
        const missingReq = columns
          .filter(c => c.required && !mappedKeys.includes(c.key))
          .map(c => c.label);

        setMissingRequiredColumns(missingReq);

        // Identifica colunas não reconhecidas (informativo)
        const unrecognized = rawHeaders.filter(h => !headerMapping[h]);
        setUnrecognizedColumns(unrecognized);

        // Transforma e normaliza cada linha
        const sanitizedRows = rawRows.map((rawRow, index) => {
          const cleanRow: Record<string, any> = { _rowIndex: index + 1 };
          
          columns.forEach(col => {
            cleanRow[col.key] = ''; // valor padrão vazio
          });

          Object.entries(rawRow).forEach(([rawKey, val]) => {
            const mappedKey = headerMapping[rawKey];
            if (mappedKey) {
              cleanRow[mappedKey] = typeof val === 'string' ? val.trim() : val;
            }
          });

          return cleanRow;
        }).filter(row => {
          // Remove linhas totalmente vazias
          return columns.some(col => Boolean(row[col.key]));
        });

        setParsedRows(sanitizedRows);
        setIsProcessing(false);
      } catch (parseErr) {
        console.error('Erro ao ler planilha:', parseErr);
        setErrorMsg('Erro ao processar a planilha. Verifique se o arquivo não está corrompido ou protegido por senha.');
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      setErrorMsg('Falha ao ler o arquivo selecionado.');
      setIsProcessing(false);
    };

    reader.readAsBinaryString(uploadedFile);
  };

  // Disparar a importação final para o módulo
  const handleConfirmImport = async () => {
    if (parsedRows.length === 0) return;
    
    setIsImporting(true);
    setErrorMsg(null);

    try {
      const res = await onImport(parsedRows);
      const count = res && typeof res.successCount === 'number' ? res.successCount : parsedRows.length;
      const msg = res && res.message ? res.message : `${count} registros importados e vinculados com sucesso!`;
      
      setSuccessResult({ count, message: msg });
      
      // Fecha automaticamente após 1.8 segundos ou deixa o usuário ver
      setTimeout(() => {
        handleReset();
        onClose();
      }, 1600);
    } catch (err: any) {
      console.error('Erro na gravação dos dados importados:', err);
      setErrorMsg(err?.message || 'Falha ao gravar os registros no sistema.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setParsedRows([]);
    setUnrecognizedColumns([]);
    setMissingRequiredColumns([]);
    setErrorMsg(null);
    setSuccessResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Importador Inteligente de Excel
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {toolTitle}
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {subtitle || 'Carregue sua planilha legada ou baixe o modelo oficial com 1 clique.'}
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Sucesso de Importação */}
          {successResult ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800 shadow-lg">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>
              <h4 className="text-2xl font-bold text-slate-900 dark:text-white">
                Importação Concluída com Sucesso!
              </h4>
              <p className="text-slate-600 dark:text-slate-300 max-w-md">
                {successResult.message}
              </p>
              <div className="text-xs text-slate-400">
                Atualizando sua visualização operacional...
              </div>
            </div>
          ) : (
            <>
              {/* Barra de Ação de Modelo & Guia */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-slate-900 dark:text-white">
                      Precisa da estrutura correta?
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Baixe a planilha oficial pré-formatada com exemplos reais.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowGuide(!showGuide)}
                    className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition flex items-center gap-1.5"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    {showGuide ? 'Ocultar Colunas' : 'Ver Colunas Esperadas'}
                  </button>

                  <button
                    onClick={handleDownloadTemplate}
                    className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Baixar Planilha Modelo (.xlsx)
                  </button>
                </div>
              </div>

              {/* Guia de Colunas Aceitas (Dropdown/Accordion) */}
              {showGuide && (
                <div className="p-4 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 animate-in fade-in duration-150">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Colunas Suportadas pela Ferramenta:
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    {columns.map(col => (
                      <div key={col.key} className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900 dark:text-slate-200">
                            {col.label}
                          </span>
                          {col.required ? (
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-400">
                              Obrigatória
                            </span>
                          ) : (
                            <span className="text-[10px] px-1.5 py-0.5 rounded text-slate-400">
                              Opcional
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          {col.description}
                        </p>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-mono">
                          Exemplo: {String(col.example)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Área de Drop de Arquivo */}
              {!file ? (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileUpload}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/10 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition duration-200">
                    <Upload className="w-7 h-7" />
                  </div>
                  <h4 className="text-base font-semibold text-slate-900 dark:text-white">
                    Arraste sua planilha aqui ou clique para selecionar
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                    Suporta planilhas do Microsoft Excel (.xlsx, .xls) ou arquivos separados por vírgula (.csv).
                  </p>
                </div>
              ) : (
                /* Arquivo Carregado & Preview */
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
                        <FileSpreadsheet className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                          {file.name}
                          <span className="text-xs text-slate-500 font-normal">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          {parsedRows.length} linhas de dados válidas identificadas
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleReset}
                      className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-rose-600 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Trocar Arquivo
                    </button>
                  </div>

                  {/* Alertas de Validação */}
                  {missingRequiredColumns.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Atenção:</span> A planilha não possui as seguintes colunas obrigatórias:
                        <span className="font-semibold ml-1">
                          {missingRequiredColumns.join(', ')}
                        </span>.
                        Recomendamos utilizar o modelo oficial para evitar perda de dados.
                      </div>
                    </div>
                  )}

                  {errorMsg && (
                    <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Tabela de Pré-visualização de Dados */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <Table className="w-3.5 h-3.5" />
                        Pré-visualização dos Primeiros Registros (Mostrando até 10 de {parsedRows.length}):
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {unrecognizedColumns.length > 0 && `${unrecognizedColumns.length} colunas extras ignoradas`}
                      </span>
                    </div>

                    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto max-h-64 shadow-inner">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold sticky top-0">
                          <tr>
                            <th className="p-2.5 w-12 text-center border-b border-slate-200 dark:border-slate-700">#</th>
                            {columns.map(col => (
                              <th key={col.key} className="p-2.5 border-b border-slate-200 dark:border-slate-700 whitespace-nowrap">
                                {col.label}
                                {col.required && <span className="text-rose-500 ml-0.5">*</span>}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {parsedRows.slice(0, 10).map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                              <td className="p-2.5 text-center text-slate-400 font-mono text-[11px]">
                                {idx + 1}
                              </td>
                              {columns.map(col => (
                                <td key={col.key} className="p-2.5 text-slate-700 dark:text-slate-300 whitespace-nowrap max-w-xs truncate">
                                  {row[col.key] !== undefined && row[col.key] !== '' ? (
                                    String(row[col.key])
                                  ) : (
                                    <span className="text-slate-300 dark:text-slate-600 italic">-</span>
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {parsedRows.length > 0 && !successResult && (
              <span>Pronto para importar <strong>{parsedRows.length}</strong> registros.</span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              disabled={isImporting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              Cancelar
            </button>

            {parsedRows.length > 0 && !successResult && (
              <button
                onClick={handleConfirmImport}
                disabled={isImporting || parsedRows.length === 0}
                className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isImporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Processando e Gravando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Confirmar e Importar {parsedRows.length} Registros
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
