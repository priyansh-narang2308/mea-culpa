import AsyncStorage from "@react-native-async-storage/async-storage";

const CAMPUS_KEY = "selected_campus_v1";

export async function getSelectedCampus(): Promise<string | null> {
  try {
    const val = await AsyncStorage.getItem(CAMPUS_KEY);
    return val && val.trim() !== "" ? val : null;
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

export async function clearSelectedCampus(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CAMPUS_KEY);
  } catch (error) {
    console.error("Error clearing selected campus:", error);
  }
}

const CUSTOM_CAMPUSES_KEY = "custom_campuses_v1";

export async function getCustomCampuses(): Promise<string[]> {
  try {
    const data = await AsyncStorage.getItem(CUSTOM_CAMPUSES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error getting custom campuses:", error);
    return [];
  }
}

export async function addCustomCampus(campus: string): Promise<void> {
  try {
    const existing = await getCustomCampuses();
    if (!existing.includes(campus)) {
      existing.push(campus);
      await AsyncStorage.setItem(CUSTOM_CAMPUSES_KEY, JSON.stringify(existing));
    }
  } catch (error) {
    console.error("Error adding custom campus:", error);
  }
}
