"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

const boxStyle = {
  background: "#ffffff",
  padding: 24,
  borderRadius: 12,
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  marginBottom: 30
};

const inputStyle = {
  padding: "10px 12px",
  borderRadius: 6,
  border: "1px solid #ccc",
  fontSize: 14
};

const buttonStyle = {
  background: "#294460",
  color: "#fff",
  padding: "12px",
  borderRadius: 8,
  border: "none",
  cursor: "pointer",
  fontWeight: "bold",
  marginTop: 10
};

export default function AdminPage() {
  const [mensagem, setMensagem] = useState("");

  async function cadastrarLoja(formData: FormData) {
    setMensagem("");

    const slug = String(formData.get("slug")).trim();
    const nome = String(formData.get("nome")).trim();
    const whatsapp = String(formData.get("whatsapp")).trim();
    const cor = String(formData.get("cor")).trim();

    if (!slug || !nome || !whatsapp) {
      setMensagem("❌ Preencha todos os campos obrigatórios da loja.");
      return;
    }

    const { error } = await supabase.from("lojas").insert({
      slug,
      nome,
      whatsapp,
      cor,
    });

    if (error) {
      setMensagem("❌ Erro ao cadastrar loja: " + error.message);
      return;
    }

    setMensagem("✅ Loja cadastrada com sucesso!");
  }

  async function cadastrarVeiculo(formData: FormData) {
    setMensagem("");

    const loja_slug = String(formData.get("loja_slug")).trim();
    const modelo = String(formData.get("modelo")).trim();
    const ano = Number(formData.get("ano"));
    const preco = String(formData.get("preco")).trim();
    const km = String(formData.get("km")).trim();
    const cambio = String(formData.get("cambio")).trim();
    const combustivel = String(formData.get("combustivel")).trim();
    const observacoes = String(formData.get("observacoes")).trim();

    if (!loja_slug || !modelo || !ano || !preco) {
      setMensagem("❌ Preencha os campos obrigatórios do veículo.");
      return;
    }

    const { error } = await supabase.from("veiculos").insert({
      loja_slug,
      modelo,
      ano,
      preco,
      km,
      cambio,
      combustivel,
      observacoes,
    });

    if (error) {
      setMensagem("❌ Erro ao cadastrar veículo: " + error.message);
      return;
    }

    setMensagem("✅ Veículo cadastrado com sucesso!");
  }

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: 30 }}>
      <h1 style={{ marginBottom: 20 }}>Painel Administrativo — AutoVitrine</h1>

      {mensagem && (
        <p style={{ marginBottom: 20, fontWeight: "bold" }}>
          {mensagem}
        </p>
      )}

      {/* CADASTRO DE LOJA */}
      <section style={boxStyle}>
        <h2>Cadastrar Loja</h2>

        <form action={cadastrarLoja} style={{ display: "grid", gap: 10 }}>
          <input
            name="slug"
            placeholder="Slug da loja (ex: auto-centro-silva)"
            required
            style={inputStyle}
          />

          <input
            name="nome"
            placeholder="Nome da loja"
            required
            style={inputStyle}
          />

          <input
            name="whatsapp"
            placeholder="WhatsApp (ex: 5511999999999)"
            required
            style={inputStyle}
          />

          <label style={{ fontSize: 14, marginTop: 5 }}>
            Cor da loja
          </label>
          <input
            type="color"
            name="cor"
            defaultValue="#294460"
            style={{ height: 45, padding: 4 }}
          />

          <button type="submit" style={buttonStyle}>
            Salvar Loja
          </button>
        </form>
      </section>

      {/* CADASTRO DE VEÍCULO */}
      <section style={boxStyle}>
        <h2>Cadastrar Veículo</h2>

        <form action={cadastrarVeiculo} style={{ display: "grid", gap: 10 }}>
          <input
            name="loja_slug"
            placeholder="Slug da loja (ex: auto-centro-silva)"
            required
            style={inputStyle}
          />

          <input
            name="modelo"
            placeholder="Modelo do veículo"
            required
            style={inputStyle}
          />

          <input
            name="ano"
            type="number"
            placeholder="Ano"
            required
            style={inputStyle}
          />

          <input
            name="preco"
            placeholder="Preço (ex: R$ 75.000)"
            required
            style={inputStyle}
          />

          <input
            name="km"
            placeholder="KM"
            style={inputStyle}
          />

          <input
            name="cambio"
            placeholder="Câmbio"
            style={inputStyle}
          />

          <input
            name="combustivel"
            placeholder="Combustível"
            style={inputStyle}
          />

          <textarea
            name="observacoes"
            placeholder="Observações do veículo"
            style={{ ...inputStyle, minHeight: 80 }}
          />

          <button type="submit" style={buttonStyle}>
            Salvar Veículo
          </button>
        </form>
      </section>
    </main>
  );
}
