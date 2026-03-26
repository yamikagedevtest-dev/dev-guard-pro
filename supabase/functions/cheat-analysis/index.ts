import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { code, typingData, violations, timeData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const prompt = `You are an expert code reviewer and anti-cheating AI.

Analyze the following candidate data:

1. Code submission:
${code || "No code submitted"}

2. Typing behavior:
${JSON.stringify(typingData || {})}

3. Violations:
${JSON.stringify(violations || [])}

4. Time taken:
${JSON.stringify(timeData || {})}

Tasks:
- Determine if the code is human-written, AI-generated, or copied
- Analyze code originality, logical structure, over-optimization (AI sign)
- Analyze typing rhythm, idle vs active ratio, sudden input bursts

Return your analysis.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: prompt }],
        tools: [{
          type: "function",
          function: {
            name: "cheat_analysis",
            description: "Return cheat analysis results as structured data",
            parameters: {
              type: "object",
              properties: {
                aiGeneratedProbability: { type: "number", description: "0-100 probability code is AI generated" },
                copiedProbability: { type: "number", description: "0-100 probability code was copied" },
                humanLikelihood: { type: "number", description: "0-100 likelihood code is human written" },
                confidence: { type: "number", description: "0-100 confidence in the analysis" },
                reasons: { type: "array", items: { type: "string" }, description: "List of reasons for the verdict" },
                finalVerdict: { type: "string", enum: ["CLEAN", "SUSPICIOUS", "CHEATED"], description: "Final verdict" },
              },
              required: ["aiGeneratedProbability", "copiedProbability", "humanLikelihood", "confidence", "reasons", "finalVerdict"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "cheat_analysis" } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, try again later" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted, please add funds" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    let analysis;

    if (toolCall) {
      analysis = JSON.parse(toolCall.function.arguments);
    } else {
      analysis = {
        aiGeneratedProbability: 50,
        copiedProbability: 30,
        humanLikelihood: 50,
        confidence: 40,
        reasons: ["Unable to parse AI response"],
        finalVerdict: "SUSPICIOUS",
      };
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
