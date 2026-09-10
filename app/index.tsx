import { getSelectedCampus, setSelectedCampus } from "@/lib/campus-storage";
import { useAppTheme } from "@/lib/theme-manager";
import { usePostsStore } from "@/stores/usePostsStore";
import { router } from "expo-router";
import {
  ArrowRight,
  EyeOff,
  Flame,
  Heart,
  Lock,
  MapPin,
  Moon,
  School,
  Sun,
} from "lucide-react-native";
import { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function WelcomeScreen() {
  const { isDark, toggleTheme } = useAppTheme();
  const myCampus = usePostsStore((state) => state.myCampus);
  const setMyCampus = usePostsStore((state) => state.setMyCampus);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0.45)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const contentFade = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const initCampus = async () => {
      const savedCampus = await getSelectedCampus();
      if (savedCampus) {
        setMyCampus(savedCampus);
      }
      await usePostsStore.getState().loadUserReactions();
      await usePostsStore.getState().loadReportedPosts();
    };
    initCampus();

    Animated.parallel([
      Animated.timing(contentFade, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(contentSlide, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    const breathingPulse = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1.06,
            duration: 1600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowOpacity, {
            toValue: 0.85,
            duration: 1600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowOpacity, {
            toValue: 0.45,
            duration: 1600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ]),
    );
    breathingPulse.start();

    return () => {
      breathingPulse.stop();
    };
  }, []);

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.94,
      speed: 35,
      bounciness: 4,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      speed: 25,
      bounciness: 6,
      useNativeDriver: true,
    }).start();
  };

  const handleConfessPress = async () => {
    if (!myCampus) {
      await setSelectedCampus("PES University");
      setMyCampus("PES University");
    }
    router.replace("/home");
  };

  return (
    <View className={`flex-1 ${isDark ? "bg-black" : "bg-white"}`}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? "#000000" : "#ffffff"}
      />

      <View className="absolute inset-0 pointer-events-none">
        <Svg
          height={SCREEN_HEIGHT}
          width={SCREEN_WIDTH}
          className="absolute inset-0"
        >
          <Defs>
            {isDark ? (
              <>
                <RadialGradient
                  id="ambientGlow"
                  cx="80%"
                  cy="15%"
                  r="70%"
                  fx="80%"
                  fy="15%"
                >
                  <Stop offset="0%" stopColor="#f43f5e" stopOpacity="0.22" />
                  <Stop offset="50%" stopColor="#db2777" stopOpacity="0.08" />
                  <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
                </RadialGradient>
                <RadialGradient
                  id="bottomGlow"
                  cx="15%"
                  cy="85%"
                  r="65%"
                  fx="15%"
                  fy="85%"
                >
                  <Stop offset="0%" stopColor="#be185d" stopOpacity="0.18" />
                  <Stop offset="60%" stopColor="#000000" stopOpacity="0" />
                </RadialGradient>
              </>
            ) : (
              <>
                <RadialGradient
                  id="ambientGlow"
                  cx="85%"
                  cy="12%"
                  r="65%"
                  fx="85%"
                  fy="12%"
                >
                  <Stop offset="0%" stopColor="#fecdd3" stopOpacity="0.6" />
                  <Stop offset="50%" stopColor="#fdf2f8" stopOpacity="0.3" />
                  <Stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </RadialGradient>
                <RadialGradient
                  id="bottomGlow"
                  cx="10%"
                  cy="88%"
                  r="60%"
                  fx="10%"
                  fy="88%"
                >
                  <Stop offset="0%" stopColor="#ffe4e6" stopOpacity="0.55" />
                  <Stop offset="55%" stopColor="#ffffff" stopOpacity="0" />
                </RadialGradient>
              </>
            )}
          </Defs>
          <Rect
            x="0"
            y="0"
            width={SCREEN_WIDTH}
            height={SCREEN_HEIGHT}
            fill={isDark ? "#000000" : "#ffffff"}
          />
          <Rect
            x="0"
            y="0"
            width={SCREEN_WIDTH}
            height={SCREEN_HEIGHT}
            fill="url(#ambientGlow)"
          />
          <Rect
            x="0"
            y="0"
            width={SCREEN_WIDTH}
            height={SCREEN_HEIGHT}
            fill="url(#bottomGlow)"
          />
        </Svg>
      </View>

      <SafeAreaView className="flex-1">
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "space-between",
            paddingHorizontal: 24,
            paddingVertical: 12,
          }}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={{
              opacity: contentFade,
              transform: [{ translateY: contentSlide }],
            }}
            className="flex-row items-center justify-between pt-1"
          >
            <View
              className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full border ${
                isDark
                  ? "bg-zinc-900/90 border-zinc-800"
                  : "bg-rose-50/80 border-rose-200/80"
              }`}
            >
              <Lock size={12} color={isDark ? "#fb7185" : "#e11d48"} />
              <Text
                className={`text-[11px] font-semibold tracking-wide ${
                  isDark ? "text-zinc-200" : "text-rose-900"
                }`}
              >
                100% Anonymous
              </Text>
            </View>

            <View className="flex-row items-center gap-2">
              <TouchableOpacity
                onPress={() => router.push("/campus-select?mode=change")}
                className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full border ${
                  isDark
                    ? "bg-zinc-900/90 border-zinc-800"
                    : "bg-zinc-100/90 border-zinc-200"
                }`}
              >
                <MapPin size={12} color={isDark ? "#fb7185" : "#e11d48"} />
                <Text
                  className={`text-[11px] font-medium max-w-[110px] ${
                    isDark ? "text-zinc-300" : "text-zinc-800"
                  }`}
                  numberOfLines={1}
                >
                  {myCampus || "Select Campus"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={toggleTheme}
                accessibilityLabel="Toggle Light and Dark Theme"
                className={`size-8 rounded-full items-center justify-center border ${
                  isDark
                    ? "bg-zinc-900 border-zinc-800"
                    : "bg-rose-50 border-rose-200"
                }`}
              >
                {isDark ? (
                  <Sun size={15} color="#fb7185" />
                ) : (
                  <Moon size={15} color="#e11d48" />
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>

          <Animated.View
            style={{
              opacity: contentFade,
              transform: [{ translateY: contentSlide }],
            }}
            className="items-center my-auto py-6"
          >
            <View
              className={`size-16 rounded-2xl items-center justify-center mb-5 border shadow-sm ${
                isDark
                  ? "bg-zinc-900/80 border-rose-500/30"
                  : "bg-rose-50 border-rose-200"
              }`}
            >
              <Heart
                size={30}
                color={isDark ? "#fb7185" : "#e11d48"}
                fill={isDark ? "#fb7185" : "#e11d48"}
              />
            </View>

            <Text
              className={`text-4xl font-extrabold tracking-tight text-center mb-2 ${
                isDark ? "text-white" : "text-zinc-950"
              }`}
            >
              Mea Culpa
            </Text>

            <View
              className={`px-3 py-1 rounded-full border mb-4 ${
                isDark
                  ? "bg-rose-950/30 border-rose-900/40"
                  : "bg-rose-100/70 border-rose-200"
              }`}
            >
              <Text
                className={`text-xs font-medium italic ${
                  isDark ? "text-rose-300" : "text-rose-700"
                }`}
              >
                "Through my fault" • Latin
              </Text>
            </View>

            <Text
              className={`text-base text-center max-w-[320px] font-normal leading-relaxed mb-8 ${
                isDark ? "text-zinc-400" : "text-zinc-600"
              }`}
            >
              The unfiltered anonymous campus feed. Share secret crushes,
              midnight confessions, exam rants, and unspoken thoughts - with
              zero identity attached.
            </Text>

            <View className="w-full max-w-[340px] gap-2.5">
              <View
                className={`flex-row items-center p-3.5 rounded-2xl border ${
                  isDark
                    ? "bg-zinc-950/80 border-zinc-800/80"
                    : "bg-white/90 border-zinc-200/90 shadow-sm"
                }`}
              >
                <View
                  className={`size-9 rounded-xl items-center justify-center mr-3 ${
                    isDark ? "bg-rose-950/40" : "bg-rose-50"
                  }`}
                >
                  <EyeOff size={18} color={isDark ? "#fb7185" : "#e11d48"} />
                </View>
                <View className="flex-1">
                  <Text
                    className={`text-sm font-semibold ${
                      isDark ? "text-zinc-100" : "text-zinc-900"
                    }`}
                  >
                    Post Anonymously
                  </Text>
                  <Text
                    className={`text-xs ${
                      isDark ? "text-zinc-400" : "text-zinc-500"
                    }`}
                  >
                    No account, no names, zero tracking.
                  </Text>
                </View>
              </View>

              <View
                className={`flex-row items-center p-3.5 rounded-2xl border ${
                  isDark
                    ? "bg-zinc-950/80 border-zinc-800/80"
                    : "bg-white/90 border-zinc-200/90 shadow-sm"
                }`}
              >
                <View
                  className={`size-9 rounded-xl items-center justify-center mr-3 ${
                    isDark ? "bg-rose-950/40" : "bg-rose-50"
                  }`}
                >
                  <School size={18} color={isDark ? "#fb7185" : "#e11d48"} />
                </View>
                <View className="flex-1">
                  <Text
                    className={`text-sm font-semibold ${
                      isDark ? "text-zinc-100" : "text-zinc-900"
                    }`}
                  >
                    Campus Focused
                  </Text>
                  <Text
                    className={`text-xs ${
                      isDark ? "text-zinc-400" : "text-zinc-500"
                    }`}
                  >
                    Read & share exclusive to your university.
                  </Text>
                </View>
              </View>

              <View
                className={`flex-row items-center p-3.5 rounded-2xl border ${
                  isDark
                    ? "bg-zinc-950/80 border-zinc-800/80"
                    : "bg-white/90 border-zinc-200/90 shadow-sm"
                }`}
              >
                <View
                  className={`size-9 rounded-xl items-center justify-center mr-3 ${
                    isDark ? "bg-rose-950/40" : "bg-rose-50"
                  }`}
                >
                  <Flame size={18} color={isDark ? "#fb7185" : "#e11d48"} />
                </View>
                <View className="flex-1">
                  <Text
                    className={`text-sm font-semibold ${
                      isDark ? "text-zinc-100" : "text-zinc-900"
                    }`}
                  >
                    Realtime Reactions
                  </Text>
                  <Text
                    className={`text-xs ${
                      isDark ? "text-zinc-400" : "text-zinc-500"
                    }`}
                  >
                    Upvote, react with flames, and support peers.
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>

          <Animated.View
            style={{
              opacity: contentFade,
              transform: [{ translateY: contentSlide }],
            }}
            className="w-full items-center pb-4 pt-2"
          >
            <View className="relative w-full max-w-[320px] items-center justify-center">
              <Animated.View
                style={{
                  transform: [{ scale: pulseAnim }],
                  opacity: glowOpacity,
                  backgroundColor: isDark ? "#e11d48" : "#fb7185",
                  shadowColor: isDark ? "#f43f5e" : "#f43f5e",
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: isDark ? 0.9 : 0.6,
                  shadowRadius: 18,
                  elevation: 12,
                }}
                className="absolute -inset-2 rounded-2xl opacity-60"
              />

              <Animated.View
                style={{
                  transform: [{ scale: buttonScale }],
                  width: "100%",
                }}
              >
                <Pressable
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  onPress={handleConfessPress}
                  className="w-full py-4 px-6 rounded-2xl flex-row items-center justify-center gap-2.5 overflow-hidden shadow-lg border border-rose-400/30"
                  style={{
                    backgroundColor: "#e11d48",
                  }}
                >
                  <View className="absolute inset-0">
                    <Svg height="100%" width="100%">
                      <Defs>
                        <LinearGradient
                          id="btnPinkGrad"
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="0"
                        >
                          <Stop
                            offset="0%"
                            stopColor="#f43f5e"
                            stopOpacity="1"
                          />
                          <Stop
                            offset="100%"
                            stopColor="#db2777"
                            stopOpacity="1"
                          />
                        </LinearGradient>
                      </Defs>
                      <Rect
                        x="0"
                        y="0"
                        width="100%"
                        height="100%"
                        fill="url(#btnPinkGrad)"
                      />
                    </Svg>
                  </View>

                  <Text className="text-lg font-bold tracking-wide text-white">
                    Confess
                  </Text>
                  <ArrowRight size={19} color="#ffffff" />
                </Pressable>
              </Animated.View>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
