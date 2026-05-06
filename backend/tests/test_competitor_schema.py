import pytest
from unittest.mock import AsyncMock, patch
from pipeline.moat_tester import test_moat as moat_tester_fn

@pytest.mark.asyncio
async def test_competitor_objects_are_validated():
    """
    Verifies that the moat_tester strips malformed plain-string competitors
    and only passes through properly structured competitor objects.
    """
    claims = [{"claim": "Proprietary AI moat"}]
    
    # Simulate Gemini returning a mixed array — strings AND objects
    mixed_response = """{
        "verdict": "WEAK",
        "competitors": [
            "Brex",
            {"name": "Ramp", "backing": "Stripe", "scale": "Series D", "threat_level": "HIGH"},
            "Stripe",
            {"name": "Mercury", "backing": "Andreessen Horowitz", "scale": "Series B", "threat_level": "MEDIUM"}
        ],
        "explanation": "Multiple funded competitors exist.",
        "investor_question": "Why can't Brex copy this?"
    }"""
    
    with patch("pipeline.moat_tester.call_gemini", new_callable=AsyncMock) as mock_gemini:
        mock_gemini.return_value = mixed_response
        
        result = await moat_tester_fn(claims, [], startup_name="Novo")
        
        competitors = result["competitors"]
        
        # All competitors must be objects, not strings
        for c in competitors:
            # This will fail currently — no validation exists
            assert isinstance(c, dict), f"Expected dict but got {type(c)}: {c}"
            assert "name" in c
            assert "threat_level" in c
        
        # Strings should have been discarded or restructured
        names = [c.get("name") for c in competitors]
        assert "Brex" not in names, "Plain string 'Brex' should have been discarded"
        assert "Stripe" not in names, "Plain string 'Stripe' should have been discarded"
        assert "Ramp" in names
        assert "Mercury" in names

@pytest.mark.asyncio
async def test_threat_level_values_are_valid():
    """
    Verifies that threat_level values are constrained to the allowed set.
    """
    valid_threat_levels = {"CRITICAL", "HIGH", "MEDIUM", "LOW"}
    claims = [{"claim": "We are the only player"}]
    
    response_with_bad_threat = """{
        "verdict": "WEAK",
        "competitors": [
            {"name": "Ramp", "backing": "Stripe", "scale": "Series D", "threat_level": "VERY HIGH"},
            {"name": "Brex", "backing": "Y Combinator", "scale": "Series C", "threat_level": "HIGH"}
        ],
        "explanation": "Competitors exist.",
        "investor_question": "Why can't Ramp copy this?"
    }"""
    
    with patch("pipeline.moat_tester.call_gemini", new_callable=AsyncMock) as mock_gemini:
        mock_gemini.return_value = response_with_bad_threat
        
        result = await moat_tester_fn(claims, [], startup_name="Novo")
        
        competitors = result["competitors"]
        
        for c in competitors:
            assert isinstance(c, dict)
            # This will fail — no threat_level validation exists currently
            assert c.get("threat_level") in valid_threat_levels, \
                f"Invalid threat_level: {c.get('threat_level')}"
