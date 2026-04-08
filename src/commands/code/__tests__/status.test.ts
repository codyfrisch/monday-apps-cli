import Status from 'commands/code/status';
import { createMockConfig, getStdout, mockRequestResolvedValueOnce } from 'test/cli-test-utils';
import logger from 'utils/logger';

describe('code:status', () => {
  const mockDeploymentStatusResponse = {
    status: 'successful',
    deployment: {
      url: 'https://example.com/deploy',
      latestUrl: 'https://example.com/latest',
    },
  };

  const mockMondayCodeBuildResponse = {
    appReleases: [
      {
        id: 1,
        // eslint-disable-next-line camelcase
        app_version_id: 10,
        kind: 'release',
        category: 'monday_code',
        state: 'active',
        region: null,
        data: { liveUrl: 'https://live.example.com' },
      },
    ],
  };

  it('should display deployment status table', async () => {
    mockRequestResolvedValueOnce(mockDeploymentStatusResponse);
    mockRequestResolvedValueOnce(mockMondayCodeBuildResponse);
    const config = createMockConfig();
    const command = new Status(['-i', '10', '-z', 'us'], config);

    await command.run();

    expect(logger.table).toHaveBeenCalledTimes(1);
    const stdout = getStdout();
    expect(stdout).toContain('successful');
  });

  describe('--json flag', () => {
    it('should return deployment status with appVersionId and not call logger.table', async () => {
      mockRequestResolvedValueOnce(mockDeploymentStatusResponse);
      mockRequestResolvedValueOnce(mockMondayCodeBuildResponse);
      const config = createMockConfig();
      const command = new Status(['-i', '10', '-z', 'us', '--json'], config);

      const result = await command.run();

      expect(result).toMatchObject({
        status: 'successful',
        appVersionId: 10,
        deployment: { url: 'https://example.com/deploy' },
      });
      expect(logger.table).not.toHaveBeenCalled();
    });
  });
});
