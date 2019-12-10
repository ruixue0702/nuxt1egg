'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  const jwt = app.middleware.jwt({ app });
  router.get('/', controller.home.index);
  router.get('/userinfo', controller.user.index);
  router.get('/demoinfo', controller.user.demoinfo);
  router.get('/user/sendcode', controller.user.email);
  router.get('/user/captcha', controller.user.captcha);
  router.post('/user/register', controller.user.create);
  router.post('/user/login', controller.user.login);
  router.post('/user/logout', jwt, controller.user.logout);

  // 中间件
  router.get('/user/detail', jwt, controller.user.detail);

  const { isfollow, follow, cancelFollow, following, followers, likeArticle, cancelLikeArticle, dislikeArticle, cancelDislikeArticle, articleStatus } = controller.user;
  router.get('/user/:id/following', following);
  router.get('/user/:id/followers', followers);

  // restful 修改数据put 删除数据delete

  router.get('/user/article/:id', jwt, articleStatus);
  router.put('/user/likeArticle/:id', jwt, likeArticle);
  router.delete('/user/likeArticle/:id', jwt, cancelLikeArticle);
  router.put('/user/dislikeArticle/:id', jwt, dislikeArticle);
  router.delete('/user/dislikeArticle/:id', jwt, cancelDislikeArticle);

  router.get('/user/follow/:id', jwt, isfollow);
  router.put('/user/follow/:id', jwt, follow);
  router.delete('/user/follow/:id', jwt, cancelFollow);

  router.get('/article', controller.article.index);
  router.get('/article/:id', controller.article.detail);
  router.post('/article/create', jwt, controller.article.create);


};
