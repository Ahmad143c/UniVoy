# Google OAuth Setup for UniVoy

## Backend Setup

1. **Install Dependencies**
   ```bash
   cd univoy-backend
   npm install google-auth-library
   ```

2. **Environment Variables**
   Create a `.env` file in the `univoy-backend` directory with:
   ```
   GOOGLE_CLIENT_ID=your_google_client_id_here
   ```

3. **Database Schema Updates**
   The User model has been updated to include:
   - `googleId`: String (unique, sparse)
   - `profilePicture`: String
   - Password field is now optional for Google users

## Frontend Setup

1. **Install Dependencies**
   ```bash
   cd univoy-frontend
   npm install @react-oauth/google
   ```

2. **Environment Variables**
   Create a `.env` file in the `univoy-frontend` directory with:
   ```
   REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here
   ```

3. **Component Updates**
   - App.js now includes GoogleOAuthProvider
   - Signup.js includes Google signup button
   - authService.js includes googleAuth function

## Google OAuth Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Set application type to "Web application"
6. Add authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - Your production domain
7. Copy the Client ID and add it to both .env files

## Features Added

- Google OAuth signup/login button in Signup page
- Automatic user creation for new Google users
- Profile picture from Google account
- Seamless integration with existing authentication system
- Error handling for Google OAuth failures

## Usage

Users can now:
1. Click "Sign up with Google" button
2. Authenticate with their Google account
3. Automatically create a student account
4. Access the student dashboard

The system will:
- Create new users automatically
- Link existing users with Google accounts
- Handle authentication tokens
- Redirect to appropriate dashboard based on role 