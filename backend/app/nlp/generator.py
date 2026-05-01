import logging, time, datetime, os
from typing import Dict
from app.core.config import settings

logger = logging.getLogger(__name__)

try:
    from llama_cpp import Llama
    LLAMA_AVAILABLE = True
except ImportError:
    LLAMA_AVAILABLE = False
    logger.warning("llama-cpp-python not installed. GGUF model will not be used.")

class LegalDraftGenerator:
    def __init__(self):
        self.use_model = False
        self.llm = None

    async def load(self):
        if not LLAMA_AVAILABLE:
            logger.error("Cannot load GGUF model: llama-cpp-python not available.")
            return

        model_path = settings.GGUF_MODEL_PATH
        if not os.path.exists(model_path):
            logger.error(f"GGUF model not found at {model_path}. Please run download script.")
            return

        try:
            logger.info(f"Loading GGUF model from {model_path}...")
            # n_gpu_layers=-1 if settings.USE_GPU else 0
            self.llm = Llama(
                model_path=model_path,
                n_ctx=2048,
                n_threads=os.cpu_count(),
                verbose=False
            )
            self.use_model = True
            logger.info("GGUF Model loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to load GGUF model: {str(e)}")

    def _generate_with_llm(self, section, ctx):
        p       = ctx.get("petitioner","The Complainant")
        r       = ctx.get("respondent","The Accused")
        court   = ctx.get("court","HON'BLE COURT")
        loc     = ctx.get("location","Delhi")
        desc    = ctx.get("description","")
        relief  = ctx.get("relief_sought","")
        sl      = ctx.get("statutes",[])
        stat    = ", ".join(sl) if sl else "applicable provisions of law"
        rag     = ctx.get("rag_context","")

        prompt = f"""<|system|>
You are an expert Indian Legal Draftsman. Draft a professional {section.replace('_', ' ')} for a legal case in India.
Follow the standard legal format and terminology used in Indian Courts.
Use the provided context to fill in details.
Context:
- Petitioner: {p}
- Respondent: {r}
- Court: {court}
- Location: {loc}
- Description: {desc}
- Relief Sought: {relief}
- Statutes: {stat}
- Additional RAG Context: {rag}

Draft the {section.replace('_', ' ')} section only.
<|assistant|>
"""
        try:
            output = self.llm(
                prompt,
                max_tokens=1024,
                stop=["<|end|>", "</s>"],
                temperature=0.7,
                top_p=0.9
            )
            return output["choices"][0]["text"].strip()
        except Exception as e:
            logger.error(f"LLM generation failed: {str(e)}")
            return None

    def _t(self, section, ctx):
        if self.use_model and self.llm:
            llm_text = self._generate_with_llm(section, ctx)
            if llm_text:
                return llm_text

        # Fallback to hardcoded templates
        p       = ctx.get("petitioner","The Complainant")
        r       = ctx.get("respondent","The Accused")
        court   = ctx.get("court","HON'BLE COURT")
        loc     = ctx.get("location","Delhi")
        desc    = ctx.get("description","")
        relief  = ctx.get("relief_sought","appropriate relief as deemed fit by this Hon'ble Court")
        inc     = ctx.get("incident_date","the relevant date")
        sl      = ctx.get("statutes",[])
        stat    = ", ".join(sl) if sl else "applicable provisions of law"
        ml      = ctx.get("money",[])
        amt     = ml[0] if ml else "the due amount"
        yr      = datetime.datetime.now().year
        rag     = ctx.get("rag_context","")
        rn      = "\n\n[Note: Draft prepared with reference to similar legal precedents via RAG.]" if rag else ""

        if section == "title_block":
            return (f"IN THE COURT OF {court.upper()}\n{loc.upper()} COURTS\n\nC.C. NO. \u2026\u2026\u2026\u2026..{yr}\n\n"
                    f"IN THE MATTER OF:\n\n{p}\nThrough its Authorised Representative\n"
                    f"\t\t\t\t\t\t\t\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026Complainant\n\n"
                    f"\t\t\t\t\tVersus\n\n{r}\n"
                    f"\t\t\t\t\t\t\t\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026Accused\n\n"
                    f"\t\t\t\t\t\t\t\t\t\tP.S.- {loc}\n\n"
                    f"COMPLAINT ON BEHALF OF COMPLAINANT U/S {stat}")

        if section == "complaint_body":
            return (f"MOST RESPECTFULLY SHOWETH:\n\n"
                    f"1.\tThat the Complainant, {p}, through its Authorised Representative, is well conversant with the facts and circumstances of the present complaint and is duly authorised to represent and sign this complaint before this Hon\u2019ble Court.\n\n"
                    f"2.\tThat the Complainant is a reputed firm/individual engaged in lawful business. The Accused, {r}, was known to the Complainant and the following events transpired between the parties:\n\n{desc}\n\n"
                    f"3.\tThat the Accused issued a cheque/instrument dated {inc} for a sum of {amt} in favour of the Complainant to discharge their lawful liability. The said instrument was duly presented for realisation but was returned/dishonoured. The original cheque is annexed as Annexure C and the cheque returning memo is annexed as Annexure D.\n\n"
                    f"4.\tThat the Complainant caused a legal demand notice to be served upon the Accused. The Accused failed to pay within the stipulated 15 days. The copy of legal notice is annexed as Annexure E. The postal receipt and POD is annexed as Annexure F. The copy of email is annexed as Annexure G.\n\n"
                    f"5.\tThat the Accused is liable to be prosecuted u/s {stat}. The cause of action arose on each date of transaction, on dishonour of the cheque, and on failure to comply with the legal notice, all within the jurisdiction of this Hon\u2019ble Court.\n\n"
                    f"6.\tThat this Hon\u2019ble Court has full territorial and pecuniary jurisdiction to try and decide this complaint. The complaint is filed within the period of limitation under {stat}.{rn}")

        if section == "prayer":
            return (f"PRAYER\n\n"
                    f"\tIt is, therefore, most respectfully prayed that the Hon\u2019ble Court may be pleased to take cognizance of this complaint and the Accused, {r}, may kindly be summoned, tried and punished for the offence committed u/s {stat} in accordance with law, in the interest of justice.\n\n"
                    f"\t{relief}.\n\n"
                    f"Any other or further order which this Hon\u2019ble Court may deem fit and proper may also be passed in favour of the Complainant and against the Accused, in the interest of justice.\n\n\n"
                    f"\t\t\t\t\t\t\t\t\tCOMPLAINANT\n{loc}\t\t\t\t\t\t\tThrough\nDated: ___________\t\t\t\t\t\t\t\tCounsel")

        if section == "list_of_witnesses":
            return (f"IN THE COURT OF {court.upper()}\n{loc.upper()} COURTS\n\nC.C. NO. \u2026\u2026\u2026\u2026..{yr}\n\n"
                    f"IN THE MATTER OF:\n\n{p}\n\t\t\t\t\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026Complainant\n\nVersus\n\n{r}\n\t\t\t\t\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026Accused\n\n"
                    f"LIST OF WITNESSES\n\n"
                    f"1.\tAuthorised Representative of the Complainant, {p}, who is well conversant with the facts and circumstances of the complaint.\n\n"
                    f"2.\tClerk / Officer of the bank on which the cheque was drawn, with all relevant records.\n\n"
                    f"3.\tClerk / Officer of the bank where the cheque was deposited for realisation, with all relevant records.\n\n"
                    f"4.\tClerk / Officer of the concerned Post Office with relevant records.\n\n"
                    f"5.\tAny other witness with the permission of this Hon\u2019ble Court.\n\n\n"
                    f"\t\t\t\t\t\t\t\tCOMPLAINANT\n{loc}\t\t\t\t\t\t\tThrough\nDated: ___________\t\t\t\t\t\t\t\tCounsel")

        if section == "list_of_documents":
            return (f"IN THE COURT OF {court.upper()}\n{loc.upper()} COURTS\n\nC.C. NO. \u2026\u2026\u2026\u2026..{yr}\n\n"
                    f"IN THE MATTER OF:\n\n{p}\n\t\t\t\t\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026Complainant\n\nVersus\n\n{r}\n\t\t\t\t\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026Accused\n\n"
                    f"LIST OF DOCUMENTS\n\n"
                    f"Sr. No.\tDescription of Document\t\t\t\t\t\tAnnexure\n\n"
                    f"1.\tResolution / Authority letter authorising the AR\t\t\t\t[Annexure \u2013 A]\n\n"
                    f"2.\tCopies of invoices / bills / ledger account showing dues of {amt}\t[Annexure \u2013 B]\n\n"
                    f"3.\tOriginal cheque for {amt} dated {inc}\t\t\t\t\t\t[Annexure \u2013 C]\n\n"
                    f"4.\tOriginal cheque returning / dishonour memo from bank\t\t\t[Annexure \u2013 D]\n\n"
                    f"5.\tCopy of legal demand notice issued to the Accused\t\t\t[Annexure \u2013 E]\n\n"
                    f"6.\tOriginal postal receipt and Proof of Delivery (POD)\t\t\t[Annexure \u2013 F]\n\n"
                    f"7.\tCopy of email / electronic communication sent to the Accused\t\t[Annexure \u2013 G]\n\n"
                    f"8.\tAny other document as may be permitted by this Hon\u2019ble Court\n\n\n"
                    f"\t\t\t\t\t\t\t\tCOMPLAINANT\n{loc}\t\t\t\t\t\t\tThrough\nDated: ___________\t\t\t\t\t\t\t\tCounsel")

        if section == "affidavit":
            return (f"IN THE COURT OF {court.upper()}\n{loc.upper()} COURTS\n\nC.C. NO. \u2026\u2026\u2026\u2026..{yr}\n\n"
                    f"IN THE MATTER OF:\n\n{p}\n\t\t\t\t\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026Complainant\n\nVersus\n\n{r}\n\t\t\t\t\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026Accused\n\n"
                    f"AFFIDAVIT\n\n"
                    f"I, Authorised Representative of {p}, having its office at {loc}, do hereby solemnly affirm and declare as under:\n\n"
                    f"1.\tThat the deponent is the Authorised Representative of the Complainant who has filed the above complaint with regard to the cheque dated {inc} for a sum of {amt}.\n\n"
                    f"2.\tThat the Complainant has not filed any other complaint/case regarding the dishonoring of the above said cheque in any other court except the present complaint. The contents of the accompanying complaint may kindly be read as part and parcel of this affidavit as the same are not being repeated herein for the sake of brevity.\n\n\n"
                    f"Deponent\n\n\n"
                    f"VERIFICATION:\n\n"
                    f"Verified at {loc} on this _____ day of _____________ {yr}, that the contents of the above affidavit are true and correct to my knowledge and no part of it is false and nothing material has been concealed therefrom.\n\n\n"
                    f"Deponent")

        if section == "evidence_affidavit":
            sd = desc[:500] + "..." if len(desc) > 500 else desc
            return (f"IN THE COURT OF {court.upper()}\n{loc.upper()} COURTS\n\nC.C. NO. \u2026\u2026\u2026\u2026..{yr}\n\n"
                    f"IN THE MATTER OF:\n\n{p}\n\t\t\t\t\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026Complainant\n\nVersus\n\n{r}\n\t\t\t\t\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026Accused\n\n"
                    f"EVIDENCE BY WAY OF AFFIDAVIT\n\n"
                    f"I, Authorised Representative of {p}, having its office at {loc}, do hereby solemnly affirm and declare as under:\n\n"
                    f"1.\tI am well conversant with the facts and circumstances of the complaint and am duly authorised to represent the firm before this Hon\u2019ble Court. The Original resolution is exhibited as EX. CW-1/1.\n\n"
                    f"2.\t{sd}\n\tThe copy of ledger account / invoices is exhibited as EX. CW-1/2.\n\n"
                    f"3.\tThat the Accused issued a cheque dated {inc} for a sum of {amt} in favour of the Complainant which was dishonoured. The original cheque is exhibited as EX. CW-1/3 and the dishonour memo is exhibited as EX. CW-1/4.\n\n"
                    f"4.\tThat the legal demand notice was duly served upon the Accused who failed to pay within 15 days. Legal notice is exhibited as EX. CW-1/5. Postal receipt and POD is exhibited as EX. CW-1/6. Email copy is exhibited as EX. CW-1/7.\n\n"
                    f"5.\tThat the Accused is liable to be prosecuted u/s {stat}. I hereby close my pre-summoning evidence. My statements are true and correct.\n\n\n"
                    f"Deponent\n\n\n"
                    f"VERIFICATION:\n\n"
                    f"Verified at {loc} on this _____ day of _____________ {yr} that the contents of the above affidavit are true to my knowledge and no part of it is false and nothing material has been concealed therefrom.\n\n\n"
                    f"Deponent")

        return "Section content not available."

    def generate_section(self, section, context): return self._t(section, context)

    def generate_all_sections(self, context):
        start = time.time()
        order = ["title_block","complaint_body","prayer","list_of_witnesses","list_of_documents","affidavit","evidence_affidavit"]
        sections = {s: self._t(s, context) for s in order}
        sections["_generation_time"] = round(time.time()-start, 2)
        sections["_full_text"] = ("\n\n"+"="*70+"\n\n").join(sections[k] for k in order)
        logger.info(f"All 7 sections generated in {sections['_generation_time']}s")
        return sections
