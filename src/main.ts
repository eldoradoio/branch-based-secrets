import * as core from "@actions/core";
import * as github from "@actions/github";

const context = github.context;

async function run() {
  try {
    const secrets = core
      .getInput("secrets", { required: true })
      .toUpperCase()
      .split(",")
      .map(x => x.trim());

    const envVars = core
      .getInput("envVars", { required: false })
      .toUpperCase()
      .split(",")
      .map(x => x.trim());

    let ref = process.env.GITHUB_REF;

    if (context.eventName == "pull_request") {
      ref = process.env.GITHUB_BASE_REF;
    }

    const branch = refToBranch(ref);
    let environment = branch.toUpperCase()

    if (environment == 'MAIN' || environment == "MASTER")
      environment = 'PROD'

    core.info(`Target branch: ${branch}`);

    secrets.forEach((secret) => {
      core.exportVariable(
        `${secret}_NAME`,
        `${secret}_${environment}`
      );
    });

    envVars.forEach((envVar) => {
      core.exportVariable(
        `${envVar}_NAME`,
        `${envVar}_${environment}`
      );
    });

    core.exportVariable("TARGET_ENVIRONMENT", environment);
    core.exportVariable("TARGET_BRANCH", branch);
    core.exportVariable("TARGET_BRANCH_U", branch.toUpperCase());
  } catch (error) {
    core.setFailed((error as any).message);
  }
}

function refToBranch(ref: string) {
  if (ref.startsWith("refs/") && !ref.startsWith("refs/heads/")) {
    throw new Error(`Ref ${ref} doesn't point to a branch`);
  }

  return ref.replace("refs/heads/", "");
}

run();
