import * as child_process from 'child_process';
import type { SubprocessOutputDestination } from './asset-handler';

export type ShellEventType = 'open' | 'data_stdout' | 'data_stderr' | 'close';

export type ShellEventPublisher = (event: ShellEventType, message: string) => void;

export interface ShellOptions extends child_process.SpawnOptions {
  readonly shellEventPublisher: ShellEventPublisher;
  readonly input?: string;
  readonly subprocessOutputDestination?: SubprocessOutputDestination;
}

/**
 * OS helpers
 *
 * Shell function which both prints to stdout and collects the output into a
 * string.
 */
export async function shell(command: string[], options: ShellOptions): Promise<string> {
  handleShellOutput(renderCommandLine(command), options, 'open');
  const child = child_process.spawn(command[0], command.slice(1), {
    ...options,
    stdio: [options.input ? 'pipe' : 'ignore', 'pipe', 'pipe'],
  });

  return new Promise<string>((resolve, reject) => {
    if (options.input) {
      child.stdin!.write(options.input);
      child.stdin!.end();
    }

    const stdout = new Array<any>();
    const stderr = new Array<any>();

    // Both emit event and collect output
    child.stdout!.on('data', (chunk) => {
      handleShellOutput(chunk, options, 'data_stdout');
      stdout.push(chunk);
    });

    child.stderr!.on('data', (chunk) => {
      handleShellOutput(chunk, options, 'data_stderr');
      stderr.push(chunk);
    });

    child.once('error', reject);

    child.once('close', (code, signal) => {
      handleShellOutput(renderCommandLine(command), options, 'close');
      if (code === 0) {
        resolve(Buffer.concat(stdout).toString('utf-8'));
      } else {
        const out = Buffer.concat(stderr).toString('utf-8').trim();
        reject(
          new ProcessFailed(
            code,
            signal,
            `${renderCommandLine(command)} exited with ${code != null ? 'error code' : 'signal'} ${code ?? signal}: ${out}`,
          ),
        );
      }
    });
  });
}

function handleShellOutput(
  chunk: Buffer | string,
  options: ShellOptions,
  shellEventType: ShellEventType,
): void {
  switch (options.subprocessOutputDestination) {
    case 'ignore':
      return;
    case 'publish':
      options.shellEventPublisher(shellEventType, chunk.toString('utf-8'));
      break;
    case 'stdio':
    default:
      switch (shellEventType) {
        case 'data_stdout':
          process.stdout.write(chunk);
          break;
        case 'data_stderr':
          process.stderr.write(chunk);
          break;
        case 'open':
          options.shellEventPublisher(shellEventType, chunk.toString('utf-8'));
          break;
      }
      break;
  }
}
export type ProcessFailedError = ProcessFailed;

class ProcessFailed extends Error {
  public readonly code = 'PROCESS_FAILED';

  constructor(
    public readonly exitCode: number | null,
    public readonly signal: NodeJS.Signals | null,
    message: string,
  ) {
    super(message);
  }
}

/**
 * Render the given command line as a string
 *
 * Probably missing some cases but giving it a good effort.
 */
function renderCommandLine(cmd: string[]) {
  if (process.platform !== 'win32') {
    return doRender(cmd, hasAnyChars(' ', '\\', '!', '"', "'", '&', '$'), posixEscape);
  } else {
    return doRender(cmd, hasAnyChars(' ', '"', '&', '^', '%'), windowsEscape);
  }
}

/**
 * Render a UNIX command line
 */
function doRender(
  cmd: string[],
  needsEscaping: (x: string) => boolean,
  doEscape: (x: string) => string,
): string {
  return cmd.map((x) => (needsEscaping(x) ? doEscape(x) : x)).join(' ');
}

/**
 * Return a predicate that checks if a string has any of the indicated chars in it
 */
function hasAnyChars(...chars: string[]): (x: string) => boolean {
  return (str: string) => {
    return chars.some((c) => str.indexOf(c) !== -1);
  };
}

/**
 * Escape a shell argument for POSIX shells
 *
 * Wrapping in single quotes and escaping single quotes inside will do it for us.
 */
function posixEscape(x: string) {
  // Turn ' -> '"'"'
  x = x.replace(/'/g, "'\"'\"'");
  return `'${x}'`;
}

/**
 * Escape a shell argument for cmd.exe
 *
 * This is how to do it right, but I'm not following everything:
 *
 * https://blogs.msdn.microsoft.com/twistylittlepassagesallalike/2011/04/23/everyone-quotes-command-line-arguments-the-wrong-way/
 */
function windowsEscape(x: string): string {
  // First surround by double quotes, ignore the part about backslashes
  x = `"${x}"`;
  // Now escape all special characters
  const shellMeta = new Set<string>(['"', '&', '^', '%']);
  return x
    .split('')
    .map((c) => (shellMeta.has(x) ? '^' + c : c))
    .join('');
}
