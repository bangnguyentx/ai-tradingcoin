import React, { useEffect, useState } from "react";

function Hello() {
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/hello")
      .then((res) => res.json())
      .then((data) => setMsg(data.message))
      .catch(() => setMsg("❌ API Error"));
  }, []);

  return <p>{msg}</p>;
}

export default Hello;
