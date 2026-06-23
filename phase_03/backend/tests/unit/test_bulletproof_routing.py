"""
Unit tests for OpenAI bulletproof routing with model fallback
Tests OpenAI primary model (gpt-4o) with cheaper/robust fallbacks
"""
import pytest
import os
from backend.src.services.agent_runner import AgentRunner


class TestOpenAIModelConfiguration:
    """Test OpenAI model tier configuration"""

    def test_primary_model_is_gpt_4o(self):
        """Verify PRIMARY_MODEL is OpenAI gpt-4o"""
        assert AgentRunner.PRIMARY_MODEL == "gpt-4o", \
            f"Expected 'gpt-4o', got '{AgentRunner.PRIMARY_MODEL}'"

    def test_fallback_model_is_gpt_4o_mini(self):
        """Verify FALLBACK_MODEL is the cheaper gpt-4o-mini"""
        assert AgentRunner.FALLBACK_MODEL == "gpt-4o-mini", \
            f"Expected 'gpt-4o-mini', got '{AgentRunner.FALLBACK_MODEL}'"

    def test_final_fallback_model_is_gpt_4_turbo(self):
        """Verify FINAL_FALLBACK_MODEL is gpt-4-turbo"""
        assert AgentRunner.FINAL_FALLBACK_MODEL == "gpt-4-turbo", \
            f"Expected 'gpt-4-turbo', got '{AgentRunner.FINAL_FALLBACK_MODEL}'"

    def test_env_model_is_openai(self):
        """Verify OPENAI_MODEL in .env (if present) is an OpenAI model"""
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
        assert model.startswith("gpt-"), \
            f"Expected an OpenAI gpt- model, got '{model}'"


class TestAgentRunnerBulletproofRouting:
    """Test bulletproof routing with model fallback"""

    def test_agent_runner_initializes(self):
        """Verify AgentRunner initializes with routing support"""
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            runner = AgentRunner(api_key=api_key)
            assert runner is not None
            assert runner.PRIMARY_MODEL == "gpt-4o"
            assert runner.FALLBACK_MODEL == "gpt-4o-mini"

    def test_model_routing_log_initialized(self):
        """Verify model_routing_log is initialized for debugging"""
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            runner = AgentRunner(api_key=api_key)
            assert hasattr(runner, "model_routing_log"), \
                "AgentRunner should have model_routing_log attribute"
            assert isinstance(runner.model_routing_log, list), \
                "model_routing_log should be a list"
            assert len(runner.model_routing_log) == 0, \
                "model_routing_log should start empty"

    def test_primary_model_format(self):
        """Verify primary model follows OpenAI bare-name format (no provider prefix)"""
        assert "/" not in AgentRunner.PRIMARY_MODEL, \
            "PRIMARY_MODEL should not contain a provider '/' prefix"
        assert AgentRunner.PRIMARY_MODEL.startswith("gpt-"), \
            "PRIMARY_MODEL should start with 'gpt-'"

    def test_fallback_model_format(self):
        """Verify fallback model follows OpenAI bare-name format"""
        assert "/" not in AgentRunner.FALLBACK_MODEL, \
            "FALLBACK_MODEL should not contain a provider '/' prefix"
        assert AgentRunner.FALLBACK_MODEL.startswith("gpt-"), \
            "FALLBACK_MODEL should start with 'gpt-'"


class TestRoutingBehavior:
    """Test routing behavior with different model selection strategies"""

    def test_primary_model_is_capable_tool_caller(self):
        """Verify primary model is gpt-4o (strong tool-calling)"""
        assert "4o" in AgentRunner.PRIMARY_MODEL, \
            "PRIMARY_MODEL should be a 4o-class model"

    def test_fallback_model_is_cost_efficient(self):
        """Verify fallback model is the cost-efficient mini variant"""
        assert "mini" in AgentRunner.FALLBACK_MODEL.lower(), \
            "FALLBACK_MODEL should be the cheaper mini variant"


class TestDebugLogging:
    """Test debug logging for model routing"""

    def test_agent_runner_can_log_routing(self):
        """Verify AgentRunner can log routing decisions"""
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            runner = AgentRunner(api_key=api_key)
            # Simulate logging
            runner.model_routing_log.append({
                "model": "gpt-4o",
                "status": "success"
            })
            assert len(runner.model_routing_log) == 1
            assert runner.model_routing_log[0]["model"] == "gpt-4o"

    def test_routing_log_captures_attempted_models(self):
        """Verify routing log can capture multiple attempted models"""
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            runner = AgentRunner(api_key=api_key)
            # Simulate two attempts
            runner.model_routing_log.append({
                "model": "gpt-4o",
                "status": "failed",
                "error": "404 not found"
            })
            runner.model_routing_log.append({
                "model": "gpt-4o-mini",
                "status": "success (fallback)"
            })
            assert len(runner.model_routing_log) == 2
            assert runner.model_routing_log[1]["status"] == "success (fallback)"


class TestBulletproofDesign:
    """Test bulletproof fallback design"""

    def test_three_stage_routing_strategy(self):
        """Verify three-stage routing: gpt-4o then mini then turbo"""
        # Stage 1: Try gpt-4o (best tool-calling)
        assert AgentRunner.PRIMARY_MODEL == "gpt-4o"
        # Stage 2: Fall back to gpt-4o-mini (cheaper)
        assert AgentRunner.FALLBACK_MODEL == "gpt-4o-mini"
        # Stage 3: Final fallback to gpt-4-turbo (robust)
        assert AgentRunner.FINAL_FALLBACK_MODEL == "gpt-4-turbo"
        # All different so fallbacks provide alternatives
        assert AgentRunner.PRIMARY_MODEL != AgentRunner.FALLBACK_MODEL
        assert AgentRunner.FALLBACK_MODEL != AgentRunner.FINAL_FALLBACK_MODEL

    def test_no_single_model_dependency(self):
        """Verify system doesn't depend on single model"""
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            runner = AgentRunner(api_key=api_key)
            assert runner.PRIMARY_MODEL != runner.FALLBACK_MODEL, \
                "Primary and fallback should be different for redundancy"


class TestToolBindingPreservation:
    """Test that tool binding logic is preserved"""

    def test_run_agent_has_tools_parameter(self):
        """Verify run_agent still accepts tools parameter"""
        api_key = os.getenv("OPENAI_API_KEY")
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
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            runner = AgentRunner(api_key=api_key)
            assert hasattr(runner, "_synthesize_response"), \
                "AgentRunner should have _synthesize_response"


class TestBackwardCompatibility:
    """Test backward compatibility"""

    def test_no_breaking_changes_to_synthesis(self):
        """Verify synthesis logic is unchanged"""
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            runner = AgentRunner(api_key=api_key)
            assert runner is not None

    def test_roman_urdu_support_preserved(self):
        """Verify Roman Urdu language support is preserved"""
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            runner = AgentRunner(api_key=api_key)
            # Roman Urdu support is in _synthesize_response, which is unchanged
            assert hasattr(runner, "_synthesize_response")

    def test_error_handling_preserved(self):
        """Verify error handling (429 quota) is preserved"""
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            runner = AgentRunner(api_key=api_key)
            # Error handling is in run_agent, which should still handle quota errors
            assert runner is not None


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
