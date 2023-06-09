import yargs from 'yargs';

// Parse command-line arguments
const argv = yargs(process.argv.slice(2)).options({
    TemplateFile: { type: 'string', default: '' },
    ParametersFile: { type: 'string', default: '' },
    OverrideArmParameters: { type: 'string', default: '' },
    TargetWorkspaceName: { type: 'string', default: '' },
    Environment: { type: 'string', default: '' },
    DeleteArtifactsNotInTemplate: { type: 'boolean', default: false },
    deployManagedPrivateEndpoint: { type: 'boolean', default: false },
    FailOnMissingOverrides: { type: 'boolean', default: false },
    ArtifactsFolder: { type: 'string', default: '' },
    resourceGroup: { type: 'string', default: '' },
    clientId: { type: 'string', default: '' },
    clientSecret: { type: 'string', default: '' },
    subscriptionId: { type: 'string', default: '' },
    tenantId: { type: 'string', default: '' },
    managedIdentity: { type: 'string', default: '' },
}).argv;

export function getInput(name: string): string | boolean {
    return argv[name];
}

// Implement custom logger
class Logger {
    error(message: string): void {
        console.error(`[ERROR]: ${message}`);
    }

    info(message: string): void {
        console.log(`[INFO]: ${message}`);
    }

    debug(message: string): void {
        console.debug(`[DEBUG]: ${message}`);
    }

    warning(message: string): void {
        console.warn(`[WARNING]: ${message}`);
    }
}

const logger = new Logger();

export function error(message: string): void {
    logger.error(message);
}

export function info(message: string): void {
    logger.info(message);
}

export function debug(message: string): void {
    logger.debug(message);
}
export function warning(message: string): void {
    logger.warning(message);
}