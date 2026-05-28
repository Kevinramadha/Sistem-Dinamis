#!/usr/bin/env node
import { execJsModel } from '@sdeverywhere/runtime'
import loadJsModel from './model-fix.js'
execJsModel(await loadJsModel())
