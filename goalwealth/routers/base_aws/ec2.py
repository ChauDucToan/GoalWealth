from goalwealth.routers.base_aws import get_aws_client

def list_ec2_instances(region_name=None):
    """
    List all EC2 instances in the specified region.

    :param region_name: The AWS region to connect to (optional).
    :return: A list of EC2 instances.
    """
    ec2_client = get_aws_client('ec2', region_name)
    response = ec2_client.describe_instances()
    
    instances = []
    for reservation in response['Reservations']:
        for instance in reservation['Instances']:
            instances.append(instance)
    
    return instances

def find_ec2_instances_by_key_name(key_name, region_name=None):
    """
    Find EC2 instances whose configured AWS key name matches the provided value.

    Matching is case-insensitive so the app can tolerate `OpenClaw` vs `openclaw`
    naming differences in configuration and user expectations.

    :param key_name: The EC2 key pair name to match.
    :param region_name: The AWS region to connect to (optional).
    :return: A list of matching EC2 instances.
    """
    normalized_key_name = key_name.casefold()
    return [
        instance
        for instance in list_ec2_instances(region_name)
        if instance.get("KeyName", "").casefold() == normalized_key_name
    ]
