import { readdirSync } from 'fs';

export function getDirectoriesInPath(path: string) {
  return readdirSync(path, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);
}
