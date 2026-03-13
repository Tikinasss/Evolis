const { BedrockRuntimeClient, ConverseCommand } = require("@aws-sdk/client-bedrock-runtime");

let bedrockClient;

const USE_MOCK_MODE = process.env.USE_MOCK_ANALYSIS === "true";
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 1000; // 1 second

function getBedrockClient() {
  if (bedrockClient) {
    return bedrockClient;
  }

  const region = process.env.AWS_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!region || !accessKeyId || !secretAccessKey) {
    throw new Error("AWS Bedrock is not configured. Check AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY.");
  }

  bedrockClient = new BedrockRuntimeClient({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return bedrockClient;
}

function buildPrompt({ companyName, industry, revenueChange, debt, reviewTrend, documentText }) {
  const documentSection = documentText
    ? `\nDocument Context (PDF excerpt):\n${documentText.slice(0, 4000)}\n`
    : "\nDocument Context: Not provided.\n";

  return `You are a business recovery expert analyst. Analyze the following business situation comprehensively and generate a detailed recovery plan with realistic projections.

BUSINESS INFORMATION:
Company Name: ${companyName}
Industry: ${industry}
Revenue Change: ${revenueChange}%
Current Debt: $${debt}
Customer Review Trend: ${reviewTrend}
${documentSection}

ANALYSIS REQUIREMENTS:
1. Risk Assessment - Determine risk level and explain why
2. Current Financial Snapshot - Analyze the financial health
3. Root Cause Analysis - Identify 5-7 main problems with details
4. Realistic Projections - Provide 12-month recovery projections with specific numbers
5. Recovery strategy with timeline (Months 1-3, 4-6, 7-12)
6. Specific, actionable recommendations with expected ROI
7. Industry benchmarks and how company compares
8. Success metrics and KPIs to track
9. Training and skill gap resources

Respond ONLY in this JSON format:
{
  "risk_level": "Low | Medium | High",
  "financial_snapshot": {
    "current_cash_position": "assessment",
    "burn_rate": "monthly burn rate if declining",
    "runway_months": "estimated months of operation"
  },
  "main_problems": [
    {
      "problem": "specific problem",
      "impact": "financial impact description",
      "severity": "High/Medium/Low",
      "evidence": "why this is a problem"
    }
  ],
  "projections_12_months": {
    "month_3": {
      "projected_revenue": "number",
      "projected_debt": "number",
      "health_score": "0-100"
    },
    "month_6": {
      "projected_revenue": "number",
      "projected_debt": "number",
      "health_score": "0-100"
    },
    "month_12": {
      "projected_revenue": "number",
      "projected_debt": "number",
      "health_score": "0-100"
    }
  },
  "recovery_plan": [
    {
      "phase": "Phase Name (Month X-Y)",
      "focus": "main focus area",
      "actions": ["specific action 1", "specific action 2"],
      "expected_impact": "expected financial/operational impact",
      "success_metrics": ["metric 1", "metric 2"]
    }
  ],
  "recommendations": [
    {
      "recommendation": "specific recommendation",
      "priority": "Critical/High/Medium",
      "estimated_roi": "estimated return on investment %",
      "implementation_cost": "estimated cost",
      "timeline": "weeks/months",
      "responsible_team": "who should handle"
    }
  ],
  "industry_benchmarks": {
    "average_margin": "industry average profit margin",
    "company_margin": "current company margin",
    "industry_growth_rate": "typical growth rate",
    "debt_to_revenue_ratio_industry": "industry standard",
    "company_debt_ratio": "current ratio"
  },
  "success_metrics": [
    {
      "kpi": "Key Performance Indicator",
      "current_value": "current value",
      "target_value": "target value",
      "measurement_frequency": "daily/weekly/monthly"
    }
  ],
  "training_resources": [
    {
      "topic": "skill/knowledge area",
      "resource_name": "name of course/resource",
      "provider": "Udemy/Coursera/LinkedIn Learning/YouTube",
      "url": "actual working URL",
      "duration": "course duration",
      "cost": "free/paid",
      "relevance": "why relevant to this business"
    }
  ]
}`;
}

function parseNovaJsonResponse(text) {
  try {
    return JSON.parse(text);
  } catch (_error) {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("Nova response did not include valid JSON.");
    }
    return JSON.parse(match[0]);
  }
}

/**
 * Generate mock analysis for development/testing
 */
