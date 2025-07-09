import { listFiles } from '../../github/tree';
import { getFileContent } from '../../github/content';
import { xmlParser } from './util';

// loadRepoFiles loads all the BSData XML files from a GitHub repository
export async function loadRepoFiles(githubRepo: string): Promise<Map<string, any>> {
  const parser = xmlParser();
  const pathToXml: Map<string, any> = new Map();
  let files = await listFiles(githubRepo);
  files = files.filter((filePath) => filePath.endsWith('.cat') || filePath.endsWith('.gst'));
  files = files.filter(
    (filePath) =>
      !filePath.toLowerCase().includes('legends') &&
      !filePath.toLowerCase().includes('path to glory')
  );
  await Promise.all(
    files.map((filePath) => {
      return getFileContent(githubRepo, filePath)
        .then((content) => {
          const result = parser.parse(content);
          pathToXml.set(filePath, result);
        })
        .catch((error) => {
          console.error(`Error fetching content for ${filePath}:`, error);
        });
    })
  );
  return pathToXml;
}
