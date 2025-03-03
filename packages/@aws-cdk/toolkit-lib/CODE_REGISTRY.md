## Toolkit Code Registry

| Code | Description | Level | Data Interface |
|------|-------------|-------|----------------|
| CDK_TOOLKIT_I1000 | Provides synthesis times. | info | n/a |
| CDK_TOOLKIT_I1901 | Provides stack data | result | [StackData](https://docs.aws.amazon.com/cdk/api/toolkit-lib/interfaces/StackData.html) |
| CDK_TOOLKIT_I1902 | Successfully deployed stacks | result | [AssemblyData](https://docs.aws.amazon.com/cdk/api/toolkit-lib/interfaces/AssemblyData.html) |
| CDK_TOOLKIT_I2901 | Provides details on the selected stacks and their dependencies | result | n/a |
| CDK_TOOLKIT_E3900 | Resource import failed | error | n/a |
| CDK_TOOLKIT_I5000 | Provides deployment times | info | n/a |
| CDK_TOOLKIT_I5001 | Provides total time in deploy action, including synth and rollback | info | [Duration](https://docs.aws.amazon.com/cdk/api/toolkit-lib/interfaces/Duration.html) |
| CDK_TOOLKIT_I5002 | Provides time for resource migration | info | n/a |
| CDK_TOOLKIT_I5031 | Informs about any log groups that are traced as part of the deployment | info | n/a |
| CDK_TOOLKIT_I5050 | Confirm rollback during deployment | info | n/a |
| CDK_TOOLKIT_I5060 | Confirm deploy security sensitive changes | info | n/a |
| CDK_TOOLKIT_I5501 | Stack Monitoring: Start monitoring of a single stack | info | [StackMonitoringControlEvent](https://docs.aws.amazon.com/cdk/api/toolkit-lib/interfaces/StackMonitoringControlEvent.html) |
| CDK_TOOLKIT_I5502 | Stack Monitoring: Activity event for a single stack | info | [StackActivity](https://docs.aws.amazon.com/cdk/api/toolkit-lib/interfaces/StackActivity.html) |
| CDK_TOOLKIT_I5503 | Stack Monitoring: Finished monitoring of a single stack | info | [StackMonitoringControlEvent](https://docs.aws.amazon.com/cdk/api/toolkit-lib/interfaces/StackMonitoringControlEvent.html) |
| CDK_TOOLKIT_I5900 | Deployment results on success | result | [SuccessfulDeployStackResult](https://docs.aws.amazon.com/cdk/api/toolkit-lib/interfaces/SuccessfulDeployStackResult.html) |
| CDK_TOOLKIT_E5001 | No stacks found | error | n/a |
| CDK_TOOLKIT_E5500 | Stack Monitoring error | error | [ErrorPayload](https://docs.aws.amazon.com/cdk/api/toolkit-lib/interfaces/ErrorPayload.html) |
| CDK_TOOLKIT_I6000 | Provides rollback times | info | n/a |
| CDK_TOOLKIT_E6001 | No stacks found | error | n/a |
| CDK_TOOLKIT_E6900 | Rollback failed | error | n/a |
| CDK_TOOLKIT_I7000 | Provides destroy times | info | n/a |
| CDK_TOOLKIT_I7010 | Confirm destroy stacks | info | n/a |
| CDK_TOOLKIT_E7010 | Action was aborted due to negative confirmation of request | error | n/a |
| CDK_TOOLKIT_E7900 | Stack deletion failed | error | n/a |
| CDK_ASSEMBLY_I0042 | Writing updated context | debug | n/a |
| CDK_ASSEMBLY_I0241 | Fetching missing context | debug | n/a |
| CDK_ASSEMBLY_I1000 | Cloud assembly output starts | debug | n/a |
| CDK_ASSEMBLY_I1001 | Output lines emitted by the cloud assembly to stdout | info | n/a |
| CDK_ASSEMBLY_E1002 | Output lines emitted by the cloud assembly to stderr | error | n/a |
| CDK_ASSEMBLY_I1003 | Cloud assembly output finished | info | n/a |
| CDK_ASSEMBLY_E1111 | Incompatible CDK CLI version. Upgrade needed. | error | n/a |
