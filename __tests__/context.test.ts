import {beforeEach, describe, expect, vi, test} from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import {Context} from '@docker/actions-toolkit/lib/context.js';

import * as context from '../src/context.js';

const tmpDir = fs.mkdtempSync(path.join(process.env.TEMP || os.tmpdir(), 'context-'));
const tmpName = path.join(tmpDir, '.tmpname-vi');

vi.spyOn(Context, 'tmpDir').mockImplementation((): string => {
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, {recursive: true});
  }
  return tmpDir;
});

vi.spyOn(Context, 'tmpName').mockImplementation((): string => {
  return tmpName;
});

describe('getInputs', () => {
  beforeEach(() => {
    process.env = Object.keys(process.env).reduce((object, key) => {
      if (!key.startsWith('INPUT_')) {
        object[key] = process.env[key];
      }
      return object;
    }, {});
  });

  // prettier-ignore
  test.each([
    [
      0,
      new Map<string, string>([
        ['cache-binary', 'true'],
      ]),
      {
        version: '',
        cacheBinary: true,
      } as context.Inputs
    ],
    [
      1,
      new Map<string, string>([
        ['version', 'v2.32.4'],
        ['cache-binary', 'false'],
      ]),
      {
        version: 'v2.32.4',
        cacheBinary: false
      } as context.Inputs
    ]
  ])(
    '[%d] given %p as inputs, returns %p',
    async (num: number, inputs: Map<string, string>, expected: context.Inputs) => {
      inputs.forEach((value: string, name: string) => {
        setInput(name, value);
      });
      const res = await context.getInputs();
      expect(res).toEqual(expected);
    }
  );
});

// See: https://github.com/actions/toolkit/blob/master/packages/core/src/core.ts#L67
function getInputName(name: string): string {
  return `INPUT_${name.replace(/ /g, '_').toUpperCase()}`;
}

function setInput(name: string, value: string): void {
  process.env[getInputName(name)] = value;
}
