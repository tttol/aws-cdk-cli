import { exec as _exec } from 'child_process';
import { promisify } from 'util';
import { ToolkitError } from '../../toolkit/error';

const exec = promisify(_exec);

export async function execNpmView(currentVersion: string) {
  const [latestResult, currentResult] = await Promise.all([
    exec('npm view aws-cdk@latest version', { timeout: 3000 })
      .catch(err => {
        throw new ToolkitError(`Failed to fetch latest version info: ${err.message}`);
      }),
    exec(`npm view aws-cdk@${currentVersion} name version deprecated --json`, { timeout: 3000 })
      .catch(err => {
        throw new ToolkitError(`Failed to fetch current version(${currentVersion}) info: ${err.message}`);
      })
  ]);
  
  if (latestResult.stderr && latestResult.stderr.trim().length > 0) {
    throw new ToolkitError(`npm view command failed: ${latestResult.stderr.trim()}`);
  }
  
  const latestVersion = latestResult.stdout;
  const currentInfo = JSON.parse(currentResult.stdout);
    
  return {
    latestVersion: latestVersion,
    deprecated: currentInfo.deprecated
  };
}
