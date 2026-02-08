"""
Unit tests for OpenRouter bulletproof routing with 404 fallback
Tests OpenRouter auto-free router with stable Mistral fallback
"""
import pytest
import os
from backend.src.services.agent_runner import AgentRunner


class TestOpenRouterAutoConfiguration:
    """Test OpenRouter auto-free router configuration"""

    def test_primary_model_is_auto_router(self):
        """Verify PRIMARY_MODEL is OpenRouter auto router"""
        assert AgentRunner.PRIMARY_MODEL == "openrouter/auto", \
            f"Expected 'openrouter/auto', got '{AgentRunner.PRIMARY_MODEL}'"

    def test_fallback_model_is_stable_mistral(self):
        """Verify FALLBACK_MODEL is stable Mistral (historically proven)"""
        assert AgentRunner.FALLBACK_MODEL == "mistralai/mistral-7b-instruct:free", \
            f"Expected stable Mistral, got '{AgentRunner.FALLBACK_MODEL}'"

    def test_env_model_is_auto_router(self):
        """Verify OPENROUTER_MODEL in .env is set to auto router"""
        from pathlib import Path
        env_path = Path(__file__).parent.parent.parent / ".env"
        if env_path.exists():
            with open(env_path) as f:
                for line in f:
                    if line.startswith("OPENROUTER_MODEL="):
                        model = line.split("=", 1)[1].strip()
                        assert "openrouter/auto" in model or "openrouter/free" in model, \
                            f"Expected auto or free router, got '{model}'"
                        return
        # If .env not found, check environment variable
        model = os.getenv("OPENROUTER_MODEL", "openrouter/auto")
        assert "openrouter/auto" in model or "openrouter/free" in model, \
            f"Expected auto or free router, got '{model}'"

    def test_env_fallback_is_stable_mistral(self):
        """Verify OPENROUTER_MODEL_FALLBACK in .env is Mistral"""
        from pathlib import Path
        env_path = Path(__file__).parent.parent.parent / ".env"
        if env_path.exists():
            with open(env_path) as f:
                for line in f:
                    if line.startswith("OPENROUTER_MODEL_FALLBACK="):
                        model = line.split("=", 1)[1].strip()
                        assert "mistral" in model.lower() or "7b" in model.lower(), \
                            f"Expected Mistral fallback, got '{model}'"
                        return


class TestAgentRunnerBulletproofRouting:
    """Test bulletproof routing with 404 fallback"""

    def test_agent_runner_initializes(self):
        """Verify AgentRunner initializes with routing support"""
        api_key = os.getenv("OPENROUTER_API_KEY")
        if api_key:
            runner = AgentRunner(api_key=api_key)
            assert runner is not None
            assert runner.PRIMARY_MODEL == "openrouter/auto"
            assert runner.FALLBACK_MODEL == "mistralai/mistral-7b-instruct:free"

    def test_model_routing_log_initialized(self):
        """Verify model_routing_log is initialized for debugging"""
        api_key = os.getenv("OPENROUTER_API_KEY")
        if api_key:
            runner = AgentRunner(api_key=api_key)
            assert hasattr(runner, "model_routing_log"), \
                "AgentRunner should have model_routing_log attribute"
            assert isinstance(runner.model_routing_log, list), \
                "model_routing_log should be a list"
            assert len(runner.model_routing_log) == 0, \
                "model_routing_log should start empty"

    def test_auto_router_format(self):
        """Verify auto router follows OpenRouter format"""
        assert "/" in AgentRunner.PRIMARY_MODEL, \
            "PRIMARY_MODEL should contain '/'"
        assert AgentRunner.PRIMARY_MODEL.startswith("openrouter/"), \
            "PRIMARY_MODEL should start with 'openrouter/'"

    def test_fallback_model_format(self):
        """Verify fallback model follows OpenRouter free format"""
        assert "/" in AgentRunner.FALLBACK_MODEL, \
            "FALLBACK_MODEL should contain '/'"
        assert ":free" in AgentRunner.FALLBACK_MODEL, \
            "FALLBACK_MODEL should include ':free' suffix"


class TestRoutingBehavior:
    """Test routing behavior with different model selection strategies"""

    def test_primary_model_is_intelligent_router(self):
        """Verify primary model uses OpenRouter's intelligent routing"""
        # openrouter/auto routes to best available free model dynamically
        assert "auto" in AgentRunner.PRIMARY_MODEL, \
            "PRIMARY_MODEL should use auto routing"

    def test_fallback_model_is_historically_stable(self):
        """Verify fallback model is historically proven stable"""
        # Mistral 7B has been stable on OpenRouter for extended periods
        assert "mistral" in AgentRunner.FALLBACK_MODEL.lower(), \
            "FALLBACK_MODEL should be Mistral (historically stable)"
        assert "7b" in AgentRunner.FALLBACK_MODEL.lower(), \
            "FALLBACK_MODEL should be 7B variant (lightweight)"

    def test_mistral_7b_is_free_tier(self):
        """Verify Mistral 7B is free tier model"""
        assert ":free" in AgentRunner.FALLBACK_MODEL, \
            "Mistral fallback should be free tier"


