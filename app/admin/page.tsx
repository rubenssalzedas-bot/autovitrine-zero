"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type TipoVeiculo = "carro" | "moto";

export default function AdminPage() {
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

  /* =========================
     VEÍCULOS
  ========================== */
  async function carregarVeiculos(slug?: string) {
    let query = supabase
      .from("veiculos")
      .select("*")
      .order("created_at", { ascending: false });

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

  /* =========================
     CADASTRAR LOJA
  ========================== */
  async function cadastrarLoja(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;

    const { error } = await supabase.from("lojas").insert({
      slug: form.slug.value,
      nome: form.nome.value,
      whatsapp: form.whatsapp.value,
      cor: form.cor.value,
      logo: ""
    });

    if (error) {
      alert("❌ Erro ao cadastrar loja: " + error.message);
    } else {
      alert("✅ Loja cadastrada com sucesso");
      form.reset();
      carregarLojas();
    }
  }

  /* =========================
     CADASTRAR / EDITAR VEÍCULO
  ========================== */
  async function salvarVeiculo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    const form = e.currentTarget;

    const payload: any = {
      tipo: tipoSelecionado,
      modelo: form.modelo.value,
      ano: form.ano.value,
      preco: form.preco.value,
      observacoes: form.observacoes.value,
      loja_slug: form.loja_slug.value
    };

    if (tipoSelecionado === "carro") {
      payload.km = form.km.value;
      payload.cambio = form.cambio.value;
      payload.combustivel = form.combustivel.value;
    }

    if (tipoSelecionado === "moto") {
      payload.cilindrada = form.cilindrada.value;
      payload.partida = form.partida.value;
      payload.freio = form.freio.value;
    }

    const result = editando
      ? await supabase.from("veiculos").update(payload).eq("id", editando.id)
      : await supabase.from("veiculos").insert(payload);

    if (result.error) {
      alert("❌ Erro ao salvar veículo");
    } else {
      alert(editando ? "✅ Veículo atualizado" : "✅ Veículo cadastrado");
      form.reset();
      setEditando(null);
      setTipoSelecionado("carro");
      carregarVeiculos(lojaFiltro);
    }

    setLoading(false);
  }

  /* =========================
     EDITAR / EXCLUIR
  ========================== */
  function editarVeiculo(v: any) {
    setEditando(v);
    setTipoSelecionado(v.tipo);
  }

  async function excluirVeiculo(id: string) {
    if (!confirm("Tem certeza que deseja excluir este veículo?")) return;
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

  return (
    <main style={{ padding: 30, maxWidth: 1100, margin: "0 auto" }}>
      <h1>Painel Admin – AutoVitrine</h1>

      {/* ===== CADASTRAR LOJA ===== */}
      <section>
        <h2>Cadastrar Loja</h2>
        <form onSubmit={cadastrarLoja}>
          <input name="slug" placeholder="slug-da-loja" required style={inputStyle} />
          <input name="nome" placeholder="Nome da loja" required style={inputStyle} />
          <input name="whatsapp" placeholder="5511999999999" required style={inputStyle} />
          <input type="color" name="cor" defaultValue="#294460" />
          <br /><br />
          <button>Cadastrar Loja</button>
        </form>
      </section>

      <hr style={{ margin: "40px 0" }} />

      {/* ===== FILTRO ===== */}
      <section>
        <label>Filtrar por loja</label>
        <select
          value={lojaFiltro}
          onChange={(e) => setLojaFiltro(e.target.value)}
          style={inputStyle}
        >
          <option value="">Todas as lojas</option>
          {lojas.map((l) => (
            <option key={l.slug} value={l.slug}>
              {l.nome}
            </option>
          ))}
        </select>
      </section>

      <hr style={{ margin: "40px 0" }} />

      {/* ===== VEÍCULO ===== */}
      <section>
        <h2>{editando ? "Editar Veículo" : "Cadastrar Veículo"}</h2>

        <form onSubmit={salvarVeiculo}>
          <input
            name="loja_slug"
            placeholder="slug-da-loja"
            defaultValue={editando?.loja_slug || lojaFiltro}
            required
            style={inputStyle}
          />

          <select
            value={tipoSelecionado}
            onChange={(e) => setTipoSelecionado(e.target.value as TipoVeiculo)}
            style={inputStyle}
          >
            <option value="carro">Carro</option>
            <option value="moto">Moto</option>
          </select>

          <input name="modelo" placeholder="Modelo" defaultValue={editando?.modelo} required style={inputStyle} />
          <input name="ano" placeholder="Ano" defaultValue={editando?.ano} required style={inputStyle} />
          <input name="preco" placeholder="Preço" defaultValue={editando?.preco} required style={inputStyle} />

          {tipoSelecionado === "carro" && (
            <>
              <input name="km" placeholder="KM" defaultValue={editando?.km} style={inputStyle} />
              <input name="cambio" placeholder="Câmbio" defaultValue={editando?.cambio} style={inputStyle} />
              <input name="combustivel" placeholder="Combustível" defaultValue={editando?.combustivel} style={inputStyle} />
            </>
          )}

          {tipoSelecionado === "moto" && (
            <>
              <input name="cilindrada" placeholder="Cilindrada" defaultValue={editando?.cilindrada} style={inputStyle} />
              <input name="partida" placeholder="Partida" defaultValue={editando?.partida} style={inputStyle} />
              <input name="freio" placeholder="Freio" defaultValue={editando?.freio} style={inputStyle} />
            </>
          )}

          <textarea name="observacoes" placeholder="Observações" defaultValue={editando?.observacoes} style={inputStyle} />

          <br /><br />
          <button disabled={loading}>
            {loading ? "Salvando..." : editando ? "Salvar alterações" : "Cadastrar veículo"}
          </button>
        </form>
      </section>

      <hr style={{ margin: "40px 0" }} />

      {/* ===== LISTA ===== */}
      <section>
        <h2>Veículos</h2>

        {veiculos.map((v) => (
          <div key={v.id} style={{ display: "flex", justifyContent: "space-between", padding: 10 }}>
            <span>{v.modelo} {v.ano} • {v.tipo}</span>
            <div>
              <button onClick={() => editarVeiculo(v)}>Editar</button>{" "}
              <button onClick={() => excluirVeiculo(v.id)} style={{ color: "red" }}>
                Excluir
              </button>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
