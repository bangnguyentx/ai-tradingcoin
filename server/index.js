import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import http from "http";
import fs from "fs";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// ==== ROUTES ==== 
app.post("/api/nap-tien", (req, res) => {
  const { userId, amount } = req.body;
  res.json({ success: true, message: `Nạp ${amount} VNĐ cho user ${userId}` });
});

app.post("/api/order", (req, res) => {
  const { service, link, quantity } = req.body;
  res.json({ success: true, message: `Order ${service} ${quantity} cho ${link}` });
});

app.get("/api/check/:orderId", (req, res) => {
  const { orderId } = req.params;
  res.json({ success: true, orderId, status: "Đang xử lý" });
});

// ==== SOCKET.IO ==== 
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// ==== STATIC CLIENT ==== 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientPath = path.join(__dirname, "../client/dist");
if (fs.existsSync(clientPath)) {
  app.use(express.static(clientPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientPath, "index.html"));
  });
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server chạy tại http://localhost:${PORT}`);
});  res.json({ success: true, orderId, status: "Đang xử lý" });
});

// ==== SOCKET.IO ==== 
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// ==== STATIC CLIENT ==== 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientPath = path.join(__dirname, "../client/dist");
if (fs.existsSync(clientPath)) {
  app.use(express.static(clientPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientPath, "index.html"));
  });
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server chạy tại http://localhost:${PORT}`);
});    message: `Tạo đơn dịch vụ ${service} với số lượng ${quantity} cho link ${link}`,
  });
});

// Check trạng thái
app.get("/api/check/:orderId", (req, res) => {
  const { orderId } = req.params;
  res.json({ success: true, orderId, status: "Đang xử lý" });
});

// ==== SOCKET.IO ==== 
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// ==== STATIC CLIENT BUILD ==== 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Nếu có thư mục build client
const clientPath = path.join(__dirname, "../client/dist");
if (fs.existsSync(clientPath)) {
  app.use(express.static(clientPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientPath, "index.html"));
  });
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server chạy tại http://localhost:${PORT}`);
});app.use(express.json());

const http = createServer(app);
const io = new Server(http);

// helpers for sessions/keys/history
function loadSessions(){ return readJSON(SESSIONS_FILE) || {}; }
function saveSessions(s){ writeJSON(SESSIONS_FILE, s); }
function loadKeys(){ return readJSON(KEYS_FILE) || []; }
function saveKeys(k){ writeJSON(KEYS_FILE, k); }
function readHistory(){ return readJSON(HISTORY_FILE) || []; }
function saveHistory(arr){ writeJSON(HISTORY_FILE, arr); }
function pushHistory(record){
  const arr = readHistory();
  record._time = Date.now();
  arr.unshift(record);
  if (arr.length>2000) arr.splice(2000);
  saveHistory(arr);
}

// sessions
function createSession(phone, role='guest'){
  const s = loadSessions();
  const token = uuidv4();
  s[token] = { phone, role, created: Date.now() };
  saveSessions(s);
  return token;
}

function getIp(req){
  const xff = req.headers['x-forwarded-for'];
  if (xff) return xff.split(',')[0].trim();
  return req.socket.remoteAddress;
}

// dynamic admin key based on HHMM digits
function generateTimeBasedKey(){
  const now = new Date();
  const hh = String(now.getHours()).padStart(2,'0');
  const mm = String(now.getMinutes()).padStart(2,'0');
  const hhmm = hh + mm;
  let out = '';
  for (const ch of hhmm){
    const d = parseInt(ch,10);
    if (d % 2 === 0) out += String(Math.floor(d/2));
    else out += String(d % 3);
  }
  return 'K' + out;
}

