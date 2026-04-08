import AppFeatureList from 'commands/app-features/list';
import { createMockConfig, getStderr, getStdout, mockRequestResolvedValueOnce } from 'test/cli-test-utils';
import logger from 'utils/logger';

describe('app-features:list', () => {
  const mockAppFeaturesListResponse = {
    appFeatures: [
      {
        id: 1,
        name: 'feature1',
        type: 'Monday App Feature Button',
        status: 'active',
        // eslint-disable-next-line camelcase
        current_release: { data: { url: 'https://example.com/v1' } },
      },
      {
        id: 2,
        name: 'feature2',
        type: 'Monday App Feature View',
        status: null,
        // eslint-disable-next-line camelcase
        current_release: null,
        data: { microFrontendName: 'my-mfe' },
      },
    ],
  };

  it('should list app features', async () => {
    mockRequestResolvedValueOnce(mockAppFeaturesListResponse);
    const config = createMockConfig();
    const command = new AppFeatureList(['-i', '1'], config);

    await command.run();

    const stdout = getStdout();
    expect(stdout).toContain('feature1');
    expect(stdout).toContain('feature2');
  });

  it('should print error message if no features found', async () => {
    mockRequestResolvedValueOnce({ appFeatures: [] });
    const config = createMockConfig();
    const command = new AppFeatureList(['-i', '1'], config);

    await command.run();

    const stderr = getStderr();
    expect(stderr).toContain('No app features found');
  });

  describe('--json flag', () => {
    it('should return projected feature data and not call logger.table', async () => {
      mockRequestResolvedValueOnce(mockAppFeaturesListResponse);
      const config = createMockConfig();
      const command = new AppFeatureList(['-i', '1', '--json'], config);

      const result = await command.run();

      expect(result).toHaveLength(2);
      expect(result).toEqual(
        expect.arrayContaining([
          {
            id: 1,
            name: 'feature1',
            type: 'Monday App Feature Button',
            status: 'active',
            build: 'https://example.com/v1',
          },
          { id: 2, name: 'feature2', type: 'Monday App Feature View', status: 'active', build: 'my-mfe' },
        ]),
      );
      expect(logger.table).not.toHaveBeenCalled();
    });
  });
});
