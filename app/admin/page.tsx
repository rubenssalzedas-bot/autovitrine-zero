"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type TipoVeiculo = "carro" | "moto";

export default function AdminPage() {
  /* =========================
     PROTEÇÃO POR SENHA
  ========================== */
  const [autenticado, setAutenticado] = useState(false);
  const [senha, setSenha] = useState("");

  const senhaCorreta = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

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
            if (senha === senhaCorreta) {
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

  /* =========================
     ESTADOS DO ADMIN
  ========================== */
  const [tipoSelecionado, setTipoSelecionado] = useState<TipoVeiculo>("carro");
  const [veiculos, setVeiculos] = useState<any[]>([]);
  const [lojas, setLojas] = useState<any[]>([]);
  const [lojaFiltro, setLojaFiltro] = useState("");
  const [editando, setEditando] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  /* =========================
     LOJAS
  ========================== */
  async function carregarLojas() {
    const { data } = await supabase
      .from("lojas")
      .select("slug, nome")
      .order("nome");

    setLojas(data || []);
  }

  async function excluirLoja(slug: string) {
    if (!confirm("Excluir esta loja? Ela não pode ter veículos.")) return;

    const { error } = await supabase.from("lojas").delete().eq("slug", slug);

    if (error) {
      alert("❌ A loja possui veículos cadastrados");
    } else {
      alert("✅ Loja excluída");
      carregarLojas();
      setLojaFiltro("");
    }
  }

  /* =========================
     VEÍCULOS
  ========================== */
  async function carregarVeiculos(slug?: string) {
    let query = supabase.from("veiculos").select("*");

    if (slug) query = query.eq("loja_slug", slug);

    const { data } = await query;
    setVeiculos(data || []);
  }

  useEffect(() => {
    carregarLojas();
    carregarVeiculos();
  }, []);

  useEffect(() => {
    carregarVeiculos(lojaFiltro);
  }, [lojaFiltro]);

  async function salvarVeiculo(e: any) {
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

    const result = editando
      ? await supabase.from("veiculos").update(payload).eq("id", editando.id)
      : await supabase.from("veiculos").insert(payload);

    if (result.error) {
      alert("❌ Erro ao salvar veículo");
    } else {
      alert("✅ Veículo salvo");
      f.reset();
      setEditando(null);
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

  /* =========================
     RENDER ADMIN
  ========================== */
  return (
    <main style={{ padding: 30, maxWidth: 1100, margin: "0 auto" }}>
      <h1>Painel Admin – AutoVitrine</h1>

      <h2>Cadastrar Loja</h2>
      <form onSubmit={async (e: any) => {
        e.preventDefault();
        await supabase.from("lojas").insert({
          slug: e.target.slug.value,
          nome: e.target.nome.value,
          whatsapp: e.target.whatsapp.value,
          cor: e.target.cor.value,
          logo: ""
        });
        e.target.reset();
        carregarLojas();
      }}>
        <input name="slug" placeholder="slug-da-loja" required style={inputStyle} />
        <input name="nome" placeholder="Nome da loja" required style={inputStyle} />
        <input name="whatsapp" placeholder="5511999999999" required style={inputStyle} />
        <input type="color" name="cor" defaultValue="#294460" />
        <br /><br />
        <button>Cadastrar Loja</button>
      </form>

      <hr style={{ margin: 40 }} />

      <label>Filtrar por loja</label>
      <select
        value={lojaFiltro}
        onChange={(e) => setLojaFiltro(e.target.value)}
        style={inputStyle}
      >
        <option value="">Todas</option>
        {lojas.map((l) => (
          <option key={l.slug} value={l.slug}>{l.nome}</option>
        ))}
      </select>

      <hr style={{ margin: 40 }} />

      <h2>{editando ? "Editar Veículo" : "Cadastrar Veículo"}</h2>
      <form onSubmit={salvarVeiculo}>
        <input name="loja_slug" placeholder="slug-da-loja" defaultValue={lojaFiltro} required style={inputStyle} />
        <select value={tipoSelecionado} onChange={e => setTipoSelecionado(e.target.value as TipoVeiculo)} style={inputStyle}>
          <option value="carro">Carro</option>
          <option value="moto">Moto</option>
        </select>
        <input name="modelo" placeholder="Modelo" required style={inputStyle} />
        <input name="ano" placeholder="Ano" required style={inputStyle} />
        <input name="preco" placeholder="Preço" required style={inputStyle} />
        <textarea name="observacoes" placeholder="Observações" style={inputStyle} />
        <br /><br />
        <button>{loading ? "Salvando..." : "Salvar"}</button>
      </form>

      <hr style={{ margin: 40 }} />

      {veiculos.map(v => (
        <div key={v.id} style={{ display: "flex", justifyContent: "space-between" }}>
          <span>{v.modelo} {v.ano}</span>
          <button onClick={() => excluirVeiculo(v.id)} style={{ color: "red" }}>
            Excluir
          </button>
        </div>
      ))}
    </main>
  );
}
