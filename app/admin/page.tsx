"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { QRCodeCanvas } from "qrcode.react";

export default function AdminPage() {
  const [tipoSelecionado, setTipoSelecionado] = useState<"carro" | "moto">("carro");
  const [veiculos, setVeiculos] = useState<any[]>([]);
  const [qrUrl, setQrUrl] = useState("");

  /* =========================
     CARREGAR VEÍCULOS
  ========================== */
  async function carregarVeiculos() {
    const { data } = await supabase
      .from("veiculos")
      .select("id, modelo, ano, tipo, loja_slug")
      .order("created_at", { ascending: false });

    setVeiculos(data || []);
  }

  useEffect(() => {
    carregarVeiculos();
  }, []);

  /* =========================
     CADASTRAR LOJA
  ========================== */
  async function cadastrarLoja(e: any) {
    e.preventDefault();
    const form = e.target;

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
    }
  }

  /* =========================
     CADASTRAR VEÍCULO
  ========================== */
  async function cadastrarVeiculo(e: any) {
    e.preventDefault();
    const form = e.target;
    const tipo = form.tipo.value;

    const payload: any = {
      tipo,
      modelo: form.modelo.value,
      ano: form.ano.value,
      preco: form.preco.value,
      observacoes: form.observacoes.value,
      loja_slug: form.loja_slug.value
    };

    if (tipo === "carro") {
      payload.km = form.km.value;
      payload.cambio = form.cambio.value;
      payload.combustivel = form.combustivel.value;
    }

    if (tipo === "moto") {
      payload.cilindrada = form.cilindrada.value;
      payload.partida = form.partida.value;
      payload.freio = form.freio.value;
    }

    const { data, error } = await supabase
      .from("veiculos")
      .insert(payload)
      .select()
      .single();

    if (error) {
      alert("❌ Erro ao cadastrar veículo: " + error.message);
    } else {
      alert("✅ Veículo cadastrado com sucesso");

      const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

      setQrUrl(`${baseUrl}/carro/${data.id}?loja=${data.loja_slug}`);
      form.reset();
      setTipoSelecionado("carro");
      carregarVeiculos();
    }
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

  const inputStyle = {
    width: "100%",
    padding: 10,
    marginTop: 5,
    borderRadius: 6,
    border: "1px solid #ccc"
  };

  return (
    <main style={{ padding: 30, maxWidth: 800, margin: "0 auto" }}>
      <h1>Painel Admin – AutoVitrine</h1>

      {/* ================= LOJA ================= */}
      <section style={{ marginTop: 40 }}>
        <h2>Cadastrar Loja</h2>

        <form onSubmit={cadastrarLoja}>
          <label>Slug da Loja</label>
          <input name="slug" required style={inputStyle} />

          <label style={{ marginTop: 15, display: "block" }}>
            Nome da Loja
          </label>
          <input name="nome" required style={inputStyle} />

          <label style={{ marginTop: 15, display: "block" }}>
            WhatsApp
          </label>
          <input name="whatsapp" required style={inputStyle} />

          <label style={{ marginTop: 15, display: "block" }}>
            Cor da Loja
          </label>
          <input type="color" name="cor" defaultValue="#294460" />

          <br /><br />
          <button type="submit">Cadastrar Loja</button>
        </form>
      </section>

      <hr style={{ margin: "40px 0" }} />

      {/* ================= VEÍCULO ================= */}
      <section>
        <h2>Cadastrar Veículo</h2>

        <form onSubmit={cadastrarVeiculo}>
          <label>Slug da Loja</label>
          <input name="loja_slug" required style={inputStyle} />

          <label style={{ marginTop: 15, display: "block" }}>
            Tipo de Veículo
          </label>
          <select
            name="tipo"
            style={inputStyle}
            value={tipoSelecionado}
            onChange={(e) => setTipoSelecionado(e.target.value as any)}
          >
            <option value="carro">Carro</option>
            <option value="moto">Moto</option>
          </select>

          <label style={{ marginTop: 15 }}>Modelo</label>
          <input name="modelo" required style={inputStyle} />

          <label style={{ marginTop: 15 }}>Ano</label>
          <input name="ano" required style={inputStyle} />

          <label style={{ marginTop: 15 }}>Preço</label>
          <input name="preco" required style={inputStyle} />

          {tipoSelecionado === "carro" && (
            <>
              <label style={{ marginTop: 15 }}>KM</label>
              <input name="km" style={inputStyle} />

              <label style={{ marginTop: 15 }}>Câmbio</label>
              <input name="cambio" style={inputStyle} />

              <label style={{ marginTop: 15 }}>Combustível</label>
              <input name="combustivel" style={inputStyle} />
            </>
          )}

          {tipoSelecionado === "moto" && (
            <>
              <label style={{ marginTop: 15 }}>Cilindrada</label>
              <input name="cilindrada" style={inputStyle} />

              <label style={{ marginTop: 15 }}>Partida</label>
              <input name="partida" style={inputStyle} />

              <label style={{ marginTop: 15 }}>Freio</label>
              <input name="freio" style={inputStyle} />
            </>
          )}

          <label style={{ marginTop: 15 }}>Observações</label>
          <textarea name="observacoes" style={inputStyle} />

          <br /><br />
          <button type="submit">Cadastrar Veículo</button>
        </form>
      </section>

      {/* ================= QR ================= */}
      {qrUrl && (
        <section style={{ marginTop: 40, textAlign: "center" }}>
          <h3>QR Code do Veículo</h3>
          <QRCodeCanvas value={qrUrl} size={220} />
          <p style={{ marginTop: 10 }}>{qrUrl}</p>
        </section>
      )}

      <hr style={{ margin: "40px 0" }} />

      {/* ================= LISTA ================= */}
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
