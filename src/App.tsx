import React, { useState, useEffect } from "react";
import jogosData from "./jogos.json";

// ----------------------------------------------------
// TIPAGEM E DADOS ATUALIZADOS
// ----------------------------------------------------

type TimeComPosicao = {
  nome: string;
  posicao: number;
};

type Partida = {
  hora: string;
  times: [TimeComPosicao, TimeComPosicao];
  ultimos: UltimosPorTime;
  campeonato?: string;
  rodada?: number;
  linhas?: { golsPadrao?: number; bttsDisponivel?: boolean };
};

type JogosPorDia = {
  [date: string]: Partida[];
};

// CORREÇÃO: Uso de 'unknown' para resolver o erro de tipagem na importação do JSON.
const jogos: JogosPorDia = (jogosData as unknown) as JogosPorDia;

type HistoricoItem = {
  resultado: string;
  placar: string;
  data: string;
  // opcional: indica se o time jogou em casa ou fora
  local?: "casa" | "fora";
};

type UltimosPorTime = {
  [team: string]: HistoricoItem[];
};

type EscolhaUsuario = {
  dia: string;
  hora: string;
  times: [string, string];
  resultadoFinal?: string;
  duplaChance?: string;
  gols?: string;
};

const mercadosResultadoFinal = ["1", "X", "2"];
const mercadosDuplaChance = ["1X", "12", "X2"];
const golsValores = [0.5, 1.5, 2.5, 3.5];
const mercadosGols = [
  ...golsValores.map((v) => `Mais de ${v}`),
  ...golsValores.map((v) => `Menos de ${v}`),
];

const emojiResultado = (txt: string) =>
  txt === "V" ? "🟩" : txt === "E" ? "🟨" : txt === "D" ? "🟥" : "";

// ----------------------------------------------------
// ESTILOS: LAYOUT APRIMORADO E NOVOS ESTILOS PARA ACCORDION
// ----------------------------------------------------

