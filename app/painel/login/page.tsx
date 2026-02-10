"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  async function fazerLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha
    });

    if (error) {
      setErro("Email ou senha inválidos");
      return;
    }

    router.push("/painel");
  }

  return (
    <main style={{ maxWidth: 400, margin: "80px auto", padding: 20 }}>
      <h1>Painel do Lojista</h1>

      <form onSubmit={fazerLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", padding: 12, marginBottom: 10 }}
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
          style={{ width: "100%", padding: 12, marginBottom: 10 }}
        />

        {erro && <p style={{ color: "red" }}>{erro}</p>}

        <button
          type="submit"
          style={{
            width: "100%",
            padding: 12,
            background: "#294460",
            color: "#fff",
            border: "none",
            fontWeight: "bold"
          }}
        >
          Entrar
        </button>
      </form>
    </main>
  );
}
