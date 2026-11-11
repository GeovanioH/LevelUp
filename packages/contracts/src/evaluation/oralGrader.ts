/**
 * LevelUp Socratic Oral Defense Grader
 * 20-Point Strict Rubric (Precision, Fluency, Rigor, Defense) & Prompt Injection Shield
 * Reference: docs/09-ROADMAP.md Section 21.6 & docs/08-IMPLEMENTATION_PLAN.md Tâche 5.1
 */

export interface OralRubricBreakdown {
  precisionConceptuelle: number; // 0 to 5
  fluiditeElocution: number; // 0 to 5
  rigueurSynthese: number; // 0 to 5
  defenseSocratique: number; // 0 to 5
}

export interface OralEvaluationResult {
  totalScore: number; // 0 to 20
  breakdown: OralRubricBreakdown;
  promptInjectionDetected: boolean;
  feedback: string;
}

const INJECTION_PATTERNS = [
  /ignore (all|previous|prior) instructions/i,
  /system override/i,
  /give (me )?20\/20/i,
  /you are now/i,
  /jailbreak/i,
  /dan mode/i,
  /as an ai language model/i,
  /forget (your )?rules/i,
];

const TECHNICAL_KEYWORDS = [
  "gradient",
  "attention",
  "transformer",
  "softmax",
  "varianc",
  "couche",
  "normalis",
  "vecteur",
  "matrice",
  "latence",
  "asynchrone",
  "concurrence",
  "cryptograph",
  "cinématique",
  "topologique",
  "probabilit",
  "entropie",
  "loss",
  "optimis",
];

export class SocraticOralGrader {
  /**
   * Detects prompt injection attempts
   */
  public static isPromptInjection(text: string): boolean {
    return INJECTION_PATTERNS.some((pattern) => pattern.test(text));
  }

  /**
   * Evaluates speech against the 20-point rubric
   */
  public evaluateSpeech(
    transcript: string,
    subject: string,
  ): OralEvaluationResult {
    // 1. Prompt Injection Shield
    if (SocraticOralGrader.isPromptInjection(transcript)) {
      return {
        totalScore: 0,
        breakdown: {
          precisionConceptuelle: 0,
          fluiditeElocution: 0,
          rigueurSynthese: 0,
          defenseSocratique: 0,
        },
        promptInjectionDetected: true,
        feedback:
          "Tentative d'injection de prompt hostile détectée et consignée. Note annulée (0/20). Le Système est incorruptible.",
      };
    }

    const lower = transcript.toLowerCase();

    // 2. Count technical keyword density
    const keywordMatches = TECHNICAL_KEYWORDS.filter((kw) =>
      lower.includes(kw),
    );
    const isVague =
      keywordMatches.length < 2 || transcript.split(/\s+/).length < 25;

    if (isVague) {
      return {
        totalScore: 6,
        breakdown: {
          precisionConceptuelle: 2,
          fluiditeElocution: 2,
          rigueurSynthese: 1,
          defenseSocratique: 1,
        },
        promptInjectionDetected: false,
        feedback: `Manque flagrant de rigueur conceptuelle sur le sujet "${subject}". Vocabulaire imprécis, absence d'équations et de démonstrations tangibles. Niveau insuffisant.`,
      };
    }

    // 3. Technical & rigorous speech
    const precision = keywordMatches.length >= 4 ? 5 : 4;
    const fluidite = transcript.length > 150 ? 5 : 4;
    const rigueur =
      lower.includes("gradient") || lower.includes("normalis") ? 5 : 4;
    const defense =
      lower.includes("évit") ||
      lower.includes("permet") ||
      lower.includes("afin")
        ? 5
        : 4;

    const total = precision + fluidite + rigueur + defense;

    return {
      totalScore: total,
      breakdown: {
        precisionConceptuelle: precision,
        fluiditeElocution: fluidite,
        rigueurSynthese: rigueur,
        defenseSocratique: defense,
      },
      promptInjectionDetected: false,
      feedback: `Élocution technique souveraine sur "${subject}". Rigueur mathématique confirmée, mécanismes sous-jacents parfaitement explicités. Rang d'Élite honoré.`,
    };
  }
}
