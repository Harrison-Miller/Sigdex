import { XMLParser } from 'fast-xml-parser';
import { listFiles } from '../../github/tree';
import { getFileContent } from '../../github/content';

// loadRepoFiles loads all the BSData XML files from a GitHub repository
// @ts-ignore
function loadRepoFiles(githubRepo: string): Map<string, any> {
  const parser = new XMLParser();
  const pathToXml: Map<string, any> = new Map();
  listFiles(githubRepo).then((files) => {
    files = files.filter((filePath) => filePath.endsWith('.cat') || filePath.endsWith('.gst'));
    files.forEach((filePath) => {
      getFileContent(githubRepo, filePath)
        .then((content) => {
          const result = parser.parse(content);
          pathToXml.set(filePath, result);
        })
        .catch((error) => {
          console.error(`Error fetching content for ${filePath}:`, error);
        });
    });
  });
  return pathToXml;
}
