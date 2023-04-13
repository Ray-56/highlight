import boto3


def main():
    ecs = boto3.Session().client("ecs")
    ecs.update_service(cluster='highlight-production-cluster', service='opentelemetry-collector-service', loadBalancers=[
        {
            "targetGroupArn": "arn:aws:elasticloadbalancing:us-east-2:173971919437:targetgroup/opentelemetry-group-grpc/df4aad67f5efdd7a",
            "containerName": "highlight-collector",
            "containerPort": 4320
        },
        {
            "targetGroupArn": "arn:aws:elasticloadbalancing:us-east-2:173971919437:targetgroup/opentelemetry-group-http/ab4e710c0fdc140d",
            "containerName": "highlight-collector",
            "containerPort": 4321
        }
    ])


if __name__ == "__main__":
    main()
