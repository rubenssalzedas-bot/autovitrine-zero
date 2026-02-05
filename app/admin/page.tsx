"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type TipoVeiculo = "carro" | "moto";

export default function AdminPage() {
  const SENHA_CORRETA =
    process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "senha-local";

  const [autenticado, setAutenticado] = useState(false);
  const [senha, setSenha] = useState("");

  const [lojas, setLojas] = useState<any[]>([]);
  const [veiculos, setVeiculos] = useState<any[]>([]);
  const [lojaFiltro, setLojaFiltro] = useState("");
  const [tipoVeiculo, setTipoVeiculo] =
    useState<TipoVeiculo>("carro");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (autenticado) {
      carregarLojas();
      carregarVeiculos();
    }
  }, [autenticado]);

  async function carregarLojas() {
    const { data } = await supabase
      .from("lojas")
      .select("*")
      .order("nome");
    setLojas(data || []);
  }

  async function carregarVeiculos(slug?: string) {
    let query = supabase
      .from("veiculos")
      .select("*")
      .order("created_at", { ascending: false });

    if (slug) query = query.eq("loja_slug", slug);

    const { data } = await query;
    setVeiculos(data || []);
  }

  async function cadastrarLoja(e: any) {
    e.preventDefault();
    const f = e.target;

    const { error } = await supabase.from("lojas").insert({
      nome: f.nome.value,
      slug: f.slug.value,
      whatsapp: f.whatsapp.value,
      cor: f.cor.value
    });

    if (error) {
      alert("Erro ao cadastrar loja");
    } else {
      alert("Loja cadastrada");
      f.reset();
      carregarLojas();
    }
  }

  async function excluirLoja(slug: string) {
    if (!confirm("Excluir loja e seus veículos?")) return;
    await supabase.from("lojas").delete().eq("slug", slug);
    carregarLojas();
    carregarVeiculos();
  }

  async function cadastrarVeiculo(e: any) {
    e.preventDefault();
    setLoading(true);
    const f = e.target;

    const dados: any = {
      tipo: tipoVeiculo,
      modelo: f.modelo.value,
      ano: f.ano.value,
      preco: f.preco.value,
      observacoes: f.observacoes.value,
      loja_slug: f.loja_slug.value
    };

    if (tipoVeiculo === "carro") {
      dados.km = f.km.value;
      dados.cambio = f.cambio.value;
      dados.combustivel = f.combustivel.value;
    }

    if (tipoVeiculo === "moto") {
      dados.cilindrada = f.cilindrada.value;
      dados.partida = f.partida.value;
      dados.freio = f.freio.value;
    }

    const { error } = await supabase.from("veiculos").insert(dados);

    if (error) {
      alert("Erro ao cadastrar veículo");
    } else {
      alert("Veículo cadastrado");
      f.reset();
      carregarVeiculos(lojaFiltro);
    }

    setLoading(false);
  }

  if (!autenticado) {
    return (
      <main style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f3f4f6"
      }}>
        <div style={{
          background: "#fff",
          padding: 30,
          borderRadius: 10,
          width: 360,
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
        }}>
          <h2>Admin AutoVitrine</h2>

          <input
            type="password"
            placeholder="Senha"
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
              fontWeight: "bold"
            }}
            onClick={() =>
              senha === SENHA_CORRETA
                ? setAutenticado(true)
                : alert("Senha incorreta")
            }
          >
            Entrar
          </button>
        </div>
      </main>
    );
  }

  const cardStyle = {
    background: "#fff",
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
    boxShadow: "0 5px 15px rgba(0,0,0,0.05)"
  };

  const inputStyle = {
    width: "100%",
    padding: 10,
    marginTop: 8,
    borderRadius: 6,
    border: "1px solid #ccc"
  };

  return (
    <main style={{
      background: "#f3f4f6",
      minHeight: "100vh",
      padding: 30
    }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ marginBottom: 30 }}>Painel Admin – AutoVitrine</h1>

        <div style={cardStyle}>
          <h3>Cadastrar Loja</h3>
          <form onSubmit={cadastrarLoja}>
            <input name="nome" placeholder="Nome da loja" required style={inputStyle} />
            <input name="slug" placeholder="slug-da-loja" required style={inputStyle} />
            <input name="whatsapp" placeholder="WhatsApp" required style={inputStyle} />
            <input name="cor" type="color" style={{ marginTop: 10 }} />
            <button style={{ marginTop: 15 }}>Cadastrar</button>
          </form>
        </div>

        <div style={cardStyle}>
          <h3>Lojas</h3>
          {lojas.map(l => (
            <div key={l.id} style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{l.nome}</span>
              <button onClick={() => excluirLoja(l.slug)} style={{ color: "red" }}>
                Excluir
              </button>
            </div>
          ))}
        </div>

        <div style={cardStyle}>
          <h3>Cadastrar Veículo</h3>
          <form onSubmit={cadastrarVeiculo}>
            <select
              value={tipoVeiculo}
              onChange={(e) => setTipoVeiculo(e.target.value as TipoVeiculo)}
              style={inputStyle}
            >
              <option value="carro">Carro</option>
              <option value="moto">Moto</option>
            </select>

            <input name="loja_slug" placeholder="slug da loja" required style={inputStyle} />
            <input name="modelo" placeholder="Modelo" required style={inputStyle} />
            <input name="ano" placeholder="Ano" required style={inputStyle} />
            <input name="preco" placeholder="Preço" required style={inputStyle} />
            <textarea name="observacoes" placeholder="Observações" style={inputStyle} />

            <button style={{ marginTop: 15 }} disabled={loading}>
              {loading ? "Salvando..." : "Cadastrar Veículo"}
            </button>
          </form>
        </div>

        <div style={cardStyle}>
          <h3>Veículos Cadastrados</h3>
          {veiculos.map(v => (
            <div key={v.id} style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{v.modelo} ({v.tipo})</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
