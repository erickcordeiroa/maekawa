---
name: Portal Murilo K. Maekawa BJJ
description: Painel de gestão da academia (alunos, mensalidades, frequência, financeiro) e telas públicas de matrícula e check-in.
colors:
  tatame-black: "#0E0E0E"
  belt-gold: "#F3C519"
  belt-gold-hover: "#E6B80C"
  belt-gold-soft: "#FFF6D1"
  gold-deep-border: "#8A6F00"
  pending-bg: "#FFF1B8"
  pending-text: "#5A4500"
  alert-red: "#CE1317"
  alert-red-text: "#9E0D10"
  alert-red-soft: "#FCE4E4"
  ground: "#F4F4F2"
  surface: "#FFFFFF"
  line: "#E6E6E6"
  border: "#CFCFCF"
  muted-ink: "#4A4A4A"
  quiet-ink: "#595959"
  on-dark-muted: "#D6D6D6"
typography:
  display:
    fontFamily: "Oswald, sans-serif"
    fontSize: "44px"
    fontWeight: 700
    lineHeight: 1.05
  headline:
    fontFamily: "Oswald, sans-serif"
    fontSize: "34px"
    fontWeight: 600
    lineHeight: 1.1
  title:
    fontFamily: "Oswald, sans-serif"
    fontSize: "20px"
    fontWeight: 600
  kpi-value:
    fontFamily: "Oswald, sans-serif"
    fontSize: "32px"
    fontWeight: 600
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 600
  table-head:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    letterSpacing: "1px"
rounded:
  badge: "6px"
  control: "8px"
  panel: "10px"
  card: "12px"
  modal: "14px"
  pill: "999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-gold:
    backgroundColor: "{colors.belt-gold}"
    textColor: "{colors.tatame-black}"
    rounded: "{rounded.control}"
    height: "44px"
    padding: "0 18px"
  button-gold-hover:
    backgroundColor: "{colors.belt-gold-hover}"
  button-dark:
    backgroundColor: "{colors.tatame-black}"
    textColor: "{colors.belt-gold}"
    rounded: "{rounded.control}"
    height: "44px"
  button-outline:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.tatame-black}"
    rounded: "{rounded.control}"
    height: "44px"
  button-lg:
    height: "54px"
    typography: "{typography.title}"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.tatame-black}"
    rounded: "{rounded.control}"
    height: "46px"
    padding: "0 12px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    padding: "22px"
  card-dark:
    backgroundColor: "{colors.tatame-black}"
    textColor: "{colors.surface}"
    rounded: "{rounded.card}"
    padding: "22px"
  chip-active:
    backgroundColor: "{colors.tatame-black}"
    textColor: "{colors.belt-gold}"
    rounded: "{rounded.pill}"
    height: "40px"
  badge-paid:
    backgroundColor: "{colors.tatame-black}"
    textColor: "{colors.surface}"
    rounded: "{rounded.badge}"
  badge-pending:
    backgroundColor: "{colors.pending-bg}"
    textColor: "{colors.pending-text}"
    rounded: "{rounded.badge}"
  badge-late:
    backgroundColor: "{colors.alert-red-soft}"
    textColor: "{colors.alert-red-text}"
    rounded: "{rounded.badge}"
---

# Design System: Portal Murilo K. Maekawa BJJ

## Overview

**Creative North Star: "O Tatame Preto"**

Preto sólido como o tatame, dourado como a faixa e a medalha, vermelho só quando algo precisa de atenção. O portal é uma ferramenta de balcão para o professor: legível de longe, alvos de toque grandes (mínimo 44px), números grandes em Oswald e nenhum enfeite que não carregue informação.

A superfície de trabalho é um chão claro quente (`ground`) com cartões brancos planos; os blocos de destaque (KPI principal, banner do link de cadastro, cabeçalho do aluno) invertem para o preto com texto dourado. Títulos são sempre em Oswald caixa-alta; o corpo é Inter.

**Key Characteristics:**
- Contraste alto preto/dourado; vermelho reservado para atraso, falta e alerta.
- Plano por padrão: sem sombras em cartões, profundidade por inversão de cor.
- A faixa (belt) é o componente-assinatura e aparece em listas, detalhes e check-in.
- Bordas de destaque grossas em dourado (4–8px) separam marca de conteúdo (sidebar, cabeçalhos públicos).

## Colors

Paleta de três vozes: preto tatame, dourado faixa, vermelho alerta, sobre neutros quentes.

