import test from "ava";
import { filterCommitsByPaths } from "../../lib/paths/index.js";
import { gitCommitFiles, gitGetCommits, gitRepo } from "../helpers/git-utils.js";

test("Include only commits that touch files matching the path glob", async (t) => {
  const { cwd } = await gitRepo();

  await gitCommitFiles([{ path: "src/index.js" }], "src commit", { cwd });
  await gitCommitFiles([{ path: "docs/readme.md" }], "docs commit", { cwd });

  const commits = await gitGetCommits(undefined, { cwd });

  const result = await filterCommitsByPaths(commits, ["src/**"], { cwd });

  t.is(result.length, 1);
  t.is(result[0].message, "src commit");
});

test("Exclude all commits when no files match the path glob", async (t) => {
  const { cwd } = await gitRepo();

  await gitCommitFiles([{ path: "src/index.js" }], "src commit", { cwd });
  await gitCommitFiles([{ path: "docs/readme.md" }], "docs commit", { cwd });

  const commits = await gitGetCommits(undefined, { cwd });

  const result = await filterCommitsByPaths(commits, ["lib/**"], { cwd });

  t.deepEqual(result, []);
});

test("Include commits matching any of multiple path globs", async (t) => {
  const { cwd } = await gitRepo();

  await gitCommitFiles([{ path: "src/index.js" }], "src commit", { cwd });
  await gitCommitFiles([{ path: "docs/readme.md" }], "docs commit", { cwd });
  await gitCommitFiles([{ path: "test/foo.test.js" }], "test commit", { cwd });

  const commits = await gitGetCommits(undefined, { cwd });

  const result = await filterCommitsByPaths(commits, ["src/**", "docs/**"], { cwd });

  t.is(result.length, 2);
  const messages = result.map((c) => c.message);
  t.true(messages.includes("src commit"));
  t.true(messages.includes("docs commit"));
});

test("Include a commit that touches multiple files when at least one matches", async (t) => {
  const { cwd } = await gitRepo();

  await gitCommitFiles([{ path: "src/index.js" }, { path: "docs/readme.md" }], "mixed commit", { cwd });
  await gitCommitFiles([{ path: "test/foo.test.js" }], "test commit", { cwd });

  const commits = await gitGetCommits(undefined, { cwd });

  const result = await filterCommitsByPaths(commits, ["src/**"], { cwd });

  t.is(result.length, 1);
  t.is(result[0].message, "mixed commit");
});

test("Return all commits when paths glob matches everything", async (t) => {
  const { cwd } = await gitRepo();

  await gitCommitFiles([{ path: "src/index.js" }], "src commit", { cwd });
  await gitCommitFiles([{ path: "docs/readme.md" }], "docs commit", { cwd });

  const commits = await gitGetCommits(undefined, { cwd });

  const result = await filterCommitsByPaths(commits, ["**"], { cwd });

  t.is(result.length, 2);
});

test("Return empty array when there are no commits", async (t) => {
  const { cwd } = await gitRepo();

  const result = await filterCommitsByPaths([], ["src/**"], { cwd });

  t.deepEqual(result, []);
});
