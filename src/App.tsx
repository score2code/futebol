import React, { useState } from "react";
import jogos from "./jogos.json";

// [TIPAGEM E DADOS PERMANECEM IGUAIS]

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
// ESTILOS: LAYOUT APRIMORADO
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
  // --- CARD DE JOGO ---
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
    padding: 20,
    marginBottom: 16, // Espaçamento menor entre cards
    color: "#E1E7F1",
    transition: "transform 0.2s",
  },
  gameTime: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontWeight: 700,
    fontSize: "1.2rem", // Mais destaque
    color: "#FFFFFF",
    marginBottom: 15,
    paddingBottom: 10,
    borderBottom: "1px solid #3A404F"
  },
  vsText: {
    color: "#5AD2F6", // Cor primária no 'vs'
    fontWeight: 900,
    fontSize: "1rem",
    margin: "0 5px",
  },
  // --- FORMULÁRIO E CONTROLES ---
  inputNome: {
    width: "100%",
    padding: "12px 15px", // Aumentei o padding
    marginBottom: "25px", // Aumentei a margem
    borderRadius: "8px",
    border: "1px solid #4A5063",
    fontSize: "1.05rem",
    fontWeight: 500,
    background: "#313540", // Fundo do input mais escuro para contraste
    color: "#FFFFFF",
    boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.3)"
  },
  selectGroup: {
    display: "flex",
    gap: "20px",
    margin: "15px 0 20px 0",
    flexWrap: "wrap",
  },
  selectLabelText: {
    fontWeight: 600,
    fontSize: "0.95rem",
    color: "#A0A7B9",
    display: "block",
    marginBottom: 5,
  },
  select: {
    padding: "10px", // Aumentei o padding
    borderRadius: "6px",
    border: "1px solid #4A5063",
    background: "#313540",
    color: "#FFFFFF",
    fontWeight: 500,
    fontSize: "1rem",
    minWidth: "150px", // Aumentei a largura mínima
    cursor: "pointer",
    // Para React, o hover/focus deve ser via CSS externo ou Styled Components
  },
  button: {
    padding: "16px 35px", // Aumentei o botão
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(90deg, #5AD2F6 0%, #20C6ED 100%)", // Gradiente mais nítido
    color: "#1A1E27", // Texto escuro no botão claro
    cursor: "pointer",
    fontWeight: 800, // Mais bold
    fontSize: "1.2rem",
    boxShadow: "0px 8px 25px rgba(32, 198, 237, 0.3)",
    margin: "40px 0 25px 0",
    letterSpacing: "0.03em",
    transition: "all 0.3s ease",
  },
  // --- HISTÓRICO ---
  ultimosTitle: {
    margin: "15px 0 8px 0",
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
    listStyleType: "none", // Assegurar que o reset funcione, mas manter o controle
  },
  ultimosListItem: {
    marginBottom: 3,
    display: "flex",
    alignItems: "center",
    gap: 10, // Aumentei o gap
    lineHeight: 1.3
  },
  // Cores dos Emojis para contraste
  emojiV: { color: "#4CAF50", fontWeight: 700, minWidth: 20, display: "inline-block" },
  emojiE: { color: "#FFC107", fontWeight: 700, minWidth: 20, display: "inline-block" },
  emojiD: { color: "#F44336", fontWeight: 700, minWidth: 20, display: "inline-block" },
  // --- FEEDBACK E FOOTER ---
  formFeedback: {
    background: "#4CAF50", // Fundo verde sólido
    color: "#fff",
    borderRadius: 9,
    padding: "18px",
    margin: "0 0 35px 0",
    fontWeight: 700,
    fontSize: "1.1rem",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.4)",
    textAlign: "center",
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
    paddingLeft: 20, // Retornei o padding para a lista de palpites
    fontSize: "1rem",
    margin: 0,
    listStyleType: "disc", // Padrão da lista
  },
  meusPalpitesListItem: {
    marginBottom: 10,
    lineHeight: 1.4
  },
  footer: {
    marginTop: 40,
    textAlign: "center",
    color: "#6C7383", // Cor de texto suave
    fontWeight: 500,
    fontSize: "0.9rem",
  },
};

// ----------------------------------------------------
// COMPONENTE PRINCIPAL (Estrutura mantida)
// ----------------------------------------------------

