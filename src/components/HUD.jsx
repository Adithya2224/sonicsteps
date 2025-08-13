// src/components/HUD.jsx
export default function HUD({ steps, echoes, gameWon }) {
  return (
    <div style={hudStyle}>
      <span>Steps: <b>{steps}</b></span>
      <span style={{ marginLeft: 20 }}>Echoes: <b>{echoes}</b></span>
      {gameWon && (
        <span style={{ marginLeft: 20, color: "#7CFC00", fontWeight: "bold" }}>
          ✅ You Win!
        </span>
      )}
    </div>
  );
}

const hudStyle = {
  background: "rgba(255,255,255,0.08)",
  padding: "8px 20px",
  borderRadius: "8px",
  border: "1px solid rgba(255,255,255,0.3)",
  color: "#fff",
  fontFamily: "'Audiowide', sans-serif",
  fontSize: "16px",
  boxShadow: "0 0 10px rgba(255,255,255,0.2)",
  marginTop: "12px"
};
