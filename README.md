# Aptis: A fábrica sempre apta. 🏭⚡

> **Prontidão operacional, governança e conformidade para o chão de fábrica.**  
> A plataforma que garante que todo operador, máquina e turno estejam 100% aptos a produzir com segurança e sem paradas de linha.

Repositório Oficial: [https://github.com/danilohenrique120-ops/Aptis](https://github.com/danilohenrique120-ops/Aptis)

---

## 🏛️ Os 4 Pilares da Suíte Aptis

A Aptis foi concebida sob o padrão **Modular Registry Pattern**, onde cada ferramenta atua como um micro-frontend desacoplado:

1. 📋 **Aptis Routine (`src/modules/manager-tasks`)**:
   - Rotina diária de liderança e supervisão operacional.
   - Quadro Kamishibai (rituais de início, meio e fim de turno).
   - Priorização matricial Eisenhower (Urgente vs Importante).
   - Relatório automatizado de Passagem de Turno com exportação instantânea.

2. 🎯 **Aptis Skills (`src/modules/skills-matrix`)**:
   - Matriz de Polivalência e Competências pelo método **ILUO** (Níveis 1 a 4).
   - Diagnóstico automático de gargalos e postos críticos sem backup.
   - Painel de Gestão à Vista para quadro de fábrica e exportação em CSV.

3. 🛡️ **Aptis Compliance (`src/modules/training-matrix`)**:
   - Gestão de Normas Regulamentadoras (NR-10, NR-12, NR-35, etc.) e Procedimentos Operacionais Padrão (POPs).
   - Semáforo preventivo de vencimento com alertas antecipados aos 60 dias.
   - Gestor documental integrado para PDFs e DOCs com **Deep Search (Busca Inteligente no conteúdo de texto)**.
   - Dossiê individual do colaborador pronto para auditorias do MTE e ISO.

4. 💡 **Aptis Kaizen (`src/modules/kaizen-manager`)**:
   - Funil visual de melhorias contínuas do chão de fábrica (Ideação ➡️ Análise ➡️ Implementação ➡️ Padronização).
   - Metodologia A3 Lean e mensuração automática de ROI financeiro (R$/ano) e horas salvas.

---

## 💎 The Aptis Score (Índice de Aptidão da Planta)

Um indicador proprietário calculado em tempo real para a diretoria industrial avaliar a prontidão da fábrica:
- **Aptidão Legal**: % de operadores com NRs e POPs vigentes sem postos interditados.
- **Aptidão Técnica**: % de postos críticos cobertos por operadores autônomos (U ou O).
- **Aptidão de Rotina**: % de rituais Kamishibai e passagens de turno cumpridos dentro do SLA.

---

## 🚀 Como Executar Localmente

```bash
# 1. Instale as dependências (caso ainda não tenha feito)
npm install

# 2. Inicie o servidor Next.js
npm run dev

# 3. Acesse no navegador
http://localhost:3000
```

---

## ☁️ Como Fazer o Deploy na Vercel

1. Acesse [https://vercel.com](https://vercel.com) e conecte sua conta do GitHub.
2. Clique em **"Add New..."** ➡️ **"Project"**.
3. Selecione o repositório **`danilohenrique120-ops/Aptis`**.
4. A Vercel detectará automaticamente o framework **Next.js**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `next build`
   - **Output Directory**: `.next`
5. Clique em **"Deploy"**.
6. Em menos de 1 minuto seu link oficial de produção estará no ar (ex: `https://aptis-suite.vercel.app`)!

---

## 🛡️ Licença & Propriedade

Desenvolvido para excelência operacional e conformidade industrial. Todos os direitos reservados.
