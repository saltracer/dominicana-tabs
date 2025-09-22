import { Redirect } from 'expo-router';

// Smart hour selection based on current time
const getCurrentHour = (): string => {
  const now = new Date();
  const hour = now.getHours();
  
  if (hour >= 6 && hour < 12) {
    return 'lauds'; // 6:00 AM - 11:59 AM
  } else if (hour >= 12 && hour < 15) {
    return 'sext'; // 12:00 PM - 2:59 PM
  } else if (hour >= 15 && hour < 18) {
    return 'none'; // 3:00 PM - 5:59 PM
  } else if (hour >= 18 && hour < 21) {
    return 'vespers'; // 6:00 PM - 8:59 PM
  } else {
    return 'compline'; // 9:00 PM - 5:59 AM
  }
};

export default function LiturgyOfTheHoursScreen() {
  const currentHour = getCurrentHour();
  return <Redirect href={`/(tabs)/prayer/liturgy-hours/${currentHour}` as any} />;
}
