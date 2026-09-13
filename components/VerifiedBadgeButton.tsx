import { useAppTheme } from "@/lib/theme-manager";
import * as Haptics from "expo-haptics";
import {
  CheckCircle2,
  Clock,
  MapPin,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react-native";
import { useState } from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";

export interface VerifiedBadgeButtonProps {
  campusName: string;
  isVerified: boolean;
  daysRemaining: number;
  onPressVerify?: () => void;
  onReverify?: () => void;
}

export function VerifiedBadgeButton({
  campusName,
  isVerified,
  daysRemaining,
  onPressVerify,
  onReverify,
}: VerifiedBadgeButtonProps) {
  const { isDark } = useAppTheme();
  const [detailsOpen, setDetailsOpen] = useState(false);

  const isAllCampuses =
    !campusName ||
    campusName.trim() === "" ||
    campusName.toLowerCase() === "all campuses";

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isVerified) {
      setDetailsOpen(true);
    } else if (onPressVerify) {
      onPressVerify();
    }
  };

  return (
    <>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.75}
        className={`flex-row items-center gap-1.5 px-2.5 py-1.5 rounded-full border transition-all ${
          isVerified
            ? isDark
              ? "bg-emerald-950/40 border-emerald-500/40"
              : "bg-emerald-50 border-emerald-300"
            : isDark
              ? "bg-zinc-900 border-zinc-800"
              : "bg-zinc-100 border-zinc-200"
        }`}
      >
        <View
          className={`size-2.5 rounded-full ${
            isVerified ? "bg-emerald-500" : "bg-zinc-400"
          }`}
          style={
            isVerified
              ? {
                  shadowColor: "#10b981",
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.8,
                  shadowRadius: 4,
                  elevation: 2,
                }
              : undefined
          }
        />
        <Text
          className={`text-[11px] font-bold tracking-tight ${
            isVerified
              ? isDark
                ? "text-emerald-400"
                : "text-emerald-700"
              : isDark
                ? "text-zinc-400"
                : "text-zinc-600"
          }`}
        >
          {isVerified ? "Verified" : "Verify"}
        </Text>
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={detailsOpen}
        onRequestClose={() => setDetailsOpen(false)}
        statusBarTranslucent={true}
      >
        <Pressable
          onPress={() => setDetailsOpen(false)}
          className="flex-1 justify-center items-center bg-black/60 px-5"
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className={`w-full max-w-sm rounded-3xl p-6 border shadow-2xl ${
              isDark
                ? "bg-zinc-900 border-zinc-800"
                : "bg-white border-zinc-100"
            }`}
          >
            <TouchableOpacity
              onPress={() => setDetailsOpen(false)}
              className={`absolute top-4 right-4 size-8 rounded-full items-center justify-center ${
                isDark ? "bg-zinc-800" : "bg-zinc-100"
              }`}
            >
              <X size={15} color={isDark ? "#a1a1aa" : "#71717a"} />
            </TouchableOpacity>

            <View className="items-center">
              <View className="size-16 rounded-full items-center justify-center mb-4 bg-emerald-500/10 border border-emerald-500/30">
                <ShieldCheck size={32} color="#10b981" />
              </View>

              <Text
                className={`text-lg font-bold text-center mb-1 ${
                  isDark ? "text-white" : "text-zinc-950"
                }`}
              >
                Campus Geofence Verified
              </Text>

              <View className="flex-row items-center gap-1.5 mb-4">
                <MapPin size={12} color="#10b981" />
                <Text
                  className={`text-xs font-semibold ${
                    isDark ? "text-emerald-400" : "text-emerald-600"
                  }`}
                >
                  {campusName || "All Campuses"}
                </Text>
              </View>

              <View
                className={`w-full rounded-2xl p-3.5 mb-4 border ${
                  isDark
                    ? "bg-zinc-950/60 border-zinc-800"
                    : "bg-zinc-50 border-zinc-200"
                }`}
              >
                <View className="flex-row items-center justify-between mb-2 pb-2 border-b border-zinc-200/50 dark:border-zinc-800/60">
                  <View className="flex-row items-center gap-2">
                    <Clock size={14} color={isDark ? "#a1a1aa" : "#71717a"} />
                    <Text
                      className={`text-xs ${
                        isDark ? "text-zinc-400" : "text-zinc-600"
                      }`}
                    >
                      Grace Period
                    </Text>
                  </View>
                  <Text className="text-xs font-bold text-emerald-500">
                    {daysRemaining} {daysRemaining === 1 ? "day" : "days"} left
                  </Text>
                </View>

                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <CheckCircle2 size={14} color="#10b981" />
                    <Text
                      className={`text-xs ${
                        isDark ? "text-zinc-400" : "text-zinc-600"
                      }`}
                    >
                      Status
                    </Text>
                  </View>
                  <Text
                    className={`text-xs font-semibold ${
                      isDark ? "text-zinc-200" : "text-zinc-800"
                    }`}
                  >
                    Active Student Pass
                  </Text>
                </View>
              </View>

              {/* Privacy Notice */}
              <View
                className={`w-full p-3 rounded-2xl mb-4 border ${
                  isDark
                    ? "bg-emerald-950/20 border-emerald-900/40"
                    : "bg-emerald-50 border-emerald-200"
                }`}
              >
                <Text
                  className={`text-[11px] font-bold mb-0.5 ${
                    isDark ? "text-emerald-300" : "text-emerald-800"
                  }`}
                >
                  100% Anonymous
                </Text>
                <Text
                  className={`text-[10px] leading-tight ${
                    isDark ? "text-zinc-400" : "text-zinc-600"
                  }`}
                >
                  Calculated purely on-device via GPS Haversine distance. Your
                  location coordinates are never transmitted or stored on any
                  server.
                </Text>
              </View>

              {onReverify && (
                <TouchableOpacity
                  onPress={() => {
                    setDetailsOpen(false);
                    onReverify();
                  }}
                  activeOpacity={0.85}
                  className={`w-full flex-row items-center justify-center gap-2 py-3 rounded-2xl border ${
                    isDark
                      ? "bg-zinc-800 border-zinc-700"
                      : "bg-zinc-100 border-zinc-200"
                  }`}
                >
                  <RefreshCw size={14} color={isDark ? "#ffffff" : "#09090b"} />
                  <Text
                    className={`font-semibold text-xs ${
                      isDark ? "text-white" : "text-zinc-950"
                    }`}
                  >
                    Re-verify Location
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
