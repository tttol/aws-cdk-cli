import { execNpmView } from '../../../lib/cli/util/npm';

jest.mock('util', () => {
  const mockExec = jest.fn();
  const format = jest.fn((fmt, ...args) => {
    return [fmt, ...args].join(' ');
  });
  return {
    promisify: jest.fn(() => mockExec),
    __mockExec: mockExec, 
    format,
  };
});

const { __mockExec: mockedExec } = jest.requireMock('util');

describe('npm.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('execNpmView', () => {
    test('returns latest version and current version info with deprecated message', async () => {
      // Set up result for the first call (latest version)
      mockedExec.mockImplementationOnce((cmd, options) => {
        expect(cmd).toBe('npm view aws-cdk@latest version');
        expect(options).toEqual({ timeout: 3000 });
        return Promise.resolve({
          stdout: '2.0.0\n',
          stderr: '',
        });
      });
      
      // Set up result for the second call (current version)
      mockedExec.mockImplementationOnce((cmd, options) => {
        expect(cmd).toBe('npm view aws-cdk@1.0.0 name version deprecated --json');
        expect(options).toEqual({ timeout: 3000 });
        return Promise.resolve({
          stdout: '{"version": "1.0.0","deprecated": "This version has been deprecated.", "name": "aws-cdk"}',
          stderr: '',
        });
      });

      const result = await execNpmView('1.0.0');

      expect(result).toEqual({
        latestVersion: '2.0.0',
        currentVersion: '1.0.0',
        deprecated: 'This version has been deprecated.',
      });
      
      expect(mockedExec).toHaveBeenCalledTimes(2);
    }); 
    
    test('returns latest version and current version info without deprecated field', async () => {
      // Set up result for the first call (latest version)
      mockedExec.mockImplementationOnce(() => Promise.resolve({
        stdout: '2.1000.0\n',
        stderr: '',
      }));
      
      // Set up result for the second call (current version)
      mockedExec.mockImplementationOnce(() => Promise.resolve({
        stdout: '{"version": "2.179.0", "name": "aws-cdk"}',
        stderr: '',
      }));

      const result = await execNpmView('2.179.0');

      expect(result).toEqual({
        latestVersion: '2.1000.0',
        currentVersion: '2.179.0',
        deprecated: undefined,
      });
    }); 
    
    test('throws error when latest version npm command fails', async () => {
      // Trigger error for the first call (latest version)
      mockedExec.mockImplementationOnce(() => 
        Promise.reject(new Error('npm ERR! code E404\nnpm ERR! 404 Not Found'))
      );

      await expect(execNpmView('1.0.0')).rejects.toThrow('Failed to fetch latest version info');
    });
    
    test('throws error when current version npm command fails', async () => {
      // Set up result for the first call (latest version)
      mockedExec.mockImplementationOnce(() => Promise.resolve({
        stdout: '2.0.0\n',
        stderr: '',
      }));
      
      // Trigger error for the second call (current version)
      mockedExec.mockImplementationOnce(() => 
        Promise.reject(new Error('npm ERR! code E404\nnpm ERR! 404 Not Found'))
      );

      await expect(execNpmView('1.0.0')).rejects.toThrow('Failed to fetch current version');
    });
  });
}); 