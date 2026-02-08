"""
Verification Tests for Schema Fixes
Tests that all critical fixes from the implementation plan work correctly:
1. Task model has status field
2. TaskToolbox uses UUID comparisons correctly
3. TaskToolbox returns 'id' field instead of 'task_id'
4. ChatService can access returned task fields
"""

import sys
import os
import inspect
from uuid import UUID

# Add backend directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)) + '/../..')


class TestSchemaAndToolboxFixes:
    """Verify all schema and toolbox fixes are in place"""

    def test_task_model_has_status_field(self):
        """AC1: Task model includes 'status' field"""
        from src.models.task import Task

        fields = Task.model_fields if hasattr(Task, 'model_fields') else Task.__fields__
        assert 'status' in fields, "Task model missing 'status' field"
        print("✅ Task model has 'status' field")

    def test_task_model_has_is_completed_field(self):
        """AC1: Task model keeps 'is_completed' for backwards compatibility"""
        from src.models.task import Task

        fields = Task.model_fields if hasattr(Task, 'model_fields') else Task.__fields__
        assert 'is_completed' in fields, "Task model missing 'is_completed' field"
        print("✅ Task model has 'is_completed' field (backwards compatible)")

    def test_task_model_fields_order(self):
        """Verify Task model has all required fields"""
        from src.models.task import Task

        fields = Task.model_fields if hasattr(Task, 'model_fields') else Task.__fields__
        required_fields = ['id', 'title', 'status', 'is_completed', 'priority', 'due_date', 'user_id']

        for field in required_fields:
            assert field in fields, f"Task model missing '{field}' field"

        print(f"✅ Task model has all required fields: {list(fields.keys())}")

    def test_task_toolbox_add_task_returns_id_field(self):
        """AC2: add_task returns 'id' field, not 'task_id'"""
        from src.tools.task_toolbox import TaskToolbox

        source = inspect.getsource(TaskToolbox.add_task)
        assert '"id": str(task.id)' in source, "add_task doesn't return 'id' field"
        print("✅ add_task returns 'id' field")

    def test_task_toolbox_list_tasks_returns_id_field(self):
        """AC2: list_tasks returns 'id' field, not 'task_id'"""
        from src.tools.task_toolbox import TaskToolbox

        source = inspect.getsource(TaskToolbox.list_tasks)
        assert '"id": str(task.id)' in source, "list_tasks doesn't return 'id' field"
        print("✅ list_tasks returns 'id' field")

    def test_task_toolbox_complete_task_returns_id_field(self):
        """AC2: complete_task returns 'id' field, not 'task_id'"""
        from src.tools.task_toolbox import TaskToolbox

        source = inspect.getsource(TaskToolbox.complete_task)
        assert '"id": str(task.id)' in source, "complete_task doesn't return 'id' field"
        print("✅ complete_task returns 'id' field")

    def test_task_toolbox_delete_task_returns_id_field(self):
        """AC2: delete_task returns 'id' field, not 'task_id'"""
        from src.tools.task_toolbox import TaskToolbox

        source = inspect.getsource(TaskToolbox.delete_task)
        assert '"id": str(task_id_int)' in source, "delete_task doesn't return 'id' field"
        print("✅ delete_task returns 'id' field")

    def test_task_toolbox_update_task_returns_id_field(self):
        """AC2: update_task returns 'id' field, not 'task_id'"""
        from src.tools.task_toolbox import TaskToolbox

        source = inspect.getsource(TaskToolbox.update_task)
        assert '"id": str(task.id)' in source, "update_task doesn't return 'id' field"
        print("✅ update_task returns 'id' field")

    def test_complete_task_uses_uuid_conversion(self):
        """AC3: complete_task converts task_id string to UUID"""
        from src.tools.task_toolbox import TaskToolbox

        source = inspect.getsource(TaskToolbox.complete_task)
        assert 'UUID(task_id)' in source, "complete_task doesn't use UUID() conversion"
        print("✅ complete_task uses UUID() conversion")

    def test_delete_task_uses_uuid_conversion(self):
        """AC3: delete_task converts task_id to UUID"""
        from src.tools.task_toolbox import TaskToolbox

        source = inspect.getsource(TaskToolbox.delete_task)
        assert 'UUID(' in source, "delete_task doesn't use UUID() conversion"
        print("✅ delete_task uses UUID() conversion")

    def test_update_task_uses_uuid_conversion(self):
        """AC3: update_task converts task_id to UUID"""
        from src.tools.task_toolbox import TaskToolbox

        source = inspect.getsource(TaskToolbox.update_task)
        assert 'UUID(' in source, "update_task doesn't use UUID() conversion"
        print("✅ update_task uses UUID() conversion")

    def test_chat_service_accesses_task_id_field(self):
        """AC4: ChatService accesses task.get('id'), not task.get('task_id')"""
        # Read the file directly to avoid import issues
        with open('/mnt/d/todo-evolution/phase_03/backend/src/services/chat_service.py', 'r') as f:
            content = f.read()

        assert "task.get('id'" in content, "ChatService doesn't access task.get('id')"
        print("✅ ChatService accesses task.get('id')")

    def test_chat_service_accesses_task_status_field(self):
        """AC4: ChatService accesses task.get('status')"""
        with open('/mnt/d/todo-evolution/phase_03/backend/src/services/chat_service.py', 'r') as f:
            content = f.read()

        assert "task.get('status'" in content, "ChatService doesn't access task.get('status')"
        print("✅ ChatService accesses task.get('status')")

    def test_imports_work(self):
        """AC1: All modules import without errors"""
        try:
            from src.models.task import Task
            from src.tools.task_toolbox import TaskToolbox
            print("✅ All imports successful (no schema/syntax errors)")
        except Exception as e:
            raise AssertionError(f"Import failed: {str(e)}")


