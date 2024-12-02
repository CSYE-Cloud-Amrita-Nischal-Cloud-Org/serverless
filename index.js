const formData = require('form-data');
const Mailgun = require('mailgun.js');
const AWS = require('aws-sdk');
const mailgun = new Mailgun(formData);
const secretsManager = new AWS.SecretsManager();


exports.handler = async (event) => {
  try {
    // Retrieve email credentials from Secrets Manager
    const secretData = await secretsManager
      .getSecretValue({
        SecretId: process.env.MAILGUN_SECRET_ARN,
      })
      .promise();
    const credentials = JSON.parse(secretData.SecretString);
    console.log("Secrets Fetched: ", credentials);

    const client = mailgun.client({
      username: 'api',
      key: credentials.MAILGUN_API_KEY
    });

    // Use the credentials to configure your email service
    const DOMAIN = credentials.MAILGUN_DOMAIN;
    console.log("SNS Event Received:", JSON.stringify(event, null, 2));
    
    // Parse SNS message
    const message = JSON.parse(event.Records[0].Sns.Message);
    const { email, token } = message;

    if (!email || !token) {
      throw new Error("Invalid payload: email and token are required.");
    }

    // Create verification link
    const verificationLink = `${credentials.APP_URL}/verify?token=${token}`;

    console.log("Email verification details saved to the database.");

    // Send verification email
    const emailData = {
      from: `no-reply@${DOMAIN}`,
      to: email,
      subject: "Verify Your Email",
      text: `Click the link to verify your email: ${verificationLink}. This link will expire in 2 minutes.`,
    };

    const response = await client.messages.create(DOMAIN, emailData);
    console.log("Email sent successfully:", response);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Email sent successfully" }),
    };
  } catch (error) {
    console.error("Error processing Lambda:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};