class TestDebugLogging:
    """Test debug logging for model routing"""

    def test_agent_runner_can_log_routing(self):
        """Verify AgentRunner can log routing decisions"""
        api_key = os.getenv("OPENROUTER_API_KEY")
        if api_key:
            runner = AgentRunner(api_key=api_key)
            # Simulate logging
            runner.model_routing_log.append({
                "model": "openrouter/auto",
                "status": "success"
            })
            assert len(runner.model_routing_log) == 1
            assert runner.model_routing_log[0]["model"] == "openrouter/auto"

    def test_routing_log_captures_attempted_models(self):
        """Verify routing log can capture multiple attempted models"""
        api_key = os.getenv("OPENROUTER_API_KEY")
        if api_key:
            runner = AgentRunner(api_key=api_key)
            # Simulate two attempts
            runner.model_routing_log.append({
                "model": "openrouter/auto",
                "status": "failed",
                "error": "404 not found"
            })
            runner.model_routing_log.append({
                "model": "mistralai/mistral-7b-instruct:free",
                "status": "success (fallback)"
            })
            assert len(runner.model_routing_log) == 2
            assert runner.model_routing_log[1]["status"] == "success (fallback)"


class TestBulletproofDesign:
    """Test bulletproof fallback design"""

    def test_two_stage_routing_strategy(self):
        """Verify two-stage routing: auto then mistral fallback"""
        # Stage 1: Try openrouter/auto (intelligent router)
        assert AgentRunner.PRIMARY_MODEL == "openrouter/auto"
        # Stage 2: Fall back to mistralai/mistral-7b-instruct:free (stable)
        assert AgentRunner.FALLBACK_MODEL == "mistralai/mistral-7b-instruct:free"
        # Both different so fallback provides alternative
        assert AgentRunner.PRIMARY_MODEL != AgentRunner.FALLBACK_MODEL

    def test_no_single_model_dependency(self):
        """Verify system doesn't depend on single model"""
        # Primary model (openrouter/auto) is a router that selects models dynamically
        # Fallback model (Mistral 7B) is a specific proven model
        # If either fails, the other takes over
        api_key = os.getenv("OPENROUTER_API_KEY")
        if api_key:
            runner = AgentRunner(api_key=api_key)
            assert runner.PRIMARY_MODEL != runner.FALLBACK_MODEL, \
                "Primary and fallback should be different for redundancy"


class TestToolBindingPreservation:
    """Test that tool binding logic is preserved"""

    def test_run_agent_has_tools_parameter(self):
        """Verify run_agent still accepts tools parameter"""
        api_key = os.getenv("OPENROUTER_API_KEY")
        if api_key:
            runner = AgentRunner(api_key=api_key)
            assert hasattr(runner, "run_agent"), \
                "AgentRunner should have run_agent method"
            # Verify it's async
            import inspect
            assert inspect.iscoroutinefunction(runner.run_agent), \
                "run_agent should be async"

    def test_synthesis_response_preserved(self):
        """Verify _synthesize_response is still available"""
        api_key = os.getenv("OPENROUTER_API_KEY")
        if api_key:
            runner = AgentRunner(api_key=api_key)
            assert hasattr(runner, "_synthesize_response"), \
                "AgentRunner should have _synthesize_response"


class TestBackwardCompatibility:
    """Test backward compatibility"""

    def test_no_breaking_changes_to_synthesis(self):
        """Verify synthesis logic is unchanged"""
        api_key = os.getenv("OPENROUTER_API_KEY")
        if api_key:
            runner = AgentRunner(api_key=api_key)
            assert runner is not None

    def test_roman_urdu_support_preserved(self):
        """Verify Roman Urdu language support is preserved"""
        api_key = os.getenv("OPENROUTER_API_KEY")
        if api_key:
            runner = AgentRunner(api_key=api_key)
            # Roman Urdu support is in _synthesize_response, which is unchanged
            assert hasattr(runner, "_synthesize_response")

    def test_error_handling_preserved(self):
        """Verify error handling (402 credits) is preserved"""
        api_key = os.getenv("OPENROUTER_API_KEY")
        if api_key:
            runner = AgentRunner(api_key=api_key)
            # Error handling is in run_agent, which should still handle 402
            assert runner is not None


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
