# Beginner's Guide: Uploading Your Project to GitHub

Since you are new to this, we will take it one step at a time. The error `term 'git' is not recognized` means the Git software is not installed on your computer yet.

## Step 1: Install Git (Required)
We need to install the software that lets your computer talk to GitHub.

1.  **Download**: Click this link to download Git for Windows: [Click here to download](https://github.com/git-for-windows/git/releases/download/v2.47.1.windows.1/Git-2.47.1-64-bit.exe)
    *   *(If the link doesn't work, go to [git-scm.com/download/win](https://git-scm.com/download/win) and click "64-bit Git for Windows Setup")*
2.  **Install**: Open the downloaded file (`Git-....exe`).
3.  **Setup**:
    *   Click **Next** on every screen. You don't need to change any settings. Just keep clicking "Next" until it says "Install", then click **Install**.
    *   Wait for it to finish and click **Finish**.
4.  **Restart**: **Close this VS Code window completely and open it again.** This is important so VS Code can "see" the new Git styling.

## Step 2: Configure Git (One-time Setup)
Since this is your first time using Git, you need to tell it who you are.

1.  Open the **Terminal** in VS Code (Press `Ctrl` + `~`).
2.  Type the following command (replace with your email) and press **Enter**:
    ```bash
    git config --global user.email "you@example.com"
    ```
3.  Type the following command (replace with your name) and press **Enter**:
    ```bash
    git config --global user.name "Your Name"
    ```

## Step 2: Create a Repository on GitHub
1.  Go to [github.com](https://github.com/) and sign in (or create an account).
2.  Look for a **+** icon in the top-right corner and select **New repository**.
3.  **Name**: Type `finance-calculators`.
4.  Scroll down and click the green **Create repository** button.
5.  **Copy the URL**: On the next page, you will see a link that looks like `https://github.com/YOUR_USERNAME/finance-calculators.git`. Keep this page open or copy that link.

## Step 3: Upload Your Code
Now that Git is installed, we can run the commands.

1.  Open the **Terminal** in VS Code (Press `Ctrl` + `~` keys together, or go to Terminal > New Terminal).
2.  Type the following commands one by one and press **Enter** after each line:

```bash
git init
```
*(This sets up a hidden folder to track changes)*

```bash
git add .
```
*(This adds all your files to the "staging area")*

```bash
git commit -m "My first upload"
```
*(This saves the changes locally)*

```bash
git branch -M main
```
*(This names your main branch 'main')*

```bash
git remote add origin https://github.com/YOUR_USERNAME/finance-calculators.git
```
**IMPORTANT**: Replace the URL above with the one you copied in Step 2!

```bash
git push -u origin main
```
*(This sends the files to GitHub. It might ask you to sign in with your browser - just follow the prompts)*

---

## Troubleshooting
*   **"git is not recognized"**: Did you restart VS Code after installing? If yes, try restarting your computer.
*   **"Select Folder"**: If Step 3 is confusing, try dragging the `finance-calculators` folder onto the GitHub website if it allows "Drag and drop" uploading (though the command line is better).