const styles: { [key: string]: React.CSSProperties } = {
  // Cores Base: #1A1E27 (Fundo Escuro), #282C37 (Cards), #5AD2F6 (Azul Primário), #FFFFFF (Texto)
  app: {
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
    background: "linear-gradient(180deg, #0A0F14 0%, #0F1624 100%)",
    minHeight: "100vh",
    boxSizing: "border-box",
  },
  main: {
    maxWidth: 860,
    margin: "0 auto",
    padding: "28px 20px 88px", // Espaçamento ajustado e extra no bottom para a barra fixa
  },
  // --- HEADER ---
  header: {
    background: "linear-gradient(180deg, #111827 0%, #0D1117 100%)",
    borderRadius: 20,
    padding: "24px",
    margin: "0 0 24px",
    boxShadow: "0 12px 36px rgba(0, 0, 0, 0.45)",
    borderTop: "4px solid #20C6ED",
  },
  h1: {
    fontSize: "2.7rem",
    fontWeight: 900,
    letterSpacing: "0.01em",
    marginBottom: 10,
    backgroundImage: "linear-gradient(90deg, #8A5CF6 0%, #20C6ED 100%)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  pHeader: {
    color: "#D5DCE8",
    fontSize: "1.12rem",
    marginTop: 0,
    fontWeight: 500,
    lineHeight: 1.55,
  },
  pWarning: {
    color: "#F6E0A6", // Amarelo/verde suave para avisos
    fontSize: "0.98rem",
    marginTop: 15,
    fontWeight: 600,
    lineHeight: 1.45,
    borderLeft: "3px solid #F6E0A6",
    paddingLeft: 10,
    backgroundColor: "rgba(246, 224, 166, 0.05)",
    padding: "10px 12px",
    borderRadius: 8
  },
  // --- CARD DE JOGO (BASE) ---
  sectionTitle: {
    color: "#E1E7F1",
    fontWeight: 800,
    fontSize: "1.35rem",
    borderBottom: "2px solid #32394B",
    marginBottom: 22,
    marginTop: 34,
    paddingBottom: 10,
    letterSpacing: "0.02em",
    textTransform: "uppercase",
  },
  card: {
    background: "#121826",
    borderRadius: 18,
    boxShadow: "0 6px 18px rgba(0, 0, 0, 0.4)",
    marginBottom: 22,
    color: "#F1F4FA",
    border: "1px solid #3B4357",
    overflow: "hidden",
  },
  // --- HEADER DO CARD (CLICKABLE) ---
  cardHeader: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    columnGap: 12,
    alignItems: "center",
    padding: 16,
    fontWeight: 900,
    fontSize: "1.18rem",
    color: "#F3F6FC",
    cursor: "pointer",
    background: "linear-gradient(180deg, #151B28 0%, #0F1624 100%)",
    transition: "background 0.2s",
    borderBottom: "1px solid #374055",
    position: "relative" as const,
  },
  // Header reestruturado para evitar cortes no mobile
  headerLeft: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 8,
    minWidth: 0,
    flex: "1 1 auto",
  },
  timeRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  // Barra de placar no topo do card (completamente nova)
  scoreBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "linear-gradient(90deg, #FF3CAC 0%, #784BA0 50%, #2B86C5 100%)",
    padding: "8px 12px",
    borderRadius: 12,
    color: "#0B0F15",
    border: "1px solid rgba(255,255,255,0.06)",
    boxShadow: "0 6px 16px rgba(120, 75, 160, 0.35)",
  },
  scoreTime: {
    background: "rgba(255,255,255,0.9)",
    color: "#0B0F15",
    borderRadius: 10,
    padding: "6px 10px",
    fontWeight: 900,
    minWidth: 64,
    textAlign: "center" as const,
  },
  scoreRight: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap" as const,
  },
  scoreMeta: {
    color: "#F1F4FA",
    fontSize: ".84rem",
    fontWeight: 800,
  },
  scoreChip: {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 8px",
    fontSize: ".74rem",
    fontWeight: 800,
    border: "1px solid rgba(255,255,255,0.18)",
    color: "#F1F4FA",
    background: "rgba(11,15,21,0.35)",
    borderRadius: 999,
  },
  tagsRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap" as const,
  },
  tagPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "4px 10px",
    fontSize: ".78rem",
    fontWeight: 800,
    color: "#9FDDF2",
    background: "rgba(32,198,237,0.12)",
    border: "1px solid #2F3648",
    borderRadius: 999,
  },
  metaInfo: {
    color: "#C7D0E0",
    fontSize: ".86rem",
    fontWeight: 700,
  },
  teamsRow: {
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
    gap: 18,
    flexWrap: "wrap" as const,
  },
  teamsArena: {
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
    gap: 16,
    paddingTop: 8,
  },
  teamBox: {
    display: "grid",
    gridTemplateColumns: "auto",
    alignItems: "center",
    gap: 8,
  },
  teamBoxLeft: {
    display: "grid",
    gridTemplateColumns: "auto",
    alignItems: "center",
    gap: 8,
    justifySelf: "end" as const,
  },
  teamBoxRight: {
    display: "grid",
    gridTemplateColumns: "auto",
    alignItems: "center",
    gap: 8,
    justifySelf: "start" as const,
  },
  teamBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    background: "linear-gradient(135deg, #1F2433 0%, #2A3142 100%)",
    border: "1px solid #2F3648",
    color: "#E1E7F1",
    fontWeight: 900,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 10px rgba(0,0,0,0.35)",
    fontSize: "0.95rem",
  },
  teamName: {
    fontSize: "1.1rem",
    fontWeight: 900,
    color: "#E1E7F1",
    lineHeight: 1.2,
    display: "flex",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap" as const,
  },
  teamFlag: {
    fontSize: "0.8rem",
    color: "#ecff9eff",
  },
  vsDivider: {
    fontWeight: 900,
    fontSize: "0.88rem",
    color: "#0B0F15",
    background: "linear-gradient(90deg, #FF3CAC 0%, #784BA0 100%)",
    padding: "4px 8px",
    borderRadius: 999,
    boxShadow: "0 6px 16px rgba(120,75,160,0.35)",
    border: "1px solid rgba(10, 15, 20, 0.3)",
    margin: "0 8px",
  },
  pillTime: {
    background: "#2A3142",
    color: "#E1E7F1",
    borderRadius: 10,
    padding: "6px 10px",
    fontWeight: 900,
    minWidth: 64,
    textAlign: "center" as const,
    boxShadow: "0 0 0 1px #3B4357, 0 6px 16px rgba(32, 198, 237, 0.25)",
  },
  teamDisplay: {
    display: "flex",
    flexDirection: "column" as const,
    textAlign: "center" as const,
    lineHeight: 1.18,
    fontSize: "1.32rem",
    fontWeight: 900,
    letterSpacing: "0.01em",
    minWidth: 0,
    maxWidth: "45%",
    wordBreak: "break-word" as const,
    overflowWrap: "break-word" as const,
    hyphens: "auto" as const,
  },
  teamPosicaoPill: {
    display: "inline-block",
    fontSize: "0.72rem",
    fontWeight: 800,
    color: "#C9D2E3",
    background: "#2A3142",
    border: "1px solid #3B4357",
    borderRadius: 999,
    padding: "2px 6px",
    marginTop: 0,
    marginLeft: 6,
  },
  vsPill: {
    color: "#071018",
    background: "linear-gradient(90deg, #20C6ED 0%, #159BD1 100%)",
    border: "1px solid rgba(15, 18, 27, 0.6)",
    borderRadius: 999,
    fontWeight: 900,
    fontSize: "0.98rem",
    letterSpacing: 1.1,
    padding: "8px 14px",
    margin: "0 6px",
    boxShadow: "0 8px 18px rgba(32, 198, 237, 0.30)",
  },
  iconeAccordion: {
    fontSize: "clamp(1.2rem, 3.2vw, 1.5rem)",
    color: "#5AD2F6",
    transition: "transform 0.3s ease",
    alignSelf: "center" as const,
    justifySelf: "end" as const,
    flexShrink: 0 as const,
  },
  // --- CORPO DO CARD (EXPANSÍVEL) ---
  cardBody: {
    padding: "0 16px",
    maxHeight: 0,
    overflow: "hidden",
    transition: "max-height 0.4s ease-in-out", // Transição para accordion
  },
  cardBodyAberto: {
    maxHeight: "none",
    overflow: "visible",
    padding: "16px",
  },
  // --- FORMULÁRIO E CONTROLES (Dentro do Body) ---
  selectGroup: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "14px",
    margin: "8px 0 16px 0",
  },
  // Novo estilo para a label container, garantindo que ocupe o espaço corretamente
  selectWrapper: {
    flexGrow: 1,
    flexShrink: 1,
    width: '100%',
    marginBottom: 12,
  },
  selectLabelText: {
    fontWeight: 700,
    fontSize: "1.02rem",
    color: "#CED6E4",
    display: "block",
    marginBottom: 8,
  },
  select: {
    padding: "10px 12px",
    borderRadius: "12px",
    border: "1px solid #3B4357",
    background: "#1A2130",
    color: "#FFFFFF",
    fontWeight: 600,
    fontSize: "1.02rem",
    minHeight: 42,
    cursor: "pointer",
    width: '100%',
    // CORREÇÃO MOBILE: Remove estilos padrões do navegador
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    appearance: 'none',
  },
  selectHelp: {
    color: "#A9B6C9",
    display: "block",
    fontSize: ".86rem",
    marginTop: 8,
  },
  // --- HISTÓRICO (Dentro do Body) ---
  historicoContainer: {
    display: "flex",
    gap: "12px",
    marginTop: 12,
    flexWrap: "wrap" as const,
  },
  historicoTime: {
    flex: "1 1 240px",
    minWidth: 220,
    marginBottom: 12,
  },
  ultimosTitle: {
    margin: "0 0 6px 0",
    color: "#A0A7B9",
    fontWeight: 800,
    fontSize: "0.92rem",
    textTransform: "uppercase",
  },
  ultimosList: {
    paddingLeft: 0,
    margin: 0,
    maxHeight: 160,
    overflowY: "auto",
    color: "#C4C8D2",
    fontSize: "0.86rem",
    listStyleType: "none",
  },
  ultimosListItem: {
    marginBottom: 4,
    display: "flex",
    alignItems: "center",
    gap: 6,
    lineHeight: 1.25,
    flexWrap: "wrap" as const,
  },
  historicoScore: {
    fontWeight: 900,
    color: "#E1E7F1",
  },
  historicoOpp: {
    color: "#C7D0E0",
    fontWeight: 800,
  },
  historicoLocalPill: {
    display: "inline-flex",
    alignItems: "center",
    padding: "2px 8px",
    borderRadius: 999,
    fontSize: ".74rem",
    fontWeight: 800,
    border: "1px solid #3B4357",
    background: "#2A3142",
    color: "#C9D2E3",
  },
  // Cores dos Emojis para contraste
  emojiV: { color: "#4CAF50", fontWeight: 700, minWidth: 20, display: "inline-block" },
  emojiE: { color: "#FFC107", fontWeight: 700, minWidth: 20, display: "inline-block" },
  emojiD: { color: "#F44336", fontWeight: 700, minWidth: 20, display: "inline-block" },
  sectionDivider: {
    height: 1,
    background: "#2F3648",
    margin: "16px 0 14px",
    opacity: 0.8,
  },
  // --- OUTROS ---
  inputNome: {
    width: "100%",
    padding: "12px 14px",
    marginBottom: "20px",
    borderRadius: "12px",
    border: "1px solid #3B4357",
    fontSize: "1.06rem",
    fontWeight: 600,
    background: "#242B3A",
    color: "#FFFFFF",
    boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.35)"
  },
  button: {
    padding: "16px 35px",
    borderRadius: "14px",
    border: "none",
    background: "linear-gradient(90deg, #20C6ED 0%, #159BD1 100%)",
    color: "#0F1218",
    cursor: "pointer",
    fontWeight: 900,
    fontSize: "1.2rem",
    boxShadow: "0px 10px 28px rgba(32, 198, 237, 0.35)",
    margin: "40px 0 25px 0",
    letterSpacing: "0.03em",
    transition: "all 0.3s ease",
  },
  expandControls: {
    display: "flex",
    justifyContent: "center",
    margin: "-8px 0 18px 0",
  },
  expandButton: {
    padding: "8px 14px",
    borderRadius: 12,
    border: "1px solid #32394B",
    background: "#2A3142",
    color: "#E1E7F1",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: "0.96rem",
  },
  stickyBar: {
    position: "fixed" as const,
    bottom: 0,
    left: 0,
    right: 0,
    background: "rgba(17, 24, 39, 0.75)",
    borderTop: "1px solid #2F3648",
    padding: 12,
    zIndex: 1000,
    backdropFilter: "saturate(220%) blur(12px)",
    WebkitBackdropFilter: "saturate(220%) blur(12px)",
  },
  stickyInner: {
    maxWidth: 860,
    margin: "0 auto",
    display: "flex",
    justifyContent: "center",
    padding: "0 16px",
    width: "100%",
  },
  stickyButton: {
    padding: "12px 20px",
    borderRadius: 14,
    border: "none",
    background: "linear-gradient(90deg, #20C6ED 0%, #159BD1 100%)",
    color: "#0F1218",
    cursor: "pointer",
    fontWeight: 900,
    fontSize: "1.06rem",
    boxShadow: "0px 10px 28px rgba(32, 198, 237, 0.35)",
    letterSpacing: "0.03em",
    width: "100%",
    maxWidth: 560,
  },
  formFeedback: {
    background: "#4CAF50",
    color: "#fff",
    borderRadius: 9,
    padding: "18px",
    margin: "0 0 35px 0",
    fontWeight: 700,
    fontSize: "1.1rem",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.4)",
    textAlign: "center" as const,
  },
  formError: {
    background: "#F44336",
    color: "#fff",
    borderRadius: 9,
    padding: "18px",
    margin: "0 0 35px 0",
    fontWeight: 700,
    fontSize: "1.1rem",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.4)",
    textAlign: "center" as const,
  },
  meusPalpites: {
    background: "#282C37",
    borderRadius: 12,
    padding: "20px",
    marginTop: 25,
    color: "#E1E7F1",
    borderLeft: "5px solid #5AD2F6",
  },
  meusPalpitesTitle: {
    color: "#5AD2F6",
    fontSize: "1.2rem",
    marginBottom: 15,
    paddingBottom: 5,
    borderBottom: "1px dashed #3A404F",
  },
  meusPalpitesList: {
    paddingLeft: 20,
    fontSize: "1rem",
    margin: 0,
    listStyleType: "disc",
  },
  meusPalpitesListItem: {
    marginBottom: 10,
    lineHeight: 1.4
  },
  // --- LAYOUT GERAL COM SIDEBAR ---
  layoutGrid: {
    display: "flex",
    gap: 24,
    alignItems: "flex-start",
    flexWrap: "wrap" as const,
  },
  controlsPanel: {
    flex: "1 1 300px",
    minWidth: 0,
  },
  nomeBox: {
    margin: "12px 0 22px",
  },
  contentPanel: {
    flex: "1 1 500px",
    minWidth: 0,
  },
  footer: {
    marginTop: 40,
    textAlign: "center" as const,
    color: "#6C7383",
    fontWeight: 500,
    fontSize: "0.9rem",
  },
  pageFooter: {
    marginTop: 40,
    textAlign: "center" as const,
    color: "#6C7383",
    fontWeight: 500,
    fontSize: "0.9rem",
  },
};

