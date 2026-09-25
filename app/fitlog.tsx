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
    <article className="plan-workout-card">
      <Link className="plan-thumbnail" href={`/workouts/${workout.id}`} aria-label={`View ${workout.name}`}>
        <Image src={workout.image} alt="" fill sizes="144px" />
      </Link>
      <div className="plan-workout-info">
        <h3>{workout.name.toUpperCase()}</h3>
        <p>{workout.equipment}</p>
        <div className="workout-stats">
          <span><i aria-hidden="true">◷</i>{workout.duration} min</span>
          <span><i aria-hidden="true">●</i>{workout.caloriesBurned} kcal</span>
          <span><i aria-hidden="true">☆</i>{workout.rating}</span>
        </div>
      </div>
      <div className="plan-workout-actions">
        <Link className="plan-action-button details-link" href={`/workouts/${workout.id}`}>
          View Details
        </Link>
        {onDone && (
          <button className="plan-action-button done-button" type="button" onClick={onDone}>
            <span aria-hidden="true">✓</span> Mark as Done
          </button>
        )}
        <button className="remove-button" type="button" onClick={onRemove} aria-label={`Remove ${workout.name}`}>
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
    .sort((first, second) => first[sortBy] - second[sortBy]);
  const plannedMinutes = plannedWorkouts.reduce((total, workout) => total + workout.duration, 0);
  const plannedCalories = plannedWorkouts.reduce((total, workout) => total + workout.caloriesBurned, 0);

  return (
    <>
      <header className={view === "detail" ? "site-header detail-header" : view === "plan" ? "site-header plan-header" : "site-header"}>
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
        {view === "plan" && loading ? (
          <section className="plan-page" aria-labelledby="plan-title">
            <div className="plan-title-block">
              <h1 id="plan-title">MY PLAN</h1>
              <p>Cap of five lifts for today. Finish them, then load more.</p>
            </div>
            <p className="plan-loading" role="status">Loading workouts…</p>
          </section>
        ) : view === "detail" && selectedWorkout ? (
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
                      if (!isPlanned && plannedWorkouts.length >= 5) {
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
                    className="secondary-action"
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
            <div className="plan-title-block">
              <h1 id="plan-title">MY PLAN</h1>
              <p>Cap of five lifts for today. Finish them, then load more.</p>
            </div>
            <section className="plan-metrics" aria-label="Today's plan summary">
              <div className="metric-item">
                <span>Exercises</span>
                <strong className="metric-highlight">{plannedWorkouts.length}</strong>
              </div>
              <div className="metric-item">
                <span>Minutes</span>
                <strong>{plannedMinutes}</strong>
              </div>
              <div className="metric-item">
                <span>Calories</span>
                <strong>{plannedCalories}</strong>
              </div>
            </section>
            <div className="plan-toolbar">
              <div className="plan-tabs" role="tablist" aria-label="My Plan views">
                <button
                  className={activePlanTab === "plan" ? "plan-tab active" : "plan-tab"}
                  type="button"
                  role="tab"
                  aria-selected={activePlanTab === "plan"}
                  onClick={() => setActivePlanTab("plan")}
                >
                  Today&apos;s Plan
                </button>
                <button
                  className={activePlanTab === "saved" ? "plan-tab active" : "plan-tab"}
                  type="button"
                  role="tab"
                  aria-selected={activePlanTab === "saved"}
                  onClick={() => setActivePlanTab("saved")}
                >
                  Saved
                </button>
              </div>
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
              <div className="plan-workout-list" role="tabpanel">
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
            ) : (
              <section className="plan-empty" role="tabpanel">
                <h2>NOTHING HERE YET</h2>
                <p>Browse the library and add a lift to get today moving.</p>
                <Link className="empty-cta" href="/">Go to workouts</Link>
              </section>
            )}
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