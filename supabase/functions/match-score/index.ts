import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { project, candidates, existingTeam } = await req.json();
    const apiKey = Deno.env.get("GEMINI_API_KEY");

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY not set" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are a hackathon team-matching AI.
You are given a Project, an Existing Team, and a list of Candidates.
For EACH candidate, calculate a complementary match score (0 to 100) and bulleted reasons.

Project: ${JSON.stringify(project)}
Existing Team: ${JSON.stringify(existingTeam)}
Candidates: ${JSON.stringify(candidates)}

Scoring criteria:
- +40 points if candidate fills an unfilled needed role from the project.
- +20 points if candidate has complementary skills the team lacks.
- +20 points if candidate wants to learn something the team knows.
- -15 points if skill overlap with existing team is redundant (greater than 50%).
- Clamp final score between 0 and 100.

Return STRICT JSON as an array, one object per candidate, in the same order:
[{"candidateId": "uuid", "score": number, "reasons": ["string", "string"]}]

Return only the JSON array. No markdown. No explanation.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${errText}`);
    }

    const geminiData = await response.json();
    const textOutput = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";
    const cleanOutput = textOutput.replace(/```json/g, "").replace(/```/g, "").trim();
    const result = JSON.parse(cleanOutput);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
