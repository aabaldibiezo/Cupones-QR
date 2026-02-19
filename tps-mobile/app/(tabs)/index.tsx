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

import { extractIdFromQr } from "../../src/utils/qr";
import { validateCouponMock, MisResponse } from "../../src/services/misMock";

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
  const [misResponse, setMisResponse] = useState<MisResponse | null>(null);

  const [gpsStatus, setGpsStatus] = useState<GpsStatus>("checking");

  useEffect(() => {
    if (!camPerm) return;
    if (!camPerm.granted) requestCamPerm();
  }, [camPerm, requestCamPerm]);

  useEffect(() => {
    refreshGpsStatus();
  }, []);

  async function refreshGpsStatus() {
    try {
      setGpsStatus("checking");

      const perm = await Location.getForegroundPermissionsAsync();
      if (perm.status !== "granted") {
        setGpsStatus("no_permission");
        return;
      }

      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        setGpsStatus("service_off");
        return;
      }

      setGpsStatus("ready");
    } catch {
      setGpsStatus("service_off");
    }
  }

  async function getLocationOrNull() {
    const perm = await Location.getForegroundPermissionsAsync();
    if (perm.status !== "granted") {
      const req = await Location.requestForegroundPermissionsAsync();
      if (req.status !== "granted") {
        setGpsStatus("no_permission");
        return { lat: null as number | null, lng: null as number | null };
      }
    }

    const servicesEnabled = await Location.hasServicesEnabledAsync();
    if (!servicesEnabled) {
      setGpsStatus("service_off");
      return { lat: null as number | null, lng: null as number | null };
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

    // Si no hay ID extraíble, ni llamamos al MIS
    if (!id) {
      setMisResponse({ estado: 2, mensaje: "QR inválido / sin ID ❌" });
      setUiState("result");
      return;
    }

    const { lat, lng } = await getLocationOrNull();

    // ✅ luego cambias validateCouponMock por validateCouponReal(fetch al MIS)
    const response = await validateCouponMock({ id, lat, lng, raw });

    setMisResponse(response);
    setUiState("result");
  }

  function reset() {
    setScanned(false);
    setPromoId(null);
    setMisResponse(null);
    setUiState("scanning");
    refreshGpsStatus();
  }

  // ---- Permisos cámara ----
  if (!camPerm) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator />
        <Text style={{ marginTop: 10, color: colors.sub }}>
          Preparando cámara…
        </Text>
      </View>
    );
  }

  if (!camPerm.granted) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg, padding: 20 }]}>
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          style={[styles.heroCard, { borderColor: colors.border }]}
        >
          <MaterialCommunityIcons name="camera" size={34} color="white" />
          <Text style={styles.heroTitle}>Permiso de cámara</Text>
          <Text style={styles.heroSub}>
            Necesitamos acceso para escanear el QR del cupón.
          </Text>

          <Pressable
            onPress={requestCamPerm}
            style={({ pressed }) => [
              styles.primaryBtn,
              { opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <MaterialCommunityIcons name="check" size={18} color="white" />
            <Text style={styles.primaryBtnText}>Permitir cámara</Text>
          </Pressable>
        </LinearGradient>
      </View>
    );
  }

  // ---- Loading ----
  if (uiState === "loading") {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          style={[styles.smallCard, { borderColor: colors.border }]}
        >
          <ActivityIndicator color="white" />
          <Text style={{ color: "white", marginTop: 10, fontWeight: "700" }}>
            Validando cupón…
          </Text>
          <Text style={{ color: "rgba(255,255,255,0.85)", marginTop: 6 }}>
            Consultando el servicio (MIS)
          </Text>
        </LinearGradient>
      </View>
    );
  }

  // ---- Resultado ----
  if (uiState === "result") {
    const estado = misResponse?.estado;

    const estadoColor =
      estado === 1 ? colors.success : estado === 3 ? colors.warn : colors.danger;

    const estadoLabel =
      estado === 1
        ? "Válido"
        : estado === 2
        ? "No existe / QR inválido"
        : estado === 3
        ? "Expirado"
        : estado === 4
        ? "Fuera de perímetro"
        : "Sin ubicación";

    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Resultado</Text>
          <Text style={styles.headerSub}>Cupón: {promoId}</Text>
        </LinearGradient>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.row}>
            <View
              style={[
                styles.badge,
                { backgroundColor: estadoColor, borderColor: "transparent" },
              ]}
            >
              <Text style={styles.badgeText}>{estadoLabel}</Text>
            </View>
          </View>

          <Text style={{ color: colors.text, marginTop: 10, fontSize: 16 }}>
            {misResponse?.mensaje}
          </Text>

          {/* Solo renderiza imagen si VÁLIDO */}
          {estado === 1 && !!misResponse && "image_url" in misResponse && (
            <Image
              source={{ uri: misResponse.image_url }}
              style={[styles.image, { borderColor: colors.border }]}
              resizeMode="cover"
            />
          )}

          <Pressable
            onPress={reset}
            style={({ pressed }) => [
              styles.scanAgainBtn,
              { borderColor: colors.border, opacity: pressed ? 0.9 : 1 },
            ]}
          >
            <MaterialCommunityIcons name="qrcode-scan" size={20} color="white" />
            <Text style={styles.scanAgainText}>Escanear otro</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ---- Scanner ----
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
        <View style={[styles.corner, styles.tl]} />
        <View style={[styles.corner, styles.tr]} />
        <View style={[styles.corner, styles.bl]} />
        <View style={[styles.corner, styles.br]} />
      </View>

      <View style={styles.bottomOverlay}>
        <LinearGradient
          colors={["rgba(37,99,235,0.85)", "rgba(124,58,237,0.85)"]}
          style={styles.bottomCard}
        >
          <Text style={styles.scanTitle}>Apunta al código QR del cupón</Text>

          <Text style={styles.scanSub}>
            {gpsStatus === "checking"
              ? "Verificando ubicación…"
              : gpsStatus === "ready"
              ? "Ubicación lista: se enviarán coordenadas reales"
              : gpsStatus === "no_permission"
              ? "Sin permiso de ubicación: MIS recibirá null"
              : "GPS apagado: MIS recibirá null"}
          </Text>

          <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
            <Pressable
              onPress={reset}
              style={({ pressed }) => [
                styles.smallBtnOutline,
                { opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <MaterialCommunityIcons name="reload" size={18} color="white" />
              <Text style={styles.smallBtnText}>Reset</Text>
            </Pressable>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  container: { flex: 1 },
  header: { paddingTop: 54, paddingBottom: 18, paddingHorizontal: 18 },
  headerTitle: { color: "white", fontSize: 22, fontWeight: "800" },
  headerSub: { color: "rgba(255,255,255,0.85)", marginTop: 6 },

  card: { margin: 16, borderRadius: 18, padding: 14, borderWidth: 1 },

  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },

  badge: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999 },
  badgeText: { color: "white", fontWeight: "800" },

  image: { width: "100%", height: 220, marginTop: 14, borderRadius: 14, borderWidth: 1 },

  scanAgainBtn: {
    marginTop: 14,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#2563EB",
    borderWidth: 1,
  },
  scanAgainText: { color: "white", fontWeight: "800", fontSize: 16 },

  heroCard: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    alignItems: "center",
  },
  heroTitle: { color: "white", fontSize: 20, fontWeight: "900", marginTop: 10 },
  heroSub: { color: "rgba(255,255,255,0.85)", marginTop: 8, textAlign: "center" },

  primaryBtn: {
    marginTop: 16,
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  primaryBtnText: { color: "white", fontWeight: "900" },

  smallCard: {
    width: "88%",
    maxWidth: 420,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    alignItems: "center",
  },

  scanFrame: { position: "absolute", top: "22%", left: "10%", right: "10%", height: 280 },
  corner: { position: "absolute", width: 34, height: 34, borderColor: "rgba(255,255,255,0.9)" },
  tl: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 14 },
  tr: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 14 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 14 },
  br: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 14 },

  bottomOverlay: { position: "absolute", left: 14, right: 14, bottom: 20 },
  bottomCard: { borderRadius: 18, padding: 14 },
  scanTitle: { color: "white", fontSize: 16, fontWeight: "900" },
  scanSub: { color: "rgba(255,255,255,0.9)", marginTop: 6 },

  smallBtnOutline: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  smallBtnText: { color: "white", fontWeight: "900" },
});
