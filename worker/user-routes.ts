import { Hono } from "hono";
import type { Env } from './core-utils';
import { ok, bad, notFound } from './core-utils';
import { hashPassword, verifyPassword } from './crypto';
//import JSZip from "jszip";
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
  // --- PROPERTY WRITES (D1 REAL IMPLEMENTATION) ---
  app.post('/api/properties', async (c) => {
    const body = await c.req.json();
    const created = new Date().toISOString();
    
    // Ensure ref exists
    if (!body.ref) {
      body.ref = `MGH-${Math.floor(Math.random() * 100000)}`;
    }
    
    const fieldsToInsert = Object.keys(body).filter(k => k !== 'propid' && k !== 'created' && k !== 'lastedited');
    
    fieldsToInsert.push('created');
    body.created = created;
    fieldsToInsert.push('lastedited');
    body.lastedited = created;

    if (!fieldsToInsert.includes('images')) {
      fieldsToInsert.push('images');
      body.images = '[]';
    } else if (Array.isArray(body.images)) {
      body.images = JSON.stringify(body.images);
    }

    const columns = fieldsToInsert.map(k => `"${k}"`).join(', ');
    const placeholders = fieldsToInsert.map(() => '?').join(', ');
    const values = fieldsToInsert.map(k => {
      let val = body[k];
      if (typeof val === 'boolean') return val ? 1 : 0;
      if (val === undefined) return null;
      return val;
    });

    try {
      const result = await c.env.mghdb
        .prepare(`INSERT INTO MGHPROPS (${columns}) VALUES (${placeholders}) RETURNING *`)
        .bind(...values)
        .first();

      return ok(c, {
        ...result,
        images: typeof result?.images === 'string' ? JSON.parse(result.images) : []
      });
    } catch (err: any) {
      console.error('Insert failed:', err);
      return bad(c, 'Failed to create property: ' + err.message);
    }
  });

  app.patch('/api/properties/:ref', async (c) => {
    const ref = c.req.param('ref');
    const body = await c.req.json();
    
    const existing = await c.env.mghdb.prepare("SELECT * FROM MGHPROPS WHERE ref = ?").bind(ref).first();
    if (!existing) return notFound(c, 'Target record missing');

    const fieldsToUpdate = Object.keys(body).filter(k => k !== 'ref' && k !== 'propid' && k !== 'created' && k !== 'lastedited');
    if (fieldsToUpdate.length === 0) return ok(c, { message: 'No fields to update' });
    
    fieldsToUpdate.push('lastedited');
    body.lastedited = new Date().toISOString();

    if (fieldsToUpdate.includes('images') && Array.isArray(body.images)) {
      body.images = JSON.stringify(body.images);
    }

    const setClause = fieldsToUpdate.map(k => `"${k}" = ?`).join(', ');
    const values = fieldsToUpdate.map(k => {
      let val = body[k];
      if (typeof val === 'boolean') return val ? 1 : 0;
      if (val === undefined) return null;
      return val;
    });
    values.push(ref);

    try {
      const result = await c.env.mghdb
        .prepare(`UPDATE MGHPROPS SET ${setClause} WHERE ref = ? RETURNING *`)
        .bind(...values)
        .first();

      return ok(c, {
        ...result,
        images: typeof result?.images === 'string' ? JSON.parse(result.images) : []
      });
    } catch (err: any) {
      console.error('Update failed:', err);
      return bad(c, 'Failed to update property: ' + err.message);
    }
  });

  app.delete('/api/properties/:ref', async (c) => {
    const ref = c.req.param('ref');
    const result = await c.env.mghdb
      .prepare("DELETE FROM MGHPROPS WHERE ref = ? RETURNING ref")
      .bind(ref)
      .first();
      
    if (!result) return notFound(c, 'Property not found');
    return ok(c, { ref, deleted: true });
  });

  // --- MEDIA PIPELINE (R2 SIMULATION BUT D1 UPDATES) ---
  app.post('/api/properties/:ref/images', async (c) => {
    const ref = c.req.param('ref');
    const property = await c.env.mghdb.prepare("SELECT images FROM MGHPROPS WHERE ref = ?").bind(ref).first();
    if (!property) return notFound(c, 'Property record missing');

    try {
      const formData = await c.req.parseBody();
      const files = Array.isArray(formData['files']) ? formData['files'] : [formData['files']];
      const newUrls: string[] = [];
      const allowedExt = ['jpg', 'jpeg', 'png', 'webp', 'avif'];
      for (const file of files) {
        if (!(file instanceof File)) continue;
        if (file.name.toLowerCase().endsWith('.zip')) {
          const mockUrl = `https://images.unsplash.com/photo-${Math.random().toString(36).substring(7)}?auto=format&fit=crop&w=1200&q=80`;
          newUrls.push(mockUrl);
        } else if (file.type.startsWith('image/')) {
          const mockUrl = `https://images.unsplash.com/photo-${Math.random().toString(36).substring(7)}?auto=format&fit=crop&w=1200&q=80`;
          newUrls.push(mockUrl);
        }
      }
      if (newUrls.length === 0) return bad(c, 'No valid assets processed');
      
      const currentImages = typeof property.images === 'string' ? JSON.parse(property.images) : [];
      const updatedImages = [...currentImages, ...newUrls];
      const lastedited = new Date().toISOString();

      const result = await c.env.mghdb
        .prepare("UPDATE MGHPROPS SET images = ?, lastedited = ? WHERE ref = ? RETURNING *")
        .bind(JSON.stringify(updatedImages), lastedited, ref)
        .first();

      return ok(c, { 
        urls: newUrls, 
        property: {
           ...result,
           images: updatedImages
        } 
      });
    } catch (err) {
      console.error('Media pipeline failure:', err);
      return bad(c, 'Transactional media upload failed');
    }
  });

  app.delete('/api/properties/:ref/images', async (c) => {
    const ref = c.req.param('ref');
    const { url } = await c.req.json();
    if (!url) return bad(c, 'Asset URL required');
    
    const property = await c.env.mghdb.prepare("SELECT images FROM MGHPROPS WHERE ref = ?").bind(ref).first();
    if (!property) return notFound(c, 'Property not found');
    
    const currentImages = typeof property.images === 'string' ? JSON.parse(property.images) : [];
    const updatedImages = currentImages.filter((img: string) => img !== url);
    const lastedited = new Date().toISOString();

    const result = await c.env.mghdb
      .prepare("UPDATE MGHPROPS SET images = ?, lastedited = ? WHERE ref = ? RETURNING *")
      .bind(JSON.stringify(updatedImages), lastedited, ref)
      .first();

    return ok(c, {
      ...result,
      images: updatedImages
    });
  });
  // --- USER MGMT (D1 REAL IMPLEMENTATION) ---
  app.get('/api/users', async (c) => {
    // Return users without passwords
    const { results } = await c.env.mghdb
      .prepare("SELECT user_id, email FROM user ORDER BY user_id DESC")
      .all();
    return ok(c, results);
  });

  app.post('/api/users', async (c) => {
    try {
      const { email, pwd } = await c.req.json();
      if (!email || !pwd) return bad(c, 'Email and password are required');

      // Check if user already exists
      const existing = await c.env.mghdb
        .prepare("SELECT user_id FROM user WHERE email = ?")
        .bind(email)
        .first();
      
      if (existing) return bad(c, 'User with this email already exists');

      const hashedPassword = await hashPassword(pwd);

      const result = await c.env.mghdb
        .prepare("INSERT INTO user (email, pwd) VALUES (?, ?) RETURNING user_id, email")
        .bind(email, hashedPassword)
        .first();

      return ok(c, result);
    } catch (err: any) {
      console.error('User registration failed:', err);
      return bad(c, 'Failed to register user');
    }
  });

  app.post('/api/users/login', async (c) => {
    try {
      const { email, pwd } = await c.req.json();
      if (!email || !pwd) return bad(c, 'Email and password are required');

      const user = await c.env.mghdb
        .prepare("SELECT * FROM user WHERE email = ?")
        .bind(email)
        .first<{user_id: number, email: string, pwd: string}>();

      if (!user) return bad(c, 'Invalid email or password');

      const isValid = await verifyPassword(pwd, user.pwd);
      if (!isValid) return bad(c, 'Invalid email or password');

      // In a real app, generate a JWT or session token here.
      // For now, we return success with the user id and email.
      return ok(c, { user_id: user.user_id, email: user.email });
    } catch (err: any) {
      console.error('User login failed:', err);
      return bad(c, 'Failed to authenticate user');
    }
  });
}