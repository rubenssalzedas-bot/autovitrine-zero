"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type TipoVeiculo = "carro" | "moto";

export default function AdminPage() {
  /* =====================
     🔐 SEGURANÇA
  ====================== */
  const SENHA_CORRETA =
    process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "senha-local";

  const [autenticado, setAutenticado] = useState(false);
  const [senha, setSenha] = useState("");

  /* =====================
     📦 ESTADOS
  ====================== */
  const [lojas, setLojas] = useState<any[]>([]);
  const [veiculos, setVeiculos] = useState<any[]>([]);
  const [lojaSelecionada, setLojaSelecionada] = useState("");
  const [tipoVeiculo, setTipoVeiculo] = useState<TipoVeiculo>("carro");
  const [editandoVeiculo, setEditandoVeiculo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  /* =====================
     🔄 LOAD INICIAL
  ====================== */
  useEffect(() => {
    if (autenticado) {
      carregarLojas();
      carregarVeiculos();
    }
  }, [autenticado]);

  async function carregarLojas() {
    const { data } = await supabase.from("lojas").select("*").order("nome");
    setLojas(data || []);
  }

  async function carregarVeiculos(slug?: string) {
    let query = supabase.from("veiculos").select("*").order("created_at", {
      ascending: false
    });
    if (slug) query = query.eq("loja_slug", slug);
    const { data } = await query;
    setVeiculos(data || []);
  }

  /* =====================
     🏬 LOJAS
  ====================== */
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

  /* =====================
     🚗 VEÍCULOS
  ====================== */
  async function salvarVeiculo(e: any) {
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

    if (editandoVeiculo) {
      await supabase
        .from("veiculos")
        .update(dados)
        .eq("id", editandoVeiculo.id);
      setEditandoVeiculo(null);
    } else {
      await supabase.from("veiculos").insert(dados);
    }

    alert("Veículo salvo");
    f.reset();
    carregarVeiculos(lojaSelecionada);
    setLoading(false);
  }

  async function excluirVeiculo(id: string) {
    if (!confirm("Excluir veículo?")) return;
    await supabase.from("veiculos").delete().eq("id", id);
    carregarVeiculos(lojaSelecionada);
  }

  /* =====================
     🔐 TELA DE LOGIN
  ====================== */
  if (!autenticado) {
    return (
      <main style={{ padding: 40, maxWidth: 400, margin: "120px auto" }}>
        <h2>Área restrita</h2>
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          style={{ width: "100%", padding: 12 }}
        />
        <button
          style={{ marginTop: 15, width: "100%", padding: 12 }}
          onClick={() =>
            senha === SENHA_CORRETA
              ? setAutenticado(true)
              : alert("Senha incorreta")
          }
        >
          Entrar
        </button>
      </main>
    );
  }

  /* =====================
     🖥️ ADMIN
  ====================== */
  return (
    <main style={{ padding: 30, maxWidth: 1200, margin: "0 auto" }}>
      <h1>Admin – AutoVitrine</h1>

      <hr />

      <h2>Cadastrar Loja</h2>
      <form onSubmit={cadastrarLoja}>
        <input name="nome" placeholder="Nome" required />
        <input name="slug" placeholder="slug-loja" required />
        <input name="whatsapp" placeholder="WhatsApp" required />
        <input name="cor" type="color" />
        <button>Cadastrar Loja</button>
      </form>

      <h3>Lojas</h3>
      {lojas.map((l) => (
        <div key={l.id}>
          {l.nome} ({l.slug})
          <button onClick={() => excluirLoja(l.slug)}>Excluir</button>
        </div>
      ))}

      <hr />

      <h2>Veículos</h2>
      <select
        onChange={(e) => {
          setLojaSelecionada(e.target.value);
          carregarVeiculos(e.target.value);
        }}
      >
        <option value="">Todas as lojas</option>
        {lojas.map((l) => (
          <option key={l.slug} value={l.slug}>
            {l.nome}
          </option>
        ))}
      </select>

      <form onSubmit={salvarVeiculo}>
        <select
          value={tipoVeiculo}
          onChange={(e) => setTipoVeiculo(e.target.value as TipoVeiculo)}
        >
          <option value="carro">Carro</option>
          <option value="moto">Moto</option>
        </select>

        <input name="loja_slug" placeholder="slug da loja" required />
        <input name="modelo" placeholder="Modelo" required />
        <input name="ano" placeholder="Ano" required />
        <input name="preco" placeholder="Preço" required />
        <textarea name="observacoes" placeholder="Observações" />

        {tipoVeiculo === "carro" && (
          <>
            <input name="km" placeholder="KM" />
            <input name="cambio" placeholder="Câmbio" />
            <input name="combustivel" placeholder="Combustível" />
          </>
        )}

        {tipoVeiculo === "moto" && (
          <>
            <input name="cilindrada" placeholder="Cilindrada" />
            <input name="partida" placeholder="Partida" />
            <input name="freio" placeholder="Freio" />
          </>
        )}

        <button disabled={loading}>
          {loading ? "Salvando..." : "Salvar Veículo"}
        </button>
      </form>

      <h3>Veículos cadastrados</h3>
      {veiculos.map((v) => (
        <div key={v.id}>
          {v.modelo} ({v.tipo})
          <button onClick={() => setEditandoVeiculo(v)}>Editar</button>
          <button onClick={() => excluirVeiculo(v.id)}>Excluir</button>
        </div>
      ))}
    </main>
  );
}