export default function App() {
  const [formData, setFormData] = useState<{ [key: string]: EscolhaUsuario }>({});
  const [enviado, setEnviado] = useState(false);
  const [nomeUsuario, setNomeUsuario] = useState("");

  const handleChange = (
    dia: string,
    hora: string,
    times: [string, string],
    campo: keyof EscolhaUsuario,
    valor: string
  ) => {
    const key = `${dia}-${hora}-${times[0]}-${times[1]}`;
    setFormData((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || { dia, hora, times }),
        [campo]: valor,
      },
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    if (!nomeUsuario.trim()) {
      alert("Por favor, informe seu primeiro nome antes de enviar.");
      event.preventDefault();
      return;
    }
    setEnviado(true);
  };

  const getEmojiStyle = (resultado: string): React.CSSProperties => {
    if (resultado === "V") return styles.emojiV;
    if (resultado === "E") return styles.emojiE;
    return styles.emojiD;
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
            <span style={{ fontWeight: 700 }}>Atenção:</span> Este é um protótipo beta. Anote suas escolhas em caso de falha.
          </p>

          <p style={styles.pWarning}>
            Você pode escolher entre **Resultado** OU **Dupla Chance** (não os dois) + **Gols**.
          </p>

          <p style={styles.pWarning}>
            BOA SORTE! Envie pelo site até as 15h do dia 01/11.
          </p>
        </header>
        <form
          action="https://formspree.io/f/xanllngo"
          method="POST"
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
              {partidas.map((jogo: any) => {
                const times: [string, string] =
                  Array.isArray(jogo.times) && jogo.times.length === 2
                    ? [jogo.times[0], jogo.times[1]]
                    : ["", ""];
                const key = `${dia}-${jogo.hora}-${times[0]}-${times[1]}`;
                const ultimos: UltimosPorTime = jogo.ultimos || {};

                return (
                  <div key={key} style={styles.card}>
                    <div style={styles.gameTime}>
                      <span>{jogo.hora}</span>
                      <span>
                        {times[0]}
                        <span style={styles.vsText}> VS </span>
                        {times[1]}
                      </span>
                    </div>

                    <div style={styles.selectGroup}>
                      {/* Resultado Final */}
                      <label htmlFor={`rf-${key}`}>
                        <span style={styles.selectLabelText}>Resultado:</span>
                        <select
                          id={`rf-${key}`}
                          style={styles.select}
                          name={`rf-${key}`}
                          onChange={(e) =>
                            handleChange(
                              dia,
                              jogo.hora,
                              times,
                              "resultadoFinal",
                              e.target.value
                            )
                          }
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
                      <label htmlFor={`dc-${key}`}>
                        <span style={styles.selectLabelText}>Dupla:</span>
                        <select
                          id={`dc-${key}`}
                          style={styles.select}
                          name={`dc-${key}`}
                          onChange={(e) =>
                            handleChange(
                              dia,
                              jogo.hora,
                              times,
                              "duplaChance",
                              e.target.value
                            )
                          }
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
                      <label htmlFor={`gols-${key}`}>
                        <span style={styles.selectLabelText}>Gols:</span>
                        <select
                          id={`gols-${key}`}
                          style={styles.select}
                          name={`gols-${key}`}
                          onChange={(e) =>
                            handleChange(
                              dia,
                              jogo.hora,
                              times,
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
                    <div className="historico-container">
                      <h3 style={styles.ultimosTitle}>
                        {times[0]} Últimos Jogos:
                      </h3>
                      <ul style={styles.ultimosList} role="list">
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
                          <li style={{ color: "#6C7383" }}>Sem dados de histórico recente.</li>
                        )}
                      </ul>

                      <h3 style={styles.ultimosTitle}>
                        {times[1]} Últimos Jogos:
                      </h3>
                      <ul style={styles.ultimosList} role="list">
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
                          <li style={{ color: "#6C7383" }}>Sem dados de histórico recente.</li>
                        )}
                      </ul>
                    </div>

                    <input
                      type="hidden"
                      name={`palpite-${key}`}
                      value={JSON.stringify(
                        formData[key] || {
                          dia,
                          hora: jogo.hora,
                          times,
                        }
                      )}
                    />
                  </div>
                );
              })}
            </section>
          ))}
          <button type="submit" style={styles.button}>
            Enviar palpites!
          </button>
        </form>
        {enviado && (
          <div style={styles.formFeedback}>
            ✅ Palpites enviados com sucesso!
          </div>
        )}
        <section style={styles.meusPalpites}>
          <h2 style={styles.meusPalpitesTitle}>Meus Palpites:</h2>
          <ul style={styles.meusPalpitesList} role="list">
            {Object.entries(formData).map(([key, e], i) => (
              <li key={i} style={styles.meusPalpitesListItem}>
                {e.dia}, {e.hora}: <b>{e.times[0]}</b> x <b>{e.times[1]}</b>
                {e.resultadoFinal && (
                  <> — <strong>Resultado: {e.resultadoFinal}</strong></>
                )}
                {e.duplaChance && (
                  <> / <strong>Dupla: {e.duplaChance}</strong></>
                )}
                {e.gols && <> / <strong>Gols: {e.gols}</strong></>}
              </li>
            ))}
          </ul>
        </section>
        <footer style={styles.footer}>
          © 2025 - Futebol ⚽ | Desenvolvimento: Hemerson
        </footer>
      </main>
    </div>
  );
}