import { exec } from 'child_process';
import { mocked } from 'jest-mock';
import { checkIfDeprecated, getLatestVersionFromNpm } from '../../../lib/cli/util/npm';

jest.mock('child_process');
const mockedExec = mocked(exec) as unknown as jest.Mock<Promise<{ stdout: string; stderr: string }>, [string, { timeout: number }]>;

describe('npm utilities', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('getLatestVersionFromNpm', () => {
    test('successfully retrieves latest version', async () => {
      // GIVEN
      mockedExec.mockImplementation(() => Promise.resolve({
        stdout: '2.1.0\n',
        stderr: '',
      }));

      // WHEN
      const version = await getLatestVersionFromNpm();

      // THEN
      expect(version).toBe('2.1.0');
      expect(mockedExec).toHaveBeenCalledWith('npm view aws-cdk version', { timeout: 3000 });
    });

    test('works even with stderr output', async () => {
      // GIVEN
      mockedExec.mockImplementation(() => Promise.resolve({
        stdout: '2.1.0\n',
        stderr: 'npm WARN deprecated warning',
      }));

      // WHEN
      const version = await getLatestVersionFromNpm();

      // THEN
      expect(version).toBe('2.1.0');
    });

    test('throws error for invalid version format', async () => {
      // GIVEN
      mockedExec.mockImplementation(() => Promise.resolve({
        stdout: 'invalid-version\n',
        stderr: '',
      }));

      // WHEN/THEN
      await expect(getLatestVersionFromNpm()).rejects.toThrow('npm returned an invalid semver invalid-version');
    });
  });

  describe('checkIfDeprecated', () => {
    test('returns null for non-deprecated version', async () => {
      // GIVEN
      mockedExec.mockImplementation(() => Promise.resolve({
        stdout: '',
        stderr: '',
      }));

      // WHEN
      const result = await checkIfDeprecated('2.1.0');

      // THEN
      expect(result).toBeNull();
      expect(mockedExec).toHaveBeenCalledWith('npm view aws-cdk@2.1.0 deprecated --silent', { timeout: 3000 });
    });

    test('returns deprecation message for deprecated version', async () => {
      // GIVEN
      const deprecationMessage = 'This version has been deprecated';
      mockedExec.mockImplementation(() => Promise.resolve({
        stdout: deprecationMessage,
        stderr: '',
      }));

      // WHEN
      const result = await checkIfDeprecated('1.0.0');

      // THEN
      expect(result).toBe(deprecationMessage);
    });

    test('returns null when error occurs', async () => {
      // GIVEN
      mockedExec.mockImplementation(() => Promise.reject(new Error('npm error')));

      // WHEN
      const result = await checkIfDeprecated('2.1.0');

      // THEN
      expect(result).toBeNull();
    });
  });
}); 