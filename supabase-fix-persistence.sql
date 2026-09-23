-- ==============================================================================
-- ECOSSISTEMA APTIS - CORREÇÃO DE PERSISTÊNCIA & MULTI-APARELHO (SUPABASE SQL)
-- ==============================================================================
-- Execute este script no SQL Editor do seu projeto Supabase:
-- https://supabase.com/dashboard/project/nalisbuoztmdckpuiexh/sql/new
-- ==============================================================================

-- 1. CORRIGIR POLÍTICAS DE RLS NA TABELA DE LICENÇAS (LICENSES)
-- Permite que o painel administrativo adicione, atualize e remova licenças sem erro 42501
DROP POLICY IF EXISTS "Permitir leitura de licencas" ON public.licenses;
DROP POLICY IF EXISTS "Permitir tudo em licencas" ON public.licenses;

CREATE POLICY "Permitir tudo em licencas" 
  ON public.licenses 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- 2. CORRIGIR POLÍTICAS DE RLS NA TABELA DE EMPRESAS (TENANTS)
-- Permite cadastrar e atualizar novas organizações fabris
DROP POLICY IF EXISTS "Permitir leitura de tenants" ON public.tenants;
DROP POLICY IF EXISTS "Permitir tudo em tenants" ON public.tenants;

CREATE POLICY "Permitir tudo em tenants" 
  ON public.tenants 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- 3. CRIAR A TABELA UNIVERSAL DE DADOS DAS FERRAMENTAS (TENANT_TOOL_DATA)
-- Esta tabela armazena os dados de todas as ferramentas (Kaizen, Habilidades, HERCA, Treinamentos, Setores)
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

-- Índices de alta performance
CREATE INDEX IF NOT EXISTS idx_tenant_tool_data_lookup 
  ON public.tenant_tool_data(tenant_id, tool_id);

CREATE INDEX IF NOT EXISTS idx_tenant_tool_data_key 
  ON public.tenant_tool_data(tenant_id, tool_id, data_key);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.tenant_tool_data ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para tenant_tool_data
DROP POLICY IF EXISTS "Permitir tudo em tenant_tool_data" ON public.tenant_tool_data;

CREATE POLICY "Permitir tudo em tenant_tool_data" 
  ON public.tenant_tool_data 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- 4. HABILITAR SINCRONIZAÇÃO EM TEMPO REAL (REALTIME) MULTI-APARELHO
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'tenant_tool_data'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tenant_tool_data;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'licenses'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.licenses;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'tenants'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tenants;
  END IF;
END $$;
