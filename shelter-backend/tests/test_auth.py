def test_register_and_login(client):
    resp = client.post(
        "/api/v1/auth/register",
        json={"email": "alice@example.com", "password": "SuperSecret1", "name": "Alice"},
    )
    assert resp.status_code == 201
    assert "access_token" in resp.json()["data"]

    resp = client.post(
        "/api/v1/auth/login",
        json={"email": "alice@example.com", "password": "SuperSecret1"},
    )
    assert resp.status_code == 200
    assert "access_token" in resp.json()["data"]


def test_invalid_login(client):
    client.post(
        "/api/v1/auth/register",
        json={"email": "bob@example.com", "password": "SuperSecret1"},
    )
    resp = client.post(
        "/api/v1/auth/login",
        json={"email": "bob@example.com", "password": "wrong-password"},
    )
    assert resp.status_code == 401


def test_me_requires_jwt(client):
    resp = client.get("/api/v1/auth/me")
    assert resp.status_code == 401

    from tests.conftest import register_and_login

    token = register_and_login(client, email="carol@example.com")
    resp = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    assert resp.json()["data"]["email"] == "carol@example.com"


def test_google_oauth_route_exists(client):
    resp = client.get("/api/v1/auth/google/login", follow_redirects=False)
    # Without configured client id, we get a clean 400, not a 404 - proves the route exists.
    assert resp.status_code in (302, 400)


def test_github_oauth_route_exists(client):
    resp = client.get("/api/v1/auth/github/login", follow_redirects=False)
    assert resp.status_code in (302, 400)
