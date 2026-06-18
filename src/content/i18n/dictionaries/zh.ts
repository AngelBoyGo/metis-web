import type { SiteContent } from "../types";
import {
  customerReadinessPricing,
  customerReadinessQuickstart,
  customerReadinessStartPilot,
  customerReadinessSupport,
  customerReadinessUi,
} from "../customer-readiness";

const ADDRESS = {
  street: "1172 S Dixie Hwy",
  city: "Coral Gables",
  state: "FL",
  postal: "33146",
  country: "United States",
  formatted: "1172 S Dixie Hwy, Coral Gables, FL 33146, United States",
};

export const zh: SiteContent = {
  meta: {
    title: "Metis LLC — 人工智能系统、安全计算与网络韧性",
    description:
      "Metis LLC 为医疗卫生与关键基础设施机构设计先进的人工智能系统、安全计算架构及公共部门技术战略。总部位于美国佛罗里达州科勒尔盖布尔斯。",
  },
  company: {
    name: "Metis LLC",
    tagline: "人工智能系统、安全计算与网络韧性",
    oneLiner:
      "Metis LLC 为医疗卫生及关键基础设施机构设计先进的人工智能系统、安全计算架构及公共部门技术战略。",
    address: ADDRESS,
    variants: {
      publicSector:
        "面向政府及受监管环境的技术咨询与安全系统设计。",
      healthcare:
        "面向临床及卫生信息学业务的人工智能系统架构与网络韧性服务。",
      technical:
        "面向关键业务环境的安全计算、基础设施设计与应用研究。",
    },
  },
  hero: {
    eyebrow: "Metis LLC",
    headline: "面向关键业务的人工智能系统、安全计算与网络韧性",
    description:
      "Metis LLC 为医疗卫生及关键基础设施机构设计先进的人工智能系统、安全计算架构及公共部门技术战略。",
  },
  overview: {
    title: "机构概览",
    paragraphs: [
      "Metis LLC 是一家专注于人工智能系统架构、安全计算及医疗卫生与其他关键业务环境网络韧性的科技公司。",
      "我们服务于公共部门及受监管机构，这些机构要求严谨的工程实践、清晰的文档管理及负责任的参与模式——而非投机性演示或形式化界面。",
      "我们的业务将应用研究、基础设施设计与咨询服务相结合，立足于同行评审证据与业务实际。",
    ],
  },
  capabilities: {
    title: "能力",
    intro: "Metis 在三个业务领域提供结构化的技术与咨询服务。",
    categories: [
      {
        id: "ai-systems",
        title: "人工智能系统架构",
        summary:
          "面向受监管环境的人工智能工作流设计与评估、模型集成及业务防护机制。",
        items: [
          "系统设计与架构评审",
          "模型集成与工作流规划",
          "业务防护机制与监控态势",
          "面向采购与合规审查方的文档材料",
        ],
      },
      {
        id: "secure-compute",
        title: "安全计算与基础设施",
        summary:
          "以韧性、隔离与负责任运营为重点的基础设施设计。",
        items: [
          "计算与网络架构规划",
          "韧性与隔离设计",
          "基于事件响应的基础设施态势",
          "面向利益相关方的技术文档",
        ],
      },
      {
        id: "cyber-resilience",
        title: "网络韧性咨询",
        summary:
          "基于证据的勒索软件影响、信息学持续性及医疗运营系统性风险咨询。",
        items: [
          "威胁导向的架构咨询",
          "信息学持续性与业务影响分析",
          "基于研究的政策与工程简报",
          "公共部门与医疗机构参与支持",
        ],
      },
    ],
    engagementModels: {
      title: "参与模式",
      items: [
        {
          name: "咨询简报",
          description:
            "对范围、约束条件及适配性的结构化讨论——通常为新询盘的第一步。",
        },
        {
          name: "架构评审",
          description:
            "针对系统、文档及韧性态势的专项技术评审。",
        },
        {
          name: "研究合作",
          description:
            "与已发表成果及有据可查的方法论相结合的应用研究支持。",
        },
        {
          name: "采购支持",
          description:
            "为审查方提供能力说明书、文件包及事实性材料。",
        },
      ],
    },
  },
  whyMetis: {
    title: "为什么选择 Metis",
    points: [
      {
        title: "以证据为基础的实践",
        body: "我们的咨询工作以同行评审研究为依据，包括已发表的关于勒索软件对医疗信息学和业务运营影响的分析。",
      },
      {
        title: "关注业务实际",
        body: "我们重视在压力下仍须正常运转的系统——临床工作流、公共部门约束及负责任的文档管理。",
      },
      {
        title: "清晰的参与方式",
        body: "明确的工作范围、真实的时间表及适合采购与合规审查方的材料——不夸大主张。",
      },
      {
        title: "严谨的沟通",
        body: "机构化呈现、事实性内容与直接渠道——不提供模拟仪表板或形式化界面。",
      },
    ],
  },
  leadership: {
    name: "Ishmael A. Avery",
    title: "创始人兼首席研究员",
    bio: "Ishmael A. Avery 是 Metis LLC 的创始人兼首席研究员。其研究方向专注于人工智能系统架构、计算基础设施及医疗卫生与其他关键业务环境中的网络韧性。",
    focusAreas: [
      "人工智能系统架构",
      "安全计算与基础设施设计",
      "医疗卫生及关键业务中的网络韧性",
      "应用研究与基于证据的咨询",
    ],
    researchAnchor: {
      label: "已发表研究",
      citation:
        "Media Framing and Portrayals of Ransomware Impacts on Informatics, Employees, and Patients (JMIR, 2025)",
      doi: "10.2196/59231",
      url: "https://doi.org/10.2196/59231",
    },
    location: ADDRESS.formatted,
    links: [
      { label: "研究", segment: "research" },
      { label: "能力", segment: "capabilities" },
      { label: "申请简报", segment: "contact" },
    ],
  },
  research: {
    title: "研究",
    publication: {
      title:
        "Media Framing and Portrayals of Ransomware Impacts on Informatics, Employees, and Patients: Systematic Media Literature Review",
      journal: "Journal of Medical Internet Research",
      date: "2025年4月8日",
      doi: "10.2196/59231",
      url: "https://doi.org/10.2196/59231",
    },
    summary:
      "一项系统性媒体文献综述，考察勒索软件事件在临床信息学、劳动力运营及患者安全背景下的媒体呈现方式。",
    whyItMatters:
      "研究结果记录了基础设施故障如何在医疗系统中产生连锁反应——为无法将网络事件视为孤立IT事件的机构提供威胁建模、韧性规划与架构决策依据。",
    relatedDirections: [
      "系统性破坏下的医疗信息学持续性",
      "媒体框架与公众对业务网络风险的认知",
      "受监管环境的架构与政策影响",
    ],
  },
  publicSector: {
    title: "公共部门参与",
    intro:
      "Metis 为政府及受监管机构提供技术战略、安全系统设计及基于证据的咨询支持。",
    services: [
      "能力说明书及采购就绪文档",
      "关键系统架构与韧性评审",
      "基于已发表研究与业务分析的简报",
      "面向医疗及公共部门情境的结构化参与",
    ],
    howEngagementsBegin: {
      title: "参与流程",
      steps: [
        "提交简报申请，注明机构、职务及议题。",
        "两个工作日内完成初步审核。",
        "结构化探索性会谈，评估范围与适配性。",
        "为匹配的合作提供提案或工作说明书。",
        "按约定条款交付，并提供有据可查的成果。",
      ],
    },
  },
  security: {
    title: "安全与保密",
    statements: [
      "Metis 对客户及询盘信息给予妥善保护，未经明确协议不得公开保密材料。",
      "简报申请通过受控渠道处理；交付基础设施按参与要求配置。",
      "我们不声明书面文件中未记录的认证或背书。",
      "技术建议的范围限定于已声明的约束条件，交付前经过准确性审查。",
    ],
  },
  documents: {
    title: "文件",
    intro: "面向审查方与合作伙伴的采购与简报材料。",
    cards: [
      {
        id: "capability-statement",
        name: "Metis 能力说明书",
        version: "当前版本",
        audience: "采购方、合作伙伴、技术审查方",
        description:
          "Metis LLC 能力概览、参与模式及联系信息。",
        availability: "download",
        href: "/documents/METIS_Capability_Statement.pdf",
        onRequestLabel: "可按需提供",
        downloadLabel: "下载 PDF",
      },
      {
        id: "research-brief",
        name: "研究简报",
        version: "按需提供",
        audience: "研究与政策利益相关方",
        description: "与已发表研究及应用方向相关的摘要材料。",
        availability: "on-request",
        onRequestLabel: "可按需提供",
        downloadLabel: "下载 PDF",
      },
      {
        id: "public-sector-overview",
        name: "公共部门概览",
        version: "按需提供",
        audience: "政府及受监管机构",
        description: "公共部门参与方式与服务领域概览。",
        availability: "on-request",
        onRequestLabel: "可按需提供",
        downloadLabel: "下载 PDF",
      },
    ],
  },
  contact: {
    title: "联系我们",
    interimLine:
      "简报申请通过本网站接收。专属联系渠道正在建设中；提交信息已登记用于临时处理。",
    responseTarget: "我们力争在两个工作日内作出回复。",
    form: {
      nameLabel: "姓名",
      organizationLabel: "机构",
      roleLabel: "职务 / 职称",
      emailLabel: "电子邮件",
      categoryLabel: "类别",
      categoryOptions: [
        { value: "government", label: "政府" },
        { value: "healthcare", label: "医疗卫生" },
        { value: "research", label: "研究" },
        { value: "partnership", label: "合作" },
      ],
      topicLabel: "主题",
      messageLabel: "留言",
      submitLabel: "提交简报申请",
      successTitle: "申请已收到",
      successBody:
        "您的简报申请已收到。我们力争在两个工作日内作出回复。",
      interimTitle: "申请已登记",
      interimBody:
        "您的申请已登记用于临时处理。交付通知功能尚未配置；渠道激活后我们将与您联系。",
      selectCategory: "请选择类别",
      submitting: "提交中…",
    },
    errors: {
      blank: "请在继续前填写描述信息。",
      network: "网络错误，请重试。",
      compileFailed: "无法提交申请。",
    },
  },
  footer: {
    copyright: `© ${new Date().getFullYear()} Metis LLC. 保留所有权利。`,
    legal: [
      { label: "隐私政策", segment: "privacy" },
      { label: "使用条款", segment: "terms" },
    ],
    resources: [
      { label: "关于我们", segment: "about" },
      { label: "Pricing", segment: "pricing" },
      { label: "Quickstart", segment: "quickstart" },
      { label: "Support", segment: "support" },
      { label: "客户门户", segment: "portal/login" },
    ],
  },
  nav: {
    primary: [
      { label: "首页", segment: "" },
      { label: "能力", segment: "capabilities" },
      { label: "Pricing", segment: "pricing" },
      { label: "公共部门", segment: "public-sector" },
      { label: "研究", segment: "research" },
      { label: "领导团队", segment: "leadership" },
      { label: "文件", segment: "documents" },
      { label: "联系我们", segment: "contact" },
    ],
    utility: [
      { label: "Coral Gables, FL", segment: "contact", static: true },
      {
        label: "下载能力说明书",
        href: "/documents/METIS_Capability_Statement.pdf",
        external: true,
      },
      { label: "Start Pilot", segment: "start-pilot" },
      { label: "Request Access", segment: "start-pilot" },
      { label: "Pricing", segment: "pricing" },
      { label: "申请简报", segment: "contact" },
      { label: "客户门户", segment: "portal/login" },
    ],
    homeAnchors: [
      { label: "概览", id: "overview" },
      { label: "能力", id: "capabilities" },
      { label: "为什么选择 Metis", id: "why-metis" },
      { label: "领导团队", id: "leadership" },
      { label: "研究", id: "research" },
      { label: "公共部门", id: "public-sector" },
      { label: "安全", id: "security" },
      { label: "文件", id: "documents" },
      { label: "联系我们", id: "contact" },
    ],
  },
  about: {
    title: "关于 Metis LLC",
    sections: [
      {
        heading: "我们是谁",
        body: [
          "Metis LLC 是一家专注于人工智能系统架构、安全计算及医疗卫生与其他关键业务环境网络韧性的科技公司。",
          "我们服务于公共部门及受监管机构，这些机构要求严谨的工程实践、清晰的文档管理及负责任的参与模式——而非投机性演示或形式化界面。",
          "我们的业务将应用研究、基础设施设计与咨询服务相结合，立足于同行评审证据与业务实际。",
        ],
      },
      {
        heading: "我们的服务",
        body: [
          "面向政府及受监管环境的技术咨询与安全系统设计。",
          "面向临床及卫生信息学业务的人工智能系统架构与网络韧性服务。",
          "面向关键业务环境的安全计算、基础设施设计与应用研究。",
        ],
      },
      {
        heading: "我们的所在地",
        body: [
          `Metis LLC 总部位于 ${ADDRESS.formatted}。`,
          "参与项目可根据工作范围要求以远程或现场方式开展。",
        ],
      },
    ],
  },
  privacy: {
    title: "隐私政策",
    lastUpdated: "2025年6月",
    sections: [
      {
        heading: "我们收集的信息",
        body: [
          "当您提交简报申请时，我们收集您提供的信息：姓名、机构、职务、电子邮件、类别、主题及留言。",
          "出于安全与运营目的，我们可能收集标准网络服务器日志（IP地址、浏览器类型、访问页面）。",
        ],
      },
      {
        heading: "信息使用方式",
        body: [
          "简报申请数据用于回应您的询盘并评估参与适配性。",
          "我们不出售个人信息。",
        ],
      },
      {
        heading: "保留期限",
        body: [
          "询盘记录按业务及法律需要保留，不再需要时予以删除或匿名化处理。",
        ],
      },
      {
        heading: "联系方式",
        body: [
          `有关本政策的问题可通过 ${ADDRESS.formatted} 的简报表格提交。`,
        ],
      },
    ],
  },
  terms: {
    title: "使用条款",
    lastUpdated: "2025年6月",
    sections: [
      {
        heading: "网站使用",
        body: [
          "本网站旨在提供有关 Metis LLC 及其服务的信息。",
          "内容可能随时变更，恕不另行通知。",
        ],
      },
      {
        heading: "非专业建议",
        body: [
          "本网站材料不构成法律、医疗或监管建议。参与项目受单独协议约束。",
        ],
      },
      {
        heading: "知识产权",
        body: [
          "除另有说明外，网站内容、品牌及文件归 Metis LLC 所有。未经授权的复制受到禁止。",
        ],
      },
      {
        heading: "责任限制",
        body: [
          "在适用法律允许的范围内，Metis LLC 不对因使用本网站而产生的损失承担责任。",
        ],
      },
    ],
  },
  ui: {
    requestBriefing: "申请简报",
    capabilityStatement: "能力说明书",
    viewCapabilities: "查看能力 →",
    fullLeadership: "完整领导简介 →",
    researchDetails: "研究详情 →",
    publicSectorEngagement: "公共部门参与 →",
    allDocuments: "全部文件 →",
    contactPage: "联系页面 →",
    downloadPdf: "下载 PDF",
    primaryBadge: "主要",
    leadership: "领导团队",
    focusAreas: "重点领域",
    office: "办公地址",
    briefingRequest: "简报申请",
    requestBriefingCta: "申请简报 →",
    services: "服务内容",
    relatedDirections: "相关研究方向",
    clientPortal: "客户门户",
    returnToSite: "← 返回 metis.gold",
    ...customerReadinessUi,
  },
  pricing: customerReadinessPricing,
  startPilot: customerReadinessStartPilot,
  quickstart: customerReadinessQuickstart,
  support: customerReadinessSupport,
  langSwitcher: {
    en: "English",
    es: "Español",
    zh: "中文",
    th: "ไทย",
  },
};
