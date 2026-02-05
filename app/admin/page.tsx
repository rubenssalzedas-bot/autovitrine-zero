"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type TipoVeiculo = "carro" | "moto";

export default function AdminPage() {
  /* ======================
     PROTEÇÃO POR SENHA
  ====================== */
  const SENHA_CORRETA =
    process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "senha-local-temporaria";

  const [autenticado, setAutenticado] = useState(false);
  const [senha, setSenha] = useState("");

  if (!autenticado) {
    return (
      <main style={{ padding: 40, maxWidth: 400, margin: "120px auto" }}>
        <h2>Área restrita</h2>

        <input
          type="password"
          placeholder="Digite a senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          style={{
            width: "100%",
            padding: 12,
            marginTop: 10,
            borderRadius: 6,
            border: "1px solid #ccc"
          }}
        />

        <button
          style={{
            marginTop: 15,
            width: "100%",
            padding: 12,
            background: "#294460",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontWeight: "bold",
            cursor: "pointer"
          }}
          onClick={() => {
            if (senha === SENHA_CORRETA) {
              setAutenticado(true);
            } else {
              alert("❌ Senha incorreta");
            }
          }}
        >
          Entrar
        </button>
      </main>
    );
  }

  /* ======================
     ESTADOS
  ====================== */
  const [lojas, setLojas] = useState<any[]>([]);
  const [veiculos, setVeiculos] = useState<any[]>([]);
  const [lojaFiltro, setLojaFiltro] = useState("");
  const [tipoSelecionado, setTipoSelecionado] =
    useState<TipoVeiculo>("carro");

  /* ======================
     CARREGAMENTO
  ====================== */
  useEffect(() => {
    carregarLojas();
  }, []);

  async function carregarLojas() {
    const { data } = await supabase
      .from("lojas")
      .select("slug, nome")
      .order("nome");
    setLojas(data || []);
  }

  async function carregarVeiculos(slug?: string) {
    let query = supabase.from("veiculos").select("*");
    if (slug) query = query.eq("loja_slug", slug);
    const { data } = await query;
    setVeiculos(data || []);
  }

  /* ======================
     UI
  ====================== */
  return (
    <main style={{ padding: 30 }}>
      <h1>Painel Admin – AutoVitrine</h1>

      <label>Filtrar por loja</label>
      <select
        value={lojaFiltro}
        onChange={(e) => {
          setLojaFiltro(e.target.value);
          carregarVeiculos(e.target.value);
        }}
      >
        <option value="">Todas</option>
        {lojas.map((l) => (
          <option key={l.slug} value={l.slug}>
            {l.nome}
          </option>
        ))}
      </select>

      <hr />

      <h2>Veículos</h2>
      {veiculos.map((v) => (
        <p key={v.id}>
          {v.modelo} ({v.tipo})
        </p>
      ))}
    </main>
  );
}