// Tipagem auxiliar para os estilos e função de responsividade
type Styles = typeof styles;

const makeResponsiveStyles = (width: number): Styles => {
  const s: Styles = {
    ...styles,
    header: { ...styles.header },
    h1: { ...styles.h1 },
    pHeader: { ...styles.pHeader },
    pWarning: { ...styles.pWarning },
    inputNome: { ...styles.inputNome },
    expandControls: { ...styles.expandControls },
    expandButton: { ...styles.expandButton },
    card: { ...styles.card },
    cardHeader: { ...styles.cardHeader },
    headerLeft: { ...styles.headerLeft },
    scoreBar: { ...styles.scoreBar },
    scoreTime: { ...styles.scoreTime },
    scoreRight: { ...styles.scoreRight },
    scoreMeta: { ...styles.scoreMeta },
    scoreChip: { ...styles.scoreChip },
    teamsArena: { ...styles.teamsArena },
    teamBox: { ...styles.teamBox },
    teamBadge: { ...styles.teamBadge },
    teamName: { ...styles.teamName },
    teamPosicaoPill: { ...styles.teamPosicaoPill },
    vsDivider: { ...styles.vsDivider },
    iconeAccordion: { ...styles.iconeAccordion },
    cardBody: { ...styles.cardBody },
    cardBodyAberto: { ...styles.cardBodyAberto },
    selectGroup: { ...styles.selectGroup },
    selectWrapper: { ...styles.selectWrapper },
    selectLabelText: { ...styles.selectLabelText },
    select: { ...styles.select },
    selectHelp: { ...styles.selectHelp },
    sectionDivider: { ...styles.sectionDivider },
    historicoContainer: { ...styles.historicoContainer },
    historicoTime: { ...styles.historicoTime },
    ultimosTitle: { ...styles.ultimosTitle },
    ultimosList: { ...styles.ultimosList },
    ultimosListItem: { ...styles.ultimosListItem },
    layoutGrid: { ...styles.layoutGrid },
    controlsPanel: { ...styles.controlsPanel },
    contentPanel: { ...styles.contentPanel },
  };
  // Remove coluna fixa do badge; manter apenas nome/posição
  s.teamBox.gridTemplateColumns = "auto";

  // Tipografia e espaçamentos fluídos para topo/Atenção
  s.header.padding = "clamp(12px, 3.5vw, 22px)";
  s.h1.fontSize = "clamp(1.7rem, 4vw, 2.3rem)";
  s.pHeader.fontSize = "clamp(0.95rem, 2.2vw, 1.05rem)";
  s.pWarning.fontSize = "clamp(0.9rem, 2.2vw, 1rem)";
  (s.pWarning as any).maxWidth = "100%";
  (s.pWarning as any).whiteSpace = "normal";
  (s.pWarning as any).overflowWrap = "break-word";
  (s.pWarning as any).hyphens = "auto";
  // Inputs e selects sempre fluidos
  s.inputNome.width = "100%";
  (s.inputNome as any).minWidth = 0;
  s.select.width = "100%";
  (s.select as any).minWidth = 0;
  (s.headerLeft as any).minWidth = 0;
  // Cabeçalho em grid garante seta ancorada à direita
  s.cardHeader.display = "grid" as const;
  (s.cardHeader as any).gridTemplateColumns = "1fr auto";
  s.cardHeader.alignItems = "center" as const;
  s.iconeAccordion.position = "static" as const;
  (s.iconeAccordion as any).alignSelf = "center";
  (s.iconeAccordion as any).justifySelf = "end";
  (s.iconeAccordion as any).flexShrink = 0;

  if (width <= 380) {
    s.header.padding = "16px";
    s.h1.fontSize = "1.8rem";
    s.pHeader.fontSize = "0.95rem";
    s.pWarning.fontSize = "0.88rem";
    s.pWarning.padding = "8px 10px";
    s.expandButton.fontSize = "0.9rem";
    s.inputNome.padding = "10px 12px";
    s.cardHeader.padding = "10px 12px";
    s.cardHeader.flexDirection = "column" as const;
    s.cardHeader.alignItems = "stretch" as const;
    (s.cardHeader as any).gap = 10;
    s.scoreBar.padding = "6px 8px";
    (s.scoreBar as any).flexWrap = "wrap";
    (s.scoreBar as any).gap = 8;
    (s.scoreRight as any).width = "100%";
    s.teamBadge.width = 28;
    s.teamBadge.height = 28;
    s.teamName.fontSize = "0.95rem";
    s.teamBox.gap = 8;
    s.teamBox.gridTemplateColumns = "auto";
    (s.vsDivider as any).width = "auto";
    s.vsDivider.fontSize = "0.9rem";
    (s.vsDivider as any).margin = "8px 8px";
    s.teamsArena.gap = 8;
    s.teamsArena.gridTemplateColumns = "1fr";
    (s.teamsArena as any).justifyItems = "center";
    s.selectGroup.gridTemplateColumns = "repeat(auto-fit, minmax(140px, 1fr))";
    s.selectLabelText.fontSize = "0.9rem";
    s.select.minHeight = 34;
    s.selectHelp.marginTop = 10;
    s.historicoTime.minWidth = 200;
    s.historicoTime.flex = "1 1 200px";
    s.ultimosList.maxHeight = 140;
  } else if (width <= 480) {
    s.header.padding = "18px";
    s.h1.fontSize = "clamp(1.6rem, 5.2vw, 2rem)";
    s.pHeader.fontSize = "clamp(0.9rem, 3.5vw, 1rem)";
    s.pWarning.fontSize = "clamp(0.86rem, 3.4vw, 0.98rem)";
    s.pWarning.padding = "9px 11px";
    s.selectGroup.gridTemplateColumns = "repeat(auto-fit, minmax(160px, 1fr))";
    s.teamBox.gap = 10;
    s.teamBox.gridTemplateColumns = "auto";
    s.teamsArena.gap = 10;
    s.teamsArena.gridTemplateColumns = "1fr";
    (s.teamsArena as any).justifyItems = "center";
    (s.cardHeader as any).gap = 12;
    (s.scoreBar as any).flexWrap = "wrap";
    (s.scoreBar as any).gap = 8;
    (s.scoreRight as any).width = "100%";
    s.expandButton.width = "100%";
    s.teamBadge.width = 32;
    s.teamBadge.height = 32;
    s.teamName.fontSize = "1rem";
    (s.vsDivider as any).width = "auto";
    (s.vsDivider as any).margin = "10px 8px";
    // Empilhar layout topo
    (s.layoutGrid as any).flexDirection = "column";
    s.controlsPanel.flex = "1 1 100%";
    (s.controlsPanel as any).minWidth = "auto";
    s.contentPanel.flex = "1 1 100%";
    (s.contentPanel as any).minWidth = "auto";
  } else if (width <= 768) {
    s.selectGroup.gridTemplateColumns = "repeat(auto-fit, minmax(180px, 1fr))";
    // Em tablets, permitir quebra suave do header
    (s.cardHeader as any).gap = 10;
    (s.scoreBar as any).flexWrap = "wrap";
    (s.layoutGrid as any).flexDirection = "column";
    s.controlsPanel.flex = "1 1 100%";
    (s.controlsPanel as any).minWidth = "auto";
    s.contentPanel.flex = "1 1 100%";
    (s.contentPanel as any).minWidth = "auto";
  }

  return s;
};

