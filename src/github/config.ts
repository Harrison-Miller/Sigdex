function getGithubRepo() {
  return localStorage.getItem('GITHUB_REPO') || 'BSData/age-of-sigmar-4th';
}

export function saveGithubBaseUrl(url: string) {
  localStorage.setItem('GITHUB_BASE_URL', url);
}

export function saveGithubRepo(repo: string) {
  localStorage.setItem('GITHUB_REPO', repo);
}

export const GITHUB_REPO = getGithubRepo();
