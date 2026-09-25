"use client";

import Image from "next/image";
import Link from "next/link";
import { startTransition, useEffect, useRef, useState } from "react";
import type { Workout } from "./fitlog-data";

type FitLogProps = {
  view: "library" | "plan" | "detail";
  workouts: Workout[];
  selectedWorkout?: Workout;
};

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
        <span className="workout-focus">{workout.muscleGroups.join(" / ").toUpperCase()}</span>
        <h3>{workout.name}</h3>
        <p>{workout.description}</p>
      </div>
      <div className="workout-controls">
        <span className="set-count">{workout.duration} MIN</span>
        <Link className="text-button details-link" href={`/workouts/${workout.id}`}>
          VIEW DETAILS
        </Link>
        <button className="text-button" type="button" onClick={onAction}>
          {actionLabel}
        </button>
      </div>
    </article>
  );
}

export default function FitLog({ view, workouts, selectedWorkout }: FitLogProps) {
  const [plan, setPlan] = useState<string[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);
  const toastId = useRef(0);

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

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  function toggleId(ids: string[], id: string, update: (next: string[]) => void) {
    update(ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]);
  }

  function showToast(message: string) {
    toastId.current += 1;
    setToast({ id: toastId.current, message });
  }

  const plannedWorkouts = workouts.filter((workout) => plan.includes(String(workout.id)));
  const savedWorkouts = workouts.filter((workout) => saved.includes(String(workout.id)));

  return (
    <>
      <header className={view === "detail" ? "site-header detail-header" : "site-header"}>
        <div className="navbar">
          <Link className="brand" href="/" aria-label="FitLog home">
            <span className="brand-image">
              <Image src="/assets/logo.png" alt="FitLog" fill priority sizes="110px" />
            </span>
          </Link>

          <nav className="main-nav" aria-label="Main navigation">
            <Link className={view === "library" ? "nav-link active" : "nav-link"} href="/#library">
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
        {view === "detail" && selectedWorkout ? (
          <section className="detail-page">
            <article className="detail-layout">
              <div className="detail-image">
                <Image
                  src={selectedWorkout.image}
                  alt={selectedWorkout.name}
                  fill
                  priority
                  sizes="(max-width: 700px) 100vw, 50vw"
                />
              </div>
              <div className="detail-copy">
                <div className="tag-row">
                  {selectedWorkout.muscleGroups.map((group) => (
                    <span className="tag-pill" key={group}>{group.toUpperCase()}</span>
                  ))}
                </div>
                <h1>{selectedWorkout.name}</h1>
                <p className="detail-description">{selectedWorkout.description}</p>
                <dl className="detail-facts">
                  <div><dt>EQUIPMENT</dt><dd>{selectedWorkout.equipment}</dd></div>
                  <div><dt>DIFFICULTY</dt><dd>{selectedWorkout.difficulty}</dd></div>
                  <div><dt>SETS</dt><dd>{selectedWorkout.sets}</dd></div>
                  <div><dt>REPS</dt><dd>{selectedWorkout.reps}</dd></div>
                  <div><dt>DURATION</dt><dd>{selectedWorkout.duration} min</dd></div>
                  <div><dt>CALORIES</dt><dd>{selectedWorkout.caloriesBurned} kcal</dd></div>
                  <div><dt>RATING</dt><dd>{selectedWorkout.rating}</dd></div>
                </dl>
                <section className="instructions" aria-labelledby="instructions-title">
                  <h2 id="instructions-title">INSTRUCTIONS</h2>
                  <ol>
                    {selectedWorkout.instructions.map((instruction, index) => (
                      <li key={instruction}><span>{index + 1}.</span>{instruction}</li>
                    ))}
                  </ol>
                </section>
                <div className="detail-actions">
                  <button
                    className="primary-button"
                    type="button"
                    aria-pressed={plan.includes(String(selectedWorkout.id))}
                    onClick={() => {
                      const id = String(selectedWorkout.id);
                      const isPlanned = plan.includes(id);
                      toggleId(plan, id, setPlan);
                      showToast(isPlanned ? "Removed from today's plan" : "Added to today's plan");
                    }}
                  >
                    <span aria-hidden="true">▦</span>
                    {plan.includes(String(selectedWorkout.id)) ? "Remove from today's plan" : "Add to today's plan"}
                  </button>
                  <button
                    className="secondary-action"
                    type="button"
                    aria-pressed={saved.includes(String(selectedWorkout.id))}
                    onClick={() => {
                      const id = String(selectedWorkout.id);
                      const isSaved = saved.includes(id);
                      toggleId(saved, id, setSaved);
                      showToast(isSaved ? "Removed from saved workouts" : "Saved for later");
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
            <section className="library-section" id="library" aria-labelledby="library-title">
              <div className="library-heading">
                <div>
                  <h2 id="library-title">THE LIBRARY</h2>
                  <p>Twelve lifts covering every major muscle group.</p>
                </div>
                <span className="section-count">{workouts.length} MOVEMENTS</span>
              </div>
              <div className="workout-grid">
                {workouts.map((workout) => (
                  <Link className="workout-card" href={`/workouts/${workout.id}`} key={workout.id}>
                    <div className="workout-image">
                      <Image
                        src={workout.image}
                        alt={workout.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 33vw"
                      />
                    </div>
                    <div className="workout-card-copy">
                      <div className="tag-row">
                        {workout.muscleGroups.map((group) => (
                          <span className="tag-pill" key={group}>{group.toUpperCase()}</span>
                        ))}
                      </div>
                      <h3>{workout.name.toUpperCase()}</h3>
                      <p className="equipment-line">{workout.equipment}</p>
                      <div className="workout-stats">
                        <span><i aria-hidden="true">◷</i>{workout.duration} min</span>
                        <span><i aria-hidden="true">●</i>{workout.caloriesBurned} kcal</span>
                        <span><i aria-hidden="true">☆</i>{workout.rating}</span>
                      </div>
                    </div>
                  </Link>
                ))}
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
                      onAction={() => toggleId(plan, String(workout.id), setPlan)}
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
                      onAction={() => toggleId(saved, String(workout.id), setSaved)}
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

      <footer className="site-footer">
        <div className="footer-inner">
          <Link className="footer-brand" href="/" aria-label="FitLog home">
            <span className="footer-logo">
              <Image src="/assets/logo.png" alt="FitLog" fill sizes="52px" />
            </span>
          </Link>
          <p>© 2026 FitLog — Workout Library. Train hard, log honest.</p>
        </div>
      </footer>
      {toast && <div className="toast-notice" role="status" aria-live="polite">{toast.message}</div>}
    </>
  );
}