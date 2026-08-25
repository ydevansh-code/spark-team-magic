import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { project, currentTeam, message, history } = await req.json();
    const apiKey = Deno.env.get("GEMINI_API_KEY");

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY not set" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are a concise, expert team composition advisor for hackathons and startups.
Your job is to help the user decide what kind of team members to target for their project.

Project context:
- Title: ${project?.title ?? "Unknown"}
- Needed roles: ${(project?.neededRoles ?? []).join(", ") || "none specified"}
- Team size target: ${project?.teamSizeTarget ?? 4}
- Current team skills: ${currentTeam?.map((m: { skills: { name: string }[] }) => m.skills?.map((s: { name: string }) => s.name).join(", ")).join(" | ") || "team is empty"}

When answering:
- Be specific to THIS project context
- Recommend concrete skill sets, role combinations, and what to look for
- Use bullet points and be concise (max 150 words per answer)
- If the team looks complete, say so clearly
- Don't ask follow-up questions, just give actionable advice`;

    const contents = [
      ...(history ?? []).map((h: { role: string; text: string }) => ({
        role: h.role,
        parts: [{ text: h.text }],
      })),
      {
        role: "user",
        parts: [{ text: `${systemPrompt}\n\nUser question: ${message}` }],
      },
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          generationConfig: {
            maxOutputTokens: 400,
            temperature: 0.7,
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${errText}`);
    }

    const geminiData = await response.json();
    const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? "Sorry, I could not generate a response.";

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
