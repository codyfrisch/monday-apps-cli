import AppVersionBuilds from 'commands/app-version/builds';
import { createMockConfig, getStdout, mockRequestResolvedValueOnce } from 'test/cli-test-utils';
import logger from 'utils/logger';

describe('app-version:builds', () => {
  const mockAppBuildsResponse = {
    appReleases: [
      {
        id: 1,
        // eslint-disable-next-line camelcase
        app_version_id: 10,
        kind: 'release',
        category: 'monday_code',
        state: 'active',
        region: null,
        data: { url: 'https://example.com/build1', liveUrl: 'https://live.example.com/build1' },
      },
      {
        id: 2,
        // eslint-disable-next-line camelcase
        app_version_id: 10,
        kind: 'release',
        category: 'integration',
        state: 'active',
        region: null,
        data: { microFrontendName: 'my-mfe' },
      },
    ],
  };

  it('should list builds and display table', async () => {
    mockRequestResolvedValueOnce(mockAppBuildsResponse);
    const config = createMockConfig();
    const command = new AppVersionBuilds(['-i', '10'], config);

    await command.run();

    const stdout = getStdout();
    expect(stdout).toContain('monday_code');
    expect(logger.table).toHaveBeenCalledTimes(1);
  });

  describe('--json flag', () => {
    it('should return raw release data and not call logger.table', async () => {
      mockRequestResolvedValueOnce(mockAppBuildsResponse);
      const config = createMockConfig();
      const command = new AppVersionBuilds(['-i', '10', '--json'], config);

      const result = await command.run();

      expect(result).toHaveLength(2);
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 1, category: 'monday_code' }),
          expect.objectContaining({ id: 2, category: 'integration' }),
        ]),
      );
      expect(logger.table).not.toHaveBeenCalled();
    });
  });
});
