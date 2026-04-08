import AppVersionList from 'commands/app-version/list';
import { createMockConfig, getStderr, getStdout, mockRequestResolvedValueOnce } from 'test/cli-test-utils';
import logger from 'utils/logger';

describe('app-version:list', () => {
  const mockAppVersionListResponse = {
    appVersions: [
      { id: 1, name: 'v1', versionNumber: '1.0.0', appId: 10, status: 'live' },
      { id: 2, name: 'v2', versionNumber: '2.0.0', appId: 10, status: 'draft' },
    ],
  };

  it('should list app versions', async () => {
    mockRequestResolvedValueOnce(mockAppVersionListResponse);
    const config = createMockConfig();
    const command = new AppVersionList(['-i', '10'], config);

    await command.run();

    const stdout = getStdout();
    expect(stdout).toContain('v1');
    expect(stdout).toContain('v2');
  });

  it('should print error message if no app versions found', async () => {
    mockRequestResolvedValueOnce({ appVersions: [] });
    const config = createMockConfig();
    const command = new AppVersionList(['-i', '10'], config);

    await command.run();

    const stderr = getStderr();
    expect(stderr).toContain('No app versions found');
  });

  describe('--json flag', () => {
    it('should return version data and not call logger.table', async () => {
      mockRequestResolvedValueOnce(mockAppVersionListResponse);
      const config = createMockConfig();
      const command = new AppVersionList(['-i', '10', '--json'], config);

      const result = await command.run();

      expect(result).toHaveLength(2);
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 1, name: 'v1' }),
          expect.objectContaining({ id: 2, name: 'v2' }),
        ]),
      );
      expect(logger.table).not.toHaveBeenCalled();
    });
  });
});
