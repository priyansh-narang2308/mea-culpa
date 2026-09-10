import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "nativewind";
import { useEffect } from "react";

const THEME_KEY = "mea_culpa_theme_mode_v1";

export function useAppTheme() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_KEY);
        if (saved === "light" || saved === "dark") {
          setColorScheme(saved);
        } else {
          setColorScheme("dark");
        }
      } catch {}
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const next = isDark ? "light" : "dark";
    setColorScheme(next);
    try {
      await AsyncStorage.setItem(THEME_KEY, next);
    } catch {}
  };

  return {
    isDark,
    colorScheme: isDark ? "dark" : "light",
    toggleTheme,
    setColorScheme,
  };
}
