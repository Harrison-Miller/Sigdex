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
		<p>Thank you for using Sigdex! 🎉</p>
		<p>Sigdex is an open-source army browser, meant to be familiar and user-friendly.</p>
		<p>Check out the <a href="https://github.com/Harrison-Miller/Sigdex" target="_blank">GitHub repo</a> for updates, bug reports, and more.</p>
		<br>
		<p style="color:#a00;"><b>Disclaimer:</b> Sigdex is an unofficial fan project and is not affiliated with Games Workshop. It only downloads
	  data from <a href="https://github.com/BSData/age-of-sigmar-4th" target="_blank">BSData</a>.</p>
	  `,
    timestamp: '2025-06-20T00:00:00Z',
    category: 'special',
    alwaysShow: true, // Always show this notice
  },
];

export function getNoticeKey(notice: Notice): string {
  return `notice-seen:${notice.title}`;
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
