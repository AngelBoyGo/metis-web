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

export type AboutFinding = {
  code: string;
  label: string;
  value: string;
};

export type Dictionary = {
  nav: {
    coreEngine: string;
    capabilities: string;
    technicalGenesis: string;
    procurement: string;
  };
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
  manifest: {
    sectionLabel: string;
    blockLabel: string;
    signatureLabel: string;
    algorithmLabel: string;
    commitLabel: string;
    commitLocal: string;
    timestampNote: string;
  };
  whitepaper: {
    sectionLabel: string;
    toggleShow: string;
    toggleHide: string;
    citationLabel: string;
  };
  about: {
    sectionLabel: string;
    principalWordmark: string;
    originLabel: string;
    origin: string;
    catalystLabel: string;
    publicationTitle: string;
    publicationMeta: string;
    thesisLabel: string;
    thesis: string;
    findingsLabel: string;
    findings: AboutFinding[];
    imageAlt: string;
  };
  portal: {
    sectionLabel: string;
    statusSublabel: string;
    systemStatus: string;
    computeLoad: string;
    threadAllocation: string;
    operationalParameters: string;
    streamsLabel: string;
    streams: string[];
    metrics: PortalMetric[];
  };
  procurement: {
    downloadTitle: string;
    downloadMeta: string;
    capabilityId: string;
  };
  terminal: {
    matrixTitle: string;
    clockLabel: string;
    cycleLabel: string;
    matricesLabel: string;
    memoryLabel: string;
    opsLegend: string;
    prompt: string;
    awaitingLink: string;
    statusActive: string;
    cmdRecognized: string;
    cmdUnknown: string;
  };
  footer: {
    copyright: string;
    capabilityId: string;
    dataResidency: string;
    jurisdiction: string;
    manifestButton: string;
  };
};

