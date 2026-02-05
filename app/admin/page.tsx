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

  /* =========================
     CARREGAR VEÍCULOS
  ========================== */
  async function carregarVeiculos() {
    const { data, error } = await supabase
      .from("veiculos")
      .select("id, modelo, ano, tipo, loja_slug")
      .order("created_at", { ascending: false });

    if (!error) {
      setVeiculos(data || []);
    }
  }

  useEffect(() => {
    carregarVeiculos();
  }, []);

  /* =========================
     CADASTRAR LOJA
  ========================== */
  async function cadastrarLoja(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;

    const { error } = await supabase.from("lojas").insert({
      slug: (form.elements.namedItem("slug") as HTMLInputElement).value,
      nome: (form.elements.namedItem("nome") as HTMLInputElement).value,
      whatsapp: (form.elements.namedItem("whatsapp") as HTMLInputElement).value,
      cor: (form.elements.namedItem("cor") as HTMLInputElement).value,
      logo: ""
    });

    if (error) {
      alert("❌ Erro ao cadastrar loja: " + error.message);
    } else {
      alert("✅ Loja cadastrada com sucesso");
      form.reset();
    }
  }

  /* =========================
     CADASTRAR VEÍCULO
  ========================== */
  async function cadastrarVeiculo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);

    const form = e.currentTarget;

    const tipo = (form.elements.namedItem("tipo") as HTMLSelectElement)
      .value as TipoVeiculo;

    const payload: any = {
      tipo,
      modelo: (form.elements.namedItem("modelo") as HTMLInputElement).value,
      ano: (form.elements.namedItem("ano") as HTMLInputElement).value,
      preco: (form.elements.namedItem("preco") as HTMLInputElement).value,
      observacoes: (form.elements.namedItem("observacoes") as HTMLTextAreaElement)
        .value,
      loja_slug: (form.elements.namedItem("loja_slug") as HTMLInputElement).value
    };

    if (tipo === "carro") {
      payload.km = (form.elements.namedItem("km") as HTMLInputElement).value;
      payload.cambio = (form.elements.namedItem("cambio") as HTMLInputElement).value;
      payload.combustivel = (
        form.elements.namedItem("combustivel") as HTMLInputElement
      ).value;
    }

    if (tipo === "moto") {
      payload.cilindrada = (
        form.elements.namedItem("cilindrada") as HTMLInputElement
      ).value;
      payload.partida = (
        form.elements.namedItem("partida") as HTMLInputElement
      ).value;
      payload.freio = (form.elements.namedItem("freio") as HTMLInputElement).value;
    }

    const { data, error } = await supabase
      .from("veiculos")
      .insert(payload)
      .select()
      .single();

    if (error) {
      alert("❌ Erro ao cadastrar veículo: " + error.message);
      setLoading(false);
      return;
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    setQrUrl(`${baseUrl}/carro/${data.id}?loja=${data.loja_slug}`);

    alert("✅ Veículo cadastrado com sucesso");

    form.reset();
    setTipoSelecionado("carro");
    carregarVeiculos();
    setLoading(false);
  }

  /* =========================
     EXCLUIR VEÍCULO
  ========================== */
  async function excluirVeiculo(id: string) {
    const confirmar = confirm("Tem certeza que deseja excluir este veículo?");
    if (!confirmar) return;

    const { error } = await supabase
      .from("veiculos")
      .delete()
      .eq("id", id);

    if (error) {
      alert("❌ Erro ao excluir veículo");
    } else {
      alert("✅ Veículo excluído");
      carregarVeiculos();
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: 10,
    marginTop: 5,
    borderRadius: 6,
    border: "1px solid #ccc"
  };

  return (
    <main style={{ padding: 30, maxWidth: 900, margin: "0 auto" }}>
      <h1>Painel Admin – AutoVitrine</h1>

      {/* ===== CADASTRAR LOJA ===== */}
      <section>
        <h2>Cadastrar Loja</h2>

        <form onSubmit={cadastrarLoja}>
          <label>Slug da Loja</label>
          <input name="slug" required style={inputStyle} />

          <label>Nome da Loja</label>
          <input name="nome" required style={inputStyle} />

          <label>WhatsApp</label>
          <input name="whatsapp" required style={inputStyle} />

          <label>Cor</label>
          <input type="color" name="cor" defaultValue="#294460" />

          <br /><br />
          <button type="submit">Cadastrar Loja</button>
        </form>
      </section>

      <hr style={{ margin: "40px 0" }} />

      {/* ===== CADASTRAR VEÍCULO ===== */}
      <section>
        <h2>Cadastrar Veículo</h2>

        <form onSubmit={cadastrarVeiculo}>
          <label>Slug da Loja</label>
          <input name="loja_slug" required style={inputStyle} />

          <label>Tipo de Veículo</label>
          <select
            name="tipo"
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
          <input name="modelo" required style={inputStyle} />

          <label>Ano</label>
          <input name="ano" required style={inputStyle} />

          <label>Preço</label>
          <input name="preco" required style={inputStyle} />

          {tipoSelecionado === "carro" && (
            <>
              <label>KM</label>
              <input name="km" style={inputStyle} />

              <label>Câmbio</label>
              <input name="cambio" style={inputStyle} />

              <label>Combustível</label>
              <input name="combustivel" style={inputStyle} />
            </>
          )}

          {tipoSelecionado === "moto" && (
            <>
              <label>Cilindrada</label>
              <input name="cilindrada" style={inputStyle} />

              <label>Partida</label>
              <input name="partida" style={inputStyle} />

              <label>Freio</label>
              <input name="freio" style={inputStyle} />
            </>
          )}

          <label>Observações</label>
          <textarea name="observacoes" style={inputStyle} />

          <br /><br />
          <button type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Cadastrar Veículo"}
          </button>
        </form>
      </section>

      {/* ===== QR CODE ===== */}
      {qrUrl && (
        <section style={{ marginTop: 40, textAlign: "center" }}>
          <h3>QR Code do Veículo</h3>
          <QRCodeCanvas value={qrUrl} size={220} />
          <p>{qrUrl}</p>
        </section>
      )}

      <hr style={{ margin: "40px 0" }} />

      {/* ===== LISTA DE VEÍCULOS ===== */}
      <section>
        <h2>Veículos cadastrados</h2>

        {veiculos.length === 0 && <p>Nenhum veículo cadastrado.</p>}

        <ul style={{ listStyle: "none", padding: 0 }}>
          {veiculos.map((v) => (
            <li
              key={v.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 0",
                borderBottom: "1px solid #ddd"
              }}
            >
              <span>
                {v.modelo} {v.ano} • {v.tipo}
              </span>

              <button
                onClick={() => excluirVeiculo(v.id)}
                style={{
                  background: "#c0392b",
                  color: "#fff",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: 6,
                  cursor: "pointer"
                }}
              >
                Excluir
              </button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
