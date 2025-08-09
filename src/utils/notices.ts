// Notice management logic for Sigdex

export type NoticeCategory = 'special' | 'changelog' | string;
export interface Notice {
  title: string;
  body: string;
  timestamp: string; // ISO string
  alwaysShow?: boolean; // If true, always show this notice, even if past one month
  category: NoticeCategory;
}

// Notices by category
export const NOTICES: Notice[] = [
  {
    title: 'Welcome to Sigdex!',
    body: `
      <p>Sigdex is an open-source Age of Sigmar list builder, meant to be familiar and user-friendly.</p>
      <ul style="list-style-type: disc inside; text-align: left;">
        <li>Import and export lists</li>
        <li>Default weapon configurations and favorites</li>
        <li>Customize validation for gamemodes like highlander</li>
        <li>Offline caching of data</li>
      </ul>
      <b>Join our community or view the project:</b>
      <div style="margin: 1.2em 0; text-align: center;">
        <a
          href="https://discord.gg/Fn6ZUFb9vZ" target="_blank"
          style="display:inline-flex;align-items:center;gap:0.5em;font-weight:600;padding:0.5em 1.1em;border-radius:6px;text-decoration:none;font-size:1.08em;background:#5865F2;color:#fff;margin-right:0.7em;"
          aria-label="Discord"
        >
          <img src="/assets/brands/discord-brands.svg" alt="Discord" style="height:1.2em;width:1.2em;vertical-align:middle;" /> Discord
        </a>
        <a
          href="https://github.com/Harrison-Miller/sigdex" target="_blank"
          style="display:inline-flex;align-items:center;gap:0.5em;font-weight:600;padding:0.5em 1.1em;border-radius:6px;text-decoration:none;font-size:1.08em;background:#111;color:#fff;margin-right:0.7em;"
          aria-label="GitHub"
        >
          <img src="/assets/brands/github-brands.svg" alt="GitHub" style="height:1.2em;width:1.2em;vertical-align:middle;" /> GitHub
        </a>
        <a
          href="https://ko-fi.com/F1F11I630O"
          target="_blank"
          style="margin-top:0.5em;display:inline-flex;align-items:center;gap:0.5em;font-weight:600;padding:0.5em 1.1em;border-radius:6px;text-decoration:none;font-size:1.08em;background:#FF5E5B;color:#fff;"
          aria-label="Ko-fi"
        >
          <img src="/assets/brands/kofi_symbol.png" alt="Ko-fi" style="height:1.2em;vertical-align:middle;" /> Support on Ko-fi
        </a>
      </div>
      <p style="color:#a00;"><b>Disclaimer:</b> Sigdex is an unofficial fan project and is not affiliated with Games Workshop. It only downloads
      data from <a href="https://github.com/BSData/age-of-sigmar-4th" target="_blank">BSData</a>.</p>
    `,
    timestamp: '2025-06-20T00:00:00Z',
    category: 'special',
    alwaysShow: true, // Always show this notice
  },
  {
    title: 'Sigdex v9 Released!',
    body: `
      <p>We're excited to announce the release of Sigdex v9! This update includes:</p>
      <ul style="list-style-type: disc inside; text-align: left;">
        <li>Legends toggle in settings to show legends units and armies</li>
        <li>Support for new KO and Khorne books</li>
        <li>Unit designer notes</li>
        <li>Improved styling</li>
        <li>Lots of fixes to regiment option parsing</li>
      </ul>
      <p>And much more. Join the Discord to get more updates, report bugs, or request features:</p>
      <div style="margin: 2em 0; text-align: center;">
        <a
          href="https://discord.gg/Fn6ZUFb9vZ" target="_blank"
          style="display:inline-flex;align-items:center;gap:0.5em;font-weight:600;padding:0.8em 1.5em;border-radius:6px;text-decoration:none;font-size:1.2em;background:#5865F2;color:#fff;"
          aria-label="Join Discord"
        >
          <img src="/assets/brands/discord-brands.svg" alt="Discord" style="height:1.5em;width:1.5em;vertical-align:middle;" /> Join the Discord
        </a>
      </div>
    `,
    timestamp: '2025-07-30T00:00:00Z',
    category: 'changelog',
    alwaysShow: false,
  },
  {
    title: 'Sigdex v10 Released!',
    body: `
      <p>Welcome to Sigdex v10! This update brings several new features and improvements:</p>
      <ul style="list-style-type: disc inside; text-align: left;">
        <li>FAQ is now in the app, searchable and favoritable. FAQs that directly mention an army or unit will be shown on those pages.</li>
        <li>Rules references for weapon abilities, terrain abilities, and some keywords are now shown when clicking on underlined text.</li>
        <li>Lots of fixes to regiment options and Armies of Renown, especially around Khorne and Seraphon.</li>
      </ul>
      <p>To install Sigdex as an app, go into your browser settings and click <b>Install Sigdex</b> or <b>Add to Homescreen</b> for the best experience!</p>
      <p>Join the Discord to get more updates, report bugs, or request features:</p>
      <div style="margin: 2em 0; text-align: center;">
        <a
          href="https://discord.gg/Fn6ZUFb9vZ" target="_blank"
          style="display:inline-flex;align-items:center;gap:0.5em;font-weight:600;padding:0.8em 1.5em;border-radius:6px;text-decoration:none;font-size:1.2em;background:#5865F2;color:#fff;"
          aria-label="Join Discord"
        >
          <img src="/assets/brands/discord-brands.svg" alt="Discord" style="height:1.5em;width:1.5em;vertical-align:middle;" /> Join the Discord
        </a>
      </div>
    `,
    timestamp: '2025-08-09T00:00:00Z',
    category: 'changelog',
    alwaysShow: false,
  },
];

export function getNoticeKey(notice: Notice): string {
  return `notice:${notice.title}`;
}

export function markNoticeSeen(notice: Notice) {
  localStorage.setItem(getNoticeKey(notice), '1');
}

export function hasSeenNotice(notice: Notice): boolean {
  return !!localStorage.getItem(getNoticeKey(notice));
}

function isOlderThanOneMonth(iso: string): boolean {
  const now = new Date();
  const date = new Date(iso);
  const diff = now.getTime() - date.getTime();
  return diff > 30 * 24 * 60 * 60 * 1000;
}

export function findNextNoticeToShow(): Notice | null {
  const all = NOTICES;
  for (let i = 0; i < all.length; ++i) {
    const notice = all[i];
    if (hasSeenNotice(notice)) continue;

    if (notice.alwaysShow) return notice;

    if (isOlderThanOneMonth(notice.timestamp)) continue;

    if (notice.category == 'changelog' && i != all.length - 1) continue;

    return notice;
  }
  return null;
}
