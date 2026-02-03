"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { QRCodeCanvas } from "qrcode.react";
import jsPDF from "jspdf";

export default function CarroPage() {
  const params = useParams();
  const id = params.id as string;

  const [carro, setCarro] = useState<any>(null);
  const [qrPdfReady, setQrPdfReady] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function carregar() {
      const { data } = await supabase
        .from("veiculos")
        .select("*")
        .eq("id", id)
        .single();

      setCarro(data);
    }

    carregar();
  }, [id]);

function baixarPDF() {
  const pdf = new jsPDF();

  setQrPdfReady(true);

  setTimeout(() => {
  
    pdf.setFontSize(18);
    pdf.text(carro.modelo, 20, 20);

    pdf.setFontSize(12);
    pdf.text(`Ano: ${carro.ano}`, 20, 35);

    const canvas = document.getElementById("qr-pdf") as HTMLCanvasElement;
    const imgData = canvas.toDataURL("image/png");

    pdf.addImage(imgData, "PNG", 20, 55, 120, 120);
    pdf.text("Escaneie o QR Code para ver este veículo", 20, 185);

    pdf.save(`qr-${carro.modelo}-${Date.now()}.pdf`);

    setQrPdfReady(false);
  }, 300);
}


  if (!carro) {
    return <p style={{ padding: 40 }}>Carregando...</p>;
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return (
    <main style={{ padding: 20, maxWidth: 600, margin: "0 auto" }}>
      <h1>{carro.modelo}</h1>

      <p><strong>Ano:</strong> {carro.ano}</p>
      <p><strong>Preço:</strong> {carro.preco}</p>

      {carro.km && <p><strong>KM:</strong> {carro.km}</p>}
      {carro.cambio && <p><strong>Câmbio:</strong> {carro.cambio}</p>}
      {carro.combustivel && (
        <p><strong>Combustível:</strong> {carro.combustivel}</p>
      )}

      {carro.observacoes && (
        <>
          <hr />
          <p><strong>Observações:</strong></p>
          <p>{carro.observacoes}</p>
        </>
      )}

      <hr style={{ margin: "30px 0" }} />

      {/* QR VISÍVEL NA TELA */}
      <div style={{ textAlign: "center" }}>
        <QRCodeCanvas
          value={`${baseUrl}/carro/${id}`}
          size={220}
        />

        <br /><br />

        <button
          onClick={baixarPDF}
          style={{
            background: "#294460",
            color: "#fff",
            border: "none",
            padding: "14px 20px",
            borderRadius: 8,
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          Baixar QR Code em PDF
        </button>
      </div>

      {/* QR OCULTO — USADO SOMENTE PARA O PDF */}
      <div style={{ position: "absolute", left: -9999, top: -9999 }}>
        {qrPdfReady && (
          <QRCodeCanvas
            id="qr-pdf"
            value={`${baseUrl}/carro/${id}`}
            size={300}
          />
        )}
      </div>
    </main>
  );
}
