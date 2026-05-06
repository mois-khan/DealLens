import pytest
from unittest.mock import AsyncMock, patch
from routers.analyse import analyse_deck
from fastapi import UploadFile
import io

@pytest.mark.asyncio
async def test_founder_module_not_called_if_no_founders():
    """
    Verifies that test_founder is NOT called if the F1 extraction
    finds zero founders in the deck.
    """
    # Mock PDF extraction and claim parsing
    with patch("pipeline.extractor.extract_text", return_value="dummy text"), \
         patch("pipeline.claim_parser.extract_claims", new_callable=AsyncMock) as mock_extract, \
         patch("pipeline.founder_intel.test_founder", new_callable=AsyncMock) as mock_test_founder, \
         patch("services.tavily_client.search_tavily", new_callable=AsyncMock) as mock_tavily, \
         patch("services.serper_client.search_serper", new_callable=AsyncMock) as mock_serper, \
         patch("pipeline.tam_checker.check_tam", new_callable=AsyncMock), \
         patch("pipeline.moat_tester.test_moat", new_callable=AsyncMock), \
         patch("pipeline.question_gen.generate_questions", new_callable=AsyncMock), \
         patch("pipeline.scorecard.generate_scorecard", new_callable=AsyncMock), \
         patch("routers.analyse.save_report", new_callable=AsyncMock) as mock_save:

        # F1 returns NO founders
        mock_extract.return_value = {
            "startup_name": "Test",
            "category": "Test",
            "founders": [], # EMPTY
            "market_claims": [],
            "moat_claims": []
        }
        mock_tavily.return_value = []
        mock_serper.return_value = []
        mock_save.return_value = "report_123"

        # Create a dummy PDF file
        dummy_file = UploadFile(filename="test.pdf", file=io.BytesIO(b"%PDF-1.4 test"))
        
        response = await analyse_deck(dummy_file)
        
        # Verify test_founder was NEVER called
        assert mock_test_founder.called is False
        # Verify the returned verdict is the specific static one
        assert response["founder"]["domain_fit"] == "UNKNOWN"
        assert response["founder"]["explanation"] == "No founders identified in deck."

@pytest.mark.asyncio
async def test_founder_module_called_if_founders_exist():
    """
    Verifies that test_founder IS called if founders are identified.
    """
    with patch("pipeline.extractor.extract_text", return_value="dummy text"), \
         patch("pipeline.claim_parser.extract_claims", new_callable=AsyncMock) as mock_extract, \
         patch("pipeline.founder_intel.test_founder", new_callable=AsyncMock) as mock_test_founder, \
         patch("services.tavily_client.search_tavily", new_callable=AsyncMock), \
         patch("services.serper_client.search_serper", new_callable=AsyncMock), \
         patch("pipeline.tam_checker.check_tam", new_callable=AsyncMock), \
         patch("pipeline.moat_tester.test_moat", new_callable=AsyncMock), \
         patch("pipeline.question_gen.generate_questions", new_callable=AsyncMock), \
         patch("pipeline.scorecard.generate_scorecard", new_callable=AsyncMock), \
         patch("routers.analyse.save_report", new_callable=AsyncMock):

        # F1 returns founders
        mock_extract.return_value = {
            "startup_name": "Test",
            "category": "Test",
            "founders": [{"name": "Mois Khan"}],
            "market_claims": [],
            "moat_claims": []
        }
        mock_test_founder.return_value = {"domain_fit": "HIGH", "explanation": "Expert."}

        dummy_file = UploadFile(filename="test.pdf", file=io.BytesIO(b"%PDF-1.4 test"))
        await analyse_deck(dummy_file)
        
        # Verify test_founder WAS called
        assert mock_test_founder.called is True
