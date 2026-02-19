export type ValidateInput = {
  id: string;
  lat: number | null;
  lng: number | null;
  raw?: string; // opcional: la URL completa por si queremos flags tipo ?force=far
};

export type MisResponse =
  | {
      estado: 1; // válido
      mensaje: string;
      titulo: string;
      image_url: string;
    }
  | {
      estado: 2 | 3 | 4 | 5; // no existe | expirado | fuera perimetro | sin ubicacion
      mensaje: string;
    };

// Punto ficticio del negocio (Santa Cruz ejemplo)
const STORE = { lat: -17.35653, lng: -66.18169, radiusMeters: 1200 };


// “Base de datos” simulada (como si fuera MIS)
const DB: Record<
  string,
  { titulo: string; image_url: string; expiresAt: string }
> = {
  // válido
  "115a13c3-bb80-4cd3-8a8f-3afcf5fb7584": {
    titulo: "Combo Estudiantil 2x1",
    image_url: "https://picsum.photos/seed/cupon1/800/500",
    expiresAt: "2099-12-31T23:59:59Z",
  },

  // expirado
  "EXPIRED-001": {
    titulo: "Promo Expirada",
    image_url: "https://picsum.photos/seed/cupon2/800/500",
    expiresAt: "2000-01-01T00:00:00Z",
  },
};

// Distancia Haversine
function distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000;
  const toRad = (x: number) => (x * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(a));
}

function isExpired(expiresAtIso: string) {
  const exp = new Date(expiresAtIso).getTime();
  const now = Date.now();
  return now > exp;
}

function shouldForceFar(raw?: string) {
  if (!raw) return false;
  try {
    const url = new URL(raw.trim());
    return url.searchParams.get("force") === "far";
  } catch {
    return false;
  }
}

export async function validateCouponMock(input: ValidateInput): Promise<MisResponse> {
  await new Promise((r) => setTimeout(r, 800)); // simula red

  // 2 = no existe (incluye id vacío)
  if (!input.id) {
    return { estado: 2, mensaje: "QR inválido / sin ID ❌" };
  }

  const row = DB[input.id];

  if (!row) {
    return { estado: 2, mensaje: "Cupón no existe ❌" };
  }

  // 3 = expirado por fecha
  if (isExpired(row.expiresAt)) {
    return { estado: 3, mensaje: "Cupón expirado por fecha ❌" };
  }

  // 5 = sin ubicación real
  if (input.lat == null || input.lng == null) {
    return {
      estado: 5,
      mensaje: "No se pudo obtener ubicación real (permiso o GPS apagado) ❌",
    };
  }

  // Forzar fuera de perímetro para demo (QR con ?force=far)
  if (shouldForceFar(input.raw)) {
    return { estado: 4, mensaje: "Fuera del perímetro (forzado) ❌" };
  }

  // 4 = fuera de perímetro real
  const d = distanceMeters(input.lat, input.lng, STORE.lat, STORE.lng);
  if (d > STORE.radiusMeters) {
    return { estado: 4, mensaje: "Fuera del perímetro ❌" };
  }

  // 1 = válido (solo aquí mandamos imagen)
  return {
    estado: 1,
    mensaje: "Cupón válido (dentro del perímetro) ✅",
    titulo: row.titulo,
    image_url: row.image_url,
  };
}
