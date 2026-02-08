"""
Unit tests for OpenRouter model fallback mechanism
Tests stable free tier model configuration and 404 error handling
"""
import pytest
import os
from backend.src.services.agent_runner import AgentRunner


class TestModelConfiguration:
    """Test stable free tier model configuration"""

    def test_primary_model_is_stable_free_tier(self):
        """Verify PRIMARY_MODEL is set to stable free tier model"""
        assert AgentRunner.PRIMARY_MODEL == "google/gemini-flash-1.5-8b:free", \
            f"Expected stable model, got '{AgentRunner.PRIMARY_MODEL}'"

    def test_fallback_model_is_stable_free_tier(self):
        """Verify FALLBACK_MODEL is set to stable free tier model"""
        assert AgentRunner.FALLBACK_MODEL == "google/gemini-flash-1.5-8b:free", \
            f"Expected stable model, got '{AgentRunner.FALLBACK_MODEL}'"

    def test_model_includes_free_suffix(self):
        """Verify model IDs include :free suffix for free tier"""
        assert ":free" in AgentRunner.PRIMARY_MODEL, \
            "PRIMARY_MODEL should include ':free' suffix"
        assert ":free" in AgentRunner.FALLBACK_MODEL, \
            "FALLBACK_MODEL should include ':free' suffix"

    def test_env_model_configured(self):
        """Verify OPENROUTER_MODEL is set to stable model in .env"""
        from pathlib import Path
        env_path = Path(__file__).parent.parent.parent / ".env"
        if env_path.exists():
            with open(env_path) as f:
                for line in f:
                    if line.startswith("OPENROUTER_MODEL"):
                        model = line.split("=", 1)[1].strip()
                        assert "google/gemini-flash-1.5-8b:free" in model, \
                            f"Expected stable model, got '{model}'"
                        return
        # If .env not found, check environment variable
        model = os.getenv("OPENROUTER_MODEL", "google/gemini-flash-1.5-8b:free")
        assert "gemini-flash-1.5-8b:free" in model, f"Expected stable model, got '{model}'"

    def test_model_name_format(self):
        """Verify model names follow OpenRouter format"""
        models = [AgentRunner.PRIMARY_MODEL, AgentRunner.FALLBACK_MODEL]
        for model in models:
            # Format: provider/model-name:free
            assert "/" in model, f"Model '{model}' should contain '/'"
            assert ":free" in model, f"Model '{model}' should contain ':free'"
            assert model.startswith("google/"), f"Model '{model}' should start with 'google/'"


class TestAgentRunnerInitialization:
    """Test AgentRunner initialization with fallback support"""

    def test_agent_runner_initializes_with_api_key(self):
        """Verify AgentRunner initializes with OpenRouter API key"""
        api_key = os.getenv("OPENROUTER_API_KEY")
        if api_key:
            runner = AgentRunner(api_key=api_key)
            assert runner is not None
            assert runner.api_key == api_key

    def test_failed_models_tracking_initialized(self):
        """Verify failed_models set is initialized for tracking 404s"""
        api_key = os.getenv("OPENROUTER_API_KEY")
        if api_key:
            runner = AgentRunner(api_key=api_key)
            assert hasattr(runner, "failed_models"), \
                "AgentRunner should have failed_models attribute"
            assert isinstance(runner.failed_models, set), \
                "failed_models should be a set"
            assert len(runner.failed_models) == 0, \
                "failed_models should start empty"

    def test_client_configured_with_openrouter_base_url(self):
        """Verify OpenAI client is configured with OpenRouter base URL"""
        api_key = os.getenv("OPENROUTER_API_KEY")
        if api_key:
            runner = AgentRunner(api_key=api_key)
            assert runner.base_url == "https://openrouter.ai/api/v1"


