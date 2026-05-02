import { Hono } from "hono";
import type { Env } from './core-utils';
import { UserEntity, PropertyEntity } from "./entities";
import { ok, bad, notFound } from './core-utils';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // PROPERTIES
  app.get('/api/properties', async (c) => {
    await PropertyEntity.ensureSeed(c.env);
    const cq = c.req.query('cursor');
    const lq = c.req.query('limit');
    // Ensure properties are loaded and paged
    const page = await PropertyEntity.list(c.env, cq ?? null, lq ? Math.max(1, (Number(lq) | 0)) : 40);
    return ok(c, page);
  });
  app.get('/api/properties/:ref', async (c) => {
    const ref = c.req.param('ref');
    const entity = new PropertyEntity(c.env, ref);
    if (!await entity.exists()) return notFound(c, 'Property profile not found in MGH database');
    return ok(c, await entity.getState());
  });
  app.post('/api/properties', async (c) => {
    const body = await c.req.json();
    if (!body.ref || !body.title) return bad(c, 'Critical failure: Reference and Title are mandatory for indexing');
    // Check if ref exists (Simulating UNIQUE constraint)
    const entity = new PropertyEntity(c.env, body.ref);
    if (await entity.exists()) return bad(c, `Data collision: Property reference '${body.ref}' is already allocated`);
    const now = new Date().toISOString();
    // Construct full property object with defaults for missing fields
    const property = {
      ...PropertyEntity.initialState, // Start with defaults
      ...body,                       // Overlay payload
      id: crypto.randomUUID(),
      images: body.images || [],
      created: now,
      lastEdited: now,
      kdate: now
    };
    const saved = await PropertyEntity.create(c.env, property);
    return ok(c, saved);
  });
  app.patch('/api/properties/:ref', async (c) => {
    const ref = c.req.param('ref');
    const body = await c.req.json();
    const entity = new PropertyEntity(c.env, ref);
    if (!await entity.exists()) return notFound(c, 'Patch target not found');
    // Atomic update using mutate to ensure consistency for massive schema
    const updated = await entity.mutate(current => {
      return {
        ...current,
        ...body,
        lastEdited: new Date().toISOString()
      };
    });
    return ok(c, updated);
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