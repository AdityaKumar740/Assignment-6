"use client";

import Image from "next/image";
import Link from "next/link";
import { startTransition, useEffect, useState } from "react";

type Workout = {
  id: string;
  name: string;
  focus: string;
  description: string;
  duration: string;
};

type FitLogProps = {
  view: "library" | "plan";
};

const workouts: Workout[] = [
  {
    id: "bench-press",
    name: "Barbell Bench Press",
    focus: "CHEST / COMPOUND",
    description: "A steady, controlled press built around progressive strength.",
    duration: "4 SETS",
  },
  {
    id: "back-squat",
    name: "Barbell Back Squat",
    focus: "LEGS / COMPOUND",
    description: "Build lower-body strength with a strong brace and full depth.",
    duration: "4 SETS",
  },
  {
    id: "deadlift",
    name: "Conventional Deadlift",
    focus: "BACK / COMPOUND",
    description: "Pull from the floor with crisp reps and a neutral spine.",
    duration: "3 SETS",
  },
  {
    id: "shoulder-press",
    name: "Seated Shoulder Press",
    focus: "SHOULDERS / PUSH",
    description: "A focused overhead press for strong, stable shoulders.",
    duration: "3 SETS",
  },
];

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

function WorkoutItem({
  workout,
  actionLabel,
  onAction,
}: {
  workout: Workout;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <article className="workout-item">
      <div className="workout-copy">
        <span className="workout-focus">{workout.focus}</span>
        <h3>{workout.name}</h3>
        <p>{workout.description}</p>
      </div>
      <div className="workout-controls">
        <span className="set-count">{workout.duration}</span>
        <button className="text-button" type="button" onClick={onAction}>
          {actionLabel}
        </button>
      </div>
    </article>
  );
}

export default function FitLog({ view }: FitLogProps) {
  const [plan, setPlan] = useState<string[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

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

  const plannedWorkouts = workouts.filter((workout) => plan.includes(workout.id));
  const savedWorkouts = workouts.filter((workout) => saved.includes(workout.id));

  return (
    <>
      <header className="site-header">
        <div className="navbar">
          <Link className="brand" href="/" aria-label="FitLog home">
            <span className="brand-image">
              <Image src="/assets/logo.png" alt="FitLog" fill priority sizes="110px" />
            </span>
          </Link>

          <nav className="main-nav" aria-label="Main navigation">
            <Link className={view === "library" ? "nav-link active" : "nav-link"} href="/">
              Workouts
            </Link>
            <Link className={view === "plan" ? "nav-link active" : "nav-link"} href="/my-plan">
              My Plan
            </Link>
          </nav>

          <div className="status-links">
            <Link className="status-link" href="/my-plan" aria-label={`Plan: ${plan.length} items`}>
              <span>PLAN</span>
              <span className="count-pill plan-count">{plan.length}</span>
            </Link>
            <Link className="status-link" href="/my-plan" aria-label={`Saved: ${saved.length} items`}>
              <span>SAVED</span>
              <span className="count-pill saved-count">{saved.length}</span>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {view === "library" ? (
          <>
            <section className="hero" aria-labelledby="hero-title">
              <div className="hero-copy">
                <span className="eyebrow">WORKOUT LIBRARY</span>
                <h1 id="hero-title">
                  <span>TRAIN WITH INTENT.</span>
                  <span>LOG EVERY SET.</span>
                </h1>
                <p>
                  FitLog is a dark, no-nonsense gym companion: pick a lift, lock it into
                  today&apos;s plan, and watch the week&apos;s work add up.
                </p>
              </div>
              <div className="hero-art" aria-hidden="true">
                <Image
                  src="/assets/banner.png"
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 700px) 100vw, 42vw"
                />
              </div>
            </section>

          </>
        ) : (
          <section className="plan-page" aria-labelledby="plan-title">
            <div className="section-heading plan-heading">
              <div>
                <span className="eyebrow">STAY ON TRACK</span>
                <h1 id="plan-title">MY PLAN</h1>
              </div>
              <Link className="secondary-button" href="/#library">+ ADD WORKOUTS</Link>
            </div>

            <section className="plan-group" aria-labelledby="today-title">
              <div className="group-heading">
                <h2 id="today-title">TODAY&apos;S PLAN</h2>
                <span className="section-count">{plannedWorkouts.length} MOVEMENTS</span>
              </div>
              {plannedWorkouts.length ? (
                <div className="workout-list">
                  {plannedWorkouts.map((workout) => (
                    <WorkoutItem
                      key={workout.id}
                      workout={workout}
                      actionLabel="REMOVE"
                      onAction={() => toggleId(plan, workout.id, setPlan)}
                    />
                  ))}
                </div>
              ) : (
                <p className="empty-state">Nothing planned yet. Add a movement from the library.</p>
              )}
            </section>

            <section className="plan-group saved-group" aria-labelledby="saved-title">
              <div className="group-heading">
                <h2 id="saved-title">SAVED WORKOUTS</h2>
                <span className="section-count">{savedWorkouts.length} SAVED</span>
              </div>
              {savedWorkouts.length ? (
                <div className="workout-list">
                  {savedWorkouts.map((workout) => (
                    <WorkoutItem
                      key={workout.id}
                      workout={workout}
                      actionLabel="UNSAVE"
                      onAction={() => toggleId(saved, workout.id, setSaved)}
                    />
                  ))}
                </div>
              ) : (
                <p className="empty-state">No saved workouts. Bookmark lifts you want to revisit.</p>
              )}
            </section>
          </section>
        )}
      </main>
    </>
  );
}