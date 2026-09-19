// Seed data source resolver.
// Priority:
//   1) src/data/data.json  — the REAL portfolio snapshot (23 projects, 29 skills, etc.)
//   2) src/lib/fallbackData.ts via tsx (only if tsx is installed)
//   3) null → mongo-seed.js falls back to its built-in minimal defaults
// data.json and fallbackData share the same enriched shape, so mongo-seed.js
// transforms either one identically (roles[]→CSV, stats{}→flat, gallery embedded).
import fs from 'node:fs';
import path from 'node:path';

function loadRealDataJson() {
  const file = path.resolve(process.cwd(), 'src/data/data.json');
  if (!fs.existsSync(file)) return null;
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
    return data && typeof data === 'object' ? data : null;
  } catch {
    return null;
  }
}

async function safeImport() {
  const json = loadRealDataJson();
  if (json) return { getFallbackPortfolioData: () => json };
  try {
    await import('tsx');
  } catch {
    return { getFallbackPortfolioData: () => null };
  }
  const file = path.resolve(process.cwd(), 'src/lib/fallbackData.ts');
  const mod = await import(file);
  return { getFallbackPortfolioData: mod.getFallbackPortfolioData };
}

export const { getFallbackPortfolioData } = await safeImport();
