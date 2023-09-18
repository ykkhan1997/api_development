const nodemailer=require("nodemailer");
const sendEmail=async(options)=>{
    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: 'adriana63@ethereal.email',
            pass: 'RPr1fQaGRZVSQgQHq7'
        }
    });
    //2 Define the email options
    const mailOptions={
        from :"Yasir Saeed <hello@abc.com",
        to:options.email,
        subject:options.subject,
        text:options.message
    }
    await transporter.sendMail(mailOptions);

    //3 Active Send mail
}
module.exports=sendEmail;