# Serverless Functions

This repository contains AWS Lambda functions written in Node.js to support email verification functionality for a webapp

## Features
- Sends verification emails with links that expire after 2 minutes.
- Integrates with AWS SNS for messaging.

## AWS Resources
- **AWS Lambda:** Serverless compute for executing functions.
- **AWS SNS:** Simple Notification Service for message publishing.
- **IAM Roles:** Configured to provide secure access to Lambda and SNS.
