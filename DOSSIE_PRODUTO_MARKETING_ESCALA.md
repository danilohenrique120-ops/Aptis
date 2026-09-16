# Dossiê Executivo do Produto: Ecossistema Líder
**Documento Estratégico de Contexto para Marketing, Marca, Precificação e Escala B2B**

---

## 1. Visão Geral do Negócio e Proposta de Valor

* **Nome do Produto:** Ecossistema Líder
* **Categoria:** SaaS Multi-tenant B2B para Gestão Industrial e Operações de Chão de Fábrica (Manufacturing Operations Management / Shop Floor Management).
* **Missão:** Capacitar supervisores, gerentes industriais e comitês de excelência operacional com ferramentas modulares especializadas, substituindo planilhas frágeis de Excel e cadernos de turno por uma suíte digital integrada de alta governança.
* **Stack Tecnológica:** Next.js 16 (App Router / Turbopack), React 19, TypeScript, Tailwind CSS v4, Lucide Icons, arquitetura modular com Registry Pattern e suporte Multi-tenant nativo.
* **Link do Repositório do Projeto:** `C:\Users\dhpiv\.gemini\antigravity\scratch\ecossistema-lider`

---

## 2. O Problema de Mercado que o Produto Resolve (Pain Points)

Nas indústrias manufatureiras de médio e grande porte, a gestão operacional no chão de fábrica sofre com:
1. **Apagões de Informação na Passagem de Turno:** O Turno A não sabe o que o Turno B fez; quebras de máquinas e desvios de qualidade são repassados de boca a boca ou em grupos informais de WhatsApp.
2. **Risco Crítico de Autuação e Interdição (MTE & ISO):** Dificuldade de controlar centenas de operadores com treinamentos de NRs vencidos (NR-10, NR-12, NR-35, etc.) e POPs desatualizados. Em fiscalizações, os certificados estão espalhados em pastas físicas ou e-mails.
3. **Falta de Polivalência e Paradas por Ausência:** Quando um operador chave falta, a supervisão não sabe rapidamente quem tem competência técnica certificada (ILUO) para assumir a máquina sem derrubar a produtividade (OEE).
4. **ERPs Pesados vs. Chão de Fábrica Ágil:** Sistemas corporativos como SAP ou TOTVS são burocráticos, lentos e voltados para controladoria/financeiro, não atendendo a dinâmica de 5 minutos da liderança de linha.

---

## 3. Módulos Desenvolvidos & Diferenciais Competitivos

O sistema opera sob o **Registry Pattern** (`src/config/tools-registry.ts`), permitindo ligar e desligar módulos por cliente conforme a contratação:

### 🎯 Módulo 1: Matriz de Habilidades & Polivalência (`skills-matrix`)
* **Metodologia ILUO:** Avaliação visual de competências (I: Teoria / L: Prática Supervisionada / U: Autônomo / O: Multiplicador/Tutor).
* **Isolamento Multisetorial Rígido:** Segmentação completa de matrizes por célula (Usinagem CNC, Estamparia & Prensas, Montagem & Solda, Geral) com barreiras de acesso departamental.
* **Análise de Gaps & Plano de Treinamento Automatizado:** Detecção de postos vulneráveis, sugestão de tutores internos e prazos estimados com ações configuráveis e exclusão.
* **Design de Alta Densidade:** Layout híbrido inteligente (`max-w-[1920px]`) que exibe dezenas de operadores e máquinas sem necessidade de scroll lateral excessivo.

### 📋 Módulo 2: Gerenciador de Tarefas do Gestor (`manager-tasks`)
* **Pilar 1 - Leader Standard Work (Kamishibai):** Rotina diária de rituais dividida por momentos do turno (Início, Meio e Fim), com Score de Aderência em tempo real (%) e botão de Reset de Turno.
* **Pilar 2 - Priorização Estratégica (Matriz de Eisenhower):** 4 quadrantes (Q1: Fazer Já, Q2: Planejar, Q3: Delegar, Q4: Eliminar) com movimentação com 1 clique.
* **Pilar 3 - Controle de Execução & SLA:** Quadro Kanban com **Drag and Drop nativo**, alertas visuais de SLA (🔴 Atrasada, 🟡 Vence Hoje, 🟢 No Prazo) e checklists de subtarefas com mini barra de progresso.
* **Pilar 4 - Passagem de Turno (Shift Handover):** Modal automatizado que compila entregas, tarefas repassadas e alertas de risco, gerando relatório formatado com 1 clique para WhatsApp/Teams.

