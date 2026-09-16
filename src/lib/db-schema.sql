-- ==============================================================================
-- ECOSSISTEMA LÍDER - SCHEMA MULTI-TENANT (SUPABASE / POSTGRESQL)
-- ==============================================================================

-- 1. TABELA DE ORGANIZAÇÕES / EMPRESAS CLIENTES (TENANTS)
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    document VARCHAR(32) NOT NULL UNIQUE, -- CNPJ
    plan VARCHAR(50) NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'pro', 'enterprise')),
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'trial')),
    segment VARCHAR(100),
    employee_count INTEGER DEFAULT 0,
    contact_email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABELA DE USUÁRIOS E PERMISSÕES (USERS)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL DEFAULT 'member' CHECK (role IN ('superadmin', 'tenant_admin', 'member')),
    department VARCHAR(100),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);

-- 3. TABELA DE LICENÇAS DE FERRAMENTAS POR TENANT (LICENSES)
CREATE TABLE IF NOT EXISTS licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    tool_id VARCHAR(100) NOT NULL, -- Ex: 'manager-tasks', 'skills-matrix', 'training-matrix', 'kaizen-manager'
    is_active BOOLEAN NOT NULL DEFAULT true,
    valid_until DATE NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_tenant_tool UNIQUE(tenant_id, tool_id)
);

CREATE INDEX IF NOT EXISTS idx_licenses_tenant_tool ON licenses(tenant_id, tool_id);

-- 4. TABELA DE LEADS & INTERESSE EM NOVAS FERRAMENTAS (LEADS)
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tool_id VARCHAR(100) NOT NULL,
    tool_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    team_size VARCHAR(50),
    notes TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'converted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- MÓDULOS ESPECÍFICOS (SEMPRE ISOLADOS E INDEXADOS POR TENANT_ID)
-- ==============================================================================

-- 5. MÓDULO: GERENCIADOR DE TAREFAS (MANAGER_TASKS)
CREATE TABLE IF NOT EXISTS module_manager_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(50) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(50) NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
    assignee_name VARCHAR(150),
    due_date DATE,
    sector VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_tasks_tenant ON module_manager_tasks(tenant_id);

-- 6. MÓDULO: MATRIZ DE HABILIDADES (SKILLS_MATRIX)
CREATE TABLE IF NOT EXISTS module_skills_matrix (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    employee_name VARCHAR(150) NOT NULL,
    role VARCHAR(100) NOT NULL,
    station_or_skill VARCHAR(100) NOT NULL,
    skill_level INTEGER NOT NULL CHECK (skill_level BETWEEN 1 AND 4), -- 1: Aprendiz, 2: Praticante, 3: Autônomo, 4: Multiplicador
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_tenant_employee_station UNIQUE(tenant_id, employee_name, station_or_skill)
);
CREATE INDEX IF NOT EXISTS idx_skills_tenant ON module_skills_matrix(tenant_id);

-- 7. MÓDULO: MATRIZ DE TREINAMENTOS E COMPLIANCE (TRAINING_MATRIX)
CREATE TABLE IF NOT EXISTS module_training_matrix (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    employee_name VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    course_name VARCHAR(150) NOT NULL, -- Ex: 'NR-10 Básico', 'NR-35 Trabalho em Altura', '5S Fabril'
    completed_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    certificate_code VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_trainings_tenant ON module_training_matrix(tenant_id);

-- 8. MÓDULO: GERENCIADOR DE KAIZENS E MELHORIAS (KAIZEN_MANAGER)
CREATE TABLE IF NOT EXISTS module_kaizen_ideas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    problem_description TEXT NOT NULL,
    proposed_solution TEXT NOT NULL,
    author_name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('seguranca', 'qualidade', 'custo', 'produtividade', 'ergonomia')),
    stage VARCHAR(50) NOT NULL DEFAULT 'ideation' CHECK (stage IN ('ideation', 'analysis', 'implementation', 'standardized')),
    estimated_savings_annual NUMERIC(12, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_kaizens_tenant ON module_kaizen_ideas(tenant_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) PARA SUPABASE
-- Garante isolamento estrito: cada tenant só enxerga os próprios registros.
-- ==============================================================================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_manager_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_skills_matrix ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_training_matrix ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_kaizen_ideas ENABLE ROW LEVEL SECURITY;

-- Política de exemplo no Supabase:
-- CREATE POLICY "Tenant Isolation" ON module_manager_tasks
--     FOR ALL USING (tenant_id = (current_setting('app.current_tenant_id'))::uuid);
