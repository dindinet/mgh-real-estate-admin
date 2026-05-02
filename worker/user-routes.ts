import { Hono } from "hono";
import type { Env } from './core-utils';
import { UserEntity, PropertyEntity } from "./entities";
import { ok, bad, notFound } from './core-utils';
import JSZip from "jszip";
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
  // IMAGE MANAGEMENT: UPLOAD (MULTIPART + ZIP SUPPORT)
  app.post('/api/properties/:ref/images', async (c) => {
    const ref = c.req.param('ref');
    const entity = new PropertyEntity(c.env, ref);
    if (!await entity.exists()) return notFound(c, 'Property not found');
    const formData = await c.req.parseBody();
    const files = Array.isArray(formData['files']) ? formData['files'] : [formData['files']];
    const newImageUrls: string[] = [];
    const allowedExtensions = ['png', 'jpg', 'jpeg', 'webp', 'avif'];
    for (const file of files) {
      if (!(file instanceof File)) continue;
      if (file.name.toLowerCase().endsWith('.zip')) {
        try {
          const zip = new JSZip();
          const contents = await zip.loadAsync(await file.arrayBuffer());
          const entries = Object.keys(contents.files);
          for (const entryPath of entries) {
            const entry = contents.files[entryPath];
            const ext = entryPath.split('.').pop()?.toLowerCase();
            if (!entry.dir && ext && allowedExtensions.includes(ext)) {
              // Simulation: Generate mock URL for extracted image
              const mockUrl = `https://images.unsplash.com/photo-${Math.random().toString(36).substring(7)}?auto=format&fit=crop&w=1200&q=80`;
              newImageUrls.push(mockUrl);
            }
          }
        } catch (err) {
          console.error('ZIP processing error:', err);
        }
      } else if (file.type.startsWith('image/')) {
        const mockUrl = `https://images.unsplash.com/photo-${Math.random().toString(36).substring(7)}?auto=format&fit=crop&w=1200&q=80`;
        newImageUrls.push(mockUrl);
      }
    }
    if (newImageUrls.length === 0) return bad(c, 'No valid images or ZIP contents found');
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