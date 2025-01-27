const nodemailer = require('nodemailer');
require('dotenv').config();

// Create Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Hardcoded Candidate Emails
const candidates = [
  { email: 'anuragkumar.bh@gmail.com' },
  { email: 'bharti.4@iitj.ac.in' }
];

// Function to Send Job Alert Emails
exports.sendJobAlert = async (jobDetails) => {
  try {
    const emailList = candidates.map(candidate => candidate.email).join(',');

    const mailOptions = {
      from: `"Job Alerts" <${process.env.EMAIL_USER}>`,
      to: emailList,
      subject: `New Job Alert: ${jobDetails.title}`,
      html: `
        <h2>New Job Opportunity!</h2>
        <p><strong>Title:</strong> ${jobDetails.title}</p>
        <p><strong>Description:</strong> ${jobDetails.description}</p>
        <p><strong>Location:</strong> ${jobDetails.location}</p>
        <p><strong>Salary:</strong> ${jobDetails.salary}</p>
        <p><strong>Job Type:</strong> ${jobDetails.type}</p>
        <p><strong>Posted by:</strong> ${jobDetails.employerName}</p>
        <p>Apply now!</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Job alert sent to ${emailList}`);
  } catch (error) {
    console.error('Error sending email:', error.message);
  }
};
