import React, { useEffect, useState } from "react";
import api from "./api";
import socket from "./socket";

export default function MainApp() {
  const [phone, setPhone] = useState("");
  const [key, setKey] = useState("");
  const [logged, setLogged] = useState(false);
  const [history, setHistory] = useState([]);
  const [coins, setCoins] = useState([]);

  useEffect(() => {
    api.get("/coins").then(r => setCoins(r.data.coins || []));
    fetchHistory();
    socket.on("analysis", (data) => {
      setHistory(prev => [{ symbol: data.symbol, analysis: data.analysis, _time: data.ts }, ...prev]);
    });
    return () => socket.off("analysis");
  }, []);

  async function doLogin(){
    try {
      const r = await api.post("/login", { phone, key });
      if (r.data && r.data.token) localStorage.setItem('userToken', r.data.token);
      setLogged(true);
      fetchHistory();
    } catch (e) { alert('Login failed'); }
  }

  async function fetchHistory(){
    try {
      const r = await api.get("/history");
      setHistory(r.data.history || []);
    } catch (e) {}
  }

  async function manualScan(sym){
    const r = await api.post("/scan", { symbol: sym });
    if (r.data && r.data.analysis) alert('Scan done for ' + sym);
    fetchHistory();
  }

  return (
    <div>
      {!logged ? (
        <div>
          <h3>Đăng nhập</h3>
          <input placeholder="Số điện thoại" value={phone} onChange={e=>setPhone(e.target.value)} /><br/>
          <input placeholder="Key (nếu có)" value={key} onChange={e=>setKey(e.target.value)} /><br/>
          <button onClick={doLogin}>Đăng nhập</button>
        </div>
      ) : (
        <div>
          <h3>Auto Scan</h3>
          {coins.map(c => <button key={c} onClick={()=>manualScan(c)} style={{marginRight:6}}>{c}</button>)}
          <h3>History</h3>
          <ul>
            {history.map((h,i) => (
              <li key={i}>
                <strong>{h.symbol}</strong> - {h.analysis && h.analysis.idea && h.analysis.idea.ok ? `${h.analysis.idea.dir} @ ${h.analysis.idea.entry}` : 'No idea'} - {new Date(h._time).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
    }
