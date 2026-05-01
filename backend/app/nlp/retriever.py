"""
RAG Retriever — stores Indian legal documents in ChromaDB
and retrieves relevant precedents for draft generation.
"""

import logging
import os
from typing import List, Dict, Optional
try:
    import chromadb
    from chromadb.config import Settings
except ImportError:
    chromadb = None

try:
    from sentence_transformers import SentenceTransformer
except ImportError:
    SentenceTransformer = None


logger = logging.getLogger(__name__)

CHROMA_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "chroma_db")

# Sample Indian legal judgements — used to seed the vector DB on first run
SAMPLE_LEGAL_DOCUMENTS = [
    {
        "id": "doc_001",
        "text": """IN THE SUPREME COURT OF INDIA
State of Maharashtra v. Mayer Hans George (1965)
The accused was charged under Section 420 IPC for cheating and fraud.
The court held that for an offence under Section 420 IPC, the prosecution
must establish: (1) the accused made a false representation; (2) he knew
it to be false; (3) the complainant was induced to deliver property;
(4) the accused intended to deceive from the beginning.
The court awarded imprisonment and directed restitution of the amount defrauded.
Sections cited: Section 420 IPC, Section 415 IPC.""",
        "case_type": "Criminal",
        "topic": "cheating fraud section 420"
    },
    {
        "id": "doc_002",
        "text": """IN THE HIGH COURT OF DELHI
Ramesh Kumar v. Suresh Sharma (2019)
Criminal complaint for cheating under Section 420 IPC.
The complainant engaged the accused as a contractor for construction work.
The accused received Rs. 12,00,000 and failed to perform the agreed work.
The court directed filing of FIR and arrest of accused.
Held: Taking money under false pretences and absconding constitutes cheating.
The accused was ordered to refund the entire amount with 12% interest.
Sections cited: Section 420 IPC, Section 406 IPC (criminal breach of trust).""",
        "case_type": "Criminal",
        "topic": "cheating contractor money fraud construction"
    },
    {
        "id": "doc_003",
        "text": """IN THE FAMILY COURT OF BENGALURU
Priya v. Vikram (2020)
Petition for divorce on grounds of cruelty under Section 13(1)(ia) HMA.
The petitioner alleged physical and mental cruelty by the respondent husband.
The court held that repeated acts of physical violence and mental harassment
constitute cruelty within the meaning of Section 13(1)(ia) of the Hindu
Marriage Act 1955. Divorce was granted along with permanent alimony of
Rs. 20,000 per month and custody of the minor child to the petitioner.
Sections cited: Section 13(1)(ia) HMA, Section 125 CrPC.""",
        "case_type": "Family Law",
        "topic": "divorce cruelty alimony custody hindu marriage act"
    },
    {
        "id": "doc_004",
        "text": """IN THE HIGH COURT OF BOMBAY
Mohammed Iqbal v. State of Maharashtra (2021)
Writ petition under Article 226 for illegal detention.
The petitioner was detained for over 72 hours without being produced
before a Magistrate, in violation of Article 22(2) of the Constitution
and Section 57 CrPC. The court held that any detention beyond 24 hours
without production before a Magistrate is unconstitutional.
Writ of habeas corpus issued. Compensation of Rs. 1,00,000 awarded.
The court reiterated that right to personal liberty under Article 21
cannot be curtailed except by procedure established by law.
Sections cited: Article 21, Article 22, Section 57 CrPC.""",
        "case_type": "Constitutional",
        "topic": "habeas corpus illegal detention fundamental rights article 21"
    },
    {
        "id": "doc_005",
        "text": """IN THE LABOUR COURT OF CHENNAI
Rajan v. ABC Pvt Ltd (2022)
Petition for reinstatement after wrongful termination.
The workman was terminated without following the procedure under
Section 25F of the Industrial Disputes Act 1947.
The court held that termination without notice and retrenchment
compensation is illegal and void ab initio.
The workman was reinstated with full back wages from the date of termination.
Sections cited: Section 25F IDA, Section 25G IDA.""",
        "case_type": "Labour / Employment",
        "topic": "wrongful termination reinstatement back wages industrial disputes"
    },
    {
        "id": "doc_006",
        "text": """IN THE CIVIL COURT OF MUMBAI
XYZ Corporation v. ABC Ltd (2021)
Suit for breach of contract and recovery of damages.
The defendant failed to supply goods as per the agreement dated 01/01/2021.
The court held that non-performance of a contract without lawful excuse
entitles the aggrieved party to damages under Section 73 of the Indian
Contract Act 1872. The plaintiff was awarded damages of Rs. 50,00,000
along with interest at 18% per annum from the date of breach.
Sections cited: Section 73 ICA, Section 74 ICA.""",
        "case_type": "Civil",
        "topic": "breach of contract damages recovery civil suit"
    },
    {
        "id": "doc_007",
        "text": """IN THE HIGH COURT OF ALLAHABAD
Sharma v. State of UP (2020)
Bail application under Section 439 CrPC in a murder case.
The accused was charged under Section 302 IPC.
The court considered: (1) nature and gravity of accusation;
(2) antecedents of accused; (3) possibility of fleeing justice;
(4) likelihood of repeating the offence.
Bail was denied considering the gravity of the offence and
the strong prima facie case against the accused.
Sections cited: Section 302 IPC, Section 439 CrPC.""",
        "case_type": "Criminal",
        "topic": "bail murder section 302 IPC criminal"
    },
    {
        "id": "doc_008",
        "text": """IN THE HIGH COURT OF DELHI
Rajesh v. State (2022)
FIR quashing petition under Section 482 CrPC.
The petitioner sought quashing of FIR registered under Section 498A IPC
(cruelty to wife) and Section 406 IPC (criminal breach of trust).
The court held that when the dispute is purely matrimonial and
a settlement has been reached between parties, the FIR can be quashed
in the interest of justice under Section 482 CrPC.
Sections cited: Section 498A IPC, Section 406 IPC, Section 482 CrPC.""",
        "case_type": "Criminal",
        "topic": "FIR quashing 498A matrimonial cruelty"
    },
    {
        "id": "doc_009",
        "text": """IN THE DISTRICT COURT OF PUNE
Anil Kumar v. Housing Society (2023)
Suit for possession and injunction against illegal eviction.
The plaintiff is a lawful tenant since 1995 and was illegally evicted.
The court granted temporary injunction restraining the defendant
from interfering with the plaintiff's peaceful possession.
Held: A tenant cannot be evicted without following due process
under the Rent Control Act. Self-help eviction is illegal.
Sections cited: Maharashtra Rent Control Act, Order 39 Rule 1 CPC.""",
        "case_type": "Property Dispute",
        "topic": "eviction tenant possession injunction rent control"
    },
    {
        "id": "doc_010",
        "text": """IN THE NATIONAL CONSUMER DISPUTES REDRESSAL COMMISSION
Consumer v. Insurance Company (2022)
Complaint for deficiency in service under Consumer Protection Act 2019.
The insurance company wrongfully rejected the claim of the complainant.
The Commission held that arbitrary rejection of genuine insurance claims
constitutes deficiency in service and unfair trade practice.
The respondent was directed to pay the claim amount of Rs. 5,00,000
with interest and compensation of Rs. 50,000 for mental agony.
Sections cited: Consumer Protection Act 2019, Section 2(11) CPA.""",
        "case_type": "Civil",
        "topic": "consumer complaint insurance deficiency service"
    },
]


