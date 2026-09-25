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

## Run on the browser

Open [https://assignment-6-ten-blue.vercel.app/](https://assignment-6-ten-blue.vercel.app/) in your browser. Workout data is loaded from the [FitLog API](https://api.abcz.workers.dev/api/fitlog).

## Deploy to Vercel

1. Push the project to GitHub, then import that repository in [Vercel](https://vercel.com/new).
2. Keep the framework preset as **Next.js** and the root directory as the repository root.
3. Use the default install and build settings. The build command is `npm run build`; leave the output directory unset so Vercel uses Next.js output.
4. No environment variables are required. The app fetches workout data from the public FitLog API.
5. Deploy, then check `/`, `/my-plan`, `/workouts/1`, and an invalid workout URL such as `/workouts/999999`.

Do not enable static export: the app needs server rendering for API data and dynamic workout detail routes.
