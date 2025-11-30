# The Date Jar

A digital version of the classic "Date Night Jar" for couples.

## How to Run
Since this is a prototype running in a restricted environment without a backend server:
1. Open the `index.html` file in your web browser (Chrome, Edge, Firefox).
2. That's it! The app runs entirely in your browser using `localStorage` to save your data.

## Features
*   **Couple Setup**: Create a shared "Jar" with a reference code and shared password.
*   **User Accounts**: Each partner has their own login.
*   **Idea Management**: Add date ideas with details (Cost, Duration, Type).
*   **The Jar**: Visually pick a random idea with a fun animation.
*   **Filters**: Filter by cost, duration, or type before picking.
*   **History**: See what you've done previously.

## Notes
*   **Data Persistence**: Data is saved to your browser's Local Storage. If you clear your cache or use a different browser/device, the data will not be there.
*   **AI & Email**: These features are simulated. In a real deployment, they would connect to OpenAI and an email service (like SendGrid).
