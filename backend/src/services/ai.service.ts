import { AiSuggestion } from "../types";

export const getAiSuggestion = async (
  title: string,
  description: string
): Promise<AiSuggestion> => {
  const apiKey = process.env.LLM_API_KEY;
  const apiUrl = process.env.LLM_API_URL;

  if (!apiKey || !apiUrl) {
    return getFallbackSuggestion(title, description);
  }

  try {
    const prompt = `You are a project management AI assistant. Analyze this task and provide:
1. Effort estimate (in hours or T-shirt size: S/M/L/XL)
2. Suggested due date (from today, in YYYY-MM-DD format)
3. Brief reasoning (1-2 sentences)

Task: ${title}
${description ? `Description: ${description}` : ""}

Respond in JSON format only:
{
  "effort": "string",
  "suggestedDueDate": "YYYY-MM-DD",
  "reasoning": "string"
}`;

    const response = await fetch(`${apiUrl}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.error("LLM API error:", response.status);
      return getFallbackSuggestion(title, description);
    }

    const data = (await response.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return getFallbackSuggestion(title, description);
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return getFallbackSuggestion(title, description);
    }

    const suggestion = JSON.parse(jsonMatch[0]) as AiSuggestion;

    if (!suggestion.effort || !suggestion.suggestedDueDate || !suggestion.reasoning) {
      return getFallbackSuggestion(title, description);
    }

    return suggestion;
  } catch (error) {
    console.error("AI suggestion error:", error);
    return getFallbackSuggestion(title, description);
  }
};

const getFallbackSuggestion = (
  title: string,
  _description: string
): AiSuggestion => {
  const wordCount = title.split(" ").length;
  let effort: string;
  let daysToAdd: number;

  if (wordCount <= 3) {
    effort = "S (2-4 hours)";
    daysToAdd = 1;
  } else if (wordCount <= 6) {
    effort = "M (4-8 hours)";
    daysToAdd = 3;
  } else {
    effort = "L (8-16 hours)";
    daysToAdd = 5;
  }

  const suggestedDate = new Date();
  suggestedDate.setDate(suggestedDate.getDate() + daysToAdd);

  return {
    effort,
    suggestedDueDate: suggestedDate.toISOString().split("T")[0],
    reasoning:
      "This is a fallback estimate based on task title complexity. Connect an LLM API for more accurate suggestions.",
  };
};
