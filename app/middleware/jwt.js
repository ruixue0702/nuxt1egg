'use strict';
// 中间件
module.exports = ({ app }) => {
  return async function verify(ctx, next) {
    const authorization = ctx.request.header.authorization;
    if (authorization !== undefined) {
      try {
        const token = authorization.replace('Bearer', '');
        const ret = await app.jwt.verify(token, app.config.jwt.secret);
        console.log('中间件获取 token 信息', ret);
        ctx.state.email = ret.email;
        ctx.state.userid = ret.id;
        await next();
      } catch (err) {
        console.log('err', err);
        if (err.name === 'TokenExpiredError') {
          ctx.state.email = '';
          ctx.state.userid = '';
          return (ctx.body = {
            code: -666,
            message: 'token 过期，请登录',
          });
        }
      }
    } else {
      return (ctx.body = {
        code: -999,
        message: '请登录',
      });
    }
  };
};
