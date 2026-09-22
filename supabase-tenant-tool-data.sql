-- ==============================================================================
-- TABELA UNIVERSAL DE DADOS POR FERRAMENTA E TENANT (ECOSSISTEMA LÍDER / APTIS)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.tenant_tool_data (
  id TEXT PRIMARY KEY, -- Formato: tenantId:toolId:dataKey
  tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  tool_id TEXT NOT NULL,
  data_key TEXT NOT NULL,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT,
  CONSTRAINT unique_tenant_tool_key UNIQUE(tenant_id, tool_id, data_key)
);

-- Índices de consulta rápida
CREATE INDEX IF NOT EXISTS idx_tenant_tool_data_lookup 
  ON public.tenant_tool_data(tenant_id, tool_id);

CREATE INDEX IF NOT EXISTS idx_tenant_tool_data_key 
  ON public.tenant_tool_data(tenant_id, tool_id, data_key);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.tenant_tool_data ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
CREATE POLICY Permitir leitura dos dados de ferramentas por tenant 
  ON public.tenant_tool_data FOR SELECT 
  USING (true);

CREATE POLICY Permitir inserção e atualização de ferramentas por tenant 
  ON public.tenant_tool_data FOR ALL 
  USING (true);

-- Habilitar Realtime para a tabela no Supabase
ALTER PUBLICATION supabase_realtime ADD TABLE public.tenant_tool_data;
