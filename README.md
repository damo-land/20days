# 20days

A small, private, iOS-first life-satisfaction tracker.

You define **exactly three life pillars** and score each **once a day** (1–5, under a minute). The app quietly collects the data and shows the trend. When a sustained downward drift appears, it offers a calm **checkpoint**: is this a real problem, or a passing dip? You decide — with your own logged days in front of you.

## Philosophy

- **Recognise, don't treat.** The app helps you notice a pattern; support is signposted, never delivered. No therapy, no diagnosis, no clinical claims.
- **Agency always.** Every prompt is dismissible. No streaks, no guilt, no dark patterns.
- **Privacy is a feature.** Everything stays on your device. No account, no server.

## Stack

Expo (React Native + TypeScript) · Expo Router · react-native-paper (Material 3 Expressive theme) · SQLite + Drizzle · Zustand · hand-rolled SVG charts. Runs in Expo Go — no native build needed.

## Develop

```sh
npm install
npx expo start     # press i for the iOS simulator, or scan the QR with Expo Go
npm test           # trend-engine unit tests (vitest)
npm run typecheck
```

The trend logic lives in `src/trend/` as pure, unit-tested functions. Design and research notes are in `docs/`.