// Utilitário: formata datas ISO (ex.: 2025-11-08) para pt-BR
const formatarDataPt = (iso: string, curto = false): string => {
  try {
    // Trata 'YYYY-MM-DD' como data local para evitar deslocamento por timezone
    const m = iso.match(/^\s*(\d{4})-(\d{2})-(\d{2})\s*$/);
    let d: Date;
    if (m) {
      const year = parseInt(m[1], 10);
      const month = parseInt(m[2], 10) - 1; // 0-based
      const day = parseInt(m[3], 10);
      d = new Date(year, month, day);
    } else {
      d = new Date(iso);
    }
    if (isNaN(d.getTime())) return iso;
    const opts: Intl.DateTimeFormatOptions = curto
      ? { day: '2-digit', month: '2-digit' }
      : { day: '2-digit', month: '2-digit', year: 'numeric' };
    return d.toLocaleDateString('pt-BR', opts);
  } catch {
    return iso;
  }
};

// Extrai gols e adversário de uma string "NxM Adversário"
const parsePlacarItem = (placar: string): { golsPro: number; golsContra: number; adversario: string } => {
  const m = placar.match(/^\s*(\d+)\s*x\s*(\d+)\s+(.+?)\s*$/i);
  if (!m) {
    return { golsPro: NaN, golsContra: NaN, adversario: placar };
  }
  return { golsPro: parseInt(m[1], 10), golsContra: parseInt(m[2], 10), adversario: m[3] };
};

