// Routing by host, prepared: every request learns its field from its host. With one field
// served, every host resolves to design and nothing branches on it yet.
import { defineMiddleware } from 'astro:middleware';
import { fieldForHost } from '@/lib/fields';

export const onRequest = defineMiddleware((context, next) => {
  context.locals.field = fieldForHost(context.url.hostname);
  return next();
});
