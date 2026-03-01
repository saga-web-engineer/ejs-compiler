#!/usr/bin/env node

import { defineCommand, runMain } from 'citty';
import { args, meta } from './config';
import { compileHandler } from './handler';

runMain(defineCommand({ meta, args, run: compileHandler }));
