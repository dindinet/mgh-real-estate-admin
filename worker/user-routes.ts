import { Hono } from "hono";
import type { Env } from './core-utils';
import { UserEntity, PropertyEntity } from "./entities";
import { ok, bad, notFound } from './core-utils';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // PROPERTIES LIST & SEARCH
  app.get('/api/properties', async (c) => {
    await PropertyEntity.ensureSeed(c.env);
    const cq = c.req.query('cursor');
    const lq = c.req.query('limit');
    const page = await PropertyEntity.list(c.env, cq ?? null, lq ? Math.max(1, (Number(lq) | 0)) : 40);
    return ok(c, page);
  });
  // GET SINGLE PROPERTY
  app.get('/api/properties/:ref', async (c) => {
    const ref = c.req.param('ref');
    const entity = new PropertyEntity(c.env, ref);
    if (!await entity.exists()) return notFound(c, 'Property profile not found in MGH database');
    return ok(c, await entity.getState());
  });
  // CREATE PROPERTY
  app.post('/api/properties', async (c) => {
    const body = await c.req.json();
    if (!body.ref || !body.title) return bad(c, 'Reference and Title are mandatory');
    const entity = new PropertyEntity(c.env, body.ref);
    if (await entity.exists()) return bad(c, `Property reference '${body.ref}' is already allocated`);
    const now = new Date().toISOString();
    const property = {
      ...PropertyEntity.initialState,
      ...body,
      id: crypto.randomUUID(),
      images: body.images || [],
      created: now,
      lastEdited: now,
      kdate: now
    };
    const saved = await PropertyEntity.create(c.env, property);
    return ok(c, saved);
  });
  // UPDATE PROPERTY (PATCH)
  app.patch('/api/properties/:ref', async (c) => {
    const ref = c.req.param('ref');
    const body = await c.req.json();
    const entity = new PropertyEntity(c.env, ref);
    if (!await entity.exists()) return notFound(c, 'Patch target not found');
    const updated = await entity.mutate(current => ({
      ...current,
      ...body,
      lastEdited: new Date().toISOString()
    }));
    return ok(c, updated);
  });
  // IMAGE MANAGEMENT: UPLOAD (MULTIPART)
  app.post('/api/properties/:ref/images', async (c) => {
    const ref = c.req.param('ref');
    const entity = new PropertyEntity(c.env, ref);
    if (!await entity.exists()) return notFound(c, 'Property not found');
    const formData = await c.req.parseBody();
    const files = Array.isArray(formData['files']) ? formData['files'] : [formData['files']];
    const newImageUrls: string[] = [];
    for (const file of files) {
      if (file instanceof File) {
        // In a real R2 setup, you would use: await c.env.MY_BUCKET.put(`${ref}/${file.name}`, file.stream());
        // For this simulation, we generate a persistent mock URL.
        const mockUrl = `https://images.unsplash.com/photo-${Math.random().toString(36).substring(7)}?auto=format&fit=crop&w=1200&q=80`;
        newImageUrls.push(mockUrl);
      }
    }
    if (newImageUrls.length === 0) return bad(c, 'No valid images provided');
    const updated = await entity.mutate(current => ({
      ...current,
      images: [...current.images, ...newImageUrls],
      lastEdited: new Date().toISOString()
    }));
    return ok(c, { urls: newImageUrls, property: updated });
  });
  // IMAGE MANAGEMENT: DELETE SPECIFIC
  app.delete('/api/properties/:ref/images', async (c) => {
    const ref = c.req.param('ref');
    const { url } = await c.req.json();
    const entity = new PropertyEntity(c.env, ref);
    if (!await entity.exists()) return notFound(c, 'Property not found');
    if (!url) return bad(c, 'Image URL required for deletion');
    const updated = await entity.mutate(current => ({
      ...current,
      images: current.images.filter(img => img !== url),
      lastEdited: new Date().toISOString()
    }));
    return ok(c, updated);
  });
  // DELETE PROPERTY
  app.delete('/api/properties/:ref', async (c) => {
    const ref = c.req.param('ref');
    const deleted = await PropertyEntity.delete(c.env, ref);
    return ok(c, { ref, deleted });
  });
  // USERS LIST
  app.get('/api/users', async (c) => {
    await UserEntity.ensureSeed(c.env);
    const cq = c.req.query('cursor');
    const lq = c.req.query('limit');
    const page = await UserEntity.list(c.env, cq ?? null, lq ? Math.max(1, (Number(lq) | 0)) : undefined);
    return ok(c, page);
  });
}