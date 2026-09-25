# FitLog

FitLog is a workout library and daily training planner. Browse lifts, review exercise instructions, build a plan of up to five workouts, and keep favorites saved for later.

## Technologies

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS
- React Toastify
- FitLog Workout API

## Key Features

1. **API-powered workout library** with workout images, muscle groups, equipment, duration, calories, and ratings.
2. **Workout detail pages** with exercise specifications and step-by-step instructions.
3. **Daily plan** capped at five lifts, with live exercise, minute, and calorie totals.
4. **Saved workouts** in a separate tab, with sorting by duration, calories, or rating.
5. **Responsive interface** with add, save, complete, and remove actions plus Toastify notifications.

## Run Locally

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Workout data is loaded from the [FitLog API](https://api.abcz.workers.dev/api/fitlog).
