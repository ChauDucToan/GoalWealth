import json

from fastapi.testclient import TestClient
from goalwealth.main import app

client = TestClient(app)

class DummySession:
    def __init__(self, region_name):
        self.region_name = region_name
        

def test_ec2_instances_uses_default_region_from_session(monkeypatch):
    fake_instances = [{"InstanceId": "i-1234567890"}]

    def fake_get_aws_session():
        return DummySession("ap-northeast-1")

    def fake_list_ec2_instances(region_name):
        assert region_name == "ap-northeast-1"
        return fake_instances

    monkeypatch.setattr("goalwealth.routers.main.get_aws_session", fake_get_aws_session)
    monkeypatch.setattr("goalwealth.routers.main.list_ec2_instances", fake_list_ec2_instances)

    response = client.get("/ec2/instances")

    assert response.status_code == 200
    assert response.json() == {
        "region": "ap-northeast-1",
        "instances": fake_instances,
    }


def test_ec2_instances_uses_query_region(monkeypatch):
    fake_instances = [{"InstanceId": "i-abcdef"}]

    def fake_list_ec2_instances(region_name):
        assert region_name == "us-east-1"
        return fake_instances

    monkeypatch.setattr("goalwealth.routers.main.list_ec2_instances", fake_list_ec2_instances)

    response = client.get("/ec2/instances?region=us-east-1")

    assert response.status_code == 200
    assert response.json() == {
        "region": "us-east-1",
        "instances": fake_instances,
    }


def test_ec2_instances_returns_error_when_aws_call_fails(monkeypatch):
    def fake_get_aws_session():
        return DummySession("ap-northeast-1")

    def fake_list_ec2_instances(region_name):
        raise Exception("AWS credentials are invalid")

    monkeypatch.setattr("goalwealth.routers.main.get_aws_session", fake_get_aws_session)
    monkeypatch.setattr("goalwealth.routers.main.list_ec2_instances", fake_list_ec2_instances)

    response = client.get("/ec2/instances")

    assert response.status_code == 200
    assert response.json() == {"error": "AWS credentials are invalid"}


class DummyUpstreamResponse:
    def __init__(self, status_code, payload):
        self.status = status_code
        self.payload = payload

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False

    def read(self):
        return json.dumps(self.payload).encode("utf-8")


def test_chat_completions_forwards_request_to_running_openclaw_instance(monkeypatch):
    request_payload = {
        "model": "meta-llama/Llama-3.1-8B-Instruct",
        "messages": [{"role": "user", "content": "Xin chao"}],
    }
    upstream_payload = {
        "id": "chatcmpl-123",
        "choices": [{"message": {"role": "assistant", "content": "Chao ban"}}],
    }

    def fake_get_aws_session():
        return DummySession("ap-southeast-2")

    def fake_find_ec2_instances_by_key_name(key_name, region_name):
        assert key_name == "OpenClaw"
        assert region_name == "ap-southeast-2"
        return [
            {
                "InstanceId": "i-openclaw",
                "KeyName": "openclaw",
                "State": {"Name": "running"},
                "PublicIpAddress": "34.87.1.10",
            }
        ]

    def fake_urlopen(request, timeout):
        assert request.full_url == "http://34.87.1.10:8000/v1/chat/completions"
        assert request.get_method() == "POST"
        assert timeout == 60.0
        assert json.loads(request.data.decode("utf-8")) == request_payload
        return DummyUpstreamResponse(200, upstream_payload)

    monkeypatch.setattr("goalwealth.routers.main.get_aws_session", fake_get_aws_session)
    monkeypatch.setattr(
        "goalwealth.routers.main.find_ec2_instances_by_key_name",
        fake_find_ec2_instances_by_key_name,
    )
    monkeypatch.setattr("goalwealth.routers.main.urlopen", fake_urlopen)

    response = client.post("/v1/chat/completions", json=request_payload)

    assert response.status_code == 200
    assert response.json() == upstream_payload


def test_chat_completions_returns_404_when_openclaw_instance_does_not_exist(monkeypatch):
    def fake_get_aws_session():
        return DummySession("ap-southeast-2")

    def fake_find_ec2_instances_by_key_name(key_name, region_name):
        assert key_name == "OpenClaw"
        assert region_name == "ap-southeast-2"
        return []

    monkeypatch.setattr("goalwealth.routers.main.get_aws_session", fake_get_aws_session)
    monkeypatch.setattr(
        "goalwealth.routers.main.find_ec2_instances_by_key_name",
        fake_find_ec2_instances_by_key_name,
    )

    response = client.post(
        "/v1/chat/completions",
        json={"model": "demo", "messages": [{"role": "user", "content": "Hi"}]},
    )

    assert response.status_code == 404
    assert response.json() == {
        "detail": "No EC2 instance found with key name 'OpenClaw'."
    }


def test_chat_completions_returns_503_when_openclaw_instance_is_not_running(monkeypatch):
    def fake_get_aws_session():
        return DummySession("ap-southeast-2")

    def fake_find_ec2_instances_by_key_name(key_name, region_name):
        assert key_name == "OpenClaw"
        assert region_name == "ap-southeast-2"
        return [
            {
                "InstanceId": "i-openclaw",
                "KeyName": "OpenClaw",
                "State": {"Name": "stopped"},
            }
        ]

    monkeypatch.setattr("goalwealth.routers.main.get_aws_session", fake_get_aws_session)
    monkeypatch.setattr(
        "goalwealth.routers.main.find_ec2_instances_by_key_name",
        fake_find_ec2_instances_by_key_name,
    )

    response = client.post(
        "/v1/chat/completions",
        json={"model": "demo", "messages": [{"role": "user", "content": "Hi"}]},
    )

    assert response.status_code == 503
    assert response.json() == {
        "detail": "EC2 instance with key name 'OpenClaw' is not running."
    }


def test_chat_completions_returns_503_when_running_instance_has_no_public_endpoint(monkeypatch):
    def fake_get_aws_session():
        return DummySession("ap-southeast-2")

    def fake_find_ec2_instances_by_key_name(key_name, region_name):
        assert key_name == "OpenClaw"
        assert region_name == "ap-southeast-2"
        return [
            {
                "InstanceId": "i-openclaw",
                "KeyName": "OpenClaw",
                "State": {"Name": "running"},
            }
        ]

    monkeypatch.setattr("goalwealth.routers.main.get_aws_session", fake_get_aws_session)
    monkeypatch.setattr(
        "goalwealth.routers.main.find_ec2_instances_by_key_name",
        fake_find_ec2_instances_by_key_name,
    )

    response = client.post(
        "/v1/chat/completions",
        json={"model": "demo", "messages": [{"role": "user", "content": "Hi"}]},
    )

    assert response.status_code == 503
    assert response.json() == {
        "detail": (
            "Running EC2 instance with key name 'OpenClaw' does not have a public "
            "endpoint."
        )
    }
