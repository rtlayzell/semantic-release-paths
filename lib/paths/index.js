import micromatch from "micromatch";
import { getChangedFiles } from "../git.js";

export async function filterCommitsByPaths(commits, paths, execaOptions) {
  return (
    await Promise.all(
      commits.map(async (commit) => {
        const files = await getChangedFiles(commit.hash, execaOptions);
        return micromatch(files, paths).length > 0 ? commit : null;
      })
    )
  ).filter(Boolean);
}
