import pytest
from unittest.mock import AsyncMock, patch
from services.serper_client import search_serper
from services.tavily_client import search_tavily
from pipeline.tam_checker import check_tam
from pipeline.moat_tester import test_moat as moat_tester_fn

@pytest.mark.asyncio
async def test_search_queries_include_context_year():
    """
    Verifies that search queries for Serper and Tavily 
    are time-constrained when context_year is provided.
    """
    with patch("httpx.AsyncClient.post") as mock_post:
        mock_post.return_value.status_code = 200
        mock_post.return_value.json.return_value = {"organic": []}
        
        await search_serper("competitors", context_year="2008")
        
        call_args = mock_post.call_args
        assert call_args is not None
        sent_json = call_args.kwargs["json"]
        assert "2008" in sent_json["q"]

    with patch("asyncio.to_thread") as mock_thread:
        mock_thread.return_value = {"results": []}
        
        await search_tavily("market size", context_year="2008")
        assert mock_thread.called

@pytest.mark.asyncio
async def test_prompts_receive_context_year():
    """
    Verifies that TAM and Moat prompts are aware of the era being analysed.
    """
    context = {"startup_name": "Uber", "category": "ride sharing", "context_year": "2008"}
    claims = [{"claim": "Market is huge"}]
    
    with patch("pipeline.tam_checker.call_gemini", new_callable=AsyncMock) as mock_gemini:
        mock_gemini.return_value = '{"verdict": "VERIFIED", "claimed_tam": "1B", "real_tam": "1B", "inflation_factor": null, "explanation": "test", "source": "test", "investor_question": "test"}'
        await check_tam(claims, [], context=context)
        
        assert mock_gemini.called
        kwargs = mock_gemini.call_args.kwargs
        assert "2008" in kwargs["user"]

    with patch("pipeline.moat_tester.call_gemini", new_callable=AsyncMock) as mock_gemini_moat:
        mock_gemini_moat.return_value = '{"verdict": "STRONG", "competitors": [], "explanation": "test", "investor_question": "test"}'
        await moat_tester_fn(claims, [], startup_name="Uber", context_year="2008")
        
        assert mock_gemini_moat.called
        kwargs = mock_gemini_moat.call_args.kwargs
        assert "2008" in kwargs["user"]