### Primary
- **Dourado Faixa** (belt-gold): ação principal, item ativo do menu, valores de KPI sobre preto, foco de teclado (outline 3px).
- **Preto Tatame** (tatame-black): texto, sidebar, botões escuros, chips ativos, cartões invertidos.

### Secondary
- **Vermelho Alerta** (alert-red / alert-red-text / alert-red-soft): borda de cartão em alerta (2px), botão de falta, badge de atraso, valores negativos.

### Neutral
- **Chão** (ground): fundo das páginas do painel.
- **Linha** (line) e **Borda** (border): divisórias de tabela e contorno de campos/chips.
- **Tinta Suave** (muted-ink / quiet-ink): legendas, subtítulos, metadados.

**The Red Means Late Rule.** Vermelho só aparece para estado negativo (atraso, falta, saída de dinheiro, alunos sumidos). Nunca como decoração.

## Typography

**Display Font:** Oswald (500/600/700), sempre caixa-alta.
**Body Font:** Inter (400–700).

### Hierarchy
- **Display** (700, 44px, 1.05): nome da academia no login.
- **Headline** (600, 34px): título de página do painel.
- **Title** (600, 20–22px): títulos de seção de cartão.
- **KPI** (600, 32px Oswald): números de indicadores.
- **Body** (400, 15–16px): texto e células de tabela.
- **Label** (600, 14px): rótulos de campo; cabeçalho de tabela 12px caixa-alta com 1px de tracking.

**The Oswald Shouts Rule.** Oswald é sempre caixa-alta e só para títulos, números e botões grandes; nunca em parágrafos.

## Layout

App shell em flex: sidebar preta (min 240px, borda direita dourada 4px) + área principal com padding 32px e gap 24px entre blocos. Abaixo de 820px a sidebar vira faixa superior (borda inferior dourada) com navegação em linha que quebra, e o main usa padding 20px 16px. KPIs em grid `auto-fit minmax(190px, 1fr)` com gap 16px. Linhas de cartões usam flex-wrap com proporção 3:2 e gap 24px. Tabelas largas rolam horizontalmente dentro do cartão.

## Elevation & Depth

Plano. Cartões não têm sombra; a hierarquia vem da inversão preto/branco e de bordas. Sombras só em elementos flutuantes: toast (`0 8px 24px rgba(0,0,0,.25)`), menu flutuante e o mock de celular do check-in.

**The Flat Mat Rule.** Nada no fluxo da página flutua. Sombra só para o que sobrepõe a página.

## Shapes

Cantos suaves e consistentes: 6px badge, 8px controle, 10px painel interno, 12px cartão, 14px modal, pílula para chips e contadores. Campos com borda de 1.5px; chip/plano selecionado ganha borda preta de 3px.

## Components

### Buttons
- **Shape:** 8px, altura mínima 44px, peso 700, 15px.
- **Gold:** ação principal (Entrar, Marcar como pago, Salvar). Hover escurece o dourado.
- **Dark:** preto com texto dourado em Oswald caixa-alta (Novo aluno, Salvar chamada, Enviar matrícula).
- **Outline / Ghost:** branco com borda preta / cinza para ações secundárias.
- **Large:** 54px, Oswald 18px com 2px de tracking, largura total.
- **Disabled:** fundo #E6E6E6, texto #595959.

### Chips
- **Style:** pílula 40px, branco com borda 1.5px cinza.
- **State:** selecionado = preto com texto dourado (`aria-pressed`).

### Cards / Containers
- **Corner Style:** 12px, padding 22px, branco ou preto invertido; variante alerta com borda vermelha 2px.

### Inputs / Fields
- **Style:** 46px, borda 1.5px #CFCFCF, raio 8px, fonte 16px.
- **Focus:** outline dourado 3px + borda preta.
- **Error:** mensagem 14px semibold em vermelho-texto abaixo do campo.

### Navigation
- Itens 44px com ícone 20px, branco sobre preto; hover #222; ativo = fundo dourado, texto preto semibold.

### Belt (signature)
Barra de 96×16px na cor da faixa com ponteira preta (vermelha na faixa preta) contendo um traço branco por grau; versão grande 240×34px no detalhe do aluno.

## Do's and Don'ts

### Do:
- **Do** usar dourado para a ação principal de cada tela e preto para a ação de confirmação forte.
- **Do** manter alvos de toque ≥44px e campos de 46px.
- **Do** usar Oswald caixa-alta para títulos e números.

### Don't:
- **Don't** adicionar sombras a cartões no fluxo da página.
- **Don't** usar vermelho fora de estados negativos.
- **Don't** usar gradientes ou texto em gradiente.
