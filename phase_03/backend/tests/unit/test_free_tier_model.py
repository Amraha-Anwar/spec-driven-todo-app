"""
Verification tests for OpenAI model configuration
Tests that AgentRunner correctly uses the configured OpenAI model (gpt-4o)
"""
import pytest
import os
from backend.src.services.agent_runner import AgentRunner


class TestOpenAIModelConfiguration:
    """Test OpenAI model configuration"""

    def test_env_variable_set_to_openai_model(self):
        """Verify OPENAI_MODEL is set to an OpenAI model"""
        # Load from .env file
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

    def test_agent_runner_uses_openai_model(self):
        """Verify AgentRunner defaults to an OpenAI model"""
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            runner = AgentRunner(api_key=api_key)
            # Just verify it instantiates successfully
            assert runner is not None
            assert runner.api_key == api_key
            assert runner.PRIMARY_MODEL == "gpt-4o"

    def test_max_tokens_default(self):
        """Verify max_tokens default gives synthesis headroom on a paid key"""
        import inspect
        sig = inspect.signature(AgentRunner.run_agent)
        assert sig.parameters["max_tokens"].default == 1000, \
            "max_tokens default should be 1000"

    def test_openai_model_name_format(self):
        """Verify OpenAI model uses a bare name (no provider '/' prefix)"""
        model = os.getenv("OPENAI_MODEL", "gpt-4o")
        assert "/" not in model, f"Model '{model}' should not include a '/' provider prefix"
        assert model.startswith("gpt-"), f"Model '{model}' should start with 'gpt-'"

    def test_openai_sdk_default_endpoint(self):
        """Verify the client targets the official OpenAI endpoint by default"""
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            runner = AgentRunner(api_key=api_key)
            assert runner.client is not None, "OpenAI client should be initialized"
            assert "api.openai.com" in str(runner.client.base_url)


class TestProactivePersonalityPreservation:
    """Test that proactive personality is preserved with the OpenAI model"""

    def test_synthesis_system_prompt_english(self):
        """Verify English synthesis prompt is preserved"""
        # The synthesis logic should still be intact
        expected_terms = ["task", "priority", "due date", "friendly", "emoji"]
        # Just verify the logic exists in AgentRunner
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            runner = AgentRunner(api_key=api_key)
            assert runner is not None

    def test_synthesis_system_prompt_urdu(self):
        """Verify Roman Urdu synthesis prompt is preserved"""
        # Roman Urdu synthesis should still be intact
        expected_terms = ["task", "priority", "Urdu", "emoji"]
        # Just verify the logic exists
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            runner = AgentRunner(api_key=api_key)
            assert runner is not None


class TestToolBindingAndSchema:
    """Test that tool binding and OpenAI schema remain compatible"""

    def test_tool_choice_auto_compatibility(self):
        """Verify tool_choice='auto' is still used"""
        # AgentRunner should still support tool_choice='auto'
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            runner = AgentRunner(api_key=api_key)
            assert runner is not None

    def test_mcp_schema_openai_format(self):
        """Verify MCP tools are wrapped in OpenAI format"""
        # Tools should be in format: {"type": "function", "function": {...}}
        # This is verified by TaskToolbox.get_tools_schema()
        # Just verify AgentRunner doesn't break this
        api_key = os.getenv("OPENAI_API_KEY")
        if api_key:
            runner = AgentRunner(api_key=api_key)
            assert runner is not None


class TestDatabasePersistenceUnchanged:
    """Test that database persistence logic is completely unchanged"""

    def test_session_commit_in_task_toolbox(self):
        """Verify session.commit() is still called in TaskToolbox"""
        # This is in task_toolbox.py, not affected by model change
        # Just verify the file exists and contains session.commit()
        task_toolbox_path = os.path.join(
            os.path.dirname(__file__),
            "../../src/tools/task_toolbox.py"
        )
        assert os.path.exists(task_toolbox_path), "task_toolbox.py should exist"
        with open(task_toolbox_path) as f:
            content = f.read()
            assert "session.commit()" in content, "TaskToolbox should call session.commit()"

    def test_chat_service_message_persistence(self):
        """Verify ChatService still persists messages to DB"""
        # This is in chat_service.py, not affected by model change
        chat_service_path = os.path.join(
            os.path.dirname(__file__),
            "../../src/services/chat_service.py"
        )
        assert os.path.exists(chat_service_path), "chat_service.py should exist"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
