

import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Unit, Tenant, FinancialRecord, AIAnalysis } from '../types';

export const analyzeDataWithAI = async (
  units: Unit[],
  tenants: Tenant[],
  records: FinancialRecord[]
): Promise<AIAnalysis> => {
  // Always use a named parameter for apiKey and obtain from process.env.API_KEY
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Como um consultor imobiliário especializado em kitnets, analise estes dados:
    Unidades: ${JSON.stringify(units)}
    Inquilinos: ${JSON.stringify(tenants)}
    Financeiro: ${JSON.stringify(records)}
    
    Forneça um resumo executivo da saúde do negócio, 3 sugestões práticas para aumentar o lucro e avalie o nível de risco financeiro (Baixo, Médio ou Alto).
  `;

  try {
    // Using gemini-3-flash-preview for analysis tasks as per guidelines
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        // Using responseSchema for better structured data reliability
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: 'Resumo executivo da saúde do negócio.',
            },
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
              description: '3 sugestões práticas para aumentar o lucro.',
            },
            riskLevel: {
              type: Type.STRING,
              description: 'Nível de risco financeiro (Baixo, Médio ou Alto).',
            },
          },
          required: ["summary", "suggestions", "riskLevel"],
        }
      }
    });

    // Access the .text property directly (not as a function)
    const jsonStr = response.text?.trim() || '{}';
    const result = JSON.parse(jsonStr);
    
    return {
      summary: result.summary || "Não foi possível gerar o resumo.",
      suggestions: result.suggestions || [],
      riskLevel: result.riskLevel || "Médio"
    };
  } catch (error) {
    console.error("Erro na análise IA:", error);
    return {
      summary: "Erro ao conectar com a inteligência artificial.",
      suggestions: ["Verifique sua conexão", "Tente novamente mais tarde"],
      riskLevel: "Médio"
    };
  }
};