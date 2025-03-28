// This is a barrel export file, of all known symbols that are imported by users from the `aws-cdk` package.
// Importing these symbols was never officially supported, but here we are.
// In order to preserver backwards-compatibly for these users, we re-export and preserve them as explicit subpath exports.
// See https://github.com/aws/aws-cdk/pull/33021 for more information.

// Note: All type exports are in `legacy-exports.ts`
export * from './legacy-logging-source';
export { deepClone, flatten, ifDefined, isArray, isEmpty, numberFromBool, partition, padLeft as leftPad, contentHash, deepMerge, lowerCaseFirstCharacter } from './util';
export { deployStack } from './api/deployments/deploy-stack';
export { cli, exec } from './cli/cli';
export { SdkProvider } from './api/aws-auth';
export { PluginHost } from './api/plugin';
export { Command, Configuration, PROJECT_CONTEXT } from './cli/user-configuration';
export { Settings } from './api/settings';
export { Bootstrapper } from './api/bootstrap';
export { CloudExecutable } from './api/cxapp/cloud-executable';
export { execProgram } from './api/cxapp/exec';
export { RequireApproval } from './commands/diff';
export { formatAsBanner } from './cli/util/console-formatters';
export { setSdkTracing as enableTracing } from './api/aws-auth/tracing';
export { aliases, command, describe } from './commands/docs';
export { Deployments } from './api/deployments';
export { cliRootDir as rootDir } from './cli/root-dir';
export { latestVersionIfHigher, versionNumber } from './cli/version';
export { availableInitTemplates } from './commands/init';
export { cached } from './api/aws-auth/cached';
export { CfnEvaluationException } from './api/cloudformation/evaluate-cloudformation-template';
export { CredentialPlugins } from './api/aws-auth/credential-plugins';
export { AwsCliCompatible } from './api/aws-auth/awscli-compatible';
