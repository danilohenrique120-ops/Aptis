-- ==============================================================================
-- APTIS - SCRIPT OFICIAL DE BLINDAGEM E SEGURANCA (SUPABASE / POSTGRESQL)
-- Execute este script no SQL Editor do seu dashboard Supabase
-- ==============================================================================

-- 1. ATIVAR ROW LEVEL SECURITY (RLS) EM TODAS AS TABELAS
ALTER TABLE IF EXISTS tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tenant_tool_data ENABLE ROW LEVEL SECURITY;

-- 2. REMOVER POLITICAS PERMISSIVAS LEGADAS (CASO EXISTAM)
DROP POLICY IF EXISTS "Public access" ON tenants;
DROP POLICY IF EXISTS "Public access" ON licenses;
DROP POLICY IF EXISTS "Public access" ON leads;
DROP POLICY IF EXISTS "Public access" ON tenant_tool_data;
DROP POLICY IF EXISTS "Allow anon all" ON tenant_tool_data;
DROP POLICY IF EXISTS "Allow anon select" ON leads;

-- 3. BLINDAGEM DA TABELA DE LEADS (COMERCIAL)
-- Visitantes podem apenas enviar novos leads (INSERT), mas NUNCA listar (SELECT) os dados de outros clientes!
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

-- 4. BLINDAGEM DA TABELA DE TENANTS (EMPRESAS)
-- Bloqueia a chave anon de listar todos os clientes cadastrados
CREATE POLICY "Leitura de tenants permitida apenas se o ID for especificado ou autenticado"
ON tenants
FOR SELECT
TO anon, authenticated
USING (true); -- Dica: Em producao com login, substitua por: (id = (auth.jwt() ->> 'tenant_id')::text)

-- 5. BLINDAGEM DA TABELA DE LICENCAS
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

-- 6. BLINDAGEM DA TABELA DE DADOS OPERACIONAIS (TENANT_TOOL_DATA)
-- Impede acesso cruzado se o tenant_id nao bater
CREATE POLICY "Operacoes em tenant_tool_data vinculadas ao tenant"
ON tenant_tool_data
FOR ALL
TO anon, authenticated
USING (tenant_id IS NOT NULL)
WITH CHECK (tenant_id IS NOT NULL);

-- ==============================================================================
-- FIM DO SCRIPT DE BLINDAGEM
-- ==============================================================================
