import FitLog from "./fitlog";
import { getWorkouts } from "./fitlog-data";

export default async function Home() {
  const workouts = await getWorkouts();
  return <FitLog view="library" workouts={workouts} />;
}