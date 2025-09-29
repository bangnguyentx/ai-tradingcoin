import React, { useState } from "react";
import MainApp from "./MainApp";
import AdminApp from "./AdminApp";

export default function App() {
  const [mode, setMode] = useState("user");
  return (
    <div style={{ fontFamily: "sans-serif", padding: 20 }}>
      <h1>AI TradingCoin</h1>
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => setMode("user")}>Người dùng</button>{" "}
        <button onClick={() => setMode("admin")}>Admin</button>
      </div>
      {mode === "user" ? <MainApp /> : <AdminApp />}
    </div>
  );
}
