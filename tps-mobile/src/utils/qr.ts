export function extractIdFromQr(raw: string) {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return "";

  // Caso URL: soporta ?id=ID y /.../ID
  try {
    const url = new URL(trimmed);

    const qid = url.searchParams.get("id");
    if (qid) return qid;

    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length > 0) return parts[parts.length - 1];

    return trimmed;
  } catch {
    // no era URL
  }

  // Caso texto plano (ID directo)
  return trimmed;
}
