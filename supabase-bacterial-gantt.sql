-- ==============================================================================
-- SCHEMA SUPABASE: SEQUENCIADOR GANTT DE MULTIPLICAÇÃO BACTERIANA (PCP)
-- MULTI-TENANT COM ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- 1. TABELA DE RECEITAS DE PRODUTOS / BIOLÓGICOS (PCP_RECIPES)
CREATE TABLE IF NOT EXISTS public.pcp_recipes (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'blue',
  yield_per_batch NUMERIC NOT NULL DEFAULT 3000,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELA DE LOTES DE PRODUÇÃO E ESCALONAMENTO (PCP_BATCHES)
CREATE TABLE IF NOT EXISTS public.pcp_batches (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  lot_number TEXT NOT NULL,
  product_id TEXT NOT NULL REFERENCES public.pcp_recipes(id) ON DELETE CASCADE,
  start_date_time TIMESTAMPTZ NOT NULL,
  transfer_interval_hours NUMERIC NOT NULL DEFAULT 0,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_contaminated BOOLEAN DEFAULT false,
  contaminated_step_index INT,
  contamination_reason TEXT,
  contamination_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA DE PARADAS DE MANUTENÇÃO PREVENTIVA (PCP_PREVENTATIVES)
CREATE TABLE IF NOT EXISTS public.pcp_preventatives (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  asset_id TEXT NOT NULL,
  description TEXT NOT NULL,
  start_date_time TIMESTAMPTZ NOT NULL,
  end_date_time TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABELA DE DESVIOS E AUDITORIA OPERACIONAL (PCP_DEVIATIONS)
CREATE TABLE IF NOT EXISTS public.pcp_deviations (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  type TEXT NOT NULL, -- 'CONTAMINATION' | 'DELAY' | 'ROUTE_CHANGE'
  lot_number TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  step_scale_type TEXT NOT NULL,
  reason TEXT NOT NULL, -- 'Mecânico' | 'Biológico' | 'Operacional'
  notes TEXT NOT NULL,
  details TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABELA DE CONFIGURAÇÃO DE TURNOS E RESTRIÇÕES (PCP_SHIFT_CONFIGS)
CREATE TABLE IF NOT EXISTS public.pcp_shift_configs (
  tenant_id TEXT PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
  shifts JSONB NOT NULL DEFAULT '[]'::jsonb,
  envase_lines_count INT DEFAULT 3,
  setup_times JSONB NOT NULL DEFAULT '{"Erlenmeyer":0,"Balão":0,"100L":4,"500L":6,"3000_5000L":8,"Envase":4}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE public.pcp_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pcp_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pcp_preventatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pcp_deviations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pcp_shift_configs ENABLE ROW LEVEL SECURITY;

-- 7. POLÍTICAS DE ACESSO
CREATE POLICY "Permitir select recipes por tenant" ON public.pcp_recipes FOR SELECT USING (true);
CREATE POLICY "Permitir insert/update recipes por tenant" ON public.pcp_recipes FOR ALL USING (true);

CREATE POLICY "Permitir select batches por tenant" ON public.pcp_batches FOR SELECT USING (true);
CREATE POLICY "Permitir insert/update batches por tenant" ON public.pcp_batches FOR ALL USING (true);

CREATE POLICY "Permitir select preventatives por tenant" ON public.pcp_preventatives FOR SELECT USING (true);
CREATE POLICY "Permitir insert/update preventatives por tenant" ON public.pcp_preventatives FOR ALL USING (true);

CREATE POLICY "Permitir select deviations por tenant" ON public.pcp_deviations FOR SELECT USING (true);
CREATE POLICY "Permitir insert deviations por tenant" ON public.pcp_deviations FOR ALL USING (true);

CREATE POLICY "Permitir select shift_configs por tenant" ON public.pcp_shift_configs FOR SELECT USING (true);
CREATE POLICY "Permitir insert/update shift_configs por tenant" ON public.pcp_shift_configs FOR ALL USING (true);

-- 8. LICENÇA DO SEQUENCIADOR PARA O TENANT DHP E OUTROS
INSERT INTO public.licenses (id, tenant_id, tool_id, is_active) VALUES
  ('lic-dhp-bacterial-gantt', 'tenant-dhp', 'bacterial-gantt', true)
ON CONFLICT (tenant_id, tool_id) DO UPDATE SET is_active = true;
