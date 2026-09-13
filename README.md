# Mea Culpa

An anonymous campus social network and confession platform built with React Native and Expo. Mea Culpa enables university students to share confessions, campus discussions, exam rants, and advice with complete anonymity, zero identity tracking, and real-time community engagement.

---

## Architecture Overview

Mea Culpa is engineered as a cross-platform mobile application utilizing modern React Native patterns, the New Architecture runtime, and real-time cloud persistence.

```
                  +-----------------------------------+
                  |        Mea Culpa Frontend         |
                  |  (React Native 0.86 / Expo SDK 57) |
                  +-----------------+-----------------+
                                    |
            +-----------------------+-----------------------+
            |                       |                       |
            v                       v                       v
   +-----------------+     +-----------------+     +-----------------+
   |   Expo Router   |     |  Zustand Stores |     |   NativeWind    |
   | File-Based Nav  |     | State & Caching |     |  Tailwind CSS   |
   +-----------------+     +--------+--------+     +-----------------+
                                    |
                                    v
                  +-----------------+-----------------+
                  |         Supabase Backend          |
                  |  PostgreSQL / Realtime Engine     |
                  +-----------------------------------+
```

---

## Core Capabilities

### Campus-Scoped Anonymous Feed

- Community segmentation by university campus.
- Global exploration feed ("All Campuses") alongside localized feeds.
- Dynamic campus addition and persistent campus preferences.

### Categorized Confession Streams

- Multi-category sorting: Confession, Rant, Funny, and Advice.
- Real-time updates via PostgreSQL change streams (`postgres_changes`).
- Cursor-based pagination with infinite scrolling.

### Anonymous Interaction System

- Four distinct reaction types: Heart, Shock, Laugh, and Empathy.
- Localized reaction persistence using AsyncStorage to prevent vote manipulation without requiring user accounts.
- Community moderation system: auto-hides content reaching report thresholds.

### Threaded Discussion Engine

- Real-time nested comments and replies for individual confessions.
- Responsive keyboard-avoiding composer interface anchored above native mobile keyboards.
- Haptic feedback integration on interactive triggers.

### Theming and Design System

- Synchronized light and dark themes with persistent storage.
- Custom vector gradients and fluid layout geometry via React Native SVG.
- Fluid micro-animations powered by the React Native Animated API and Reanimated 4.

---

## Technology Stack

### Frontend & Runtime

- **Runtime Framework**: React Native 0.86.3, React 19.2.3
- **Application Platform**: Expo SDK 57 (New Architecture enabled)
- **Routing**: Expo Router v57 (Typed Routes)
- **Styling**: NativeWind v4, Tailwind CSS 3.4
- **State Management**: Zustand v5
- **Local Persistence**: React Native AsyncStorage
- **Animation**: React Native Reanimated 4, React Native Worklets
- **Sensory Feedback**: Expo Haptics

### Backend & Infrastructure

- **Database**: Supabase PostgreSQL
- **Real-time Protocol**: Supabase Realtime Channels (WebSockets)
- **Compilation & Distribution**: Expo Application Services (EAS Build)
- **JavaScript Engine**: Hermes bytecode compiler

---

## Project Structure

```
mea-culpa/
├── app/                        # Expo Router navigation routes
│   ├── _layout.tsx             # Root layout, theme provider, and portal host
│   ├── index.tsx               # Entry splash & anonymous overview screen
│   ├── home.tsx                # Primary feed, filtering, and confession composer
│   ├── campus-select.tsx       # Campus selector and custom campus manager
│   └── post/
│       └── [id].tsx            # Threaded post details and reply stream
├── assets/                     # Static graphical resources and iconography
├── components/
│   └── ui/                     # Primitives (dialogs, dropdowns, typography)
├── constants/
│   └── campuses.ts             # Default campus registry
├── lib/
│   ├── campus-storage.ts       # Storage abstraction for selected campuses
│   ├── supabase.ts             # Supabase client initialization and fallback logic
│   └── theme-manager.ts        # Theme toggling and color scheme subscriber
├── stores/
│   ├── usePostsStore.ts        # Central post state, reactions, and realtime sync
│   └── useRepliesStore.ts      # Discussion replies state manager
├── types/
│   ├── campus.ts               # Campus data models
│   ├── post.ts                 # Post, category, and reaction type definitions
│   └── reply.ts                # Thread reply schema definitions
├── app.json                    # Expo application manifest
├── eas.json                    # EAS build and deployment profiles
└── package.json                # Project dependencies and operational scripts
```

---

## Database Schema

Mea Culpa uses two primary tables in Supabase PostgreSQL:

### `posts` Table

```sql
CREATE TABLE public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    content VARCHAR(200) NOT NULL,
    campus TEXT NOT NULL,
    category TEXT CHECK (category IN ('confession', 'rant', 'funny', 'advice')) NOT NULL,
    reaction_heart INTEGER DEFAULT 0 NOT NULL,
    reaction_shock INTEGER DEFAULT 0 NOT NULL,
    reaction_laugh INTEGER DEFAULT 0 NOT NULL,
    reaction_sad INTEGER DEFAULT 0 NOT NULL,
    report_count INTEGER DEFAULT 0 NOT NULL
);

-- Index for campus and chronologically ordered queries
CREATE INDEX idx_posts_campus_created ON public.posts (campus, created_at DESC);
```

### `replies` Table

```sql
CREATE TABLE public.replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    content VARCHAR(500) NOT NULL
);

-- Index for thread lookups
CREATE INDEX idx_replies_post_id ON public.replies (post_id, created_at ASC);
```

---

## Getting Started

### Prerequisites

- Node.js (v18.x or later)
- npm or yarn package manager
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)
- Xcode (for iOS local development on macOS)
- Android Studio / Android SDK (for Android local development)

### Environment Configuration

Create a `.env` file in the project root directory containing your Supabase project credentials:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/mea-culpa.git
   cd mea-culpa
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Launch the Metro development server:
   ```bash
   npx expo start
   ```

---

## Local Development Workflows

### Running on iOS Simulator (macOS only)

```bash
npx expo run:ios
```

### Running on Android Emulator / Physical Device

```bash
npx expo run:android
```

### Testing on Physical Devices via Expo Go or Development Client

```bash
npx expo start
```

Scan the displayed QR code with your device camera (iOS) or the Expo Go / Development Build app (Android).

---

## Production Builds and Deployment

EAS Build is configured via `eas.json` to produce standalone binary artifacts:

### Android Standalone APK (Preview / Sideloading)

```bash
npx eas build -p android --profile preview
```

This generates a direct `.apk` binary file that can be distributed and installed on any Android hardware without Google Play Store restrictions.

### Android Google Play Bundle (AAB Production)

```bash
npx eas build -p android --profile production
```

### iOS Simulator Build

```bash
npx eas build -p ios --profile preview
```

### iOS App Store Build

```bash
npx eas build -p ios --profile production
```

---

## Security and Moderation Model

1. **Zero Personally Identifiable Information (PII)**: The client application never records usernames, email addresses, device fingerprints, or IP addresses into post records.
2. **Community Self-Moderation**: Any post that receives multiple reports is automatically hidden from all campus feeds.
3. **Client-Side Throttling and Verification**: Character counts (200 characters max for confessions, 500 characters max for replies) are enforced at both the UI layer and database constraints.
4. **Row Level Security (RLS)**: Public tables allow anonymous insertions while restricting destructive write operations to authenticated administrators.

