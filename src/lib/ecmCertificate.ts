// Generates a printable ECM certificate following Allegato C format.
// Opens in a new window; user prints → Save as PDF.

export interface CertificateData {
  fullName: string;
  codiceFiscale: string;
  professione: string;
  disciplina: string;
  employment: string; // libero_professionista | dipendente | convenzionato
  courseTitle: string;
  cohortName: string;
  credits: number;
  quizPassedAt: string; // ISO date string
  providerName: string;
}

export function generateCertificate(data: CertificateData) {
  const dateStr = new Date(data.quizPassedAt).toLocaleDateString("it-IT", {
    day: "2-digit", month: "long", year: "numeric",
  });

  const empLabel: Record<string, string> = {
    libero_professionista: "Libero/a professionista",
    dipendente: "Dipendente",
    convenzionato: "Convenzionato/a",
    privo: "Privo di occupazione",
  };

  const html = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8" />
  <title>Attestato ECM — ${data.fullName}</title>
  <style>
    @page { size: A4; margin: 20mm 20mm 20mm 20mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; color: #111; background: white; }
    .page { width: 100%; min-height: 257mm; padding: 0; position: relative; }
    .header { display: flex; align-items: flex-start; justify-content: space-between; border-bottom: 2px solid #1a1a2e; padding-bottom: 12px; margin-bottom: 24px; }
    .header-logo { font-size: 9pt; color: #666; max-width: 200px; line-height: 1.4; }
    .header-logo strong { font-size: 11pt; color: #1a1a2e; }
    .cert-num { font-size: 9pt; text-align: right; color: #555; }
    .title { text-align: center; font-size: 15pt; font-weight: bold; font-style: italic; margin-bottom: 28px; color: #1a1a2e; }
    .intro { text-align: center; font-size: 11pt; margin-bottom: 8px; color: #333; }
    .provider { text-align: center; font-size: 13pt; font-weight: bold; margin-bottom: 20px; }
    .attesta { text-align: center; font-size: 14pt; font-weight: bold; letter-spacing: 0.15em; margin: 20px 0; color: #1a1a2e; }
    .participant { text-align: center; }
    .participant .name { font-size: 16pt; font-weight: bold; margin-bottom: 4px; }
    .participant .cf { font-size: 11pt; color: #555; margin-bottom: 4px; }
    .participant .role { font-size: 11pt; margin-bottom: 20px; color: #333; }
    .credits-box { text-align: center; margin: 28px 0; padding: 20px; border: 2px solid #1a1a2e; border-radius: 4px; }
    .credits-number { font-size: 28pt; font-weight: bold; color: #1a1a2e; }
    .credits-label { font-size: 11pt; color: #555; margin-top: 4px; }
    .credits-note { font-size: 9pt; color: #666; margin-top: 8px; font-style: italic; }
    .details { margin: 20px 0; border-top: 1px solid #ddd; padding-top: 16px; }
    .detail-row { display: flex; gap: 8px; margin-bottom: 6px; font-size: 11pt; }
    .detail-label { font-weight: bold; min-width: 140px; color: #333; }
    .footer { margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-end; }
    .footer-date { font-size: 11pt; }
    .footer-sig { text-align: right; }
    .footer-sig .sig-line { border-top: 1px solid #111; width: 200px; margin-top: 40px; margin-left: auto; padding-top: 6px; font-size: 10pt; }
    .disclaimer { margin-top: 28px; border-top: 1px solid #eee; padding-top: 12px; font-size: 8pt; color: #888; font-style: italic; line-height: 1.5; text-align: center; }
    .ecm-logo { font-size: 10pt; font-weight: bold; letter-spacing: 0.1em; }
    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="background:#f5f5f5;padding:12px 20px;text-align:center;font-family:sans-serif;font-size:13px;color:#555;border-bottom:1px solid #ddd;">
    Per salvare come PDF: <strong>File → Stampa → Salva come PDF</strong> &nbsp;|&nbsp;
    <button onclick="window.print()" style="padding:6px 16px;background:#3b5bdb;color:white;border:none;border-radius:6px;cursor:pointer;font-size:13px;">🖨 Stampa / Salva PDF</button>
  </div>

  <div class="page" style="padding:20px;">
    <div class="header">
      <div class="header-logo">
        <strong>Programma ECM — Formazione Continua in Medicina</strong><br/>
        Commissione Nazionale per la Formazione Continua — AGENAS
      </div>
      <div class="cert-num">
        <span class="ecm-logo">E.C.M.</span><br/>
        Data acquisizione: ${dateStr}
      </div>
    </div>

    <div class="title">Attestato di acquisizione dei crediti formativi E.C.M.</div>

    <div class="intro">Premesso che il Provider ha organizzato l'evento formativo:</div>
    <div class="provider">${data.courseTitle} — ${data.cohortName}</div>
    <div class="intro">nella tipologia <em>Formazione a Distanza (FAD)</em></div>

    <div class="attesta">ATTESTA</div>

    <div class="participant">
      <div class="name">${data.fullName}</div>
      <div class="cf">C.F. ${data.codiceFiscale}</div>
      <div class="role">in qualità di ${empLabel[data.employment] ?? data.employment}</div>
    </div>

    <div class="credits-box">
      <div class="credits-number">${data.credits}</div>
      <div class="credits-label">Crediti Formativi E.C.M.</div>
      <div class="credits-note">
        secondo i parametri stabiliti dai "Criteri per l'assegnazione dei crediti alle attività ECM"<br/>
        allegati all'Accordo Stato Regioni del 02/02/2017
      </div>
    </div>

    <div class="details">
      <div class="detail-row"><span class="detail-label">Professione:</span><span>${data.professione}</span></div>
      <div class="detail-row"><span class="detail-label">Disciplina:</span><span>${data.disciplina}</span></div>
      <div class="detail-row"><span class="detail-label">Data acquisizione:</span><span>${dateStr}</span></div>
      <div class="detail-row"><span class="detail-label">Tipo partecipazione:</span><span>Partecipante non reclutato</span></div>
    </div>

    <div class="footer">
      <div class="footer-date">
        Milano, ${dateStr}<br/>
        <em>${data.providerName}</em>
      </div>
      <div class="footer-sig">
        <div class="sig-line">Il Responsabile Scientifico<br/>(Firma)</div>
      </div>
    </div>

    <div class="disclaimer">
      Ai sensi del par. 4.12 del Manuale Nazionale di accreditamento per l'erogazione di eventi ECM, il presente
      attestato non costituisce un titolo sufficiente all'abilitazione all'esercizio di una specifica pratica sanitaria
      e non è esaustiva dell'obbligo di garantire la sicurezza nei confronti dei cittadini, salvo i casi previsti per legge.
    </div>
  </div>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}
