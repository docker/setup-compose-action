import * as core from '@actions/core';

export interface Inputs {
  version: string;
  cacheBinary: boolean;
}

export async function getInputs(): Promise<Inputs> {
  return {
    version: core.getInput('version'),
    cacheBinary: core.getBooleanInput('cache-binary')
  };
}
