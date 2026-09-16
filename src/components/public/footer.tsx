import React from 'react';
import Link from 'next/link';
import { Shield, CheckCircle2, Award, Zap } from 'lucide-react';
import { AptisLogo } from '@/components/ui/aptis-logo';

export function PublicFooter() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 text-xs py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4 md:col-span-2">
            <Link href="/" className="inline-block">
              <AptisLogo size="md" showTagline={true} glow={true} />
            </Link>
            
            <p className="text-slate-400 text-xs max-w-md leading-relaxed">
              Plataforma corporativa de prontidão operacional, governança e conformidade para o chão de fábrica. Garante que todo operador, máquina e turno estejam 100% aptos a produzir com segurança e sem paradas de linha.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                Multi-Tenant com Isolamento RLS
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Matriz ILUO & Compliance MTE
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Registry Pattern Modular
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-cyan-400" />
              Suíte de Módulos
            </h4>
            <ul className="space-y-2.5">
              <li><Link href="/dashboard/tools/skills-matrix" className="hover:text-cyan-400 transition-colors">Aptis Skills (Matriz ILUO)</Link></li>
              <li><Link href="/dashboard/tools/manager-tasks" className="hover:text-cyan-400 transition-colors">Aptis Routine (Kamishibai & Turno)</Link></li>
              <li><Link href="/dashboard/tools/training-matrix" className="hover:text-cyan-400 transition-colors">Aptis Compliance (NRs & POPs)</Link></li>
              <li><Link href="/dashboard/tools/kaizen-manager" className="hover:text-cyan-400 transition-colors">Aptis Kaizen (Melhoria Contínua)</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4">Acesso & Governança</h4>
            <ul className="space-y-2.5">
              <li><Link href="/dashboard" className="hover:text-cyan-400 transition-colors font-medium text-slate-300">Hub Operacional da Planta</Link></li>
              <li><Link href="/dashboard/marketplace" className="hover:text-cyan-400 transition-colors">Catálogo de Ferramentas</Link></li>
              <li><Link href="/admin" className="text-amber-400 hover:text-amber-300 transition-colors font-semibold">Console SuperAdmin</Link></li>
              <li><a href="#score" className="hover:text-cyan-400 transition-colors">Conhecer o Aptis Score</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} Aptis Tecnologia S.A. Todos os direitos reservados.
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-300 cursor-pointer transition-colors">Segurança & LGPD</span>
            <span className="hover:text-slate-300 cursor-pointer transition-colors">Licenciamento B2B</span>
            <span className="hover:text-slate-300 cursor-pointer transition-colors">Disponibilidade SLA 99.9%</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
