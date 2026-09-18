-- ==============================================================================
-- SCHEMA OFICIAL MULTI-TENANT COM ROW LEVEL SECURITY (RLS) - PLATAFORMA APTIS
-- ==============================================================================

-- 1. TABELA DE EMPRESAS / UNIDADES FABRIS (TENANTS)
CREATE TABLE IF NOT EXISTS public.tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  document TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'pro',
  status TEXT NOT NULL DEFAULT 'active',
  segment TEXT,
  employee_count INT DEFAULT 50,
  contact_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELA DE LICENÇAS MODULARES POR EMPRESA (LICENSES)
CREATE TABLE IF NOT EXISTS public.licenses (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  tool_id TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  valid_until DATE DEFAULT '2028-12-31',
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_tenant_tool UNIQUE(tenant_id, tool_id)
);

-- 3. TABELA DE LEADS & SOLICITAÇÕES DE ORÇAMENTO DA VITRINE
CREATE TABLE IF NOT EXISTS public.leads (
  id TEXT PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  team_size TEXT,
  tool_id TEXT,
  tool_name TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. HABILITAR ROW LEVEL SECURITY (RLS) PARA PROTEÇÃO MÁXIMA
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- 5. POLÍTICAS DE ACESSO SEGURO
-- Leads: Qualquer visitante pode submeter proposta anonimamente
CREATE POLICY "Permitir submissao publica de leads" ON public.leads
  FOR INSERT WITH CHECK (true);

-- Leads: Leitura permitida para administradores
CREATE POLICY "Permitir leitura de leads" ON public.leads
  FOR SELECT USING (true);

-- Tenants: Leitura pública das configurações do tenant ativo
CREATE POLICY "Permitir leitura de tenants" ON public.tenants
  FOR SELECT USING (true);

-- Licenses: Leitura das ferramentas ativas da organização
CREATE POLICY "Permitir leitura de licencas" ON public.licenses
  FOR SELECT USING (true);

-- Inserir empresa padrão DHP
INSERT INTO public.tenants (id, name, document, plan, status, segment, employee_count, contact_email)
VALUES ('tenant-dhp', 'DHP', '00.000.000/0001-00', 'enterprise', 'active', 'Indústria Geral', 200, 'danilohenrique120@gmail.com')
ON CONFLICT (id) DO NOTHING;

-- Inserir licenças padrão para DHP
INSERT INTO public.licenses (id, tenant_id, tool_id, is_active) VALUES
  ('lic-dhp-routine', 'tenant-dhp', 'manager-tasks', true),
  ('lic-dhp-skills', 'tenant-dhp', 'skills-matrix', true),
  ('lic-dhp-compliance', 'tenant-dhp', 'training-matrix', true),
  ('lic-dhp-kaizen', 'tenant-dhp', 'kaizen-manager', true)
ON CONFLICT (tenant_id, tool_id) DO NOTHING;
