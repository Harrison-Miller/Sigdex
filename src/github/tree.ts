export async function listFiles(githubRepo: string): Promise<string[]> {
  const treeUrl = `https://api.github.com/repos/${githubRepo}/git/trees/main?recursive=1`;
  const response = await fetch(treeUrl);
  const data = await response.json();
  if (!data.tree) {
    throw new Error('No tree found in response');
  }
  return data.tree.map((file: any) => file.path);
}
