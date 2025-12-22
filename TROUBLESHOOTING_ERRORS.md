# Resolving "Failed to Fetch" Errors

You are likely seeing `TypeError: Failed to fetch` errors in your console.
This is happening because the Database Schema was updated (to add XP and Levels), but the running Development Server is still locked to the old database client.

## Fix Instructions

**You MUST restart your development server to release the file lock and update the client.**

1.  **Stop the Server**: Click inside your terminal and press `Ctrl + C` (twice if needed) to stop the running process.
2.  **Regenerate Client**: Run the following command:
    ```bash
    npx prisma generate
    ```
3.  **Start Server**: Run the command:
    ```bash
    npm run dev
    ```

Once the server restarts, reload the page. The errors should disappear, and you will see your Level Banner!
