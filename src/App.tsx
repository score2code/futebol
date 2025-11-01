import React, { useState } from "react";
import jogos from "./jogos.json";

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

const appStyles: React.CSSProperties = {
  fontFamily: "system-ui, sans-serif",
  background: "#1C2233",
  minHeight: "100vh",
  margin: 0,
  padding: 0,
};

const mainStyles: React.CSSProperties = {
  maxWidth: 750,
  margin: "0 auto",
  padding: "24px 20px",
};

const cardStyles: React.CSSProperties = {
  background: "#22283A",
  borderRadius: 12,
  boxShadow: "0 4px 16px rgba(55, 90, 120, 0.1)",
  padding: 18,
  marginBottom: 24,
  color: "#E1E7F1",
};

const teamStyles: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontWeight: 600,
  fontSize: "1.1rem",
  color: "#F2F5FA",
};

const ultimosTitleStyles: React.CSSProperties = {
  margin: "12px 0 6px 0",
  color: "#ADECFF",
  fontWeight: 700,
  fontSize: ".95rem",
};

const ultimosListStyles: React.CSSProperties = {
  listStyle: "none",
  paddingLeft: 20,
  margin: 0,
  maxHeight: 120,
  overflowY: "auto",
  color: "#bde7ff",
  fontSize: "0.92rem",
};

const ultimosListItemStyles: React.CSSProperties = {
  marginBottom: 4,
  display: "flex",
  alignItems: "center",
  gap: 6,
};

const selectStyles: React.CSSProperties = {
  margin: "0 10px 7px 0",
  padding: "8px",
  borderRadius: "7px",
  border: "1px solid #313868",
  background: "#22283A",
  color: "#F2F5FA",
  fontWeight: 500,
  fontSize: "1rem",
  minWidth: "120px",
};

const inputNomeStyles: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  marginBottom: "18px",
  borderRadius: "7px",
  border: "1px solid #313868",
  fontSize: "1rem",
  fontWeight: 500,
  background: "#22283A",
  color: "#F2F5FA",
};

const buttonStyles: React.CSSProperties = {
  padding: "14px 28px",
  borderRadius: "8px",
  border: "none",
  background: "linear-gradient(90deg, #2863B2 0%, #24C1D5 100%)",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: "1.1rem",
  boxShadow: "0px 3px 18px rgba(24,188,255,0.12)",
  margin: "28px 0 18px 0",
  letterSpacing: "0.02em",
};

const footerStyles: React.CSSProperties = {
  marginTop: 32,
  textAlign: "center",
  color: "#4DD2FF",
  fontWeight: 600,
  fontSize: "1rem",
};

const formFeedbackStyles: React.CSSProperties = {
  background: "#23d16c",
  color: "#fff",
  borderRadius: 9,
  padding: "16px",
  margin: "0 0 32px 0",
  fontWeight: 700,
  fontSize: "1.17rem",
  boxShadow: "0 2px 10px #233",
  textAlign: "center",
};

const meusPalpitesStyles: React.CSSProperties = {
  background: "#232d45",
  borderRadius: 12,
  padding: "18px",
  marginTop: 16,
  color: "#fff",
};

