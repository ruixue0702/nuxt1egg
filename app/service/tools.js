'use strict';
const Service = require('egg').Service;
const nodemailer = require('nodemailer');
const svgCaptcha = require('svg-captcha'); // svg-captcha

const userEmail = '502740847@qq.com';
const transporter = nodemailer.createTransport({
  service: 'qq',
  port: 465,
  secureConnetion: true,
  auth: {
    user: userEmail,
    pass: 'mugdxeaimyumcbaf', // 邮箱授权码
  },
});
class ToolsService extends Service {
  captcha() {
    const captcha = svgCaptcha.create({
      size: 4,
      fontSize: 50,
      width: 100,
      height: 40,
      background: '#DCDFE6',
    });
    return captcha;
  }
  async sendEmail(email, title, html) {
    const mailOptions = {
      from: userEmail,
      to: email,
      subject: title,
      text: '',
      html,
    };
    try {
      console.log('start send mail ');
      // console.log('transporter', transporter);
      // console.log('mailOptions', mailOptions);
      await transporter.sendMail(mailOptions);
      console.log(' send email success ');
      return true;
    } catch (err) {
      console.log('send email error ' + err);
      console.log(err);
      return false;
    }
  }
}
module.exports = ToolsService;
