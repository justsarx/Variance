
export async function rewriteParagraphExternal(
  text: string,
  apiKey: string,
  provider: 'OpenAI' | 'Anthropic' | 'Gemini',
  varianceLevel: number
): Promise<string> {
  const temperature = (varianceLevel / 100) * 0.5 + 0.6; // 0.6 to 1.1
  const userPrompt = `Rewrite this paragraph:\n\n${text}`;
  
  let systemPrompt = "You are a professional editor. Rewrite the following paragraph to read more naturally and human-like. Maintain the original meaning but vary the sentence structure and vocabulary.";
  
  if (varianceLevel > 75) {
    systemPrompt += " Use a more conversational, informal tone. Occasionally use run-on sentences or informal transitions to mimic human burstiness.";
  }

  if (provider === 'OpenAI') {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4.1-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: temperature,
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API request failed (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (err) {
      console.error('OpenAI Error:', err);
      throw err;
    }
  } else if (provider === 'Anthropic') {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-haiku-latest',
          max_tokens: 1024,
          system: systemPrompt,
          messages: [
            { role: 'user', content: userPrompt }
          ],
          temperature: (varianceLevel / 100)
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Anthropic API request failed (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      return data.content[0].text.trim();
    } catch (err) {
      console.error('Anthropic Error:', err);
      throw err;
    }
  } else if (provider === 'Gemini') {
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
          }],
          generationConfig: {
            temperature: temperature,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API request failed (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text.trim();
    } catch (err) {
      console.error('Gemini Error:', err);
      throw err;
    }
  }

  return text;
}