export const translations: Record<Lang, Dictionary> = {
  en: {
    nav: {
      coreEngine: "01 // CORE_ENGINE",
      capabilities: "02 // CAPABILITIES",
      technicalGenesis: "03 // TECHNICAL_GENESIS",
      procurement: "04 // PROCUREMENT",
    },
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
      sectionLabel: "CORE SECTORS",
      items: [
        {
          index: "01",
          title: "AI Core Systems Architecture",
          body: "Engineering custom kernel-level schedulers, high-performance tensor reduction engines, and bare-metal resource allocators for deterministic machine intelligence at the silicon boundary.",
        },
        {
          index: "02",
          title: "Critical Infrastructure Data Protection",
          body: "Sovereign defense frameworks mitigating cascading network failures and single points of data exposure—methodologies anchored in JMIR peer-reviewed research (DOI 10.2196/59231, April 2025).",
        },
        {
          index: "03",
          title: "Public Sector Engagement Platform",
          body: "Procurement-ready edge computing blocks, sovereign data residency deployment pipelines, and localized state computing frameworks aligned with national security vectors.",
        },
      ],
    },
    manifest: {
      sectionLabel: "SEC_05 // SECURITY_MANIFEST",
      blockLabel: "METIS CORE // SYSTEM GENESIS INTEGRITY BLOCK",
      signatureLabel: "SYSTEM_BOOT_SIGNATURE",
      algorithmLabel: "ALGORITHM",
      commitLabel: "COMMIT_TOKEN",
      commitLocal: "LOCAL_GENESIS_FALLBACK",
      timestampNote: "BUILD_TIME_INTEGRITY // VERIFIED AT DEPLOY EDGE",
    },
    whitepaper: {
      sectionLabel: "SEC_06 // WHITEPAPER_READER",
      toggleShow: "DISPLAY JMIR CORPUS",
      toggleHide: "HIDE JMIR CORPUS",
      citationLabel: "CITATION",
    },
    portal: {
      sectionLabel: "SEC_07 // PROCUREMENT",
      statusSublabel:
        "STATUS: ACTIVE EDGE EMULATION SANDBOX // BENCHMARK STABILITY RATIO: 8 MHz FIXED NODE.",
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
    terminal: {
      matrixTitle: "Operation Code Matrix",
      clockLabel: "Clock",
      cycleLabel: "Cycle",
      matricesLabel: "Matrices",
      memoryLabel: "Memory Bound",
      opsLegend: "Raw Operation Codes",
      prompt: "metis://~ $",
      awaitingLink: "AWAITING_SSE",
      statusActive: "ACTIVE",
      cmdRecognized: "COMMAND_ACK",
      cmdUnknown: "UNKNOWN_COMMAND",
    },
    procurement: {
      downloadTitle: "METIS_Capability_Statement.pdf",
      downloadMeta: "INSTITUTIONAL LEAVE-BEHIND // PUBLIC SECTOR ADVISORY",
      capabilityId: "METIS-CS-2026-V1",
    },
    about: {
      sectionLabel: "SEC_04 // TECHNICAL_GENESIS",
      principalWordmark:
        "Dr. Ishmael A. Avery // Founder & Principal Investigator",
      originLabel: "Institutional Origin",
      origin:
        "Metis LLC originates from a dual-vantage discipline: frontline Emergency Medicine operations—where clinical decisions are measured in seconds—and advanced AI and cybersecurity research, where infrastructure failure propagates across entire systems. This intersection defines how Metis engineers intelligence at the hardware boundary.",
      catalystLabel: "The Research Catalyst",
      publicationTitle:
        "Media Framing and Portrayals of Ransomware Impacts on Informatics, Employees, and Patients: Systematic Media Literature Review",
      publicationMeta:
        "Journal of Medical Internet Research · April 8, 2025 · DOI 10.2196/59231",
      thesisLabel: "The Thesis",
      thesis:
        "The peer-reviewed finding is unequivocal: cyber-attacks cascade from single points of failure across clinical infrastructure—disrupting informatics workflows, compromising employee operations, and placing patient safety at direct risk. Metis LLC exists to engineer deterministic, high-dimensional computing architectures that eliminate these cascading failure modes before they reach the bedside.",
      findingsLabel: "Publication Findings Matrix",
      findings: [
        {
          code: "F-01",
          label: "US Media Focus",
          value: "71%",
        },
        {
          code: "F-02",
          label: "Cascading Operational Impact",
          value: "INFRASTRUCTURE",
        },
        {
          code: "F-03",
          label: "Patient-Safety Protocol Disruption",
          value: "CRITICAL",
        },
      ],
      imageAlt:
        "Dr. Ishmael A. Avery, Founder and Principal Investigator, Metis LLC",
    },
    footer: {
      copyright:
        "© Metis LLC · High-Dimensional AI Research & Development · All systems deterministic.",
      capabilityId: "CAPABILITY ID: METIS-CS-2026-V1",
      dataResidency:
        "DATA RESIDENCY: STRUCTURED FOR STRICT GEOGRAPHIC EDGE ISOLATION",
      jurisdiction: "JURISDICTION: UNITED STATES // WASHINGTON STATE",
      manifestButton: "SECURITY MANIFEST",
    },
  },
  es: {
    nav: {
      coreEngine: "01 // MOTOR_NÚCLEO",
      capabilities: "02 // CAPACIDADES",
      technicalGenesis: "03 // GÉNESIS_TÉCNICA",
      procurement: "04 // ADQUISICIONES",
    },
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
      sectionLabel: "SECTORES PRINCIPALES",
      items: [
        {
          index: "01",
          title: "Arquitectura de Sistemas Núcleo IA",
          body: "Ingeniería de planificadores a nivel de kernel, motores de reducción tensorial de alto rendimiento y asignadores de recursos bare-metal para inteligencia determinista en el límite del silicio.",
        },
        {
          index: "02",
          title: "Protección de Datos de Infraestructura Crítica",
          body: "Marcos de defensa soberana que mitigan fallos de red en cascada y puntos únicos de exposición de datos—metodologías ancladas en investigación revisada por pares JMIR (DOI 10.2196/59231, abril 2025).",
        },
        {
          index: "03",
          title: "Plataforma de Participación del Sector Público",
          body: "Bloques de cómputo perimetral listos para adquisiciones, tuberías de despliegue de residencia soberana de datos y marcos de cómputo estatal localizados alineados con vectores de seguridad nacional.",
        },
      ],
    },
    manifest: {
      sectionLabel: "SEC_05 // MANIFIESTO_DE_SEGURIDAD",
      blockLabel: "METIS CORE // BLOQUE DE INTEGRIDAD GÉNESIS DEL SISTEMA",
      signatureLabel: "FIRMA_ARRANQUE_SISTEMA",
      algorithmLabel: "ALGORITMO",
      commitLabel: "TOKEN_COMMIT",
      commitLocal: "RESPALDO_GÉNESIS_LOCAL",
      timestampNote: "INTEGRIDAD_TIEMPO_COMPILACIÓN // VERIFICADO EN BORDE DE DESPLIEGUE",
    },
    whitepaper: {
      sectionLabel: "SEC_06 // LECTOR_DOCUMENTO",
      toggleShow: "MOSTRAR CORPUS JMIR",
      toggleHide: "OCULTAR CORPUS JMIR",
      citationLabel: "CITA",
    },
    portal: {
      sectionLabel: "SEC_07 // ADQUISICIONES",
      statusSublabel:
        "ESTADO: SANDBOX DE EMULACIÓN DE BORDE ACTIVO // RATIO DE ESTABILIDAD DE REFERENCIA: NODO FIJO 8 MHz.",
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
    terminal: {
      matrixTitle: "Matriz de Códigos de Operación",
      clockLabel: "Reloj",
      cycleLabel: "Ciclo",
      matricesLabel: "Matrices",
      memoryLabel: "Límite de Memoria",
      opsLegend: "Códigos de Operación en Bruto",
      prompt: "metis://~ $",
      awaitingLink: "ESPERANDO_SSE",
      statusActive: "ACTIVO",
      cmdRecognized: "COMANDO_ACK",
      cmdUnknown: "COMANDO_DESCONOCIDO",
    },
    procurement: {
      downloadTitle: "METIS_Capability_Statement.pdf",
      downloadMeta: "DOCUMENTO INSTITUCIONAL // ASESORÍA SECTOR PÚBLICO",
      capabilityId: "METIS-CS-2026-V1",
    },
    about: {
      sectionLabel: "SEC_04 // GÉNESIS_TÉCNICA",
      principalWordmark:
        "Dr. Ishmael A. Avery // Founder & Principal Investigator",
      originLabel: "Origen Institucional",
      origin:
        "Metis LLC surge de una disciplina de doble perspectiva: operaciones de Medicina de Emergencias en primera línea—donde las decisiones clínicas se miden en segundos—e investigación avanzada en IA y ciberseguridad, donde el fallo de infraestructura se propaga a través de sistemas completos. Esta intersección define cómo Metis diseña inteligencia en el límite del hardware.",
      catalystLabel: "El Catalizador de Investigación",
      publicationTitle:
        "Media Framing and Portrayals of Ransomware Impacts on Informatics, Employees, and Patients: Systematic Media Literature Review",
      publicationMeta:
        "Journal of Medical Internet Research · 8 de abril de 2025 · DOI 10.2196/59231",
      thesisLabel: "La Tesis",
      thesis:
        "El hallazgo revisado por pares es inequívoco: los ciberataques se propagan desde puntos únicos de fallo a través de la infraestructura clínica—interrumpiendo flujos de trabajo en informática, comprometiendo operaciones del personal y poniendo en riesgo directo la seguridad del paciente. Metis LLC existe para diseñar arquitecturas de cómputo deterministas y de alta dimensión que eliminen estos modos de fallo en cascada antes de que lleguen al punto de atención.",
      findingsLabel: "Matriz de Hallazgos de Publicación",
      findings: [
        {
          code: "F-01",
          label: "Enfoque Mediático EE.UU.",
          value: "71%",
        },
        {
          code: "F-02",
          label: "Impacto Operacional en Cascada",
          value: "INFRAESTRUCTURA",
        },
        {
          code: "F-03",
          label: "Disrupción de Protocolos de Seguridad del Paciente",
          value: "CRÍTICO",
        },
      ],
      imageAlt:
        "Dr. Ishmael A. Avery, Fundador e Investigador Principal, Metis LLC",
    },
    footer: {
      copyright:
        "© Metis LLC · Investigación y Desarrollo en IA de Alta Dimensión · Todos los sistemas deterministas.",
      capabilityId: "ID CAPACIDAD: METIS-CS-2026-V1",
      dataResidency:
        "RESIDENCIA DE DATOS: ESTRUCTURADA PARA AISLAMIENTO ESTRICTO EN BORDE GEOGRÁFICO",
      jurisdiction: "JURISDICCIÓN: ESTADOS UNIDOS // ESTADO DE WASHINGTON",
      manifestButton: "MANIFIESTO DE SEGURIDAD",
    },
  },
  zh: {
    nav: {
      coreEngine: "01 // 核心引擎",
      capabilities: "02 // 能力矩阵",
      technicalGenesis: "03 // 技术起源",
      procurement: "04 // 采购门户",
    },
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
          title: "人工智能核心系统架构",
          body: "工程化定制内核级调度器、高性能张量归约引擎与裸金属资源分配器，在硅片边界实现确定性机器智能。",
        },
        {
          index: "02",
          title: "关键基础设施数据保护",
          body: "主权防御框架，缓解级联网络故障与数据暴露单点——方法论锚定于 JMIR 同行评审研究（DOI 10.2196/59231，2025年4月）。",
        },
        {
          index: "03",
          title: "公共部门参与平台",
          body: "采购就绪边缘计算模块、主权数据驻留部署管道及符合国家安全向量的本地化国家计算框架。",
        },
      ],
    },
    manifest: {
      sectionLabel: "SEC_05 // 安全清单",
      blockLabel: "METIS CORE // 系统创世完整性块",
      signatureLabel: "系统启动签名",
      algorithmLabel: "算法",
      commitLabel: "提交令牌",
      commitLocal: "本地创世回退",
      timestampNote: "构建时完整性 // 在部署边缘验证",
    },
    whitepaper: {
      sectionLabel: "SEC_06 // 白皮书阅读器",
      toggleShow: "显示 JMIR 语料",
      toggleHide: "隐藏 JMIR 语料",
      citationLabel: "引用",
    },
    portal: {
      sectionLabel: "SEC_07 // 采购",
      statusSublabel:
        "状态：活跃边缘仿真沙箱 // 基准稳定比率：8 MHz 固定节点。",
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
    terminal: {
      matrixTitle: "操作码矩阵",
      clockLabel: "时钟",
      cycleLabel: "周期",
      matricesLabel: "矩阵",
      memoryLabel: "内存边界",
      opsLegend: "原始操作码",
      prompt: "metis://~ $",
      awaitingLink: "等待_SSE",
      statusActive: "运行中",
      cmdRecognized: "命令确认",
      cmdUnknown: "未知命令",
    },
    procurement: {
      downloadTitle: "METIS_Capability_Statement.pdf",
      downloadMeta: "机构备查文件 // 公共部门咨询",
      capabilityId: "METIS-CS-2026-V1",
    },
    about: {
      sectionLabel: "SEC_04 // 技术起源",
      principalWordmark:
        "Dr. Ishmael A. Avery // Founder & Principal Investigator",
      originLabel: "机构起源",
      origin:
        "Metis LLC 源于双重视角学科：一线急诊医学运营——临床决策以秒计量——与前沿人工智能及网络安全研究——基础设施故障在整个系统中级联传播。这一交叉点定义了 Metis 如何在硬件边界工程化智能。",
      catalystLabel: "研究催化剂",
      publicationTitle:
        "Media Framing and Portrayals of Ransomware Impacts on Informatics, Employees, and Patients: Systematic Media Literature Review",
      publicationMeta:
        "Journal of Medical Internet Research · 2025年4月8日 · DOI 10.2196/59231",
      thesisLabel: "核心论点",
      thesis:
        "经同行评审的结论明确：网络攻击从单点故障级联穿越临床基础设施——扰乱信息学工作流、损害员工运营并直接危及患者安全。Metis LLC 致力于工程化确定性高维计算架构，在这些级联故障模式抵达临床一线之前将其消除。",
      findingsLabel: "出版物发现矩阵",
      findings: [
        {
          code: "F-01",
          label: "美国媒体聚焦",
          value: "71%",
        },
        {
          code: "F-02",
          label: "级联运营影响",
          value: "基础设施",
        },
        {
          code: "F-03",
          label: "患者安全协议中断",
          value: "危急",
        },
      ],
      imageAlt: "Dr. Ishmael A. Avery，Metis LLC 创始人兼首席研究员",
    },
    footer: {
      copyright: "© Metis LLC · 高维人工智能研发 · 全系统确定性运行。",
      capabilityId: "能力编号：METIS-CS-2026-V1",
      dataResidency: "数据驻留：结构化严格地理边缘隔离",
      jurisdiction: "司法管辖区：美国 // 华盛顿州",
      manifestButton: "安全清单",
    },
  },
  th: {
    nav: {
      coreEngine: "01 // แกนกลาง",
      capabilities: "02 // ความสามารถ",
      technicalGenesis: "03 // ต้นกำเนิดเทคนิค",
      procurement: "04 // จัดซื้อ",
    },
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
          title: "สถาปัตยกรรมระบบแกน AI",
          body: "วิศวกรรมตัวจัดตารางระดับเคอร์เนลแบบกำหนดเอง เครื่องมือลดทอนเทนเซอร์ประสิทธิภาพสูง และตัวจัดสรรทรัพยากร bare-metal สำหรับปัญญาเครื่องแบบกำหนดได้ที่ขอบซิลิคอน",
        },
        {
          index: "02",
          title: "การปกป้องข้อมูลโครงสร้างพื้นฐานวิกฤต",
          body: "กรอบป้องกันอธิปไตยที่ลดความล้มเหลวเครือข่ายแบบแพร่กระจายและจุดเดียวของการเปิดเผยข้อมูล—วิธีการยึดการวิจัย JMIR ที่ผ่านการตรวจสอบ (DOI 10.2196/59231 เมษายน 2025)",
        },
        {
          index: "03",
          title: "แพลตฟอร์มมีส่วนร่วมภาครัฐ",
          body: "บล็อกคอมพิวตขอบพร้อมจัดซื้อ ท่อปรับใช้ที่อยู่อาศัยข้อมูลอธิปไตย และกรอบคอมพิวตของรัฐท้องถิ่นที่สอดคล้องกับเวกเตอร์ความมั่นคงแห่งชาติ",
        },
      ],
    },
    manifest: {
      sectionLabel: "SEC_05 // มานิเฟสต์ความปลอดภัย",
      blockLabel: "METIS CORE // บล็อกความสมบูรณ์ GENESIS ของระบบ",
      signatureLabel: "ลายเซ็น BOOT ระบบ",
      algorithmLabel: "อัลกอริทึม",
      commitLabel: "โทเค็น COMMIT",
      commitLocal: "สำรอง GENESIS ท้องถิ่น",
      timestampNote: "ความสมบูรณ์เวลา BUILD // ตรวจสอบที่ขอบ DEPLOY",
    },
    whitepaper: {
      sectionLabel: "SEC_06 // ตัวอ่านเอกสาร",
      toggleShow: "แสดง CORPUS JMIR",
      toggleHide: "ซ่อน CORPUS JMIR",
      citationLabel: "การอ้างอิง",
    },
    portal: {
      sectionLabel: "SEC_07 // จัดซื้อ",
      statusSublabel:
        "สถานะ: SANDBOX จำลอง EDGE ที่ใช้งาน // อัตราส่วนเสถียรภาพมาตรฐาน: โหนดคงที่ 8 MHz",
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
    terminal: {
      matrixTitle: "เมทริกซ์รหัสการทำงาน",
      clockLabel: "นาฬิกา",
      cycleLabel: "รอบ",
      matricesLabel: "เมทริกซ์",
      memoryLabel: "ขอบเขตหน่วยความจำ",
      opsLegend: "รหัสการทำงานดิบ",
      prompt: "metis://~ $",
      awaitingLink: "รอ_SSE",
      statusActive: "ใช้งาน",
      cmdRecognized: "ยืนยันคำสั่ง",
      cmdUnknown: "คำสั่งไม่รู้จัก",
    },
    procurement: {
      downloadTitle: "METIS_Capability_Statement.pdf",
      downloadMeta: "เอกสารสถาบัน // ที่ปรึกษาภาครัฐ",
      capabilityId: "METIS-CS-2026-V1",
    },
    about: {
      sectionLabel: "SEC_04 // ต้นกำเนิดเทคนิค",
      principalWordmark:
        "Dr. Ishmael A. Avery // Founder & Principal Investigator",
      originLabel: "ต้นกำเนิดสถาบัน",
      origin:
        "Metis LLC เกิดจากสาขาวิชาคู่ขนาน: การปฏิบัติการเวชศาสตร์ฉุกเฉินแนวหน้า—ที่การตัดสินใจทางคลินิกวัดเป็นวินาที—และการวิจัย AI และความปลอดภัยไซเบอร์ขั้นสูง ที่ความล้มเหลวของโครงสร้างพื้นฐานแพร่กระจายทั่วทั้งระบบ จุดตัดนี้กำหนดว่า Metis วิศวกรรมปัญญาที่ขอบซิลิคอนอย่างไร",
      catalystLabel: "ตัวเร่งการวิจัย",
      publicationTitle:
        "Media Framing and Portrayals of Ransomware Impacts on Informatics, Employees, and Patients: Systematic Media Literature Review",
      publicationMeta:
        "Journal of Medical Internet Research · 8 เมษายน 2025 · DOI 10.2196/59231",
      thesisLabel: "วิทยานิพนธ์",
      thesis:
        "ผลการวิจัยที่ผ่านการตรวจสอบโดยผู้เชี่ยวชาญชัดเจน: การโจมตีทางไซเบอร์แพร่จากจุดล้มเหลวเดียวข้ามโครงสร้างพื้นฐานทางคลินิก—ขัดขวางเวิร์กโฟลว์อินโฟร์เมติกส์ กระทบการปฏิบัติการของบุคลากร และเสี่ยงต่อความปลอดภัยของผู้ป่วยโดยตรง Metis LLC มีอยู่เพื่อวิศวกรรมสถาปัตยกรรมคอมพิวตแบบกำหนดได้มิติสูงที่ขจัดโหมดความล้มเหลวแบบแพร่กระจายก่อนถึงเตียงผู้ป่วย",
      findingsLabel: "เมทริกซ์ผลการตีพิมพ์",
      findings: [
        {
          code: "F-01",
          label: "โฟกัสสื่อสหรัฐฯ",
          value: "71%",
        },
        {
          code: "F-02",
          label: "ผลกระทบการปฏิบัติการแบบแพร่กระจาย",
          value: "โครงสร้างพื้นฐาน",
        },
        {
          code: "F-03",
          label: "การหยุดชะงักโปรโตคอลความปลอดภัยผู้ป่วย",
          value: "วิกฤต",
        },
      ],
      imageAlt:
        "Dr. Ishmael A. Avery ผู้ก่อตั้งและหัวหน้านักวิจัย Metis LLC",
    },
    footer: {
      copyright:
        "© Metis LLC · วิจัยและพัฒนา AI มิติสูง · ระบบทั้งหมดกำหนดได้",
      capabilityId: "รหัสความสามารถ: METIS-CS-2026-V1",
      dataResidency:
        "ที่อยู่อาศัยข้อมูล: โครงสร้างสำหรับการแยกขอบเขตทางภูมิศาสตร์อย่างเข้มงวด",
      jurisdiction: "เขตอำนาจ: สหรัฐอเมริกา // รัฐวอชิงตัน",
      manifestButton: "มานิเฟสต์ความปลอดภัย",
    },
  },
};

export const LANG_LABELS: Record<Lang, string> = {
  en: "EN",
  es: "ES",
  zh: "ZH",
  th: "TH",
};

export const LANGS: Lang[] = ["en", "es", "zh", "th"];
