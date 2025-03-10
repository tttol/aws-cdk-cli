/* istanbul ignore file */
import * as chalk from 'chalk';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as semver from 'semver';
import { debug, info } from '../logging';
import { ToolkitError } from '../toolkit/error';
import { cdkCacheDir, rootDir } from '../util/directories';
import { formatAsBanner } from './util/console-formatters';
import { execNpmView } from './util/npm';

const ONE_DAY_IN_SECONDS = 1 * 24 * 60 * 60;

const UPGRADE_DOCUMENTATION_LINKS: Record<number, string> = {
  1: 'https://docs.aws.amazon.com/cdk/v2/guide/migrating-v2.html',
};

export function displayVersion() {
  return `${versionNumber()} (build ${commit()})`;
}

export function isDeveloperBuild(): boolean {
  return versionNumber() === '0.0.0';
}

export function versionNumber(): string {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require(path.join(rootDir(), 'package.json')).version.replace(/\+[0-9a-f]+$/, '');
}

function commit(): string {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require(path.join(rootDir(), 'build-info.json')).commit;
}

export class VersionCheckTTL {
  public static timestampFilePath(): string {
    // Using the same path from account-cache.ts
    return path.join(cdkCacheDir(), 'repo-version-ttl');
  }

  private readonly file: string;

  // File modify times are accurate only to the second
  private readonly ttlSecs: number;

  constructor(file?: string, ttlSecs?: number) {
    this.file = file || VersionCheckTTL.timestampFilePath();
    try {
      fs.mkdirsSync(path.dirname(this.file));
      fs.accessSync(path.dirname(this.file), fs.constants.W_OK);
    } catch {
      throw new ToolkitError(`Directory (${path.dirname(this.file)}) is not writable.`);
    }
    this.ttlSecs = ttlSecs || ONE_DAY_IN_SECONDS;
  }

  public async hasExpired(): Promise<boolean> {
    try {
      const lastCheckTime = (await fs.stat(this.file)).mtimeMs;
      const today = new Date().getTime();

      if ((today - lastCheckTime) / 1000 > this.ttlSecs) { // convert ms to sec
        return true;
      }
      return false;
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        return true;
      } else {
        throw err;
      }
    }
  }

  public async update(latestVersion?: string): Promise<void> {
    if (!latestVersion) {
      latestVersion = '';
    }
    await fs.writeFile(this.file, latestVersion);
  }
}

// Export for unit testing only.
// Don't use directly, use displayVersionMessage() instead.
export async function getVersionMessages(currentVersion: string, cacheFile: VersionCheckTTL): Promise<string[]> {
  if (!(await cacheFile.hasExpired())) {
    return [];
  }

  const packageInfo = await execNpmView(currentVersion);
  const latestVersion = packageInfo.version;
  await cacheFile.update(latestVersion);

  if (semver.eq(latestVersion, currentVersion)) {
    return [];
  }

  const versionMessage = [
    `${chalk.red(packageInfo.deprecated as string)}`,
    `Newer version of CDK is available [${chalk.green(latestVersion as string)}]`,
    getMajorVersionUpgradeMessage(currentVersion),
    'Upgrade recommended (npm install -g aws-cdk)',
  ].filter(Boolean) as string[];

  return versionMessage;
}

function getMajorVersionUpgradeMessage(currentVersion: string): string | void {
  const currentMajorVersion = semver.major(currentVersion);
  if (UPGRADE_DOCUMENTATION_LINKS[currentMajorVersion]) {
    return `Information about upgrading from version ${currentMajorVersion}.x to version ${currentMajorVersion + 1}.x is available here: ${UPGRADE_DOCUMENTATION_LINKS[currentMajorVersion]}`;
  }
}

export async function displayVersionMessage(currentVersion = versionNumber(), versionCheckCache?: VersionCheckTTL): Promise<void> {
  if (!process.stdout.isTTY || process.env.CDK_DISABLE_VERSION_CHECK) {
    return;
  }

  try {
    const versionMessages = await getVersionMessages(currentVersion, versionCheckCache ?? new VersionCheckTTL());
    formatAsBanner(versionMessages).forEach(e => info(e));
  } catch (err: any) {
    debug(`Could not run version check - ${err.message}`);
  }
}
