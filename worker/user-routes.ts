import { Hono } from "hono";
import type { Env } from './core-utils';
import { UserEntity, PropertyEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // PROPERTIES
  app.get('/api/properties', async (c) => {
    await PropertyEntity.ensureSeed(c.env);
    const cq = c.req.query('cursor');
    const lq = c.req.query('limit');
    const page = await PropertyEntity.list(c.env, cq ?? null, lq ? Math.max(1, (Number(lq) | 0)) : 20);
    return ok(c, page);
  });
  app.get('/api/properties/:ref', async (c) => {
    const ref = c.req.param('ref');
    const entity = new PropertyEntity(c.env, ref);
    if (!await entity.exists()) return notFound(c, 'Property not found');
    return ok(c, await entity.getState());
  });
  app.post('/api/properties', async (c) => {
    const body = await c.req.json();
    if (!body.ref || !body.title) return bad(c, 'Ref and Title required');
    const now = Date.now();
    const property = {
      ...body,
      id: crypto.randomUUID(),
      created: now,
      lastEdited: now
    };
    return ok(c, await PropertyEntity.create(c.env, property));
  });
  app.delete('/api/properties/:ref', async (c) => {
    const ref = c.req.param('ref');
    const deleted = await PropertyEntity.delete(c.env, ref);
    return ok(c, { ref, deleted });
  });
  // USERS
  app.get('/api/users', async (c) => {
    await UserEntity.ensureSeed(c.env);
    const cq = c.req.query('cursor');
    const lq = c.req.query('limit');
    const page = await UserEntity.list(c.env, cq ?? null, lq ? Math.max(1, (Number(lq) | 0)) : undefined);
    return ok(c, page);
  });
}