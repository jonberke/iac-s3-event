#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from '@aws-cdk/core'
import { IacEcsStack } from '../lib/stack'

const app = new cdk.App()
new IacEcsStack(app, 'iac-ecs')
