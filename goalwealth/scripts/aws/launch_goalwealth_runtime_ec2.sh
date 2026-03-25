#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 4 ]]; then
  echo "Usage: $0 <name> <region> <subnet-id> <security-group-id> [key-name] [instance-profile-name] [instance-type] [user-data-file]" >&2
  echo "Example: $0 goalwealth-openclaw-dev ap-northeast-1 subnet-123 sg-123 my-key GoalWealthEc2Role t4g.small ./user-data.sh" >&2
  exit 1
fi

NAME="$1"
REGION="$2"
SUBNET_ID="$3"
SECURITY_GROUP_ID="$4"
KEY_NAME="${5:-}"
INSTANCE_PROFILE_NAME="${6:-}"
INSTANCE_TYPE="${7:-t4g.small}"
USER_DATA_FILE="${8:-}"

AMI_PARAM="/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-arm64"
AMI_ID="$(aws ssm get-parameter --region "$REGION" --name "$AMI_PARAM" --query 'Parameter.Value' --output text)"

CMD=(aws ec2 run-instances
  --region "$REGION"
  --image-id "$AMI_ID"
  --instance-type "$INSTANCE_TYPE"
  --subnet-id "$SUBNET_ID"
  --security-group-ids "$SECURITY_GROUP_ID"
  --metadata-options 'HttpTokens=required,HttpEndpoint=enabled'
  --block-device-mappings '[{"DeviceName":"/dev/xvda","Ebs":{"VolumeSize":30,"VolumeType":"gp3","DeleteOnTermination":true}}]'
  --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=$NAME},{Key=Project,Value=GoalWealth}]"
  --query 'Instances[0].{InstanceId:InstanceId,PrivateIp:PrivateIpAddress,PublicIp:PublicIpAddress,Architecture:Architecture,ImageId:ImageId,State:State.Name}'
  --output json)

if [[ -n "$KEY_NAME" ]]; then
  CMD+=(--key-name "$KEY_NAME")
fi

if [[ -n "$INSTANCE_PROFILE_NAME" ]]; then
  CMD+=(--iam-instance-profile "Name=$INSTANCE_PROFILE_NAME")
fi

if [[ -n "$USER_DATA_FILE" ]]; then
  CMD+=(--user-data "file://$USER_DATA_FILE")
fi

printf 'Launching GoalWealth runtime EC2 (ARM) with AMI %s\n' "$AMI_ID" >&2
"${CMD[@]}"
