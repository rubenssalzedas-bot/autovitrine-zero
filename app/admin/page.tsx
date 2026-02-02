"use client";

import { supabase } from "@/lib/supabase";
import { useState } from "react";


export default function AdminPage() {

  const [mensagem, setMensagem] = useState("");
  const [qrUrl, setQrUrl] = useState("");


  const cardStyle = {
    background: "#fff",
    padding: 25,
    borderRadius: 16,
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    marginBottom: 30
  };

  const inputStyle = {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    border: "1px solid #ddd",
    marginTop: 5
  };

  const buttonStyle = {
    background: "#294460",
    color: "#fff",
    padding: "14px 20px",
    borderRadius: 12,
    border: "none",
    fontWeight: "bold",
    cursor: "pointer",
    width: "100%",
    marginTop: 10
  };

  return (
    <main style={{
      maxWidth: 700,
      margin: "0 auto",
      padding: 30,
      fontFamily: "Arial, sans-serif",
      background: "#f4f6f9",
      minHeight: "100vh"
    }}>

      <h1 style={{ textAlign: "center", marginBottom: 30 }}>
        Painel Admin AutoVitrine
      </h1>

      {mensagem && (
        <p style={{
          background: "#e6f4ea",
          padding: 15,
          borderRadius: 10,
          textAlign: "center",
          marginBottom: 20
        }}>
          {mensagem}
        </p>
      )}

      {/* ================= LOJA ================= */}

      <div style={cardStyle}>

        <h2>Cadastrar Loja</h2>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.target as any;

            const novaLoja = {
              slug: form.slug.value.trim(),
              nome: form.nome.value.trim(),
              whatsapp: form.whatsapp.value.trim(),
              cor: form.cor.value,
              logo: form.logo.value.trim()
            };

            const { error } = await supabase
              .from("lojas")
              .insert([novaLoja]);

            if (error) {
            console.error(error);
            alert(error.message);
            setMensagem("Erro ao cadastrar loja");
         } else {

             setMensagem("Loja cadastrada com sucesso!");

  const linkLoja = `${window.location.origin}/loja/${novaLoja.slug}`;

        form.reset();
        }
          }}
        >

          <label>Slug da Loja</label>
          <input name="slug" required style={inputStyle} />

          <label style={{ marginTop: 15, display: "block" }}>Nome da Loja</label>
          <input name="nome" required style={inputStyle} />

          <label style={{ marginTop: 15, display: "block" }}>WhatsApp</label>
          <input name="whatsapp" required style={inputStyle} />

          <label style={{ marginTop: 15, display: "block" }}>Cor da Loja</label>
          <input type="color" name="cor" defaultValue="#294460" style={{ marginTop: 10 }} />

          <label style={{ marginTop: 15, display: "block" }}>Logo URL</label>
          <input name="logo" style={inputStyle} />

          <button type="submit" style={buttonStyle}>
            Cadastrar Loja
          </button>

        </form>
        {qrUrl && (
  <div style={{
    marginTop: 20,
    textAlign: "center",
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
  }}>
    <h3>QR Code da Loja</h3>

    <img src={qrUrl} alt="QR Code da Loja" />

    <p style={{ marginTop: 10 }}>
      Escaneie para abrir a loja
    </p>
  </div>
)}


      </div>

      {/* ================= VEÍCULO ================= */}

      <div style={cardStyle}>

        <h2>Cadastrar Veículo</h2>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.target as any;

            const novoVeiculo = {
  loja_slug: form.loja_slug.value.trim(),
  tipo: form.tipo.value,
  modelo: form.modelo.value.trim(),
  ano: Number(form.ano.value),
  preco: form.preco.value.trim(),
  km: form.km.value.trim(),
  cambio: form.cambio.value.trim(),
  combustivel: form.combustivel.value.trim(),
  observacoes: form.observacoes.value.trim()
};


            const { error } = await supabase
              .from("veiculos")
              .insert([novoVeiculo]);

            if (error) {
           console.error(error);
           alert(error.message);
           setMensagem("Erro ao cadastrar veículo");
        } else {

              setMensagem("Veículo cadastrado com sucesso!");
              form.reset();
            }
          }}
        >

          <label>Slug da Loja</label>
          <input name="loja_slug" required style={inputStyle} />

          <label style={{ marginTop: 15, display: "block" }}>Tipo</label>
          <select name="tipo" style={inputStyle}>
            <option value="carro">Carro</option>
            <option value="moto">Moto</option>
          </select>

          <label style={{ marginTop: 15, display: "block" }}>Modelo</label>
          <input name="modelo" required style={inputStyle} />

          <label style={{ marginTop: 15, display: "block" }}>Ano</label>
          <input name="ano" required style={inputStyle} />

          <label style={{ marginTop: 15, display: "block" }}>Preço</label>
          <input name="preco" required style={inputStyle} />
          <label style={{ marginTop: 15, display: "block" }}>KM</label>
<input name="km" style={inputStyle} />

<label style={{ marginTop: 15, display: "block" }}>Câmbio</label>
<input name="cambio" style={inputStyle} />

<label style={{ marginTop: 15, display: "block" }}>Combustível</label>
<input name="combustivel" style={inputStyle} />

<label style={{ marginTop: 15, display: "block" }}>Observações</label>
<textarea
  name="observacoes"
  rows={3}
  style={{ ...inputStyle, resize: "vertical" }}
/>


          <button type="submit" style={buttonStyle}>
            Cadastrar Veículo
          </button>

        </form>

      </div>

    </main>
  );
}
