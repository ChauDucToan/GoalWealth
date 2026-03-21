import os
import boto3

from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[3]
LOCAL_AWS_DIR = PROJECT_ROOT / "aws"
LOCAL_AWS_CONFIG = LOCAL_AWS_DIR / "config"
LOCAL_AWS_CREDENTIALS = LOCAL_AWS_DIR / "credentials"

def get_aws_session(region_name=None):
    """
    Build a boto3 session, preferring the project's local AWS config files when present.

    :param region_name: Optional AWS region override.
    :return: A configured boto3 session.
    """
    if LOCAL_AWS_CONFIG.exists():
        os.environ.setdefault("AWS_CONFIG_FILE", str(LOCAL_AWS_CONFIG))
    if LOCAL_AWS_CREDENTIALS.exists():
        os.environ.setdefault("AWS_SHARED_CREDENTIALS_FILE", str(LOCAL_AWS_CREDENTIALS))

    return boto3.Session(region_name=region_name)

def get_aws_client(service_name, region_name=None):
    """
    Get an AWS client for the specified service.

    :param service_name: The name of the AWS service (e.g., 's3', 'ec2').
    :param region_name: The AWS region to connect to (optional).
    :return: A boto3 client for the specified service.
    """
    return get_aws_session(region_name).client(service_name)

def get_aws_resource(service_name, region_name=None):
    """
    Get an AWS resource for the specified service.

    :param service_name: The name of the AWS service (e.g., 's3', 'ec2').
    :param region_name: The AWS region to connect to (optional).
    :return: A boto3 resource for the specified service.
    """
    return get_aws_session(region_name).resource(service_name)
