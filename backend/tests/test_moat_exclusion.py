import pytest
from unittest.mock import AsyncMock, patch
from pipeline.moat_tester import test_moat as moat_tester_fn
from services.serper_client import search_serper

@pytest.mark.asyncio
async def test_startup_excluded_from_serper_query():
    """
    Verifies that the Serper search query for competitors 
    programmatically excludes the startup name.
    """
    with patch("httpx.AsyncClient.post") as mock_post:
        mock_post.return_value.status_code = 200
        mock_post.return_value.json.return_value = {"organic": []}
        
        # This now matches the new signature
        await search_serper("fintech competitors", exclude_name="Brex")
        
        args, kwargs = mock_post.call_args
        sent_query = kwargs["json"]["q"]
        # Check if the exclusion was appended
        assert sent_query == 'fintech competitors -"Brex"'

@pytest.mark.asyncio
async def test_startup_excluded_from_moat_verdict():
    """
    Verifies that the Moat module excludes the startup name 
    from the final competitors list even if it appears in snippets.
    """
    moat_claims = [{"claim": "Proprietary credit scoring model"}]
    serper_results = [
        {"title": "Brex - Financial Software", "snippet": "Brex is a leader in corporate cards."},
        {"title": "Ramp", "snippet": "Ramp is a major competitor to Brex."}
    ]
    
    # Mock call_gemini to return a response containing "Brex" which SHOULD be filtered by the LLM
    # if it follows instructions. We just want to check if the prompt passed to call_gemini 
    # contains the exclusion rule.
    with patch("pipeline.moat_tester.call_gemini", new_callable=AsyncMock) as mock_gemini:
        mock_gemini.return_value = '{"verdict": "WEAK", "competitors": ["Ramp"], "explanation": "test", "investor_question": "test"}'
        
        # This now matches the new signature
        await moat_tester_fn(moat_claims, serper_results, startup_name="Brex")
        
        args, kwargs = mock_gemini.call_args
        system_prompt = kwargs["system"]
        
        # Check if the startup name was injected into the system prompt
        assert 'YOU ARE ANALYSING THE STARTUP: Brex' in system_prompt
        assert 'NEVER include "Brex" in the "competitors" list' in system_prompt
