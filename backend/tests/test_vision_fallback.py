import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from pipeline.extractor import extract_text

@pytest.mark.asyncio
async def test_vision_triggered_on_low_text_slide():
    """
    Verifies that slides with very little text (likely charts/tables)
    trigger the Gemini Vision fallback.
    """
    # Mock PyMuPDF Document and Page
    mock_doc = MagicMock()
    mock_page_1 = MagicMock()
    mock_page_1.get_text.return_value = "Normal slide with lots of text... " * 10 # ~300 chars
    
    mock_page_2 = MagicMock()
    mock_page_2.get_text.return_value = "LTV" # Very little text, likely a chart
    # Mock the pixmap rendering
    mock_pix = MagicMock()
    mock_pix.tobytes.return_value = b"fake_jpeg_bytes"
    mock_page_2.get_pixmap.return_value = mock_pix
    
    mock_doc.__iter__.return_value = [mock_page_1, mock_page_2]
    mock_doc.close.return_value = None
    
    with patch("fitz.open", return_value=mock_doc), \
         patch("pipeline.extractor.call_gemini", new_callable=AsyncMock) as mock_gemini:
        
        mock_gemini.return_value = "[VISION DESCRIPTION: This is a table showing LTV at $500]"
        
        # This will fail because extract_text is currently synchronous and doesn't handle vision
        result = await extract_text(b"fake_pdf_bytes")
        
        # Verify vision was called exactly once (for page 2)
        assert mock_gemini.called
        assert mock_gemini.call_count == 1
        
        # Verify both slide contents are in the output
        assert "--- SLIDE 1 ---" in result
        assert "Normal slide with lots of text" in result
        assert "--- SLIDE 2 ---" in result
        assert "LTV" in result
        assert "[VISION DESCRIPTION: This is a table showing LTV at $500]" in result

@pytest.mark.asyncio
async def test_vision_not_triggered_on_text_heavy_pdf():
    """
    Verifies that normal text-heavy slides do not trigger vision (saves latency/cost).
    """
    mock_doc = MagicMock()
    mock_page = MagicMock()
    mock_page.get_text.return_value = "This is a very long text slide that should not need vision extraction. " * 20
    mock_doc.__iter__.return_value = [mock_page]
    
    with patch("fitz.open", return_value=mock_doc), \
         patch("pipeline.extractor.call_gemini", new_callable=AsyncMock) as mock_gemini:
        
        await extract_text(b"fake_pdf_bytes")
        
        # Should NOT call vision
        assert not mock_gemini.called
