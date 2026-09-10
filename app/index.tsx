import { getSelectedCampus, setSelectedCampus } from "@/lib/campus-storage";
import { usePostsStore } from "@/stores/usePostsStore";
import { router } from "expo-router";
import {
  ArrowRight,
  EyeOff,
  Feather,
  Flame,
  Lock,
  MapPin,
  School,
  Shield,
  Sparkles,
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
  Circle,
  Defs,
  LinearGradient,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function WelcomeScreen() {
  const myCampus = usePostsStore((state) => state.myCampus);
  const setMyCampus = usePostsStore((state) => state.setMyCampus);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0.45)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const contentFade = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(24)).current;
  const emblemRotate = useRef(new Animated.Value(0)).current;

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
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(contentSlide, {
        toValue: 0,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous rhythmic pulse for the Confess button
    const breathingPulse = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowOpacity, {
            toValue: 0.85,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowOpacity, {
            toValue: 0.45,
            duration: 1800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ]),
    );
    breathingPulse.start();

    // Slow subtle rotation for decorative emblem aura
    const slowRotation = Animated.loop(
      Animated.timing(emblemRotate, {
        toValue: 1,
        duration: 24000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    slowRotation.start();

    return () => {
      breathingPulse.stop();
      slowRotation.stop();
    };
  }, []);

  const spin = emblemRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

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
    // If no campus is selected yet, default to Stanford or All Campuses
    if (!myCampus) {
      await setSelectedCampus("Stanford University");
      setMyCampus("Stanford University");
    }

    // Direct transition to the feed home screen
    router.replace("/home");
  };

  return (
    <View className="flex-1 bg-slate-950">
      <StatusBar barStyle="light-content" backgroundColor="#020617" />

      {/* ========================================================================= */}
      {/* BACKGROUND LAYER                                                          */}
      {/* Designed with rich ambient atmospheric lighting.                          */}
      {/* Note: To customize later with a background image or pattern, you can      */}
      {/* replace or wrap this Svg layer with an <ImageBackground> component.       */}
      {/* ========================================================================= */}
      <View className="absolute inset-0">
        <Svg
          height={SCREEN_HEIGHT}
          width={SCREEN_WIDTH}
          className="absolute inset-0"
        >
          <Defs>
            {/* Deep Obsidian Canvas Gradient */}
            <LinearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#030712" stopOpacity="1" />
              <Stop offset="50%" stopColor="#090d16" stopOpacity="1" />
              <Stop offset="100%" stopColor="#020617" stopOpacity="1" />
            </LinearGradient>

            {/* Top-Right Amethyst / Violet Radial Aura */}
            <RadialGradient
              id="violetGlow"
              cx="85%"
              cy="18%"
              r="60%"
              fx="85%"
              fy="18%"
            >
              <Stop offset="0%" stopColor="#7c3aed" stopOpacity="0.32" />
              <Stop offset="45%" stopColor="#6366f1" stopOpacity="0.16" />
              <Stop offset="100%" stopColor="#030712" stopOpacity="0" />
            </RadialGradient>

            {/* Bottom-Left Crimson / Rose Radial Ember Glow */}
            <RadialGradient
              id="roseGlow"
              cx="15%"
              cy="78%"
              r="65%"
              fx="15%"
              fy="78%"
            >
              <Stop offset="0%" stopColor="#e11d48" stopOpacity="0.25" />
              <Stop offset="50%" stopColor="#db2777" stopOpacity="0.12" />
              <Stop offset="100%" stopColor="#020617" stopOpacity="0" />
            </RadialGradient>

            {/* Center Subtle Blue Mist */}
            <RadialGradient
              id="centerAura"
              cx="50%"
              cy="48%"
              r="40%"
              fx="50%"
              fy="48%"
            >
              <Stop offset="0%" stopColor="#3b82f6" stopOpacity="0.12" />
              <Stop offset="100%" stopColor="#030712" stopOpacity="0" />
            </RadialGradient>

            {/* Button Gradient */}
            <LinearGradient id="btnGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#8b5cf6" stopOpacity="1" />
              <Stop offset="50%" stopColor="#6366f1" stopOpacity="1" />
              <Stop offset="100%" stopColor="#ec4899" stopOpacity="1" />
            </LinearGradient>
          </Defs>

          {/* Base Background */}
          <Rect
            x="0"
            y="0"
            width={SCREEN_WIDTH}
            height={SCREEN_HEIGHT}
            fill="url(#bgGrad)"
          />

          {/* Atmospheric Lights */}
          <Rect
            x="0"
            y="0"
            width={SCREEN_WIDTH}
            height={SCREEN_HEIGHT}
            fill="url(#violetGlow)"
          />
          <Rect
            x="0"
            y="0"
            width={SCREEN_WIDTH}
            height={SCREEN_HEIGHT}
            fill="url(#roseGlow)"
          />
          <Rect
            x="0"
            y="0"
            width={SCREEN_WIDTH}
            height={SCREEN_HEIGHT}
            fill="url(#centerAura)"
          />

          {/* Subtle Starlight / Celestial Orbs */}
          <Circle
            cx={SCREEN_WIDTH * 0.22}
            cy={SCREEN_HEIGHT * 0.16}
            r="1.5"
            fill="#ffffff"
            opacity="0.4"
          />
          <Circle
            cx={SCREEN_WIDTH * 0.78}
            cy={SCREEN_HEIGHT * 0.24}
            r="2"
            fill="#c084fc"
            opacity="0.6"
          />
          <Circle
            cx={SCREEN_WIDTH * 0.88}
            cy={SCREEN_HEIGHT * 0.62}
            r="1.5"
            fill="#f43f5e"
            opacity="0.5"
          />
          <Circle
            cx={SCREEN_WIDTH * 0.14}
            cy={SCREEN_HEIGHT * 0.72}
            r="2"
            fill="#818cf8"
            opacity="0.4"
          />
          <Circle
            cx={SCREEN_WIDTH * 0.65}
            cy={SCREEN_HEIGHT * 0.88}
            r="1.5"
            fill="#ffffff"
            opacity="0.3"
          />
        </Svg>
      </View>

      {/* ========================================================================= */}
      {/* FOREGROUND CONTENT                                                        */}
      {/* ========================================================================= */}
      <SafeAreaView className="flex-1 justify-between">
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "space-between",
          }}
          showsVerticalScrollIndicator={false}
          className="px-6 py-4"
        >
          {/* Top Bar: Anonymity Pill + Campus Switcher */}
          <Animated.View
            style={{
              opacity: contentFade,
              transform: [{ translateY: contentSlide }],
            }}
            className="flex-row items-center justify-between pt-2"
          >
            {/* 100% Anonymous Status Badge */}
            <View className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800/90 shadow-sm">
              <Lock size={12} color="#a855f7" />
              <Text className="text-[11px] font-semibold tracking-wide text-slate-300">
                100% Anonymous
              </Text>
            </View>

            {/* Campus Selector Chip */}
            <TouchableOpacity
              onPress={() => router.push("/campus-select?mode=change")}
              className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800/90"
            >
              <MapPin size={12} color="#38bdf8" />
              <Text
                className="text-[11px] font-medium text-sky-300 max-w-[120px]"
                numberOfLines={1}
              >
                {myCampus || "Select Campus"}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Central Hero Showcase */}
          <Animated.View
            style={{
              opacity: contentFade,
              transform: [{ translateY: contentSlide }],
            }}
            className="items-center my-auto py-8"
          >
            {/* Glowing Crest / Emblem */}
            <View className="relative items-center justify-center mb-8">
              {/* Rotating Ambient Halo Ring */}
              <Animated.View
                style={{
                  transform: [{ rotate: spin }],
                }}
                className="absolute size-28 rounded-full border border-purple-500/20"
              />
              <View className="absolute size-24 rounded-full bg-purple-600/10 border border-indigo-500/30" />

              {/* Central Glass Circle with Feather */}
              <View className="size-20 rounded-full bg-slate-900/90 border border-slate-700/60 items-center justify-center shadow-2xl">
                <Feather size={34} color="#e0e7ff" />
              </View>

              {/* Sparkle Accent */}
              <View className="absolute -top-1 -right-1 size-7 rounded-full bg-indigo-950 border border-indigo-500/60 items-center justify-center">
                <Sparkles size={14} color="#c084fc" />
              </View>
            </View>

            {/* Main Application Name */}
            <View className="items-center mb-3">
              <Text className="text-[12px] font-bold tracking-[0.25em] text-indigo-400 uppercase mb-1">
                CAMPUS WHISPERS
              </Text>
              <Text className="text-5xl font-extrabold tracking-tight text-white text-center">
                MEA CULPA
              </Text>
            </View>

            {/* Latin Definition / Meaning Badge */}
            <View className="px-3.5 py-1 rounded-full bg-white/5 border border-white/10 mb-4">
              <Text className="text-xs font-serif italic text-slate-400 text-center">
                "Through my fault" • Latin
              </Text>
            </View>

            {/* Poetic Application Tagline */}
            <Text className="text-sm text-slate-400 text-center max-w-[310px] leading-relaxed mb-8">
              Unspoken truths, late-night thoughts, and campus secrets. Shared
              freely and completely untraceable.
            </Text>

            {/* 3 Value Pillars */}
            <View className="flex-row items-center justify-between w-full max-w-[340px] px-2 py-3 rounded-2xl bg-slate-900/50 border border-slate-800/60">
              <View className="flex-1 items-center px-1">
                <EyeOff size={16} color="#c084fc" className="mb-1" />
                <Text className="text-[11px] font-semibold text-slate-200 mt-1">
                  Zero Trace
                </Text>
                <Text className="text-[9px] text-slate-500 text-center">
                  No identity
                </Text>
              </View>

              <View className="h-7 w-[1px] bg-slate-800" />

              <View className="flex-1 items-center px-1">
                <School size={16} color="#60a5fa" className="mb-1" />
                <Text className="text-[11px] font-semibold text-slate-200 mt-1">
                  Campus Only
                </Text>
                <Text className="text-[9px] text-slate-500 text-center">
                  Your peers
                </Text>
              </View>

              <View className="h-7 w-[1px] bg-slate-800" />

              <View className="flex-1 items-center px-1">
                <Flame size={16} color="#f43f5e" className="mb-1" />
                <Text className="text-[11px] font-semibold text-slate-200 mt-1">
                  Realtime
                </Text>
                <Text className="text-[9px] text-slate-500 text-center">
                  Live reactions
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Bottom Actions: The Animated "Confess" Button */}
          <Animated.View
            style={{
              opacity: contentFade,
              transform: [{ translateY: contentSlide }],
            }}
            className="w-full items-center pb-6"
          >
            <View className="relative w-full max-w-[320px] items-center justify-center">
              {/* Continuous Breathing Glow Aura */}
              <Animated.View
                style={{
                  transform: [{ scale: pulseAnim }],
                  opacity: glowOpacity,
                  backgroundColor: "#7c3aed",
                  shadowColor: "#ec4899",
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.9,
                  shadowRadius: 20,
                  elevation: 14,
                }}
                className="absolute -inset-2 rounded-3xl opacity-70"
              />

              {/* The Touchable Button */}
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
                  className="w-full py-4 px-6 rounded-2xl bg-indigo-600 shadow-xl flex-row items-center justify-center gap-3 border border-indigo-400/30 overflow-hidden"
                  style={{
                    backgroundColor: "#6366f1",
                  }}
                >
                  {/* Internal button gradient overlay via SVG */}
                  <View className="absolute inset-0">
                    <Svg height="100%" width="100%">
                      <Defs>
                        <LinearGradient
                          id="btnLinear"
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="0"
                        >
                          <Stop
                            offset="0%"
                            stopColor="#7c3aed"
                            stopOpacity="0.9"
                          />
                          <Stop
                            offset="50%"
                            stopColor="#6366f1"
                            stopOpacity="1"
                          />
                          <Stop
                            offset="100%"
                            stopColor="#ec4899"
                            stopOpacity="0.9"
                          />
                        </LinearGradient>
                      </Defs>
                      <Rect
                        x="0"
                        y="0"
                        width="100%"
                        height="100%"
                        fill="url(#btnLinear)"
                      />
                    </Svg>
                  </View>

                  <Sparkles size={20} color="#ffffff" />
                  <Text className="text-lg font-bold tracking-wide text-white">
                    Confess
                  </Text>
                  <ArrowRight size={20} color="#ffffff" />
                </Pressable>
              </Animated.View>
            </View>

            {/* Secondary Direct Feed Link */}
            <TouchableOpacity
              onPress={() => router.replace("/home")}
              className="mt-4 py-2 px-4"
            >
              <Text className="text-xs font-medium text-slate-400 text-center">
                Or explore confessions feed →
              </Text>
            </TouchableOpacity>

            {/* Subtle Encryption / Security Note */}
            <View className="flex-row items-center gap-1.5 mt-2">
              <Shield size={11} color="#64748b" />
              <Text className="text-[10px] text-slate-500">
                Encrypted & completely untraceable
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
