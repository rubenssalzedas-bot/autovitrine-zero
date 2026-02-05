"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type TipoVeiculo = "carro" | "moto";

export default function AdminPage() {
  /* =====================
     PROTEÇÃO POR SENHA
  ====================== */
  const SENHA_CORRETA =
    process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "senha-local";

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

  /* =====================
     ESTADOS
  ====================== */
  const [lojas, setLojas] = useState<any[]>([]);
  const [veiculos, setVeiculos] = useState<any[]>([]);
  const [lojaFiltro, setLojaFiltro] = useState("");
  const [tipoSelecionado, setTipoSelecionado] =
    useState<TipoVeiculo>("carro");
  const [loading, setLoading] = useState(false);

  /* =====================
     CARREGAMENTO
  ====================== */
  useEffect(() => {
    carregarLojas();
    carregarVeiculos();
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

  /* =====================
     CADASTRAR VEÍCULO
  ====================== */
  async function cadastrarVeiculo(e: any) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    const f = e.target;

    const payload: any = {
      tipo: tipoSelecionado,
      modelo: f.modelo.value,
      ano: f.ano.value,
      preco: f.preco.value,
      observacoes: f.observacoes.value,
      loja_slug: f.loja_slug.value
    };

    if (tipoSelecionado === "carro") {
      payload.km = f.km.value;
      payload.cambio = f.cambio.value;
      payload.combustivel = f.combustivel.value;
    }

    if (tipoSelecionado === "moto") {
      payload.cilindrada = f.cilindrada.value;
      payload.partida = f.partida.value;
      payload.freio = f.freio.value;
    }

    const { error } = await supabase.from("veiculos").insert(payload);

    if (error) {
      alert("❌ Erro ao cadastrar veículo");
    } else {
      alert("✅ Veículo cadastrado");
      f.reset();
      carregarVeiculos(lojaFiltro);
    }

    setLoading(false);
  }

  async function excluirVeiculo(id: string) {
    if (!confirm("Excluir veículo?")) return;
    await supabase.from("veiculos").delete().eq("id", id);
    carregarVeiculos(lojaFiltro);
  }

  const inputStyle = {
    width: "100%",
    padding: 10,
    marginTop: 5,
    borderRadius: 6,
    border: "1px solid #ccc"
  };

  /* =====================
     RENDER ADMIN
  ====================== */
  return (
    <main style={{ padding: 30, maxWidth: 1100, margin: "0 auto" }}>
      <h1>Painel Admin – AutoVitrine</h1>

      <label>Filtrar por loja</label>
      <select
        value={lojaFiltro}
        onChange={(e) => {
          setLojaFiltro(e.target.value);
          carregarVeiculos(e.target.value);
        }}
        style={inputStyle}
      >
        <option value="">Todas</option>
        {lojas.map((l) => (
          <option key={l.slug} value={l.slug}>
            {l.nome}
          </option>
        ))}
      </select>

      <hr style={{ margin: 30 }} />

      <h2>Cadastrar Veículo</h2>
      <form onSubmit={cadastrarVeiculo}>
        <input name="loja_slug" placeholder="slug-da-loja" required style={inputStyle} />

        <select
          value={tipoSelecionado}
          onChange={(e) => setTipoSelecionado(e.target.value as TipoVeiculo)}
          style={inputStyle}
        >
          <option value="carro">Carro</option>
          <option value="moto">Moto</option>
        </select>

        <input name="modelo" placeholder="Modelo" required style={inputStyle} />
        <input name="ano" placeholder="Ano" required style={inputStyle} />
        <input name="preco" placeholder="Preço" required style={inputStyle} />
        <textarea name="observacoes" placeholder="Observações" style={inputStyle} />

        <br /><br />
        <button disabled={loading}>
          {loading ? "Salvando..." : "Cadastrar"}
        </button>
      </form>

      <hr style={{ margin: 30 }} />

      <h2>Veículos cadastrados</h2>
      {veiculos.map((v) => (
        <div key={v.id} style={{ display: "flex", justifyContent: "space-between" }}>
          <span>{v.modelo} ({v.tipo})</span>
          <button onClick={() => excluirVeiculo(v.id)} style={{ color: "red" }}>
            Excluir
          </button>
        </div>
      ))}
    </main>
  );
}
