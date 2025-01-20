import * as core from '@actions/core';
import * as actionsToolkit from '@docker/actions-toolkit';

import {Docker} from '@docker/actions-toolkit/lib/docker/docker';
import {Toolkit} from '@docker/actions-toolkit/lib/toolkit';

import * as context from './context';

actionsToolkit.run(
  // main
  async () => {
    const inputs: context.Inputs = await context.getInputs();

    const toolkit = new Toolkit();
    const standalone = await toolkit.compose.isStandalone();

    await core.group(`Docker info`, async () => {
      try {
        await Docker.printVersion();
        await Docker.printInfo();
      } catch (e) {
        core.info(e.message);
      }
    });

    let toolPath;
    if (!(await toolkit.compose.isAvailable()) || inputs.version) {
      await core.group(`Download compose from GitHub Releases`, async () => {
        toolPath = await toolkit.composeInstall.download(inputs.version || 'latest', !inputs.cacheBinary);
      });
    }
    if (toolPath) {
      await core.group(`Install compose`, async () => {
        if (standalone) {
          await toolkit.composeInstall.installStandalone(toolPath);
        } else {
          await toolkit.composeInstall.installPlugin(toolPath);
        }
      });
    }

    await core.group(`Compose version`, async () => {
      await toolkit.compose.printVersion();
    });
  }
);
