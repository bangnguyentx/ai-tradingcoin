import React, { useEffect, useState } from "react";
import api from "./api";

export default function AdminApp(){
  const [phone, setPhone] = useState("");
  const [key, setKey] = useState("");
  const [token, setToken] = useState(localStorage.getItem('adminToken') || "");
  const [target, setTarget] = useState("");
  const [type, setType] = useState("week");
  const [newKey, setNewKey] = useState("");

  async function doLogin(){
    try {
      const r = await api.post("/login", { phone, key });
      if (r.data && r.data.token){
        localStorage.setItem('adminToken', r.data.token);
        setToken(r.data.token);
        alert('Logged in as ' + r.data.role);
      }
    } catch (e) { alert('Login error'); }
  }

  async function createKey(){
    try {
      const r = await api.post("/create-key", { phone: target, type }, { headers: { Authorization: `Bearer ${token}` }});
      if (r.data && r.data.token) setNewKey(r.data.token);
    } catch (e) { alert('Create key failed'); }
  }

  return (
    <div>
      {!token ? (
        <div>
          <h3>Admin Login</h3>
          <input placeholder="phone" value={phone} onChange={e=>setPhone(e.target.value)} /><br/>
          <input placeholder="dynamic key" value={key} onChange={e=>setKey(e.target.value)} /><br/>
          <button onClick={doLogin}>Login</button>
        </div>
      ) : (
        <div>
          <h3>Admin Panel</h3>
          <input placeholder="target phone" value={target} onChange={e=>setTarget(e.target.value)} />
          <select value={type} onChange={e=>setType(e.target.value)}>
            <option value="week">week</option>
            <option value="month">month</option>
          </select>
          <button onClick={createKey}>Create Key</button>
          {newKey && <div><strong>Key:</strong> {newKey}</div>}
        </div>
      )}
    </div>
  );
                                                                        }
