export async function getFileContent(githubRepo: string, filePath: string): Promise<string> {
  const fileUrl = `https://raw.githubusercontent.com/${githubRepo}/main/${encodeURI(filePath)}`;
  const response = await fetch(fileUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch file: ${response.statusText}`);
  }
  return response.text();
}
