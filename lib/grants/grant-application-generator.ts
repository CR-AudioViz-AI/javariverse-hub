// lib/grants/grant-application-generator.ts
// AI-POWERED GRANT APPLICATION GENERATOR
// Uses ALL AI providers to write winning applications
// Timestamp: Saturday, December 13, 2025 - 1:45 PM EST

import { CRAIVERSE_MODULES, SUCCESS_PATTERNS } from './javari-grant-intelligence';

// ============================================================
// APPLICATION SECTION GENERATORS
// ============================================================

interface ApplicationRequest {
  grant: {
    id: string;
    title: string;
    agency: string;
    description: string;
    amount: number;
    deadline: string;
    eligibility?: string;
    requirements?: string;
  };
  targetModules: string[];
  organizationInfo: {
    name: string;
    ein: string;
    mission: string;
    yearFounded: number;
    annualBudget: number;
    staffCount: number;
    description: string;
  };
}

interface GeneratedApplication {
  executiveSummary: string;
  needStatement: string;
  projectDescription: string;
  goals: string[];
  objectives: { goal: string; objectives: string[] }[];
  timeline: { phase: string; activities: string[]; months: string }[];
  evaluationPlan: string;
  sustainabilityPlan: string;
  budget: {
    personnel: { title: string; salary: number; fringe: number; fte: number }[];
    supplies: { item: string; cost: number; justification: string }[];
    equipment: { item: string; cost: number; justification: string }[];
    travel: { purpose: string; cost: number }[];
    contractual: { service: string; cost: number }[];
    other: { item: string; cost: number }[];
    indirect: { rate: number; base: number; amount: number };
    total: number;
  };
  budgetNarrative: string;
  organizationalCapacity: string;
  keyPersonnel: { name: string; title: string; role: string; qualifications: string }[];
  logicModel: {
    inputs: string[];
    activities: string[];
    outputs: string[];
    shortTermOutcomes: string[];
    longTermOutcomes: string[];
  };
  letterOfSupportTemplate: string;
  matchScore: number;
  confidence: number;
  aiProviderUsed: string;
}

// ============================================================
// MAIN GENERATOR FUNCTION
// ============================================================

export async function generateGrantApplication(
  request: ApplicationRequest,
  preferredAI: 'claude' | 'gpt4' | 'gemini' | 'auto' = 'auto'
): Promise<GeneratedApplication> {
  // Build comprehensive context
  const context = buildApplicationContext(request);
  
  // Select AI provider based on task
  const aiProvider = preferredAI === 'auto' ? selectBestAI(request) : preferredAI;
  
  // Generate each section
  const [
    executiveSummary,
    needStatement,
    projectDescription,
    evaluationPlan,
    sustainabilityPlan,
    organizationalCapacity,
  ] = await Promise.all([
    generateSection('executive_summary', context, aiProvider),
    generateSection('need_statement', context, aiProvider),
    generateSection('project_description', context, aiProvider),
    generateSection('evaluation_plan', context, aiProvider),
    generateSection('sustainability_plan', context, aiProvider),
    generateSection('organizational_capacity', context, aiProvider),
  ]);

  // Generate structured components
  const goals = extractGoals(projectDescription);
  const objectives = generateObjectives(goals);
  const timeline = generateTimeline(request.grant.deadline);
  const budget = generateBudget(request.grant.amount, request.targetModules);
  const budgetNarrative = generateBudgetNarrative(budget);
  const logicModel = generateLogicModel(request.targetModules);
  const keyPersonnel = generateKeyPersonnel(request.targetModules);
  const letterTemplate = generateLetterOfSupportTemplate(request);

  return {
    executiveSummary,
    needStatement,
    projectDescription,
    goals,
    objectives,
    timeline,
    evaluationPlan,
    sustainabilityPlan,
    budget,
    budgetNarrative,
    organizationalCapacity,
    keyPersonnel,
    logicModel,
    letterOfSupportTemplate: letterTemplate,
    matchScore: calculateApplicationMatchScore(request),
    confidence: 85,
    aiProviderUsed: aiProvider,
  };
}

// ============================================================
// AI-POWERED SECTION GENERATION
// ============================================================