### 🎓 Módulo 3: Matriz de Treinamentos de NRs & POPs (`training-matrix`)
* **Conformidade Dual:** Gerenciamento integrado de **Normas Regulamentadoras (SST / MTE)** e **Procedimentos Operacionais Padrão (POPs com controle de versão)**.
* **Gestão Documental Multi-formato:** Acervo para anexar e visualizar evidências em PDF, Word (.docx, .doc), Texto Puro (.txt) e Imagens.
* **Motor de Busca Inteligente Profunda (Deep Search):** OCR/Pesquisa textual que varre o conteúdo interno dos arquivos anexados (ex: buscando `"1000V"`, `"LOTO"`, `"trava-quedas"`), exibindo snippets com o termo destacado em amarelo (`<mark>`).
* **Matriz 2D de Aptidão Legal:** Cruzamento por cargo com sinalização de **Bloqueio Operacional Preventivo** (impede alocação de operador com NR/POP vencido).
* **Convocador de Turmas de Reciclagem:** Agrupamento automático de pendências em <60 dias com gerador de convocação oficial.
* **Dossiê do Colaborador:** Ficha completa consolidada para auditorias do Ministério do Trabalho e normas ISO 9001 / ISO 45001.

### 💡 Módulo 4: Gestor de Kaizen e Melhoria Contínua (`kaizen-manager`)
* Formulário de ideias de chão de fábrica, cálculo de ganhos (Segurança, Qualidade, Custo, Entrega, Moral) e esteira de aprovação.

### 🏛️ Módulo 5: Hub Operacional, Vitrine Pública & Licenciamento
* **Vitrine Comercial Externa:** Apresentação da plataforma e catálogo de ferramentas.
* **Multi-tenant Dinâmico:** Simulador de empresas clientes (CNPJs diferentes), planos (Starter, Pro, Enterprise) e permissões por perfil (SuperAdmin, Admin da Empresa, Membro).
* **Marketplace Interno:** Catálogo onde o cliente visualiza módulos contratados e solicita ativação de novas ferramentas sob demanda.

---

## 4. Perfil do Cliente Ideal (ICP - Ideal Customer Profile)

* **Mercado Primário:** Indústrias Manufatureiras (Metalmecânica, Automotiva/Autopeças, Alimentos & Bebidas, Embalagens, Farmacêutica, Química).
* **Porte Ideal:** Médias empresas (100 a 1.000 funcionários no chão de fábrica) e Unidades de Grandes Grupos Industriais.
* **Quem Assina o Cheque (Decisores Econômicos):**
  * Diretor Industrial / Gerente de Planta (COO / Plant Manager)
  * Gerente de RH & Treinamento / Head de Gente & Gestão
  * Gerente de EHS / Segurança do Trabalho
* **Quem Usa Todo Dia (Usuários Chave & Promotores):**
  * Supervisores de Produção e Líderes de Turno
  * Técnicos de Segurança do Trabalho (TST)
  * Engenheiros de Processos e Especialistas em Lean / Kaizen

---

## 5. Tópicos Prioritários para a Nova Conversa (Marketing & Escala)

Ao iniciar a nova conversa, a inteligência deve atuar como **CMO (Chief Marketing Officer) e Estrategista B2B**, focando em:

1. **Posicionamento & Branding (Storytelling):**
   * Como criar uma marca forte ("Ecossistema Líder") que converse com a linguagem do chão de fábrica sem parecer burocrática.
   * Criação do slogan e mensagens-chave de impacto (ex: *"A fábrica do futuro não roda em planilhas"*).
2. **Estratégia de Precificação (Pricing & Packaging):**
   * Cobrança por módulos individuais (a la carte) vs. pacotes por tamanho de fábrica (até 50 operadores, até 200, ilimitado).
   * Estratégia de Setup / Onboarding consultivo.
3. **Go-To-Market (GTM) & Aquisição de Clientes (CAC Baixo):**
   * Estratégia de Outbound B2B (Mapeamento de Diretores de Fábrica no LinkedIn e abordagem de alto valor).
   * Product-Led Growth (PLG): Criar uma ferramenta gratuita/freemium de entrada (ex: Matriz de Habilidades básica) para gerar leads qualificados.
   * Parcerias estratégicas: Consultorias de Lean Manufacturing e empresas de Medicina do Trabalho.
4. **Métricas de Escala & Retenção (LTV, Churn, Stickiness):**
   * Como tornar o uso dos rituais Kamishibai e da Passagem de Turno um hábito diário inegociável, garantindo churn próximo de zero.
