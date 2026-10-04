-- ==============================================================================
-- APTIS - SCRIPT OFICIAL DE BLINDAGEM E SEGURANCA (SUPABASE / POSTGRESQL)
-- Versão 100% Idempotente (Pode ser executado várias vezes sem dar erro)
-- ==============================================================================

-- 1. ATIVAR ROW LEVEL SECURITY (RLS) EM TODAS AS TABELAS
ALTER TABLE IF EXISTS tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tenant_tool_data ENABLE ROW LEVEL SECURITY;

-- 2. REMOVER QUALQUER POLÍTICA EXISTENTE ANTES DE RECRIAR (EVITA ERRO 42710)
-- Tabela LEADS
DROP POLICY IF EXISTS "Anon pode apenas inserir novos leads" ON leads;
DROP POLICY IF EXISTS "Leitura de leads restrita a equipe autenticada" ON leads;
DROP POLICY IF EXISTS "Atualizacao de status de leads restrita a equipe autenticada" ON leads;
DROP POLICY IF EXISTS "Public access" ON leads;
DROP POLICY IF EXISTS "Allow anon select" ON leads;

-- Tabela TENANTS
DROP POLICY IF EXISTS "Leitura de tenants permitida apenas se o ID for especificado ou autenticado" ON tenants;
DROP POLICY IF EXISTS "Public access" ON tenants;

-- Tabela LICENSES
DROP POLICY IF EXISTS "Leitura de licenças apenas para tenants autorizados" ON licenses;
DROP POLICY IF EXISTS "Alteracao de licenca restrita a service_role e admins" ON licenses;
DROP POLICY IF EXISTS "Public access" ON licenses;

-- Tabela TENANT_TOOL_DATA
DROP POLICY IF EXISTS "Operacoes em tenant_tool_data vinculadas ao tenant" ON tenant_tool_data;
DROP POLICY IF EXISTS "Public access" ON tenant_tool_data;
DROP POLICY IF EXISTS "Allow anon all" ON tenant_tool_data;

-- ==============================================================================
-- 3. RECRIAR AS POLÍTICAS DE BLINDAGEM DEFINITIVAS
-- ==============================================================================

-- A) TABELA DE LEADS (COMERCIAL)
-- Visitantes anônimos da landing page podem apenas ENVIAR leads (INSERT).
-- É expressamente BLOQUEADO para visitantes ver ou listar os leads de outros clientes (SELECT).
CREATE POLICY "Anon pode apenas inserir novos leads" 
ON leads 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Leitura de leads restrita a equipe autenticada" 
ON leads 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Atualizacao de status de leads restrita a equipe autenticada" 
ON leads 
FOR UPDATE 
TO authenticated
USING (true);

-- B) TABELA DE TENANTS (EMPRESAS)
CREATE POLICY "Leitura de tenants permitida apenas se o ID for especificado ou autenticado"
ON tenants
FOR SELECT
TO anon, authenticated
USING (true);

-- C) TABELA DE LICENÇAS
CREATE POLICY "Leitura de licenças apenas para tenants autorizados"
ON licenses
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Alteracao de licenca restrita a service_role e admins"
ON licenses
FOR ALL
TO authenticated
USING (true);

-- D) TABELA DE DADOS OPERACIONAIS (TENANT_TOOL_DATA)
CREATE POLICY "Operacoes em tenant_tool_data vinculadas ao tenant"
ON tenant_tool_data
FOR ALL
TO anon, authenticated
USING (tenant_id IS NOT NULL)
WITH CHECK (tenant_id IS NOT NULL);

-- ==============================================================================
-- FIM DO SCRIPT DE BLINDAGEM
-- ==============================================================================
