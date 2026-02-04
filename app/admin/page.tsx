"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { QRCodeCanvas } from "qrcode.react";

export default function AdminPage() {
  const [qrUrl, setQrUrl] = useState("");
  const [tipoSelecionado, setTipoSelecionado] = useState<"carro" | "moto">("carro");

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

    // Campos específicos
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
    <main style={{ padding: 30, maxWidth: 700, margin: "0 auto" }}>
      <h1>Painel Admin – AutoVitrine</h1>

      {/* CADASTRO DE LOJA */}
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
          <input
            name="whatsapp"
            required
            placeholder="5511999999999"
            style={inputStyle}
          />

          <label style={{ marginTop: 15, display: "block" }}>
            Cor da Loja
          </label>
          <input type="color" name="cor" defaultValue="#294460" />

          <br /><br />
          <button type="submit">Cadastrar Loja</button>
        </form>
      </section>

      <hr style={{ margin: "40px 0" }} />

      {/* CADASTRO DE VEÍCULO */}
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
            required
            style={inputStyle}
            value={tipoSelecionado}
            onChange={(e) => setTipoSelecionado(e.target.value as any)}
          >
            <option value="carro">Carro</option>
            <option value="moto">Moto</option>
          </select>

          <label style={{ marginTop: 15, display: "block" }}>
            Modelo
          </label>
          <input name="modelo" required style={inputStyle} />

          <label style={{ marginTop: 15, display: "block" }}>
            Ano
          </label>
          <input name="ano" required style={inputStyle} />

          <label style={{ marginTop: 15, display: "block" }}>
            Preço
          </label>
          <input name="preco" required style={inputStyle} />

          {/* CAMPOS DE CARRO */}
          {tipoSelecionado === "carro" && (
            <>
              <label style={{ marginTop: 15, display: "block" }}>
                KM
              </label>
              <input name="km" style={inputStyle} />

              <label style={{ marginTop: 15, display: "block" }}>
                Câmbio
              </label>
              <input name="cambio" style={inputStyle} />

              <label style={{ marginTop: 15, display: "block" }}>
                Combustível
              </label>
              <input name="combustivel" style={inputStyle} />
            </>
          )}

          {/* CAMPOS DE MOTO */}
          {tipoSelecionado === "moto" && (
            <>
              <label style={{ marginTop: 15, display: "block" }}>
                Cilindrada
              </label>
              <input name="cilindrada" style={inputStyle} />

              <label style={{ marginTop: 15, display: "block" }}>
                Partida
              </label>
              <input name="partida" placeholder="Elétrica / Pedal" style={inputStyle} />

              <label style={{ marginTop: 15, display: "block" }}>
                Freio
              </label>
              <input name="freio" placeholder="ABS / Disco / Tambor" style={inputStyle} />
            </>
          )}

          <label style={{ marginTop: 15, display: "block" }}>
            Observações
          </label>
          <textarea name="observacoes" style={inputStyle} />

          <br /><br />
          <button type="submit">Cadastrar Veículo</button>
        </form>
      </section>

      {/* QR CODE */}
      {qrUrl && (
        <section style={{ marginTop: 40, textAlign: "center" }}>
          <h3>QR Code do Veículo</h3>
          <QRCodeCanvas value={qrUrl} size={220} />
          <p style={{ marginTop: 10 }}>{qrUrl}</p>
        </section>
      )}
    </main>
  );
}
