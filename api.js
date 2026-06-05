// api.js — Groq API call (free, fast)

const SYSTEM_PROMPT = `You are a senior software engineer and patient coding mentor.
The user will paste broken code and/or an error message.

Your job:
1. Detect the programming language automatically from the code
2. Explain WHY the error happened in plain simple English (no jargon)
3. Provide the complete fixed code with a clear comment on every single changed line
4. Give one important concept or principle the developer must remember to avoid this mistake in future
5. Classify the mistake into a short label (2-4 words, e.g. "Null reference error", "Index out of bounds")
6. Suggest exactly 2 short follow-up questions the user might want to ask next

Respond ONLY with a valid JSON object. No markdown fences, no preamble, no extra text:
{
  "language": "detected language name e.g. Python, JavaScript, Java",
  "rootCause": "2-3 sentence plain English explanation of WHY this error happened",
  "fixedCode": "complete corrected code with a comment on every changed line",
  "conceptCard": "one core principle the developer must understand — 2 sentences max",
  "mistakeLabel": "2-4 word label e.g. Division by zero, Missing null check",
  "followUpQuestions": ["short question 1", "short question 2"]
}`;

async function callAPI(userInput, apiKey) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1500,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: userInput }
      ]
    })
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message || 'API error. Check your Groq key in config.js');
  }

  const raw = data.choices?.[0]?.message?.content || '';
  const clean = raw.replace(/```json|```/g, '').trim();

  try {
    return JSON.parse(clean);
  } catch (e) {
    throw new Error('Could not read the AI response. Please try again.');
  }
}