if __name__ == '__main__':
    print("\n" + "="*70)
    print("SCHEMA FIXES VERIFICATION")
    print("="*70 + "\n")

    test = TestSchemaAndToolboxFixes()

    tests = [
        ('Task model has status field', test.test_task_model_has_status_field),
        ('Task model has is_completed field', test.test_task_model_has_is_completed_field),
        ('Task model fields complete', test.test_task_model_fields_order),
        ('add_task returns id field', test.test_task_toolbox_add_task_returns_id_field),
        ('list_tasks returns id field', test.test_task_toolbox_list_tasks_returns_id_field),
        ('complete_task returns id field', test.test_task_toolbox_complete_task_returns_id_field),
        ('delete_task returns id field', test.test_task_toolbox_delete_task_returns_id_field),
        ('update_task returns id field', test.test_task_toolbox_update_task_returns_id_field),
        ('complete_task uses UUID conversion', test.test_complete_task_uses_uuid_conversion),
        ('delete_task uses UUID conversion', test.test_delete_task_uses_uuid_conversion),
        ('update_task uses UUID conversion', test.test_update_task_uses_uuid_conversion),
        ('ChatService accesses id field', test.test_chat_service_accesses_task_id_field),
        ('ChatService accesses status field', test.test_chat_service_accesses_task_status_field),
        ('Imports work', test.test_imports_work),
    ]

    passed = 0
    failed = 0

    for name, test_func in tests:
        try:
            test_func()
            passed += 1
        except AssertionError as e:
            print(f"❌ {name}: {str(e)}")
            failed += 1
        except Exception as e:
            print(f"❌ {name}: {str(e)}")
            failed += 1

    print("\n" + "="*70)
    print(f"RESULTS: {passed} passed, {failed} failed out of {len(tests)} tests")
    print("="*70 + "\n")

    if failed == 0:
        print("✅ All verification tests passed!")
        sys.exit(0)
    else:
        print(f"❌ {failed} test(s) failed")
        sys.exit(1)
