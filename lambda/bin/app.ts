#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from '@aws-cdk/core'
import { IacLambdaStack } from '../lib/stack'

const app = new cdk.App()
new IacLambdaStack(app, 'iac-lambda')
