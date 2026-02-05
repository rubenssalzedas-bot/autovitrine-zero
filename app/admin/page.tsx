"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { QRCodeCanvas } from "qrcode.react";

type TipoVeiculo = "carro" | "moto";

export default function AdminPage() {
  const [tipoSelecionado, setTipoSelecionado] = useState<TipoVeiculo>("carro");
  const [veiculos, setVeiculos] = useState<any[]>([]);
  const [qrUrl, setQrUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [editando, setEditando] = useState<any>(null);

  /* =========================
     CARREGAR VEÍCULOS
  ========================== */
  async function carregarVeiculos() {
    const { data } = await supabase
      .from("veiculos")
      .select("*")
      .order("created_at", { ascending: false });

    setVeiculos(data || []);
  }

  useEffect(() => {
    carregarVeiculos();
  }, []);

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

    let result;

    if (editando) {
      result = await supabase
        .from("veiculos")
        .update(payload)
        .eq("id", editando.id);
    } else {
      result = await supabase.from("veiculos").insert(payload);
    }

    if (result.error) {
      alert("❌ Erro ao salvar veículo: " + result.error.message);
    } else {
      alert(editando ? "✅ Veículo atualizado" : "✅ Veículo cadastrado");

      form.reset();
      setTipoSelecionado("carro");
      setEditando(null);
      carregarVeiculos();
    }

    setLoading(false);
  }

  /* =========================
     EXCLUIR VEÍCULO
  ========================== */
  async function excluirVeiculo(id: string) {
    const confirmar = confirm("Tem certeza que deseja excluir este veículo?");
    if (!confirmar) return;

    await supabase.from("veiculos").delete().eq("id", id);
    carregarVeiculos();
  }

  function editarVeiculo(v: any) {
    setEditando(v);
    setTipoSelecionado(v.tipo);
  }

  const inputStyle = {
    width: "100%",
    padding: 10,
    marginTop: 5,
    borderRadius: 6,
    border: "1px solid #ccc"
  };

  return (
    <main style={{ padding: 30, maxWidth: 900, margin: "0 auto" }}>
      <h1>Painel Admin – AutoVitrine</h1>

      {/* ===== VEÍCULO ===== */}
      <section>
        <h2>{editando ? "Editar Veículo" : "Cadastrar Veículo"}</h2>

        <form onSubmit={salvarVeiculo}>
          <label>Slug da Loja</label>
          <input
            name="loja_slug"
            defaultValue={editando?.loja_slug}
            required
            style={inputStyle}
          />

          <label>Tipo</label>
          <select
            value={tipoSelecionado}
            onChange={(e) =>
              setTipoSelecionado(e.target.value as TipoVeiculo)
            }
            style={inputStyle}
          >
            <option value="carro">Carro</option>
            <option value="moto">Moto</option>
          </select>

          <label>Modelo</label>
          <input
            name="modelo"
            defaultValue={editando?.modelo}
            required
            style={inputStyle}
          />

          <label>Ano</label>
          <input
            name="ano"
            defaultValue={editando?.ano}
            required
            style={inputStyle}
          />

          <label>Preço</label>
          <input
            name="preco"
            defaultValue={editando?.preco}
            required
            style={inputStyle}
          />

          {tipoSelecionado === "carro" && (
            <>
              <label>KM</label>
              <input name="km" defaultValue={editando?.km} style={inputStyle} />

              <label>Câmbio</label>
              <input
                name="cambio"
                defaultValue={editando?.cambio}
                style={inputStyle}
              />

              <label>Combustível</label>
              <input
                name="combustivel"
                defaultValue={editando?.combustivel}
                style={inputStyle}
              />
            </>
          )}

          {tipoSelecionado === "moto" && (
            <>
              <label>Cilindrada</label>
              <input
                name="cilindrada"
                defaultValue={editando?.cilindrada}
                style={inputStyle}
              />

              <label>Partida</label>
              <input
                name="partida"
                defaultValue={editando?.partida}
                style={inputStyle}
              />

              <label>Freio</label>
              <input
                name="freio"
                defaultValue={editando?.freio}
                style={inputStyle}
              />
            </>
          )}

          <label>Observações</label>
          <textarea
            name="observacoes"
            defaultValue={editando?.observacoes}
            style={inputStyle}
          />

          <br /><br />
          <button type="submit" disabled={loading}>
            {editando ? "Salvar alterações" : "Cadastrar veículo"}
          </button>
        </form>
      </section>

      <hr style={{ margin: "40px 0" }} />

      {/* ===== LISTA ===== */}
      <section>
        <h2>Veículos cadastrados</h2>

        {veiculos.map((v) => (
          <div
            key={v.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: 10,
              borderBottom: "1px solid #ddd"
            }}
          >
            <span>
              {v.modelo} {v.ano} • {v.tipo}
            </span>

            <div>
              <button onClick={() => editarVeiculo(v)}>Editar</button>{" "}
              <button
                onClick={() => excluirVeiculo(v.id)}
                style={{ color: "red" }}
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
