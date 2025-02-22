import { exec as _exec } from 'child_process';
import * as semver from 'semver';
import { promisify } from 'util';
import { debug } from '../../logging';
import { ToolkitError } from '../../toolkit/error';

const exec = promisify(_exec);

/* istanbul ignore next: not called during unit tests */
export async function getLatestVersionFromNpm(): Promise<string> {
  const { stdout, stderr } = await exec('npm view aws-cdk version', { timeout: 3000 });
  if (stderr && stderr.trim().length > 0) {
    debug(`The 'npm view' command generated an error stream with content [${stderr.trim()}]`);
  }
  const latestVersion = stdout.trim();
  if (!semver.valid(latestVersion)) {
    throw new ToolkitError(`npm returned an invalid semver ${latestVersion}`);
  }

  return latestVersion;
}

export async function checkIfDeprecated(version: string): Promise<string | null> {
  try {
    const { stdout, stderr } = await exec(`npm view aws-cdk@${version} deprecated --silent`, { timeout: 3000 });
    if (stderr) {
      debug(`The 'npm view aws-cdk@${version} deprecated --silent' command generated an error stream with content [${stderr.trim()}]`);
    }

    return stdout ? stdout.trim() : null;
  } catch (err) {
    debug(`Failed to check package deprecation status - ${err}`);
    return null;
  }
}
