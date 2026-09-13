import { verifyCampusLocation } from "@/lib/campus-geofence";
import { useAppTheme } from "@/lib/theme-manager";
import * as Haptics from "expo-haptics";
import {
  AlertTriangle,
  CheckCircle2,
  Compass,
  Lock,
  MapPin,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export interface CampusVerificationModalProps {
  visible: boolean;
  campusName: string;
  onClose: () => void;
  onVerified: () => void;
  onSwitchToAllCampuses?: () => void;
}

type VerificationStep =
  "prompt" | "loading" | "success" | "outside" | "permission_denied" | "error";

export function CampusVerificationModal({
  visible,
  campusName,
  onClose,
  onVerified,
  onSwitchToAllCampuses,
}: CampusVerificationModalProps) {
  const { isDark } = useAppTheme();
  const [step, setStep] = useState<VerificationStep>("prompt");
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [allowedRadiusKm, setAllowedRadiusKm] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (visible) {
      setStep("prompt");
      setDistanceKm(null);
      setAllowedRadiusKm(null);
      setErrorMessage("");
    }
  }, [visible, campusName]);

  const handleStartVerification = async () => {
    setStep("loading");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const result = await verifyCampusLocation(campusName);

      if (result.success) {
        setStep("success");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTimeout(() => {
          onVerified();
        }, 1200);
      } else if (result.status === "outside_campus") {
        setStep("outside");
        setDistanceKm(result.distanceKm ?? null);
        setAllowedRadiusKm(result.allowedRadiusKm ?? null);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } else if (result.status === "permission_denied") {
        setStep("permission_denied");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else {
        setStep("error");
        setErrorMessage(result.message);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (err: any) {
      setStep("error");
      setErrorMessage(err?.message || "Failed to verify location.");
    }
  };

  if (!visible) return null;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <Pressable
        onPress={step === "loading" ? undefined : onClose}
        className="flex-1 justify-center items-center bg-black/60 px-5"
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className={`w-full max-w-sm rounded-3xl p-6 border shadow-2xl ${
            isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-100"
          }`}
          style={{
            shadowColor: isDark ? "#000" : "#0f172a",
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.35,
            shadowRadius: 24,
            elevation: 20,
          }}
        >
          {/* Header Close button */}
          {step !== "loading" && step !== "success" && (
            <TouchableOpacity
              onPress={onClose}
              className={`absolute top-4 right-4 size-8 rounded-full items-center justify-center ${
                isDark ? "bg-zinc-800" : "bg-zinc-100"
              }`}
            >
              <X size={15} color={isDark ? "#a1a1aa" : "#71717a"} />
            </TouchableOpacity>
          )}

          {/* Step: PROMPT */}
          {step === "prompt" && (
            <View className="items-center text-center">
              <View
                className={`size-16 rounded-full items-center justify-center mb-4 ${
                  isDark
                    ? "bg-emerald-950/60 border border-emerald-800/60"
                    : "bg-emerald-50 border border-emerald-200"
                }`}
              >
                <MapPin size={28} color="#10b981" />
              </View>

              <Text
                className={`text-lg font-bold text-center mb-1.5 ${
                  isDark ? "text-white" : "text-zinc-950"
                }`}
              >
                Campus GPS Verification
              </Text>

              <Text
                className={`text-xs text-center leading-relaxed mb-4 ${
                  isDark ? "text-zinc-400" : "text-zinc-600"
                }`}
              >
                To keep confessions authentic and prevent outside trolls, verify
                you are physically at{" "}
                <Text className="font-semibold text-rose-500">
                  {campusName || "your campus"}
                </Text>
                .
              </Text>

              {/* Privacy badge */}
              <View
                className={`w-full flex-row items-center gap-2.5 p-3 rounded-2xl mb-5 border ${
                  isDark
                    ? "bg-zinc-950/60 border-zinc-800"
                    : "bg-zinc-50 border-zinc-200"
                }`}
              >
                <ShieldCheck size={18} color="#10b981" />
                <View className="flex-1">
                  <Text
                    className={`text-[11px] font-bold ${
                      isDark ? "text-zinc-200" : "text-zinc-800"
                    }`}
                  >
                    100% Anonymous • Zero Tracking
                  </Text>
                  <Text
                    className={`text-[10px] leading-tight ${
                      isDark ? "text-zinc-400" : "text-zinc-500"
                    }`}
                  >
                    GPS calculations happen on-device. No location is ever sent
                    or stored on our servers.
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleStartVerification}
                activeOpacity={0.85}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 items-center justify-center shadow-md shadow-emerald-600/30"
              >
                <Text className="text-white font-bold text-sm tracking-wide">
                  Verify Location with GPS
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Step: LOADING */}
          {step === "loading" && (
            <View className="items-center py-4">
              <View className="size-16 rounded-full items-center justify-center mb-4 bg-emerald-500/10">
                <ActivityIndicator size="large" color="#10b981" />
              </View>
              <Text
                className={`text-base font-bold text-center mb-1 ${
                  isDark ? "text-white" : "text-zinc-950"
                }`}
              >
                Verifying Proximity...
              </Text>
              <Text
                className={`text-xs text-center ${
                  isDark ? "text-zinc-400" : "text-zinc-500"
                }`}
              >
                Acquiring GPS signal and checking campus boundary
              </Text>
            </View>
          )}

          {/* Step: SUCCESS */}
          {step === "success" && (
            <View className="items-center py-4">
              <View className="size-16 rounded-full items-center justify-center mb-4 bg-emerald-500/20">
                <CheckCircle2 size={36} color="#10b981" />
              </View>
              <Text
                className={`text-lg font-bold text-center mb-1 ${
                  isDark ? "text-white" : "text-zinc-950"
                }`}
              >
                Verified Student
              </Text>
              <Text
                className={`text-xs text-center mb-2 ${
                  isDark ? "text-zinc-400" : "text-zinc-500"
                }`}
              >
                You are on campus. Valid for the next 7 days!
              </Text>
            </View>
          )}

          {/* Step: OUTSIDE CAMPUS */}
          {step === "outside" && (
            <View className="items-center">
              <View className="size-16 rounded-full items-center justify-center mb-4 bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle size={30} color="#f59e0b" />
              </View>
              <Text
                className={`text-base font-bold text-center mb-1.5 ${
                  isDark ? "text-white" : "text-zinc-950"
                }`}
              >
                Outside Campus Boundary
              </Text>
              <Text
                className={`text-xs text-center leading-relaxed mb-4 ${
                  isDark ? "text-zinc-400" : "text-zinc-600"
                }`}
              >
                You are approximately{" "}
                <Text className="font-bold text-amber-500">
                  {distanceKm !== null ? `${distanceKm} km` : "away"}
                </Text>{" "}
                from {campusName}. Posting is limited to students within{" "}
                {allowedRadiusKm || 3.5} km.
              </Text>

              {onSwitchToAllCampuses && (
                <TouchableOpacity
                  onPress={() => {
                    onClose();
                    onSwitchToAllCampuses();
                  }}
                  activeOpacity={0.85}
                  className="w-full flex-row items-center justify-center gap-2 py-3 rounded-2xl bg-rose-600 mb-2.5"
                >
                  <Compass size={16} color="#ffffff" />
                  <Text className="text-white font-semibold text-xs">
                    Switch to All Campuses Feed
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={handleStartVerification}
                activeOpacity={0.8}
                className={`w-full flex-row items-center justify-center gap-2 py-2.5 rounded-2xl border ${
                  isDark
                    ? "bg-zinc-800 border-zinc-700"
                    : "bg-zinc-100 border-zinc-200"
                }`}
              >
                <RefreshCw size={14} color={isDark ? "#d4d4d8" : "#3f3f46"} />
                <Text
                  className={`font-semibold text-xs ${
                    isDark ? "text-zinc-200" : "text-zinc-800"
                  }`}
                >
                  Retry GPS
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Step: PERMISSION DENIED */}
          {step === "permission_denied" && (
            <View className="items-center">
              <View className="size-16 rounded-full items-center justify-center mb-4 bg-rose-500/10 border border-rose-500/20">
                <Lock size={28} color="#f43f5e" />
              </View>
              <Text
                className={`text-base font-bold text-center mb-1.5 ${
                  isDark ? "text-white" : "text-zinc-950"
                }`}
              >
                Location Permission Required
              </Text>
              <Text
                className={`text-xs text-center leading-relaxed mb-4 ${
                  isDark ? "text-zinc-400" : "text-zinc-600"
                }`}
              >
                To avoid asking for student emails or college IDs, Mea Culpa
                uses one-time device location to verify you're on campus.
              </Text>

              <TouchableOpacity
                onPress={handleStartVerification}
                activeOpacity={0.85}
                className="w-full py-3 rounded-2xl bg-emerald-600 items-center justify-center mb-2"
              >
                <Text className="text-white font-bold text-xs">
                  Grant Permission & Retry
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Step: ERROR */}
          {step === "error" && (
            <View className="items-center">
              <View className="size-16 rounded-full items-center justify-center mb-4 bg-rose-500/10">
                <AlertTriangle size={28} color="#f43f5e" />
              </View>
              <Text
                className={`text-base font-bold text-center mb-1 ${
                  isDark ? "text-white" : "text-zinc-950"
                }`}
              >
                Verification Failed
              </Text>
              <Text
                className={`text-xs text-center mb-4 ${
                  isDark ? "text-zinc-400" : "text-zinc-600"
                }`}
              >
                {errorMessage || "Unable to retrieve location signal."}
              </Text>

              <TouchableOpacity
                onPress={handleStartVerification}
                activeOpacity={0.85}
                className="w-full py-3 rounded-2xl bg-emerald-600 items-center justify-center"
              >
                <Text className="text-white font-bold text-xs">Try Again</Text>
              </TouchableOpacity>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
