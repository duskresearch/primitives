// design.primitiv.es → primitiv.es, keeping path and query. The apex serves the only field
// until a second one ships (FIELDS.md); then the design site moves here and the apex redirects
// to it instead. So this redirect is temporary (307), never permanent: browsers cache a 308
// for good, and a cached design → apex hop would loop once the direction flips.
export default {
  fetch(request) {
    const url = new URL(request.url);
    url.protocol = 'https:';
    url.hostname = 'primitiv.es';
    return Response.redirect(url.href, 307);
  },
};
