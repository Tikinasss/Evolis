const { BedrockRuntimeClient, ConverseCommand } = require("@aws-sdk/client-bedrock-runtime");

let bedrockClient;

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

async function analyzeBusinessWithNova(payload) {
  const prompt = buildPrompt(payload);
  const modelId = process.env.NOVA_MODEL_ID || "amazon.nova-lite-v1:0";
  const client = getBedrockClient();

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

  let response;
  try {
    response = await client.send(command);
  } catch (error) {
    const details = [error.name, error.Code || error.code, error.message].filter(Boolean).join(" | ");
    throw new Error(`Bedrock request failed (${details}). Check AWS region, Bedrock model access, and IAM permissions.`);
  }
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
}

module.exports = {
  analyzeBusinessWithNova,
};