// Parse de data no formato 'dd/MM' assumindo um ano fornecido
const parseDdMm = (txt: string, year: number): Date | null => {
  const m = txt.match(/^\s*(\d{2})\/(\d{2})\s*$/);
  if (!m) return null;
  const day = parseInt(m[1], 10);
  const month = parseInt(m[2], 10) - 1;
  const d = new Date(year, month, day);
  return isNaN(d.getTime()) ? null : d;
};

// Obtém a data mais recente (dd/MM) de uma lista de históricos usando o ano da partida
const obterDataMaisRecente = (lst: HistoricoItem[] = [], year: number): string | null => {
  let best: { d: Date; txt: string } | null = null;
  for (const item of lst) {
    const d = parseDdMm(item.data, year);
    if (!d) continue;
    if (!best || d > best.d) {
      best = { d, txt: item.data };
    }
  }
  return best ? best.txt : null;
};

// ----------------------------------------------------
// COMPONENTE CARD JOGO (Accordion)
// ----------------------------------------------------

interface CardJogoProps {
  jogo: Partida;
  dia: string;
  jogoKey: string;
  formData: { [key: string]: EscolhaUsuario };
  handleChange: (
    dia: string,
    hora: string,
    times: [string, string],
    campo: keyof EscolhaUsuario,
    valor: string
  ) => void;
  isAberto: boolean;
  toggleAccordion: () => void;
  styles: Styles;
}

