# TheBookNook - Authentication System

This TheBookNook app now includes a complete authentication system with Firebase integration, allowing users to register, log in, and sync their book collections across devices.

## Features Added

### Authentication
- **User Registration**: Create new accounts with username, email, and password
- **User Login**: Sign in with email and password
- **User Logout**: Secure logout functionality
- **Session Management**: Automatic session persistence using AsyncStorage

### Database Synchronization
- **Cloud Sync**: Books are automatically synced between local SQLite and Firebase
- **Smart Merging**: Handles conflicts between local and cloud data
- **Offline Support**: Works offline with local SQLite database
- **Cross-Device Sync**: Books sync across all user devices

### User Interface
- **Login Screen**: Clean, modern login interface
- **Registration Screen**: User-friendly signup form with validation
- **Profile Integration**: User info displayed in profile tab
- **Logout Option**: Easy logout from profile screen

## Setup Instructions

### 1. Firebase Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password provider
3. Create a Firestore database
4. Get your Firebase configuration

### 2. Update Firebase Config

Edit `utils/firebase.ts` and replace the placeholder config with your actual Firebase configuration:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### 3. Firestore Security Rules

Set up Firestore security rules to allow authenticated users to read/write their data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 4. Install Dependencies

The required dependencies are already installed:
- `firebase` - Firebase SDK
- `@react-native-async-storage/async-storage` - Local storage

### 5. Run the App

```bash
npm run dev
```

## How It Works

### Authentication Flow
1. **App Launch**: Checks for existing user session
2. **Login/Register**: User authenticates with Firebase
3. **Database Sync**: Local SQLite syncs with Firebase Firestore
4. **Main App**: User accesses the book management features

### Database Synchronization
- **On Login**: Automatically syncs local and cloud data
- **Smart Merging**: Firebase data takes precedence for conflicts
- **Offline First**: App works without internet using local database
- **Background Sync**: Data syncs when connection is restored

### User Data Structure
```typescript
interface UserProfile {
  username: string;
  email: string;
  createdAt: Date;
  books: BookRecord[];
}
```

## File Structure

```
├── app/
│   ├── login.tsx              # Login screen
│   ├── register.tsx           # Registration screen
│   └── (tabs)/
│       └── profile.tsx        # Updated profile with logout
├── components/
│   └── AuthWrapper.tsx        # Authentication routing wrapper
├── hooks/
│   └── useAuth.tsx            # Authentication context
├── utils/
│   ├── firebase.ts            # Firebase configuration and functions
│   └── syncDatabase.ts        # Database synchronization utilities
└── README.md                  # This file
```

## Security Features

- **Password Validation**: Minimum 6 characters required
- **Email Verification**: Firebase handles email validation
- **Secure Storage**: User sessions stored securely
- **Firebase Security**: Server-side security rules
- **Input Validation**: Client-side form validation

## Usage

### For Users
1. **First Time**: Register with username, email, and password
2. **Login**: Use email and password to sign in
3. **Sync**: Books automatically sync between devices
4. **Logout**: Use the logout option in profile tab

### For Developers
- Authentication state is managed by `useAuth` hook
- Database sync happens automatically on login
- Firebase functions handle all cloud operations
- Local SQLite provides offline functionality

## Troubleshooting

### Common Issues
1. **Firebase Config Error**: Ensure your Firebase config is correct
2. **Network Issues**: App works offline, syncs when online
3. **Login Failures**: Check email/password and Firebase Auth setup
4. **Sync Issues**: Verify Firestore rules and user permissions

### Development
- Check console logs for detailed error messages
- Verify Firebase project settings
- Test with different network conditions
- Monitor Firestore usage in Firebase console

## Next Steps

Potential enhancements:
- Email verification
- Password reset functionality
- Social authentication (Google, Apple)
- Real-time sync updates
- User preferences sync
- Book sharing between users 