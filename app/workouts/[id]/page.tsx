import { notFound } from "next/navigation";
import FitLog from "../../fitlog";
import { getWorkouts } from "../../fitlog-data";

export default async function WorkoutDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workouts = await getWorkouts();
  const workout = workouts.find((item) => String(item.id) === id);

  if (!workout) notFound();

  return <FitLog view="detail" workouts={workouts} selectedWorkout={workout} />;
}