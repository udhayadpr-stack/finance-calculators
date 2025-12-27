# Uploading to GitHub

It looks like **Git is not installed** on your system (or not in the system path), so I couldn't initialize the repository for you.

## Step 1: Install Git
1.  Download Git from [git-scm.com](https://git-scm.com/download/win).
2.  Run the installer and follow the default prompts.
3.  Restart your terminal/VS Code after installation.

## Step 2: Create a Repository on GitHub
1.  Go to [github.com/new](https://github.com/new).
2.  Enter a name (e.g., `finance-calculators`).
3.  Click **Create repository**.

## Step 3: Upload the Code
Open your terminal in the project folder (`C:\Users\Udhaya T-VIN859\.gemini\antigravity\scratch\finance-calculators`) and run these commands one by one:

```bash
# 1. Initialize Git
git init

# 2. Add all files
git add .

# 3. Commit the changes
git commit -m "Initial commit"

# 4. Rename branch to main
git branch -M main

# 5. Connect to your GitHub repository
# REPLACE <YOUR_URL> with the URL you got from GitHub in Step 2
git remote add origin <YOUR_URL>

# 6. Push the code
git push -u origin main
```

## Security Note
I cannot connect automatically because I don't have access to your personal GitHub account credentials. You will need to sign in when you run the `push` command.
