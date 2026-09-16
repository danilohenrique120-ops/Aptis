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
}

export const DocumentManagerModal: React.FC<DocumentManagerModalProps> = ({
  isOpen,
  onClose,
  documents,
  onAddDocument,
  onDeleteDocument,
  initialSelectedCategory = 'all'
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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 border border-slate-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Acervo & Gestão Documental</h2>
              <p className="text-xs text-slate-500">
                Repositório central de evidências, certificados de NRs, listas de presença e POPs em PDF, Word e TXT.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 pt-4 pb-2 border-b border-slate-100">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'list'
                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Documentos Cadastrados ({documents.length})
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'bg-amber-100 text-amber-900 border border-amber-200'
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
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="text-xs border border-slate-200 bg-slate-50 rounded-lg py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                <div className="py-12 text-center text-xs text-slate-400 italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  Nenhum documento encontrado com os critérios de filtro.
                </div>
              ) : (
                filteredDocs.map(doc => (
                  <div
                    key={doc.id}
                    className="p-3 bg-white hover:bg-slate-50/80 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="p-2.5 bg-slate-100 rounded-xl shrink-0">
                        {getFileIcon(doc.fileType)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {doc.fileName}
                          </h4>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                            {getCategoryLabel(doc.category)}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                          Vinculado a: <strong className="text-slate-700">{doc.associatedName}</strong> • Tamanho: {doc.fileSize} • Upload em: {formatDate(doc.uploadDate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 justify-end">
                      <button
                        onClick={() => setViewingDoc(doc)}
                        className="px-2.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        title="Visualizar conteúdo"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Visualizar
                      </button>
                      <button
                        onClick={() => alert(`Simulando download seguro de: ${doc.fileName}`)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
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
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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
              className="border-2 border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/40 rounded-2xl p-6 text-center cursor-pointer transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt,image/*"
                onChange={handleFileSelected}
                className="hidden"
              />
              <Upload className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-800">
                {fileName ? `Arquivo Selecionado: ${fileName}` : 'Clique para selecionar arquivo do computador'}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Formatos aceitos: PDF, Word (.docx, .doc), Texto (.txt) e Imagens/Certificados até 25MB
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome do Documento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Certificado_NR10_Carlos_Silveira.pdf"
                  value={fileName}
                  onChange={e => setFileName(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Categoria do Documento</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as DocumentCategory)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500"
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Vinculado a (Colaborador / Curso / POP)</label>
                <input
                  type="text"
                  placeholder="Ex: Carlos Silveira (NR-10) ou POP-001 Usinagem"
                  value={associatedName}
                  onChange={e => setAssociatedName(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo de Arquivo</label>
                <select
                  value={fileType}
                  onChange={e => setFileType(e.target.value as DocumentFileType)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500"
                >
                  <option value="pdf">Documento PDF (.pdf)</option>
                  <option value="docx">Word (.docx)</option>
                  <option value="doc">Word Legado (.doc)</option>
                  <option value="txt">Texto Puro (.txt)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Texto / Metadados Indexados para Busca Profunda (Deep Search)
              </label>
              <textarea
                rows={4}
                placeholder="Insira o resumo textual, tópicos abordados, números de portaria ou cláusulas do documento para indexar na pesquisa..."
                value={textContent}
                onChange={e => setTextContent(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-amber-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                💡 Este texto será indexado no motor de busca inteligente para localizar palavras-chave dentro do documento.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
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
          <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 flex flex-col max-h-[85vh]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  {getFileIcon(viewingDoc.fileType)}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">{viewingDoc.fileName}</h3>
                    <span className="text-[10px] text-slate-500">
                      {getCategoryLabel(viewingDoc.category)} • {viewingDoc.fileSize}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setViewingDoc(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 space-y-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 grid grid-cols-2 gap-2">
                  <div><strong>Vinculado a:</strong> {viewingDoc.associatedName}</div>
                  <div><strong>Data de Upload:</strong> {formatDate(viewingDoc.uploadDate)}</div>
                  <div><strong>Formato:</strong> {viewingDoc.fileType.toUpperCase()}</div>
                  <div><strong>Status:</strong> Indexado no Deep Search ✅</div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-800 mb-1.5">Conteúdo Textual do Arquivo</h4>
                  <div className="p-3.5 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                    {viewingDoc.content}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <button
                  onClick={() => alert(`Baixando cópia oficial de ${viewingDoc.fileName}...`)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Baixar Arquivo
                </button>
                <button
                  onClick={() => setViewingDoc(null)}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-lg cursor-pointer"
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
