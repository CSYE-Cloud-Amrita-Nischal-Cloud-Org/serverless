const formData = require('form-data');
const Mailgun = require('mailgun.js');

const mailgun = new Mailgun(formData);
const client = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY
});

// Initialize Mailgun
const DOMAIN = process.env.MAILGUN_DOMAIN;

exports.handler = async (event) => {
  try {
    console.log("SNS Event Received:", JSON.stringify(event, null, 2));
    
    // Parse SNS message
    const message = JSON.parse(event.Records[0].Sns.Message);
    const { email, token } = message;

    if (!email || !token) {
      throw new Error("Invalid payload: email and token are required.");
    }

    // Create verification link
    const verificationLink = `${process.env.APP_URL}/verify?token=${token}`;

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