function generateMockAnalysis(payload) {
  console.log("[MOCK MODE] Generating comprehensive mock analysis for:", payload.companyName);
  
  const revenueChange = Number(payload.revenueChange);
  const debt = Number(payload.debt);
  
  // Determine risk level and projections based on metrics
  let riskLevel = "Low";
  let currentHealthScore = 75;
  let projectedMonth3Health = 65;
  let projectedMonth6Health = 75;
  let projectedMonth12Health = 85;
  
  if (debt > 500000 || revenueChange < -30) {
    riskLevel = "High";
    currentHealthScore = 35;
    projectedMonth3Health = 45;
    projectedMonth6Health = 65;
    projectedMonth12Health = 75;
  } else if (debt > 200000 || revenueChange < -15) {
    riskLevel = "Medium";
    currentHealthScore = 55;
    projectedMonth3Health = 60;
    projectedMonth6Health = 72;
    projectedMonth12Health = 82;
  }
  
  // Assume base revenue (estimate from debt ratio)
  const estimatedCurrentRevenue = debt > 0 ? Math.round(debt / 0.3) : 500000;
  const baselineRevenue = estimatedCurrentRevenue / (1 + revenueChange / 100);
  
  return {
    risk_level: riskLevel,
    financial_snapshot: {
      current_cash_position: `Critical - Company has ${revenueChange}% revenue decline with $${debt} debt`,
      burn_rate: `$${Math.round((Math.abs(revenueChange) / 100) * estimatedCurrentRevenue / 12)} per month`,
      runway_months: `${Math.max(3, Math.round(debt / ((Math.abs(revenueChange) / 100) * estimatedCurrentRevenue / 12)))}`
    },
    main_problems: [
      {
        problem: "Revenue Decline",
        impact: `${Math.abs(revenueChange)}% decline represents $${Math.round(Math.abs(revenueChange / 100) * baselineRevenue)} in lost revenue`,
        severity: Math.abs(revenueChange) > 30 ? "High" : "Medium",
        evidence: "Market shift, competition, or operational issues"
      },
      {
        problem: "Debt Burden",
        impact: `$${debt} debt consuming ${Math.round((debt / estimatedCurrentRevenue) * 100)}% of annual revenue`,
        severity: debt > 300000 ? "High" : "Medium",
        evidence: "Debt-to-revenue ratio exceeds healthy threshold"
      },
      {
        problem: `${payload.reviewTrend === "negative" ? "Customer Satisfaction Crisis" : "Market Positioning Weakness"}`,
        impact: "Affecting customer retention and acquisition",
        severity: "High",
        evidence: `${payload.reviewTrend} customer sentiment trend`
      },
      {
        problem: "Cash Flow Pressure",
        impact: "Limited ability to invest in growth or handle emergencies",
        severity: "High",
        evidence: "Combination of revenue decline and debt load"
      },
      {
        problem: "Operational Efficiency Gap",
        impact: "Cost structure likely misaligned with current revenue",
        severity: "Medium",
        evidence: "Declining revenue without proportional cost reduction"
      }
    ],
    projections_12_months: {
      month_3: {
        projected_revenue: Math.round(estimatedCurrentRevenue * 1.05),
        projected_debt: Math.round(debt * 0.95),
        health_score: projectedMonth3Health
      },
      month_6: {
        projected_revenue: Math.round(estimatedCurrentRevenue * 1.12),
        projected_debt: Math.round(debt * 0.85),
        health_score: projectedMonth6Health
      },
      month_12: {
        projected_revenue: Math.round(estimatedCurrentRevenue * 1.25),
        projected_debt: Math.round(debt * 0.60),
        health_score: projectedMonth12Health
      }
    },
    recovery_plan: [
      {
        phase: "Phase 1: Stabilization (Weeks 1-4)",
        focus: "Stop the bleeding and regain control",
        actions: [
          "Conduct immediate cost audit and identify $" + Math.round(estimatedCurrentRevenue * 0.15) + "+ in savings",
          "Implement cash preservation measures",
          "Renegotiate supplier terms to extend payment windows",
          "Freeze non-essential spending"
        ],
        expected_impact: "Reduce monthly burn rate by 20-30%, buy 3-6 months runway",
        success_metrics: ["Monthly burn rate reduced", "Cash runway extended", "Supplier negotiations completed"]
      },
      {
        phase: "Phase 2: Revenue Recovery (Weeks 5-16)",
        focus: "Stabilize and grow top line",
        actions: [
          "Launch customer retention campaign (target 10% churn reduction)",
          "Implement new acquisition strategy (social, partnerships)",
          "Review and optimize pricing (5-10% increase opportunity)",
          "Enter new market segments or geographic areas"
        ],
        expected_impact: "Grow revenue by 10-15%, improve customer satisfaction",
        success_metrics: ["Revenue growth rate", "Customer acquisition cost", "Customer lifetime value"]
      },
      {
        phase: "Phase 3: Debt Reduction & Scaling (Weeks 17-52)",
        focus: "Strengthen financial position and prepare growth",
        actions: [
          "Allocate 40-50% of new revenue to debt paydown",
          "Invest in technology/automation to improve margins",
          "Build team capability in high-lever areas",
          "Diversify revenue streams"
        ],
        expected_impact: "Reduce debt by 40%, achieve $" + Math.round(estimatedCurrentRevenue * 1.25) + " revenue target",
        success_metrics: ["Debt-to-revenue ratio", "Profit margin", "Employee productivity"]
      }
    ],
    recommendations: [
      {
        recommendation: "Implement cost optimization program",
        priority: "Critical",
        estimated_roi: "150-200%",
        implementation_cost: "$10k-30k",
        timeline: "2-4 weeks",
        responsible_team: "CFO/COO"
      },
      {
        recommendation: "Launch customer retention program",
        priority: "Critical",
        estimated_roi: "300-400%",
        implementation_cost: "$5k-15k",
        timeline: "1-2 weeks",
        responsible_team: "Sales/Marketing/Customer Success"
      },
      {
        recommendation: "Renegotiate debt terms or refinance",
        priority: "High",
        estimated_roi: "50-100%",
        implementation_cost: "Minimal",
        timeline: "3-8 weeks",
        responsible_team: "CFO"
      },
      {
        recommendation: "Improve operational efficiency",
        priority: "High",
        estimated_roi: "100-150%",
        implementation_cost: "$20k-50k",
        timeline: "6-12 weeks",
        responsible_team: "Operations/Technology"
      },
      {
        recommendation: "Develop new revenue stream",
        priority: "Medium",
        estimated_roi: "200%+",
        implementation_cost: "$30k-100k",
        timeline: "8-16 weeks",
        responsible_team: "Product/Business Development"
      }
    ],
    industry_benchmarks: {
      average_margin: `${payload.industry === "Technology" ? "30-40%" : payload.industry === "Retail" ? "15-25%" : "20-30%"}`,
      company_margin: Math.round(((estimatedCurrentRevenue - (estimatedCurrentRevenue * 0.6)) / estimatedCurrentRevenue) * 100) + "%",
      industry_growth_rate: "5-15% annually",
      debt_to_revenue_ratio_industry: "0.5-1.5x",
      company_debt_ratio: Math.round((debt / estimatedCurrentRevenue) * 100) / 100 + "x"
    },
    success_metrics: [
      {
        kpi: "Revenue Growth Rate",
        current_value: revenueChange + "%",
        target_value: "+15% (vs baseline)",
        measurement_frequency: "monthly"
      },
      {
        kpi: "Debt-to-Revenue Ratio",
        current_value: Math.round((debt / estimatedCurrentRevenue) * 100) / 100 + "x",
        target_value: "0.5x",
        measurement_frequency: "quarterly"
      },
      {
        kpi: "Gross Margin",
        current_value: "40% (estimated)",
        target_value: "50%+",
        measurement_frequency: "monthly"
      },
      {
        kpi: "Customer Satisfaction Score",
        current_value: payload.reviewTrend === "negative" ? "3.5/5" : "4/5",
        target_value: "4.5/5",
        measurement_frequency: "monthly"
      },
      {
        kpi: "Cash Runway",
        current_value: "6-9 months",
        target_value: "12+ months",
        measurement_frequency: "monthly"
      }
    ],
    training_resources: [
      {
        topic: "Financial Management & Accounting",
        resource_name: "Financial Analysis for Non-Financial Managers",
        provider: "Coursera",
        url: "https://www.coursera.org/learn/financial-management",
        duration: "4 weeks",
        cost: "free",
        relevance: "Understand financial metrics and improve decision-making"
      },
      {
        topic: "Cost Optimization",
        resource_name: "Operations Management Fundamentals",
        provider: "LinkedIn Learning",
        url: "https://www.linkedin-learning.com/courses/operations-management-fundamentals",
        duration: "3 hours",
        cost: "paid",
        relevance: "Learn to identify and eliminate inefficiencies"
      },
      {
        topic: "Sales & Revenue Growth",
        resource_name: "The Art of Closing Sales",
        provider: "Udemy",
        url: "https://www.udemy.com/course/sales-techniques-the-art-of-closing-sales/",
        duration: "5 hours",
        cost: "paid",
        relevance: "Increase conversion rates and average deal size"
      },
      {
        topic: "Customer Retention",
        resource_name: "Customer Success Management",
        provider: "Gainsight Academy",
        url: "https://www.gainsightacademy.com/",
        duration: "Self-paced",
        cost: "free",
        relevance: "Reduce churn and improve customer lifetime value"
      },
      {
        topic: "Business Strategy",
        resource_name: "Strategic Thinking and Execution",
        provider: "Coursera",
        url: "https://www.coursera.org/learn/strategic-thinking",
        duration: "6 weeks",
        cost: "free",
        relevance: "Develop comprehensive turnaround strategy"
      },
      {
        topic: "Leadership During Crisis",
        resource_name: "Leading in Times of Change",
        provider: "LinkedIn Learning",
        url: "https://www.linkedin-learning.com/courses/leading-in-times-of-change",
        duration: "2 hours",
        cost: "paid",
        relevance: "Navigate organizational challenges and maintain team morale"
      },
      {
        topic: "Cash Flow Management",
        resource_name: "Cash Flow Management for Business Owners",
        provider: "YouTube (SCORE Mentors)",
        url: "https://www.youtube.com/watch?v=r3CQ5HJnCcY",
        duration: "20 minutes",
        cost: "free",
        relevance: "Master critical cash flow management techniques"
      },
      {
        topic: "Debt Management",
        resource_name: "How to Manage Business Debt",
        provider: "Small Business Administration",
        url: "https://www.sba.gov/",
        duration: "Self-paced",
        cost: "free",
        relevance: "Understand debt restructuring and negotiation strategies"
      }
    ]
  };
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if error is a throttling error
 */
function isThrottlingError(error) {
  const errorName = error.Code || error.code || error.name || "";
  const errorMessage = (error.message || "").toLowerCase();
  
  return (
    errorName.includes("Throttling") ||
    errorName.includes("ThrottlingException") ||
    errorName.includes("RateLimitExceeded") ||
    errorName.includes("LimitExceeded") ||
    errorMessage.includes("too many tokens") ||
    errorMessage.includes("rate limit") ||
    errorMessage.includes("throttl")
  );
}

/**
 * Analyze business with retry logic and fallback to mock mode
 */
async function analyzeBusinessWithNova(payload) {
  // Use mock mode if enabled
  if (USE_MOCK_MODE) {
    return generateMockAnalysis(payload);
  }

  const prompt = buildPrompt(payload);
  const modelId = process.env.NOVA_MODEL_ID || "amazon.nova-lite-v1:0";
  const client = getBedrockClient();

  let lastError = null;

  // Retry logic with exponential backoff
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const command = new ConverseCommand({
        modelId,
        messages: [
          {
            role: "user",
            content: [{ text: prompt }],
          },
        ],
        inferenceConfig: {
          maxTokens: 700,
          temperature: 0.2,
          topP: 0.9,
        },
      });

      const response = await client.send(command);
      
      const content = response.output?.message?.content || [];
      const text = content
        .filter((part) => typeof part.text === "string")
        .map((part) => part.text)
        .join("\n")
        .trim();

      if (!text) {
        throw new Error("Nova returned an empty response.");
      }

      const parsed = parseNovaJsonResponse(text);

      return {
        risk_level: parsed.risk_level || "Medium",
        main_problems: Array.isArray(parsed.main_problems) ? parsed.main_problems : [],
        recovery_plan: Array.isArray(parsed.recovery_plan) ? parsed.recovery_plan : [],
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
        raw_response: text,
      };
    } catch (error) {
      lastError = error;

      // Check if this is a throttling error
      if (isThrottlingError(error)) {
        if (attempt < MAX_RETRIES) {
          const delayMs = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
          console.warn(
            `[Bedrock Throttling] Attempt ${attempt}/${MAX_RETRIES} failed. Retrying in ${delayMs}ms...`
          );
          await sleep(delayMs);
          continue; // Retry
        } else {
          // All retries failed, fall back to mock mode
          console.warn(
            `[Bedrock Throttling] All ${MAX_RETRIES} retries failed. Falling back to mock analysis.`
          );
          return generateMockAnalysis(payload);
        }
      }

      // For non-throttling errors, fail immediately with better message
      const errorDetails = [error.Code || error.code, error.message]
        .filter(Boolean)
        .join(" - ");

      throw new Error(
        `Bedrock analysis failed: ${errorDetails}\n\nTroubleshooting:\n` +
        `1. Check AWS region and model access: ${process.env.NOVA_MODEL_ID || "amazon.nova-lite-v1:0"}\n` +
        `2. Verify IAM permissions for bedrock:InvokeModel\n` +
        `3. If quota exceeded, enable mock mode with USE_MOCK_ANALYSIS=true\n` +
        `4. Contact AWS support if the error persists`
      );
    }
  }

  // This should not be reached, but just in case
  throw lastError;
}

module.exports = {
  analyzeBusinessWithNova,
};