class LegalRAGRetriever:
    """
    RAG Retriever using ChromaDB + SentenceTransformers.
    Stores legal precedents and retrieves relevant ones for draft generation.
    """

    def __init__(self):
        self.client = None
        self.collection = None
        self.embedding_model = None
        self._loaded = False

    def load(self):
        """Initialize ChromaDB and load the embedding model."""
        try:
            logger.info("Loading RAG retriever...")

            # Load sentence transformer for embeddings
            logger.info("Loading embedding model: all-MiniLM-L6-v2")
            self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

            # Initialize ChromaDB with persistent storage
            os.makedirs(CHROMA_PATH, exist_ok=True)
            self.client = chromadb.PersistentClient(path=CHROMA_PATH)

            # Get or create the legal documents collection
            self.collection = self.client.get_or_create_collection(
                name="legal_precedents",
                metadata={"hnsw:space": "cosine"}
            )

            # Seed with sample documents if collection is empty
            if self.collection.count() == 0:
                logger.info("Seeding vector DB with sample legal precedents...")
                self._seed_documents()
                logger.info(f"Seeded {self.collection.count()} legal documents.")
            else:
                logger.info(f"Vector DB loaded with {self.collection.count()} documents.")

            self._loaded = True
            logger.info("RAG retriever ready.")

        except Exception as e:
            logger.warning(f"RAG retriever failed to load: {e}. Continuing without RAG.")
            self._loaded = False

    def _seed_documents(self):
        """Add sample legal documents to the vector DB."""
        ids = [doc["id"] for doc in SAMPLE_LEGAL_DOCUMENTS]
        texts = [doc["text"] for doc in SAMPLE_LEGAL_DOCUMENTS]
        metadatas = [
            {"case_type": doc["case_type"], "topic": doc["topic"]}
            for doc in SAMPLE_LEGAL_DOCUMENTS
        ]

        # Generate embeddings
        embeddings = self.embedding_model.encode(texts).tolist()

        self.collection.add(
            ids=ids,
            documents=texts,
            embeddings=embeddings,
            metadatas=metadatas,
        )

    def add_document(self, doc_id: str, text: str, case_type: str, topic: str = ""):
        """Add a new legal document to the vector DB."""
        if not self._loaded:
            return
        embedding = self.embedding_model.encode([text])[0].tolist()
        self.collection.add(
            ids=[doc_id],
            documents=[text],
            embeddings=[embedding],
            metadatas=[{"case_type": case_type, "topic": topic}],
        )

    def retrieve(self, query: str, case_type: str = None, top_k: int = 3) -> List[Dict]:
        """
        Retrieve the most relevant legal precedents for a given query.
        Returns list of dicts with 'text', 'case_type', 'similarity'.
        """
        if not self._loaded or self.collection.count() == 0:
            return []

        try:
            query_embedding = self.embedding_model.encode([query])[0].tolist()

            where_filter = {"case_type": case_type} if case_type else None

            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=min(top_k, self.collection.count()),
                where=where_filter,
                include=["documents", "metadatas", "distances"],
            )

            retrieved = []
            for i, doc in enumerate(results["documents"][0]):
                distance = results["distances"][0][i]
                similarity = round(1 - distance, 3)
                if similarity > 0.2:  # Only include reasonably relevant results
                    retrieved.append({
                        "text": doc,
                        "case_type": results["metadatas"][0][i].get("case_type", ""),
                        "topic": results["metadatas"][0][i].get("topic", ""),
                        "similarity": similarity,
                    })

            logger.info(f"RAG retrieved {len(retrieved)} relevant precedents for query.")
            return retrieved

        except Exception as e:
            logger.warning(f"RAG retrieval failed: {e}")
            return []

    def format_context(self, precedents: List[Dict]) -> str:
        """Format retrieved precedents into a context string for the generator."""
        if not precedents:
            return ""

        context = "RELEVANT LEGAL PRECEDENTS:\n\n"
        for i, p in enumerate(precedents, 1):
            context += f"[Precedent {i}] (Similarity: {p['similarity']:.0%})\n"
            context += p["text"].strip()
            context += "\n\n"
        return context
