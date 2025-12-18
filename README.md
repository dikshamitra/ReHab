# ReHab - Your Path to Recovery

ReHab is a comprehensive, AI-powered web application designed to support individuals on their journey to overcome addiction. This project provides a safe, anonymous, and supportive environment where users can track their progress, find healthy coping mechanisms, and connect with an AI-powered counselor and a supportive community.

This project was developed by a student at Vellore Institute of Technology (VIT, India).

## Core Features

- **Personalized Dashboard:** Visualizes key metrics like sober time, money saved, and streaks to keep users motivated.
- **AI Coping Strategies:** Leverages Genkit and Google's Gemini Pro to provide personalized coping strategies based on a user's stated triggers and progress.
- **Anonymous AI Chat:** Offers a safe, non-judgmental space to talk with an empathetic AI counselor, available 24/7.
- **Community Forum:** A secure forum for users to share stories, ask for advice, and support one another anonymously.
- **Gamification:** A points and streak system to encourage daily engagement and celebrate milestones.
- **"My Reasons" List:** A personal list where users can document and revisit their core motivations for quitting.
- **Resource Hub:** A curated list of external hotlines and websites for professional help.

## Technology Stack

- **Framework:** Next.js (App Router) & React
- **Language:** TypeScript
- **Styling:** Tailwind CSS & ShadCN/UI
- **Database & Auth:** Firebase (Firestore, Firebase Auth)
- **Generative AI:** Google AI - Genkit (Gemini Pro)

## Getting Started

Follow these instructions to get a local copy of the project up and running.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- `npm` or `yarn`
- A [Firebase](https://firebase.google.com/) account to set up the database and authentication.
- A [Google AI Studio](https://aistudio.google.com/) account to get a Gemini API key for Genkit.

### Setup Instructions

1.  **Clone the Repository**
    ```sh
    git clone https://github.com/your-username/rehab-app.git
    cd rehab-app
    ```

2.  **Install Dependencies**
    ```sh
    npm install
    ```

3.  **Set Up Environment Variables**
    - Create a new project in the [Firebase Console](https://console.firebase.google.com/).
    - In your project, go to Project Settings and add a new Web App.
    - Firebase will provide you with a `firebaseConfig` object.
    - Create a `.env.local` file in the root of the project by copying the `.env.local.example` file (if provided) or creating a new one.
    - Populate `.env.local` with the values from your Firebase config object.
    - Go to [Google AI Studio](https://aistudio.google.com/) and create a new API key.
    - Add your Gemini API key to the `.env.local` file.

    Your `.env.local` file should look like this:

    ```env
    # Firebase Configuration
    NEXT_PUBLIC_FIREBASE_API_KEY="YOUR_FIREBASE_API_KEY"
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_FIREBASE_AUTH_DOMAIN"
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="YOUR_FIREBASE_PROJECT_ID"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="YOUR_FIREBASE_STORAGE_BUCKET"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="YOUR_FIREBASE_MESSAGING_SENDER_ID"
    NEXT_PUBLIC_FIREBASE_APP_ID="YOUR_FIREBASE_APP_ID"

    # Genkit AI Configuration
    GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
    ```

4.  **Set Up Firestore**
    - In the Firebase Console, go to the Firestore Database section and create a database.
    - You will need to manually create the `users` and `forum_posts` collections or let the app create them as you use the features.
    - Go to the **Rules** tab and paste the contents of the `firestore.rules` file from this project. Publish the rules.

5.  **Enable Firebase Authentication**
    - In the Firebase Console, go to the Authentication section.
    - Click "Get Started" and enable the **Email/Password** sign-in method.

### Running the Application

Once the setup is complete, you can run the development server:

```sh
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) in your browser to see the application.

Owner: Diksha Mitra
Contact: dikshamitra3109@gmail.com
