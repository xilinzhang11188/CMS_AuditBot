"""
Database seeding script for CCM codes reference data.
Run this script to populate the database with initial CCM codes.

Usage:
    python -m app.seed_data
"""
import asyncio
import sys
from pathlib import Path

# Add parent directory to path to allow imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.database import mongodb
from app.config import settings


# CCM codes data from frontend/lib/data.js
CCM_CODES_DATA = [
    {
        "_id": "99490",
        "code": "99490",
        "description": "Chronic care management services, at least 20 minutes of clinical staff time directed by a physician or other qualified health care professional, per calendar month.",
        "timeRequirement": "20 minutes",
        "complexity": "Basic",
        "requirements": [
            "Multiple (two or more) chronic conditions expected to last at least 12 months, or until the death of the patient",
            "Chronic conditions place the patient at significant risk of death, acute exacerbation/decompensation, or functional decline",
            "Comprehensive care plan established, implemented, revised, or monitored",
            "At least 20 minutes of clinical staff time per calendar month"
        ]
    },
    {
        "_id": "99439",
        "code": "99439",
        "description": "Each additional 20 minutes of clinical staff time directed by a physician or other qualified health care professional, per calendar month.",
        "timeRequirement": "+20 minutes",
        "complexity": "Add-on",
        "requirements": [
            "Must be billed in conjunction with 99490",
            "At least 20 additional minutes of clinical staff time"
        ]
    },
    {
        "_id": "99491",
        "code": "99491",
        "description": "Chronic care management services, provided personally by a physician or other qualified health care professional, at least 30 minutes of physician or other qualified health care professional time, per calendar month.",
        "timeRequirement": "30 minutes (Physician)",
        "complexity": "Physician-Driven",
        "requirements": [
            "Provided personally by a physician or other qualified health care professional",
            "At least 30 minutes of time per calendar month",
            "Multiple (two or more) chronic conditions",
            "Comprehensive care plan established, implemented, revised, or monitored"
        ]
    },
    {
        "_id": "99437",
        "code": "99437",
        "description": "Each additional 30 minutes by a physician or other qualified health care professional, per calendar month.",
        "timeRequirement": "+30 minutes (Physician)",
        "complexity": "Add-on",
        "requirements": [
            "Must be billed in conjunction with 99491",
            "At least 30 additional minutes of physician time"
        ]
    },
    {
        "_id": "99487",
        "code": "99487",
        "description": "Complex chronic care management services, with the following required elements: multiple (two or more) chronic conditions expected to last at least 12 months, or until the death of the patient, chronic conditions place the patient at significant risk of death, acute exacerbation/decompensation, or functional decline, establishment or substantial revision of a comprehensive care plan, moderate or high complexity medical decision making; 60 minutes of clinical staff time directed by a physician or other qualified health care professional, per calendar month.",
        "timeRequirement": "60 minutes",
        "complexity": "Complex",
        "requirements": [
            "Multiple (two or more) chronic conditions",
            "Moderate or high complexity medical decision making",
            "Establishment or substantial revision of a comprehensive care plan",
            "At least 60 minutes of clinical staff time"
        ]
    },
    {
        "_id": "99489",
        "code": "99489",
        "description": "Each additional 30 minutes of clinical staff time directed by a physician or other qualified health care professional, per calendar month.",
        "timeRequirement": "+30 minutes",
        "complexity": "Complex Add-on",
        "requirements": [
            "Must be billed in conjunction with 99487",
            "At least 30 additional minutes of clinical staff time"
        ]
    }
]


async def seed_ccm_codes():
    """
    Seed the database with CCM codes.
    This function is idempotent - it will only insert codes that don't already exist.
    """
    try:
        # Connect to database
        await mongodb.connect()
        print(f"Connected to MongoDB: {settings.MONGODB_DB_NAME}")
        
        # Get ccm_codes collection
        ccm_codes_collection = mongodb.get_collection("ccm_codes")
        
        # Check existing codes
        existing_codes = await ccm_codes_collection.count_documents({})
        print(f"Found {existing_codes} existing CCM codes in database")
        
        if existing_codes >= 6:
            print("✓ Database already contains CCM codes. Skipping seed.")
            return
        
        # Insert codes (only if they don't exist)
        inserted_count = 0
        for code_data in CCM_CODES_DATA:
            existing = await ccm_codes_collection.find_one({"_id": code_data["_id"]})
            if not existing:
                await ccm_codes_collection.insert_one(code_data)
                inserted_count += 1
                print(f"✓ Inserted CCM code: {code_data['code']} - {code_data['complexity']}")
            else:
                print(f"- Skipped CCM code {code_data['code']} (already exists)")
        
        print(f"\n✓ Seed completed successfully!")
        print(f"  - Inserted: {inserted_count} new codes")
        print(f"  - Total codes in database: {await ccm_codes_collection.count_documents({})}")
        
    except Exception as e:
        print(f"✗ Error seeding database: {e}")
        raise
    finally:
        # Disconnect from database
        await mongodb.disconnect()
        print("Disconnected from MongoDB")


async def verify_seed():
    """Verify that all CCM codes are in the database."""
    try:
        await mongodb.connect()
        ccm_codes_collection = mongodb.get_collection("ccm_codes")
        
        print("\n=== Verifying CCM Codes ===")
        codes = await ccm_codes_collection.find({}).to_list(length=10)
        
        if len(codes) == 6:
            print(f"✓ All 6 CCM codes found in database:")
            for code in codes:
                print(f"  - {code['code']}: {code['complexity']} ({code['timeRequirement']})")
        else:
            print(f"✗ Expected 6 codes, found {len(codes)}")
        
        await mongodb.disconnect()
        
    except Exception as e:
        print(f"✗ Error verifying seed: {e}")
        raise


if __name__ == "__main__":
    print("=== CCM Codes Seed Script ===\n")
    
    # Run seed
    asyncio.run(seed_ccm_codes())
    
    # Verify seed
    asyncio.run(verify_seed())
    
    print("\n=== Seed script completed ===")