// ============================================================================
// Renovation Glossary — EN→ZH term mappings for AI translation accuracy
// ============================================================================
// Add new terms to the appropriate category. The formatter flattens all
// categories into a single prompt block injected into every AI prompt.

interface GlossaryTerm {
  en: string;
  zh: string;
}

const GLOSSARY: Record<string, GlossaryTerm[]> = {
  locations: [
    { en: "Delta", zh: "三角洲" },
    { en: "Coquitlam", zh: "高贵林" },
    { en: "Surrey", zh: "素里" },
    { en: "Maple Ridge", zh: "枫叶岭" },
  ],
  "cabinet-styles": [{ en: "white shaker", zh: "白色shaker style柜子" }],
};

/**
 * Formats the glossary into a compact text block for injection into AI prompts.
 * Deduplicates entries by `en` key (first occurrence wins).
 * Result is cached since the glossary is static.
 */
function buildGlossaryPrompt(): string {
  const seen = new Set<string>();
  const lines: string[] = [];

  for (const terms of Object.values(GLOSSARY)) {
    for (const { en, zh } of terms) {
      const key = en.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      lines.push(`- ${en} → ${zh}`);
    }
  }

  return `
TRANSLATION GLOSSARY — When you encounter these terms, use the exact Chinese translations below:
${lines.join("\n")}`;
}

const glossaryPromptCache = buildGlossaryPrompt();

export function formatGlossaryForPrompt(): string {
  return glossaryPromptCache;
}
