import type { SiteContent } from "../types";

const ADDRESS = {
  street: "1172 S Dixie Hwy",
  city: "Coral Gables",
  state: "FL",
  postal: "33146",
  country: "United States",
  formatted: "1172 S Dixie Hwy, Coral Gables, FL 33146, United States",
};

export const es: SiteContent = {
  meta: {
    title: "Metis LLC — Sistemas de IA, Cómputo Seguro y Resiliencia Cibernética",
    description:
      "Metis LLC diseña sistemas avanzados de inteligencia artificial, arquitecturas de cómputo seguro y estrategias tecnológicas para el sector público en organizaciones de salud e infraestructura crítica. Con sede en Coral Gables, Florida.",
  },
  company: {
    name: "Metis LLC",
    tagline: "Sistemas de IA, cómputo seguro y resiliencia cibernética",
    oneLiner:
      "Metis LLC diseña sistemas avanzados de inteligencia artificial, arquitecturas de cómputo seguro y estrategias tecnológicas para el sector público dirigidas a organizaciones de salud e infraestructura crítica.",
    address: ADDRESS,
    variants: {
      publicSector:
        "Asesoría tecnológica y diseño de sistemas seguros para entornos gubernamentales y regulados.",
      healthcare:
        "Arquitectura de sistemas de IA y resiliencia cibernética para operaciones clínicas y de informática en salud.",
      technical:
        "Cómputo seguro, diseño de infraestructura e investigación aplicada para entornos operativos críticos.",
    },
  },
  hero: {
    eyebrow: "Metis LLC",
    headline: "Sistemas de IA, cómputo seguro y resiliencia cibernética para operaciones críticas",
    description:
      "Metis LLC diseña sistemas avanzados de inteligencia artificial, arquitecturas de cómputo seguro y estrategias tecnológicas para el sector público dirigidas a organizaciones de salud e infraestructura crítica.",
  },
  overview: {
    title: "Descripción institucional",
    paragraphs: [
      "Metis LLC es una firma tecnológica especializada en arquitectura de sistemas de IA, cómputo seguro y resiliencia cibernética para la salud y otros entornos operativos críticos.",
      "Trabajamos con organizaciones del sector público y entidades reguladas que requieren ingeniería disciplinada, documentación clara y modelos de compromiso responsables—no demostraciones especulativas ni interfaces teatrales.",
      "Nuestra práctica combina investigación aplicada, diseño de infraestructura y servicios de asesoría fundamentados en evidencia revisada por pares y en la realidad operativa.",
    ],
  },
  capabilities: {
    title: "Capacidades",
    intro: "Metis ofrece servicios técnicos y de asesoría estructurados en tres áreas de práctica.",
    categories: [
      {
        id: "ai-systems",
        title: "Arquitectura de sistemas de IA",
        summary:
          "Diseño y evaluación de flujos de trabajo habilitados por IA, integración de modelos y controles operativos para entornos regulados.",
        items: [
          "Diseño de sistemas y revisiones de arquitectura",
          "Integración de modelos y mapeo de flujos de trabajo",
          "Controles operativos y postura de monitoreo",
          "Documentación para revisores de adquisiciones y cumplimiento",
        ],
      },
      {
        id: "secure-compute",
        title: "Cómputo seguro e infraestructura",
        summary:
          "Diseño de infraestructura con énfasis en resiliencia, segmentación y operaciones responsables.",
        items: [
          "Planificación de arquitectura de cómputo y redes",
          "Diseño de resiliencia y segmentación",
          "Postura de infraestructura informada por respuesta a incidentes",
          "Documentación técnica para partes interesadas",
        ],
      },
      {
        id: "cyber-resilience",
        title: "Asesoría en resiliencia cibernética",
        summary:
          "Asesoría basada en evidencia sobre impactos de ransomware, continuidad de informática y riesgo sistémico en operaciones de salud.",
        items: [
          "Asesoría de arquitectura informada por amenazas",
          "Análisis de continuidad informática e impacto operativo",
          "Informes de política e ingeniería basados en investigación",
          "Apoyo al compromiso con el sector público y la salud",
        ],
      },
    ],
    engagementModels: {
      title: "Modelos de compromiso",
      items: [
        {
          name: "Briefing de asesoría",
          description:
            "Discusión estructurada del alcance, las restricciones y la compatibilidad—generalmente el primer paso para nuevas consultas.",
        },
        {
          name: "Revisión de arquitectura",
          description:
            "Revisión técnica enfocada de sistemas, documentación y postura de resiliencia.",
        },
        {
          name: "Colaboración en investigación",
          description:
            "Apoyo a investigación aplicada alineada con trabajo publicado y metodologías documentadas.",
        },
        {
          name: "Apoyo a adquisiciones",
          description:
            "Declaraciones de capacidad, paquetes de documentos y materiales objetivos para revisores.",
        },
      ],
    },
  },
  whyMetis: {
    title: "Por qué Metis",
    points: [
      {
        title: "Práctica fundamentada en evidencia",
        body: "Nuestro trabajo de asesoría se basa en investigación revisada por pares, incluyendo análisis publicados sobre el impacto del ransomware en la informática y las operaciones de salud.",
      },
      {
        title: "Enfoque operativo",
        body: "Hacemos énfasis en sistemas que deben funcionar bajo presión: flujos de trabajo clínicos, restricciones del sector público y documentación responsable.",
      },
      {
        title: "Compromiso claro",
        body: "Alcances definidos, cronogramas honestos y materiales adecuados para revisores de adquisiciones y cumplimiento—sin afirmaciones exageradas.",
      },
      {
        title: "Comunicación disciplinada",
        body: "Presentación institucional, contenido factual y canales directos—sin paneles simulados ni interfaces teatrales.",
      },
    ],
  },
  leadership: {
    name: "Ishmael A. Avery",
    title: "Fundador e Investigador Principal",
    bio: "Ishmael A. Avery es Fundador e Investigador Principal de Metis LLC. Su trabajo se centra en la arquitectura de sistemas de IA, infraestructura de cómputo y resiliencia cibernética en la salud y otros entornos operativos críticos.",
    focusAreas: [
      "Arquitectura de sistemas de IA",
      "Diseño de cómputo seguro e infraestructura",
      "Resiliencia cibernética en salud y operaciones críticas",
      "Investigación aplicada y asesoría basada en evidencia",
    ],
    researchAnchor: {
      label: "Investigación publicada",
      citation:
        "Media Framing and Portrayals of Ransomware Impacts on Informatics, Employees, and Patients (JMIR, 2025)",
      doi: "10.2196/59231",
      url: "https://doi.org/10.2196/59231",
    },
    location: ADDRESS.formatted,
    links: [
      { label: "Investigación", segment: "research" },
      { label: "Capacidades", segment: "capabilities" },
      { label: "Solicitar briefing", segment: "contact" },
    ],
  },
  research: {
    title: "Investigación",
    publication: {
      title:
        "Media Framing and Portrayals of Ransomware Impacts on Informatics, Employees, and Patients: Systematic Media Literature Review",
      journal: "Journal of Medical Internet Research",
      date: "8 de abril de 2025",
      doi: "10.2196/59231",
      url: "https://doi.org/10.2196/59231",
    },
    summary:
      "Una revisión sistemática de literatura mediática que examina cómo se retratan los incidentes de ransomware en los contextos de informática clínica, operaciones de la fuerza laboral y seguridad del paciente.",
    whyItMatters:
      "Los hallazgos documentan cómo las fallas de infraestructura se propagan a través de los sistemas de salud—informando el modelado de amenazas, la planificación de resiliencia y las decisiones de arquitectura para organizaciones que no pueden tratar los incidentes cibernéticos como eventos de TI aislados.",
    relatedDirections: [
      "Continuidad de la informática de salud bajo perturbaciones sistémicas",
      "Encuadre mediático y comprensión pública del riesgo cibernético operativo",
      "Implicaciones de arquitectura y política para entornos regulados",
    ],
  },
  publicSector: {
    title: "Compromiso con el sector público",
    intro:
      "Metis apoya a organizaciones gubernamentales y reguladas con estrategia tecnológica, diseño de sistemas seguros y asesoría basada en evidencia.",
    services: [
      "Declaraciones de capacidad y documentación lista para adquisiciones",
      "Revisiones de arquitectura y resiliencia para sistemas críticos",
      "Informes fundamentados en investigación publicada y análisis operativo",
      "Compromiso estructurado para contextos de salud y sector público",
    ],
    howEngagementsBegin: {
      title: "Cómo comienzan los compromisos",
      steps: [
        "Envíe una solicitud de briefing con organización, rol y tema.",
        "Revisión inicial en dos días hábiles.",
        "Llamada de descubrimiento estructurada para evaluar alcance y compatibilidad.",
        "Propuesta o declaración de trabajo para compromisos alineados.",
        "Entrega bajo términos acordados con resultados documentados.",
      ],
    },
  },
  security: {
    title: "Seguridad y confidencialidad",
    statements: [
      "Metis trata la información de clientes y consultas con el debido cuidado y no publica materiales confidenciales sin acuerdo explícito.",
      "Las solicitudes de briefing se gestionan a través de canales controlados; la infraestructura de entrega se configura según los requisitos del compromiso.",
      "No reclamamos certificaciones ni endorsements que no estén documentados por escrito.",
      "Las recomendaciones técnicas están delimitadas a las restricciones establecidas y se revisan para garantizar su exactitud antes de la entrega.",
    ],
  },
  documents: {
    title: "Documentos",
    intro: "Materiales de adquisición y briefing para revisores y socios.",
    cards: [
      {
        id: "capability-statement",
        name: "Declaración de Capacidad de Metis",
        version: "Actual",
        audience: "Adquisiciones, socios, revisores técnicos",
        description:
          "Descripción general de las capacidades, modelos de compromiso e información de contacto de Metis LLC.",
        availability: "download",
        href: "/documents/METIS_Capability_Statement.pdf",
        onRequestLabel: "Disponible a solicitud",
        downloadLabel: "Descargar PDF",
      },
      {
        id: "research-brief",
        name: "Informe de Investigación",
        version: "A solicitud",
        audience: "Partes interesadas en investigación y política",
        description: "Materiales de resumen relacionados con la investigación publicada y direcciones aplicadas.",
        availability: "on-request",
        onRequestLabel: "Disponible a solicitud",
        downloadLabel: "Descargar PDF",
      },
      {
        id: "public-sector-overview",
        name: "Descripción General del Sector Público",
        version: "A solicitud",
        audience: "Organizaciones gubernamentales y reguladas",
        description: "Descripción general del enfoque de compromiso con el sector público y áreas de servicio.",
        availability: "on-request",
        onRequestLabel: "Disponible a solicitud",
        downloadLabel: "Descargar PDF",
      },
    ],
  },
  contact: {
    title: "Contacto",
    interimLine:
      "Las solicitudes de briefing se reciben a través de este sitio. Se está configurando un canal de contacto dedicado; las solicitudes se registran para procesamiento provisional.",
    responseTarget: "Nuestro objetivo es responder dentro de dos días hábiles.",
    form: {
      nameLabel: "Nombre",
      organizationLabel: "Organización",
      roleLabel: "Rol / título",
      emailLabel: "Correo electrónico",
      categoryLabel: "Categoría",
      categoryOptions: [
        { value: "government", label: "Gobierno" },
        { value: "healthcare", label: "Salud" },
        { value: "research", label: "Investigación" },
        { value: "partnership", label: "Asociación" },
      ],
      topicLabel: "Tema",
      messageLabel: "Mensaje",
      submitLabel: "Enviar solicitud de briefing",
      successTitle: "Solicitud recibida",
      successBody:
        "Su solicitud de briefing ha sido recibida. Nuestro objetivo es responder dentro de dos días hábiles.",
      interimTitle: "Solicitud registrada",
      interimBody:
        "Su solicitud ha sido registrada para procesamiento provisional. La notificación de entrega aún no está configurada; le haremos seguimiento cuando su canal esté activo.",
      selectCategory: "Seleccione categoría",
      submitting: "Enviando…",
    },
    errors: {
      blank: "Ingrese una descripción antes de continuar.",
      network: "Error de red. Por favor, inténtelo de nuevo.",
      compileFailed: "No se pudo enviar la solicitud.",
    },
  },
  footer: {
    copyright: `© ${new Date().getFullYear()} Metis LLC. Todos los derechos reservados.`,
    legal: [
      { label: "Privacidad", segment: "privacy" },
      { label: "Términos", segment: "terms" },
    ],
  },
  nav: {
    primary: [
      { label: "Inicio", segment: "" },
      { label: "Capacidades", segment: "capabilities" },
      { label: "Sector Público", segment: "public-sector" },
      { label: "Investigación", segment: "research" },
      { label: "Liderazgo", segment: "leadership" },
      { label: "Documentos", segment: "documents" },
      { label: "Contacto", segment: "contact" },
    ],
    utility: [
      { label: "Coral Gables, FL", segment: "contact", static: true },
      {
        label: "Descargar Declaración de Capacidad",
        href: "/documents/METIS_Capability_Statement.pdf",
        external: true,
      },
      { label: "Solicitar Briefing", segment: "contact" },
    ],
    homeAnchors: [
      { label: "Descripción General", id: "overview" },
      { label: "Capacidades", id: "capabilities" },
      { label: "Por qué Metis", id: "why-metis" },
      { label: "Liderazgo", id: "leadership" },
      { label: "Investigación", id: "research" },
      { label: "Sector Público", id: "public-sector" },
      { label: "Seguridad", id: "security" },
      { label: "Documentos", id: "documents" },
      { label: "Contacto", id: "contact" },
    ],
  },
  about: {
    title: "Acerca de Metis LLC",
    sections: [
      {
        heading: "Quiénes somos",
        body: [
          "Metis LLC es una firma tecnológica especializada en arquitectura de sistemas de IA, cómputo seguro y resiliencia cibernética para la salud y otros entornos operativos críticos.",
          "Trabajamos con organizaciones del sector público y entidades reguladas que requieren ingeniería disciplinada, documentación clara y modelos de compromiso responsables—no demostraciones especulativas ni interfaces teatrales.",
          "Nuestra práctica combina investigación aplicada, diseño de infraestructura y servicios de asesoría fundamentados en evidencia revisada por pares y en la realidad operativa.",
        ],
      },
      {
        heading: "Lo que hacemos",
        body: [
          "Asesoría tecnológica y diseño de sistemas seguros para entornos gubernamentales y regulados.",
          "Arquitectura de sistemas de IA y resiliencia cibernética para operaciones clínicas y de informática en salud.",
          "Cómputo seguro, diseño de infraestructura e investigación aplicada para entornos operativos críticos.",
        ],
      },
      {
        heading: "Dónde trabajamos",
        body: [
          `Metis LLC tiene su sede en ${ADDRESS.formatted}.`,
          "Los compromisos se realizan de forma remota y presencial según lo requiera el alcance.",
        ],
      },
    ],
  },
  privacy: {
    title: "Privacidad",
    lastUpdated: "Junio de 2025",
    sections: [
      {
        heading: "Información que recopilamos",
        body: [
          "Cuando envía una solicitud de briefing, recopilamos la información que proporciona: nombre, organización, rol, correo electrónico, categoría, tema y mensaje.",
          "Podemos recopilar registros estándar del servidor web (dirección IP, tipo de navegador, páginas visitadas) por motivos de seguridad y operaciones.",
        ],
      },
      {
        heading: "Cómo utilizamos la información",
        body: [
          "Los datos de la solicitud de briefing se utilizan para responder a su consulta y evaluar la compatibilidad del compromiso.",
          "No vendemos información personal.",
        ],
      },
      {
        heading: "Retención",
        body: [
          "Los registros de consultas se retienen según sea necesario para fines comerciales y legales, y luego se eliminan o anonimizan cuando ya no son necesarios.",
        ],
      },
      {
        heading: "Contacto",
        body: [
          `Las preguntas sobre esta política pueden enviarse a través del formulario de briefing en ${ADDRESS.formatted}.`,
        ],
      },
    ],
  },
  terms: {
    title: "Términos de uso",
    lastUpdated: "Junio de 2025",
    sections: [
      {
        heading: "Uso del sitio web",
        body: [
          "Este sitio web se proporciona con fines informativos sobre Metis LLC y sus servicios.",
          "El contenido está sujeto a cambios sin previo aviso.",
        ],
      },
      {
        heading: "Sin asesoramiento profesional",
        body: [
          "Los materiales de este sitio no constituyen asesoramiento legal, médico ni regulatorio. Los compromisos se rigen por acuerdos separados.",
        ],
      },
      {
        heading: "Propiedad intelectual",
        body: [
          "El contenido del sitio, la marca y los documentos son propiedad de Metis LLC salvo que se indique lo contrario. La reproducción no autorizada está prohibida.",
        ],
      },
      {
        heading: "Limitación de responsabilidad",
        body: [
          "Metis LLC no es responsable de los daños derivados del uso de este sitio web en la medida permitida por la ley aplicable.",
        ],
      },
    ],
  },
  ui: {
    requestBriefing: "Solicitar briefing",
    capabilityStatement: "Declaración de capacidad",
    viewCapabilities: "Ver capacidades →",
    fullLeadership: "Perfil completo de liderazgo →",
    researchDetails: "Detalles de investigación →",
    publicSectorEngagement: "Compromiso con el sector público →",
    allDocuments: "Todos los documentos →",
    contactPage: "Página de contacto →",
    downloadPdf: "Descargar PDF",
    primaryBadge: "Principal",
    leadership: "Liderazgo",
    focusAreas: "Áreas de enfoque",
    office: "Oficina",
    briefingRequest: "Solicitud de briefing",
    requestBriefingCta: "Solicitar un briefing →",
    services: "Servicios",
    relatedDirections: "Direcciones relacionadas",
  },
  langSwitcher: {
    en: "English",
    es: "Español",
    zh: "中文",
    th: "ไทย",
  },
};
