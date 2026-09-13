import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";

export interface CampusCenter {
  name: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
}

export interface CampusGeofenceConfig {
  id: string;
  campusName: string;
  centers: CampusCenter[];
}

export const CAMPUS_GEOFENCE_REGISTRY: Record<string, CampusCenter[]> = {
  "PES University": [
    {
      name: "PES University (RR Campus)",
      latitude: 12.9344,
      longitude: 77.5345,
      radiusKm: 3.5,
    },
    {
      name: "PES University (Electronic City Campus)",
      latitude: 12.8631,
      longitude: 77.6657,
      radiusKm: 3.5,
    },
    {
      name: "PES University (Hanumanth Nagar)",
      latitude: 12.9463,
      longitude: 77.5647,
      radiusKm: 3.0,
    },
  ],
  "RV College of Engineering": [
    {
      name: "RV College of Engineering Campus",
      latitude: 12.9237,
      longitude: 77.4987,
      radiusKm: 3.5,
    },
  ],
  "Amrita Vishwa Vidyapeetham": [
    {
      name: "Amrita Bengaluru Campus",
      latitude: 12.909,
      longitude: 77.6744,
      radiusKm: 3.5,
    },
  ],
  "Christ University": [
    {
      name: "Christ University (Central Campus)",
      latitude: 12.9343,
      longitude: 77.6062,
      radiusKm: 3.5,
    },
    {
      name: "Christ University (Bannerghatta Road Campus)",
      latitude: 12.8942,
      longitude: 77.5991,
      radiusKm: 3.5,
    },
    {
      name: "Christ University (Kengeri Campus)",
      latitude: 12.8617,
      longitude: 77.4382,
      radiusKm: 3.5,
    },
    {
      name: "Christ University (Yeshwanthpur Campus)",
      latitude: 13.0315,
      longitude: 77.5458,
      radiusKm: 3.5,
    },
  ],
  "BMS College of Engineering": [
    {
      name: "BMSCE Bull Temple Road",
      latitude: 12.9411,
      longitude: 77.5655,
      radiusKm: 1.5,
    },
  ],
  "Bangalore Institute of Technology": [
    {
      name: "BIT KR Road Campus",
      latitude: 12.9575,
      longitude: 77.5746,
      radiusKm: 1.5,
    },
  ],
  "MS Ramaiah Institute of Technology": [
    {
      name: "MSRIT MSR Nagar",
      latitude: 13.0305,
      longitude: 77.5649,
      radiusKm: 3.5,
    },
  ],
  "Dayananda Sagar College": [
    {
      name: "Dayananda Sagar College of Engineering (Kumaraswamy Layout)",
      latitude: 12.9081,
      longitude: 77.5668,
      radiusKm: 3.5,
    },
  ],
  "Jain University": [
    {
      name: "Jain University Center for Management Studies",
      latitude: 12.9719,
      longitude: 77.5937,
      radiusKm: 3.5,
    },
    {
      name: "Jain Global Campus (Kanakapura)",
      latitude: 12.6468,
      longitude: 77.4428,
      radiusKm: 4.0,
    },
  ],
};

const DEFAULT_ALLOWED_RADIUS_KM = 3.0;
const GRACE_PERIOD_DAYS = 7;
const GRACE_PERIOD_MS = GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000;

export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

function getStorageKeyForCampus(campusName: string): string {
  const sanitized = campusName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_");
  return `campus_geofence_verified_v1_${sanitized}`;
}

export interface CampusVerificationStatus {
  isVerified: boolean;
  daysRemaining: number;
  lastVerifiedAt: string | null;
  campusName: string;
}

export async function getCampusVerificationStatus(
  campusName: string,
): Promise<CampusVerificationStatus> {
  if (
    !campusName ||
    campusName.trim() === "" ||
    campusName.toLowerCase() === "all campuses"
  ) {
    return {
      isVerified: true,
      daysRemaining: 7,
      lastVerifiedAt: null,
      campusName,
    };
  }

  try {
    const key = getStorageKeyForCampus(campusName);
    const rawData = await AsyncStorage.getItem(key);
    if (!rawData) {
      return {
        isVerified: false,
        daysRemaining: 0,
        lastVerifiedAt: null,
        campusName,
      };
    }

    const parsed = JSON.parse(rawData);
    const verifiedTime = new Date(parsed.verifiedAt).getTime();
    const elapsed = Date.now() - verifiedTime;

    if (elapsed < GRACE_PERIOD_MS) {
      const remainingMs = GRACE_PERIOD_MS - elapsed;
      const daysRemaining = Math.max(
        1,
        Math.ceil(remainingMs / (24 * 60 * 60 * 1000)),
      );
      return {
        isVerified: true,
        daysRemaining,
        lastVerifiedAt: parsed.verifiedAt,
        campusName,
      };
    }

    // Grace period expired
    return {
      isVerified: false,
      daysRemaining: 0,
      lastVerifiedAt: parsed.verifiedAt,
      campusName,
    };
  } catch (err) {
    console.error("Error reading campus verification:", err);
    return {
      isVerified: false,
      daysRemaining: 0,
      lastVerifiedAt: null,
      campusName,
    };
  }
}

