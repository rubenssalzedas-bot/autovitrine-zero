"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const [mensagem, setMensagem] = useState("");

  async function cadastrarLoja(formData: FormData) {
    setMensagem("");

    const slug = String(formData.get("slug")).trim();
    const nome = String(formData.get("nome")).trim();
    const whatsapp = String(formData.get("whatsapp")).trim();
    const cor = String(formData.get("cor")).trim();

    if (!slug || !nome || !whatsapp) {
      setMensagem("Preencha todos os campos obrigatórios.");
      return;
    }

    const { error } = await supabase.from("lojas").insert({
      slug,
      nome,
      whatsapp,
      cor,
    });

    if (error) {
      setMensagem("Erro ao cadastrar loja: " + error.message);
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
      setMensagem("Preencha os campos obrigatórios do veículo.");
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
      setMensagem("Erro ao cadastrar veículo: " + error.message);
      return;
    }

    setMensagem("✅ Veículo cadastrado com sucesso!");
  }

  return (
    <main style={{ maxWidth: 700, margin: "0 auto", padding: 30 }}>
      <h1>Painel Admin — AutoVitrine</h1>

      {mensagem && (
        <p style={{ marginTop: 20, fontWeight: "bold" }}>{mensagem}</p>
      )}

      <hr style={{ margin: "30px 0" }} />

      {/* CADASTRAR LOJA */}
      <h2>Cadastrar Loja</h2>

      <form action={cadastrarLoja} style={{ display: "grid", gap: 10 }}>
        <input name="slug" placeholder="slug-da-loja" required />
        <input name="nome" placeholder="Nome da Loja" required />
        <input name="whatsapp" placeholder="WhatsApp (ex: 5511999999999)" required />
        <input name="cor" placeholder="Cor da loja (ex: #294460)" />

        <button type="submit">Cadastrar Loja</button>
      </form>

      <hr style={{ margin: "30px 0" }} />

      {/* CADASTRAR VEÍCULO */}
      <h2>Cadastrar Veículo</h2>

      <form action={cadastrarVeiculo} style={{ display: "grid", gap: 10 }}>
        <input name="loja_slug" placeholder="slug-da-loja" required />
        <input name="modelo" placeholder="Modelo do veículo" required />
        <input name="ano" type="number" placeholder="Ano" required />
        <input name="preco" placeholder="Preço" required />
        <input name="km" placeholder="KM" />
        <input name="cambio" placeholder="Câmbio" />
        <input name="combustivel" placeholder="Combustível" />
        <textarea name="observacoes" placeholder="Observações" />

        <button type="submit">Cadastrar Veículo</button>
      </form>
    </main>
  );
}
