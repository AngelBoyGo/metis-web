export type Lang = "en" | "es" | "zh" | "th";

export type Sector = {
  index: string;
  title: string;
  body: string;
};

export type PortalMetric = {
  label: string;
  value: string;
  unit: string;
};

export type Dictionary = {
  masthead: {
    wordmark: string;
    meta: string;
    locator: string;
  };
  hero: {
    eyebrow: string;
    headline: string;
    description: string;
  };
  sectors: {
    sectionLabel: string;
    items: Sector[];
  };
  portal: {
    sectionLabel: string;
    systemStatus: string;
    computeLoad: string;
    threadAllocation: string;
    operationalParameters: string;
    streamsLabel: string;
    streams: string[];
    metrics: PortalMetric[];
  };
  footer: string;
};

export const translations: Record<Lang, Dictionary> = {
  en: {
    masthead: {
      wordmark: "Metis LLC",
      meta: "AI RESEARCH · COMPUTE · SCALING",
      locator: "COORD 47.6062°N · 122.3321°W · LAB-01",
    },
    hero: {
      eyebrow: "Deterministic Intelligence Architectures",
      headline:
        "Scaling intelligence through hardware acceleration and next-generation compute substrates.",
      description:
        "Metis LLC engineers high-dimensional intelligence systems where scaling laws are deterministic, inference is hardware-bound, and architectural decisions are made at the silicon boundary—not the interface layer.",
    },
    sectors: {
      sectionLabel: "Core Sectors",
      items: [
        {
          index: "01",
          title: "Advanced AI Research",
          body: "Foundational research into representation geometry, causal inference under distribution shift, and architectures that preserve structural invariants across scale.",
        },
        {
          index: "02",
          title: "Custom Compute Implementations",
          body: "Bespoke accelerator topologies, memory hierarchy optimization, and kernel-level scheduling for workloads that exceed commodity GPU throughput envelopes.",
        },
        {
          index: "03",
          title: "High-Dimensional Scaling",
          body: "Deterministic scaling protocols for parameter regimes where standard heuristics fail—controlled expansion across depth, width, and context without entropy collapse.",
        },
      ],
    },
    portal: {
      sectionLabel: "Institutional Portal",
      systemStatus: "System Status",
      computeLoad: "Compute Load",
      threadAllocation: "Thread Allocation",
      operationalParameters: "Operational Parameters",
      streamsLabel: "Active Research Streams",
      streams: [
        "REP-GEOMETRY-07",
        "KERNEL-SCHED-12",
        "SCALE-INVARIANT-03",
        "SILICON-BOUND-09",
      ],
      metrics: [
        { label: "System Status", value: "OPERATIONAL", unit: "" },
        { label: "Compute Load", value: "78.4", unit: "%" },
        { label: "Thread Allocation", value: "4096", unit: "threads" },
        { label: "Memory Pressure", value: "62.1", unit: "%" },
        { label: "Inference Latency", value: "4.2", unit: "ms" },
        { label: "Active Streams", value: "4", unit: "" },
      ],
    },
    footer:
      "© Metis LLC · High-Dimensional AI Research & Development · All systems deterministic.",
  },
  es: {
    masthead: {
      wordmark: "Metis LLC",
      meta: "INVESTIGACIÓN IA · CÓMPUTO · ESCALADO",
      locator: "COORD 47.6062°N · 122.3321°O · LAB-01",
    },
    hero: {
      eyebrow: "Arquitecturas de Inteligencia Determinista",
      headline:
        "Escalando la inteligencia mediante aceleración de hardware y sustratos de cómputo de próxima generación.",
      description:
        "Metis LLC diseña sistemas de inteligencia de alta dimensión donde las leyes de escalado son deterministas, la inferencia está ligada al hardware y las decisiones arquitectónicas se toman en el límite del silicio—no en la capa de interfaz.",
    },
    sectors: {
      sectionLabel: "Sectores Principales",
      items: [
        {
          index: "01",
          title: "Investigación Avanzada en IA",
          body: "Investigación fundamental en geometría de representaciones, inferencia causal bajo cambio de distribución y arquitecturas que preservan invariantes estructurales a escala.",
        },
        {
          index: "02",
          title: "Implementaciones de Cómputo Personalizado",
          body: "Topologías de aceleradores a medida, optimización de jerarquía de memoria y programación a nivel de kernel para cargas que superan los límites de rendimiento de GPU convencionales.",
        },
        {
          index: "03",
          title: "Escalado de Alta Dimensión",
          body: "Protocolos de escalado determinista para regímenes paramétricos donde las heurísticas estándar fallan—expansión controlada en profundidad, anchura y contexto sin colapso entrópico.",
        },
      ],
    },
    portal: {
      sectionLabel: "Portal Institucional",
      systemStatus: "Estado del Sistema",
      computeLoad: "Carga de Cómputo",
      threadAllocation: "Asignación de Hilos",
      operationalParameters: "Parámetros Operacionales",
      streamsLabel: "Flujos de Investigación Activos",
      streams: [
        "REP-GEOMETRÍA-07",
        "KERNEL-SCHED-12",
        "ESCALA-INVARIANTE-03",
        "SILICONIO-LÍMITE-09",
      ],
      metrics: [
        { label: "Estado del Sistema", value: "OPERATIVO", unit: "" },
        { label: "Carga de Cómputo", value: "78.4", unit: "%" },
        { label: "Asignación de Hilos", value: "4096", unit: "hilos" },
        { label: "Presión de Memoria", value: "62.1", unit: "%" },
        { label: "Latencia de Inferencia", value: "4.2", unit: "ms" },
        { label: "Flujos Activos", value: "4", unit: "" },
      ],
    },
    footer:
      "© Metis LLC · Investigación y Desarrollo en IA de Alta Dimensión · Todos los sistemas deterministas.",
  },
  zh: {
    masthead: {
      wordmark: "Metis LLC",
      meta: "人工智能研究 · 计算 · 扩展",
      locator: "坐标 47.6062°N · 122.3321°W · 实验室-01",
    },
    hero: {
      eyebrow: "确定性智能架构",
      headline: "通过硬件加速与下一代计算基底实现智能的确定性扩展。",
      description:
        "Metis LLC 构建高维智能系统：扩展定律具有确定性，推理受硬件约束，架构决策在硅片边界而非接口层完成。",
    },
    sectors: {
      sectionLabel: "核心领域",
      items: [
        {
          index: "01",
          title: "前沿人工智能研究",
          body: "表征几何、分布偏移下的因果推理，以及跨尺度保持结构不变量的架构基础研究。",
        },
        {
          index: "02",
          title: "定制计算实现",
          body: "定制加速器拓扑、存储层次优化与内核级调度，面向超越商用 GPU 吞吐上限的工作负载。",
        },
        {
          index: "03",
          title: "高维扩展",
          body: "针对标准启发式失效的参数区间的确定性扩展协议——在深度、宽度与上下文上受控扩展，避免熵坍缩。",
        },
      ],
    },
    portal: {
      sectionLabel: "机构门户",
      systemStatus: "系统状态",
      computeLoad: "计算负载",
      threadAllocation: "线程分配",
      operationalParameters: "运行参数",
      streamsLabel: "活跃研究流",
      streams: [
        "表征几何-07",
        "内核调度-12",
        "尺度不变-03",
        "硅片边界-09",
      ],
      metrics: [
        { label: "系统状态", value: "运行中", unit: "" },
        { label: "计算负载", value: "78.4", unit: "%" },
        { label: "线程分配", value: "4096", unit: "线程" },
        { label: "内存压力", value: "62.1", unit: "%" },
        { label: "推理延迟", value: "4.2", unit: "毫秒" },
        { label: "活跃流", value: "4", unit: "" },
      ],
    },
    footer:
      "© Metis LLC · 高维人工智能研发 · 全系统确定性运行。",
  },
  th: {
    masthead: {
      wordmark: "Metis LLC",
      meta: "วิจัย AI · คอมพิวต์ · สเกล",
      locator: "พิกัด 47.6062°N · 122.3321°W · ห้องปฏิบัติการ-01",
    },
    hero: {
      eyebrow: "สถาปัตยกรรมปัญญาแบบกำหนดได้",
      headline:
        "ขยายปัญญาผ่านการเร่งฮาร์ดแวร์และแผ่นรองรับคอมพิวตรุ่นถัดไป",
      description:
        "Metis LLC ออกแบบระบบปัญญามิติสูงที่กฎการขยายมีความกำหนดได้ การอนุมานผูกกับฮาร์ดแวร์ และการตัดสินใจเชิงสถาปัตยกรรมเกิดขึ้นที่ขอบซิลิคอน—ไม่ใช่ชั้นอินเทอร์เฟซ",
    },
    sectors: {
      sectionLabel: "ภาคส่วนหลัก",
      items: [
        {
          index: "01",
          title: "การวิจัย AI ขั้นสูง",
          body: "การวิจัยพื้นฐานด้านเรขาคณิตการแสดงผล การอนุมานเชิงสาเหตุภายใต้การเปลี่ยนแปลงการแจกจ่าย และสถาปัตยกรรมที่รักษาอนุพันธ์เชิงโครงสร้างข้ามสเกล",
        },
        {
          index: "02",
          title: "การใช้งานคอมพิวตแบบกำหนดเอง",
          body: "โทโพโลยีเร่งความเร็วเฉพาะทาง การปรับลำดับชั้นหน่วยความจำ และการจัดตารางระดับเคอร์เนลสำหรับเวิร์กโหลดที่เกินขีดจำกัด GPU ทั่วไป",
        },
        {
          index: "03",
          title: "การขยายมิติสูง",
          body: "โปรโตคอลการขยายแบบกำหนดได้สำหรับระบอบพารามิเตอร์ที่ฮิวริสติกมาตรฐานล้มเหลว—การขยายที่ควบคุมได้ตามความลึก ความกว้าง และบริบทโดยไม่ทำให้เอนโทรปียุบตัว",
        },
      ],
    },
    portal: {
      sectionLabel: "พอร์ทัลสถาบัน",
      systemStatus: "สถานะระบบ",
      computeLoad: "โหลดคอมพิวต",
      threadAllocation: "การจัดสรรเธรด",
      operationalParameters: "พารามิเตอร์การปฏิบัติการ",
      streamsLabel: "สตรีมวิจัยที่ใช้งาน",
      streams: [
        "เรขา-แสดงผล-07",
        "เคอร์เนล-จัดตาราง-12",
        "สเกล-คงที่-03",
        "ซิลิคอน-ขอบเขต-09",
      ],
      metrics: [
        { label: "สถานะระบบ", value: "ปฏิบัติการ", unit: "" },
        { label: "โหลดคอมพิวต", value: "78.4", unit: "%" },
        { label: "การจัดสรรเธรด", value: "4096", unit: "เธรด" },
        { label: "แรงดันหน่วยความจำ", value: "62.1", unit: "%" },
        { label: "เวลาแฝงการอนุมาน", value: "4.2", unit: "มิลลิวิ" },
        { label: "สตรีมที่ใช้งาน", value: "4", unit: "" },
      ],
    },
    footer:
      "© Metis LLC · วิจัยและพัฒนา AI มิติสูง · ระบบทั้งหมดกำหนดได้",
  },
};

export const LANG_LABELS: Record<Lang, string> = {
  en: "EN",
  es: "ES",
  zh: "ZH",
  th: "TH",
};

export const LANGS: Lang[] = ["en", "es", "zh", "th"];
