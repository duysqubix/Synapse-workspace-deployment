// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { DeployParams, ExportParams, ValidateParams } from "./OperationInterfaces";
// import * as core from '@actions/core';
import * as core from '../custom_core';

import { isStrNullOrEmpty } from "../utils/common_utils";
import { ExportConstants } from "../utils/artifacts_enum";


export function GetDeployParams(templateFile: string = "", parameterFile: string = ""): DeployParams {
    templateFile = templateFile == "" ? (core.getInput("TemplateFile") as string) : templateFile;
    parameterFile = parameterFile == "" ? (core.getInput("ParametersFile") as string) : parameterFile;
    let overrides = (core.getInput("OverrideArmParameters") as string);
    let workspaceName = (core.getInput("TargetWorkspaceName") as string)

    let environment = (core.getInput("Environment") as string);
    if (isStrNullOrEmpty(environment)) {
        environment = 'prod';
    }

    let deleteArtifacts = (core.getInput("DeleteArtifactsNotInTemplate") as string).toLowerCase() == "true"
    let deployMPE = (core.getInput("deployManagedPrivateEndpoint") as string).toLowerCase() == "true"
    let failOnMissingOverrides = (core.getInput("FailOnMissingOverrides") as string).toLowerCase() == "true"

    return {
        templateFile: templateFile,
        parameterFile: parameterFile,
        overrides: overrides,
        environment: environment,
        deleteArtifacts: deleteArtifacts,
        deployMPE: deployMPE,
        failOnMissingOverrides: failOnMissingOverrides,
        workspaceName: workspaceName
    }
}

export function GetValidateParams(): ValidateParams {
    let artifactsFolder = (core.getInput("ArtifactsFolder") as string)
    let workspaceName = (core.getInput("TargetWorkspaceName") as string)

    return {
        artifactsFolder: artifactsFolder,
        workspaceName: workspaceName
    }
}

export function GetExportParams(publishArtifact: boolean): ExportParams {

    const destinationFolder: string = ExportConstants.destinationFolder;
    let artifactsFolder = (core.getInput("ArtifactsFolder") as string);
    let workspaceName = (core.getInput("TargetWorkspaceName") as string);

    return {
        artifactsFolder: artifactsFolder,
        workspaceName: workspaceName,
        destinationFolder: destinationFolder,
        publishArtifact: publishArtifact
    }
}
