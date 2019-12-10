'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  // 链表查询 type: Schema.Types.ObjectId: 用户 id 标示 ，与用户关联
  const ArticleSchema = new Schema({
    __v: { type: Number, select: false },
    title: { type: String, required: true },
    article: { type: String, required: true },
    article_html: { type: String, required: true },
    views: { type: Number, required: false, default: 1 },
    // 作者 type: Schema.Types.ObjectId: 用户 id 标示 ，与用户关联
    author: {
      type: Schema.Types.ObjectId, ref: 'User', required: true,
    },
    like: { type: Number, required: false, default: 0 },
    dislike: { type: Number, required: false, default: 0 },
  }, { timestamps: true });
  return mongoose.model('Article', ArticleSchema);
};