// ========== BINANCE FETCH (FUTURES) ==========
async function fetchKlines(symbol, interval='15m', limit=200){
  try {
    const url = `https://fapi.binance.com/fapi/v1/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    const res = await axios.get(url, { timeout: 20000 });
    return res.data.map(c => ({
      t: c[0],
      open: parseFloat(c[1]),
      high: parseFloat(c[2]),
      low: parseFloat(c[3]),
      close: parseFloat(c[4]),
      vol: parseFloat(c[5])
    }));
  } catch (e) {
    console.log('fetchKlines err', e.message);
    return [];
  }
}

// ========== PA/ICT helpers (simplified but preserved) ==========
function detectBOS(candles, lookback=20){
  if (candles.length < lookback) return null;
  const slice = candles.slice(-lookback);
  const last = slice[slice.length-1];
  const highs = slice.map(c=>c.high);
  const lows = slice.map(c=>c.low);
  const recentHigh = Math.max(...highs.slice(0, highs.length-1));
  const recentLow = Math.min(...lows.slice(0, lows.length-1));
  if (last.close > recentHigh) return {type:'BOS_UP', price: last.close};
  if (last.close < recentLow) return {type:'BOS_DOWN', price: last.close};
  return null;
}
function detectOrderBlock(candles){
  if (candles.length < 6) return {};
  const last5 = candles.slice(-6, -1);
  const blocks = {bullish:null,bearish:null};
  for (let i=0;i<last5.length;i++){
    const c = last5[i];
    const body = Math.abs(c.close - c.open);
    const range = c.high - c.low || 1e-9;
    if (body > range*0.6){
      if (c.close > c.open) blocks.bullish = c;
      else blocks.bearish = c;
    }
  }
  return blocks;
}
function detectFVG(candles){
  if (candles.length < 5) return null;
  for (let i = candles.length-3; i >= 2; i--){
    const c = candles[i];
    const c2 = candles[i-2];
    if (!c || !c2) continue;
    if (c.low > c2.high) return {type:'FVG_UP', idx:i, low:c2.high, high:c.low};
    if (c.high < c2.low) return {type:'FVG_DOWN', idx:i, low:c.high, high:c2.low};
  }
  return null;
}
function detectSweep(candles){
  if (candles.length < 3) return null;
  const last = candles[candles.length-1], prev = candles[candles.length-2];
  if (last.high > prev.high && last.close < prev.close) return 'LIQUIDITY_SWEEP_TOP';
  if (last.low < prev.low && last.close > prev.close) return 'LIQUIDITY_SWEEP_BOTTOM';
  return null;
}
function detectCandlePattern(candles){
  const n = candles.length;
  if (n < 2) return null;
  const last = candles[n-1], prev = candles[n-2];
  const body = Math.abs(last.close - last.open);
  const range = last.high - last.low || 1e-9;
  const upper = last.high - Math.max(last.open,last.close);
  const lower = Math.min(last.open,last.close) - last.low;
  if (body < range*0.3 && upper > lower*2) return 'ShootingStar';
  if (body < range*0.3 && lower > upper*2) return 'Hammer';
  if (last.close > prev.open && last.open < prev.close && last.close > last.open) return 'BullishEngulfing';
  if (last.close < prev.open && last.open > prev.close && last.close < last.open) return 'BearishEngulfing';
  return null;
}

function computeConfidence({bos, fvg, pattern, ob, sweep}){
  let score = 0;
  if (bos) score += 2;
  if (fvg) score += 1;
  if (pattern) score += 1;
  if (sweep) score += 1;
  if (ob && (ob.bullish || ob.bearish)) score += 1;
  return score;
}

function generateIdea(symbol, price, ict, fvg, pattern, bos, ob, sweep){
  let dir = null;
  if ((bos && bos.type === 'BOS_UP') || (fvg && fvg.type === 'FVG_UP') || (pattern && /Bull|Hammer/.test(pattern))) dir='LONG';
  if ((bos && bos.type === 'BOS_DOWN') || (fvg && fvg.type === 'FVG_DOWN') || (pattern && /Bear|Shooting/.test(pattern))) dir='SHORT';
  if (!dir) return {ok:false, reason:'No confluence'};
  const entry = price;
  const sl = dir==='LONG' ? +(price*0.99).toFixed(2) : +(price*1.01).toFixed(2);
  const tp = dir==='LONG' ? +(price*1.02).toFixed(2) : +(price*0.98).toFixed(2);
  const rr = Math.abs((tp-entry)/(entry-sl)).toFixed(2);
  const note = `${dir} reason:${bos?bos.type:''} ${fvg?fvg.type:''} ${pattern||''}`;
  const conf = computeConfidence({bos,fvg,pattern,ob,sweep});
  return {ok:true, symbol, dir, entry, sl, tp, rr, note, confidence:conf};
}

async function fullAnalysis(symbol){
  const klines15 = await fetchKlines(symbol,'15m',200);
  if (!klines15.length) return {ok:false, reason:'no data'};
  const price = klines15[klines15.length-1].close;
  const bos15 = detectBOS(klines15,20);
  const ob15 = detectOrderBlock(klines15);
  const fvg15 = detectFVG(klines15);
  const sweep15 = detectSweep(klines15);
  const pattern15 = detectCandlePattern(klines15);
  const idea = generateIdea(symbol, price, bos15, fvg15, pattern15, bos15 || null, ob15, sweep15);
  return { ok:true, symbol, price, timeframe:'15m', bos15, ob15, fvg15, sweep15, pattern15, idea };
}

// quick backtest (simple)
async function quickBacktest(symbol='BTCUSDT', interval='15m', bars=500){
  const candles = await fetchKlines(symbol, interval, bars);
  if (!candles.length) return {ok:false, reason:'no data'};
  let wins=0, loses=0, total=0;
  for (let i=50;i<candles.length-3;i++){
    const slice = candles.slice(0,i+1);
    const bos = detectBOS(slice,20);
    if (bos && bos.type==='BOS_UP'){
      const entry = slice[slice.length-1].close;
      const sl = entry*0.99;
      const tp = entry*1.02;
      let hit=false, stop=false;
      for (let j=1;j<=10;j++){
        const c = candles[i+j];
        if (!c) break;
        if (c.low <= sl) { stop=true; break; }
        if (c.high >= tp) { hit=true; break; }
      }
      if (hit) wins++; else if (stop) loses++;
      total++;
    }
  }
  const winrate = total ? ((wins/total)*100).toFixed(2) : 0;
  return {ok:true,total,wins,loses,winrate};
}

// HISTORY / API
app.get('/api/history', (req,res) => {
  const h = readHistory();
  res.json({ok:true, history: h});
});

app.post('/api/scan', async (req,res) => {
  const { symbol } = req.body || {};
  if (!symbol) return res.status(400).json({ok:false, reason:'symbol required'});
  const r = await fullAnalysis(symbol.toUpperCase());
  if (!r.ok) return res.status(500).json({ok:false, reason:r.reason});
  if (r.idea && r.idea.ok) pushHistory({symbol:r.symbol, analysis:r, auto:false});
  io.emit('analysis', {symbol:r.symbol, analysis:r, ts:Date.now()});
  res.json({ok:true, analysis:r});
});

app.post('/api/login', (req,res) => {
  const { phone, key } = req.body || {};
  const ip = getIp(req);
  if (!phone) return res.status(400).json({ok:false, reason:'phone required'});
  // admin special phone
  if (phone === SPECIAL_PHONE){
    const dyn = generateTimeBasedKey();
    // if provided exact dynamic key -> grant admin session
    if (key && key === dyn){
      const token = createSession(phone, 'admin');
      return res.json({ok:true, token, role:'admin', phone});
    }
    // else check if keys file contains valid tokens for this phone (admin can create persistent keys)
    const keys = loadKeys();
    const found = keys.find(k => k.phone === phone && k.token === key && new Date(k.expiry).getTime() > Date.now());
    if (found){
      if (!found.allowedIp) { found.allowedIp = ip; saveKeys(keys); }
      if (found.allowedIp !== ip) return res.status(403).json({ok:false, reason:'Key used from different IP'});
      const token = createSession(phone, 'admin');
      return res.json({ok:true, token, role:'admin', phone});
    }
    // fallback: return guest token but with notice
    return res.json({ok:true, token:createSession(phone,'guest'), role:'guest', phone, notice:'dynamic key required for admin'});
  }
  // normal phone: check keys
  const keys = loadKeys();
  const f = keys.find(k => k.phone === phone && k.token === key && new Date(k.expiry).getTime() > Date.now());
  if (f){
    if (!f.allowedIp){ f.allowedIp = ip; saveKeys(keys); }
    if (f.allowedIp !== ip) return res.status(403).json({ok:false, reason:'Key bound to another IP'});
    const token = createSession(phone, 'user');
    return res.json({ok:true, token, role:'user', phone});
  }
  // no key -> guest
  const token = createSession(phone, 'guest');
  res.json({ok:true, token, role:'guest', phone});
});

app.post('/api/create-key', (req,res) => {
  const auth = (req.headers.authorization||'').replace(/^Bearer\s+/i,'');
  const sessions = loadSessions();
  const s = sessions[auth];
  if (!s || s.role !== 'admin') return res.status(403).json({ok:false, reason:'admin only'});
  const { type='week', phone } = req.body || {};
  let expiry = new Date();
  if (type === 'week') expiry.setDate(expiry.getDate()+7);
  else expiry.setDate(expiry.getDate()+30);
  const token = uuidv4().replace(/-/g,'').slice(0,16).toUpperCase();
  const keys = loadKeys();
  keys.push({ token, phone: phone || s.phone, type, expiry: expiry.toISOString(), allowedIp: null, createdAt: new Date().toISOString() });
  saveKeys(keys);
  res.json({ok:true, token, expiry: expiry.toISOString()});
});

app.get('/api/coins', (req,res) => {
  res.json({ok:true, coins: AUTO_COINS});
});

app.post('/api/backtest', async (req,res) => {
  const { symbol } = req.body || {};
  if (!symbol) return res.status(400).json({ok:false, reason:'symbol required'});
  const r = await quickBacktest(symbol.toUpperCase(), '15m', 500);
  res.json(r);
});

// auto-scan
async function autoScanAll(){
  try {
    for (const s of AUTO_COINS){
      const r = await fullAnalysis(s);
      if (!r.ok) continue;
      // check history replacement logic: if new confidence higher within 20min, remove old
      const hist = readHistory();
      const existing = hist.find(h => h.symbol === s && (Date.now() - h._time) < (20*60*1000));
      if (existing){
        if ((r.idea.confidence || 0) > (existing.analysis.idea.confidence || 0)){
          const keep = hist.filter(h => !(h.symbol===s && (Date.now() - h._time) < (20*60*1000)));
          saveHistory(keep);
        } else {
          // if existing is stronger, skip push
          continue;
        }
      }
      if (r.idea && r.idea.ok){
        pushHistory({symbol:s, analysis:r, auto:true});
        io.emit('analysis', {symbol:s, analysis:r, ts:Date.now()});
      }
    }
  } catch (e) { console.log('autoScanAll err', e.message); }
}

setInterval(autoScanAll, AUTO_INTERVAL_MIN * 60 * 1000);
autoScanAll();

// Serve client build (Vite build output = dist)
app.use(express.static(path.join(__dirname, "..", "client", "dist")));
app.get("*", (req,res) => {
  const indexFile = path.join(__dirname, "..", "client", "dist", "index.html");
  if (fs.existsSync(indexFile)) return res.sendFile(indexFile);
  return res.json({ok:true, msg: "API running"});
});

// start server
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log("Server running on port", PORT));

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);
  socket.on('disconnect', () => console.log('socket disconnected', socket.id));
});
