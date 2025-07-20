import { useStorage } from "@vueuse/core";


export const GITHUB_REPO_KEY = 'GITHUB_REPO';
export const DEFAULT_GITHUB_REPO = 'BSData/age-of-sigmar-4th';

export const GITHUB_BRANCH_KEY = 'GITHUB_BRANCH';
export const DEFAULT_GITHUB_BRANCH = 'main';

export const GITHUB_REPO = useStorage(GITHUB_REPO_KEY, DEFAULT_GITHUB_REPO);
export const GITHUB_BRANCH = useStorage(GITHUB_BRANCH_KEY, DEFAULT_GITHUB_BRANCH);