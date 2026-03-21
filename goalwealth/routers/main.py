from goalwealth.routers.base_aws.ec2 import list_ec2_instances
from goalwealth.routers.base_aws import get_aws_session
from fastapi import APIRouter

router = APIRouter()
@router.get("/ec2/instances")
def get_ec2_instances(region: str = None):
    """
    API endpoint to get a list of EC2 instances.

    :param region: The AWS region to connect to (optional).
    :return: A list of EC2 instances.
    """
    if region:
        region = region.strip()
    else:
        region = get_aws_session().region_name  # Use configured default region if not provided

    try:
        instances = list_ec2_instances(region)
        return {"region": region, "instances": instances}
    except Exception as e:
        return {"error": str(e)}
