import React from 'react';
import Link from 'next/link';
import { Shield, CheckCircle2 } from 'lucide-react';

export function PublicFooter() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-sm">
                A
              </div>
              <span className="text-base font-bold text-white tracking-tight">
                Aptis
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                • A fábrica sempre apta.
              </span>
            </div>
            <p className="text-slate-400 text-xs max-w-md leading-relaxed">
              Plataforma B2B de governança e prontidão operacional para o chão de fábrica. Garanta que todo operador, máquina e turno estejam 100% aptos a produzir com segurança e sem paradas de linha.
            </p>
            <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-2">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                Multi-Tenant com Isolamento RLS
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Suíte Modular Integrada
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Suíte Aptis</h4>
            <ul className="space-y-2">
              <li><Link href="/dashboard/tools/skills-matrix" className="hover:text-white transition-colors">Aptis Skills (Matriz ILUO)</Link></li>
              <li><Link href="/dashboard/tools/manager-tasks" className="hover:text-white transition-colors">Aptis Routine (Kamishibai & SLA)</Link></li>
              <li><Link href="/dashboard/tools/training-matrix" className="hover:text-white transition-colors">Aptis Compliance (NRs & POPs)</Link></li>
              <li><Link href="/dashboard/tools/kaizen-manager" className="hover:text-white transition-colors">Aptis Kaizen (Melhoria Contínua)</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Acesso Rápido</h4>
            <ul className="space-y-2">
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Hub Operacional da Planta</Link></li>
              <li><Link href="/dashboard/marketplace" className="hover:text-white transition-colors">Catálogo da Suíte Aptis</Link></li>
              <li><Link href="/admin" className="text-amber-400 hover:text-amber-300 transition-colors">Painel SuperAdmin</Link></li>
              <li><a href="#catalogo" className="hover:text-white transition-colors">Solicitar Demonstração</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} Aptis Tecnologia S.A. Todos os direitos reservados.
          </div>
          <div className="flex items-center gap-6">
            <span>Privacidade & LGPD</span>
            <span>Termos de Licenciamento B2B</span>
            <span>SLA 99.9%</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