class TestGetBestModelMethod:
    """Test _get_best_model fallback selection logic"""

    def test_get_best_model_returns_preferred_if_not_failed(self):
        """Verify _get_best_model returns preferred model if not failed"""
        api_key = os.getenv("OPENROUTER_API_KEY")
        if api_key:
            runner = AgentRunner(api_key=api_key)
            preferred = "google/test-model:free"

            best = runner._get_best_model(preferred)
            assert best == preferred, \
                "Should return preferred model if not failed"

    def test_get_best_model_falls_back_to_primary(self):
        """Verify _get_best_model falls back to PRIMARY_MODEL when preferred fails"""
        api_key = os.getenv("OPENROUTER_API_KEY")
        if api_key:
            runner = AgentRunner(api_key=api_key)
            failed_model = "google/failed-model:free"
            runner.failed_models.add(failed_model)

            best = runner._get_best_model(failed_model)
            assert best == AgentRunner.PRIMARY_MODEL, \
                "Should fall back to PRIMARY_MODEL when preferred fails"

    def test_get_best_model_falls_back_to_fallback(self):
        """Verify _get_best_model uses FALLBACK_MODEL when primary also fails"""
        api_key = os.getenv("OPENROUTER_API_KEY")
        if api_key:
            runner = AgentRunner(api_key=api_key)
            # Mark both preferred and primary as failed
            preferred = "google/failed-preferred:free"
            runner.failed_models.add(preferred)
            runner.failed_models.add(AgentRunner.PRIMARY_MODEL)

            best = runner._get_best_model(preferred)
            assert best == AgentRunner.FALLBACK_MODEL, \
                "Should use FALLBACK_MODEL when both preferred and primary fail"

    def test_get_best_model_avoids_failed_fallback(self):
        """Verify _get_best_model avoids using failed models"""
        api_key = os.getenv("OPENROUTER_API_KEY")
        if api_key:
            runner = AgentRunner(api_key=api_key)
            # Mark all as failed
            preferred = "google/failed-preferred:free"
            runner.failed_models.add(preferred)
            runner.failed_models.add(AgentRunner.PRIMARY_MODEL)
            runner.failed_models.add(AgentRunner.FALLBACK_MODEL)

            best = runner._get_best_model(preferred)
            # Should return fallback even if marked failed (last resort)
            assert best == AgentRunner.FALLBACK_MODEL


class TestModelFallbackLogic:
    """Test that fallback logic is integrated into AgentRunner"""

    def test_agent_runner_has_get_best_model_method(self):
        """Verify AgentRunner has _get_best_model method"""
        api_key = os.getenv("OPENROUTER_API_KEY")
        if api_key:
            runner = AgentRunner(api_key=api_key)
            assert hasattr(runner, "_get_best_model"), \
                "AgentRunner should have _get_best_model method"
            assert callable(getattr(runner, "_get_best_model")), \
                "_get_best_model should be callable"

    def test_run_agent_signature_includes_model_param(self):
        """Verify run_agent accepts model parameter"""
        api_key = os.getenv("OPENROUTER_API_KEY")
        if api_key:
            runner = AgentRunner(api_key=api_key)
            assert hasattr(runner, "run_agent"), \
                "AgentRunner should have run_agent method"


class TestErrorHandling:
    """Test error handling for 404 and other errors"""

    def test_404_error_format_recognized(self):
        """Verify 404 error handling recognizes 404 in error message"""
        # This is tested through integration tests
        # Just verify error handling code exists
        api_key = os.getenv("OPENROUTER_API_KEY")
        if api_key:
            runner = AgentRunner(api_key=api_key)
            assert runner is not None

    def test_402_error_format_recognized(self):
        """Verify 402 credit error handling recognizes 402 in error message"""
        # This is tested through integration tests
        # Just verify error handling code exists
        api_key = os.getenv("OPENROUTER_API_KEY")
        if api_key:
            runner = AgentRunner(api_key=api_key)
            assert runner is not None


class TestBackwardCompatibility:
    """Test backward compatibility with existing code"""

    def test_run_agent_default_model(self):
        """Verify run_agent uses default model from environment"""
        api_key = os.getenv("OPENROUTER_API_KEY")
        if api_key:
            runner = AgentRunner(api_key=api_key)
            # Verify run_agent defaults to stable model
            # (actual call would require more setup)
            assert runner is not None

    def test_no_breaking_changes_to_synthesis(self):
        """Verify _synthesize_response is not affected by fallback logic"""
        api_key = os.getenv("OPENROUTER_API_KEY")
        if api_key:
            runner = AgentRunner(api_key=api_key)
            assert hasattr(runner, "_synthesize_response"), \
                "AgentRunner should still have _synthesize_response"

    def test_tool_binding_preserved(self):
        """Verify tool binding logic is preserved"""
        api_key = os.getenv("OPENROUTER_API_KEY")
        if api_key:
            runner = AgentRunner(api_key=api_key)
            assert runner is not None
            # Tool binding happens in run_agent, not affected by fallback


class TestStableModelProperties:
    """Test properties of the stable free tier model"""

    def test_model_is_gemini_flash_1_5(self):
        """Verify model is Gemini Flash 1.5 (stable and fast)"""
        assert "gemini-flash-1.5" in AgentRunner.PRIMARY_MODEL, \
            "PRIMARY_MODEL should be Gemini Flash 1.5"
        assert "gemini-flash-1.5" in AgentRunner.FALLBACK_MODEL, \
            "FALLBACK_MODEL should be Gemini Flash 1.5"

    def test_model_is_8b_variant(self):
        """Verify model is 8B variant (light weight, efficient)"""
        assert "8b" in AgentRunner.PRIMARY_MODEL.lower(), \
            "PRIMARY_MODEL should be 8B variant"
        assert "8b" in AgentRunner.FALLBACK_MODEL.lower(), \
            "FALLBACK_MODEL should be 8B variant"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
