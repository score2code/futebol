import React, { useState } from "react";
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
    background: "#1A1E27", // Cor de fundo mais sóbria
    minHeight: "100vh",
  },
  main: {
    maxWidth: 800, // Aumentei um pouco a largura
    margin: "0 auto",
    padding: "30px 20px", // Espaçamento maior
  },
  // --- HEADER ---
  header: {
    background: "#282C37", // Card de fundo mais escuro
    borderRadius: 16,
    padding: "30px",
    margin: "0 0 30px",
    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.2)",
    borderTop: "4px solid #5AD2F6", // Detalhe de cor primária
  },
  h1: {
    color: "#5AD2F6",
    fontSize: "2.4rem", // Aumentei
    fontWeight: 800, // Deixei mais bold
    letterSpacing: "0.01em",
    marginBottom: 8,
  },
  pHeader: {
    color: "#C4C8D2", // Texto mais claro para bom contraste
    fontSize: "1.1rem",
    marginTop: 0,
    fontWeight: 500,
    lineHeight: 1.5,
  },
  pWarning: {
    color: "#F6E0A6", // Amarelo/verde suave para avisos
    fontSize: "0.95rem",
    marginTop: 15,
    fontWeight: 500,
    lineHeight: 1.4,
    borderLeft: "3px solid #F6E0A6",
    paddingLeft: 10,
    backgroundColor: "rgba(246, 224, 166, 0.05)",
    padding: "8px 10px",
    borderRadius: 6
  },
  // --- CARD DE JOGO (BASE) ---
  sectionTitle: {
    color: "#E1E7F1",
    fontWeight: 700,
    fontSize: "1.3rem", // Mais destaque
    borderBottom: "2px solid #3A404F",
    marginBottom: 20,
    marginTop: 35,
    paddingBottom: 8,
    letterSpacing: "0.015em",
  },
  card: {
    background: "#282C37", // Cor do card
    borderRadius: 12,
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
    marginBottom: 16, // Espaçamento menor entre cards
    color: "#E1E7F1",
    overflow: "hidden", // Para o accordion funcionar
  },
  // --- HEADER DO CARD (CLICKABLE) ---
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    fontWeight: 700,
    fontSize: "1.2rem",
    color: "#FFFFFF",
    cursor: "pointer",
    background: "#282C37",
    transition: "background 0.2s",
    borderBottom: "1px solid #3A404F",
  },
  gameTime: {
    display: "flex",
    alignItems: "center",
  },
  teamDisplay: {
    display: "flex",
    flexDirection: "column" as const,
    textAlign: "center" as const, // Flexível no mobile
    lineHeight: 1.2,
    fontSize: "1.1rem"
  },
  teamPosicao: {
    fontSize: "0.7rem",
    fontWeight: 500,
    color: "#A0A7B9",
    marginTop: 2
  },
  vsText: {
    color: "#5AD2F6", // Cor primária no 'vs'
    fontWeight: 900,
    fontSize: "1rem",
    margin: "0 10px",
  },
  iconeAccordion: {
    fontSize: "1.5rem",
    color: "#5AD2F6",
    transition: "transform 0.3s ease",
  },
  // --- CORPO DO CARD (EXPANSÍVEL) ---
  cardBody: {
    padding: "0 20px",
    maxHeight: 0,
    overflow: "hidden",
    transition: "max-height 0.4s ease-in-out", // Transição para accordion
  },
  cardBodyAberto: {
    maxHeight: 1000, // Valor alto para acomodar o conteúdo
    padding: "20px",
  },
  // --- FORMULÁRIO E CONTROLES (Dentro do Body) ---
  selectGroup: {
    display: "flex",
    gap: "20px",
    margin: "15px 0 20px 0",
    flexWrap: "wrap" as const,
    // Ajuste para mobile: remove "space-between" para permitir fluxo natural
    justifyContent: "flex-start",
  },
  // Novo estilo para a label container, garantindo que ocupe o espaço corretamente
  selectWrapper: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: '140px', // Minimo para desktop/tablet
    width: '100%', // Mobile: tenta pegar 100% (será limitado pelo minWidth)
    maxWidth: 'calc(100% - 20px)', // Para telas que cabem dois, mas não três
    marginBottom: 10, // Adiciona espaço vertical entre selects no mobile
  },
  selectLabelText: {
    fontWeight: 600,
    fontSize: "0.95rem",
    color: "#A0A7B9",
    display: "block",
    marginBottom: 5,
  },
  select: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #4A5063",
    background: "#313540",
    color: "#FFFFFF",
    fontWeight: 500,
    fontSize: "1rem",
    minWidth: "140px",
    cursor: "pointer",
    width: '100%', // Garante que o select preencha o label
    // CORREÇÃO MOBILE: Remove estilos padrões do navegador
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    appearance: 'none',
  },
  // --- HISTÓRICO (Dentro do Body) ---
  historicoContainer: {
    display: "flex",
    gap: "20px",
    marginTop: 15,
    flexWrap: "wrap" as const,
  },
  historicoTime: {
    flex: 1,
    minWidth: "100%", // CORREÇÃO MOBILE: Força 100% de largura para empilhar em telas pequenas
    marginBottom: 15, // Adiciona espaçamento vertical ao empilhar
  },
  ultimosTitle: {
    margin: "0 0 8px 0",
    color: "#A0A7B9",
    fontWeight: 700,
    fontSize: "0.9rem",
    textTransform: "uppercase",
  },
  ultimosList: {
    paddingLeft: 0,
    margin: 0,
    maxHeight: 100, // Diminuí para ser mais compacto
    overflowY: "auto",
    color: "#C4C8D2",
    fontSize: "0.85rem",
    listStyleType: "none",
  },
  ultimosListItem: {
    marginBottom: 3,
    display: "flex",
    alignItems: "center",
    gap: 10,
    lineHeight: 1.3
  },
  // Cores dos Emojis para contraste
  emojiV: { color: "#4CAF50", fontWeight: 700, minWidth: 20, display: "inline-block" },
  emojiE: { color: "#FFC107", fontWeight: 700, minWidth: 20, display: "inline-block" },
  emojiD: { color: "#F44336", fontWeight: 700, minWidth: 20, display: "inline-block" },
  // --- OUTROS ---
  inputNome: {
    width: "100%",
    padding: "12px 15px",
    marginBottom: "25px",
    borderRadius: "8px",
    border: "1px solid #4A5063",
    fontSize: "1.05rem",
    fontWeight: 500,
    background: "#313540",
    color: "#FFFFFF",
    boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.3)"
  },
  button: {
    padding: "16px 35px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(90deg, #5AD2F6 0%, #20C6ED 100%)",
    color: "#1A1E27",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: "1.2rem",
    boxShadow: "0px 8px 25px rgba(32, 198, 237, 0.3)",
    margin: "40px 0 25px 0",
    letterSpacing: "0.03em",
    transition: "all 0.3s ease",
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
  footer: {
    marginTop: 40,
    textAlign: "center" as const,
    color: "#6C7383",
    fontWeight: 500,
    fontSize: "0.9rem",
  },
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
}

