export async function getLatestCommit(githubRepo: string, branch: string): Promise<string> {
    const commitsUrl = `https://api.github.com/repos/${githubRepo}/commits?sha=${branch}&per_page=1`;
    const response = await fetch(commitsUrl);
    const data = await response.json();
    if (!data || data.length === 0) {
        throw new Error('No commits found in response');
    }
    return data[0].sha;
}