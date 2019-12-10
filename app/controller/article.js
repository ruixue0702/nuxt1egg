'use strict';
const BaseController = require('./base');
const marked = require('marked');
class ArticleController extends BaseController {
  async index() {
    const { ctx } = this;
    // .populate('author') 链表查询出author字段 在 User 数据表中对应id的具体数据
    const articles = await ctx.model.Article.find().populate('author');
    this.success(articles);
  }
  async detail() {
    // 访问量统计
    const { ctx } = this;
    const { id } = ctx.params;
    const article = await ctx.model.Article.findOneAndUpdate({ _id: id }, { $inc: { views: 1 } }).populate('author');
    this.success(article);
  }
  async create() {
    const { ctx } = this;
    const { userid } = ctx.state;
    const { content } = ctx.request.body;
    const title = content.split('\n').find(v => {
      return v.indexOf('# ') === 0;
    });
    const obj = {
      title: title.replace('# ', ''),
      article: content, // 给内部编辑时看
      article_html: marked(content), // 给外部显示时看
      author: userid,
    };
    console.log('article.create', obj);
    const ret = await ctx.model.Article.create(obj);
    if (ret._id) {
      this.success({
        id: ret._id,
        title: ret.title,
      });
    } else {
      this.error('创建失败');
    }
  }
}

module.exports = ArticleController;