const CardJogo: React.FC<CardJogoProps> = ({
  jogo,
  dia,
  jogoKey,
  formData,
  handleChange,
  isAberto,
  toggleAccordion,
}) => {
  const times: [string, string] = [jogo.times[0].nome, jogo.times[1].nome];
  const ultimos: UltimosPorTime = jogo.ultimos || {};

  const palpiteAtual = formData[jogoKey];

  const getEmojiStyle = (resultado: string): React.CSSProperties => {
    if (resultado === "V") return styles.emojiV;
    if (resultado === "E") return styles.emojiE;
    return styles.emojiD;
  };

  return (
    <div style={styles.card}>
      {/* HEADER DO CARD (CLICKABLE) */}
      <div style={styles.cardHeader} onClick={toggleAccordion}>
        {/* Lado Esquerdo: Hora e Times */}
        <div style={styles.gameTime}>
          <span>{jogo.hora}</span>
          <span style={styles.vsText}> - </span>
          <div style={styles.teamDisplay}>
            {jogo.times[0].nome}
            <span style={styles.teamPosicao}>({jogo.times[0].posicao}º)</span>
          </div>
          <span style={styles.vsText}> VS </span>
          <div style={styles.teamDisplay}>
            {jogo.times[1].nome}
            <span style={styles.teamPosicao}>({jogo.times[1].posicao}º)</span>
          </div>
        </div>
        {/* Lado Direito: Ícone Accordion */}
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
              <option value="">--Escolha--</option>
              {mercadosResultadoFinal.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
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
              <option value="">--Escolha--</option>
              {mercadosDuplaChance.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
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
              <option value="">--Escolha--</option>
              {mercadosGols.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Histórico */}
        {/* O container historicoTime agora tem minWidth: 100% e marginBottom para empilhar */}
        <div style={styles.historicoContainer}>
          {/* Histórico Time 1 */}
          <div style={styles.historicoTime}>
            <h3 style={styles.ultimosTitle}>
              {jogo.times[0].nome} ({jogo.times[0].posicao}º) Últimos Jogos:
            </h3>
            <ul style={styles.ultimosList}>
              {(ultimos[times[0]] || []).map((item, i) => (
                <li key={i} style={styles.ultimosListItem}>
                  <span style={getEmojiStyle(item.resultado)}>
                    {emojiResultado(item.resultado)}
                  </span>
                  <span style={{ minWidth: 50 }}>{item.data}</span>
                  <span>{item.placar}</span>
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
              {jogo.times[1].nome} ({jogo.times[1].posicao}º) Últimos Jogos:
            </h3>
            <ul style={styles.ultimosList}>
              {(ultimos[times[1]] || []).map((item, i) => (
                <li key={i} style={styles.ultimosListItem}>
                  <span style={getEmojiStyle(item.resultado)}>
                    {emojiResultado(item.resultado)}
                  </span>
                  <span style={{ minWidth: 50 }}>{item.data}</span>
                  <span>{item.placar}</span>
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

  const FORM_ENDPOINT = "https://formspree.io/f/xanllngo"; // Substitua pelo seu endpoint Formspree

  const toggleAccordion = (key: string) => {
    setAbertoKey(key === abertoKey ? null : key);
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
        <header style={styles.header}>
          <h1 style={styles.h1}>Futebol ⚽</h1>
          <p style={styles.pHeader}>
            Palpite nos jogos! Veja o histórico dos times{" "}
            <span style={{ filter: "brightness(.9)" }}>🟩🟨🟥</span> e torne-se o
            craque das previsões.
          </p>

          <p style={styles.pWarning}>
            <span style={{ fontWeight: 700 }}>Atenção:</span><br /><br />
            Você pode escolher entre **Resultado** OU **Dupla Chance** (não os dois) e adicionar **Gols**, se quiser.<br /><br />
            Não é obrigatório escolher todos os jogos e mercados, mas isso influência no valor final.<br /><br />
            A **Posição** atual na tabela do Brasileirão (ex: 1º) aparece junto ao nome do time.
          </p>
        </header>
        <form
          onSubmit={handleSubmit}
          style={{ marginBottom: 32 }}
        >
          <label htmlFor="nomeUsuario">
            <input
              id="nomeUsuario"
              type="text"
              name="nome"
              placeholder="Seu primeiro nome"
              style={styles.inputNome}
              value={nomeUsuario}
              onChange={(e) => setNomeUsuario(e.target.value)}
              required
              autoComplete="given-name"
            />
          </label>
          {Object.entries(jogos).map(([dia, partidas]) => (
            <section key={dia}>
              <h2 style={styles.sectionTitle}>{dia}</h2>
              {partidas.map((jogo: Partida, index) => {
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
                    isAberto={key === abertoKey}
                    toggleAccordion={() => toggleAccordion(key)}
                  />
                );
              })}
            </section>
          ))}
          <button type="submit" style={styles.button} disabled={statusEnvio === "enviando"}>
            {statusEnvio === "enviando" ? "Enviando..." : "Enviar palpites!"}
          </button>
        </form>
        {statusEnvio === "sucesso" && (
          <div style={styles.formFeedback}>
            ✅ Palpites enviados com sucesso!
          </div>
        )}
        {statusEnvio === "erro" && (
          <div style={styles.formError}>
            ❌ Erro no envio. Verifique o nome e tente novamente.
          </div>
        )}
        <section style={styles.meusPalpites}>
          <h2 style={styles.meusPalpitesTitle}>Meus Palpites:</h2>
          <ul style={styles.meusPalpitesList}>
            {Object.entries(formData).map(([key, e]) => {
                if (e.resultadoFinal || e.duplaChance || e.gols) {
                    return (
                        <li key={key} style={styles.meusPalpitesListItem}>
                            {e.dia}, {e.hora}: <b>{e.times[0]}</b> x <b>{e.times[1]}</b>
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
        <footer style={styles.footer}>
          © 2025 - Futebol ⚽ | Desenvolvimento: Hemerson
        </footer>
      </main>
    </div>
  );
}
