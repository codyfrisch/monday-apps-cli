import Search from 'commands/storage/search';
import { createMockConfig, getStdout, mockRequestResolvedValueOnce } from 'test/cli-test-utils';
import logger from 'utils/logger';

describe('storage:search', () => {
  const mockSearchResponse = {
    term: 'foo',
    records: [
      { key: 'foo', value: 'bar', backendOnly: false },
      { key: 'baz', value: 'a'.repeat(50), backendOnly: false },
    ],
  };

  it('should display search results table', async () => {
    mockRequestResolvedValueOnce(mockSearchResponse);
    const config = createMockConfig();
    const command = new Search(['-a', '10', '-c', '99', '-t', 'foo'], config);

    await command.run();

    expect(logger.table).toHaveBeenCalledTimes(1);
    const stdout = getStdout();
    expect(stdout).toContain('foo');
  });

  describe('--json flag', () => {
    it('should return full untruncated records and not call logger.table', async () => {
      mockRequestResolvedValueOnce(mockSearchResponse);
      const config = createMockConfig();
      const command = new Search(['-a', '10', '-c', '99', '-t', 'foo', '--json'], config);

      const result = await command.run();

      expect(result.records).toHaveLength(2);
      // Value should be untruncated in JSON output
      expect(result.records[1].value).toHaveLength(50);
      expect(logger.table).not.toHaveBeenCalled();
    });
  });
});
