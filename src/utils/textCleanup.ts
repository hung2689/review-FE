const QUESTION_ANCHORS = [
  /\bWhich\b/i,
  /\bWhat\b/i,
  /\bWhy\b/i,
  /\bHow\b/i,
  /\bWhen\b/i,
  /\bWho\b/i,
  /\bWhere\b/i,
  /\bConsider\b/i,
  /\bFill in the blank\b/i,
  /\bIf\b/i,
  /\bIn a\b/i,
  /\bIn an\b/i,
  /\bIn the\b/i,
  /\bCustomers\b/i,
  /\bSome stakeholders\b/i,
  /\bRequirement statements\b/i,
  /\bPrioritization\b/i,
  /\bValidation of requirements\b/i,
  /\bTwo important goals\b/i,
  /\bWe can reuse\b/i,
  /\bThe benefits\b/i,
  /\bThe four capitalized letters\b/i,
  /\bThe close collaboration\b/i,
  /\bExternal quality attributes\b/i,
  /\bAn analysis model\b/i,
  /\bAn organization\b/i,
  /\bA requirement\b/i,
  /\bA key motivation\b/i,
  /\bA designated representative\b/i,
  /\bDevelop a method\b/i,
  /\bOutsourced\b/i,
  /\bOrganize and share notes\b/i,
  /\bStory point\b/i,
  /\bSoftware as a service\b/i,
  /\bThe Product vision\b/i
];

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function stripWatermarks(value: string) {
  return value
    .replace(/\s+Hoang\s+Hoang\b/gi, '')
    .replace(/\s+Ho\u00e0ng\s+Ho\u00e0ng\b/gi, '')
    .trim();
}

function isMostlyOcrNoise(value: string) {
  const text = value.trim();
  if (!text) return false;
  if (/_{3,}|[\u2013\u2014-]{2,}|={2,}/u.test(text)) return true;

  const letters = text.match(/[A-Za-z]/g) ?? [];
  const lowercase = text.match(/[a-z]/g) ?? [];
  if (letters.length >= 2 && lowercase.length === 0) return true;

  const noisyChars = text.match(/[ERCGSBONIJLMSUVZ_\-=.,;:~\u00bb\u20ac\u00a7\u2013\u2014\s0]+/gi) ?? [];
  const noisyLength = noisyChars.join('').length;
  return noisyLength / text.length > 0.76;
}

function findQuestionStart(value: string) {
  const matches = QUESTION_ANCHORS.flatMap((anchor) => {
    const match = value.match(anchor);
    return match?.index === undefined ? [] : [match.index];
  });

  const sorted = Array.from(new Set(matches)).sort((a, b) => a - b);
  return sorted.find((index) => index > 0 && isMostlyOcrNoise(value.slice(0, index))) ?? null;
}

export function cleanQuestionText(value: string) {
  let text = stripWatermarks(normalizeWhitespace(value));
  const start = findQuestionStart(text);
  if (start !== null) text = text.slice(start);

  text = text
    .replace(/^[\s_\-=.,;:~\u00bb\u20ac\u00a7\u2013\u2014-]+/gu, '')
    .replace(/\blt(?=\s+(?:allows|excludes|only|is|will|can)\b)/gi, 'It')
    .replace(/\blt(?=(?:allows|excludes|only|is|will|can)\b)/gi, 'It')
    .replace(/\bItonly\b/g, 'It only')
    .replace(/\bItis\b/g, 'It is');

  return normalizeWhitespace(text);
}

export function cleanAnswerText(value: string) {
  return stripWatermarks(normalizeWhitespace(value))
    .replace(/\blt(?=\s+(?:allows|excludes|only|is|will|can)\b)/gi, 'It')
    .replace(/\blt(?=(?:allows|excludes|only|is|will|can)\b)/gi, 'It')
    .replace(/\bItonly\b/g, 'It only')
    .replace(/\bItis\b/g, 'It is')
    .trim();
}
