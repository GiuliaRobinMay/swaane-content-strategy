# Swaane Studio

A content planning studio for Swaane Lauwaert's social media: the yearly theme, the monthly themes, the weekly subtopics and every daily post from 1 October 2026 to 31 December 2027, in one calm place.

## What is in it

| Page | What it does |
| --- | --- |
| Today | A greeting, where the posts stand, today's post, this week's seven days, and the month's theme. |
| Calendar | A month grid with year and month switching at the top. Each week shows its subtopic, each day its series and status. Click a day to open the post beside the calendar. |
| Review | One post at a time. Edit the caption, add images, audio or video, and move it through Ready for review, Reviewed, Approved and Posted. Arrow keys move, `r` marks reviewed, `a` approves. |
| Strategy | Edit the yearly theme, each month's theme, hook and movement, and each week's subtopic and guiding question. |
| Funnel | Posts, then a challenge, webinar, giveaway or quiz, then email sign-up, the Say What You Need emails, and the free introductory call. |
| Results | Posted posts with likes, comments, saves, shares and reach, and engagement per series. |
| Accounts | Instagram, Facebook and other accounts, the greeting name, and copying data in and out. |

## Running it

```bash
npm install
npm run dev            # local development
npm run build          # production build in dist/
npm run build:artifact # one self-contained page: dist/swaane-studio.html
```

## Where things live

- `src/data/strategy.ts`: the yearly theme, chapters, months, weekly subtopics, the seven-day rhythm, holidays and offers.
- `src/data/posts/`: the copy for all 457 days. October to December 2026 reuses the late-2027 themes, moved by one day so each series stays on its weekday, with the holiday days rewritten.
- `src/data/emails.ts`: the seven Say What You Need emails.
- Edits, statuses, notes and metrics are saved in the browser's local storage. Uploaded files are saved in the browser's IndexedDB.

## Not connected yet

- **Publishing to Instagram and Facebook** needs a Meta developer app with publishing approval, a business or creator account linked to a Facebook page, and a small server for the login. Until then each post has Copy caption and Mark as posted.
- **Post metrics** are entered by hand until the Instagram connection exists.
- **Email sign-up and nurture** need an email provider such as Flodesk or Kit.
- **Shared data across devices** needs a backend. Today everything stays in one browser; use Accounts, Copy all data to make a backup.
