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

// Amenities
// INSERT INTO amenities (name, key, category)
// VALUES

// -- Essentials
// ('WiFi', 'wifi', 'essentials'),
// ('Air Conditioning', 'air_conditioning', 'essentials'),
// ('Heating', 'heating', 'essentials'),
// ('Hot Water', 'hot_water', 'essentials'),
// ('Electric Fan', 'fan', 'essentials'),
// ('Dedicated Workspace', 'workspace', 'essentials'),
// ('Iron', 'iron', 'essentials'),
// ('Washer', 'washer', 'essentials'),
// ('Dryer', 'dryer', 'essentials'),
// ('Clothes Rack', 'clothes_rack', 'essentials'),
// ('Extra Pillows and Blankets', 'extra_bedding', 'essentials'),
// ('Wardrobe', 'wardrobe', 'essentials'),
// ('Hangers', 'hangers', 'essentials'),
// ('Room Darkening Shades', 'blackout_curtains', 'essentials'),

// -- Bathroom
// ('Private Bathroom', 'private_bathroom', 'bathroom'),
// ('Bathtub', 'bathtub', 'bathroom'),
// ('Shower', 'shower', 'bathroom'),
// ('Bidet', 'bidet', 'bathroom'),
// ('Hair Dryer', 'hair_dryer', 'bathroom'),
// ('Toiletries', 'toiletries', 'bathroom'),
// ('Towels', 'towels', 'bathroom'),

// -- Kitchen & Dining
// ('Kitchen', 'kitchen', 'kitchen'),
// ('Refrigerator', 'refrigerator', 'kitchen'),
// ('Microwave', 'microwave', 'kitchen'),
// ('Oven', 'oven', 'kitchen'),
// ('Stove', 'stove', 'kitchen'),
// ('Rice Cooker', 'rice_cooker', 'kitchen'),
// ('Coffee Maker', 'coffee_maker', 'kitchen'),
// ('Electric Kettle', 'electric_kettle', 'kitchen'),
// ('Dishwasher', 'dishwasher', 'kitchen'),
// ('Cooking Basics', 'cooking_basics', 'kitchen'),
// ('Dining Table', 'dining_table', 'kitchen'),
// ('Dishes and Silverware', 'dishes_and_silverware', 'kitchen'),

// -- Entertainment
// ('TV', 'tv', 'entertainment'),
// ('Smart TV', 'smart_tv', 'entertainment'),
// ('Netflix', 'netflix', 'entertainment'),
// ('Cable TV', 'cable_tv', 'entertainment'),
// ('Sound System', 'sound_system', 'entertainment'),
// ('Game Console', 'game_console', 'entertainment'),
// ('Books and Reading Material', 'books', 'entertainment'),

// -- Safety
// ('Smoke Alarm', 'smoke_alarm', 'safety'),
// ('Carbon Monoxide Alarm', 'carbon_monoxide_alarm', 'safety'),
// ('Fire Extinguisher', 'fire_extinguisher', 'safety'),
// ('First Aid Kit', 'first_aid_kit', 'safety'),
// ('Security Cameras', 'security_cameras', 'safety'),
// ('24/7 Security', 'security_24_7', 'safety'),
// ('Safe', 'safe', 'safety'),

// -- Internet & Office
// ('Fast WiFi', 'fast_wifi', 'internet_office'),
// ('Printer', 'printer', 'internet_office'),
// ('Ethernet Connection', 'ethernet', 'internet_office'),

// -- Outdoor
// ('Balcony', 'balcony', 'outdoor'),
// ('Patio', 'patio', 'outdoor'),
// ('Garden', 'garden', 'outdoor'),
// ('Outdoor Dining Area', 'outdoor_dining', 'outdoor'),
// ('BBQ Grill', 'bbq_grill', 'outdoor'),
// ('Beach Access', 'beach_access', 'outdoor'),
// ('Lake Access', 'lake_access', 'outdoor'),

// -- Parking & Facilities
// ('Free Parking', 'free_parking', 'facilities'),
// ('Paid Parking', 'paid_parking', 'facilities'),
// ('Elevator', 'elevator', 'facilities'),
// ('Gym', 'gym', 'facilities'),
// ('Swimming Pool', 'pool', 'facilities'),
// ('Hot Tub', 'hot_tub', 'facilities'),
// ('Sauna', 'sauna', 'facilities'),

// -- Family
// ('Crib', 'crib', 'family'),
// ('High Chair', 'high_chair', 'family'),
// ('Children Toys', 'children_toys', 'family'),
// ('Baby Bath', 'baby_bath', 'family'),

// -- Accessibility
// ('Wheelchair Accessible', 'wheelchair_accessible', 'accessibility'),
// ('Step-Free Access', 'step_free_access', 'accessibility'),
// ('Wide Doorway', 'wide_doorway', 'accessibility'),

// -- Services
// ('Breakfast Included', 'breakfast', 'services'),
// ('Cleaning Available', 'cleaning_service', 'services'),
// ('Self Check-in', 'self_check_in', 'services'),
// ('Luggage Drop-off Allowed', 'luggage_dropoff', 'services'),

// -- Pet
// ('Pets Allowed', 'pets_allowed', 'pet'),
// ('Pet Friendly', 'pet_friendly', 'pet'),

// -- Rules / Special
// ('Smoking Allowed', 'smoking_allowed', 'rules'),
// ('Events Allowed', 'events_allowed', 'rules');
