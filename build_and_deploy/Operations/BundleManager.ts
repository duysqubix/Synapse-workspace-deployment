// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import * as fs from 'fs';
import * as https from 'https';
import * as http from 'http'; // Add this line
import * as path from 'path';
import { spawn } from "child_process";
import { SystemLogger } from "../utils/logger";

export class BundleManager {
    private static readonly prodBundleUrl = 'https://github.com/duysqubix/armu/releases/download/1.0.0/armu';
    private static readonly ppeBundleUrl = 'https://github.com/duysqubix/armu/releases/download/1.0.0/armu-ppe';
    private static readonly defaultBundleDir: string = 'downloads';
    private static readonly defaultBundleName: string = 'armu';
    private _bundleUrl = BundleManager.prodBundleUrl;
    private _source = "Prod";
    public static readonly defaultBundleFilePath = path.join(process.cwd(), BundleManager.defaultBundleDir, BundleManager.defaultBundleName);


    constructor(source: string = 'prod') {
        this._source = source;
        if (source.toLowerCase() == "ppe") {
            this._bundleUrl = BundleManager.ppeBundleUrl;
            SystemLogger.info("Setting bundle source as PPE");
        }

        SystemLogger.info("Bundle source : " + this._bundleUrl);
    }

    private makeExecutable(filePath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.stat(filePath, (err, stats) => {
                if (err) {
                    reject(err);
                    return;
                }

                // Get the current file permissions
                const currentPermissions = stats.mode;

                // Set the execute permission for owner, group, and others
                const executablePermissions =
                    currentPermissions | 0o111; // 0o111 is the octal representation of execute permissions

                fs.chmod(filePath, executablePermissions, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        });
    }
    public async invokeBundle(): Promise<void> {
        try {
            if (!fs.existsSync(BundleManager.defaultBundleDir)) {
                fs.mkdirSync(BundleManager.defaultBundleDir);
            }
            const file = fs.createWriteStream(BundleManager.defaultBundleFilePath);

            // Helper function to follow redirects
            const getWithRedirect = (urlToGet: string, onResponse: (response: http.IncomingMessage) => void) => {
                https.get(urlToGet, (response) => {
                    const { statusCode } = response;

                    // Check if the status code indicates a redirection
                    if (statusCode && statusCode >= 300 && statusCode < 400 && response.headers.location) {
                        // Follow the redirect by calling the function recursively with the new location
                        getWithRedirect(response.headers.location, onResponse);
                    } else {
                        onResponse(response);
                    }
                });
            };

            return new Promise((resolve, reject) => {
                SystemLogger.info("Downloading asset file");
                getWithRedirect(this._bundleUrl, (response) => {
                    response.pipe(file);
                    file.on('finish', () => {
                        // Listen for the 'close' event to ensure the file is closed before proceeding
                        file.on('close', async () => { // Make this an async function
                            SystemLogger.info("Asset file downloaded at : " + BundleManager.defaultBundleFilePath);
                            try {
                                await this.makeExecutable(BundleManager.defaultBundleFilePath);
                                SystemLogger.info(`File ${BundleManager.defaultBundleFilePath} is now executable`);
                                resolve();
                            } catch (err) {
                                SystemLogger.info(`Error making file ${BundleManager.defaultBundleFilePath} executable: ${err}`);
                                reject(err);
                            }
                        });
                    });
                });
            });
        }
        catch (ex) {
            SystemLogger.info("Bundle manager failed to download asset file.");
            throw ex;
        }
    }

    public static async ExecuteShellCommand(cmd: string) {
        SystemLogger.info("Executing shell command");
        SystemLogger.info("Command : " + cmd);
        try {

            const result = await new Promise((resolve, reject) => {
                let command = spawn(cmd, { shell: true });

                command.stdout.on('data', data => {
                    SystemLogger.info("Stdout: " + data.toString());
                });

                command.stderr.on('data', data => {
                    SystemLogger.info("Stderr: " + data.toString());
                });

                command.on('error', err => {
                    if (err) {
                        SystemLogger.info("Error: " + err.toString());
                        return reject("Shell execution failed.");
                    }
                });

                command.on('close', code => {
                    if (code != 0) {
                        return reject("Shell execution failed.");
                    }
                    else {
                        return resolve("Shell command execution is successful.");
                    }
                });
            });

            if (result == "Shell execution failed.") {
                throw new Error("Shell execution failed.");
            }
            SystemLogger.info("Shell command execution is successful.");
        } catch (e) {
            SystemLogger.info("Shell execution failed.");
            throw e;
        }
    }
}

