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