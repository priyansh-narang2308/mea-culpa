import AsyncStorage from "@react-native-async-storage/async-storage";

const CAMPUS_KEY = "selected_campus_v1";

export async function getSelectedCampus(): Promise<string | null> {
  try {
    return AsyncStorage.getItem(CAMPUS_KEY);
  } catch (error) {
    console.error("Error getting selected campus:", error);
    return null;
  }
}

export async function setSelectedCampus(campus: string): Promise<void> {
  try {
    await AsyncStorage.setItem(CAMPUS_KEY, campus);
  } catch (error) {
    console.error("Error setting selected campus:", error);
  }
}
