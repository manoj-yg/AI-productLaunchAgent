import pytest
from fastapi.testclient import TestClient
from app.main import create_app


@pytest.fixture(scope="module")
def test_client():
    """Supplies a client for standard route queries."""
    app = create_app()
    with TestClient(app) as client:
        yield client


@pytest.fixture
def anyio_backend():
    return 'asyncio'
