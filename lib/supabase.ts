import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";
import "react-native-url-polyfill/auto";

const DEFAULT_SUPABASE_URL = "https://ozergfonprobzrhkbdob.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZXJnZm9ucHJvYnpyaGtiZG9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwMTcyMzYsImV4cCI6MjEwNDU5MzIzNn0.HjWelbiIr4uhe5-RLzljC0Z0Qanody11M8nfseRI0eE";

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

const isServer = typeof window === "undefined" && Platform.OS === "web";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: isServer ? undefined : AsyncStorage,
    autoRefreshToken: !isServer,
    detectSessionInUrl: false,
    persistSession: !isServer,
  },
});
