'use client';

import React, { useState, useRef } from 'react';
import { DocumentAttachment, DocumentCategory, DocumentFileType } from '../types';
import { 
  X, 
  Upload, 
  FileText, 
  FileCheck, 
  BookOpen, 
  Paperclip, 
  Search, 
  Download, 
  Eye, 
  Trash2, 
  Check, 
  AlertCircle,
  FileCode,
  File
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface DocumentManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: DocumentAttachment[];
  onAddDocument: (doc: DocumentAttachment) => void;
  onDeleteDocument: (docId: string) => void;
  initialSelectedCategory?: string;
  tintedGlass?: boolean;
}

export const DocumentManagerModal: React.FC<DocumentManagerModalProps> = ({
  isOpen,
  onClose,
  documents,
  onAddDocument,
  onDeleteDocument,
  initialSelectedCategory = 'all',
  tintedGlass = false
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'upload'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialSelectedCategory);
  const [viewingDoc, setViewingDoc] = useState<DocumentAttachment | null>(null);

  // Upload Form State
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState<DocumentFileType>('pdf');
  const [category, setCategory] = useState<DocumentCategory>('certificate');
  const [associatedName, setAssociatedName] = useState('');
  const [textContent, setTextContent] = useState('');
  const [fileSize, setFileSize] = useState('450 KB');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const sizeInKb = Math.round(file.size / 1024);
    setFileSize(sizeInKb > 1024 ? `${(sizeInKb / 1024).toFixed(1)} MB` : `${sizeInKb} KB`);

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') setFileType('pdf');
    else if (ext === 'docx') setFileType('docx');
    else if (ext === 'doc') setFileType('doc');
    else if (ext === 'txt') setFileType('txt');
    else setFileType('pdf');

    // If it is text file, read directly
    if (ext === 'txt') {
      const reader = new FileReader();
      reader.onload = (event) => {
        setTextContent(event.target?.result as string || '');
      };
      reader.readAsText(file);
    } else {
      // For PDF / Word, populate with template text for search indexing
      setTextContent(
        `DOCUMENTO ANEXO: ${file.name}\nTipo: ${ext?.toUpperCase()}\nEste arquivo contém comprovação de conformidade para o treinamento/POP.\nPalavras-chave: Segurança industrial, conformidade legal, procedimento operacional padrão, normas regulamentadoras.`
      );
    }
  };

  const handleSaveUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) return;

    const newDoc: DocumentAttachment = {
      id: `doc-${Date.now()}`,
      fileName: fileName.trim(),
      fileType,
      fileSize,
      uploadDate: new Date().toISOString().split('T')[0],
      category,
      content: textContent || `Conteúdo do arquivo ${fileName}. Comprovação técnica e validade jurídica.`,
      associatedName: associatedName.trim() || 'Geral'
    };

    onAddDocument(newDoc);
    setUploadSuccess(true);
    setTimeout(() => {
      setUploadSuccess(false);
      setActiveTab('list');
      setFileName('');
      setTextContent('');
      setAssociatedName('');
    }, 1000);
  };

  const filteredDocs = documents.filter(doc => {
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesSearch = 
      doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.associatedName && doc.associatedName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      doc.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getFileIcon = (type: DocumentFileType) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-rose-500" />;
      case 'docx':
      case 'doc':
        return <FileCode className="w-5 h-5 text-blue-500" />;
      case 'txt':
        return <File className="w-5 h-5 text-slate-500" />;
      default:
        return <Paperclip className="w-5 h-5 text-slate-400" />;
    }
  };

  const getCategoryLabel = (cat: DocumentCategory) => {
    switch (cat) {
      case 'certificate': return 'Certificado de Conclusão';
      case 'procedure_pop': return 'Procedimento POP Oficial';
      case 'norm_reference': return 'Norma Técnica / NR';
      case 'attendance_sheet': return 'Lista de Presença Assinada';
      case 'medical_aso': return 'Atestado ASO';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div
        className={`rounded-3xl shadow-2xl max-w-4xl w-full p-6 border my-8 transition-all ${
          tintedGlass
            ? 'aptis-glass-modal text-white border-white/10'
            : 'bg-white text-slate-900 border-slate-200'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between pb-4 border-b ${tintedGlass ? 'border-white/10' : 'border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold border ${
              tintedGlass
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                : 'bg-amber-100 text-amber-800 border-amber-200'
            }`}>
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
                Acervo & Gestão Documental
              </h2>
              <p className={`text-xs ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
                Repositório central de evidências, certificados de NRs, listas de presença e POPs em PDF, Word e TXT.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              tintedGlass
                ? 'text-slate-400 hover:text-white hover:bg-white/10'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className={`flex items-center gap-2 pt-4 pb-2 border-b ${tintedGlass ? 'border-white/10' : 'border-slate-100'}`}>
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
              activeTab === 'list'
                ? tintedGlass
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-amber-100 text-amber-900 border border-amber-200'
                : tintedGlass
                ? 'text-slate-400 hover:bg-white/10 hover:text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Documentos Cadastrados ({documents.length})
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? tintedGlass
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-amber-100 text-amber-900 border border-amber-200'
                : tintedGlass
                ? 'text-slate-400 hover:bg-white/10 hover:text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Anexar Novo Arquivo (PDF / Word / TXT)
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'list' ? (
          <div className="space-y-4 py-4">
            {/* Filter and Search */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Pesquisar por nome de arquivo, colaborador ou conteúdo..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    tintedGlass
                      ? 'aptis-glass-input text-white placeholder:text-slate-400'
                      : 'bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white'
                  }`}
                />
              </div>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className={`text-xs rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  tintedGlass
                    ? 'aptis-glass-input text-white [&>option]:bg-slate-900'
                    : 'border border-slate-200 bg-slate-50 text-slate-900'
                }`}
              >
                <option value="all">Todas as Categorias</option>
                <option value="certificate">Certificados de NRs</option>
                <option value="procedure_pop">Procedimentos POPs</option>
                <option value="attendance_sheet">Listas de Presença</option>
                <option value="norm_reference">Normas de Referência</option>
                <option value="medical_aso">ASO / Médico</option>
              </select>
            </div>

            {/* Document List */}
            <div className="max-h-[50vh] overflow-y-auto space-y-2 pr-1">
              {filteredDocs.length === 0 ? (
                <div className={`py-12 text-center text-xs text-slate-400 italic rounded-xl border border-dashed ${
                  tintedGlass ? 'bg-white/5 border-white/15' : 'bg-slate-50 border-slate-200'
                }`}>
                  Nenhum documento encontrado com os critérios de filtro.
                </div>
              ) : (
                filteredDocs.map(doc => (
                  <div
                    key={doc.id}
                    className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                      tintedGlass
                        ? 'aptis-glass-subcard border-white/10 hover:border-white/20'
                        : 'bg-white hover:bg-slate-50/80 border-slate-200 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`p-2.5 rounded-xl shrink-0 ${tintedGlass ? 'bg-white/10' : 'bg-slate-100'}`}>
                        {getFileIcon(doc.fileType)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={`text-xs font-bold truncate ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
                            {doc.fileName}
                          </h4>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${
                            tintedGlass
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                            {getCategoryLabel(doc.category)}
                          </span>
                        </div>
                        <p className={`text-[11px] mt-0.5 truncate ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
                          Vinculado a: <strong className={tintedGlass ? 'text-slate-200' : 'text-slate-700'}>{doc.associatedName}</strong> • Tamanho: {doc.fileSize} • Upload em: {formatDate(doc.uploadDate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 justify-end">
                      <button
                        onClick={() => setViewingDoc(doc)}
                        className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                          tintedGlass
                            ? 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30'
                            : 'text-blue-700 bg-blue-50 hover:bg-blue-100'
                        }`}
                        title="Visualizar conteúdo"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Visualizar
                      </button>
                      <button
                        onClick={() => alert(`Simulando download seguro de: ${doc.fileName}`)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          tintedGlass
                            ? 'text-slate-300 hover:text-white hover:bg-white/10'
                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                        }`}
                        title="Baixar arquivo"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Deseja remover o arquivo ${doc.fileName}?`)) {
                            onDeleteDocument(doc.id);
                          }
                        }}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          tintedGlass
                            ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/15'
                            : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                        }`}
                        title="Excluir documento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* Upload Tab */
          <form onSubmit={handleSaveUpload} className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-1">
            {/* Drag and Drop Zone */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
                tintedGlass
                  ? 'border-amber-500/40 hover:border-amber-400 bg-amber-500/10'
                  : 'border-amber-300 hover:border-amber-500 bg-amber-50/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt,image/*"
                onChange={handleFileSelected}
                className="hidden"
              />
              <Upload className={`w-8 h-8 mx-auto mb-2 ${tintedGlass ? 'text-amber-400' : 'text-amber-600'}`} />
              <p className={`text-xs font-bold ${tintedGlass ? 'text-white' : 'text-slate-800'}`}>
                {fileName ? `Arquivo Selecionado: ${fileName}` : 'Clique para selecionar arquivo do computador'}
              </p>
              <p className={`text-[11px] mt-1 ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
                Formatos aceitos: PDF, Word (.docx, .doc), Texto (.txt) e Imagens/Certificados até 25MB
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${tintedGlass ? 'text-slate-300' : 'text-slate-700'}`}>
                  Nome do Documento *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Certificado_NR10_Carlos_Silveira.pdf"
                  value={fileName}
                  onChange={e => setFileName(e.target.value)}
                  className={`w-full text-xs rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    tintedGlass
                      ? 'aptis-glass-input text-white placeholder:text-slate-500'
                      : 'bg-slate-50 border border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${tintedGlass ? 'text-slate-300' : 'text-slate-700'}`}>
                  Categoria do Documento
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as DocumentCategory)}
                  className={`w-full text-xs rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    tintedGlass
                      ? 'aptis-glass-input text-white [&>option]:bg-slate-900'
                      : 'bg-slate-50 border border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="certificate">Certificado de Conclusão</option>
                  <option value="procedure_pop">Procedimento Operacional Padrão (POP)</option>
                  <option value="attendance_sheet">Lista de Presença Assinada</option>
                  <option value="norm_reference">Norma Técnica de Referência</option>
                  <option value="medical_aso">ASO / Atestado de Saúde</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${tintedGlass ? 'text-slate-300' : 'text-slate-700'}`}>
                  Vinculado a (Colaborador / Curso / POP)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Carlos Silveira (NR-10) ou POP-001 Usinagem"
                  value={associatedName}
                  onChange={e => setAssociatedName(e.target.value)}
                  className={`w-full text-xs rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    tintedGlass
                      ? 'aptis-glass-input text-white placeholder:text-slate-500'
                      : 'bg-slate-50 border border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${tintedGlass ? 'text-slate-300' : 'text-slate-700'}`}>
                  Tipo de Arquivo
                </label>
                <select
                  value={fileType}
                  onChange={e => setFileType(e.target.value as DocumentFileType)}
                  className={`w-full text-xs rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    tintedGlass
                      ? 'aptis-glass-input text-white [&>option]:bg-slate-900'
                      : 'bg-slate-50 border border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="pdf">Documento PDF (.pdf)</option>
                  <option value="docx">Word (.docx)</option>
                  <option value="doc">Word Legado (.doc)</option>
                  <option value="txt">Texto Puro (.txt)</option>
                </select>
              </div>
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1 ${tintedGlass ? 'text-slate-300' : 'text-slate-700'}`}>
                Texto / Metadados Indexados para Busca Profunda (Deep Search)
              </label>
              <textarea
                rows={4}
                placeholder="Insira o resumo textual, tópicos abordados, números de portaria ou cláusulas do documento para indexar na pesquisa..."
                value={textContent}
                onChange={e => setTextContent(e.target.value)}
                className={`w-full text-xs rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  tintedGlass
                    ? 'aptis-glass-input text-white placeholder:text-slate-500'
                    : 'bg-slate-50 border border-slate-300 text-slate-900'
                }`}
              />
              <p className="text-[10px] text-slate-400 mt-1">
                💡 Este texto será indexado no motor de busca inteligente para localizar palavras-chave dentro do documento.
              </p>
            </div>

            <div className={`flex items-center justify-end gap-2 pt-3 border-t ${tintedGlass ? 'border-white/10' : 'border-slate-200'}`}>
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className={`px-4 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
                  tintedGlass ? 'text-slate-300 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {uploadSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    Arquivo Salvo!
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Salvar e Indexar Documento
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Modal Leitor / Visualizador de Documento */}
        {viewingDoc && (
          <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div
              className={`rounded-3xl shadow-2xl max-w-2xl w-full p-6 border flex flex-col max-h-[85vh] ${
                tintedGlass
                  ? 'aptis-glass-modal text-white border-white/10'
                  : 'bg-white text-slate-900 border-slate-200'
              }`}
            >
              <div className={`flex items-center justify-between pb-3 border-b ${tintedGlass ? 'border-white/10' : 'border-slate-200'}`}>
                <div className="flex items-center gap-2.5">
                  {getFileIcon(viewingDoc.fileType)}
                  <div>
                    <h3 className={`text-sm font-bold leading-tight ${tintedGlass ? 'text-white' : 'text-slate-900'}`}>
                      {viewingDoc.fileName}
                    </h3>
                    <span className={`text-[10px] ${tintedGlass ? 'text-slate-400' : 'text-slate-500'}`}>
                      {getCategoryLabel(viewingDoc.category)} • {viewingDoc.fileSize}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setViewingDoc(null)}
                  className={`p-1 rounded-lg cursor-pointer ${tintedGlass ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-700'}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 space-y-3">
                <div className={`p-3 rounded-xl border text-xs grid grid-cols-2 gap-2 ${
                  tintedGlass
                    ? 'aptis-glass-subcard border-white/10 text-slate-300'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}>
                  <div><strong className={tintedGlass ? 'text-white' : 'text-slate-900'}>Vinculado a:</strong> {viewingDoc.associatedName}</div>
                  <div><strong className={tintedGlass ? 'text-white' : 'text-slate-900'}>Data de Upload:</strong> {formatDate(viewingDoc.uploadDate)}</div>
                  <div><strong className={tintedGlass ? 'text-white' : 'text-slate-900'}>Formato:</strong> {viewingDoc.fileType.toUpperCase()}</div>
                  <div><strong className={tintedGlass ? 'text-white' : 'text-slate-900'}>Status:</strong> Indexado no Deep Search ✅</div>
                </div>

                <div>
                  <h4 className={`text-xs font-bold mb-1.5 ${tintedGlass ? 'text-slate-200' : 'text-slate-800'}`}>
                    Conteúdo Textual do Arquivo
                  </h4>
                  <div className="p-3.5 bg-slate-950/80 border border-white/10 text-slate-100 rounded-xl text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                    {viewingDoc.content}
                  </div>
                </div>
              </div>

              <div className={`pt-3 border-t flex items-center justify-between ${tintedGlass ? 'border-white/10' : 'border-slate-200'}`}>
                <button
                  onClick={() => alert(`Baixando cópia oficial de ${viewingDoc.fileName}...`)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer ${
                    tintedGlass
                      ? 'aptis-glass-subcard text-slate-200 hover:text-white'
                      : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
                  }`}
                >
                  <Download className="w-3.5 h-3.5" />
                  Baixar Arquivo
                </button>
                <button
                  onClick={() => setViewingDoc(null)}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl cursor-pointer"
                >
                  Fechar Visualizador
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
