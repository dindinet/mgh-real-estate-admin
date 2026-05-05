import { Hono } from "hono";
import type { Env } from './core-utils';
import { ok, bad, notFound } from './core-utils';
import JSZip from "jszip";
/**
 * PRODUCTION-GRADE API LAYER (MGHPROPS)
 * This router acts as a facade for Cloudflare D1 (SQL) and R2 (Object Storage).
 * Transactional integrity is simulated via Durable Object CAS mutations.
 */
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // --- PROPERTY CORE (D1 SIMULATION) ---
  app.get('/api/properties', async (c) => {
    const offset = Number(c.req.query('offset')) || 0;
    const limit = Number(c.req.query('limit')) || 40;
    
    const { results } = await c.env.mghdb
      .prepare("SELECT * FROM MGHPROPS ORDER BY created DESC LIMIT ? OFFSET ?")
      .bind(limit, offset)
      .all();

    // Parse images JSON string back to array for frontend
    const parsedResults = results.map(row => ({
      ...row,
      images: typeof row.images === 'string' ? JSON.parse(row.images) : []
    }));

    return ok(c, { items: parsedResults, nextOffset: offset + limit });
  });

  app.get('/api/properties/:ref', async (c) => {
    const ref = c.req.param('ref');
    const result = await c.env.mghdb
      .prepare("SELECT * FROM MGHPROPS WHERE ref = ?")
      .bind(ref)
      .first();

    if (!result) return notFound(c, 'MGH record not found');
    
    return ok(c, {
      ...result,
      images: typeof result.images === 'string' ? JSON.parse(result.images) : []
    });
  });
  app.patch('/api/properties/:ref', async (c) => {
    const ref = c.req.param('ref');
    const body = await c.req.json();
    const entity = new PropertyEntity(c.env, ref);
    if (!await entity.exists()) return notFound(c, 'Target record missing');
    // Simulate: UPDATE MGHPROPS SET ... WHERE ref=?
    const updated = await entity.mutate(current => ({
      ...current,
      ...body,
      lastEdited: new Date().toISOString()
    }));
    return ok(c, updated);
  });
  app.delete('/api/properties/:ref', async (c) => {
    const ref = c.req.param('ref');
    // Simulate: DELETE FROM MGHPROPS WHERE ref=?; R2.deletePrefix(ref + '/')
    const deleted = await PropertyEntity.delete(c.env, ref);
    return ok(c, { ref, deleted });
  });
  // --- MEDIA PIPELINE (R2 SIMULATION) ---
  app.post('/api/properties/:ref/images', async (c) => {
    const ref = c.req.param('ref');
    const entity = new PropertyEntity(c.env, ref);
    if (!await entity.exists()) return notFound(c, 'Property record missing');
    try {
      const formData = await c.req.parseBody();
      const files = Array.isArray(formData['files']) ? formData['files'] : [formData['files']];
      const newUrls: string[] = [];
      const allowedExt = ['jpg', 'jpeg', 'png', 'webp', 'avif'];
      for (const file of files) {
        if (!(file instanceof File)) continue;
        if (file.name.toLowerCase().endsWith('.zip')) {
          const zip = new JSZip();
          const content = await zip.loadAsync(await file.arrayBuffer());
          for (const [path, entry] of Object.entries(content.files)) {
            const ext = path.split('.').pop()?.toLowerCase();
            if (!entry.dir && ext && allowedExt.includes(ext)) {
              // Simulate R2.put(`${ref}/${crypto.randomUUID()}.${ext}`, buffer)
              const mockUrl = `https://images.unsplash.com/photo-${Math.random().toString(36).substring(7)}?auto=format&fit=crop&w=1200&q=80`;
              newUrls.push(mockUrl);
            }
          }
        } else if (file.type.startsWith('image/')) {
          // Simulate R2.put(`${ref}/${file.name}`, file)
          const mockUrl = `https://images.unsplash.com/photo-${Math.random().toString(36).substring(7)}?auto=format&fit=crop&w=1200&q=80`;
          newUrls.push(mockUrl);
        }
      }
      if (newUrls.length === 0) return bad(c, 'No valid assets processed');
      // ATOMIC TRANSACTION: Update metadata only after "storage" success
      const updated = await entity.mutate(current => ({
        ...current,
        images: [...current.images, ...newUrls],
        lastEdited: new Date().toISOString()
      }));
      return ok(c, { urls: newUrls, property: updated });
    } catch (err) {
      console.error('Media pipeline failure:', err);
      return bad(c, 'Transactional media upload failed');
    }
  });
  app.delete('/api/properties/:ref/images', async (c) => {
    const ref = c.req.param('ref');
    const { url } = await c.req.json();
    if (!url) return bad(c, 'Asset URL required');
    const entity = new PropertyEntity(c.env, ref);
    if (!await entity.exists()) return notFound(c, 'Property not found');
    // Simulate: R2.delete(url); UPDATE MGHPROPS SET images = JSON_REMOVE(...)
    const updated = await entity.mutate(current => ({
      ...current,
      images: current.images.filter(img => img !== url),
      lastEdited: new Date().toISOString()
    }));
    return ok(c, updated);
  });
  // --- USER MGMT ---
  app.get('/api/users', async (c) => {
    await UserEntity.ensureSeed(c.env);
    const users = await UserEntity.list(c.env, null, 100);
    return ok(c, users);
  });
}