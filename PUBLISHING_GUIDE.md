# Mobile App Publishing Guide

Congratulations on building your apps! This guide outlines how to take your built applications and submit them to the Google Play Store and Apple App Store.

---

## 1. Android (Google Play Store)
**Prerequisites:**
*   [Google Play Console Account](https://play.google.com/console) ($25 one-time fee).
*   Android Studio installed.

### Step 1: Generate Signed App Bundle (.aab)
You cannot upload the "debug" app you use for testing. You must create a "Signed Release Bundle".

1.  Open your project in **Android Studio** (`File` > `Open` > navigate to `date-jar/android`).
2.  Go to **Build** > **Generate Signed Bundle / APK**.
3.  Select **Android App Bundle** and click Next.
4.  **Key Store Path:**
    *   Click "Create new..."
    *   **Path:** Choose a safe location (e.g., your Documents folder) and name it `date-jar-upload-key.jks`. **DO NOT LOSE THIS FILE.**
    *   **Password:** Create a strong password.
    *   **Alias:** `key0` (default is fine) or `upload`.
    *   **Certificate:** Fill in "First and Last Name" (e.g. "Date Jar"). Organization default is fine.
    *   Click OK.
5.  Select the key you just created and enter the passwords.
6.  Click Next.
7.  Select **release** build variant.
8.  Click **Create** (or Finish).

Android Studio will build the file. Once done, a popup "Generate Signed Bundle" will appear. Click "Locate" to find the `.aab` file (usually in `android/app/release/app-release.aab`).

### Step 2: Upload to Google Play
1.  Log in to [Google Play Console](https://play.google.com/console).
2.  Click **Create App**.
3.  Fill in App Name ("Date Jar"), Language, and App Type (App).
4.  Navigate to **Testing > Internal testing** (recommended first) or **Production**.
5.  Click **Create new release**.
6.  **Signing Key:** Google will ask to manage your signing key. Click **Continue** (Recommended).
7.  **Upload:** Drag and drop your `.aab` file here.
8.  Fill in release notes and Save.
9.  Follow the dashboard prompts to fill in "Store Listing" (Screenshots, Description), "Content Rating", etc.
10. Submit for Review!

---

## 2. iOS (Apple App Store)
**Prerequisites:**
*   [Apple Developer Program](https://developer.apple.com/) membership ($99/year).
*   **Challenge:** You are on Windows. You normally need a Mac (Xcode) to sign and upload the app.

Since you used GitHub Actions to build the "Unsigned" app, you currently have a file that **cannot** be uploaded to the App Store yet. It needs to be **Signed** with your Apple Distribution Certificate.

### Option A: Use a Friend's Mac (Easiest)
If you have access to *any* Mac (even borrowed):
1.  Copy your `date-jar` project to the Mac.
2.  Run `npm install && npx cap sync ios`.
3.  Open `ios/App` in Xcode.
4.  Log in with your Apple ID in Xcode Settings.
5.  Set "Signing & Capabilities" Team to your account.
6.  Go to **Product > Archive**.
7.  Click **Distribute App** > **App Store Connect** > **Upload**.

### Option B: Cloud Build (Ionic Appflow or EAS)
Services like Ionic Appflow allow you to connect your GitHub repo and they will build/sign the app in the cloud for you. This costs money but works perfect for Windows users.

### Option C: GitHub Actions (Advanced)
We can configure the GitHub Action to **Sign** the app for you. This requires you to export certificates from Apple API.

**Step-by-Step for GitHub Actions Signing:**
1.  **Generate Certificates:** login to [developer.apple.com](https://developer.apple.com).
    *   Create a "Distribution Certificate".
    *   Create a "Provisioning Profile" for App Store Distribution (`com.datejar.app`).
2.  **Export Keys:** You need to export the Certificate as a `.p12` file (requires a Mac usually to export from Keychain). *Note: This is the catch-22. You usually need Mac to generate the p12.*
3.  **Secrets:** valid `.p12` and Provisioning Profile base64 strings added to GitHub Secrets.
4.  **Update Workflow:** Update `build-ios.yml` to use `import-codesign-certs` action.

**Recommendation for Windows Implementation:**
Since generating the `.p12` file usually requires a Mac, **Option B (Cloud Build)** is often the most practical path for pure Windows developers unless you can borrow a Mac for 10 minutes to generate the keys.

---
**Summary Checklist:**
- [ ] **Android:** Build Signed Bundle in Android Studio -> Upload to Play Console.
- [ ] **iOS:** Determine if you can borrow a Mac or want to use a Cloud Build service.
