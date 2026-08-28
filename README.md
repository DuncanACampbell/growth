# Growth

Expo + React Native app (iOS and Android) with TypeScript, Expo Router, and Firebase.

## Run the app

Node.js 22+ is required.

```bash
npm install
npx expo start
```

Then open iOS Simulator (`i`), Android emulator (`a`), or scan the QR code with a development build.

## Firebase

Copy `.env.example` to `.env` and fill in the Firebase **web app** keys from the Firebase console. Do not commit `.env`. The app runs without Firebase until those values are set.

### Firestore rules

Circle needs the rules in `firestore.rules` (users, connections, and circleInvites). Deploy them:

```bash
npx firebase-tools login
npx firebase-tools deploy --only firestore:rules --project growth-b8456
```

Or paste `firestore.rules` into **Firebase Console → Firestore → Rules** and publish.
