"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type TipoVeiculo = "carro" | "moto";

export default function PainelLojista() {
  const router = useRouter();

  const [perfil, setPerfil] = useState<any>(null);
  const [veiculos, setVeiculos] = useState<any[]>([]);
  const [tipoSelecionado, setTipoSelecionado] = useState<TipoVeiculo>("carro");
  const [editando, setEditando] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  /* =========================
     CARREGAR PERFIL
  ========================== */
  async function carregarPerfil() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/painel/login");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!profile) {
      alert("Perfil não encontrado");
      return;
    }

    setPerfil(profile);
    carregarVeiculos(profile.loja_slug);
  }

  /* =========================
     VEÍCULOS
  ========================== */
  async function carregarVeiculos(slug: string) {
    const { data } = await supabase
      .from("veiculos")
      .select("*")
      .eq("loja_slug", slug)
      .order("created_at", { ascending: false });

    setVeiculos(data || []);
  }

  /* =========================
     SALVAR VEÍCULO
  ========================== */
  async function salvarVeiculo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!perfil || loading) return;

    setLoading(true);
    const form = e.currentTarget;

    const payload: any = {
      loja_slug: perfil.loja_slug,
      tipo: tipoSelecionado,
      modelo: form.modelo.value,
      ano: form.ano.value,
      preco: form.preco.value,
      observacoes: form.observacoes.value,
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
      alert("Erro ao salvar veículo");
    } else {
      alert(editando ? "Veículo atualizado" : "Veículo cadastrado");
      form.reset();
      setEditando(null);
      setTipoSelecionado("carro");
      carregarVeiculos(perfil.loja_slug);
    }

    setLoading(false);
  }

  async function excluirVeiculo(id: string) {
    if (!confirm("Excluir este veículo?")) return;
    await supabase.from("veiculos").delete().eq("id", id);
    carregarVeiculos(perfil.loja_slug);
  }

  function editarVeiculo(v: any) {
    setEditando(v);
    setTipoSelecionado(v.tipo);
  }

  useEffect(() => {
    carregarPerfil();
  }, []);

  if (!perfil) {
    return <p style={{ padding: 40 }}>Carregando painel...</p>;
  }

  const inputStyle = {
    width: "100%",
    padding: 10,
    marginTop: 5,
    borderRadius: 6,
    border: "1px solid #ccc",
  };

  return (
    <main style={{ padding: 30, maxWidth: 900, margin: "0 auto" }}>
      <h1>Painel da Loja</h1>
      <p><strong>Loja:</strong> {perfil.loja_slug}</p>

      <hr />

      <h2>{editando ? "Editar Veículo" : "Cadastrar Veículo"}</h2>

      <form onSubmit={salvarVeiculo}>
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

      <hr />

      <h2>Meus Veículos</h2>

      {veiculos.length === 0 && <p>Nenhum veículo cadastrado.</p>}

      {veiculos.map((v) => (
        <div key={v.id} style={{ display: "flex", justifyContent: "space-between", padding: 10 }}>
          <span>{v.modelo} • {v.ano}</span>
          <div>
            <button onClick={() => editarVeiculo(v)}>Editar</button>{" "}
            <button onClick={() => excluirVeiculo(v.id)} style={{ color: "red" }}>
              Excluir
            </button>
          </div>
        </div>
      ))}
    </main>
  );
}
