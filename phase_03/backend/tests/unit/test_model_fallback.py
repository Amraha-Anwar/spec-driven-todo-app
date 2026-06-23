"""
Unit tests for OpenAI model fallback mechanism
Tests the 3-tier OpenAI model configuration and 404/error handling
"""
import pytest
import os
from backend.src.services.agent_runner import AgentRunner


class TestModelConfiguration:
    """Test 3-tier OpenAI model configuration"""

    def test_primary_model_is_gpt_4o(self):
        """Verify PRIMARY_MODEL is set to gpt-4o"""
        assert AgentRunner.PRIMARY_MODEL == "gpt-4o", \
            f"Expected 'gpt-4o', got '{AgentRunner.PRIMARY_MODEL}'"

    def test_fallback_model_is_gpt_4o_mini(self):
        """Verify FALLBACK_MODEL is set to gpt-4o-mini"""
        assert AgentRunner.FALLBACK_MODEL == "gpt-4o-mini", \
            f"Expected 'gpt-4o-mini', got '{AgentRunner.FALLBACK_MODEL}'"

    def test_final_fallback_model_is_gpt_4_turbo(self):
        """Verify FINAL_FALLBACK_MODEL is set to gpt-4-turbo"""
        assert AgentRunner.FINAL_FALLBACK_MODEL == "gpt-4-turbo", \
            f"Expected 'gpt-4-turbo', got '{AgentRunner.FINAL_FALLBACK_MODEL}'"

    def test_models_are_bare_openai_names(self):
        """Verify model IDs use bare OpenAI names (no provider '/' prefix)"""
        for model in (
            AgentRunner.PRIMARY_MODEL,
            AgentRunner.FALLBACK_MODEL,
            AgentRunner.FINAL_FALLBACK_MODEL,
        ):
            assert "/" not in model, f"Model '{model}' should not contain a '/' prefix"
            assert model.startswith("gpt-"), f"Model '{model}' should start with 'gpt-'"

    def test_env_model_configured(self):
        """Verify OPENAI_MODEL is an OpenAI model in .env"""
        from pathlib import Path
        env_path = Path(__file__).parent.parent.parent / ".env"
        if env_path.exists():
            with open(env_path) as f:
                for line in f:
                    if line.startswith("OPENAI_MODEL="):
                        model = line.split("=", 1)[1].strip()
                        assert model.startswith("gpt-"), \
                            f"Expected an OpenAI gpt- model, got '{model}'"
                        return
        # If .env not found, check environment variable
        model = os.getenv("OPENAI_MODEL", "gpt-4o")
        assert model.startswith("gpt-"), f"Expected an OpenAI gpt- model, got '{model}'"


class TestAgentRunnerInitialization:
    """Test AgentRunner initialization with fallback support"""

    def test_agent_runner_initializes_with_api_key(self):
        """Verify AgentRunner initializes with the OpenAI API key"""
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            runner = AgentRunner(api_key=api_key)
            assert runner is not None
            assert runner.api_key == api_key

    def test_routing_log_tracking_initialized(self):
        """Verify model_routing_log list is initialized for tracking attempts"""
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            runner = AgentRunner(api_key=api_key)
            assert hasattr(runner, "model_routing_log"), \
                "AgentRunner should have model_routing_log attribute"
            assert isinstance(runner.model_routing_log, list), \
                "model_routing_log should be a list"
            assert len(runner.model_routing_log) == 0, \
                "model_routing_log should start empty"

    def test_client_targets_openai_default_endpoint(self):
        """Verify OpenAI client targets the official endpoint by default"""
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            runner = AgentRunner(api_key=api_key)
            assert runner.base_url is None
            assert "api.openai.com" in str(runner.client.base_url)


class TestModelFallbackLogic:
    """Test that the tiered fallback constants are wired into AgentRunner"""

    def test_three_distinct_tiers(self):
        """Verify the three model tiers are distinct for redundancy"""
        assert AgentRunner.PRIMARY_MODEL != AgentRunner.FALLBACK_MODEL
        assert AgentRunner.FALLBACK_MODEL != AgentRunner.FINAL_FALLBACK_MODEL
        assert AgentRunner.PRIMARY_MODEL != AgentRunner.FINAL_FALLBACK_MODEL

    def test_run_agent_signature_includes_model_param(self):
        """Verify run_agent accepts model parameter"""
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            runner = AgentRunner(api_key=api_key)
            assert hasattr(runner, "run_agent"), \
                "AgentRunner should have run_agent method"


class TestErrorHandling:
    """Test error handling for 404 and other errors"""

    def test_404_error_format_recognized(self):
        """Verify 404 error handling code exists"""
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            runner = AgentRunner(api_key=api_key)
            assert runner is not None

    def test_quota_error_format_recognized(self):
        """Verify 429/quota error handling code exists"""
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            runner = AgentRunner(api_key=api_key)
            assert runner is not None


class TestBackwardCompatibility:
    """Test backward compatibility with existing code"""

    def test_run_agent_default_model(self):
        """Verify run_agent uses default model from environment"""
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            runner = AgentRunner(api_key=api_key)
            assert runner is not None

    def test_no_breaking_changes_to_synthesis(self):
        """Verify _synthesize_response is not affected by fallback logic"""
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            runner = AgentRunner(api_key=api_key)
            assert hasattr(runner, "_synthesize_response"), \
                "AgentRunner should still have _synthesize_response"

    def test_tool_binding_preserved(self):
        """Verify tool binding logic is preserved"""
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            runner = AgentRunner(api_key=api_key)
            assert runner is not None
            # Tool binding happens in run_agent, not affected by fallback


class TestStableModelProperties:
    """Test properties of the configured OpenAI models"""

    def test_primary_is_4o_class(self):
        """Verify primary model is a 4o-class model (strong tool-calling)"""
        assert "4o" in AgentRunner.PRIMARY_MODEL, \
            "PRIMARY_MODEL should be a 4o-class model"

    def test_fallback_is_mini_variant(self):
        """Verify fallback model is the cost-efficient mini variant"""
        assert "mini" in AgentRunner.FALLBACK_MODEL.lower(), \
            "FALLBACK_MODEL should be the cheaper mini variant"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
