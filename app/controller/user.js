'use strict';
const md5 = require('md5');
// const Controller = require('egg').Controller;
const BaseController = require('./base');

class UserController extends BaseController {
  // @测试
  async detail() {
    // 只有 token 怎么获取详情
    const { ctx } = this;
    // const user = await ctx.model.User.find();
    const user = await this.checkEmail(ctx.state.email);
    console.log('user detail', user);
    this.success(user);
  }
  async index() {
    const { ctx } = this;
    // const user = await ctx.model.User.find()
    ctx.body = '用户信息';
  }
  async checkEmail(email) {
    const user = await this.ctx.model.User.findOne({ email });
    return user;
  }
  async login() {
    // jwt
    const { ctx, app } = this;
    const { email, password } = ctx.request.body;
    // 查询用户是否存在
    // 先查用户名是否存在
    // 再查密码是否正确
    const user = await ctx.model.User.findOne({
      email,
      password: md5(password + 'ruixue@0702'),
    });
    if (user) {
      // 生成 token 返回
      const { nickname } = user;
      const token = app.jwt.sign({
        nickname,
        email,
        id: user._id,
      }, app.config.jwt.secret, {
        expiresIn: '24h',
      });
      this.success({ token, email });
    } else {
      this.error('用户名或者密码错误');
    }
  }
  async logout() {
    // const { ctx } = this;
    // console.log('egg logout');
    this.success('退出成功');
  }
  async create() {
    const { ctx } = this;
    const { email, password, emailcode, captcha, nickname } = ctx.request.body;
    console.log('emailcode', emailcode, 'ctx.session.emailcode', ctx.session.emailcode);
    if (emailcode === undefined || emailcode !== ctx.session.emailcode) {
      return this.error('邮箱验证码出错');
    }
    console.log('captcha', captcha, 'ctx.session.captcha', ctx.session.captcha);
    if (captcha !== ctx.session.captcha) {
      return this.error('图片验证码出错');
    }
    if (await this.checkEmail(email)) {
      return this.error('邮箱已经存在');
    }
    // solt 放在 config中
    const ret = await ctx.model.User.create({
      email,
      nickname,
      password: md5(password + 'ruixue@0702'),
    });
    if (ret._id) {
      this.success('注册成功');
    }
    // 数据校验
  }
  async captcha() {
    // 生成验证码，我们也需要service
    const { ctx } = this;
    const captcha = await this.service.tools.captcha();
    ctx.session.captcha = captcha.text;
    console.log('验证码' + captcha.text);
    ctx.response.type = 'image/svg+xml';
    ctx.body = captcha.data;
  }
  async email() {
    //   controller 写业务逻辑，通用的逻辑，抽象成service
    const { ctx } = this;
    const email = ctx.query.email;
    const code = Math.random().toString().slice(2, 6);
    console.log('邮件' + email + '验证码是' + code);
    const title = 'My first nuxt project 验证码';
    const html = `
        <h1>注册验证码<h1/>
        <div>
            <a href="https://kaikeba.com/">${code}</a>
        </div>
    `;
    const hasSend = this.service.tools.sendEmail(email, title, html);
    console.log(hasSend);
    if (hasSend) {
      ctx.session.emailcode = code;
      this.message('发送成功');
    } else {
      this.error('发送失败');
    }
  }
  demoinfo() {
    this.message('成功信息');
    // this.error('错误信息');
  }
  async isfollow() {
    const { ctx } = this;
    const me = await ctx.model.User.findById(ctx.state.userid);
    const isFollow = !!me.following.find(id => id.toString() === ctx.params.id);
    this.success({ isFollow });
  }
  async follow() {
    const { ctx } = this;
    const me = await ctx.model.User.findById(ctx.state.userid);
    const isFollow = !!me.following.find(id => id.toString() === ctx.params.id);
    if (!isFollow) {
      me.following.push(ctx.params.id);
      me.save();
      this.message('关注成功');
    }
  }
  async cancelFollow() {
    const { ctx } = this;
    const me = await ctx.model.User.findById(ctx.state.userid);
    // 把用户从我的following数组中删除掉
    const index = me.following.map(id => id.toString()).indexOf(ctx.params.id);
    if (index > -1) {
      me.following.splice(index, 1);
      me.save();
      this.message('取消关注成功');
    }
  }
  async following() {
    const { ctx } = this;
    const users = await ctx.model.User.findById(ctx.params.id).populate('following');
    this.success(users.following);
  }
  async followers() {
    const { ctx } = this;
    const users = await ctx.model.User.find({ following: ctx.params.id });
    console.log('followers', users);
    this.success(users);
  }
  async likeArticle() {
    const { ctx } = this;
    const me = await ctx.model.User.findById(ctx.state.userid);
    if (!me.likeArticle.find(id => id.toString() === ctx.params.id)) {
      me.likeArticle.push(ctx.params.id);
      me.save();
      await ctx.model.Article.findByIdAndUpdate(ctx.params.id, { $inc: { like: 1 } });
      return this.message('点赞成功');
    }
    this.message('已经赞过了');
  }
  async cancelLikeArticle() {
    const { ctx } = this;
    const me = await ctx.model.User.findById(ctx.state.userid);
    const index = me.likeArticle.map(id => id.toString()).indexOf(ctx.params.id);
    if (index > -1) {
      me.likeArticle.splice(index, 1);
      me.save();
      await ctx.model.Article.findByIdAndUpdate(ctx.params.id, { $inc: { like: -1 } });
      return this.message('取消成功');
    }
    this.message('已经取消了');
  }
  async dislikeArticle() {
    const { ctx } = this;
    const me = await ctx.model.User.findById(ctx.state.userid);
    if (!me.dislikeArticle.find(id => id.toString() === ctx.params.id)) {
      me.dislikeArticle.push(ctx.params.id);
      me.save();
      await ctx.model.Article.findByIdAndUpdate(ctx.params.id, { $inc: { dislike: 1 } });
      return this.message('成功踩');
    }
    this.message('已经踩过了');
  }
  async cancelDislikeArticle() {
    const { ctx } = this;
    const me = await ctx.model.User.findById(ctx.state.userid);
    const index = me.dislikeArticle.map(id => id.toString()).indexOf(ctx.params.id);
    if (index > -1) {
      me.dislikeArticle.splice(index, 1);
      me.save();
      await ctx.model.Article.findByIdAndUpdate(ctx.params.id, { $inc: { dislike: -1 } });
      return this.message('取消成功');
    }
    this.message('已经取消了');
  }
  async articleStatus() {
    const { ctx } = this;
    const me = await this.ctx.model.User.findById(ctx.state.userid);
    const like = !!me.likeArticle.find(id => id.toString() === ctx.params.id);
    const dislike = !!me.dislikeArticle.find(id => id.toString() === ctx.params.id);
    this.success({
      like, dislike,
    });
  }
}

module.exports = UserController;
