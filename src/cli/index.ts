#!/usr/bin/env node

import { defineCommand, runMain } from 'citty';
import { cliOptions, meta } from './config';
import { compileHandler } from './handler';

runMain(defineCommand({ meta, args: cliOptions, run: compileHandler }));
