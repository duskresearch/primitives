// www.primitiv.es → primitiv.es, keeping path and query. A separate Worker so the site's
// static files never need to run through one.
export default {
  fetch(request) {
    const url = new URL(request.url);
    url.protocol = 'https:';
    url.hostname = 'primitiv.es';
    return Response.redirect(url.href, 308);
  },
};
