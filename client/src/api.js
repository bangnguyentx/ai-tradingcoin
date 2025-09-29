import axios from "axios";
const instance = axios.create({ baseURL: "/api" });

instance.interceptors.request.use(cfg => {
  const admin = localStorage.getItem('adminToken');
  const user = localStorage.getItem('userToken');
  const token = admin || user;
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export default instance;
