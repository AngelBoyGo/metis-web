import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import PDFDocument from "pdfkit";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "documents");
const outFile = path.join(outDir, "METIS_Capability_Statement.pdf");

const BODY = `================================================================================
METIS LLC // RE-ENGINEERING SYSTEMIC RELIABILITY
INSTITUTIONAL CAPABILITY STATEMENT // PUBLIC SECTOR ADVISORY
================================================================================

1. CORPORATE OVERVIEW
Metis LLC is an elite computational research and deployment house specializing in
deterministic machine intelligence architectures, hardware-accelerated edge inference,
and critical infrastructure cyber defense frameworks. Born out of the intersection
of frontline medical operations and advanced AI systems engineering, Metis builds
hardened, sovereign computing infrastructure designed for high-reliability sectors.

2. CORE CAPABILITIES
* CORE SYSTEMS ARCHITECTURE: Engineering custom kernel-level schedulers, high-
  performance tensor reduction engines, and bare-metal resource allocators.
* SOVEREIGN INFRASTRUCTURE DEFENSE: Designing resilient systemic protocols to mitigate
  cascading network failures and single points of data exposure within regional
  healthcare, logistical, and public sector networks.
* STRATEGIC PUBLIC SECTOR ADVISORY: Structuring sovereign data residency deployment
  pipelines, procurement-ready edge computing blocks, and localized state computing
  frameworks compliant with national security vectors.

3. EMPIRICAL RESEARCH COMPLIANCE
Metis LLC's system threat modeling and architectural methodologies are anchored directly
in peer-reviewed empirical informatics research published in the Journal of Medical
Internet Research (JMIR, April 2025, DOI: 10.2196/59231): "Media Framing and Portrayals
of Ransomware Impacts on Informatics, Employees, and Patients: Systematic Media Literature Review."
This foundational research details the real-world operational cascading harms of
system vulnerability, directly guiding the engineering of Metis's deterministic platforms.

4. LEADERSHIP & PRINCIPAL INVESTIGATOR
* DR. ISHMAEL A. AVERY // Founder & Principal Investigator
  Dual-vantage expert operating within Emergency Medicine clinical environments
  and advanced Graduate Systems Research (AI and Cybersecurity Architecture).

5. CORPORATE MATRIX IDENTIFIERS
* REGULATORY RESIDENCY: Structured for strict geographic edge isolation.
* TECHNICAL CONTACT: partnerships@metis.gold
* SECURITY PROTOCOL: Automated build-time verification tracking active.
================================================================================`;

fs.mkdirSync(outDir, { recursive: true });

const doc = new PDFDocument({
  size: "LETTER",
  margins: { top: 54, bottom: 54, left: 54, right: 54 },
});
const stream = fs.createWriteStream(outFile);
doc.pipe(stream);

doc.font("Courier").fontSize(9).fillColor("#111111");
doc.text(BODY, { lineGap: 2, align: "left" });

doc.end();

stream.on("finish", () => {
  console.log(`Wrote ${outFile}`);
});

stream.on("error", (err) => {
  console.error(err);
  process.exit(1);
});
