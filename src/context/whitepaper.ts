import type { Lang } from "@/context/translations";

export type WhitepaperSection = {
  heading: string;
  body: readonly string[];
};

export type WhitepaperCitation = {
  title: string;
  journal: string;
  date: string;
  doi: string;
  url: string;
};

export type WhitepaperDoc = {
  citation: WhitepaperCitation;
  sections: readonly WhitepaperSection[];
};

const doi = "10.2196/59231";
const url = `https://doi.org/${doi}`;

const title =
  "Media Framing and Portrayals of Ransomware Impacts on Informatics, Employees, and Patients: Systematic Media Literature Review";

export const whitepaper: Record<Lang, WhitepaperDoc> = {
  en: {
    citation: {
      title,
      journal: "Journal of Medical Internet Research",
      date: "April 8, 2025",
      doi,
      url,
    },
    sections: [
      {
        heading: "Abstract",
        body: [
          "Systematic media literature review of ransomware portrayals across clinical informatics, workforce operations, and patient safety contexts.",
          "Analysis frames how public discourse documents cascading infrastructure harm when single points of failure propagate through healthcare systems.",
          "Findings inform deterministic threat modeling for sovereign edge compute and public-sector deployment architectures.",
        ],
      },
      {
        heading: "Methods",
        body: [
          "Structured retrieval and coding of peer-adjacent media corpora against informatics, employee, and patient impact dimensions.",
          "Dual-coder reconciliation with explicit inclusion criteria for ransomware operational narratives (not generic cybercrime mentions).",
          "Geographic stratification to quantify regional media focus and cross-border framing variance.",
        ],
      },
      {
        heading: "Key Data Findings",
        body: [
          "F-01 // US MEDIA FOCUS: 71% of coded portrayals emphasize United States clinical and regional infrastructure contexts.",
          "F-02 // CASCADING OPERATIONAL IMPACT: Documented failure modes propagate from informatics disruption through employee workflow compromise to patient-safety protocol interruption.",
          "F-03 // INFRASTRUCTURE CLASSIFICATION: Ransomware impacts classified as systemic—not isolated IT incidents—when clinical operations depend on shared digital substrates.",
        ],
      },
      {
        heading: "Conclusion",
        body: [
          "Media evidence supports engineering postures that eliminate cascading failure before bedside exposure.",
          "Metis LLC architectures treat JMIR 10.2196/59231 findings as empirical compliance anchors for sovereign infrastructure advisory.",
          "Procurement reviewers may cite DOI 10.2196/59231 as the peer-reviewed substrate for systemic reliability claims.",
        ],
      },
    ],
  },
  es: {
    citation: {
      title,
      journal: "Journal of Medical Internet Research",
      date: "8 de abril de 2025",
      doi,
      url,
    },
    sections: [
      {
        heading: "Resumen",
        body: [
          "Revisión sistemática de la literatura mediática sobre representaciones de ransomware en informática clínica, operaciones del personal y seguridad del paciente.",
          "El análisis enmarca cómo el discurso público documenta daños en cascada en la infraestructura cuando los puntos únicos de fallo se propagan en sistemas de salud.",
          "Los hallazgos informan el modelado determinista de amenazas para cómputo perimetral soberano y arquitecturas de despliegue del sector público.",
        ],
      },
      {
        heading: "Métodos",
        body: [
          "Recuperación estructurada y codificación de corpus mediáticos contra dimensiones de impacto en informática, empleados y pacientes.",
          "Reconciliación con doble codificador e criterios de inclusión explícitos para narrativas operativas de ransomware.",
          "Estratificación geográfica para cuantificar el enfoque mediático regional y la varianza de encuadre transfronterizo.",
        ],
      },
      {
        heading: "Hallazgos Clave",
        body: [
          "F-01 // ENFOQUE MEDIÁTICO EE.UU.: El 71% de las representaciones codificadas enfatizan contextos clínicos e infraestructura regional de Estados Unidos.",
          "F-02 // IMPACTO OPERACIONAL EN CASCADA: Los modos de fallo documentados se propagan desde la interrupción informática hasta la compromisión del flujo de trabajo del personal y la interrupción de protocolos de seguridad del paciente.",
          "F-03 // CLASIFICACIÓN DE INFRAESTRUCTURA: Los impactos del ransomware se clasifican como sistémicos—no incidentes aislados de TI—cuando las operaciones clínicas dependen de sustratos digitales compartidos.",
        ],
      },
      {
        heading: "Conclusión",
        body: [
          "La evidencia mediática respalda posturas de ingeniería que eliminan fallos en cascada antes de la exposición en el punto de atención.",
          "Las arquitecturas de Metis LLC tratan los hallazgos JMIR 10.2196/59231 como anclas de cumplimiento empírico para asesoría de infraestructura soberana.",
          "Los revisores de adquisiciones pueden citar el DOI 10.2196/59231 como sustrato revisado por pares para reclamos de confiabilidad sistémica.",
        ],
      },
    ],
  },
  zh: {
    citation: {
      title,
      journal: "Journal of Medical Internet Research",
      date: "2025年4月8日",
      doi,
      url,
    },
    sections: [
      {
        heading: "摘要",
        body: [
          "针对临床信息学、员工运营与患者安全语境中勒索软件表述的系统性媒体文献综述。",
          "分析框架阐明：当单点故障在医疗系统中级联传播时，公共话语如何记录基础设施损害。",
          "发现为主权边缘计算与公共部门部署架构的确定性威胁建模提供依据。",
        ],
      },
      {
        heading: "方法",
        body: [
          "按信息学、员工与患者影响维度对媒体语料进行结构化检索与编码。",
          "双编码员核对，对勒索软件运营叙事采用明确纳入标准（排除泛化网络犯罪提及）。",
          "地理分层以量化区域媒体聚焦与跨境表述差异。",
        ],
      },
      {
        heading: "关键数据发现",
        body: [
          "F-01 // 美国媒体聚焦：71% 编码表述强调美国临床与区域基础设施语境。",
          "F-02 // 级联运营影响：记录的故障模式从信息学中断经员工工作流受损传播至患者安全协议中断。",
          "F-03 // 基础设施分类：当临床运营依赖共享数字基底时，勒索软件影响被归类为系统性——而非孤立 IT 事件。",
        ],
      },
      {
        heading: "结论",
        body: [
          "媒体证据支持在抵达临床一线之前消除级联故障的工程姿态。",
          "Metis LLC 架构将 JMIR 10.2196/59231 发现作为主权基础设施咨询的实证合规锚点。",
          "采购审查方可引用 DOI 10.2196/59231 作为系统性可靠性主张的同行评审基底。",
        ],
      },
    ],
  },
  th: {
    citation: {
      title,
      journal: "Journal of Medical Internet Research",
      date: "8 เมษายน 2025",
      doi,
      url,
    },
    sections: [
      {
        heading: "บทคัดย่อ",
        body: [
          "การทบทวนวรรณกรรมสื่ออย่างเป็นระบบเกี่ยวกับการนำเสนอ ransomware ในบริบทอินโฟร์เมติกส์คลินิก การปฏิบัติการบุคลากร และความปลอดภัยผู้ป่วย",
          "การวิเคราะห์กำหนดกรอบว่าสาธารณะบันทึกความเสียหายโครงสร้างพื้นฐานแบบแพร่กระจายเมื่อจุดล้มเหลวเดียวแพร่ผ่านระบบสุขภาพ",
          "ผลการวิจัยสนับสนุนการสร้างแบบจำลองภัยคุกคามแบบกำหนดได้สำหรับ edge compute แบบอธิปไตยและสถาปัตยกรรมการปรับใช้ภาครัฐ",
        ],
      },
      {
        heading: "วิธีการ",
        body: [
          "การดึงและเข้ารหัสคลังสื่ออย่างมีโครงสร้างตามมิติผลกระทบด้านอินโฟร์เมติกส์ บุคลากร และผู้ป่วย",
          "การกระทบยอดผู้เข้ารหัสคู่พร้อมเกณฑ์การรวมที่ชัดเจนสำหรับเรื่องเล่าเชิงปฏิบัติการ ransomware",
          "การแบ่งชั้นทางภูมิศาสตร์เพื่อวัดโฟกัสสื่อระดับภูมิภาคและความแปรผันของการกรอบข้ามพรมแดน",
        ],
      },
      {
        heading: "ผลการค้นพบหลัก",
        body: [
          "F-01 // โฟกัสสื่อสหรัฐฯ: 71% ของการนำเสนอที่เข้ารหัสเน้นบริบทคลินิกและโครงสร้างพื้นฐานระดับภูมิภาคของสหรัฐอเมริกา",
          "F-02 // ผลกระทบการปฏิบัติการแบบแพร่กระจาย: โหมดความล้มเหลวที่บันทึกแพร่จากการหยุดชะงักอินโฟร์เมติกส์ผ่านการประนีประนอมเวิร์กโฟลว์บุคลากรไปสู่การหยุดชะงักโปรโตคอลความปลอดภัยผู้ป่วย",
          "F-03 // การจำแนกโครงสร้างพื้นฐาน: ผลกระทบ ransomware จัดเป็นส่วนระบบ—ไม่ใช่เหตุการณ์ IT แยก—เมื่อการปฏิบัติการคลินิกพึ่งพาแผ่นรองรับดิจิทัลร่วม",
        ],
      },
      {
        heading: "ข้อสรุป",
        body: [
          "หลักฐานสื่อสนับสนุนท่าทีวิศวกรรมที่ขจัดความล้มเหลวแบบแพร่กระจายก่อนถึงเตียงผู้ป่วย",
          "สถาปัตยกรรม Metis LLC ใช้ผล JMIR 10.2196/59231 เป็นจุดยึดการปฏิบัติตามเชิงประจักษ์สำหรับที่ปรึกษาโครงสร้างพื้นฐานอธิปไตย",
          "ผู้ตรวจจัดซื้อสามารถอ้างอิง DOI 10.2196/59231 เป็นฐานที่ผ่านการตรวจสอบโดยผู้เชี่ยวชาญสำหรับข้อเรียกร้องความน่าเชื่อถือเชิงระบบ",
        ],
      },
    ],
  },
};
