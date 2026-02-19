import { supabase } from './supabaseClient';


function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function validateCouponReal(qrId: string, userLat: number | null, userLng: number | null) {
  const cleanId = qrId.trim().replace(/[^a-zA-Z0-9-]/g, '');

  try {
    // CONSULTA DIRECTA A SUPABASE (Adiós Error 431)
    const { data: promo, error } = await supabase
      .from('promociones')
      .select('*')
      .eq('id', cleanId)
      .single();

    if (error || !promo) {
      return { estado: 2, mensaje: "Cupón no encontrado en la base de datos ❌" };
    }

    // --- VALIDACIÓN DE TIEMPO ---
    if (!promo.hora_inicio || !promo.hora_fin) {
      return { estado: 2, mensaje: "Cupón sin horario configurado ⏰" };
    }

    const ahora = new Date();
    const [hInicio, mInicio] = promo.hora_inicio.split(':');
    const [hFin, mFin] = promo.hora_fin.split(':');
    const horaActualMinutos = ahora.getHours() * 60 + ahora.getMinutes();
    const tiempoInicioMinutos = parseInt(hInicio) * 60 + parseInt(mInicio);
    const tiempoFinMinutos = parseInt(hFin) * 60 + parseInt(mFin);

    if (horaActualMinutos < tiempoInicioMinutos || horaActualMinutos > tiempoFinMinutos) {
      return { estado: 3, mensaje: `Fuera de horario. Válido: ${promo.hora_inicio} - ${promo.hora_fin}` };
    }

    // --- VALIDACIÓN DE DISTANCIA ---
    if (userLat !== null && userLng !== null) {
      const distancia = getDistance(userLat, userLng, promo.latitud, promo.longitud);
      if (distancia > 1000) {
        return { estado: 4, mensaje: `Muy lejos del local (${Math.round(distancia)}m) 📍` };
      }
    } else {
      return { estado: 5, mensaje: "Sin ubicación GPS 📡" };
    }

    return {
      estado: 1,
      mensaje: "¡Cupón Validado con éxito! ✅",
      titulo: promo.titulo_promo,
      image_url: promo.imagen_cupon_url
    };

  } catch (err) {
    return { estado: 2, mensaje: "Error de conexión con la nube" };
  }
}