import json
import os

from fastapi import APIRouter, Body, HTTPException, Request
from fastapi.responses import JSONResponse
from urllib.error import HTTPError, URLError
from urllib.request import Request as UrlRequest, urlopen

from goalwealth.routers.base_aws.ec2 import (
    find_ec2_instances_by_key_name,
    list_ec2_instances,
)
from goalwealth.routers.base_aws import get_aws_session

router = APIRouter()
CHAT_COMPLETIONS_PATH = "/v1/chat/completions"
CHAT_EC2_KEY_NAME = os.getenv("EC2_CHAT_KEY_NAME", "OpenClaw")
CHAT_EC2_PORT = int(os.getenv("EC2_CHAT_PORT", "8000"))
CHAT_EC2_TIMEOUT_SECONDS = float(os.getenv("EC2_CHAT_TIMEOUT_SECONDS", "60"))


def _resolve_region(region: str | None) -> str | None:
    if region:
        return region.strip()
    return get_aws_session().region_name


def _get_chat_instance(region: str | None):
    instances = find_ec2_instances_by_key_name(CHAT_EC2_KEY_NAME, region)
    if not instances:
        raise HTTPException(
            status_code=404,
            detail=f"No EC2 instance found with key name '{CHAT_EC2_KEY_NAME}'.",
        )

    running_instances = [
        instance
        for instance in instances
        if instance.get("State", {}).get("Name") == "running"
    ]
    if not running_instances:
        raise HTTPException(
            status_code=503,
            detail=f"EC2 instance with key name '{CHAT_EC2_KEY_NAME}' is not running.",
        )

    return running_instances[0]


def _get_chat_instance_host(instance: dict) -> str | None:
    return instance.get("PublicDnsName") or instance.get("PublicIpAddress")


def _load_upstream_body(response) -> dict:
    body = response.read().decode("utf-8")
    if not body:
        return {}

    try:
        return json.loads(body)
    except json.JSONDecodeError:
        return {"detail": body}


def _forward_chat_completion(request: Request, payload: dict, host: str):
    upstream_request = UrlRequest(
        f"http://{host}:{CHAT_EC2_PORT}{CHAT_COMPLETIONS_PATH}",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    authorization_header = request.headers.get("authorization")
    if authorization_header:
        upstream_request.add_header("Authorization", authorization_header)

    try:
        with urlopen(upstream_request, timeout=CHAT_EC2_TIMEOUT_SECONDS) as response:
            return JSONResponse(
                status_code=response.status,
                content=_load_upstream_body(response),
            )
    except HTTPError as exc:
        return JSONResponse(
            status_code=exc.code,
            content=_load_upstream_body(exc),
        )
    except URLError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Unable to reach EC2 chat server: {exc.reason}",
        ) from exc


@router.get("/ec2/instances")
def get_ec2_instances(region: str = None):
    """
    API endpoint to get a list of EC2 instances.

    :param region: The AWS region to connect to (optional).
    :return: A list of EC2 instances.
    """
    region = _resolve_region(region)

    try:
        instances = list_ec2_instances(region)
        return {"region": region, "instances": instances}
    except Exception as e:
        return {"error": str(e)}


@router.post(CHAT_COMPLETIONS_PATH)
def create_chat_completion(
    request: Request,
    payload: dict = Body(...),
    region: str | None = None,
):
    region = _resolve_region(region)
    instance = _get_chat_instance(region)
    host = _get_chat_instance_host(instance)

    if not host:
        raise HTTPException(
            status_code=503,
            detail=(
                f"Running EC2 instance with key name '{CHAT_EC2_KEY_NAME}' does not "
                "have a public endpoint."
            ),
        )

    return _forward_chat_completion(request, payload, host)
