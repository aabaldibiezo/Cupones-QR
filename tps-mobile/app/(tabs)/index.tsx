import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  Pressable,
  useColorScheme,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { supabase } from "../../src/services/supabaseClient";

// Importamos la lógica real de extracción e integración
import { extractIdFromQr } from "../../src/utils/qr";
import { validateCouponReal } from "../../src/services/misService";

type UiState = "scanning" | "loading" | "result";
type GpsStatus = "checking" | "ready" | "no_permission" | "service_off";

export default function Screen() {
  const scheme = useColorScheme();
  const isDark = scheme !== "light";

  const colors = useMemo(
    () => ({
      bg: isDark ? "#0B1220" : "#F6F7FB",
      card: isDark ? "#121A2A" : "#FFFFFF",
      text: isDark ? "#E5E7EB" : "#0F172A",
      sub: isDark ? "#A8B0C0" : "#475569",
      border: isDark ? "rgba(255,255,255,0.10)" : "rgba(15,23,42,0.10)",
      primary: "#2563EB",
      secondary: "#7C3AED",
      danger: "#EF4444",
      success: "#22C55E",
      warn: "#F59E0B",
    }),
    [isDark]
  );

  const [camPerm, requestCamPerm] = useCameraPermissions();
  const [uiState, setUiState] = useState<UiState>("scanning");
  const [scanned, setScanned] = useState(false);

  const [promoId, setPromoId] = useState<string | null>(null);
  const [misResponse, setMisResponse] = useState<any>(null);

  const [gpsStatus, setGpsStatus] = useState<GpsStatus>("checking");

  // Solicitud automática de permisos de cámara
  useEffect(() => {
    if (!camPerm) return;
    if (!camPerm.granted) requestCamPerm();
  }, [camPerm, requestCamPerm]);

  // Verificación inicial de GPS
  useEffect(() => {
    refreshGpsStatus();
  }, []);

  async function refreshGpsStatus() {
    try {
      setGpsStatus("checking");
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setGpsStatus("no_permission");
        return;
      }

      const servicesEnabled = await Location.hasServicesEnabledAsync();
      setGpsStatus(servicesEnabled ? "ready" : "service_off");
    } catch {
      setGpsStatus("service_off");
    }
  }

  async function getLocationOrNull() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setGpsStatus("no_permission");
      return { lat: null, lng: null };
    }

    const servicesEnabled = await Location.hasServicesEnabledAsync();
    if (!servicesEnabled) {
      setGpsStatus("service_off");
      return { lat: null, lng: null };
    }

    setGpsStatus("ready");
    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return { lat: loc.coords.latitude, lng: loc.coords.longitude };
  }

  async function processQr(raw: string) {
  setUiState("loading");

  const id = extractIdFromQr(raw);
  setPromoId(id || "(sin id)");

  if (!id) {
    setMisResponse({ estado: 2, mensaje: "QR inválido o sin ID ❌" });
    setUiState("result");
    return;
  }

  const { lat, lng } = await getLocationOrNull();

  try {
    // 1. Llamas a la validación que ya tenías
    const response = await validateCouponReal(id, lat, lng);
    setMisResponse(response);

    // 2. AQUÍ INSERTAS EL LOG EN SUPABASE
    // Esto es lo que hará que aparezcan datos en tu pestaña de "Monitoreo" del Admin
    await supabase.from('logs_escaneos').insert([
  { 
    id_qr: id,             // Tu tabla usa 'id_qr'
    es_valido: response.estado === 1, 
    fecha_hora: new Date().toISOString(),
    motivo_error: response.estado !== 1 ? response.mensaje : "" // Opcional: guardamos por qué falló
  }
]);

  } catch (error) {
    setMisResponse({ estado: 2, mensaje: "Error de conexión con el MIS 🌐" });
  }
  
  setUiState("result");
}

  function reset() {
    setScanned(false);
    setPromoId(null);
    setMisResponse(null);
    setUiState("scanning");
    refreshGpsStatus();
  }

  // ---- RENDERIZADO: Permisos ----
  if (!camPerm) return <View style={[styles.center, { backgroundColor: colors.bg }]}><ActivityIndicator /></View>;

  if (!camPerm.granted) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg, padding: 20 }]}>
        <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.heroCard}>
          <MaterialCommunityIcons name="camera" size={34} color="white" />
          <Text style={styles.heroTitle}>Permiso de cámara</Text>
          <Text style={styles.heroSub}>Necesario para escanear cupones QR.</Text>
          <Pressable onPress={requestCamPerm} style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>Permitir cámara</Text>
          </Pressable>
        </LinearGradient>
      </View>
    );
  }

  // ---- RENDERIZADO: Loading ----
  if (uiState === "loading") {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.smallCard}>
          <ActivityIndicator color="white" />
          <Text style={{ color: "white", marginTop: 10, fontWeight: "700" }}>Validando en MIS...</Text>
        </LinearGradient>
      </View>
    );
  }

  // ---- RENDERIZADO: Resultado ----
  if (uiState === "result") {
    const estado = misResponse?.estado;
    const estadoColor = estado === 1 ? colors.success : estado === 3 ? colors.warn : colors.danger;
    const labels: Record<number, string> = { 1: "Válido", 2: "Inexistente", 3: "Expirado", 4: "Fuera de Rango", 5: "Sin GPS" };

    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.header}>
          <Text style={styles.headerTitle}>Resultado de Validación</Text>
          <Text style={styles.headerSub}>ID: {promoId}</Text>
        </LinearGradient>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.badge, { backgroundColor: estadoColor }]}>
            <Text style={styles.badgeText}>{labels[estado] || "Error"}</Text>
          </View>
          <Text style={{ color: colors.text, marginTop: 15, fontSize: 16 }}>{misResponse?.mensaje}</Text>

          {estado === 1 && misResponse?.image_url && (
            <Image source={{ uri: misResponse.image_url }} style={styles.image} resizeMode="cover" />
          )}

          <Pressable onPress={reset} style={styles.scanAgainBtn}>
            <MaterialCommunityIcons name="qrcode-scan" size={20} color="white" />
            <Text style={styles.scanAgainText}>Escanear nuevo</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ---- RENDERIZADO: Scanner ----
  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <CameraView
        style={{ flex: 1 }}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={(result) => {
          if (scanned) return;
          setScanned(true);
          processQr(result.data);
        }}
      />
      <View style={styles.scanFrame}>
        <View style={[styles.corner, styles.tl]} /><View style={[styles.corner, styles.tr]} />
        <View style={[styles.corner, styles.bl]} /><View style={[styles.corner, styles.br]} />
      </View>
      <View style={styles.bottomOverlay}>
        <LinearGradient colors={["rgba(37,99,235,0.9)", "rgba(124,58,237,0.9)"]} style={styles.bottomCard}>
          <Text style={styles.scanTitle}>Apunta al QR del cupón</Text>
          <Text style={styles.scanSub}>
            GPS: {gpsStatus === "ready" ? "Conectado ✅" : "Problemas detectados ❌"}
          </Text>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1 },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { color: "white", fontSize: 22, fontWeight: "800" },
  headerSub: { color: "rgba(255,255,255,0.8)", marginTop: 5 },
  card: { margin: 20, borderRadius: 20, padding: 20, borderWidth: 1, alignItems: 'center' },
  badge: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  badgeText: { color: "white", fontWeight: "bold" },
  image: { width: "100%", height: 200, marginTop: 20, borderRadius: 15 },
  scanAgainBtn: { marginTop: 25, width: '100%', borderRadius: 15, padding: 15, backgroundColor: "#2563EB", flexDirection: 'row', justifyContent: 'center', gap: 10 },
  scanAgainText: { color: "white", fontWeight: "bold" },
  heroCard: { borderRadius: 25, padding: 30, alignItems: "center", width: '90%' },
  heroTitle: { color: "white", fontSize: 20, fontWeight: "bold", marginTop: 15 },
  heroSub: { color: "white", opacity: 0.8, marginTop: 10, textAlign: 'center' },
  primaryBtn: { marginTop: 20, backgroundColor: "white", paddingVertical: 12, paddingHorizontal: 25, borderRadius: 12 },
  primaryBtnText: { color: "#2563EB", fontWeight: "bold" },
  smallCard: { padding: 30, borderRadius: 20, alignItems: 'center' },
  scanFrame: { position: "absolute", top: "25%", left: "15%", right: "15%", height: 250 },
  corner: { position: "absolute", width: 40, height: 40, borderColor: "white" },
  tl: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 15 },
  tr: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 15 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 15 },
  br: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 15 },
  bottomOverlay: { position: "absolute", bottom: 40, left: 20, right: 20 },
  bottomCard: { borderRadius: 20, padding: 20 },
  scanTitle: { color: "white", fontSize: 18, fontWeight: "bold" },
  scanSub: { color: "white", opacity: 0.9, marginTop: 5 }
});