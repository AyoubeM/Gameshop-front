const sendEmail = require("./backend/utils/sendEmail");

const testEmail = async () => {
  try {
    await sendEmail(
      "recipient@example.com",
      "Test Email",
      "This is a test email."
    );
    console.log("Test email sent successfully.");
  } catch (error) {
    console.error("Error sending test email:", error);
  }
};

testEmail();
