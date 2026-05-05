import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import db from "../config/db.js";

const __filePath = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filePath);

async function runMigration() {
  const client = await db.pool.connect();

  try {
    console.log("🚀 Running database migration...");

    const schemaPath = path.join(__dirname, "schema.sql");
    const schemaFile = fs.readFileSync(schemaPath, "utf8");

    await client.query(schemaFile);

    console.log("✅ Database migration completed successfully!");
    console.log("Tables created:");
    schemaFile.split("\n").forEach((line) => {
      if (line.includes("CREATE TABLE IF NOT EXISTS")) {
        const table = line.slice(27).replace("(", "");
        console.log(`  -- ${table}`);
      }
    });
  } catch (error) {
    console.error("❌ Error running migration:", error);
    process.exit(1);
  } finally {
    client.release();
    await db.pool.end();
  }
}

runMigration();

// property_types query
// INSERT INTO property_types (key, type, description)
// VALUES
// -- 🏠 Residential
// ('house', 'House', 'A standalone residential home'),
// ('apartment', 'Apartment', 'A private unit within a building'),
// ('condo', 'Condominium', 'A privately owned unit in a complex'),
// ('townhouse', 'Townhouse', 'A multi-floor home sharing walls with others'),
// ('duplex', 'Duplex', 'A building divided into two separate homes'),

// -- 🏝️ Vacation & Luxury
// ('villa', 'Villa', 'A luxury residence, often with outdoor space'),
// ('cabin', 'Cabin', 'A rustic retreat, usually in nature'),
// ('cottage', 'Cottage', 'A small, cozy countryside home'),
// ('bungalow', 'Bungalow', 'A single-story house, often with a veranda'),
// ('chalet', 'Chalet', 'A wooden mountain home, often near ski resorts'),
// ('beach_house', 'Beach House', 'A home located near the beach'),

// -- 🏨 Hospitality
// ('hotel', 'Hotel', 'A professionally managed lodging with rooms'),
// ('boutique_hotel', 'Boutique Hotel', 'A small, stylish hotel with unique design'),
// ('hostel', 'Hostel', 'Budget-friendly shared accommodations'),
// ('guesthouse', 'Guesthouse', 'A small lodging, often owner-occupied'),
// ('bed_and_breakfast', 'Bed & Breakfast', 'Accommodation with breakfast included'),
// ('resort', 'Resort', 'A full-service property with amenities and activities'),

// -- 🏙️ Unique Stays
// ('loft', 'Loft', 'An open-plan living space, often industrial-style'),
// ('studio', 'Studio', 'A compact space combining living and sleeping areas'),
// ('tiny_home', 'Tiny Home', 'A very small, minimalist house'),
// ('treehouse', 'Treehouse', 'A structure built among trees'),
// ('boat', 'Boat', 'A stay on a boat or houseboat'),
// ('camper_rv', 'Camper / RV', 'A mobile home or recreational vehicle'),
// ('dome', 'Dome', 'A rounded structure, often eco-friendly'),
// ('farm_stay', 'Farm Stay', 'Accommodation on a working farm'),

// -- 🏢 Shared Spaces
// ('private_room', 'Private Room', 'A private room within a shared property'),
// ('shared_room', 'Shared Room', 'A shared sleeping space with others'),

// -- 🏕️ Outdoor
// ('campground', 'Campground', 'An outdoor area for camping'),
// ('glamping', 'Glamping', 'Luxury camping with amenities'),
// ('tent', 'Tent', 'A simple outdoor shelter for camping'),

// -- 🏢 Commercial / Extended Stay
// ('serviced_apartment', 'Serviced Apartment', 'Furnished apartment with hotel-like services'),
// ('aparthotel', 'Aparthotel', 'A hybrid of apartment and hotel');
