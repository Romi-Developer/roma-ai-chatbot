# RoMa Ai — Local APK Build Instructions

## Option 1: GitHub Actions (Recommended — No setup needed!)

1. Go to your repo: https://github.com/Romi-Developer/roma-ai-chatbot
2. Click **Actions** tab
3. Click **Build Android APK** workflow
4. Click **Run workflow** → **Run workflow**
5. Wait ~5-10 minutes for build to complete
6. Scroll down to **Artifacts** section
7. Download **RoMa-Ai-Debug-APK** or **RoMa-Ai-Release-APK**
8. Install the `.apk` file on your Android phone

That's it! No local setup needed.

---

## Option 2: Local Build (on your computer)

### Prerequisites

1. **Node.js 20+** — https://nodejs.org
2. **Java JDK 17** — https://adoptium.net
3. **Android Studio** — https://developer.android.com/studio
   - Install Android SDK 34
   - Install Build Tools 34.0.0

### Steps

```bash
# Clone the repo
git clone https://github.com/Romi-Developer/roma-ai-chatbot.git
cd roma-ai-chatbot

# Install dependencies
npm install

# Build the Next.js app (static export)
npm run build

# Add Android platform
npx cap add android

# Sync web assets to Android
npx cap sync android

# Build Debug APK
cd android
./gradlew assembleDebug

# APK will be at:
# android/app/build/outputs/apk/debug/app-debug.apk

# Build Release APK
./gradlew assembleRelease

# APK will be at:
# android/app/build/outputs/apk/release/app-release-unsigned.apk
```

### Install APK on Phone

```bash
# Via USB (enable USB debugging on phone)
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Or copy the .apk file to your phone and tap to install
```

---

## Important Notes

- The APK runs the web app inside a native Android WebView (Capacitor)
- API keys are stored in the app's localStorage — same as the web version
- For Ollama, make sure your computer's IP is reachable from the phone
- The app requires Android 7.0 (API 24) or higher

## Troubleshooting

### "sdk.dir not found"
Create `android/local.properties`:
```
sdk.dir=/path/to/your/Android/Sdk
```

### "Java version mismatch"
Make sure JDK 17 is installed and JAVA_HOME is set:
```bash
export JAVA_HOME=/path/to/jdk-17
```

### Build fails on GitHub Actions
Check the **Actions** tab for error logs. Common fixes:
- Ensure `npm run build` succeeds locally first
- Check that all imports resolve correctly