export async function saveCampusVerification(
  campusName: string,
): Promise<void> {
  try {
    const key = getStorageKeyForCampus(campusName);
    const payload = {
      campusName,
      verifiedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(key, JSON.stringify(payload));
  } catch (err) {
    console.error("Error saving campus verification:", err);
  }
}

export async function clearCampusVerification(
  campusName: string,
): Promise<void> {
  try {
    const key = getStorageKeyForCampus(campusName);
    await AsyncStorage.removeItem(key);
  } catch (err) {
    console.error("Error clearing campus verification:", err);
  }
}

export interface VerificationResult {
  success: boolean;
  status:
    | "verified"
    | "outside_campus"
    | "permission_denied"
    | "location_unavailable"
    | "error";
  distanceKm?: number;
  allowedRadiusKm?: number;
  campusName: string;
  message: string;
}

export function findCampusCenters(campusName: string): CampusCenter[] {
  const normalized = campusName.trim().toLowerCase();

  for (const [registeredName, centers] of Object.entries(
    CAMPUS_GEOFENCE_REGISTRY,
  )) {
    if (
      registeredName.toLowerCase() === normalized ||
      normalized.includes(registeredName.toLowerCase()) ||
      registeredName.toLowerCase().includes(normalized)
    ) {
      return centers;
    }
  }

  return [];
}

/**
 * Perform one-time on-device GPS proximity verification.
 * Zero tracking: coordinates are never saved or sent over the network.
 */
export async function verifyCampusLocation(
  campusName: string,
): Promise<VerificationResult> {
  if (
    !campusName ||
    campusName.trim() === "" ||
    campusName.toLowerCase() === "all campuses"
  ) {
    return {
      success: true,
      status: "verified",
      campusName: campusName || "All Campuses",
      message: "Open campus feed does not require proximity verification.",
    };
  }

  // 1. Check if existing 7-day grace period is active
  const existingStatus = await getCampusVerificationStatus(campusName);
  if (existingStatus.isVerified) {
    return {
      success: true,
      status: "verified",
      campusName,
      message: `Verified via 7-day campus grace period (${existingStatus.daysRemaining} days remaining).`,
    };
  }

  // 2. Request location permission
  try {
    const { status: existingPermission } =
      await Location.getForegroundPermissionsAsync();
    let finalPermission = existingPermission;

    if (existingPermission !== Location.PermissionStatus.GRANTED) {
      const { status } = await Location.requestForegroundPermissionsAsync();
      finalPermission = status;
    }

    if (finalPermission !== Location.PermissionStatus.GRANTED) {
      return {
        success: false,
        status: "permission_denied",
        campusName,
        message:
          "Location permission is required to verify you are on campus without asking for your student ID.",
      };
    }

    // 3. Fetch device current position (balanced accuracy for fast response and battery efficiency)
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const userLat = position.coords.latitude;
    const userLon = position.coords.longitude;

    // 4. Match campus centers
    const centers = findCampusCenters(campusName);

    if (centers.length === 0) {
      // For custom/unlisted campuses, verify on-device and grant verification for 7 days
      await saveCampusVerification(campusName);
      return {
        success: true,
        status: "verified",
        campusName,
        message: `Verified for ${campusName}.`,
      };
    }

    // 5. Calculate closest distance using Haversine formula
    let closestDistance = Infinity;
    let allowedRadius = DEFAULT_ALLOWED_RADIUS_KM;

    for (const center of centers) {
      const dist = calculateDistanceKm(
        userLat,
        userLon,
        center.latitude,
        center.longitude,
      );
      if (dist < closestDistance) {
        closestDistance = dist;
        allowedRadius = center.radiusKm;
      }
    }

    if (closestDistance <= allowedRadius) {
      // Physically within the geofenced campus boundary!
      await saveCampusVerification(campusName);
      return {
        success: true,
        status: "verified",
        distanceKm: closestDistance,
        allowedRadiusKm: allowedRadius,
        campusName,
        message: `Verified! You are ${closestDistance} km from campus (within the ${allowedRadius} km radius).`,
      };
    }

    // Outside the campus boundary
    return {
      success: false,
      status: "outside_campus",
      distanceKm: closestDistance,
      allowedRadiusKm: allowedRadius,
      campusName,
      message: `You are currently ${closestDistance} km away from ${campusName}. Confessions can only be posted from within ${allowedRadius} km of campus.`,
    };
  } catch (err: any) {
    console.error("GPS verification error:", err);
    return {
      success: false,
      status: "error",
      campusName,
      message:
        err?.message ||
        "Unable to acquire GPS signal. Please ensure location services are enabled.",
    };
  }
}
