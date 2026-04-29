from pydantic import BaseModel
from typing import Optional


# ── Scorecard ──────────────────────────────────────────────────────────────────

class ScorecardDimensions(BaseModel):
    founder_credibility: float
    market_validity: float
    competitive_moat: float
    traction_quality: float
    financial_soundness: float


class Scorecard(BaseModel):
    startup_name: str
    overall: float
    dimensions: ScorecardDimensions
    top_flags: list[str]
    strengths: list[str]


# ── Founder ────────────────────────────────────────────────────────────────────

class FounderIntel(BaseModel):
    name: str
    role: str
    domain_fit: str  # HIGH | MEDIUM-HIGH | MEDIUM | LOW
    domain_fit_reason: str
    verdict: str
    past_ventures: list[str]
    credibility_signals: list[str]
    red_flags: list[str]
    public_summary: str


# ── Claims ─────────────────────────────────────────────────────────────────────

class TAMResult(BaseModel):
    verdict: str  # VERIFIED | INFLATED | UNSUBSTANTIATED
    claimed_tam: str
    real_tam: str
    inflation_factor: Optional[str]
    explanation: str
    source: str
    investor_question: str


class TractionFlag(BaseModel):
    type: str
    claim: str
    problem: str
    investor_question: str


class TractionResult(BaseModel):
    flags: list[TractionFlag]


class MoatCompetitor(BaseModel):
    name: str
    backing: str
    scale: str
    threat_level: str  # CRITICAL | HIGH | MEDIUM | LOW


class MoatResult(BaseModel):
    verdict: str  # STRONG | WEAK | UNSUBSTANTIATED
    claimed_moat: str
    explanation: str
    investor_question: str
    competitors: list[MoatCompetitor]


class FinancialResult(BaseModel):
    flags: list[str]


class ClaimsBundle(BaseModel):
    tam: TAMResult
    traction: TractionResult
    moat: MoatResult
    financials: FinancialResult


# ── Questions ──────────────────────────────────────────────────────────────────

class InvestorQuestion(BaseModel):
    rank: int
    category: str  # Market | Moat | Traction | Founder | Finance
    severity: str  # HIGH | MEDIUM
    question: str
    targets_claim: str
    gap_found: str
    strong_answer_looks_like: str


# ── Full Report ────────────────────────────────────────────────────────────────

class AnalysisReport(BaseModel):
    report_id: str
    file_name: str
    scorecard: Scorecard
    founder: FounderIntel
    claims: ClaimsBundle
    competitors: list[MoatCompetitor]
    questions: list[InvestorQuestion]
