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
