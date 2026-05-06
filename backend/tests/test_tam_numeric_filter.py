import pytest
from pipeline.tam_checker import check_tam

@pytest.mark.asyncio
async def test_tam_checker_handles_empty_claims_gracefully():
    """
    Verifies that tam_checker returns the correct UNSUBSTANTIATED payload
    when market_claims is empty, as per Task 4 requirements.
    """
    # No market claims
    result = await check_tam([], [])
    
    assert result["verdict"] == "UNSUBSTANTIATED"
    # Task 4 specifies this exact explanation string
    assert result["explanation"] == "No TAM figure provided in deck"
    assert result["claimed_tam"] == "None found"
