import { notFound } from "next/navigation";
import FitLog from "../../fitlog";
import { getWorkout } from "../../fitlog-data";

export default async function WorkoutDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const workout = await getWorkout(id);

  if (!workout) notFound();

  return <FitLog view="detail" workouts={[workout]} selectedWorkout={workout} />;
}