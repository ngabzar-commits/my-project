
import { GoogleGenAI, Type } from "@google/genai";
import { LogEntry, MessageAnalysis } from "../types";

export const analyzeLogEntry = async (log: LogEntry): Promise<MessageAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `
    Analyze the following backend log entry for a Higgs Domino Island message handler (handleMsg.do).
    Identify potential anomalies, security risks, or optimization opportunities.
    
    Log Data:
    Timestamp: ${log.timestamp}
    Endpoint: ${log.endpoint}
    Payload: ${JSON.stringify(log.payload)}
    Response: ${JSON.stringify(log.response)}
    Latency: ${log.latency}ms
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            riskLevel: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["summary", "riskLevel", "recommendations"]
        }
      }
    });

    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return {
      summary: "Failed to perform AI analysis due to service interruption.",
      riskLevel: "Low",
      recommendations: ["Manually review logs", "Check API connectivity"]
    };
  }
};
