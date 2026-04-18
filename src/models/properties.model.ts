import db from "../config/db.js";
import {
  CreateProperty,
  Property,
  PropertyByHostPayload,
  PropertyWithRelations,
} from "../types/properties.types.js";

export default class PropertyModel {
  static async findById(id: string): Promise<Property> {
    const { rows } = await db.query(
      `
        SELECT *
        FROM properties
        WHERE id = $1
        `,
      [id]
    );
    return rows[0];
  }

  static async create(data: CreateProperty, hostId: string): Promise<Property> {
    const { propertyTypeId, name, description, guests, bedrooms, beds, bathrooms } = data;
    const { rows } = await db.query(
      `
        INSERT INTO properties (host_id, property_type_id, name, description, guests, bedrooms, beds, bathrooms)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
        `,
      [hostId, propertyTypeId, name, description, guests, bedrooms, beds, bathrooms]
    );

    return rows[0];
  }

  static async getProperty(id: string): Promise<PropertyWithRelations> {
    const { rows } = await db.query(
      `
        SELECT 
            p.*,
            pt.type,
            pr.rules,

            row_to_json(pl) AS location,
            row_to_json(pp) AS pricing,
            row_to_json(a) AS availability,
            row_to_json(pbs) AS booking_settings,

            COALESCE(pi.images, '[]') AS images,
            COALESCE(am.amenities,'[]') AS amenities

        FROM properties p
        LEFT JOIN property_types pt ON pt.id = p.property_type_id
        LEFT JOIN property_locations pl ON pl.property_id = p.id
        LEFT JOIN property_pricing pp ON pp.property_id = p.id
        LEFT JOIN availability a ON a.property_id = p.id
        LEFT JOIN property_booking_settings pbs ON pbs.property_id = p.id
        LEFT JOIN property_rules pr ON pr.property_id = p.id

        LEFT JOIN LATERAL (
            SELECT 
                JSON_AGG(
                    JSONB_BUILD_OBJECT(
                        'id', pi.id,
                        'url', pi.url,
                        'public_id', pi.public_id,
                        'is_cover', pi.is_cover
                    )
                ) FILTER (WHERE pi.id IS NOT NULL) AS images
            FROM property_images pi
            WHERE pi.property_id = p.id
        ) pi ON true

        LEFT JOIN LATERAL (
            SELECT 
                JSON_AGG(am.name) FILTER (WHERE am.id IS NOT NULL) AS amenities
            FROM property_amenities pa
            LEFT JOIN amenities am ON am.id = pa.amenity_id
            WHERE pa.property_id = p.id
        ) am ON true

        WHERE p.id = $1
        `,
      [id]
    );

    return rows[0];
  }

  static async getAllByHost({
    hostId,
    status = "all",
    createdAt,
    id,
    limit = 2,
    sort = "desc",
  }: PropertyByHostPayload): Promise<PropertyWithRelations[]> {
    const queryParams: any[] = [];
    let paramIndex = 1;

    const where: string[] = [];

    //  REQUIRED
    where.push(`p.host_id = $${paramIndex++}`);
    queryParams.push(hostId);

    // STATUS
    if (status !== "all") {
      where.push(`p.status = $${paramIndex++}`);
      queryParams.push(status);
    }

    // PAGINATION
    if (createdAt && id) {
      if (sort === "desc") {
        where.push(`
        (p.created_at, p.id) < ($${paramIndex}, $${paramIndex + 1})
      `);
      } else {
        where.push(`
        (p.created_at, p.id) > ($${paramIndex}, $${paramIndex + 1})
      `);
      }

      queryParams.push(createdAt, id);
      paramIndex += 2;
    }

    //  ORDER BY
    const orderBy = sort === "asc" ? "p.created_at ASC, p.id ASC" : "p.created_at DESC, p.id DESC";

    //  LIMIT
    queryParams.push(limit);
    const limitParam = `$${paramIndex++}`;

    const { rows } = await db.query(
      `
      SELECT
        p.*,
        pt.type,
        pr.rules,

        row_to_json(pl) AS location,
        row_to_json(pp) AS pricing,
        row_to_json(a) AS availability,
        row_to_json(pbs) AS booking_settings,

        COALESCE(pi.images, '[]') AS images,
        COALESCE(am.amenities, '[]') AS amenities

      FROM properties p
      LEFT JOIN property_types pt ON pt.id = p.property_type_id
      LEFT JOIN property_locations pl ON pl.property_id = p.id
      LEFT JOIN property_pricing pp ON pp.property_id = p.id
      LEFT JOIN availability a ON a.property_id = p.id
      LEFT JOIN property_booking_settings pbs ON pbs.property_id = p.id
      LEFT JOIN property_rules pr ON pr.property_id = p.id
      
      LEFT JOIN LATERAL (
        SELECT 
          JSON_AGG(
            JSONB_BUILD_OBJECT(
              'id', pi.id,
              'url', pi.url,
              'public_id', pi.public_id,
              'is_cover', pi.is_cover
            )
          ) FILTER (WHERE pi.id IS NOT NULL) AS images
        FROM property_images pi
        WHERE pi.property_id = p.id
      ) pi ON true

      LEFT JOIN LATERAL (
        SELECT 
          JSON_AGG(am.name) FILTER (WHERE am.id IS NOT NULL) AS amenities
        FROM property_amenities pa
        LEFT JOIN amenities am ON am.id = pa.amenity_id
        WHERE pa.property_id = p.id
      ) am ON true

      WHERE ${where.join(" AND ")}
      ORDER BY ${orderBy}
      LIMIT ${limitParam}
    
    `,
      queryParams
    );

    return rows;
  }
}
