const API_KEY = "AIzaSyCJBxbiApBS8pn4eZHcUAo6VNcA03YZlw8";

export const callGemini = async (payload: any, setLoading: (loading: boolean) => void): Promise<string> => {
  setLoading(true);
  try {
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${API_KEY}`;
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const candidate = result.candidates?.[0];
    
    if (candidate && candidate.content?.parts?.[0]?.text) {
      return candidate.content.parts[0].text;
    }
    
    throw new Error('Invalid response structure from API.');
  } catch (error) {
    console.error("API Call Error:", error);
    return `Error: Could not get a response from the AI. Details: ${error.message}`;
  } finally {
    setLoading(false);
  }
};