const CardJogo: React.FC<CardJogoProps> = ({
  jogo,
  dia,
  jogoKey,
  formData,
  handleChange,
  isAberto,
  toggleAccordion,
  styles,
}) => {
  const times: [string, string] = [jogo.times[0].nome, jogo.times[1].nome];
  const ultimos: UltimosPorTime = jogo.ultimos || {};

  const palpiteAtual = formData[jogoKey];
  const anoPartida = new Date(dia).getFullYear();
  const atualizadoAteT1 = obterDataMaisRecente(ultimos[times[0]] || [], anoPartida);
  const atualizadoAteT2 = obterDataMaisRecente(ultimos[times[1]] || [], anoPartida);

  const getEmojiStyle = (resultado: string): React.CSSProperties => {
    if (resultado === "V") return styles.emojiV;
    if (resultado === "E") return styles.emojiE;
    return styles.emojiD;
  };

  return (
    <div style={styles.card}>
      {/* HEADER DO CARD (CLICKABLE) */}
      <div style={styles.cardHeader} onClick={toggleAccordion}>
        {/* Novo header: barra de placar + arena de times */}
        <div style={styles.headerLeft}>
          <div style={styles.scoreBar}>
            <span style={styles.scoreTime}>{jogo.hora}</span>
            <div style={styles.scoreRight}>
              {(jogo.campeonato || typeof jogo.rodada === "number") && (
                <span style={styles.scoreMeta}>
                  {jogo.campeonato ? jogo.campeonato : ""}
                  {jogo.campeonato && typeof jogo.rodada === "number" ? " • " : ""}
                  {typeof jogo.rodada === "number" ? `Rodada ${jogo.rodada}` : ""}
                </span>
              )}
              {/* Chips de sugestão removidos (Linha/BTTS) conforme solicitado */}
            </div>
          </div>
          <div style={styles.teamsArena}>
            <div style={styles.teamBoxLeft}>
              <div style={styles.teamName}>
                <span style={styles.teamFlag}>Casa</span> {jogo.times[0].nome}
                <span style={styles.teamPosicaoPill}>{jogo.times[0].posicao}º</span>
              </div>
            </div>
            <span style={styles.vsDivider}>VS</span>
            <div style={styles.teamBoxRight}>
              <div style={styles.teamName}>
                <span style={styles.teamFlag}>Visitante</span>{jogo.times[1].nome}
                <span style={styles.teamPosicaoPill}>{jogo.times[1].posicao}º</span>
              </div>
            </div>
          </div>
        </div>
        {/* Ícone do Accordion à direita */}
        <span
          style={{
            ...styles.iconeAccordion,
            transform: isAberto ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          ▼
        </span>
      </div>

      {/* CORPO DO CARD (EXPANSÍVEL) */}
      <div
        style={isAberto ? styles.cardBodyAberto : styles.cardBody}
      >
        <div style={styles.selectGroup}>
          {/* Resultado Final */}
          <label htmlFor={`rf-${jogoKey}`} style={styles.selectWrapper}>
            <span style={styles.selectLabelText}>Resultado (1/X/2):</span>
            <select
              id={`rf-${jogoKey}`}
              style={styles.select}
              name={`rf-${jogoKey}`}
              value={palpiteAtual?.resultadoFinal || ""}
              onChange={(e) =>
                handleChange(
                  dia,
                  jogo.hora,
                  times as [string, string],
                  "resultadoFinal",
                  e.target.value
                )
              }
              // Desabilita se Dupla Chance tiver sido preenchida
              disabled={!!palpiteAtual?.duplaChance && palpiteAtual.duplaChance !== ""}
            >
              <option value=""></option>
              {mercadosResultadoFinal.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <small style={styles.selectHelp}>Escolha 1 (mandante), X (empate) ou 2 (visitante).</small>
          </label>

          {/* Dupla Chance */}
          <label htmlFor={`dc-${jogoKey}`} style={styles.selectWrapper}>
            <span style={styles.selectLabelText}>Dupla Chance:</span>
            <select
              id={`dc-${jogoKey}`}
              style={styles.select}
              name={`dc-${jogoKey}`}
              value={palpiteAtual?.duplaChance || ""}
              onChange={(e) =>
                handleChange(
                  dia,
                  jogo.hora,
                  times as [string, string],
                  "duplaChance",
                  e.target.value
                )
              }
              // Desabilita se Resultado Final tiver sido preenchido
              disabled={!!palpiteAtual?.resultadoFinal && palpiteAtual.resultadoFinal !== ""}
            >
              <option value=""></option>
              {mercadosDuplaChance.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <small style={styles.selectHelp}>Escolha a dupla chance.</small>
          </label>

          {/* Gols */}
          <label htmlFor={`gols-${jogoKey}`} style={styles.selectWrapper}>
            <span style={styles.selectLabelText}>Gols (Acima/Abaixo):</span>
            <select
              id={`gols-${jogoKey}`}
              style={styles.select}
              name={`gols-${jogoKey}`}
              value={palpiteAtual?.gols || ""}
              onChange={(e) =>
                handleChange(
                  dia,
                  jogo.hora,
                  times as [string, string],
                  "gols",
                  e.target.value
                )
              }
            >
              <option value=""></option>
              {mercadosGols.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <small style={styles.selectHelp}>Selecione a linha de gols.</small>
          </label>
        </div>

        {/* Histórico */}
        {/* O container historicoTime agora tem minWidth: 100% e marginBottom para empilhar */}
        <div style={styles.sectionDivider} />
        <div style={styles.historicoContainer}>
          {/* Histórico Time 1 */}
          <div style={styles.historicoTime}>
            <h3 style={styles.ultimosTitle}>
              {jogo.times[0].nome} ({jogo.times[0].posicao}º) Últimos Jogos{atualizadoAteT1 ? ` (até ${atualizadoAteT1})` : ''}:
            </h3>
            <ul style={styles.ultimosList}>
              {(ultimos[times[0]] || []).map((item, i) => (
                <li key={i} style={styles.ultimosListItem}>
                  <span style={getEmojiStyle(item.resultado)}>
                    {emojiResultado(item.resultado)}
                  </span>
                  <span style={{ minWidth: 50 }}>{formatarDataPt(item.data, true)}</span>
                  {(() => {
                    const p = parsePlacarItem(item.placar);
                    const isFora = item.local === "fora";
                    const marcador = isFora ? "@" : "vs";
                    return (
                      <>
                        {item.local && (
                          <span style={styles.historicoLocalPill}>{isFora ? "Fora" : "Casa"}</span>
                        )}
                        <span style={styles.historicoOpp}>
                          {marcador} {p.adversario}
                        </span>
                        <span style={styles.historicoScore}>
                          {Number.isNaN(p.golsPro) || Number.isNaN(p.golsContra)
                            ? item.placar
                            : `${p.golsPro}–${p.golsContra}`}
                        </span>
                      </>
                    );
                  })()}
                </li>
              ))}
              {(ultimos[times[0]] || []).length === 0 && (
                <li style={{ color: "#6C7383" }}>Sem dados recentes.</li>
              )}
            </ul>
          </div>

          {/* Histórico Time 2 */}
          <div style={styles.historicoTime}>
            <h3 style={styles.ultimosTitle}>
              {jogo.times[1].nome} ({jogo.times[1].posicao}º) Últimos Jogos{atualizadoAteT2 ? ` (até ${atualizadoAteT2})` : ''}:
            </h3>
            <ul style={styles.ultimosList}>
              {(ultimos[times[1]] || []).map((item, i) => (
                <li key={i} style={styles.ultimosListItem}>
                  <span style={getEmojiStyle(item.resultado)}>
                    {emojiResultado(item.resultado)}
                  </span>
                  <span style={{ minWidth: 50 }}>{formatarDataPt(item.data, true)}</span>
                  {(() => {
                    const p = parsePlacarItem(item.placar);
                    const isFora = item.local === "fora";
                    const marcador = isFora ? "@" : "vs";
                    return (
                      <>
                        {item.local && (
                          <span style={styles.historicoLocalPill}>{isFora ? "Fora" : "Casa"}</span>
                        )}
                        <span style={styles.historicoOpp}>
                          {marcador} {p.adversario}
                        </span>
                        <span style={styles.historicoScore}>
                          {Number.isNaN(p.golsPro) || Number.isNaN(p.golsContra)
                            ? item.placar
                            : `${p.golsPro}–${p.golsContra}`}
                        </span>
                      </>
                    );
                  })()}
                </li>
              ))}
              {(ultimos[times[1]] || []).length === 0 && (
                <li style={{ color: "#6C7383" }}>Sem dados recentes.</li>
              )}
            </ul>
          </div>
        </div>

        {/* A tag hidden foi removida e a lógica de envio será tratada no handleSubmit do componente App */}
      </div>
    </div>
  );
};

// ----------------------------------------------------
// COMPONENTE PRINCIPAL
// ----------------------------------------------------

export default function App() {
  const [formData, setFormData] = useState<{ [key: string]: EscolhaUsuario }>({});
  const [statusEnvio, setStatusEnvio] = useState<"ocioso" | "enviando" | "sucesso" | "erro">("ocioso");
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [abertoKey, setAbertoKey] = useState<string | null>(null);
  const [todosAbertos, setTodosAbertos] = useState<boolean>(false);
  const [viewportWidth, setViewportWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const rstyles = makeResponsiveStyles(viewportWidth);

  const FORM_ENDPOINT = "https://formspree.io/f/xanllngo"; // Substitua pelo seu endpoint Formspree

  const toggleAccordion = (key: string) => {
    setAbertoKey(key === abertoKey ? null : key);
  };

  const toggleTodos = () => {
    setTodosAbertos((prev) => !prev);
    // Quando abrir todos, limpar seleção individual para não conflitar visualmente
    if (!todosAbertos) setAbertoKey(null);
  };

  const handleChange = (
    dia: string,
    hora: string,
    times: [string, string],
    campo: keyof EscolhaUsuario,
    valor: string
  ) => {
    const key = `${dia}-${hora}-${times[0]}-${times[1]}`;

    setFormData((prev) => {
      let novoPalpite = {
        ...(prev[key] || { dia, hora, times }),
        [campo]: valor,
      };

      // Lógica para garantir que só Resultado Final OU Dupla Chance seja escolhido
      if (campo === "resultadoFinal" && valor) {
        if (prev[key]?.duplaChance) {
          console.warn("Você escolheu Resultado Final. Limpando Dupla Chance.");
          delete novoPalpite.duplaChance;
        }
      }
      if (campo === "duplaChance" && valor) {
        if (prev[key]?.resultadoFinal) {
          console.warn("Você escolheu Dupla Chance. Limpando Resultado Final.");
          delete novoPalpite.resultadoFinal;
        }
      }

      // Limpa o campo se o valor for vazio (--Escolha--)
      if (!valor) {
        delete novoPalpite[campo];
      }

      return {
        ...prev,
        [key]: novoPalpite,
      };
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (statusEnvio === "enviando") return;

    if (!nomeUsuario.trim()) {
      setStatusEnvio("erro");
      // Em um ambiente real, você usaria um modal/toast personalizado em vez de console.error
      console.error("ERRO: Por favor, informe seu primeiro nome antes de enviar.");
      return;
    }

    setStatusEnvio("enviando");

    const data = new FormData();
    data.append("Nome do Apostador", nomeUsuario.trim());
    
    // Processa os palpites e cria campos legíveis
    let palpiteCounter = 1;
    let palpitesEnviados = false;

    Object.entries(formData).forEach(([key, e]) => {
      // Verifica se houve alguma aposta para este jogo
      if (e.resultadoFinal || e.duplaChance || e.gols) {
        palpitesEnviados = true;
        
        const nomeJogo = `${e.dia} | ${e.hora} | ${e.times[0]} vs ${e.times[1]}`;
        const nomeCampo = `Palpite ${palpiteCounter}. ${nomeJogo}`;
        
        let valorCampo = "";
        
        if (e.resultadoFinal) {
          valorCampo += `Resultado: ${e.resultadoFinal}`;
        } else if (e.duplaChance) {
          valorCampo += `Dupla Chance: ${e.duplaChance}`;
        }
        
        if (e.gols) {
          if (valorCampo) valorCampo += " / ";
          valorCampo += `Gols: ${e.gols}`;
        }
        
        data.append(nomeCampo, valorCampo);
        palpiteCounter++;
      }
    });

    if (!palpitesEnviados) {
        setStatusEnvio("erro");
        console.error("ERRO: Você precisa fazer pelo menos um palpite antes de enviar.");
        return;
    }


    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        body: data,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        setStatusEnvio("sucesso");
        // Opcional: Limpar formData após o sucesso
        // setFormData({});
      } else {
        setStatusEnvio("erro");
        const errorData = await response.json();
        console.error("Erro no envio:", errorData);
      }
    } catch (error) {
      setStatusEnvio("erro");
      console.error("Erro na comunicação de rede:", error);
    }
  };

  return (
    <div style={styles.app}>
      <main style={styles.main}>
        <form
          onSubmit={handleSubmit}
          style={{ marginBottom: 32 }}
          id="palpitesForm"
        >
          <div style={rstyles.layoutGrid}>
            <aside style={rstyles.controlsPanel}>
              <header style={rstyles.header}>
                <h1 style={rstyles.h1}>Futebol ⚽</h1>
                <p style={rstyles.pHeader}>
                  Palpite nos jogos! Veja o histórico dos times{' '}
                  <span style={{ filter: 'brightness(.9)' }}>🟩🟨🟥</span> e torne-se o
                  craque das previsões.
                </p>
                <p style={rstyles.pWarning}>
                  <span style={{ fontWeight: 700 }}>Atenção:</span><br /><br />
                  Você pode escolher entre **Resultado** OU **Dupla Chance** (não os dois) e adicionar **Gols**, se quiser.<br /><br />
                  Não é obrigatório escolher todos os jogos e mercados, mas isso influência no valor final.<br /><br />
                  A **Posição** atual na tabela do Brasileirão (ex: 1º) aparece junto ao nome do time.
                </p>
              </header>
              <div style={rstyles.expandControls}>
                <button type="button" style={rstyles.expandButton} onClick={toggleTodos}>
                  {todosAbertos ? "Recolher todos os jogos" : "Expandir todos os jogos"}
                </button>
              </div>
              <div style={styles.nomeBox}>
                <label htmlFor="nomeUsuario">
                  <input
                    id="nomeUsuario"
                    type="text"
                    name="nome"
                    placeholder="Seu primeiro nome"
                    style={rstyles.inputNome}
                    value={nomeUsuario}
                    onChange={(e) => setNomeUsuario(e.target.value)}
                    required
                    autoComplete="given-name"
                  />
                </label>
              </div>
              {/* Rodapé removido da sidebar para não ficar no meio da página */}
            </aside>
            <section style={rstyles.contentPanel}>
              {Object.entries(jogos).map(([dia, partidas]) => (
                <section key={dia}>
            <h2 style={styles.sectionTitle}>{formatarDataPt(dia)}</h2>
                  {partidas.map((jogo: Partida) => {
                    const timesNome: [string, string] = [jogo.times[0].nome, jogo.times[1].nome];
                    const key = `${dia}-${jogo.hora}-${timesNome[0]}-${timesNome[1]}`;
                    return (
                      <CardJogo
                        key={key}
                        jogo={jogo}
                        dia={dia}
                        jogoKey={key}
                        formData={formData}
                        handleChange={handleChange}
                        isAberto={todosAbertos || key === abertoKey}
                        toggleAccordion={() => toggleAccordion(key)}
                        styles={rstyles}
                      />
                    );
                  })}
                </section>
              ))}
              {statusEnvio === "sucesso" && (
                <div style={styles.formFeedback}>✅ Palpites enviados com sucesso!</div>
              )}
              {statusEnvio === "erro" && (
                <div style={styles.formError}>❌ Erro no envio. Verifique o nome e tente novamente.</div>
              )}
            </section>
          </div>
          {/* Meus Palpites no final da página */}
          <section style={styles.meusPalpites}>
            <h2 style={styles.meusPalpitesTitle}>Meus Palpites:</h2>
            <ul style={styles.meusPalpitesList}>
              {Object.entries(formData).map(([key, e]) => {
                  if (e.resultadoFinal || e.duplaChance || e.gols) {
                      return (
                          <li key={key} style={styles.meusPalpitesListItem}>
                              {formatarDataPt(e.dia)}, {e.hora}: <b>{e.times[0]}</b> x <b>{e.times[1]}</b>
                              {e.resultadoFinal && (
                              <> — <strong>Resultado: {e.resultadoFinal}</strong></>
                              )}
                              {e.duplaChance && (
                              <> / <strong>Dupla: {e.duplaChance}</strong></>
                              )}
                              {e.gols && <> / <strong>Gols: {e.gols}</strong></>}
                          </li>
                      );
                  }
                  return null;
              })}
            </ul>
          </section>
        </form>
        {/* Rodapé geral da página, abaixo do conteúdo */}
        <footer style={styles.pageFooter}>
          © 2025 - Futebol ⚽ | Desenvolvimento: Hemerson
        </footer>
        {/* Barra fixa de envio (mobile-friendly) */}
        <div style={styles.stickyBar}>
          <div style={styles.stickyInner}>
            <button
              type="submit"
              form="palpitesForm"
              style={styles.stickyButton}
              disabled={statusEnvio === "enviando"}
            >
              {statusEnvio === "enviando" ? "Enviando..." : "Enviar palpites"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
