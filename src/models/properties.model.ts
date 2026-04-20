import db from "../config/db.js";
import {
  CreatePropertyInput,
  Property,
  PropertyByHostPayload,
  PropertyLocation,
  PropertyPricing,
  PropertyWithRelations,
  UpdateLocationInput,
  UpdatePricingInput,
  UpdatePropertyInput,
} from "../types/properties.types.js";

export default class PropertyModel {
  static async create(data: CreatePropertyInput, hostId: string): Promise<Property> {
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

  static async update(data: UpdatePropertyInput, id: string): Promise<Property> {
    const { propertyTypeId, name, description, guests, bedrooms, beds, bathrooms } = data;

    const { rows } = await db.query(
      `
        UPDATE properties
        SET property_type_id = $1, name = $2, description = $3, guests = $4, bedrooms = $5, beds = $6, bathrooms = $7
        WHERE id = $8
        RETURNING *
        `,
      [propertyTypeId, name, description, guests, bedrooms, beds, bathrooms, id]
    );

    return rows[0];
  }

  static async updateLocation(data: UpdateLocationInput, id: string): Promise<PropertyLocation> {
    const { address, city, state, country, latitude, longitude } = data;
    const { rows } = await db.query(
      `
        INSERT INTO property_locations (property_id, address, city, state, country, latitude, longitude)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (property_id)
        DO UPDATE SET 
                  address = EXCLUDED.address,
                  city = EXCLUDED.city,
                  state = EXCLUDED.state,
                  country = EXCLUDED.country,
                  latitude = EXCLUDED.latitude,
                  longitude = EXCLUDED.longitude
        RETURNING *
        `,
      [id, address, city, state, country, latitude, longitude]
    );
    console.log(rows);
    return rows[0];
  }

  static async updatePricing(data: UpdatePricingInput, id: string): Promise<PropertyPricing> {
    const { basePrice, cleaningFee, weeklyDiscount, monthlyDiscount } = data;
    const { rows } = await db.query(
      `
        INSERT INTO property_pricing (property_id, base_price, cleaning_fee, weekly_discount, monthly_discount)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (property_id)
        DO UPDATE SET 
                  base_price = EXCLUDED.base_price,
                  cleaning_fee = EXCLUDED.cleaning_fee,
                  weekly_discount = EXCLUDED.weekly_discount,
                  monthly_discount = EXCLUDED.monthly_discount
        RETURNING *
        `,
      [id, basePrice, cleaningFee, weeklyDiscount, monthlyDiscount]
    );

    return rows[0];
  }

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
