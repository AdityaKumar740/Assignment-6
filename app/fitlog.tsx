"use client";

import Image from "next/image";
import Link from "next/link";
import { startTransition, useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import type { Workout } from "./fitlog-data";

type FitLogProps = {
  view: "library" | "plan" | "detail";
  workouts: Workout[];
  selectedWorkout?: Workout;
  loading?: boolean;
};

type ToastKind = "success" | "error" | "warning" | "info";

const PLAN_KEY = "fitlog-todays-plan";
const SAVED_KEY = "fitlog-saved-workouts";

function getStoredIds(key: string): string[] {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    return Array.isArray(value) && value.every((item) => typeof item === "string")
      ? value
      : [];
  } catch {
    return [];
  }
}

function matchesWorkoutSearch(workout: Workout, query: string) {
  const searchableText = [workout.name, ...workout.muscleGroups].join(" ").toLowerCase();
  return searchableText.includes(query.trim().toLowerCase());
}

function PlanWorkoutCard({
  workout,
  onRemove,
  onDone,
}: {
  workout: Workout;
  onRemove: () => void;
  onDone?: () => void;
}) {
  return (
    <article className="flex min-h-[114px] items-center gap-4 rounded-xl border border-[#25282d] bg-[#13151a] p-[15px] max-[700px]:flex-wrap max-[700px]:gap-3">
      <Link className="relative block h-20 w-36 shrink-0 overflow-hidden rounded-lg bg-[#202329] max-[520px]:h-[68px] max-[520px]:w-[104px]" href={`/workouts/${workout.id}`} aria-label={`View ${workout.name}`}>
        <Image className="object-cover" src={workout.image} alt="" fill sizes="144px" />
      </Link>
      <div className="min-w-0 flex-1">
        <h3 className="mb-1 font-[Impact,Haettenschweiler,Arial_Narrow_Bold,sans-serif] text-[15px] font-medium">{workout.name.toUpperCase()}</h3>
        <p className="m-0 text-[10px] text-[#888d97]">{workout.equipment}</p>
        <div className="mt-2 flex items-center justify-start gap-3 text-[9px] text-[#a6abb4] [&_i]:text-[#ccff00] [&_i]:not-italic [&_span]:inline-flex [&_span]:items-center [&_span]:gap-1">
          <span><i aria-hidden="true">◷</i>{workout.duration} min</span>
          <span><i aria-hidden="true">●</i>{workout.caloriesBurned} kcal</span>
          <span><i aria-hidden="true">☆</i>{workout.rating}</span>
        </div>
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-[9px] max-[520px]:w-full max-[520px]:justify-end">
        <Link className="inline-flex min-h-[34px] items-center justify-center whitespace-nowrap rounded-full border border-[#343941] bg-transparent px-[13px] text-[10px] text-[#f4f5f6] transition-colors hover:border-[#ccff00] hover:text-[#ccff00] max-[520px]:min-h-[31px] max-[520px]:px-[10px] max-[520px]:text-[9px]" href={`/workouts/${workout.id}`}>
          View Details
        </Link>
        {onDone && (
          <button className="inline-flex min-h-[34px] items-center justify-center gap-1 whitespace-nowrap rounded-full border border-[#ccff00] bg-[#ccff00] px-[13px] text-[10px] font-extrabold text-[#101207] transition-colors hover:bg-[#e0ff59] max-[520px]:min-h-[31px] max-[520px]:px-[10px] max-[520px]:text-[9px]" type="button" onClick={onDone}>
            <span aria-hidden="true">✓</span> Mark as Done
          </button>
        )}
        <button className="h-8 w-7 border-0 bg-transparent text-[19px] text-[#8a8f98] transition-colors hover:text-[#f4f5f6]" type="button" onClick={onRemove} aria-label={`Remove ${workout.name}`}>
          ×
        </button>
      </div>
    </article>
  );
}