export default function App() {
  const [formData, setFormData] = useState<{ [key: string]: EscolhaUsuario }>({});
  const [enviado, setEnviado] = useState(false);
  const [nomeUsuario, setNomeUsuario] = useState("");

  function handleChange(
    dia: string,
    hora: string,
    times: [string, string],
    campo: keyof EscolhaUsuario,
    valor: string
  ) {
    const key = `${dia}-${hora}-${times[0]}-${times[1]}`;
    setFormData((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || { dia, hora, times }),
        [campo]: valor,
      },
    }));
  }

  function handleSubmit(event: React.FormEvent) {
    if (!nomeUsuario.trim()) {
      alert("Por favor, informe seu primeiro nome antes de enviar.");
      event.preventDefault();
      return;
    }
    setEnviado(true);
  }

  return (
    <div style={appStyles}>
      <div style={mainStyles}>
        <header
          style={{
            background: "#22283A",
            borderRadius: 14,
            padding: "22px 32px",
            margin: "25px 0 18px",
            boxShadow: "0 3px 19px #14162569",
          }}
        >
          <h1
            style={{
              color: "#20C6ED",
              fontSize: "2.1rem",
              fontWeight: 900,
              letterSpacing: ".02em",
            }}
          >
            Futebol ⚽
          </h1>
          <p
            style={{
              color: "#B1DAED",
              fontSize: "1.1rem",
              marginTop: 8,
              fontWeight: 600,
            }}
          >
            Palpite nos jogos! Veja o histórico dos times{" "}
            <span style={{ filter: "brightness(.7)" }}>🟩🟨🟥</span> e torne-se o
            craque das previsões.
          </p>
        </header>
        <form
          action="https://formspree.io/f/xanllngo"
          method="POST"
          onSubmit={handleSubmit}
          style={{ marginBottom: 32 }}
        >
          <label>
            <input
              type="text"
              name="nome"
              placeholder="Seu primeiro nome"
              style={inputNomeStyles}
              value={nomeUsuario}
              onChange={(e) => setNomeUsuario(e.target.value)}
              required
              autoComplete="name"
            />
          </label>
          {Object.entries(jogos).map(([dia, partidas]) => (
            <div key={dia}>
              <h2
                style={{
                  color: "#5AD2F6",
                  fontWeight: 700,
                  fontSize: "1.16rem",
                  borderBottom: "2.5px solid #233868",
                  marginBottom: 13,
                  marginTop: 18,
                  letterSpacing: ".015em",
                }}
              >
                {dia}
              </h2>
              {partidas.map((jogo: any) => {
                const times: [string, string] =
                  Array.isArray(jogo.times) && jogo.times.length === 2
                    ? [jogo.times[0], jogo.times[1]]
                    : ["", ""];
                const key = `${dia}-${jogo.hora}-${times[0]}-${times[1]}`;
                const ultimos: UltimosPorTime = jogo.ultimos || {};

                return (
                  <div key={key} style={cardStyles}>
                    <div style={teamStyles}>
                      <span>{jogo.hora}</span>
                      <span>
                        {times[0]}{" "}
                        <span
                          style={{
                            color: "#7DDAF3",
                            fontWeight: 900,
                            fontSize: "1rem",
                          }}
                        >
                          vs
                        </span>{" "}
                        {times[1]}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "15px",
                        margin: "12px 0",
                        flexWrap: "wrap",
                      }}
                    >
                      <label>
                        <span
                          style={{
                            fontWeight: 500,
                            fontSize: "1rem",
                            color: "#ACEBFF",
                          }}
                        >
                          Resultado:
                        </span>
                        <select
                          style={selectStyles}
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
                      <label>
                        <span
                          style={{
                            fontWeight: 500,
                            fontSize: "1rem",
                            color: "#ACEBFF",
                          }}
                        >
                          Dupla:
                        </span>
                        <select
                          style={selectStyles}
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
                      <label>
                        <span
                          style={{
                            fontWeight: 500,
                            fontSize: "1rem",
                            color: "#ACEBFF",
                          }}
                        >
                          Gols:
                        </span>
                        <select
                          style={selectStyles}
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

                    {/* Histórico (lista compacta) */}
                    <div>
                      <div style={ultimosTitleStyles}>
                        <strong>{times[0]}</strong> Histórico:
                      </div>
                      <ul style={ultimosListStyles}>
                        {(ultimos[times[0]] || []).map((item, i) => (
                          <li key={i} style={ultimosListItemStyles}>
                            <span
                              style={{
                                fontWeight: 700,
                                color:
                                  item.resultado === "V"
                                    ? "#39ff14"
                                    : item.resultado === "E"
                                    ? "#f0e130"
                                    : "#fb3a3a",
                                minWidth: 20,
                                display: "inline-block",
                              }}
                            >
                              {emojiResultado(item.resultado)}
                            </span>
                            <span style={{ minWidth: 52 }}>{item.data}</span>
                            <span>{item.placar}</span>
                          </li>
                        ))}
                        {(ultimos[times[0]] || []).length === 0 && (
                          <li style={{ color: "#bbb" }}>Sem dados</li>
                        )}
                      </ul>
                      <div style={ultimosTitleStyles}>
                        <strong>{times[1]}</strong> Histórico:
                      </div>
                      <ul style={ultimosListStyles}>
                        {(ultimos[times[1]] || []).map((item, i) => (
                          <li key={i} style={ultimosListItemStyles}>
                            <span
                              style={{
                                fontWeight: 700,
                                color:
                                  item.resultado === "V"
                                    ? "#39ff14"
                                    : item.resultado === "E"
                                    ? "#f0e130"
                                    : "#fb3a3a",
                                minWidth: 20,
                                display: "inline-block",
                              }}
                            >
                              {emojiResultado(item.resultado)}
                            </span>
                            <span style={{ minWidth: 52 }}>{item.data}</span>
                            <span>{item.placar}</span>
                          </li>
                        ))}
                        {(ultimos[times[1]] || []).length === 0 && (
                          <li style={{ color: "#bbb" }}>Sem dados</li>
                        )}
                      </ul>
                    </div>

                    {/* Campo oculto para Formspree */}
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
            </div>
          ))}
          <button type="submit" style={buttonStyles}>
            Enviar palpites!
          </button>
        </form>
        {enviado && (
          <div style={formFeedbackStyles}>
            ✅ Palpites enviados com sucesso! Aguarde nosso contato.
          </div>
        )}
        <div style={meusPalpitesStyles}>
          <h2 style={{ color: "#55E3DF", fontSize: "1.15rem" }}>
            Meus palpites:
          </h2>
          <ul style={{ paddingLeft: 20, fontSize: "1.07rem", margin: 0 }}>
            {Object.entries(formData).map(([key, e], i) => (
              <li key={i} style={{ marginBottom: 9 }}>
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
        </div>
        <footer style={footerStyles}>
          © 2025 - Futebol ⚽ | By Hemerson
        </footer>
      </div>
    </div>
  );
}
