import db from "../config/db.js";
import {
  Amenity,
  CreatePropertyInput,
  multerFile,
  Property,
  PropertyBookingSettings,
  PropertyByHostPayload,
  PropertyImage,
  PropertyLocation,
  PropertyPricing,
  PropertyRules,
  PropertyType,
  PropertyWithRelations,
  UpdateAmenityInput,
  UpdateBookingSettingsInput,
  UpdateLocationInput,
  UpdatePricingInput,
  UpdatePropertyInput,
  UpdateRulesInput,
} from "../types/properties.types.js";
import camelcaseKeys from "camelcase-keys";

export default class PropertyModel {
  static async create(data: CreatePropertyInput, hostId: string): Promise<Property> {
    const {
      propertyTypeId,
      title,
      description,
      maxAdults,
      maxChildren,
      maxInfants,
      maxPets,
      bedrooms,
      beds,
      bathrooms,
    } = data;
    const { rows } = await db.query(
      `
        INSERT INTO properties (host_id, property_type_id, title, description, max_adults, max_children, max_infants, max_pets, bedrooms, beds, bathrooms)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
        `,
      [
        hostId,
        propertyTypeId,
        title,
        description,
        maxAdults,
        maxChildren,
        maxInfants,
        maxPets,
        bedrooms,
        beds,
        bathrooms,
      ]
    );

    return camelcaseKeys(rows[0]);
  }

  static async update(data: UpdatePropertyInput, id: string): Promise<Property> {
    const {
      propertyTypeId,
      title,
      description,
      maxAdults,
      maxChildren,
      maxInfants,
      maxPets,
      bedrooms,
      beds,
      bathrooms,
    } = data;

    const { rows } = await db.query(
      `
        UPDATE properties
        SET property_type_id = $1, 
            title = $2, 
            description = $3, 
            max_adults = $4, 
            max_children = $5, 
            max_infants = $6, 
            max_pets = $7, 
            bedrooms = $5, 
            beds = $6, 
            bathrooms = $7
        WHERE id = $8
        RETURNING *
        `,
      [
        propertyTypeId,
        title,
        description,
        maxAdults,
        maxChildren,
        maxInfants,
        maxPets,
        bedrooms,
        beds,
        bathrooms,
        id,
      ]
    );

    return rows[0];
  }

  static async updateLocation(data: UpdateLocationInput, id: string): Promise<PropertyLocation> {
    const { street, city, region, country, postcode, latitude, longitude } = data;
    const { rows } = await db.query(
      `
        INSERT INTO property_locations (property_id, street, city, region, country, post_code, latitude, longitude)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (property_id)
        DO UPDATE SET 
                  street = EXCLUDED.street,
                  city = EXCLUDED.city,
                  region = EXCLUDED.region,
                  country = EXCLUDED.country,
                  post_code = EXCLUDED.post_code,
                  latitude = EXCLUDED.latitude,
                  longitude = EXCLUDED.longitude
        RETURNING *
        `,
      [id, street, city, region, country, postcode, latitude, longitude]
    );

    return camelcaseKeys(rows[0]);
  }

  static async updateAmenities(
    amenityIds: UpdateAmenityInput["amenityIds"],
    id: string
  ): Promise<any> {
    const { rows } = await db.query(
      `
    WITH property_amenities AS (
      INSERT INTO property_amenities (property_id, amenity_id)
      SELECT $1, UNNEST($2::uuid[])
      ON CONFLICT DO NOTHING
      RETURNING *
    )
    
    SELECT * 
    FROM amenities
    WHERE id IN (SELECT amenity_id FROM property_amenities WHERE property_id = $1)
  `,
      [id, amenityIds]
    );

    return camelcaseKeys(rows);
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

    return camelcaseKeys(rows[0]);
  }

  static async updateBookingSettings(
    data: UpdateBookingSettingsInput,
    id: string
  ): Promise<PropertyBookingSettings> {
    const { instantBook, checkInTime, checkOutTime, minNights, maxNights } = data;
    const { rows } = await db.query(
      `
        INSERT INTO property_booking_settings (property_id, instant_book, check_in_time, check_out_time, min_nights, max_nights)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (property_id)
        DO UPDATE SET 
                  check_in_time = EXCLUDED.check_in_time,
                  check_out_time = EXCLUDED.check_out_time,
                  min_nights = EXCLUDED.min_nights,
                  max_nights = EXCLUDED.max_nights
        RETURNING *
        `,
      [id, instantBook, checkInTime, checkOutTime, minNights, maxNights]
    );

    return camelcaseKeys(rows[0]);
  }

  static async updateRules(data: UpdateRulesInput, id: string): Promise<PropertyRules> {
    const { rules } = data;
    const { rows } = await db.query(
      `
        INSERT INTO property_rules (property_id, rules)
        VALUES ($1, $2)
        ON CONFLICT (property_id)
        DO UPDATE SET 
                  rules = EXCLUDED.rules
        RETURNING *
        `,
      [id, rules]
    );

    return rows[0];
  }

  static async updateImages(
    images: Omit<PropertyImage, "id">[],
    propertyId: string
  ): Promise<PropertyImage[]> {
    const values = images.map((image) => [propertyId, image.url, image.publicId, image.isCover]);

    const placeholders = values
      .map(
        (_, index) => `($${index * 4 + 1}, $${index * 4 + 2}, $${index * 4 + 3}, $${index * 4 + 4})`
      )
      .join(", ");

    const flattenedValues = values.flat();

    const { rows } = await db.query(
      `
        INSERT INTO property_images (property_id, url, public_id, is_cover)
        VALUES ${placeholders}
        ON CONFLICT DO NOTHING
        RETURNING id, url, public_id, is_cover
        `,
      flattenedValues
    );

    return camelcaseKeys(rows);
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
                JSON_AGG(
                    JSONB_BUILD_OBJECT(
                        'id', am.id,
                        'name', am.name,
                        'key', am.key,
                        'category', am.category
                    )
                ) FILTER (WHERE am.id IS NOT NULL) AS amenities
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
          JSON_AGG(
              JSONB_BUILD_OBJECT(
                  'id', am.id,
                  'name', am.name,
                  'key', am.key,
                  'category', am.category
              )
          ) FILTER (WHERE am.id IS NOT NULL) AS amenities
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

    return camelcaseKeys(rows);
  }

  static async findPropertiesTypes(): Promise<PropertyType[]> {
    const { rows } = await db.query(
      `
    SELECT 
      id,
      key,
      type,
      description
    FROM property_types
    ORDER BY type ASC
  `,
      []
    );
    return rows;
  }

  static async findAmenities(): Promise<Amenity[]> {
    const { rows } = await db.query(
      `
    SELECT *
    FROM amenities
    ORDER BY category ASC
  `,
      []
    );
    return rows;
  }
}
