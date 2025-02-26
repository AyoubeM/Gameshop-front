const express = require("express");
const { db } = require("../firebase");
const sendEmail = require("../utils/sendEmail");

const router = express.Router();

router.post("/place-order", async (req, res) => {
  const { userEmail, accountDetails } = req.body; // Ensure these are being sent correctly

  try {
    // Logic to save the order in the database...

    // Send email to the user with account details
    const emailSubject = "Your Order Confirmation";
    const emailText = `Thank you for your order! Here are your account details:\n\nAccount: ${accountDetails.email}\nServer: ${accountDetails.server}\nPlatform: ${accountDetails.platform}`;

    await sendEmail(userEmail, emailSubject, emailText); // Ensure this line is executed

    res.status(200).send("Order placed successfully and email sent.");
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).send("Error placing order");
  }
});

module.exports = router;
