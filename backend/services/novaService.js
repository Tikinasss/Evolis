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

  return `Analyze the following business situation and generate a business recovery plan.\n\nBusiness Information:\nCompany Name: ${companyName}\nIndustry: ${industry}\nRevenue Change: ${revenueChange}\nDebt: ${debt}\nCustomer Review Trend: ${reviewTrend}${documentSection}\nTasks:\n\nDetermine the risk level (Low, Medium, High)\n\nIdentify the main problems\n\nProvide a recovery strategy\n\nSuggest business improvement actions\n\nRespond in JSON format only, with this schema:\n{\n  "risk_level": "Low | Medium | High",\n  "main_problems": ["..."],\n  "recovery_plan": ["..."],\n  "recommendations": ["..."]\n}`;
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
  console.log("[MOCK MODE] Generating mock analysis for:", payload.companyName);
  
  const riskLevels = ["Low", "Medium", "High"];
  const revenueChange = Number(payload.revenueChange);
  const debt = Number(payload.debt);
  
  // Determine risk level based on metrics
  let riskLevel = "Low";
  if (debt > 500000) riskLevel = "High";
  else if (revenueChange < -20 || debt > 200000) riskLevel = "Medium";
  
  return {
    risk_level: riskLevel,
    main_problems: [
      `Revenue declining by ${Math.abs(revenueChange)}% - significant concern for business sustainability`,
      `Current debt level of ${debt} is impacting cash flow and operational flexibility`,
      `${payload.reviewTrend === "negative" ? "Negative customer sentiment affecting brand reputation" : "Market challenges in " + payload.industry}`,
    ],
    recovery_plan: [
      "Phase 1 (Weeks 1-4): Conduct comprehensive cost analysis and identify immediate savings opportunities",
      "Phase 2 (Weeks 5-12): Implement cost reduction measures and improve operational efficiency",
      "Phase 3 (Months 4-6): Develop new revenue streams and customer retention strategies",
      "Phase 4 (Months 6+): Monitor KPIs and optimize business model for sustainable growth",
    ],
    recommendations: [
      "Negotiate payment terms with suppliers to improve cash flow",
      "Focus on high-margin products/services to increase profitability",
      "Implement customer feedback loop to address quality concerns",
      "Consider strategic partnerships to reduce operational costs",
      "Review and optimize pricing strategy based on market conditions",
    ],
    raw_response: "[MOCK MODE] Generated analysis",
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
