# Google Photos Integration Setup

To enable the "Google Photos" picker in Date Jar, you need to configure a Google Cloud Project and simple API keys.

## 1. Create a Google Cloud Project
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g., "Date Jar Photos").

## 2. Enable APIs
1. In your project dashboard, go to **APIs & Services > Library**.
2. Search for and **Enable** these TWO APIs:
    - **Google Photos Library API**
    - **Google Picker API**
3. *Note: You must enable BOTH for the integration to work.*

## 3. Configure OAuth Consent Screen
1. Go to **APIs & Services > OAuth consent screen**.
2. Select **External** (unless you are a Google Workspace user and only want internal use).
3. Fill in the required app information:
    - **App Name**: Date Jar
    - **User Support Email**: Your email
    - **Developer Contact Information**: Your email
4. Click **Save and Continue**.
5. **Scopes**: You don't need to add sensitive scopes for the Picker API usually, but if asked, ensure you don't select restricted ones unless verified. The Picker API generally handles permissions per-session.
6. **Test Users (CRITICAL):**
    > [!IMPORTANT]
    > While your app is in "Testing" mode (which is the default), **ONLY** users listed here can log in.
    - Click **+ Add Users**.
    - Enter your Google email address (and your partner's).
    - Click **Save**.
    - *If you skip this, you will get an "Access Denied (Error 403)" message.*

## 4. Create Credentials
1. Go to **APIs & Services > Credentials**.
2. Click **+ Create Credentials** > **OAuth client ID**.
    - **Application type**: Web application.
    - **Name**: "Date Jar Client".
    - **Authorized JavaScript origins**:
        - `http://localhost:3000` (for local development)
        - `https://your-production-url.com` (if deployed)
    - **Authorized redirect URIs**:
        - `http://localhost:3000`
        - `https://your-production-url.com`
3. Click **Create**.
4. Copy the **Client ID**.

5. Click **+ Create Credentials** > **API Key**.
6. **Restrict the key** (Recommended for security):
    - **Application restrictions**: Select **Websites**.
        - Add `http://localhost:3000/*`
    - **API restrictions**: Select **Restrict key**.
        - Select **Google Photos Picker API**.
7. Click **Create** (or Save).
8. Copy the **API Key**.

## 5. Environment Configuration
1. Open your `.env` file (or `.env.local`).
2. Add the following variables:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id_here
NEXT_PUBLIC_GOOGLE_API_KEY=your_api_key_here
NEXT_PUBLIC_ENABLE_GOOGLE_PHOTOS=true
```

3. Restart your development server (`npm run dev`).

## 6. Verification
1. Go to "Memories" -> "Add Manual Memory".
2. Click the "Google Photos" button.
3. Sign in with the Google account you added as a test user.
4. Select a photo and verify it uploads.

## 7. Troubleshooting "Access Denied" (403 Error)

If you see "We're sorry, but you do not have access to this page", check the following:

**1. Missing APIs (Most Common)**
Ensure both **Google Photos Library API** AND **Google Picker API** are enabled in the Cloud Console.

**2. API Key Restrictions**
If you restricted your API Key:
- Go to APIs & Services > Credentials > Edit API Key.
- Under **API restrictions**, ensure BOTH **Google Photos Library API** and **Google Picker API** are selected.
- If you have **Application restrictions** (Websites), ensure your specific port is correct (e.g., `http://localhost:3000/*` vs `http://127.0.0.1:3000/*`). Using the wrong host in your browser will cause a 403.

**3. Test Users**
Double-check your email is listed in **OAuth consent screen > Test Users**.

**4. Browser Cookies**
Disable "Block third-party cookies" in your browser or try a non-Incognito window. Google's sign-in popup needs access to cookies.

**5. (Try this!) Remove API Key Restrictions**
If you are still stuck, the "Application restriction" on the API Key might be blocking `localhost`.
1. Go to **Credentials**, edit your **API Key**.
2. Set **Application restrictions** to **None**.
3. Click **Save**.
4. Wait 5 minutes.
5. **Restart your local server** (`Ctrl+C` then `npm run dev`) - this is vital!
6. Try again.
*If this works, you can try adding the restrictions back later once you deploy.*
