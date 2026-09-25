import FitLog from "../fitlog";
import { getWorkouts } from "../fitlog-data";

export default async function MyPlan() {
  const workouts = await getWorkouts();
  return <FitLog view="plan" workouts={workouts} />;
}