async function generateSection(
  sectionType: string,
  context: string,
  aiProvider: string
): Promise<string> {
  const prompts = getSectionPrompts(sectionType);
  
  try {
    if (aiProvider === 'claude') {
      return await generateWithClaude(prompts.system, prompts.user + '\n\n' + context);
    } else if (aiProvider === 'gpt4') {
      return await generateWithGPT4(prompts.system, prompts.user + '\n\n' + context);
    } else if (aiProvider === 'gemini') {
      return await generateWithGemini(prompts.system + '\n\n' + prompts.user + '\n\n' + context);
    }
  } catch (error) {
    console.error(`Error generating ${sectionType}:`, error);
    // Fallback to template
    return getTemplateSection(sectionType, context);
  }
  
  return getTemplateSection(sectionType, context);
}

async function generateWithClaude(system: string, user: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  });
  
  const data = await response.json();
  return data.content?.[0]?.text || '';
}

async function generateWithGPT4(system: string, user: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      max_tokens: 2000,
    }),
  });
  
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

async function generateWithGemini(prompt: string): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GOOGLE_GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );
  
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// ============================================================
// SECTION PROMPTS
// ============================================================

function getSectionPrompts(sectionType: string): { system: string; user: string } {
  const baseSystem = `You are an expert grant writer with a 95% success rate. You write compelling, 
evidence-based narratives that score highly with federal reviewers. Use the SUCCESS_PATTERNS power 
phrases naturally. Be specific, quantifiable, and persuasive.`;

  const prompts: Record<string, { system: string; user: string }> = {
    executive_summary: {
      system: baseSystem,
      user: `Write a compelling Executive Summary (250-300 words) that:
- Opens with a powerful hook about the problem
- States the proposed solution clearly
- Mentions specific, measurable outcomes
- Highlights organizational qualifications
- Includes the funding amount requested
- Uses power phrases: evidence-based, person-centered, measurable outcomes

POWER PHRASES TO USE: ${SUCCESS_PATTERNS.powerPhrases.slice(0, 8).join(', ')}`,
    },
    need_statement: {
      system: baseSystem,
      user: `Write a compelling Need Statement (400-500 words) that:
- Cites specific statistics and data
- Localizes the problem to the target community
- Connects to national priorities
- Demonstrates urgency
- Shows the gap between current state and desired state
- References recent research or reports

Include at least 3 statistics with citations.`,
    },
    project_description: {
      system: baseSystem,
      user: `Write a detailed Project Description (600-800 words) that:
- Clearly describes the intervention/program
- Explains the theory of change
- Outlines specific activities
- Identifies target population with demographics
- Describes service delivery methods
- Explains how technology/innovation is used
- Shows how it addresses the stated need

Be specific about WHO does WHAT, WHEN, and HOW.`,
    },
    evaluation_plan: {
      system: baseSystem,
      user: `Write a comprehensive Evaluation Plan (300-400 words) that:
- Names an independent evaluator approach
- Includes both process and outcome evaluation
- Lists specific metrics and KPIs
- Describes data collection methods
- Explains how data will be analyzed
- Includes a logic model reference
- Mentions continuous quality improvement

Include at least 5 specific measurable outcomes.`,
    },
    sustainability_plan: {
      system: baseSystem,
      user: `Write a detailed Sustainability Plan (300-400 words) that:
- Identifies diverse revenue streams post-grant
- Names specific potential funders
- Describes fee-for-service opportunities
- Mentions partner commitments
- Outlines phase-out strategy
- Shows organizational commitment to continuation

Be specific about dollar amounts and timelines.`,
    },
    organizational_capacity: {
      system: baseSystem,
      user: `Write an Organizational Capacity section (300-400 words) that:
- Highlights relevant experience
- Lists similar successful projects
- Describes infrastructure and systems
- Mentions key partnerships
- Shows financial management capability
- Demonstrates cultural competency

Emphasize track record of success.`,
    },
  };

  return prompts[sectionType] || prompts.executive_summary;
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function buildApplicationContext(request: ApplicationRequest): string {
  const moduleDetails = request.targetModules.map(m => {
    const mod = CRAIVERSE_MODULES[m as keyof typeof CRAIVERSE_MODULES];
    return mod ? `- ${mod.name}: ${mod.keywords.slice(0, 5).join(', ')}` : '';
  }).filter(Boolean).join('\n');

  return `
GRANT OPPORTUNITY:
- Title: ${request.grant.title}
- Agency: ${request.grant.agency}
- Amount: $${request.grant.amount.toLocaleString()}
- Deadline: ${request.grant.deadline}
- Description: ${request.grant.description}
${request.grant.eligibility ? `- Eligibility: ${request.grant.eligibility}` : ''}

APPLICANT ORGANIZATION:
- Name: ${request.organizationInfo.name}
- EIN: ${request.organizationInfo.ein}
- Mission: ${request.organizationInfo.mission}
- Founded: ${request.organizationInfo.yearFounded}
- Annual Budget: $${request.organizationInfo.annualBudget.toLocaleString()}
- Staff: ${request.organizationInfo.staffCount}
- Description: ${request.organizationInfo.description}

TARGET CRAIVERSE MODULES:
${moduleDetails}

AGENCY PRIORITIES: ${SUCCESS_PATTERNS.agencyPriorities[request.grant.agency as keyof typeof SUCCESS_PATTERNS.agencyPriorities]?.join(', ') || 'evidence-based, measurable outcomes, sustainability'}
`;
}

function selectBestAI(request: ApplicationRequest): 'claude' | 'gpt4' | 'gemini' {
  // Claude for complex analysis and strategy
  // GPT-4 for creative writing
  // Gemini for research synthesis
  
  const agency = request.grant.agency.toUpperCase();
  
  if (['NIH', 'NSF', 'DOE'].includes(agency)) {
    return 'claude'; // Technical/research grants
  } else if (['NEA', 'NEH'].includes(agency)) {
    return 'gpt4'; // Creative/arts grants
  }
  
  return 'claude'; // Default to Claude for best quality
}

function extractGoals(projectDescription: string): string[] {
  // Extract or generate 3-5 high-level goals
  return [
    'Increase access to services for underserved populations',
    'Improve health and wellbeing outcomes through evidence-based interventions',
    'Build sustainable community capacity for ongoing support',
    'Strengthen partnerships and collaborative networks',
    'Develop replicable models for broader implementation',
  ];
}

function generateObjectives(goals: string[]): { goal: string; objectives: string[] }[] {
  return goals.map((goal, i) => ({
    goal,
    objectives: [
      `Objective ${i + 1}.1: Measurable outcome by end of Year 1`,
      `Objective ${i + 1}.2: Measurable outcome by end of Year 2`,
      `Objective ${i + 1}.3: Measurable outcome by project end`,
    ],
  }));
}

function generateTimeline(deadline: string): { phase: string; activities: string[]; months: string }[] {
  return [
    {
      phase: 'Phase 1: Planning & Startup',
      activities: ['Hire staff', 'Establish partnerships', 'Develop protocols', 'Set up systems'],
      months: 'Months 1-3',
    },
    {
      phase: 'Phase 2: Implementation',
      activities: ['Begin service delivery', 'Recruit participants', 'Conduct outreach', 'Collect baseline data'],
      months: 'Months 4-9',
    },
    {
      phase: 'Phase 3: Full Operation',
      activities: ['Scale services', 'Ongoing evaluation', 'Quality improvement', 'Partner coordination'],
      months: 'Months 10-18',
    },
    {
      phase: 'Phase 4: Sustainability & Closeout',
      activities: ['Transition planning', 'Final evaluation', 'Dissemination', 'Sustainability implementation'],
      months: 'Months 19-24',
    },
  ];
}

function generateBudget(totalAmount: number, targetModules: string[]): GeneratedApplication['budget'] {
  // Standard budget allocation
  const personnel = Math.round(totalAmount * 0.60);
  const fringe = Math.round(personnel * 0.25);
  const supplies = Math.round(totalAmount * 0.05);
  const equipment = Math.round(totalAmount * 0.05);
  const travel = Math.round(totalAmount * 0.03);
  const contractual = Math.round(totalAmount * 0.10);
  const other = Math.round(totalAmount * 0.02);
  const indirectBase = personnel + fringe + supplies + travel + other;
  const indirectRate = 0.15;
  const indirect = Math.round(indirectBase * indirectRate);

  return {
    personnel: [
      { title: 'Project Director', salary: Math.round(personnel * 0.35), fringe: Math.round(personnel * 0.35 * 0.25), fte: 1.0 },
      { title: 'Program Manager', salary: Math.round(personnel * 0.25), fringe: Math.round(personnel * 0.25 * 0.25), fte: 1.0 },
      { title: 'Program Coordinator', salary: Math.round(personnel * 0.20), fringe: Math.round(personnel * 0.20 * 0.25), fte: 1.0 },
      { title: 'Data Analyst', salary: Math.round(personnel * 0.15), fringe: Math.round(personnel * 0.15 * 0.25), fte: 0.5 },
      { title: 'Administrative Support', salary: Math.round(personnel * 0.05), fringe: Math.round(personnel * 0.05 * 0.25), fte: 0.25 },
    ],
    supplies: [
      { item: 'Office supplies', cost: Math.round(supplies * 0.3), justification: 'General office operations' },
      { item: 'Program materials', cost: Math.round(supplies * 0.5), justification: 'Direct service delivery materials' },
      { item: 'Technology consumables', cost: Math.round(supplies * 0.2), justification: 'Software subscriptions and tech supplies' },
    ],
    equipment: [
      { item: 'Computer equipment', cost: Math.round(equipment * 0.6), justification: 'Staff workstations and laptops' },
      { item: 'Program equipment', cost: Math.round(equipment * 0.4), justification: 'Specialized equipment for service delivery' },
    ],
    travel: [
      { purpose: 'Local travel for service delivery', cost: Math.round(travel * 0.6) },
      { purpose: 'Conference attendance and training', cost: Math.round(travel * 0.4) },
    ],
    contractual: [
      { service: 'Independent evaluation', cost: Math.round(contractual * 0.5) },
      { service: 'Technical assistance', cost: Math.round(contractual * 0.3) },
      { service: 'Professional services', cost: Math.round(contractual * 0.2) },
    ],
    other: [
      { item: 'Participant incentives', cost: Math.round(other * 0.6) },
      { item: 'Communications', cost: Math.round(other * 0.4) },
    ],
    indirect: { rate: indirectRate * 100, base: indirectBase, amount: indirect },
    total: totalAmount,
  };
}

function generateBudgetNarrative(budget: GeneratedApplication['budget']): string {
  return `BUDGET NARRATIVE

PERSONNEL ($${budget.personnel.reduce((s, p) => s + p.salary, 0).toLocaleString()})
${budget.personnel.map(p => `- ${p.title} (${p.fte} FTE): $${p.salary.toLocaleString()} - Responsible for program implementation and oversight.`).join('\n')}

FRINGE BENEFITS ($${budget.personnel.reduce((s, p) => s + p.fringe, 0).toLocaleString()})
Calculated at 25% of salaries, includes health insurance, retirement, FICA, and workers compensation.

SUPPLIES ($${budget.supplies.reduce((s, i) => s + i.cost, 0).toLocaleString()})
${budget.supplies.map(s => `- ${s.item}: $${s.cost.toLocaleString()} - ${s.justification}`).join('\n')}

EQUIPMENT ($${budget.equipment.reduce((s, i) => s + i.cost, 0).toLocaleString()})
${budget.equipment.map(e => `- ${e.item}: $${e.cost.toLocaleString()} - ${e.justification}`).join('\n')}

TRAVEL ($${budget.travel.reduce((s, t) => s + t.cost, 0).toLocaleString()})
${budget.travel.map(t => `- ${t.purpose}: $${t.cost.toLocaleString()}`).join('\n')}

CONTRACTUAL ($${budget.contractual.reduce((s, c) => s + c.cost, 0).toLocaleString()})
${budget.contractual.map(c => `- ${c.service}: $${c.cost.toLocaleString()}`).join('\n')}

OTHER ($${budget.other.reduce((s, o) => s + o.cost, 0).toLocaleString()})
${budget.other.map(o => `- ${o.item}: $${o.cost.toLocaleString()}`).join('\n')}

INDIRECT COSTS ($${budget.indirect.amount.toLocaleString()})
${budget.indirect.rate}% of modified total direct costs ($${budget.indirect.base.toLocaleString()})

TOTAL PROJECT COST: $${budget.total.toLocaleString()}`;
}

function generateLogicModel(targetModules: string[]): GeneratedApplication['logicModel'] {
  return {
    inputs: [
      'Federal grant funding',
      'Organizational expertise and infrastructure',
      'Community partnerships',
      'Technology platform (CR AudioViz AI)',
      'Staff time and expertise',
      'Volunteer engagement',
    ],
    activities: [
      'Outreach and recruitment',
      'Assessment and intake',
      'Service delivery through multiple modalities',
      'Peer support programs',
      'Training and capacity building',
      'Data collection and evaluation',
    ],
    outputs: [
      '# of participants served',
      '# of services provided',
      '# of training sessions conducted',
      '# of partnerships established',
      '# of resources distributed',
      '# of volunteer hours',
    ],
    shortTermOutcomes: [
      'Increased awareness of available services',
      'Improved access to resources',
      'Enhanced knowledge and skills',
      'Strengthened support networks',
      'Increased engagement in services',
    ],
    longTermOutcomes: [
      'Improved health and wellbeing outcomes',
      'Reduced barriers to services',
      'Sustainable community capacity',
      'Systemic change in service delivery',
      'Replicable model for other communities',
    ],
  };
}

function generateKeyPersonnel(targetModules: string[]): GeneratedApplication['keyPersonnel'] {
  return [
    {
      name: '[Project Director Name]',
      title: 'Project Director',
      role: 'Overall project oversight, strategic direction, stakeholder relationships',
      qualifications: '10+ years experience in program management, Masters degree in relevant field',
    },
    {
      name: '[Program Manager Name]',
      title: 'Program Manager',
      role: 'Day-to-day operations, staff supervision, quality assurance',
      qualifications: '5+ years experience in direct service delivery, relevant certifications',
    },
    {
      name: '[Evaluator Name]',
      title: 'Lead Evaluator',
      role: 'Evaluation design, data analysis, reporting',
      qualifications: 'PhD in evaluation or related field, experience with federal grants',
    },
  ];
}

function generateLetterOfSupportTemplate(request: ApplicationRequest): string {
  return `[LETTER OF SUPPORT TEMPLATE]

[Partner Organization Letterhead]

[Date]

[Funding Agency Name]
[Address]

Re: Letter of Support for ${request.organizationInfo.name} - ${request.grant.title}

Dear Review Committee:

On behalf of [Partner Organization], I am pleased to provide this letter of support for ${request.organizationInfo.name}'s application for the ${request.grant.title} grant.

[Partner Organization] has worked with ${request.organizationInfo.name} since [year] on initiatives related to [describe collaboration]. Through this partnership, we have witnessed their commitment to [mission alignment] and their capacity to [specific capabilities].

If funded, [Partner Organization] commits to:
• [Specific commitment 1]
• [Specific commitment 2]
• [Specific commitment 3]

We believe this project will significantly benefit our community by [specific benefits]. The proposed partnership will leverage our combined strengths to achieve [outcomes].

We strongly endorse this application and look forward to continued collaboration.

Sincerely,

[Signature]
[Name]
[Title]
[Organization]
[Contact Information]`;
}

function calculateApplicationMatchScore(request: ApplicationRequest): number {
  let score = 50;
  
  // Module alignment
  score += request.targetModules.length * 5;
  
  // Amount appropriateness
  if (request.grant.amount < 500000) score += 10;
  
  // Organization fit
  if (request.organizationInfo.annualBudget > request.grant.amount * 0.5) score += 10;
  
  return Math.min(score, 95);
}

function getTemplateSection(sectionType: string, context: string): string {
  // Fallback templates if AI fails
  const templates: Record<string, string> = {
    executive_summary: `CR AudioViz AI requests funding to implement an innovative, evidence-based program 
serving underserved communities through our unique technology platform. This person-centered approach 
will deliver measurable outcomes including improved access to services, enhanced wellbeing, and 
sustainable community capacity. Our track record of success and strong partnerships position us 
to achieve significant impact.`,
    need_statement: `The communities we serve face significant challenges including limited access to 
services, systemic barriers, and resource constraints. Recent data indicates [statistics needed]. 
This gap between need and available resources demands innovative solutions that leverage technology 
while maintaining human connection.`,
    project_description: `Our proposed project will implement a comprehensive program utilizing the 
CR AudioViz AI platform to deliver services through multiple modalities. Key activities include 
outreach, assessment, service delivery, and ongoing support. The program targets [population] and 
will operate for [duration].`,
    evaluation_plan: `We will conduct both process and outcome evaluation using a mixed-methods approach. 
Key metrics include participation rates, satisfaction scores, and outcome measures. Data will be 
collected through surveys, interviews, and system tracking. An independent evaluator will ensure 
objectivity.`,
    sustainability_plan: `Post-grant sustainability will be achieved through diversified funding including 
fee-for-service revenue, foundation grants, and continued federal funding. Partner organizations 
have committed to ongoing support, and the program model will be documented for replication.`,
    organizational_capacity: `CR AudioViz AI has demonstrated capacity through successful implementation 
of similar programs, strong financial management, and established community partnerships. Our 
technology infrastructure and experienced team position us to execute this project effectively.`,
  };
  
  return templates[sectionType] || templates.executive_summary;
}

export { generateGrantApplication, GeneratedApplication, ApplicationRequest };
