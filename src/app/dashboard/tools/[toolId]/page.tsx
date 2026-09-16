import React from 'react';
import { notFound } from 'next/navigation';
import { getToolById, getAllTools } from '@/config/tools-registry';
import { LicenseGuard } from '@/components/dashboard/license-guard';
import ManagerTasksModule from '@/modules/manager-tasks';
import SkillsMatrixModule from '@/modules/skills-matrix';
import TrainingMatrixModule from '@/modules/training-matrix';
import KaizenManagerModule from '@/modules/kaizen-manager';

export function generateStaticParams() {
  return getAllTools().map(tool => ({
    toolId: tool.id
  }));
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ toolId: string }>;
}) {
  const { toolId } = await params;
  const tool = getToolById(toolId);

  if (!tool) {
    notFound();
  }

  // Registry Pattern Dispatcher
  const renderModule = () => {
    switch (toolId) {
      case 'manager-tasks':
        return <ManagerTasksModule />;
      case 'skills-matrix':
        return <SkillsMatrixModule />;
      case 'training-matrix':
        return <TrainingMatrixModule />;
      case 'kaizen-manager':
        return <KaizenManagerModule />;
      default:
        return (
          <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
            <h2 className="text-xl font-bold text-slate-800">{tool.name}</h2>
            <p className="text-slate-500 mt-2">Módulo em fase final de homologação técnica.</p>
          </div>
        );
    }
  };

  return (
    <LicenseGuard toolId={toolId}>
      {renderModule()}
    </LicenseGuard>
  );
}