export default function FitLog({ view, workouts, selectedWorkout, loading = false }: FitLogProps) {
  const [plan, setPlan] = useState<string[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [activePlanTab, setActivePlanTab] = useState<"plan" | "saved">("plan");
  const [sortBy, setSortBy] = useState<"duration" | "caloriesBurned" | "rating">("duration");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    startTransition(() => {
      setPlan(getStoredIds(PLAN_KEY));
      setSaved(getStoredIds(SAVED_KEY));
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(PLAN_KEY, JSON.stringify(plan));
    window.localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
  }, [plan, ready, saved]);

  function toggleId(ids: string[], id: string, update: (next: string[]) => void) {
    update(ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]);
  }

  function showToast(message: string, type: ToastKind = "success") {
    toast(message, { type, icon: false, className: "fitlog-toast" });
  }

  const plannedWorkouts = workouts.filter((workout) => plan.includes(String(workout.id)));
  const savedWorkouts = workouts.filter((workout) => saved.includes(String(workout.id)));
  const visibleWorkouts = [...(activePlanTab === "plan" ? plannedWorkouts : savedWorkouts)]
    .filter((workout) => matchesWorkoutSearch(workout, searchQuery))
    .sort((first, second) => first[sortBy] - second[sortBy]);
  const libraryWorkouts = workouts.filter((workout) => matchesWorkoutSearch(workout, searchQuery));
  const plannedMinutes = plannedWorkouts.reduce((total, workout) => total + workout.duration, 0);
  const plannedCalories = plannedWorkouts.reduce((total, workout) => total + workout.caloriesBurned, 0);
  const largeHeader = view === "detail" || view === "plan";

  return (
    <>
      <header className={`border-b border-[#17191c] ${largeHeader ? "h-[65px] max-[520px]:h-[76px]" : "h-[34px]"}`}>
        <div className="mx-auto grid h-full w-[calc(100%-20px)] max-w-[1180px] grid-cols-[1fr_auto_1fr] items-center max-[520px]:grid-cols-[1fr_auto] max-[520px]:grid-rows-[40px_36px]">
          <Link className="inline-flex w-fit items-center max-[520px]:col-start-1 max-[520px]:row-start-1" href="/" aria-label="FitLog home">
            <span className={`relative block ${largeHeader ? "h-7 w-[90px]" : "h-[18px] w-[56px]"}`}>
              <Image className="object-contain object-left" src="/assets/logo.png" alt="FitLog" fill priority sizes="110px" />
            </span>
          </Link>

          <nav className="flex h-full items-center gap-[5px] max-[520px]:col-span-2 max-[520px]:col-start-1 max-[520px]:row-start-2 max-[520px]:justify-self-center" aria-label="Main navigation">
            <Link className={`rounded-full px-[11px] py-[7px] text-[11px] transition-colors ${view === "library" ? "bg-[#191e08] text-[#ccff00]" : "text-[#a8acb4] hover:bg-[#191e08] hover:text-[#ccff00]"}`} href="/#library">
              Workouts
            </Link>
            <Link className={`rounded-full px-[11px] py-[7px] text-[11px] transition-colors ${view === "plan" ? "bg-[#191e08] text-[#ccff00]" : "text-[#a8acb4] hover:bg-[#191e08] hover:text-[#ccff00]"}`} href="/my-plan">
              My Plan
            </Link>
          </nav>

          <div className="flex justify-self-end items-center gap-[15px] max-[520px]:col-start-2 max-[520px]:row-start-1 max-[520px]:gap-[10px]">
            <Link className="inline-flex items-center gap-[6px] text-[9px] text-[#a8acb4] transition-colors hover:text-[#f4f5f6]" href="/my-plan" aria-label={`Plan: ${plan.length} items`}>
              <span>PLAN</span>
              <span className="grid min-w-4 h-4 place-items-center rounded-full bg-[#ccff00] px-1 text-[9px] leading-none text-[#101207]">{plan.length}</span>
            </Link>
            <Link className="inline-flex items-center gap-[6px] text-[9px] text-[#a8acb4] transition-colors hover:text-[#f4f5f6]" href="/my-plan" aria-label={`Saved: ${saved.length} items`}>
              <span>SAVED</span>
              <span className="grid min-w-4 h-4 place-items-center rounded-full border border-[#363a40] px-1 text-[9px] leading-none text-[#d6d8dc]">{saved.length}</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-[calc(100%-20px)] max-w-[1180px] flex-1">
        {loading ? (
          view === "plan" ? (
            <section className="scroll-mt-[26px] px-0 pt-9 pb-10 max-[520px]:pt-7" aria-labelledby="plan-title">
              <div>
                <h1 className="m-0 font-[Impact,Haettenschweiler,Arial_Narrow_Bold,sans-serif] text-[30px] leading-none" id="plan-title">MY PLAN</h1>
                <p className="mt-2 mb-[21px] text-xs text-[#888d97]">Cap of five lifts for today. Finish them, then load more.</p>
              </div>
              <p className="grid min-h-[280px] place-items-center text-xs text-[#888d97]" role="status">Loading workouts…</p>
            </section>
          ) : (
            <section className="grid min-h-[65vh] place-items-center" aria-busy="true">
              <div className="flex flex-col items-center gap-4 text-center">
                <span className="size-9 animate-spin rounded-full border-[3px] border-[#292d35] border-t-[#ccff00]" aria-hidden="true" />
                <p className="m-0 text-xs text-[#888d97]" role="status">Loading workouts…</p>
              </div>
            </section>
          )
        ) : view === "detail" && selectedWorkout ? (
          <section className="px-0 pt-7 pb-9">
            <article className="grid grid-cols-2 items-start gap-8 max-[700px]:grid-cols-1 max-[700px]:gap-5">
              <div className="relative aspect-[0.8] min-h-0 overflow-hidden rounded-md border border-[#25282d] bg-[#15171b] max-[700px]:aspect-[1.2]">
                <Image
                  className="object-cover"
                  src={selectedWorkout.image}
                  alt={selectedWorkout.name}
                  fill
                  priority
                  sizes="(max-width: 700px) 100vw, 50vw"
                />
              </div>
              <div>
                <div className="flex flex-wrap gap-1">
                  {selectedWorkout.muscleGroups.map((group) => (
                    <span className="inline-flex min-h-4 items-center rounded-full bg-[#ccff00] px-[7px] text-[8px] font-black text-[#11130c]" key={group}>{group.toUpperCase()}</span>
                  ))}
                </div>
                <h1 className="mb-[6px] mt-0 font-[Impact,Haettenschweiler,Arial_Narrow_Bold,sans-serif] text-[25px] uppercase leading-none">{selectedWorkout.name}</h1>
                <p className="mb-[11px] mt-0 max-w-[540px] text-[11px] leading-[1.4] text-[#888d97]">{selectedWorkout.description}</p>
                <dl className="m-0 overflow-hidden rounded-[9px] border border-[#25282d] bg-[#15171b] px-[14px]">
                  <div className="flex min-h-[29px] items-center justify-between gap-[14px] border-b border-[#25282d] last:border-b-0"><dt className="text-[8px] font-extrabold text-[#888d97]">EQUIPMENT</dt><dd className="m-0 text-right text-[11px]">{selectedWorkout.equipment}</dd></div>
                  <div className="flex min-h-[29px] items-center justify-between gap-[14px] border-b border-[#25282d] last:border-b-0"><dt className="text-[8px] font-extrabold text-[#888d97]">DIFFICULTY</dt><dd className="m-0 text-right text-[11px]">{selectedWorkout.difficulty}</dd></div>
                  <div className="flex min-h-[29px] items-center justify-between gap-[14px] border-b border-[#25282d] last:border-b-0"><dt className="text-[8px] font-extrabold text-[#888d97]">SETS</dt><dd className="m-0 text-right text-[11px]">{selectedWorkout.sets}</dd></div>
                  <div className="flex min-h-[29px] items-center justify-between gap-[14px] border-b border-[#25282d] last:border-b-0"><dt className="text-[8px] font-extrabold text-[#888d97]">REPS</dt><dd className="m-0 text-right text-[11px]">{selectedWorkout.reps}</dd></div>
                  <div className="flex min-h-[29px] items-center justify-between gap-[14px] border-b border-[#25282d] last:border-b-0"><dt className="text-[8px] font-extrabold text-[#888d97]">DURATION</dt><dd className="m-0 text-right text-[11px]">{selectedWorkout.duration} min</dd></div>
                  <div className="flex min-h-[29px] items-center justify-between gap-[14px] border-b border-[#25282d] last:border-b-0"><dt className="text-[8px] font-extrabold text-[#888d97]">CALORIES</dt><dd className="m-0 text-right text-[11px]">{selectedWorkout.caloriesBurned} kcal</dd></div>
                  <div className="flex min-h-[29px] items-center justify-between gap-[14px] border-b border-[#25282d] last:border-b-0"><dt className="text-[8px] font-extrabold text-[#888d97]">RATING</dt><dd className="m-0 text-right text-[11px]">{selectedWorkout.rating}</dd></div>
                </dl>
                <section className="mt-[18px] max-w-[780px]" aria-labelledby="instructions-title">
                  <h2 className="mb-2 mt-0 font-[Impact,Haettenschweiler,Arial_Narrow_Bold,sans-serif] text-xs" id="instructions-title">INSTRUCTIONS</h2>
                  <ol className="m-0 list-none border-t border-[#25282d] p-0">
                    {selectedWorkout.instructions.map((instruction, index) => (
                      <li className="flex gap-[7px] py-[5px] text-[9px] leading-[1.45] text-[#d3d5da]" key={instruction}><span className="text-[#a6abb4]">{index + 1}.</span>{instruction}</li>
                    ))}
                  </ol>
                </section>
                <div className="mt-4 flex flex-wrap gap-[9px]">
                  <button
                    className="inline-flex min-h-[34px] cursor-pointer items-center justify-center gap-2 rounded bg-[#ccff00] px-[14px] text-[10px] font-black text-[#101207] transition-colors hover:bg-[#e0ff59] disabled:cursor-not-allowed disabled:opacity-40"
                    type="button"
                    disabled={plan.length >= 5 && !plan.includes(String(selectedWorkout.id))}
                    title={plan.length >= 5 && !plan.includes(String(selectedWorkout.id)) ? "Today's plan is full" : undefined}
                    aria-pressed={plan.includes(String(selectedWorkout.id))}
                    onClick={() => {
                      const id = String(selectedWorkout.id);
                      const isPlanned = plan.includes(id);
                      if (!isPlanned && plan.length >= 5) {
                        showToast("Today's plan is full. Finish a lift before adding another.");
                        return;
                      }
                      toggleId(plan, id, setPlan);
                      showToast(
                        isPlanned ? "Removed from today's plan" : "Added to today's plan",
                        isPlanned ? "info" : "success",
                      );
                    }}
                  >
                    <span aria-hidden="true">▦</span>
                    {plan.includes(String(selectedWorkout.id)) ? "Remove from today's plan" : "Add to today's plan"}
                  </button>
                  <button
                    className="inline-flex min-h-[34px] cursor-pointer items-center justify-center gap-[7px] rounded border border-[#343941] bg-transparent px-3 text-[10px] font-extrabold text-[#f4f5f6] transition-colors hover:border-[#ccff00] hover:text-[#ccff00]"
                    type="button"
                    aria-pressed={saved.includes(String(selectedWorkout.id))}
                    onClick={() => {
                      const id = String(selectedWorkout.id);
                      const isSaved = saved.includes(id);
                      toggleId(saved, id, setSaved);
                      showToast(
                        isSaved ? "Removed from saved workouts" : "Saved for later",
                        isSaved ? "info" : "success",
                      );
                    }}
                  >
                    <span aria-hidden="true">☆</span>
                    {saved.includes(String(selectedWorkout.id)) ? "Saved for later" : "Save for later"}
                  </button>
                </div>
              </div>
            </article>
          </section>
        ) : view === "library" ? (
          <>
            <section className="relative mt-5 grid min-h-[205px] grid-cols-[minmax(0,1.2fr)_minmax(220px,0.8fr)] items-center overflow-hidden rounded-[9px] border border-[#202329] bg-[#15171b] px-[25px] py-[26px] max-[700px]:grid-cols-[1fr_0.5fr] max-[700px]:p-[25px] max-[520px]:mt-[14px] max-[520px]:min-h-[300px] max-[520px]:grid-cols-1 max-[520px]:items-start max-[520px]:px-[21px] max-[520px]:py-[27px]" aria-labelledby="hero-title">
              <div className="relative z-[1] max-w-[610px] max-[700px]:max-w-[75%] max-[520px]:max-w-full">
                <span className="mb-0 block text-[9px] font-extrabold tracking-[0.08em] text-[#ccff00]">WORKOUT LIBRARY</span>
                <h1 className="mb-2 mt-[11px] font-[Impact,Haettenschweiler,Arial_Narrow_Bold,sans-serif] text-[clamp(30px,5vw,42px)] font-black uppercase leading-[0.94] max-[520px]:max-w-[330px] max-[520px]:text-[clamp(31px,9vw,42px)]" id="hero-title">
                  <span className="block">TRAIN WITH INTENT.</span>
                  <span className="block">LOG EVERY SET.</span>
                </h1>
                <p className="mb-[13px] mt-[9px] max-w-[360px] text-xs leading-[1.55] text-[#9b9fa8] max-[520px]:max-w-[300px] max-[520px]:text-[11px]">
                  FitLog is a dark, no-nonsense gym companion: pick a lift, lock it into
                  today&apos;s plan, and watch the week&apos;s work add up.
                </p>
              </div>
              <div className="absolute inset-y-2 right-3 w-[min(40%,330px)] max-[700px]:right-2 max-[700px]:w-[42%] max-[700px]:opacity-80 max-[520px]:bottom-0 max-[520px]:right-px max-[520px]:top-auto max-[520px]:h-[54%] max-[520px]:w-[43%] max-[520px]:opacity-[0.58]" aria-hidden="true">
                <Image
                  className="object-contain object-right"
                  src="/assets/banner.png"
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 700px) 100vw, 42vw"
                />
              </div>
            </section>
            <section className="scroll-mt-[26px] py-12 pb-[72px] max-[520px]:pt-9" id="library" aria-labelledby="library-title">
              <div className="mb-[18px] flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="m-0 font-[Impact,Haettenschweiler,Arial_Narrow_Bold,sans-serif] text-[26px] leading-none" id="library-title">THE LIBRARY</h2>
                  <p className="mb-0 mt-[7px] text-[11px] text-[#888d97]">Twelve lifts covering every major muscle group.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <label>
                    <span className="sr-only">Search workouts by name or muscle group</span>
                    <input
                      className="h-9 w-52 rounded-md border border-[#25282d] bg-[#13151a] px-3 text-xs text-[#f4f5f6] outline-none placeholder:text-[#747984] focus:border-[#ccff00] max-[520px]:w-full"
                      type="search"
                      placeholder="Search lifts or tags"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                    />
                  </label>
                  <span className="text-[9px] font-bold text-[#888d97]">{libraryWorkouts.length} MOVEMENTS</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-[14px] max-[700px]:grid-cols-2 max-[700px]:gap-[10px] max-[520px]:grid-cols-1">
                {libraryWorkouts.map((workout) => (
                  <Link className="group block min-w-0 overflow-hidden rounded-md border border-[#25282d] bg-[#15171b] transition-all duration-150 hover:-translate-y-0.5 hover:border-[#3b4149]" href={`/workouts/${workout.id}`} key={workout.id}>
                    <div className="relative aspect-[2/1] overflow-hidden bg-[#202329]">
                      <Image
                        className="object-cover"
                        src={workout.image}
                        alt={workout.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 33vw"
                      />
                    </div>
                    <div className="px-[14px] pt-3 pb-[13px]">
                      <div className="flex flex-wrap gap-1">
                        {workout.muscleGroups.map((group) => (
                          <span className="inline-flex min-h-4 items-center rounded-full bg-[#ccff00] px-[7px] text-[8px] font-black text-[#11130c]" key={group}>{group.toUpperCase()}</span>
                        ))}
                      </div>
                      <h3 className="mb-1 mt-[11px] overflow-hidden text-ellipsis whitespace-nowrap font-[Impact,Haettenschweiler,Arial_Narrow_Bold,sans-serif] text-sm font-medium leading-[1.2] max-[520px]:whitespace-normal">{workout.name.toUpperCase()}</h3>
                      <p className="m-0 overflow-hidden text-ellipsis whitespace-nowrap text-[10px] text-[#888d97]">{workout.equipment}</p>
                      <div className="mt-3 flex items-center gap-3 border-t border-[#25282d] pt-[9px] text-[9px] text-[#a6abb4] max-[520px]:gap-2 [&_i]:text-[11px] [&_i]:not-italic [&_i]:text-[#828994] [&_span]:inline-flex [&_span]:items-center [&_span]:gap-1">
                        <span><i aria-hidden="true">◷</i>{workout.duration} min</span>
                        <span><i aria-hidden="true">●</i>{workout.caloriesBurned} kcal</span>
                        <span><i aria-hidden="true">☆</i>{workout.rating}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              {libraryWorkouts.length === 0 && (
                <p className="mt-4 text-xs text-[#888d97]">No workouts match “{searchQuery}”.</p>
              )}
            </section>
          </>
        ) : (
          <section className="scroll-mt-[26px] px-0 pt-9 pb-10 max-[520px]:pt-7" aria-labelledby="plan-title">
            <div>
              <h1 className="m-0 font-[Impact,Haettenschweiler,Arial_Narrow_Bold,sans-serif] text-[30px] leading-none" id="plan-title">MY PLAN</h1>
              <p className="mt-2 mb-[21px] text-xs text-[#888d97]">Cap of five lifts for today. Finish them, then load more.</p>
            </div>
            <section className="grid min-h-28 grid-cols-3 rounded-xl border border-[#25282d] bg-[#13151a] px-[22px] py-[21px] max-[520px]:min-h-24 max-[520px]:px-3 max-[520px]:py-4" aria-label="Today's plan summary">
              <div className="flex flex-col justify-center gap-[7px]">
                <span className="text-[11px] text-[#888d97]">Exercises</span>
                <strong className="font-[Impact,Haettenschweiler,Arial_Narrow_Bold,sans-serif] text-[34px] font-medium leading-none text-[#ccff00] max-[520px]:text-[27px]">{plannedWorkouts.length}</strong>
              </div>
              <div className="flex flex-col justify-center gap-[7px] border-l border-[#25282d] pl-[22px] max-[520px]:pl-[10px]">
                <span className="text-[11px] text-[#888d97]">Minutes</span>
                <strong className="font-[Impact,Haettenschweiler,Arial_Narrow_Bold,sans-serif] text-[34px] font-medium leading-none max-[520px]:text-[27px]">{plannedMinutes}</strong>
              </div>
              <div className="flex flex-col justify-center gap-[7px] border-l border-[#25282d] pl-[22px] max-[520px]:pl-[10px]">
                <span className="text-[11px] text-[#888d97]">Calories</span>
                <strong className="font-[Impact,Haettenschweiler,Arial_Narrow_Bold,sans-serif] text-[34px] font-medium leading-none max-[520px]:text-[27px]">{plannedCalories}</strong>
              </div>
            </section>
            <div className="my-[20px] flex flex-wrap items-center justify-between gap-4">
              <div className="inline-flex gap-[3px] rounded-lg border border-[#25282d] bg-[#13151a] p-1" role="tablist" aria-label="My Plan views">
                <button
                  className={`min-h-[30px] min-w-[98px] rounded-md border px-3 text-[10px] max-[520px]:min-w-[82px] max-[520px]:px-2 ${activePlanTab === "plan" ? "border-[#2c3038] bg-[#20232a] text-[#f4f5f6]" : "border-transparent bg-transparent text-[#888d97]"}`}
                  type="button"
                  role="tab"
                  aria-selected={activePlanTab === "plan"}
                  onClick={() => setActivePlanTab("plan")}
                >
                  Today&apos;s Plan
                </button>
                <button
                  className={`min-h-[30px] min-w-[98px] rounded-md border px-3 text-[10px] max-[520px]:min-w-[82px] max-[520px]:px-2 ${activePlanTab === "saved" ? "border-[#2c3038] bg-[#20232a] text-[#f4f5f6]" : "border-transparent bg-transparent text-[#888d97]"}`}
                  type="button"
                  role="tab"
                  aria-selected={activePlanTab === "saved"}
                  onClick={() => setActivePlanTab("saved")}
                >
                  Saved
                </button>
              </div>
              <label>
                <span className="sr-only">Search by workout name or muscle group</span>
                <input
                  className="h-9 w-48 rounded-md border border-[#25282d] bg-[#13151a] px-3 text-xs text-[#f4f5f6] outline-none placeholder:text-[#747984] focus:border-[#ccff00] max-[520px]:w-full"
                  type="search"
                  placeholder="Search name or tag"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </label>
              <label className="sort-control">
                <span>Sort By</span>
                <span className="sort-select-wrap">
                  <select value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)}>
                    <option value="duration">Duration</option>
                    <option value="caloriesBurned">Calories</option>
                    <option value="rating">Rating</option>
                  </select>
                  <span className="sort-chevron" aria-hidden="true" />
                </span>
              </label>
            </div>
            {visibleWorkouts.length ? (
              <div className="grid gap-[14px]" role="tabpanel">
                {visibleWorkouts.map((workout) => (
                  <PlanWorkoutCard
                    key={workout.id}
                    workout={workout}
                    onRemove={() => {
                      const id = String(workout.id);
                      if (activePlanTab === "plan") {
                        toggleId(plan, id, setPlan);
                        showToast("Removed from today's plan", "info");
                      } else {
                        toggleId(saved, id, setSaved);
                        showToast("Removed from saved workouts", "info");
                      }
                    }}
                    onDone={activePlanTab === "plan" ? () => {
                      toggleId(plan, String(workout.id), setPlan);
                      showToast("Workout marked as done");
                    } : undefined}
                  />
                ))}
              </div>
            ) : searchQuery.trim() ? (
              <section className="flex min-h-[180px] flex-col items-center justify-center rounded-xl border border-dashed border-[#282b31] p-6 text-center" role="tabpanel">
                <h2 className="m-0 font-[Impact,Haettenschweiler,Arial_Narrow_Bold,sans-serif] text-xl">NO MATCHES</h2>
                <p className="mb-0 mt-2 text-[11px] text-[#888d97]">Try another workout name or muscle group.</p>
              </section>
            ) : (
              <section className="flex min-h-[278px] flex-col items-center justify-center rounded-xl border border-dashed border-[#282b31] p-6 text-center max-[520px]:min-h-[230px]" role="tabpanel">
                <h2 className="m-0 font-[Impact,Haettenschweiler,Arial_Narrow_Bold,sans-serif] text-xl">NOTHING HERE YET</h2>
                <p className="mt-2 mb-5 text-[11px] text-[#888d97]">Browse the library and add a lift to get today moving.</p>
                <Link className="inline-flex min-h-[34px] items-center justify-center rounded-full bg-[#ccff00] px-[17px] text-[10px] font-extrabold text-[#101207] transition-colors hover:bg-[#e0ff59]" href="/">Go to workouts</Link>
              </section>
            )}
          </section>
        )}
      </main>

      <footer className="min-h-[60px] border-t border-[#1a1c20]">
        <div className="mx-auto flex min-h-[59px] w-[calc(100%-20px)] max-w-[1180px] items-center justify-between gap-4">
          <Link className="inline-flex w-fit items-center" href="/" aria-label="FitLog home">
            <span className="relative block h-[17px] w-[52px]">
              <Image className="object-contain object-left" src="/assets/logo.png" alt="FitLog" fill sizes="52px" />
            </span>
          </Link>
          <p className="m-0 text-right text-[9px] text-[#747984]">© 2026 FitLog — Workout Library. Train hard, log honest.</p>
        </div>
      </footer>
      <ToastContainer
        position="bottom-center"
        autoClose={2600}
        hideProgressBar
        closeButton={false}
        newestOnTop
        theme="dark"
      />
    </>
  );
}