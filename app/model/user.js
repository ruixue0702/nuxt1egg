'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const UserSchema = new Schema({
    __v: { type: Number, select: false },
    email: { type: String, required: true },
    password: { type: String, required: true, select: false }, // 隐私字段 select: false
    nickname: { type: String, required: true },
    avatar: { type: String, required: false, default: '/user.png' },
    following: {
      type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    },
    likeArticle: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Article' }],
    },
    dislikeArticle: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Article' }],
    },

    // 关注的人，
    // 点赞文章
    // 点赞的答案

  }, { timestamps: true }); // timestamps: true 多两个字段 createTime updateTime
  // 数据模型
  // model文件夹 是数据表中每一条数据格式的定义
  return mongoose.model('User', UserSchema);
};
