"""
Seed the database with sample cases for development/demo.
Usage: cd backend && python ../scripts/seed_data.py
"""

import asyncio
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.db.postgres import AsyncSessionLocal, init_db
from app.services.auth_service import AuthService
from app.services.case_service import CaseService
from app.schemas.user import UserCreate
from app.schemas.case import CaseSubmit

SAMPLE_CASES = [
    {
        "title": "Criminal Complaint u/s 420 IPC — Cheating and Fraud",
        "jurisdiction": "Chief Metropolitan Magistrate, Delhi",
        "petitioner_name": "Ramesh Kumar",
        "respondent_name": "Suresh Sharma",
        "incident_date": "15 March 2023",
        "sections_alleged": "Section 420 IPC, Section 120B IPC",
        "case_description": (
            "The complainant Ramesh Kumar engaged the accused Suresh Sharma for construction of "
            "his residential property located at Plot No. 42, Sector 8, Rohini, New Delhi. "
            "The accused represented himself as a licensed contractor and collected a total sum "
            "of Rs. 8,50,000 from the complainant in multiple tranches between January and March "
            "2023 towards construction material and labour charges. Despite receiving the full "
            "payment, the accused did not commence any work at the site and has since switched "
            "off his mobile phone and absconded from his known address. The complainant lodged "
            "a complaint at Rohini Police Station on 20 March 2023 bearing FIR No. 145/2023 "
            "under Section 420 IPC but the police have not taken any effective action."
        ),
        "relief_sought": "Direct the accused to refund Rs. 8,50,000 with 18% interest and register a proper FIR.",
    },
    {
        "title": "Divorce Petition on Grounds of Cruelty and Desertion",
        "jurisdiction": "Family Court, Bengaluru",
        "petitioner_name": "Priya Mehta",
        "respondent_name": "Vikram Mehta",
        "incident_date": "1 January 2022",
        "sections_alleged": "Section 13(1)(ia) Hindu Marriage Act 1955, Section 13(1)(ib) HMA",
        "case_description": (
            "The petitioner Priya Mehta and respondent Vikram Mehta were married on "
            "10 May 2018 as per Hindu rites and customs in Bengaluru. The couple have no "
            "children from the said marriage. Since the beginning of the marriage the respondent "
            "subjected the petitioner to physical and mental cruelty including regular beatings, "
            "verbal abuse, and making unreasonable demands for additional dowry. The respondent "
            "also consumed alcohol excessively and behaved violently in an inebriated state. "
            "On 1 January 2022, the respondent permanently deserted the matrimonial home and "
            "has not returned or communicated since. The petitioner has been residing at her "
            "parental home since then."
        ),
        "relief_sought": "Grant a decree of divorce, permanent alimony of Rs. 25,000 per month, and litigation costs.",
    },
    {
        "title": "Writ Petition for Violation of Fundamental Rights — Illegal Detention",
        "jurisdiction": "High Court of Bombay",
        "petitioner_name": "Mohammed Iqbal",
        "respondent_name": "State of Maharashtra",
        "incident_date": "5 April 2024",
        "sections_alleged": "Article 21 Constitution of India, Article 22, Section 57 CrPC",
        "case_description": (
            "The petitioner Mohammed Iqbal, a 32-year-old software engineer, was arrested by "
            "the respondent's police officials on 5 April 2024 from his residence in Pune without "
            "any warrant or valid legal justification. He was detained at Shivaji Nagar Police "
            "Station for more than 72 hours without being produced before a Magistrate, in clear "
            "violation of Article 22(2) of the Constitution of India and Section 57 of the CrPC "
            "which mandate production within 24 hours. The petitioner was denied access to legal "
            "counsel and his family was not informed of the arrest. No FIR was registered against "
            "him nor were any charges communicated to him during the detention period."
        ),
        "relief_sought": "Issue writ of habeas corpus, order immediate release, award compensation of Rs. 2,00,000 for illegal detention.",
    },
]


async def seed():
    await init_db()
    async with AsyncSessionLocal() as db:
        # Create demo user
        auth_service = AuthService(db)
        try:
            user = await auth_service.register(UserCreate(
                email="demo@legaldraftai.com",
                username="demo_advocate",
                password="Demo@1234",
                full_name="Demo Advocate",
            ))
            print(f"Created demo user: {user.username} / Demo@1234")
        except Exception:
            from sqlalchemy import select
            from app.models.user import User
            result = await db.execute(select(User).where(User.username == "demo_advocate"))
            user = result.scalar_one()
            print(f"Demo user already exists: {user.username}")

        # Create sample cases (without full NLP processing for speed)
        case_service = CaseService(db)
        for c in SAMPLE_CASES:
            case = await case_service.create_case(CaseSubmit(**c), user)
            print(f"Created case: {case.id[:8]}... — {case.title[:50]}")

        print("\nSeed complete. Login with: demo_advocate / Demo@1234")


if __name__ == "__main__":
    asyncio.run(seed())
