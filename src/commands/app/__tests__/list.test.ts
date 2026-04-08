import AppList from 'commands/app/list';
import { createMockConfig, getStderr, getStdout, mockRequestResolvedValueOnce } from 'test/cli-test-utils';
import logger from 'utils/logger';

describe('app:list', () => {
  const mockAppListResponse = {
    apps: [
      {
        id: 1,
        name: 'app1',
      },
      {
        id: 2,
        name: 'app2',
      },
    ],
  };

  it('should list apps if exists', async () => {
    mockRequestResolvedValueOnce(mockAppListResponse);
    const config = createMockConfig();
    const command = new AppList([], config);

    await command.run();

    // requires investigation - This should work with getStderr
    const stdout = getStdout();
    expect(stdout).toContain('app1');
    expect(stdout).toContain('app2');
  });

  it('should print message if no apps', async () => {
    mockRequestResolvedValueOnce({ apps: [] });
    const config = createMockConfig();
    const command = new AppList([], config);

    await command.run();
    const stderr = getStderr();
    expect(stderr).toContain('No apps found');
  });

  describe('--json flag', () => {
    it('should return app data and not call logger.table', async () => {
      mockRequestResolvedValueOnce(mockAppListResponse);
      const config = createMockConfig();
      const command = new AppList(['--json'], config);

      const result = await command.run();

      expect(result).toEqual(
        expect.arrayContaining([
          { id: 1, name: 'app1' },
          { id: 2, name: 'app2' },
        ]),
      );
      expect(result).toHaveLength(2);
      expect(logger.table).not.toHaveBeenCalled();
    });

    it('should print message to stderr and not call logger.table if no apps', async () => {
      mockRequestResolvedValueOnce({ apps: [] });
      const config = createMockConfig();
      const command = new AppList(['--json'], config);

      await command.run();

      expect(logger.table).not.toHaveBeenCalled();
      const stderr = getStderr();
      expect(stderr).toContain('No apps found');
    });
  });
});
