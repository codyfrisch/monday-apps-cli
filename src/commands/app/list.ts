import { AuthenticatedCommand } from 'commands-base/authenticated-command';
import { listApps } from 'services/apps-service';
import { App } from 'types/services/apps-service';
import logger from 'utils/logger';

export default class AppList extends AuthenticatedCommand {
  static description = 'List all apps for a specific user.';

  static withPrintCommand = false;

  static examples = ['<%= config.bin %> <%= command.id %>'];

  static flags = AppList.serializeFlags({});

  public async run(): Promise<Array<Pick<App, 'id' | 'name'>>> {
    const apps = await listApps();
    if (apps.length === 0) {
      logger.error('No apps found');
      return process.exit(0);
    }

    const cleanedApps = apps.map(app => ({ id: app.id, name: app.name }));

    if (!this.jsonEnabled()) {
      logger.table(cleanedApps);
    }

    return cleanedApps;
  }
}
